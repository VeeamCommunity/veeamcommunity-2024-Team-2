// server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const { Command } = require('commander');

const app = express();
app.use(express.json());

// Initialize Commander for CLI arguments
const program = new Command();

program
  .option('-m, --mock', 'Run server in mock mode')
  .parse(process.argv);

const options = program.opts();
const isMockMode = options.mock || process.env.MOCK === 'true';

if (isMockMode) {
  console.log('Running in MOCK mode. Authentication and data fetching are mocked.');
} else {
  console.log('Running in REAL mode. Authentication and data fetching are active.');
}

// Disable SSL certificate validation (for development only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Endpoint to authenticate and fetch data
app.post('/fetch-data', async (req, res) => {
  if (isMockMode) {
    // Mock response
    const mockToken = 'mocked_bearer_token';
    
    // Read sample data from vms.json
    const vmsPath = path.join(__dirname, 'public', 'data', 'vms.json');
    let vmsData;
    try {
      const data = fs.readFileSync(vmsPath, 'utf-8');
      vmsData = JSON.parse(data);
    } catch (err) {
      console.error('Error reading mock VMs data:', err);
      return res.status(500).json({ error: 'Failed to load mock data' });
    }
    
    // Optionally, write to the file if needed
    // fs.writeFileSync(vmsPath, JSON.stringify(vmsData));

    // Respond with mock token
    return res.json({ success: true, token: mockToken });
  }

  // REAL mode: Actual authentication and data fetching
  const { serverUrl, username, password } = req.body;

  try {
    // Authenticate with VeeamONE API
    const tokenResponse = await fetch(`${serverUrl}/api/token`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password&refresh_token=`
    });

    if (!tokenResponse.ok) {
      throw new Error(`Authentication failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const bearerToken = tokenData.access_token;

    // Function to fetch data and save to a file
    async function fetchDataAndSave(endpoint, filename) {
      const response = await fetch(`${serverUrl}/api/v2.2${endpoint}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }
      const data = await response.json();
      fs.writeFileSync(path.join(__dirname, 'public', 'data', filename), JSON.stringify(data, null, 2));
    }

    // Ensure the data directory exists
    const dataDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Fetch data for each workload type
    await Promise.all([
      fetchDataAndSave('/protectedData/virtualMachines?Offset=0&Limit=1000', 'vms.json'),
      // Add more endpoints if needed
    ]);

    res.json({ success: true, token: bearerToken });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${isMockMode ? 'MOCK' : 'REAL'} mode on http://localhost:${PORT}`);
});

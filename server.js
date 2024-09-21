// server.js

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Disable SSL certificate validation (for development only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Endpoint to authenticate and fetch data
app.post('/fetch-data', async (req, res) => {
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
      fs.writeFileSync(path.join(__dirname, 'public', 'data', filename), JSON.stringify(data));
    }

    // Ensure the data directory exists
    const dataDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Fetch data for each workload type
    await Promise.all([
      fetchDataAndSave('/protectedData/virtualMachines?Offset=0&Limit=1000', 'vms.json'),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

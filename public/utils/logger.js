// utility/logger.js

export function sendLogToServer(level, message) {
    // Construct the server URL - ensure it's an absolute URL
    const serverUrl = 'http://localhost:3000/logs';

    // Validate URL pattern
    try {
        new URL(serverUrl); // This will throw an error if the URL is invalid
    } catch (err) {
        console.error('Invalid URL:', serverUrl, err);
        return; // Exit early if the URL is not valid
    }

    // Ensure the fetch API is available in the current environment
    if (typeof fetch !== 'function') {
        console.error('Fetch API is not available. Cannot send log to server.');
        return;
    }

    // Send log data to the server
    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            level: level,
            message: message,
            timestamp: new Date().toISOString()
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => console.log('Log successfully sent to server:', data))
    .catch(err => {
        // console.error('Failed to send log to server:', err);
        
    });
}

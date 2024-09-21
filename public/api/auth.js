// api/auth.js

let bearerToken = null;

export async function authenticate(serverUrl, username, password) {
    const response = await fetch('/fetch-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            serverUrl,
            username,
            password
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error('Failed to fetch data');
    }

    bearerToken = data.token; // Assuming the token is returned in the response
}

export function getBearerToken() {
    return bearerToken;
}
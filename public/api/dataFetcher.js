// api/dataFetcher.js
import { getBearerToken } from './auth.js';

export async function fetchData(endpoint) {
    const bearerToken = getBearerToken();
    if (!bearerToken) {
        throw new Error('No bearer token available. Please authenticate.');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
}
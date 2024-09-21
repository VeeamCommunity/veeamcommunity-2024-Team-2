// data/workloadFetchers.js
import { trimText } from '../utils/helpers.js';

async function fetchWorkloadData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load data from ${url}`);
    }
    const data = await response.json();
    console.log(`Fetched VM data:`, data);
    return data;
}

function processWorkloadData(data) {
    if (!data.items || data.items.length === 0) {
        console.log(`No VM items found`);
        return [];
    }
    
    console.log(`Processing ${data.items.length} VM items`);
    
    return data.items.map(item => ({
        name: trimText(item.name),
        fullName: item.name,
        latestRestorePoint: item.lastProtectedDate ? new Date(item.lastProtectedDate) : null,
        workloadType: 'VMs',
        isNull: false,
        value: null
    }));
}

export async function fetchVMs() {
    const data = await fetchWorkloadData('/data/vms.json');
    return processWorkloadData(data);
}
// utils/helpers.js

// Function to trim text and add '..' if it exceeds the maxLength
export function trimText(text, maxLength = 8) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 2) + '..';
}

// Function to initialize chips input for statuses
export function initializeChips(visualizer) {
    const statusChipsElem = document.getElementById('status-chips');

    if (statusChipsElem) {
        // Initialize the chips component from Materialize library
        M.Chips.init(statusChipsElem, {
            placeholder: 'Enter status',
            secondaryPlaceholder: '+Status',
            autocompleteOptions: {
                data: {
                    'Protected': null,
                    'Warning': null,
                    'Unprotected': null
                },
                limit: Infinity,
                minLength: 1
            },
            // Populate the chips with all statuses from the visualizer
            data: visualizer.allStatuses.map(status => ({ tag: status })),
            onChipAdd: () => {
                // On adding a chip, update the selected statuses in the visualizer
                const selectedStatuses = M.Chips.getInstance(statusChipsElem).chipsData.map(c => c.tag);
                visualizer.updateStatuses(selectedStatuses);
            },
            onChipDelete: () => {
                // On deleting a chip, update the selected statuses in the visualizer
                const selectedStatuses = M.Chips.getInstance(statusChipsElem).chipsData.map(c => c.tag);
                visualizer.updateStatuses(selectedStatuses);
            }
        });
    }
}

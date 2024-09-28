// utils/helpers.js
export function trimText(text, maxLength = 8) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 2) + '..';
}

export function initializeChips(visualizer) {
    const statusChipsElem = document.getElementById('status-chips');
    if (statusChipsElem) {
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
            data: visualizer.allStatuses.map(status => ({ tag: status })),
            onChipAdd: (e, chip) => {
                const selectedStatuses = M.Chips.getInstance(statusChipsElem).chipsData.map(c => c.tag);
                visualizer.updateStatuses(selectedStatuses);
            },
            onChipDelete: (e, chip) => {
                const selectedStatuses = M.Chips.getInstance(statusChipsElem).chipsData.map(c => c.tag);
                visualizer.updateStatuses(selectedStatuses);
            }
        });
    }
}
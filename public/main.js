// main.js
import { Visualizer } from './visualizer/Visualizer.js';
import { authenticate } from './api/auth.js';
import { initializeChips } from './utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
    const visualizationContainer = document.getElementById('visualization');
    const loginModalElem = document.getElementById('login-modal');
    const loginModalInstance = M.Modal.init(loginModalElem, { dismissible: false });
    const loginForm = document.getElementById('login-form');

    loginModalInstance.open();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
   
        const serverUrl = loginForm.querySelector('#server-url').value.trim();
        const username = loginForm.querySelector('#username').value.trim();
        const password = loginForm.querySelector('#password').value;

        try {
            await authenticate(serverUrl, username, password);
            loginModalInstance.close();

            if (visualizationContainer) {
                const visualizer = new Visualizer(visualizationContainer);
                
                const rpoFilter = document.getElementById('rpo-filter');
                if (rpoFilter) {
                    rpoFilter.addEventListener('change', (e) => {
                        const newRPO = parseInt(e.target.value);
                        if (!isNaN(newRPO)) {
                            visualizer.updateRPO(newRPO);
                        }
                    });
                }

                // Initialize status chips
                initializeChips(visualizer);

                // Render the VM chart
                await visualizer.render();
            } else {
                console.error('Visualization container not found');
            }
        } catch (error) {
            M.toast({ html: error.message, classes: 'red' });
            console.error('Authentication error:', error);
        }
    });
});

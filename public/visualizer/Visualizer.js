// visualizer/Visualizer.js
import { fetchVMs } from '../data/workloadFetchers.js';
import { getChartConfig } from './chartConfig.js';
import { sendLogToServer } from '../utils/logger.js';

export class Visualizer {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.rpo = 60; 
        this.workloadType = 'VMs';
        this.allWorkloads = {};
        this.columns = 12; // Expanded mode
        this.hexagonRatio = Math.sqrt(3) / 2;
        this.allStatuses = ['Protected', 'Warning', 'Unprotected'];
        this.selectedStatuses = [...this.allStatuses];
        this.currentContainerWidth = 0;
        this.currentContainerHeight = 0;
        this.previousContainerWidth = 0;
        this.maxRows = 5; // default value
    }
    
    // TODO: Implement observer pattern to handle window resize
    async render() {
        console.log('Rendering VM visualizer');
        this.container.innerHTML = '';

        const chartWrapper = document.createElement('div');
        chartWrapper.classList.add('chart-wrapper', 'expanded');
        chartWrapper.id = 'chart-wrapper-vms';

        const headerDiv = document.createElement('div');
        headerDiv.classList.add('chart-header');

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('chart-title');
        titleSpan.textContent = this.workloadType;

        headerDiv.appendChild(titleSpan);

        const chartContainer = document.createElement('div');
        chartContainer.id = 'chart-vms';
        chartContainer.classList.add('chart-container');

        chartWrapper.appendChild(headerDiv);
        chartWrapper.appendChild(chartContainer);

        this.container.appendChild(chartWrapper);

        // get current container width & height
        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;

        try {
            let data = await fetchVMs();
            console.log('VM Data:', data);

            if (data.length === 0) {
                console.log('No data for VMs, displaying NO DATA message');
                this.displayNoDataMessage(chartContainer);
            } else {
                console.log(`Creating chart for VMs with ${data.length} items`);

                const initialData = this.calculateProtectionStatus(data);
                const filteredData = this.filterByStatus(initialData);
                const positionedData = this.calculatePositions(filteredData);
                sendLogToServer('INFO', `Positioned data for VMs: ${JSON.stringify(positionedData)}`);
                console.log('Positioned data:', positionedData);
                this.chart = Highcharts.chart(
                    chartContainer.id,
                    getChartConfig(this.workloadType, positionedData, this.maxRows, this.columns, this.hexagonRatio)
                );
                console.log('VM Chart created');
            }
        } catch (error) {
            console.error('Error fetching VM data:', error);
            this.displayNoDataMessage(chartContainer);
        }
    }

    displayNoDataMessage(container) {
        container.innerHTML = '';
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('no-data-message');
        messageDiv.textContent = `NO DATA for ${this.workloadType}`;
        messageDiv.style.display = 'flex';
        messageDiv.style.justifyContent = 'center';
        messageDiv.style.alignItems = 'center';
        messageDiv.style.height = '200px';
        messageDiv.style.fontSize = '24px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.color = '#888';
        container.appendChild(messageDiv);
    }

    calculateProtectionStatus(workloads) {
        return workloads.map(workload => {
            if (!workload.latestRestorePoint) {
                return { ...workload, value: 0 }; // Unprotected
            }


            // We can set it to any value. E.G. 10 minutes like that:
            // const warningThreshold = this.rpo - 10; // 10 minutes before RPO
            // or 90% of RPO:
            // const warningThreshold = this.rpo * 0.9; // 90% of RPO
            const warningThreshold = this.rpo * 0.5; // 50% of RPO for demo purposes
            
            const minutesSinceRestore = (Date.now() - workload.latestRestorePoint.getTime()) / 60000;
    
            let value;
            if (minutesSinceRestore >= this.rpo) {
                value = 0; // Unprotected
            } else if (minutesSinceRestore > warningThreshold) {
                value = 0.5; // Warning
            } else {
                value = 1; // Protected
            }
    
            return {
                ...workload,
                value
            };
        });
    }
    


    filterByStatus(data) {
        return data.filter(item => {
            let status;
    
            // Determine the status based on the numeric value
            if (item.value === 1) {
                status = 'Protected';
            } else if (item.value === 0.5) {
                status = 'Warning';
            } else {
                status = 'Unprotected';
            }
    
            // Return items that match one of the selected statuses
            return this.selectedStatuses.includes(status);
        });
    }
    

    calculatePositions(data) {
        const totalItems = data.length;
        // we will ajust number of columns based on container width
        // TODO: Make desired width to constructor
        this.columns = Math.floor(this.containerWidth / 75); // 75px is the width of a hexagon cell
        const maxRows = Math.ceil(totalItems / this.columns); // if we have 60 items and 12 columns, we need 5 rows
        this.maxRows = maxRows;
        const totalPoints = maxRows * this.columns; // if we have 5 rows and 12 columns, we need 60 points
        // log the calculations
        sendLogToServer('INFO', `Total items: ${totalItems}, columns: ${this.columns}, maxRows: ${maxRows}, totalPoints: ${totalPoints}`);
        const positionedData = [];

        for (let i = 0; i < totalPoints; i++) {
            const x = i % this.columns;
            const y = Math.floor(i / this.columns);

            if (i < data.length) {
                positionedData.push({
                    ...data[i],
                    x: y,
                    y: x
                });
            } else {
                positionedData.push({
                    x: y,
                    y: x,
                    name: '',
                    fullName: '',
                    isNull: true,
                    value: null
                });
            }
        }

        return positionedData;
    }

    updateRPO(newRPO) {
        this.rpo = newRPO * 60; // convert to minutes
        this.render();
    }

    updateStatuses(selectedStatuses) {
        this.selectedStatuses = selectedStatuses;
        this.render();
    }
}
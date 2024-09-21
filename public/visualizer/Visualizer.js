// visualizer/Visualizer.js
import { fetchVMs } from '../data/workloadFetchers.js';
import { getChartConfig } from './chartConfig.js';

export class Visualizer {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.rpo = 60;
        this.workloadType = 'VMs';
        this.allWorkloads = {};
        this.columns = 12; // Expanded mode
        this.hexagonRatio = Math.sqrt(4) / 2;
        this.allStatuses = ['Protected', 'Unprotected'];
        this.selectedStatuses = [...this.allStatuses];
    }

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

        try {
            let data = await fetchVMs();
            console.log('VM Data:', data);

            if (data.length === 0) {
                console.log('No data for VMs, displaying NO DATA message');
                this.displayNoDataMessage(chartContainer);
            } else {
                console.log(`Creating chart for VMs with ${data.length} items`);
                const maxRows = Math.ceil(data.length / this.columns);

                const initialData = this.calculateProtectionStatus(data);
                const filteredData = this.filterByStatus(initialData);
                const positionedData = this.calculatePositions(filteredData, this.columns);

                this.chart = Highcharts.chart(
                    chartContainer.id,
                    getChartConfig(this.workloadType, positionedData, maxRows, this.columns, this.hexagonRatio)
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
                return { ...workload, value: 0 };
            }
            const minutesSinceRestore = (Date.now() - workload.latestRestorePoint.getTime()) / 60000;
            const isProtected = minutesSinceRestore <= this.rpo ? 1 : 0;
            return {
                ...workload,
                value: isProtected
            };
        });
    }

    filterByStatus(data) {
        return data.filter(item => {
            const status = item.value === 1 ? 'Protected' : 'Unprotected';
            return this.selectedStatuses.includes(status);
        });
    }

    calculatePositions(data, columns) {
        const totalItems = data.length;
        const maxRows = Math.ceil(totalItems / columns);
        const totalPoints = maxRows * columns;
        const positionedData = [];

        for (let i = 0; i < totalPoints; i++) {
            const x = i % columns;
            const y = Math.floor(i / columns);

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
        this.rpo = newRPO;
        this.render();
    }

    updateStatuses(selectedStatuses) {
        this.selectedStatuses = selectedStatuses;
        this.render();
    }
}
// visualizer/chartConfig.js
import { sendLogToServer } from '../utils/logger.js';

export function getChartConfig(title, data, maxRows, columns, hexagonRatio) {
    console.log(`Generating chart config for ${title} with ${data.length} items`);
    // log the arguments
    sendLogToServer('INFO', 'CHART CONFIG: Max rows: ' + maxRows + ', Columns: ' + columns + ', Hexagon ratio: ' + hexagonRatio);

    const rowsize = 1; // since ratio is calculated as Math.sqrt(3) / 2 it is 0.86602540378
    // so we need to calculate height based on number of rows + margins
    // we will hardcode if we have 1 row

    let chartHeight = (maxRows * rowsize * 75) + 100;
    if (maxRows === 1) {
        chartHeight = 75 + 100;
    }
    // log the calculations
    sendLogToServer('INFO', `CHART CONFIG: Chart height for ${title} is ${chartHeight}px`);
    return {
        chart: {
            type: 'tilemap',
            inverted: true,
            height: `${chartHeight}px`,
            marginTop: 50,
            marginBottom: 50
        },
        title: null,
        xAxis: { visible: false, min: 0, max: maxRows - 1 },
        yAxis: { visible: false, min: 0, max: columns - 1 },
        legend: { enabled: true },
        credits: { enabled: false },
        exporting: { enabled: false },
        colorAxis: {
            dataClasses: [
                { from: 0, to: 0, color: '#E8595A', name: 'Unprotected' }, // Unprotected: Red color
                { from: 0.5, to: 0.5, color: '#FFB74D', name: 'Warning' },  // Warning: Orange color
                { from: 1, to: 1, color: '#54B948', name: 'Protected' }     // Protected: Green color
            ],
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal'
            }
        },
        
        tooltip: {
            headerFormat: '',
            pointFormatter: function () {
                if (this.isNull) return false;
        
                const restoreTime = this.latestRestorePoint
                    ? new Date(this.latestRestorePoint).toLocaleString()
                    : 'N/A';
        
                // Determine the status based on the value
                let status;
                if (this.value === 1) {
                    status = 'Protected';
                } else if (this.value === 0.5) {
                    status = 'Warning';
                } else {
                    status = 'Unprotected';
                }
        
                // Return formatted tooltip content
                return `<b>${this.fullName}</b><br>Status: ${status}<br>Last Restore Point: ${restoreTime}`;
            }
        },
        
        
        plotOptions: {
            series: {
                tileShape: 'hexagon',
                pointPadding: 0,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    format: '{point.name}',
                    style: { textOutline: false, fontSize: '10px' },
                    crop: true,
                    overflow: 'none'
                }
            }
        },
        series: [{
            name: 'Workloads',
            data: data,
            keys: ['x', 'y', 'name', 'value', 'isNull', 'latestRestorePoint', 'fullName'],
            dataLabels: {
                formatter: function () {
                    return this.point.isNull ? '' : this.point.name;
                }
            },
            borderWidth: 1,
            borderColor: '#ffffff',
            states: { hover: { brightness: 0.1 } },
            turboThreshold: 0,
            colsize: 1,
            rowsize: rowsize,
            pointPadding: 0
        }]
    };
}
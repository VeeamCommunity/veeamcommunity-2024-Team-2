// test/chartConfig.test.js
import { expect } from 'chai';
import { getChartConfig } from '../public/visualizer/chartConfig.js'; 

describe('getChartConfig', () => {
  it('should generate chart config with correct title and data length', () => {
    const title = 'Sample Chart';
    const data = [
      { x: 0, y: 0, name: 'A', value: 1, isNull: false, latestRestorePoint: new Date(), fullName: 'Workload A' },
      { x: 1, y: 1, name: 'B', value: 0.5, isNull: false, latestRestorePoint: new Date(), fullName: 'Workload B' },
      { x: 2, y: 2, name: 'C', value: 0, isNull: false, latestRestorePoint: new Date(), fullName: 'Workload C' }
    ];
    const maxRows = 10;
    const columns = 5;
    const hexagonRatio = 1;

    const config = getChartConfig(title, data, maxRows, columns, hexagonRatio);

    expect(config.series[0].data).to.have.lengthOf(data.length);
    expect(config.chart.height).to.equal(`${(maxRows * 1 * 75) + 100}px`);
    expect(config.colorAxis.dataClasses).to.deep.include.members([
      { from: 0, to: 0, color: '#E8595A', name: 'Unprotected' },
      { from: 0.5, to: 0.5, color: '#FFB74D', name: 'Warning' },
      { from: 1, to: 1, color: '#54B948', name: 'Protected' }
    ]);
  });
});

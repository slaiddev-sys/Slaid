import * as React from 'react';
import ChartBlock from './ChartBlock';

/**
 * ChartBlock Examples
 * 
 * Demonstrates various chart types and configurations using the ChartBlock component.
 */
export default function ChartBlockExamples() {
  // Sample data for demonstrations
  const sampleLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const sampleSeries = [
    {
      id: 'revenue',
      data: [4000, 3000, 2000, 2780, 1890, 2390],
      color: '#3b82f6', // blue-500
    },
    {
      id: 'profit',
      data: [2400, 1398, 9800, 3908, 4800, 3800],
      color: '#ef4444', // red-500
    },
  ];

  const pieData = [
    {
      id: 'desktop',
      data: [65],
    },
    {
      id: 'mobile',
      data: [25],
    },
    {
      id: 'tablet',
      data: [10],
    },
  ];

  const pieLabels = ['Desktop', 'Mobile', 'Tablet'];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ChartBlock Examples</h1>
      
      {/* Line Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Line Chart</h2>
        <ChartBlock
          type="line"
          title="Monthly Revenue & Profit"
          labels={sampleLabels}
          series={sampleSeries}
          showLegend={true}
          showGrid={true}
          curved={true}
          animate={true}
          className="max-w-4xl"
        />
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Bar Chart</h2>
        <ChartBlock
          type="bar"
          title="Quarterly Performance"
          labels={['Q1', 'Q2', 'Q3', 'Q4']}
          series={[
            {
              id: 'sales',
              data: [12000, 19000, 15000, 22000],
              color: '#10b981', // emerald-500
            },
            {
              id: 'costs',
              data: [8000, 12000, 9000, 14000],
              color: '#f59e0b', // amber-500
            },
          ]}
          showLegend={true}
          showGrid={true}
          stacked={false}
          animate={true}
          className="max-w-4xl"
        />
      </div>

      {/* Area Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Area Chart</h2>
        <ChartBlock
          type="area"
          title="User Growth Over Time"
          labels={sampleLabels}
          series={[
            {
              id: 'users',
              data: [1000, 1200, 1500, 1800, 2200, 2800],
              color: '#8b5cf6', // violet-500
            },
          ]}
          showLegend={false}
          showGrid={true}
          curved={true}
          animate={true}
          className="max-w-4xl"
        />
      </div>

      {/* Pie Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Pie Chart</h2>
        <ChartBlock
          type="pie"
          title="Traffic Sources"
          labels={pieLabels}
          series={pieData}
          showLegend={true}
          animate={true}
          className="max-w-2xl h-80"
        />
      </div>

      {/* Stacked Bar Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Stacked Bar Chart</h2>
        <ChartBlock
          type="bar"
          title="Product Categories by Quarter"
          labels={['Q1', 'Q2', 'Q3', 'Q4']}
          series={[
            {
              id: 'electronics',
              data: [5000, 6000, 5500, 7000],
              color: '#06b6d4', // cyan-500
            },
            {
              id: 'clothing',
              data: [3000, 4000, 3500, 4500],
              color: '#f97316', // orange-500
            },
            {
              id: 'books',
              data: [2000, 2500, 2200, 2800],
              color: '#84cc16', // lime-500
            },
          ]}
          showLegend={true}
          showGrid={true}
          stacked={true}
          animate={true}
          className="max-w-4xl"
        />
      </div>

      {/* Minimal Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Minimal Chart (No Grid, No Legend)</h2>
        <ChartBlock
          type="line"
          labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
          series={[
            {
              id: 'visits',
              data: [120, 150, 180, 200],
              color: '#3b82f6',
            },
          ]}
          showLegend={false}
          showGrid={false}
          curved={true}
          animate={false}
          className="max-w-2xl h-48"
        />
      </div>
    </div>
  );
}

import React from 'react';
import Metrics_FullWidthChart from './Metrics_FullWidthChart';

/**
 * Example usage of Metrics_FullWidthChart layout
 */
export default function MetricsFullWidthChartExample() {
  return (
    <div className="space-y-8">
      {/* Basic Example */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '881px', height: '495px' }}>
        <Metrics_FullWidthChart
          title="Revenue Performance"
          description="Tracking our growth trajectory. Key financial metrics overview."
          chart={{
            type: 'area',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            series: [
              { id: 'Revenue', data: [6.5, 11.2, 9.8, 15.1, 18.2, 24.5], color: '#3b82f6' },
              { id: 'Profit', data: [3.2, 5.8, 4.9, 7.5, 9.1, 12.3], color: '#10b981' }
            ],
            showLegend: true,
            showGrid: true,
            animate: true,
            legendPosition: 'bottom',
            legendSize: 'medium',
            margin: { top: 20, right: 80, left: 0, bottom: 5 }
          }}
        />
      </div>

      {/* Center Aligned Example */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '881px', height: '495px' }}>
        <Metrics_FullWidthChart
          title="Customer Acquisition Metrics"
          description="Tracking customer growth and acquisition costs over time."
          layout={{
            showTitle: true,
            showDescription: true,
            titleAlignment: 'center'
          }}
          chart={{
            type: 'line',
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            series: [
              { id: 'New Customers', data: [1200, 1850, 2100, 2650], color: '#8b5cf6' },
              { id: 'Acquisition Cost', data: [45, 38, 32, 28], color: '#f59e0b' }
            ],
            showLegend: true,
            showGrid: true,
            animate: true,
            legendPosition: 'bottom',
            legendSize: 'medium'
          }}
        />
      </div>

      {/* Bar Chart Example */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '881px', height: '495px' }}>
        <Metrics_FullWidthChart
          title="Regional Sales Performance"
          description="Sales breakdown by region showing strong performance across all markets."
          chart={{
            type: 'bar',
            labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
            series: [
              { id: 'Q3 Sales', data: [45.2, 38.7, 29.1, 18.5], color: '#3b82f6' },
              { id: 'Q4 Sales', data: [52.1, 42.3, 34.8, 22.7], color: '#10b981' }
            ],
            showLegend: true,
            showGrid: true,
            animate: true,
            legendPosition: 'bottom',
            legendSize: 'medium'
          }}
        />
      </div>

      {/* Title Only Example */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '881px', height: '495px' }}>
        <Metrics_FullWidthChart
          title="Key Performance Indicators"
          layout={{
            showTitle: true,
            showDescription: false,
            titleAlignment: 'left'
          }}
          chart={{
            type: 'area',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            series: [
              { id: 'Conversion Rate', data: [2.3, 2.8, 3.1, 3.5], color: '#ef4444' },
              { id: 'Click Rate', data: [12.5, 14.2, 15.8, 17.1], color: '#3b82f6' }
            ],
            showLegend: true,
            showGrid: true,
            animate: true,
            legendPosition: 'bottom',
            legendSize: 'medium'
          }}
        />
      </div>
    </div>
  );
}

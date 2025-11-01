"use client";

import React, { useState } from 'react';
import ChartBlock from '../../components/blocks/ChartBlock';

// Excel-focused layout components designed for PowerPoint/Google Slides compatibility
const ExcelDataTable = ({ title = "Data Overview", data = [] }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Title - Standard slide title positioning */}
    <div className="mb-6">
      <h2 className="text-3xl font-semibold text-black text-center">{title}</h2>
    </div>
    
    {/* Table - PowerPoint compatible styling */}
    <div className="overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Metric</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Value</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Change</th>
          </tr>
        </thead>
        <tbody>
          {[
            { metric: "Total Revenue", value: "$648,000", change: "+18.2%" },
            { metric: "Average Monthly", value: "$54,000", change: "+12.5%" },
            { metric: "Peak Month", value: "$68,000", change: "December" },
            { metric: "Units Sold", value: "16,200", change: "+15.3%" },
            { metric: "Target Achievement", value: "94.2%", change: "-5.8%" }
          ].map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="border border-gray-300 px-4 py-2 font-medium">{row.metric}</td>
              <td className="border border-gray-300 px-4 py-2">{row.value}</td>
              <td className={`border border-gray-300 px-4 py-2 font-semibold ${
                row.change.startsWith('+') ? 'text-green-600' : 
                row.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
              }`}>{row.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ExcelKPIDashboard = ({ title = "Key Performance Indicators" }) => {
  // Small chart data for KPI cards
  const revenueChartData = {
    type: 'area' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [{ id: 'Revenue', data: [42, 48, 52, 58, 62, 68] }],
    showLegend: false,
    showGrid: false,
    stacked: false,
    curved: true,
    animate: true,
    showDots: false,
    className: 'w-full h-16'
  };

  const unitsChartData = {
    type: 'line' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [{ id: 'Units', data: [1200, 1350, 1180, 1450, 1520, 1620] }],
    showLegend: false,
    showGrid: false,
    curved: false,
    animate: true,
    showDots: false,
    className: 'w-full h-16'
  };

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-black text-center">{title}</h2>
      </div>
      
      {/* KPI Grid - 2x2 layout compatible with slides */}
      <div className="grid grid-cols-2 gap-6 h-4/5">
        {/* Revenue KPI with chart */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex flex-col">
          <div className="text-3xl font-bold text-blue-600 mb-1">$648K</div>
          <div className="text-gray-700 font-medium mb-2">Total Revenue</div>
          <div className="text-sm font-semibold text-green-600 mb-2">+18.2%</div>
          <div className="flex-1">
            <ChartBlock {...revenueChartData} />
          </div>
        </div>

        {/* Units Sold KPI with chart */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex flex-col">
          <div className="text-3xl font-bold text-green-600 mb-1">16.2K</div>
          <div className="text-gray-700 font-medium mb-2">Units Sold</div>
          <div className="text-sm font-semibold text-green-600 mb-2">+15.3%</div>
          <div className="flex-1">
            <ChartBlock {...unitsChartData} />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 flex flex-col justify-center items-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">$40</div>
          <div className="text-gray-700 font-medium mb-1">Avg Order Value</div>
          <div className="text-sm font-semibold text-green-600">+2.5%</div>
        </div>

        {/* Target Achievement */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex flex-col justify-center items-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">94.2%</div>
          <div className="text-gray-700 font-medium mb-1">Target Achievement</div>
          <div className="text-sm font-semibold text-red-600">-5.8%</div>
        </div>
      </div>
    </div>
  );
};

const ExcelTrendChart = ({ title = "Revenue Performance by Quarter" }) => {
  // Chart data for quarterly performance
  const chartData = {
    type: 'bar' as const,
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
    series: [
      { id: 'Performance', data: [52.2, 58.6, 43.8, 47.8] }
    ],
    showLegend: false,
    showGrid: true,
    stacked: false,
    animate: true,
    className: 'w-full h-full'
  };

  // Calculate growth from Q1 to Q4
  const firstValue = chartData.series[0].data[0] as number;
  const lastValue = chartData.series[0].data[chartData.series[0].data.length - 1] as number;
  const growthPercentage = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = growthPercentage > 0;
  const formattedGrowth = `${isPositive ? '+' : ''}${growthPercentage.toFixed(1)}%`;

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title */}
      <div className="mb-6 ml-6">
        <h2 className="text-2xl font-medium text-black">{title}</h2>
      </div>
      
      <div className="flex h-5/6">
        {/* Chart Section - Left 70% */}
        <div className="w-2/3 pr-6 -ml-4">
          <ChartBlock {...chartData} />
        </div>
        
        {/* Insights Panel - Right 30% */}
        <div className="w-1/3 pl-4 border-l border-gray-200">
          {/* Growth Metrics Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Overall Performance</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-medium text-black">{formattedGrowth}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path 
                    d={isPositive 
                      ? "M6 2L6 10M6 2L3 5M6 2L9 5" 
                      : "M6 10L6 2M6 10L3 7M6 10L9 7"
                    } 
                    stroke="white" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start">
              <span className="text-black text-xs mr-2 flex-shrink-0 mt-1">•</span>
              <p className="text-gray-800">
                <strong>Q2 shows strongest performance</strong> with 58.6% conversion rate, indicating optimal market conditions and effective strategies.
              </p>
            </div>
            
            <div className="flex items-start">
              <span className="text-black text-xs mr-2 flex-shrink-0 mt-1">•</span>
              <p className="text-gray-800">
                <strong>Q3 performance dip</strong> to 43.8% suggests seasonal challenges or market saturation requiring strategic adjustment.
              </p>
            </div>
            
            <div className="flex items-start">
              <span className="text-black text-xs mr-2 flex-shrink-0 mt-1">•</span>
              <p className="text-gray-800">
                <strong>Consistent variability</strong> across quarters shows execution matters more than timing, with Q2 achieving 34% higher performance than Q3.
              </p>
            </div>
            
            <div className="flex items-start">
              <span className="text-black text-xs mr-2 flex-shrink-0 mt-1">•</span>
              <p className="text-gray-800">
                <strong>Recovery trend</strong> in Q4 (47.8%) indicates successful strategic adjustments and potential for continued improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExcelComparisonLayout = ({ title = "Performance Comparison" }) => {
  // Comparison chart data
  const comparisonChartData = {
    type: 'bar' as const,
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { id: 'Actual', data: [156, 168, 162, 162] },
      { id: 'Target', data: [165, 170, 175, 180] }
    ],
    showLegend: true,
    showGrid: true,
    stacked: false,
    animate: true,
    className: 'w-full h-full'
  };

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-3xl font-semibold text-black text-center">{title}</h2>
      </div>
      
      <div className="flex h-5/6 gap-6">
        {/* Chart Section - Left 60% */}
        <div className="w-3/5">
          <ChartBlock {...comparisonChartData} />
        </div>
        
        {/* Data Tables - Right 40% */}
        <div className="w-2/5 grid grid-cols-1 gap-4">
          {/* Actual Performance */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-green-800 mb-2 text-center">Actual Performance</h3>
            <div className="space-y-1 text-xs">
              {[
                { metric: "Q1 Revenue", value: "$156K" },
                { metric: "Q2 Revenue", value: "$168K" },
                { metric: "Q3 Revenue", value: "$162K" },
                { metric: "Q4 Revenue", value: "$162K" },
                { metric: "Total", value: "$648K" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-700">{item.metric}</span>
                  <span className="font-semibold text-green-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Target Performance */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-blue-800 mb-2 text-center">Target Performance</h3>
            <div className="space-y-1 text-xs">
              {[
                { metric: "Q1 Target", value: "$165K" },
                { metric: "Q2 Target", value: "$170K" },
                { metric: "Q3 Target", value: "$175K" },
                { metric: "Q4 Target", value: "$180K" },
                { metric: "Total", value: "$690K" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-700">{item.metric}</span>
                  <span className="font-semibold text-blue-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExcelExecutiveSummary = ({ title = "Executive Summary" }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Title */}
    <div className="mb-6">
      <h2 className="text-3xl font-semibold text-black text-center">{title}</h2>
    </div>
    
    {/* Executive summary content - bullet points */}
    <div className="space-y-4 text-lg">
      <div className="flex items-start">
        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <p className="text-gray-800"><strong>Strong Performance:</strong> Achieved $648K total revenue with 94.2% target achievement rate</p>
      </div>
      
      <div className="flex items-start">
        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <p className="text-gray-800"><strong>Growth Trend:</strong> 18.2% overall growth with Q2 showing strongest performance (+7.7%)</p>
      </div>
      
      <div className="flex items-start">
        <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <p className="text-gray-800"><strong>Seasonal Patterns:</strong> December peak ($68K) and January low ($42K) indicate clear seasonality</p>
      </div>
      
      <div className="flex items-start">
        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <p className="text-gray-800"><strong>Opportunity:</strong> $42K revenue gap to targets represents 6.5% improvement potential</p>
      </div>
      
      <div className="flex items-start">
        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
        <p className="text-gray-800"><strong>Recommendation:</strong> Focus on Q3/Q4 optimization to capture seasonal upside</p>
      </div>
    </div>
  </div>
);

// Export buttons component
const ExportButtons = ({ layoutName }: { layoutName: string }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleGoogleSlidesExport = async () => {
    try {
      setIsExporting(true);
      
      // Prepare layout data based on the selected layout
      const layoutData = getLayoutData(layoutName);
      
      const response = await fetch('/api/export-google-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'authenticate',
          layoutName,
          layoutData
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.authUrl) {
        // Open Google OAuth in a new window
        window.open(data.authUrl, '_blank', 'width=500,height=600');
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export to Google Slides. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePowerPointExport = () => {
    // TODO: Implement PowerPoint export functionality
    alert(`Exporting "${layoutName}" to PowerPoint...`);
  };

  // Get layout-specific data
  const getLayoutData = (layoutName: string) => {
    switch (layoutName) {
      case 'Trend Chart':
        return {
          title: 'Revenue Performance by Quarter',
          chartData: {
            labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
            values: [52.2, 58.6, 43.8, 47.8]
          },
          insights: [
            'Q2 shows strongest performance with 58.6% conversion rate',
            'Q3 performance dip to 43.8% suggests seasonal challenges',
            'Consistent variability across quarters shows execution matters',
            'Recovery trend in Q4 indicates successful strategic adjustments'
          ]
        };
      case 'KPI Dashboard':
        return {
          title: 'Key Performance Indicators',
          kpis: [
            { title: 'Total Revenue', value: '$648K', change: '+18.2%' },
            { title: 'Units Sold', value: '16.2K', change: '+15.3%' },
            { title: 'Avg Order Value', value: '$40', change: '+2.5%' },
            { title: 'Target Achievement', value: '94.2%', change: '-5.8%' }
          ]
        };
      case 'Data Table':
        return {
          title: 'Data Overview',
          tableData: [
            { metric: 'Total Revenue', value: '$648,000', change: '+18.2%' },
            { metric: 'Average Monthly', value: '$54,000', change: '+12.5%' },
            { metric: 'Peak Month', value: '$68,000', change: 'December' },
            { metric: 'Units Sold', value: '16,200', change: '+15.3%' },
            { metric: 'Target Achievement', value: '94.2%', change: '-5.8%' }
          ]
        };
      case 'Comparison View':
        return {
          title: 'Performance Comparison',
          actual: [156, 168, 162, 162],
          target: [165, 170, 175, 180],
          quarters: ['Q1', 'Q2', 'Q3', 'Q4']
        };
      case 'Executive Summary':
        return {
          title: 'Executive Summary',
          points: [
            'Strong Performance: Achieved $648K total revenue with 94.2% target achievement rate',
            'Growth Trend: 18.2% overall growth with Q2 showing strongest performance',
            'Seasonal Patterns: December peak and January low indicate clear seasonality',
            'Opportunity: $42K revenue gap to targets represents 6.5% improvement potential',
            'Recommendation: Focus on Q3/Q4 optimization to capture seasonal upside'
          ]
        };
      default:
        return { title: layoutName };
    }
  };

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={handleGoogleSlidesExport}
        disabled={isExporting}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
          isExporting 
            ? 'bg-blue-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Authenticating...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
              <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" fill="currentColor"/>
            </svg>
            Export to Google Slides
          </>
        )}
      </button>
      
      <button
        onClick={handlePowerPointExport}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 8V16C21 17.1 20.1 18 19 18H5C3.9 18 3 17.1 3 16V8C3 6.9 3.9 6 5 6H19C20.1 6 21 6.9 21 8ZM19 8H5V16H19V8Z" fill="currentColor"/>
          <path d="M7 10H17V12H7V10ZM7 13H14V15H7V13Z" fill="currentColor"/>
        </svg>
        Export to PowerPoint
      </button>
    </div>
  );
};

export default function ExcelLayoutsPage() {
  const [selectedLayout, setSelectedLayout] = useState('table');

  const layouts = [
    { id: 'table', name: 'Data Table', component: ExcelDataTable },
    { id: 'kpi', name: 'KPI Dashboard', component: ExcelKPIDashboard },
    { id: 'trend', name: 'Trend Chart', component: ExcelTrendChart },
    { id: 'comparison', name: 'Comparison View', component: ExcelComparisonLayout },
    { id: 'summary', name: 'Executive Summary', component: ExcelExecutiveSummary }
  ];

  const SelectedComponent = layouts.find(l => l.id === selectedLayout)?.component || ExcelDataTable;
  const selectedLayoutName = layouts.find(l => l.id === selectedLayout)?.name || 'Data Table';

  return (
    <div className="min-h-screen bg-gray-100 p-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel Presentation Layouts</h1>
          <p className="text-gray-600">PowerPoint & Google Slides compatible layouts for Excel data visualization</p>
        </div>

        {/* Layout Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLayout === layout.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {layout.name}
              </button>
            ))}
          </div>
        </div>

        {/* Layout Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Preview: {selectedLayoutName}
            </h2>
            <p className="text-sm text-gray-500">16:9 aspect ratio • PowerPoint/Google Slides compatible</p>
          </div>
          
          {/* Export Buttons */}
          <ExportButtons layoutName={selectedLayoutName} />
          
          {/* Layout Container - Fixed 16:9 aspect ratio */}
          <div className="w-full max-w-4xl mx-auto">
            <SelectedComponent />
          </div>
        </div>

        {/* Layout Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Excel Optimized</h3>
            <p className="text-gray-600 text-sm">Designed specifically for Excel data visualization with tables, KPIs, and charts.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">📐 Standard Dimensions</h3>
            <p className="text-gray-600 text-sm">16:9 aspect ratio with safe zones for perfect PowerPoint/Google Slides export.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">🎨 Export Ready</h3>
            <p className="text-gray-600 text-sm">Simple, clean designs that maintain formatting when exported to presentation software.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import ChartBlock from '../../components/blocks/ChartBlock';

export default function ChartsPreviewPage() {
  // State for hover comparison - using useRef for immediate updates
  const hoverComparisonRef = React.useRef<{
    isVisible: boolean;
    percentage: string;
    isIncrease: boolean;
  } | null>(null);
  
  // Base sample data
  const baseLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseSeries = [
    { id: 'Revenue', data: [6.5, 11.2, 9.8, 15.1, 18.2, 24.5] },
    { id: 'GMV', data: [5.8, 10.5, 9.2, 13.8, 17.1, 21.8] }
  ];
  const singleSeries = [{ id: 'Performance', data: [85, 92, 78, 96, 88, 94] }];

  // Calculate initial comparison state from first to last bar
  const initialComparison = React.useMemo(() => {
    const firstValue = singleSeries[0].data[0] as number;
    const lastValue = singleSeries[0].data[singleSeries[0].data.length - 1] as number;
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    const isIncrease = percentChange > 0;
    const absChange = Math.abs(percentChange);
    
    return {
      isVisible: true,
      percentage: `${absChange.toFixed(1)}%`,
      isIncrease
    };
  }, [singleSeries]);

  const [hoverComparison, setHoverComparison] = React.useState<{
    isVisible: boolean;
    percentage: string;
    isIncrease: boolean;
  }>(initialComparison);

  // Calculate default percentage change from first to last bar
  const calculateDefaultComparison = React.useCallback(() => {
    const firstValue = singleSeries[0].data[0] as number;
    const lastValue = singleSeries[0].data[singleSeries[0].data.length - 1] as number;
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    const isIncrease = percentChange > 0;
    const absChange = Math.abs(percentChange);
    
    return {
      isVisible: true,
      percentage: `${absChange.toFixed(1)}%`,
      isIncrease
    };
  }, [singleSeries]);

  // Handle bar hover for comparison calculation with optimized performance
  const handleBarHover = React.useCallback((data: { index: number; value: number; isHovering: boolean }) => {
    if (!data.isHovering) {
      // Reset to default comparison (first to last bar)
      const defaultComparison = calculateDefaultComparison();
      hoverComparisonRef.current = defaultComparison;
      setHoverComparison(defaultComparison);
      return;
    }

    // Determine comparison value based on which bar is hovered
    const currentValue = data.value;
    const isLastBar = data.index === singleSeries[0].data.length - 1;
    
    let comparisonValue: number;
    if (isLastBar) {
      // For the last bar, compare with the previous bar
      comparisonValue = singleSeries[0].data[data.index - 1] as number;
    } else {
      // For all other bars, compare with the last bar
      comparisonValue = singleSeries[0].data[singleSeries[0].data.length - 1] as number;
    }
    
    // Calculate percentage difference
    const percentChange = ((currentValue - comparisonValue) / comparisonValue) * 100;
    const isIncrease = percentChange > 0;
    const absChange = Math.abs(percentChange);
    
    const newComparison = {
      isVisible: true,
      percentage: `${absChange.toFixed(1)}%`,
      isIncrease
    };
    
    // Check if the value actually changed to avoid unnecessary re-renders
    if (!hoverComparisonRef.current || 
        hoverComparisonRef.current.percentage !== newComparison.percentage ||
        hoverComparisonRef.current.isIncrease !== newComparison.isIncrease) {
      hoverComparisonRef.current = newComparison;
      setHoverComparison(newComparison);
    }
  }, [singleSeries, calculateDefaultComparison]);

  // Function to copy chart as image to clipboard
  const copyChartAsImage = React.useCallback(async (chartElement: HTMLElement, chartTitle: string) => {
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Find the chart container (the ChartBlock element)
      const chartContainer = chartElement.querySelector('.recharts-wrapper') || chartElement;
      
      if (!chartContainer) {
        throw new Error('Chart container not found');
      }

      // Create canvas from the chart
      const canvas = await html2canvas(chartContainer as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Copy to clipboard
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            
            // Show success feedback
            alert(`${chartTitle} copied to clipboard! You can now paste it into Google Slides.`);
          } catch (clipboardError) {
            console.error('Failed to copy to clipboard:', clipboardError);
            // Fallback: download the image
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chartTitle.replace(/\s+/g, '_')}.png`;
            link.click();
            URL.revokeObjectURL(url);
            alert(`${chartTitle} downloaded! You can upload it to Google Slides.`);
          }
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Failed to copy chart:', error);
      alert('Failed to copy chart. Please try again.');
    }
  }, []);

  // Helper function to render legend in title area
  const renderTitleLegend = (series: any[], chartTitle: string) => {
    // Color palette matching ChartBlock
    const colors = ['#4A3AFF', '#C893FD', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
    
    // Special colors for stacked bar charts
    const stackedColors = ['#962DFF', '#C893FD', '#E0C6FD', '#F0E5FC'];
    
    const isStacked = chartTitle.includes('Stacked');
    const colorsToUse = isStacked ? stackedColors : colors;
    
    return (
      <div className="flex flex-col gap-1">
        {series.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: colorsToUse[index % colorsToUse.length] }}
            ></div>
            <span className="text-sm font-normal text-gray-700">{item.id}</span>
          </div>
        ))}
      </div>
    );
  };

  // BAR CHART VARIATIONS (6 variations)
  const barCharts = [
    {
      title: 'Multi-Series Bar Chart',
      description: 'Standard bar chart with multiple series',
      data: {
        type: 'bar' as const,
        labels: baseLabels,
        series: baseSeries,
        showLegend: true,
        showGrid: true,
        stacked: false,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Single Series Bar Chart',
      description: 'Simple bar chart with one data series and comparison metric',
      data: {
        type: 'bar' as const,
        labels: baseLabels,
        series: singleSeries,
        showLegend: false,
        showGrid: true,
        stacked: false,
        animate: true,
        showComparison: true,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Stacked Bar Chart',
      description: 'Bar chart with stacked data series - 4 purple shades',
      data: {
        type: 'bar' as const,
        labels: baseLabels,
        series: [
          { id: 'Series A', data: [2.5, 4.2, 3.8, 5.1, 6.2, 8.5] },
          { id: 'Series B', data: [1.8, 3.5, 2.2, 4.8, 5.1, 6.8] },
          { id: 'Series C', data: [1.2, 2.5, 2.8, 3.2, 4.9, 5.2] },
          { id: 'Series D', data: [1.0, 1.0, 1.0, 2.0, 2.0, 4.0] }
        ],
        showLegend: true,
        showGrid: true,
        stacked: true,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    }
  ];

  // LINE CHART VARIATIONS (4 variations)
  const lineCharts = [
    {
      title: 'Multi-Series Line Chart',
      description: 'Angular lines with sharp points for trends',
      data: {
        type: 'line' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          { id: 'Revenue', data: [750, 780, 820, 850, 900, 920, 880, 950, 1000, 1100, 1150, 1200] },
          { id: 'Target', data: [800, 800, 850, 850, 900, 900, 950, 950, 1000, 1000, 1100, 1100] }
        ],
        showLegend: true,
        showGrid: true,
        curved: false,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Straight Line Chart',
      description: 'Angular lines with sharp points',
      data: {
        type: 'line' as const,
        labels: baseLabels,
        series: baseSeries,
        showLegend: true,
        showGrid: true,
        curved: false,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Single Line Chart',
      description: 'Simple single-series line chart with straight lines',
      data: {
        type: 'line' as const,
        labels: baseLabels,
        series: singleSeries,
        showLegend: false,
        showGrid: true,
        curved: false,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    }
  ];

  // DOTLESS LINE CHART VARIATIONS (4 variations - same as above but without dots)
  const dotlessLineCharts = [
    {
      title: 'Multi-Series Line Chart (No Dots)',
      description: 'Angular lines without dots for clean trends',
      data: {
        type: 'line' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          { id: 'Revenue', data: [750, 780, 820, 850, 900, 920, 880, 950, 1000, 1100, 1150, 1200] },
          { id: 'Target', data: [800, 800, 850, 850, 900, 900, 950, 950, 1000, 1000, 1100, 1100] }
        ],
        showLegend: true,
        showGrid: true,
        curved: false,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Straight Line Chart (No Dots)',
      description: 'Clean angular lines without data points',
      data: {
        type: 'line' as const,
        labels: baseLabels,
        series: baseSeries,
        showLegend: true,
        showGrid: true,
        curved: false,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Single Line Chart (No Dots)',
      description: 'Simple single-series line without dots',
      data: {
        type: 'line' as const,
        labels: baseLabels,
        series: singleSeries,
        showLegend: false,
        showGrid: true,
        curved: false,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    }
  ];

  // AREA CHART VARIATIONS (5 variations)
  const areaCharts = [
    {
      title: 'Stacked Area Chart',
      description: 'Cumulative area visualization',
      data: {
        type: 'area' as const,
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
          { id: 'Sales', data: [2500, 5200, 8100, 12000] },
          { id: 'Marketing', data: [1800, 3600, 5800, 8500] }
        ],
        showLegend: true,
        showGrid: true,
        stacked: true,
        curved: true,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Overlapping Area Chart',
      description: 'Non-stacked area chart',
      data: {
        type: 'area' as const,
        labels: baseLabels,
        series: baseSeries,
        showLegend: true,
        showGrid: true,
        stacked: false,
        curved: true,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Single Area Chart',
      description: 'Simple single-series area',
      data: {
        type: 'area' as const,
        labels: baseLabels,
        series: singleSeries.map(s => ({ ...s, color: '#4A3AFF' })),
        showLegend: false,
        showGrid: true,
        stacked: false,
        curved: true,
        animate: true,
        showComparison: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Single Area Chart (No Dots)',
      description: 'Clean single-series area without dots',
      data: {
        type: 'area' as const,
        labels: baseLabels,
        series: singleSeries.map(s => ({ ...s, color: '#4A3AFF' })),
        showLegend: false,
        showGrid: true,
        stacked: false,
        curved: false,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Multi-Series Area Chart (No Dots)',
      description: 'Multiple series area chart without dots',
      data: {
        type: 'area' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          { id: 'Revenue', data: [750, 780, 820, 850, 900, 920, 880, 950, 1000, 1100, 1150, 1200] },
          { id: 'Target', data: [800, 800, 850, 850, 900, 900, 950, 950, 1000, 1000, 1100, 1100] }
        ],
        showLegend: true,
        showGrid: true,
        stacked: false,
        curved: false,
        animate: true,
        showDots: false,
        className: 'w-full h-80 bg-white p-4'
      }
    }
  ];

  // PIE CHART VARIATIONS (2 variations)
  const pieCharts = [
    {
      title: 'Pie Chart with Legend',
      description: 'Standard pie chart with legend',
      data: {
        type: 'pie' as const,
        labels: ['Products', 'Services', 'Subscriptions'],
        series: [
          { id: 'Products', data: [65], color: '#4A3AFF' },
          { id: 'Services', data: [25], color: '#C893FD' },
          { id: 'Subscriptions', data: [10], color: '#1e40af' }
        ],
        showLegend: true,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    },
    {
      title: 'Minimal Pie Chart',
      description: 'Clean pie chart without legend',
      data: {
        type: 'pie' as const,
        labels: ['Products', 'Services', 'Subscriptions', 'Other'],
        series: [
          { id: 'Products', data: [45], color: '#4A3AFF' },
          { id: 'Services', data: [30], color: '#C893FD' },
          { id: 'Subscriptions', data: [15], color: '#1e40af' },
          { id: 'Other', data: [10], color: '#2563eb' }
        ],
        showLegend: false,
        animate: true,
        className: 'w-full h-80 bg-white p-4'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Charts Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            All <strong>16 chart variations</strong> available in the system. We have 5 core chart types with multiple configuration options each.
          </p>
          <div className="mt-4 flex justify-center flex-wrap gap-2 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">3 Bar Charts</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">3 Line Charts</span>
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full">3 Line Charts (No Dots)</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">5 Area Charts</span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">2 Pie Charts</span>
          </div>
        </div>

        {/* BAR CHARTS SECTION */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            📊 Bar Charts <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">3 variations</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {barCharts.map((chart, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                {/* Title and legend with precise alignment for ALL bar charts */}
                <div className="mb-4 pl-16 pr-12 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.title}</h3>
                    <p className="text-sm text-gray-600">{chart.description}</p>
                    {/* Show comparison metric for Single Series Bar Chart */}
                    {chart.data.showComparison && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xl font-bold text-black">{hoverComparison.percentage}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-150 ${
                          hoverComparison.isIncrease ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path 
                              d={hoverComparison.isIncrease 
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
                    )}
                  </div>
                  {/* Legend aligned with chart right edge */}
                  {chart.data.showLegend && chart.data.series.length > 1 && (
                    <div className="flex-shrink-0 -mr-4">
                      {renderTitleLegend(chart.data.series, chart.title)}
                    </div>
                  )}
                </div>
                <ChartBlock 
                  {...chart.data} 
                  showLegend={false} 
                  showComparison={false}
                  onBarHover={chart.data.showComparison ? handleBarHover : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* LINE CHARTS SECTION */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            📈 Line Charts <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">3 variations</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lineCharts.map((chart, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                {/* Title and legend with precise alignment */}
                <div className="mb-4 pl-16 pr-12 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.title}</h3>
                    <p className="text-sm text-gray-600">{chart.description}</p>
                  </div>
                  {/* Legend aligned with chart right edge */}
                  {chart.data.showLegend && chart.data.series.length > 1 && (
                    <div className="flex-shrink-0 -mr-4">
                      {renderTitleLegend(chart.data.series, chart.title)}
                    </div>
                  )}
                </div>
                <ChartBlock {...chart.data} showLegend={false} />
              </div>
            ))}
          </div>
        </div>

        {/* DOTLESS LINE CHARTS SECTION */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            📈 Line Charts (No Dots) <span className="ml-2 text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded">3 variations</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dotlessLineCharts.map((chart, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                {/* Title and legend with precise alignment */}
                <div className="mb-4 pl-16 pr-12 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.title}</h3>
                    <p className="text-sm text-gray-600">{chart.description}</p>
                  </div>
                  {/* Legend aligned with chart right edge */}
                  {chart.data.showLegend && chart.data.series.length > 1 && (
                    <div className="flex-shrink-0 -mr-4">
                      {renderTitleLegend(chart.data.series, chart.title)}
                    </div>
                  )}
                </div>
                <ChartBlock {...chart.data} showLegend={false} />
              </div>
            ))}
          </div>
        </div>

        {/* AREA CHARTS SECTION */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            🏔️ Area Charts <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">5 variations</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {areaCharts.map((chart, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6" ref={index === 0 ? (el) => { if (el) el.setAttribute('data-chart-container', 'true'); } : undefined}>
                {/* Title and legend with precise alignment */}
                <div className="mb-4 pl-16 pr-12 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.title}</h3>
                      <p className="text-sm text-gray-600">{chart.description}</p>
                    </div>
                    {/* Copy button for Stacked Area Chart only */}
                    {index === 0 && (
                      <button
                        onClick={() => {
                          const chartContainer = document.querySelector('[data-chart-container="true"]') as HTMLElement;
                          if (chartContainer) {
                            copyChartAsImage(chartContainer, chart.title);
                          }
                        }}
                        className="ml-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                        title="Copy chart as image to clipboard"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Chart
                      </button>
                    )}
                  </div>
                  {/* Legend aligned with chart right edge */}
                  {chart.data.showLegend && chart.data.series.length > 1 && (
                    <div className="flex-shrink-0 -mr-4">
                      {renderTitleLegend(chart.data.series, chart.title)}
                    </div>
                  )}
                </div>
                <ChartBlock 
                  {...chart.data} 
                  showLegend={false}
                  showComparison={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* PIE CHARTS SECTION */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            🥧 Pie Charts <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">2 variations</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pieCharts.map((chart, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                {/* Title and legend with precise alignment */}
                <div className="mb-4 pl-16 pr-12 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.title}</h3>
                    <p className="text-sm text-gray-600">{chart.description}</p>
                  </div>
                  {/* Legend aligned with chart right edge */}
                  {chart.data.showLegend && (
                    <div className="flex-shrink-0 -mr-4">
                      <div className="flex flex-col gap-1">
                        {chart.data.labels.map((label, labelIndex) => (
                          <div key={labelIndex} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: ['#4A3AFF', '#C893FD', '#1e40af', '#2563eb'][labelIndex % 4] }}
                            ></div>
                            <span className="text-sm font-normal text-gray-700">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <ChartBlock {...chart.data} showLegend={false} />
              </div>
            ))}
          </div>
        </div>



        {/* Design Notes */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🎨 Design Notes
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• <strong>Color Palette:</strong> Dark blues (navy to light blue) for professional appearance</li>
            <li>• <strong>Legend:</strong> Rounded corner rectangles, centered positioning</li>
            <li>• <strong>Grid:</strong> Subtle, minimal grid lines with reduced opacity</li>
            <li>• <strong>Spacing:</strong> Tight spacing between chart and legend (8px padding)</li>
            <li>• <strong>Typography:</strong> 14px font size, gray-700 color for legend text</li>
            <li>• <strong>No Shadows:</strong> Clean, flat design without borders or shadows</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/editor" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Editor
          </a>
        </div>

      </div>
    </div>
  );
}

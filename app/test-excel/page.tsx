"use client";

import React, { useState } from 'react';
import ChartBlock from '../../components/blocks/ChartBlock';

// Excel Layout Components - Copied from excel-layouts page
// These are the actual Excel-focused layout components

// Interfaces for Excel components
interface ExcelCenteredCoverProps {
  title?: string;
  description?: string;
  logoUrl?: string;
}

interface ExcelKPIDashboardProps {
  title?: string;
  kpiCards?: Array<{
    title: string;
    value: string | number;
    subtitle: string;
    trend: string;
    icon: string;
  }>;
}

interface ExcelDataTableProps {
  title?: string;
  data?: any[];
}

interface ExcelBackCoverProps {
  title?: string;
  description?: string;
}

interface ExcelTrendChartProps {
  title?: string;
  type?: 'line' | 'area' | 'bar';
  labels?: string[];
  series?: Array<{ id: string; data: number[] }>;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  animate?: boolean;
}

interface ExcelFullWidthChartProps {
  title?: string;
  type?: 'line' | 'area' | 'bar';
  labels?: string[];
  series?: Array<{ id: string; data: number[] }>;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  animate?: boolean;
}

// Excel Layout Components
const ExcelCenteredCover: React.FC<ExcelCenteredCoverProps> = ({ 
  title = "Our solution", 
  description = "Transforming ideas into results with strategy, craft, and measurable impact.",
  logoUrl = "/logo-placeholder.png"
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center p-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    <div className="text-center mb-1 -mt-16">
      <h1 className="text-5xl font-normal text-gray-900 leading-tight">{title}</h1>
    </div>
    <div className="text-center max-w-2xl">
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const ExcelKPIDashboard: React.FC<ExcelKPIDashboardProps> = ({ 
  title = "Key Performance Indicators", 
  kpiCards 
}) => {
  // Small chart data for KPI cards - exact copy from excel-layouts
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

  const conversionChartData = {
    type: 'bar' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [{ id: 'Conversion', data: [2.4, 3.1, 2.8, 3.5, 4.2, 3.9] }],
    showLegend: false,
    showGrid: false,
    stacked: false,
    animate: true,
    className: 'w-full h-16'
  };

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="kpi-dashboard">
      {/* Title Section */}
      <div className="mb-6 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md -ml-12">
          <p className="text-gray-600 text-xs">
            Comprehensive metrics and key performance indicators
          </p>
          <p className="text-gray-600 text-xs">
            showing quarterly growth trends and revenue optimization.
          </p>
        </div>
      </div>
      
      {/* KPI Grid - Dynamic content from Excel data */}
      <div className="flex h-4/5 gap-4 ml-4">
        {kpiCards ? (
          // Use dynamic KPI cards from Excel data
          kpiCards.slice(0, 3).map((kpi, index) => (
            <div key={index} className="flex-1 p-4 flex flex-col">
              <div className="text-2xl font-medium text-black">{kpi.value}</div>
              <div className="text-gray-700 font-medium">{kpi.title}</div>
              <div className="text-xs text-green-600 mb-2">{kpi.trend}</div>
              <div className="flex-1 -ml-14">
                <ChartBlock {...(index === 0 ? revenueChartData : index === 1 ? unitsChartData : conversionChartData)} />
              </div>
            </div>
          ))
        ) : (
          // Fallback to default hardcoded content
          <>
            <div className="flex-1 p-4 flex flex-col">
              <div className="text-2xl font-medium text-black">$648K</div>
              <div className="text-gray-700 font-medium">Total Revenue</div>
              <div className="text-xs text-green-600 mb-2">+18% growth this quarter</div>
              <div className="flex-1 -ml-14">
                <ChartBlock {...revenueChartData} />
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col">
              <div className="text-2xl font-medium text-black">16.2K</div>
              <div className="text-gray-700 font-medium">Units Sold</div>
              <div className="text-xs text-green-600 mb-2">+15% increase from last month</div>
              <div className="flex-1 -ml-14">
                <ChartBlock {...unitsChartData} />
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col">
              <div className="text-2xl font-medium text-black">3.2%</div>
              <div className="text-gray-700 font-medium">Conversion Rate</div>
              <div className="text-xs text-green-600 mb-2">+12% improvement trend</div>
              <div className="flex-1 -ml-14">
                <ChartBlock {...conversionChartData} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ExcelDataTable: React.FC<ExcelDataTableProps> = ({ title = "Performance Overview", data = [] }) => {
  // Generate dynamic insights for data table
  const generateTableInsights = () => {
    const tableData = data.length > 0 ? data : [
      { metric: "Total Revenue", value: "$648,000", change: "+18.2%" },
      { metric: "Average Monthly", value: "$54,000", change: "+12.5%" },
      { metric: "Peak Month", value: "$68,000", change: "December" },
      { metric: "Units Sold", value: "16,200", change: "+15.3%" },
      { metric: "Target Achievement", value: "94.2%", change: "-5.8%" }
    ];
    
    // Count positive and negative changes
    const positiveChanges = tableData.filter(row => 
      typeof row.change === 'string' && row.change.startsWith('+')
    ).length;
    
    const negativeChanges = tableData.filter(row => 
      typeof row.change === 'string' && row.change.startsWith('-')
    ).length;
    
    // Find highest value metric
    const highestMetric = tableData.reduce((highest, current) => {
      const currentValue = typeof current.value === 'string' ? 
        parseFloat(current.value.replace(/[^\d.-]/g, '')) : current.value;
      const highestValue = typeof highest.value === 'string' ? 
        parseFloat(highest.value.replace(/[^\d.-]/g, '')) : highest.value;
      return currentValue > highestValue ? current : highest;
    });
    
    return {
      totalMetrics: tableData.length,
      positiveChanges,
      negativeChanges,
      highestMetric: highestMetric.metric,
      highestValue: highestMetric.value,
      overallTrend: positiveChanges > negativeChanges ? 'positive' : 
                   negativeChanges > positiveChanges ? 'negative' : 'mixed'
    };
  };
  
  const insights = generateTableInsights();
  
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md -ml-16">
          <p className="text-gray-600 text-xs">
            Analysis of {insights.totalMetrics} key metrics with {insights.positiveChanges} positive and {insights.negativeChanges} negative indicators
          </p>
          <p className="text-gray-600 text-xs">
            Highest performing metric: {insights.highestMetric} ({insights.highestValue}). Overall trend: {insights.overallTrend}.
          </p>
        </div>
      </div>
    
    {/* Table - PowerPoint compatible styling */}
    <div className="overflow-hidden ml-6">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#fcfcfc' }} className="text-black">
            <th className="px-4 py-2 text-left" style={{ borderRight: '0.5px solid #f3f4f6', borderBottom: '0.5px solid #f3f4f6' }}>Metric</th>
            <th className="px-4 py-2 text-left" style={{ borderRight: '0.5px solid #f3f4f6', borderBottom: '0.5px solid #f3f4f6' }}>Value</th>
            <th className="px-4 py-2 text-left" style={{ borderBottom: '0.5px solid #f3f4f6' }}>Change</th>
          </tr>
        </thead>
        <tbody>
          {(data.length > 0 ? data : [
            { metric: "Total Revenue", value: "$648,000", change: "+18.2%" },
            { metric: "Average Monthly", value: "$54,000", change: "+12.5%" },
            { metric: "Peak Month", value: "$68,000", change: "December" },
            { metric: "Units Sold", value: "16,200", change: "+15.3%" },
            { metric: "Target Achievement", value: "94.2%", change: "-5.8%" }
          ]).map((row, idx) => (
            <tr key={idx} style={{ backgroundColor: '#fcfcfc' }}>
              <td className="px-4 py-2 text-black" style={{ borderRight: '0.5px solid #f3f4f6', ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.metric}</td>
              <td className="px-4 py-2 text-black" style={{ borderRight: '0.5px solid #f3f4f6', ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.value}</td>
              <td className={`px-4 py-2 ${
                row.change.startsWith('+') ? 'text-green-600' : 
                row.change.startsWith('-') ? 'text-red-600' : 'text-black'
              }`} style={{ ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const ExcelTrendChart: React.FC<ExcelTrendChartProps> = ({ 
  title = "Revenue Performance by Quarter",
  type = 'line',
  labels = ['Q1', 'Q2', 'Q3', 'Q4'],
  series = [{ id: 'Performance', data: [52.2, 58.6, 43.8, 47.8] }],
  showLegend = true,
  legendPosition = 'bottom',
  showGrid = true,
  animate = true
}) => {
  // Use dynamic chart data from props
  const chartData = {
    type: type,
    labels,
    series,
    showLegend,
    legendPosition: legendPosition,
    showGrid,
    stacked: false,
    animate,
    className: 'w-full h-full'
  };

  // Calculate growth and insights from actual data
  const firstValue = chartData.series[0].data[0] as number;
  const lastValue = chartData.series[0].data[chartData.series[0].data.length - 1] as number;
  const growthPercentage = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = growthPercentage > 0;
  const formattedGrowth = `${isPositive ? '+' : ''}${growthPercentage.toFixed(1)}%`;
  
  // Generate dynamic insights based on actual data
  const generateInsights = () => {
    const data = chartData.series[0].data as number[];
    const labels = chartData.labels;
    
    // Find highest and lowest performing periods
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const maxIndex = data.indexOf(maxValue);
    const minIndex = data.indexOf(minValue);
    
    // Calculate average
    const average = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    // Calculate volatility (standard deviation)
    const variance = data.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / data.length;
    const volatility = Math.sqrt(variance);
    
    return [
      {
        title: `${labels[maxIndex]} shows strongest performance`,
        description: `with $${maxValue.toLocaleString()} revenue, representing ${((maxValue / average - 1) * 100).toFixed(1)}% above average and indicating peak market conditions.`
      },
      {
        title: `${labels[minIndex]} shows lowest performance`,
        description: `at $${minValue.toLocaleString()}, which is ${((1 - minValue / average) * 100).toFixed(1)}% below average, suggesting seasonal challenges or market adjustments needed.`
      },
      {
        title: `Revenue volatility of ${(volatility / average * 100).toFixed(1)}%`,
        description: `indicates ${volatility > average * 0.3 ? 'high variability' : 'stable performance'} across periods, with a ${((maxValue / minValue - 1) * 100).toFixed(0)}% difference between peak and trough performance.`
      }
    ];
  };
  
  const insights = generateInsights();

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="trend-chart">
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
              <span className={`${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                <span className="mr-1">{isPositive ? '↑' : '↓'}</span>
              </span>
            </div>
          </div>

          {/* Dynamic Insights List */}
          <div className="space-y-3 text-xs">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start">
                <span className="text-black text-xs mr-2 flex-shrink-0 mt-1">•</span>
                <p className="text-gray-800">
                  <strong>{insight.title}</strong> {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExcelFullWidthChart: React.FC<ExcelFullWidthChartProps> = ({ 
  title = "Performance Overview",
  type = 'line',
  labels = ['Q1', 'Q2', 'Q3', 'Q4'],
  series = [{ id: 'Performance', data: [52.2, 58.6, 43.8, 47.8] }],
  showLegend = true,
  legendPosition = 'bottom',
  showGrid = true,
  animate = true
}) => {
  // Debug logging for ExcelFullWidthChart
  console.log('🔍 DEBUG ExcelFullWidthChart received props:');
  console.log('  - title:', title);
  console.log('  - type:', type);
  console.log('  - labels:', labels);
  console.log('  - series:', series);
  
  // Use dynamic chart data from props
  const chartData = {
    type: type,
    labels,
    series,
    showLegend,
    legendPosition: legendPosition,
    showGrid,
    stacked: false,
    animate,
    curved: type === 'area',
    showDots: true,
    className: 'w-full h-full'
  };
  
  console.log('🔍 DEBUG ExcelFullWidthChart chartData:', chartData);
  
  // Generate dynamic insights for full width chart
  const generateFullWidthInsights = () => {
    const data = chartData.series[0].data as number[];
    const labels = chartData.labels;
    
    // Calculate key metrics
    const total = data.reduce((sum, val) => sum + val, 0);
    const average = total / data.length;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const maxIndex = data.indexOf(maxValue);
    const minIndex = data.indexOf(minValue);
    
    // Calculate growth from first to last
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const overallGrowth = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      totalRevenue: total,
      averageRevenue: average,
      peakPeriod: labels[maxIndex],
      peakValue: maxValue,
      lowPeriod: labels[minIndex],
      lowValue: minValue,
      overallGrowth: overallGrowth,
      isGrowthPositive: overallGrowth > 0
    };
  };
  
  const insights = generateFullWidthInsights();

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="fullwidth-chart">
      {/* Title Section */}
      <div className="mb-6 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md -ml-12">
          {/* Dynamic Performance Metric */}
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-black mr-2">Overall performance</span>
            <span className={`${insights.isGrowthPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <span className="mr-1">{insights.isGrowthPositive ? '↑' : '↓'}</span>
              <span className="text-sm font-medium">{insights.overallGrowth > 0 ? '+' : ''}{insights.overallGrowth.toFixed(1)}%</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Total revenue of ${insights.totalRevenue.toLocaleString()} with peak performance in {insights.peakPeriod} (${insights.peakValue.toLocaleString()})
          </p>
          <p className="text-gray-600 text-xs">
            and lowest period in {insights.lowPeriod} (${insights.lowValue.toLocaleString()}), averaging ${insights.averageRevenue.toLocaleString()} per period.
          </p>
        </div>
      </div>
      
      {/* Full Width Chart */}
      <div className="h-4/5 w-full">
        <ChartBlock {...chartData} />
      </div>
    </div>
  );
};

const ExcelBackCover: React.FC<ExcelBackCoverProps> = ({ 
  title = "Thank You",
  description = "Questions & Discussion"
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col justify-center items-center text-center" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-5xl font-medium text-black mb-2">{title}</h1>
        <p className="text-base text-gray-600 max-w-2xl">{description}</p>
      </div>
      
      {/* Contact Information */}
      <div className="space-y-3 text-gray-700">
        <div className="flex items-center justify-center space-x-8">
          <span className="text-sm">contact@company.com</span>
          <span className="text-sm">+1 (555) 123-4567</span>
        </div>
        <div className="text-center">
          <span className="text-sm">123 Business Street, City, State 12345</span>
        </div>
        <div className="text-center">
          <span className="text-sm">www.company.com</span>
        </div>
      </div>
    </div>
  );
};

// MISSING CRITICAL LAYOUTS - Adding the most important ones for professional structure

// Section Dividers Layout
interface ExcelDividersProps {
  title?: string;
  sectionNumber?: string;
  content?: string;
}

const ExcelDividers: React.FC<ExcelDividersProps> = ({ 
  title = "Executive summary", 
  sectionNumber = "01",
  content = "Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap"
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex flex-col p-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Title at the top */}
    <div className="mb-auto">
      <h1 className="text-4xl font-normal text-gray-900 leading-tight">{title}</h1>
    </div>
    
    {/* Bottom section with number and content */}
    <div className="flex items-end justify-between">
      {/* Large section number - bottom left */}
      <div className="flex-shrink-0">
        <div className="text-6xl font-light text-gray-900 select-none leading-none">
          {sectionNumber}
        </div>
      </div>
      
      {/* Content text - bottom right, opposite side */}
      <div className="pb-4">
        <p className="text-sm text-gray-600 leading-relaxed max-w-xs text-left">{content}</p>
      </div>
    </div>
  </div>
);

// Index/Table of Contents Layout
const ExcelIndex: React.FC<{ title?: string; items?: Array<{ number: string; title: string; description: string }> }> = ({ 
  title = "Index",
  items = [
    { number: "01", title: "Executive Summary", description: "Key findings and overview" },
    { number: "02", title: "Data Analysis", description: "Detailed data insights" },
    { number: "03", title: "Key Metrics", description: "Performance indicators" },
    { number: "04", title: "Conclusions", description: "Summary and next steps" }
  ]
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    <div className="mb-6 ml-6">
      <h1 className="text-2xl font-medium text-black">{title}</h1>
    </div>
    
    <div className="px-6 grid grid-cols-2 gap-4">
      {items.slice(0, 8).map((item, idx) => (
        <div key={idx} className="flex items-start space-x-4 p-3">
          <div className="text-2xl font-light text-gray-400 min-w-[40px]">{item.number}</div>
          <div>
            <h3 className="text-lg font-medium text-black mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Experience Driven Layout (for context/interpretation)
interface ExcelExperienceDrivenProps {
  title?: string;
  insights?: string[];
  totalRevenue?: string;
  dataPoints?: number;
  peakMonth?: string;
}

const ExcelExperienceDriven: React.FC<ExcelExperienceDrivenProps> = ({ 
  title = "Performance Overview",
  insights = [
    "Our analysis reveals comprehensive data points spanning multiple revenue streams and operational metrics.",
    "Peak performance demonstrates strong market positioning with significant monthly revenue.",
    "The financial data shows consistent growth patterns with substantial total revenue.",
    "Data-driven insights provide actionable intelligence for strategic business decisions."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
      </div>

      <div className="flex h-full gap-8">
        
        {/* Left Side - Bullet Points */}
        <div className="w-1/2 flex flex-col ml-6">
          {/* Bullet Points with Arrow Icons */}
          <div className="flex-1">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insights[0] || "Our analysis reveals comprehensive data points spanning multiple revenue streams and operational metrics."}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comprehensive data analysis provides deep insights into business performance patterns.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insights[1] || "Peak performance demonstrates strong market positioning with significant monthly revenue."}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Strategic positioning analysis reveals competitive advantages and market opportunities.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insights[2] || "The financial data shows consistent growth patterns with substantial total revenue."}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Performance optimization strategies derived from data-driven intelligence and analytics.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insights[3] || "Data-driven insights provide actionable intelligence for strategic business decisions."}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Actionable recommendations enable informed decision-making and strategic business optimization.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Right Side - Image */}
        <div className="w-1/2 flex items-start justify-center -mt-12">
          <div className="w-full h-5/6 bg-gray-100 rounded-lg flex items-center justify-center">
            {/* Image Placeholder */}
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <p className="text-xs text-gray-400 mt-1">Replace with actual image</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Limitations Layout (for interpretation)
interface ExcelLimitationsProps {
  title?: string;
  limitations?: string[];
}

const ExcelLimitations: React.FC<ExcelLimitationsProps> = ({ 
  title = "Performance Overview",
  limitations = [
    "Analysis based on available data points from Excel file.",
    "Revenue projections assume consistent market conditions and business operations.",
    "Historical data patterns may not predict future performance in changing market conditions."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
      </div>

      {/* Main Content */}
      <div className="mb-8 ml-6">
        
        {/* Two Column Layout for Bullet Points */}
        <div className="flex gap-12">
          {/* Left Column */}
          <div className="flex-1 relative">
            {/* Continuous vertical line for left column */}
            <div className="absolute left-2 top-1 w-px h-64 bg-gray-400 z-0"></div>
            <ul className="space-y-6 text-base text-gray-700 relative z-10">
              {limitations.slice(0, 3).map((limitation, index) => (
                <li key={index} className="flex items-start relative">
                  <div className="absolute left-1.5 top-1 z-20 bg-white">
                    <span className="text-black text-2xl">•</span>
                  </div>
                  <div className="ml-6">
                    <span className="block">{limitation}</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {index === 0 && "Consider data completeness and temporal coverage when interpreting results."}
                      {index === 1 && "External factors may influence actual performance beyond historical patterns."}
                      {index === 2 && "Regular data updates recommended for maintaining analysis accuracy."}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right Column */}
          <div className="flex-1 relative">
            {/* Continuous vertical line for right column */}
            <div className="absolute left-2 top-1 w-px h-64 bg-gray-400 z-0"></div>
            <ul className="space-y-6 text-base text-gray-700 relative z-10">
              {limitations.slice(3, 6).map((limitation, index) => (
                <li key={index + 3} className="flex items-start relative">
                  <div className="absolute left-1.5 top-1 z-20 bg-white">
                    <span className="text-black text-2xl">•</span>
                  </div>
                  <div className="ml-6">
                    <span className="block">{limitation}</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {index === 0 && "Data quality and completeness directly impact analysis reliability and conclusions."}
                      {index === 1 && "Market volatility and external factors may affect predictive accuracy."}
                      {index === 2 && "Cross-validation with additional data sources recommended for verification."}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Milestone Achievement Layout (for KPI highlights)
const ExcelMilestone: React.FC<{ 
  title?: string;
  value?: string | number;
  growth?: string;
  description?: string;
}> = ({ 
  title = "Performance Overview",
  value = "500+",
  growth = "32.85% vs last year",
  description = "New customers acquired through our strategic initiatives and enhanced service offerings."
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12 flex flex-col" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Content Area - Milestone Left Aligned */}
      <div className="flex-1 flex flex-col justify-center ml-6">
        {/* Milestone Label */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 text-left">Milestone</p>
        </div>
        
        {/* Main Milestone Content */}
        <div className="text-left mb-4">
          <div className="text-9xl font-light text-gray-900 leading-none mb-2">
            {value}
          </div>
          <div className="text-lg text-green-600 flex items-center">
            <span className="mr-2">↑</span>
            <span>{growth}</span>
          </div>
        </div>
        
        {/* Description Texts - Side by Side */}
        <div className="flex gap-8">
          <div className="max-w-xs text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="max-w-xs text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              Our comprehensive approach to client acquisition and retention has resulted in sustained revenue growth and market expansion. The implementation of advanced analytics and customer feedback systems has optimized our service delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bottom Cover Layout - Title and description at bottom
interface ExcelBottomCoverProps {
  title?: string;
  description?: string;
}

const ExcelBottomCover: React.FC<ExcelBottomCoverProps> = ({ 
  title = "Our solution", 
  description = "Transforming ideas into results with strategy, craft, and measurable impact."
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex flex-col justify-end p-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Bottom section with title left and description right */}
    <div className="flex items-end gap-8 mb-1">
      {/* Title - Left side, large */}
      <div className="flex-1">
        <h1 className="text-5xl font-normal text-gray-900 leading-tight text-left">{title}</h1>
      </div>
      
      {/* Description - Right side, smaller */}
      <div className="flex-1">
        <p className="text-sm text-gray-600 leading-relaxed text-left">{description}</p>
      </div>
    </div>
  </div>
);

// Left Cover Layout - Title and description aligned to left side, vertically centered
interface ExcelLeftCoverProps {
  title?: string;
  description?: string;
}

const ExcelLeftCover: React.FC<ExcelLeftCoverProps> = ({ 
  title = "Our solution", 
  description = "Transforming ideas into results with strategy, craft, and measurable impact."
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex items-center p-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Left-aligned content section */}
    <div className="max-w-sm">
      {/* Title - Large, left-aligned */}
      <div className="mb-2">
        <h1 className="text-5xl font-normal text-gray-900 leading-tight text-left">{title}</h1>
      </div>
      
      {/* Description - Smaller, left-aligned, constrained for two lines */}
      <div>
        <p className="text-sm text-gray-600 leading-normal text-left">{description}</p>
      </div>
    </div>
  </div>
);

// Back Cover Left Aligned Layout
const ExcelBackCoverLeft: React.FC<ExcelBackCoverProps> = ({ 
  title = "Thank You",
  description = "Questions & Discussion"
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12 flex flex-col justify-center" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* Main Title */}
      <div className="mb-8 ml-6">
        <h1 className="text-5xl font-medium text-black mb-2">{title}</h1>
        <p className="text-base text-gray-600 max-w-2xl">{description}</p>
      </div>
      
      {/* Contact Information */}
      <div className="space-y-3 text-gray-700 ml-6">
        <div className="flex items-start space-x-8">
          <span className="text-sm">contact@company.com</span>
          <span className="text-sm">+1 (555) 123-4567</span>
        </div>
        <div>
          <span className="text-sm">123 Business Street, City, State 12345</span>
        </div>
        <div>
          <span className="text-sm">www.company.com</span>
        </div>
      </div>
    </div>
  );
};

// Table of Contents Layout - Two-column layout with page numbers and titles
interface ExcelTableOfContentsProps {
  title?: string;
  items?: Array<{
    page: string;
    title: string;
  }>;
}

const ExcelTableOfContents: React.FC<ExcelTableOfContentsProps> = ({ 
  title = "Table of Contents",
  items = [
    { page: "1", title: "Executive Summary" },
    { page: "2", title: "Founders Letter" },
    { page: "3", title: "Methodology" },
    { page: "4", title: "Conversion" },
    { page: "5", title: "Monetization" },
    { page: "6", title: "Revenue" },
    { page: "7", title: "Retention & Reactivation" },
    { page: "8", title: "Acquisition" },
    { page: "9", title: "Comparing Google Play & the App Store" },
    { page: "10", title: "Comparing Native & Crossplatform Development" },
    { page: "11", title: "Web Billing for Subscription Apps" },
    { page: "12", title: "Breaking Out AI Apps" }
  ]
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-8 flex" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Left side - Title only */}
    <div className="w-1/3 pr-8">
      <h1 className="text-4xl font-normal text-gray-900 leading-tight text-left">{title}</h1>
    </div>
    
    {/* Right side - All items */}
    <div className="w-2/3 space-y-1">
      {items.map((item, index) => (
        <div key={index}>
          {/* Item row */}
          <div className="flex items-start pt-1 pb-2">
            {/* Page number - black color */}
            <div className="flex-shrink-0 w-12">
              <span className="text-base font-medium text-gray-900">{item.page}</span>
            </div>
            
            {/* Title - takes remaining space */}
            <div className="flex-1 ml-8">
              <h3 className="text-sm font-normal text-gray-900 leading-tight text-left">{item.title}</h3>
            </div>
          </div>
          
          {/* Divider line (except after last item) */}
          {index < items.length - 1 && (
            <div className="border-b border-gray-200"></div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Experience Driven with Description Layout
interface ExcelExperienceDrivenDescriptionProps {
  title?: string;
  description?: string;
  insights?: string[];
  totalRevenue?: string;
  dataPoints?: number;
}

const ExcelExperienceDrivenDescription: React.FC<ExcelExperienceDrivenDescriptionProps> = ({ 
  title = "Strategic Business Insights",
  description = "Comprehensive analysis reveals key performance indicators and strategic opportunities derived from data-driven intelligence and business analytics.",
  insights = [
    "Data analysis reveals comprehensive insights spanning multiple revenue streams.",
    "Performance metrics demonstrate strong market positioning and growth potential.",
    "Strategic intelligence provides actionable recommendations for business optimization."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
      </div>

      <div className="flex h-full gap-8">
        
        {/* Left Side - Description Paragraph */}
        <div className="w-1/2 flex flex-col ml-6">
          {/* Full Description Text */}
          <div className="flex-1">
            <p className="text-xs text-gray-700 leading-relaxed">
{description}
            </p>
            <br />
            <p className="text-xs text-gray-700 leading-relaxed">
{insights.join(' ')} These data-driven insights enable strategic decision-making and performance optimization across all business operations and revenue streams.
            </p>
          </div>
        </div>
        
        {/* Right Side - Image */}
        <div className="w-1/2 flex items-start justify-center -mt-12">
          <div className="w-full h-5/6 bg-gray-100 rounded-lg flex items-center justify-center">
            {/* Image Placeholder */}
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <p className="text-xs text-gray-400 mt-1">Replace with actual image</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Experience Driven Two Rows Layout
interface ExcelExperienceDrivenTwoRowsProps {
  title?: string;
  description?: string;
  insights?: string[];
  totalRevenue?: string;
  dataPoints?: number;
}

const ExcelExperienceDrivenTwoRows: React.FC<ExcelExperienceDrivenTwoRowsProps> = ({ 
  title = "Strategic Business Performance",
  description = "Comprehensive analysis reveals key performance indicators and strategic opportunities derived from data-driven intelligence.",
  insights = [
    "Data analysis reveals comprehensive insights spanning multiple revenue streams and operational metrics.",
    "Performance metrics demonstrate strong market positioning with consistent growth patterns and optimization opportunities.",
    "Strategic intelligence provides actionable recommendations for business development and competitive advantage.",
    "Advanced analytics enable informed decision-making across all operational and strategic business functions."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black mb-2">{title}</h1>
        <div className="text-left max-w-lg">
          <p className="text-gray-600 text-xs">
            {description}
          </p>
        </div>
      </div>

      <div className="flex h-full">
        
        {/* Full Width - Bullet Points in Two Rows */}
        <div className="w-full flex flex-col ml-6">
          {/* Bullet Points arranged in 2x2 grid */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Dynamic First Row - Items 1 and 2 */}
            <div className="flex gap-6 mb-8">
              {insights.slice(0, 2).map((insight, index) => (
                <div key={index} className="w-1/2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.split('.')[0]}.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {insight.split('.').slice(1).join('.').trim() || 'Advanced analytical capabilities provide comprehensive business intelligence and strategic insights.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Dynamic Second Row - Items 3 and 4 */}
            <div className="flex gap-6">
              {insights.slice(2, 4).map((insight, index) => (
                <div key={index + 2} className="w-1/2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.split('.')[0]}.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {insight.split('.').slice(1).join('.').trim() || 'Data-driven methodologies ensure accurate analysis and actionable business recommendations.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Experience Full Text Layout (No Image)
interface ExcelExperienceFullTextProps {
  title?: string;
  description?: string;
  insights?: string[];
  totalRevenue?: string;
  dataPoints?: number;
}

const ExcelExperienceFullText: React.FC<ExcelExperienceFullTextProps> = ({ 
  title = "Comprehensive Business Analysis",
  description = "Our comprehensive analysis reveals strategic insights and performance indicators derived from extensive data analysis and business intelligence.",
  insights = [
    "Data analysis reveals comprehensive insights spanning multiple revenue streams.",
    "Performance metrics demonstrate strong market positioning and growth potential.", 
    "Strategic intelligence provides actionable recommendations for business optimization.",
    "Advanced analytics enable informed decision-making and strategic planning."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
      </div>

      <div className="flex h-full gap-8">
        
        {/* Left Side - Dynamic Description Paragraph */}
        <div className="w-1/2 flex flex-col ml-6">
          {/* Dynamic Description Text */}
          <div className="flex-1">
            <p className="text-xs text-gray-700 leading-relaxed">
              {description}
            </p>
            <br />
            <p className="text-xs text-gray-700 leading-relaxed">
              {insights.slice(0, 2).join(' ')} These comprehensive insights provide the foundation for strategic decision-making and operational excellence.
            </p>
          </div>
        </div>
        
        {/* Right Side - Dynamic Additional Description Paragraph */}
        <div className="w-1/2 flex flex-col ml-6">
          {/* Dynamic Additional Description Text */}
          <div className="flex-1">
            <p className="text-xs text-gray-700 leading-relaxed">
              {insights.slice(2).join(' ')} Our data-driven approach ensures accurate analysis and actionable recommendations for business growth and optimization.
            </p>
            <br />
            <p className="text-xs text-gray-700 leading-relaxed">
              Through comprehensive Excel data analysis and advanced business intelligence, we deliver insights that enable organizations to achieve measurable results and sustainable competitive advantages in their respective markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Full Width Chart with Table Layout
interface ExcelFullWidthChartWithTableProps {
  title?: string;
  type?: 'line' | 'area' | 'bar';
  labels?: string[];
  series?: Array<{ id: string; data: number[] }>;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  animate?: boolean;
  tableData?: Array<{ metric: string; value: string | number }>;
}

const ExcelFullWidthChartWithTable: React.FC<ExcelFullWidthChartWithTableProps> = ({ 
  title = "Performance Overview",
  type = 'area',
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  series = [
    { id: 'Revenue', data: [6500, 8200, 9500, 11200, 15800, 25000] },
    { id: 'GMV', data: [4200, 5800, 6800, 8500, 12200, 19500] }
  ],
  showLegend = true,
  legendPosition = 'bottom',
  showGrid = true,
  animate = true,
  tableData = []
}) => {
  // Use dynamic chart data from props
  const chartData = {
    type: type,
    labels,
    series,
    showLegend,
    legendPosition: legendPosition,
    showGrid,
    stacked: false,
    animate,
    curved: type === 'area',
    showDots: true,
    className: 'w-full h-full'
  };

  // Use dynamic table data or fallback to default
  const defaultTableData = [
    { metric: 'Jan Revenue', value: 6500 },
    { metric: 'Feb Revenue', value: 8200 },
    { metric: 'Mar Revenue', value: 9500 },
    { metric: 'Apr Revenue', value: 11200 },
    { metric: 'May Revenue', value: 15800 }
  ];
  
  const displayTableData = tableData.length > 0 ? tableData : defaultTableData;
  
  // Generate dynamic insights for chart with table
  const generateChartTableInsights = () => {
    const data = chartData.series[0].data as number[];
    const labels = chartData.labels;
    
    // Calculate key metrics
    const total = data.reduce((sum, val) => sum + val, 0);
    const average = total / data.length;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const maxIndex = data.indexOf(maxValue);
    
    // Calculate growth trend
    const firstHalf = data.slice(0, Math.ceil(data.length / 2));
    const secondHalf = data.slice(Math.ceil(data.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trendGrowth = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    return {
      totalRevenue: total,
      averageRevenue: average,
      peakPeriod: labels[maxIndex],
      peakValue: maxValue,
      trendGrowth: trendGrowth,
      isTrendPositive: trendGrowth > 0,
      dataPoints: displayTableData.length
    };
  };
  
  const insights = generateChartTableInsights();

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="fullwidth-chart-table">
      {/* Title Section */}
      <div className="mb-2 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md -ml-12">
          {/* Dynamic Performance Metric */}
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-black mr-2">Overall performance</span>
            <span className={`${insights.isTrendPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <span className="mr-1">{insights.isTrendPositive ? '↑' : '↓'}</span>
              <span className="text-sm font-medium">{insights.trendGrowth > 0 ? '+' : ''}{insights.trendGrowth.toFixed(1)}%</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Combined chart and table analysis showing ${insights.totalRevenue.toLocaleString()} total revenue across {insights.dataPoints} data points
          </p>
          <p className="text-gray-600 text-xs">
            with peak performance in {insights.peakPeriod} (${insights.peakValue.toLocaleString()}) and ${insights.averageRevenue.toLocaleString()} average per period.
          </p>
        </div>
      </div>
      
      {/* Chart - Increased height */}
      <div className="h-3/5 w-full mb-4">
        <ChartBlock {...chartData} />
      </div>

      {/* Data Table - Months as columns, metrics as rows */}
      <div className="ml-6">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th 
                className="text-black text-left p-2"
                style={{ 
                  backgroundColor: '#fcfcfc',
                  borderRight: '0.5px solid #f3f4f6',
                  borderBottom: '0.5px solid #f3f4f6'
                }}
              >
                Metric
              </th>
              <th 
                className="text-black text-center p-2"
                style={{ 
                  backgroundColor: '#fcfcfc',
                  borderBottom: '0.5px solid #f3f4f6'
                }}
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {displayTableData.map((row, idx) => (
              <tr key={idx}>
                <td 
                  className="text-black p-2"
                  style={{ 
                    backgroundColor: '#fcfcfc',
                    borderRight: '0.5px solid #f3f4f6',
                    ...(idx < displayTableData.length - 1 && { borderBottom: '0.5px solid #f3f4f6' })
                  }}
                >
                  {row.metric}
                </td>
                <td 
                  className="text-black text-center p-2"
                  style={{ 
                    backgroundColor: '#fcfcfc',
                    ...(idx < displayTableData.length - 1 && { borderBottom: '0.5px solid #f3f4f6' })
                  }}
                >
                  {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Comparison Layout
interface ExcelComparisonLayoutProps {
  title?: string;
  type?: 'line' | 'area' | 'bar';
  labels?: string[];
  series?: Array<{ id: string; data: number[] }>;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  animate?: boolean;
  stacked?: boolean;
}

const ExcelComparisonLayout: React.FC<ExcelComparisonLayoutProps> = ({ 
  title = "Performance Comparison",
  type = 'bar',
  labels = ['Q1', 'Q2', 'Q3', 'Q4'],
  series = [
    { id: 'Actual', data: [156000, 168000, 162000, 162000] },
    { id: 'Target', data: [165000, 170000, 175000, 180000] }
  ],
  showLegend = true,
  legendPosition = 'bottom',
  showGrid = true,
  animate = true,
  stacked = false
}) => {
  // Use dynamic comparison chart data from props
  const comparisonChartData = {
    type: type,
    labels,
    series,
    showLegend,
    legendPosition: legendPosition,
    legendSize: 'small' as const,
    showGrid,
    stacked,
    animate,
    className: 'w-full h-full'
  };
  
  // Generate dynamic insights for comparison chart
  const generateComparisonInsights = () => {
    const actualData = series.find(s => s.id.toLowerCase().includes('actual'))?.data || series[0]?.data || [];
    const targetData = series.find(s => s.id.toLowerCase().includes('target'))?.data || series[1]?.data || [];
    
    if (actualData.length === 0 || targetData.length === 0) {
      return { performanceGap: 0, isOverPerforming: false, bestPeriod: labels[0] || 'Q1', worstPeriod: labels[0] || 'Q1' };
    }
    
    // Calculate overall performance vs target
    const actualTotal = actualData.reduce((sum, val) => sum + val, 0);
    const targetTotal = targetData.reduce((sum, val) => sum + val, 0);
    const performanceGap = ((actualTotal - targetTotal) / targetTotal) * 100;
    
    // Find best and worst performing periods
    const performanceRatios = actualData.map((actual, index) => {
      const target = targetData[index] || 1;
      return { period: labels[index], ratio: actual / target, actual, target };
    });
    
    const bestPeriod = performanceRatios.reduce((best, current) => 
      current.ratio > best.ratio ? current : best
    );
    
    const worstPeriod = performanceRatios.reduce((worst, current) => 
      current.ratio < worst.ratio ? current : worst
    );
    
    return {
      performanceGap: performanceGap,
      isOverPerforming: performanceGap > 0,
      bestPeriod: bestPeriod.period,
      bestRatio: bestPeriod.ratio,
      worstPeriod: worstPeriod.period,
      worstRatio: worstPeriod.ratio,
      actualTotal: actualTotal,
      targetTotal: targetTotal
    };
  };
  
  const insights = generateComparisonInsights();

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="comparison-chart">
      {/* Title Section */}
      <div className="mb-6 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md ml-6">
          {/* Dynamic Performance vs Target Metric */}
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-black mr-2">vs Target</span>
            <span className={`${insights.isOverPerforming ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <span className="mr-1">{insights.isOverPerforming ? '↑' : '↓'}</span>
              <span className="text-sm font-medium">{insights.performanceGap > 0 ? '+' : ''}{insights.performanceGap.toFixed(1)}%</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Actual performance: ${(insights.actualTotal || 0).toLocaleString()} vs Target: ${(insights.targetTotal || 0).toLocaleString()}
          </p>
          <p className="text-gray-600 text-xs">
            Best period: {insights.bestPeriod} ({((insights.bestRatio || 0) * 100).toFixed(1)}% of target), Worst: {insights.worstPeriod} ({((insights.worstRatio || 0) * 100).toFixed(1)}% of target).
          </p>
        </div>
      </div>
      
      <div className="flex h-5/6 gap-6">
        {/* Chart Section - Left 60% */}
        <div className="w-3/5">
          <ChartBlock {...comparisonChartData} />
        </div>
        
        {/* Data Tables - Right 40% */}
        <div className="w-2/5 grid grid-cols-1 gap-4 ml-6">
          {/* Actual Performance */}
          <div className="overflow-hidden">
            <h3 className="text-sm text-black mb-2 text-left font-bold">Actual Performance</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc' }} className="text-black">
                  <th className="px-3 py-1 text-left text-xs" style={{ borderRight: '0.5px solid #f3f4f6', borderBottom: '0.5px solid #f3f4f6' }}>Quarter</th>
                  <th className="px-3 py-1 text-left text-xs" style={{ borderBottom: '0.5px solid #f3f4f6' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: "Q1", value: "$156K" },
                  { metric: "Q2", value: "$168K" },
                  { metric: "Q3", value: "$162K" },
                  { metric: "Q4", value: "$162K" },
                  { metric: "Total", value: "$648K" }
                ].map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: '#fcfcfc' }}>
                    <td className="px-3 py-1 text-black text-xs" style={{ borderRight: '0.5px solid #f3f4f6', ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.metric}</td>
                    <td className="px-3 py-1 text-black text-xs" style={{ ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Target Performance */}
          <div className="overflow-hidden">
            <h3 className="text-sm text-black mb-2 text-left font-bold">Target Performance</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc' }} className="text-black">
                  <th className="px-3 py-1 text-left text-xs" style={{ borderRight: '0.5px solid #f3f4f6', borderBottom: '0.5px solid #f3f4f6' }}>Quarter</th>
                  <th className="px-3 py-1 text-left text-xs" style={{ borderBottom: '0.5px solid #f3f4f6' }}>Target</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: "Q1", value: "$165K" },
                  { metric: "Q2", value: "$170K" },
                  { metric: "Q3", value: "$175K" },
                  { metric: "Q4", value: "$180K" },
                  { metric: "Total", value: "$690K" }
                ].map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: '#fcfcfc' }}>
                    <td className="px-3 py-1 text-black text-xs" style={{ borderRight: '0.5px solid #f3f4f6', ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.metric}</td>
                    <td className="px-3 py-1 text-black text-xs" style={{ ...(idx < 4 && { borderBottom: '0.5px solid #f3f4f6' }) }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Foundation AI Layout
interface ExcelFoundationAIProps {
  title?: string;
  description?: string;
  topMetric?: { value: string; label: string };
  bottomMetric?: { value: string; label: string };
  chartData?: {
    type: 'bar' | 'line' | 'area';
    labels: string[];
    series: { id: string; data: number[] }[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

const ExcelFoundationAI: React.FC<ExcelFoundationAIProps> = ({ 
  title = "AI-Powered Analysis",
  description = "AI-powered analysis revealing key insights and patterns from comprehensive data analysis.",
  topMetric = { value: "42%", label: "of organizations say they have deployed and are using one or more AI models." },
  bottomMetric = { value: "86%", label: "of the organizations that have deployed AI models report that they are seeing a positive ROI." },
  chartData = {
    type: 'bar',
    labels: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'],
    series: [
      { id: 'Operations', data: [85, 65, 45, 25, 15] },
      { id: 'Analytics', data: [75, 55, 35, 20, 10] },
      { id: 'Automation', data: [65, 45, 25, 15, 8] }
    ],
    showLegend: false,
    showGrid: true
  }
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-8" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="flex h-full gap-8">
        {/* Left Side - Title and Description */}
        <div className="w-1/3 flex flex-col justify-between">
          {/* Title at top */}
          <div>
            <h1 className="text-2xl font-medium text-black leading-tight">{title}</h1>
          </div>
          
          {/* Description at bottom */}
          <div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {/* Middle - Two Metrics at Top and Bottom */}
        <div className="w-1/4 flex flex-col justify-between h-full">
          {/* Dynamic Top Metric */}
          <div className="text-left">
            <div className="text-9xl font-light text-black mb-2">{topMetric.value}</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {topMetric.label}
            </p>
          </div>
          
          {/* Dynamic Bottom Metric */}
          <div className="text-left">
            <div className="text-9xl font-light text-black mb-2">{bottomMetric.value}</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {bottomMetric.label}
            </p>
          </div>
        </div>
        
        {/* Right Side - Multi-series Bar Chart at Bottom */}
        <div className="w-2/5 flex flex-col justify-end">
          {/* ChartBlock Multi-Series Bar Chart */}
          <div className="h-80">
            <ChartBlock
              type={chartData.type}
              labels={chartData.labels}
              series={chartData.series}
              showLegend={chartData.showLegend || false}
              showGrid={chartData.showGrid || true}
              stacked={false}
              animate={true}
              className="w-full h-full bg-white"
            />
          </div>
          
          {/* Custom Tiny Legend Below Chart */}
          <div className="flex justify-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: '#4A3AFF' }}></div>
              <span className="text-xs text-gray-500">Ops</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: '#C893FD' }}></div>
              <span className="text-xs text-gray-500">Analytics</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: '#1e40af' }}></div>
              <span className="text-xs text-gray-500">Auto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// How It Works Layout
interface ExcelHowItWorksProps {
  title?: string;
  processSteps?: string[];
  sheetsAnalyzed?: number;
  recordsProcessed?: number;
}

const ExcelHowItWorks: React.FC<ExcelHowItWorksProps> = ({ 
  title = "How Analysis Works",
  processSteps = [
    "Data extraction from Excel file containing multiple worksheets",
    "Analysis of records from primary dataset", 
    "Revenue pattern recognition across time periods",
    "Performance metrics calculation and trend identification"
  ],
  sheetsAnalyzed = 2,
  recordsProcessed = 113
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="flex h-full gap-8">
        
        {/* Left Side - Title */}
        <div className="w-1/3 flex flex-col justify-center ml-6">
          <h1 className="text-4xl font-medium text-black leading-tight mb-4">
            {title}
          </h1>
          <p className="text-gray-600 text-xs leading-relaxed">
            {sheetsAnalyzed} worksheets analyzed with {recordsProcessed} data points processed for comprehensive business intelligence and performance insights.
          </p>
        </div>
        
        {/* Right Side - Feature Cards in 2x2 Grid with Cross Dividers */}
        <div className="w-2/3 flex flex-col justify-center pr-6 relative">
          <div className="grid grid-cols-2 gap-8">
            
            {processSteps.slice(0, 4).map((step, index) => {
              const icons = [
                <path key="1" d="M9 11l3 3L22 4"/>,
                <path key="2" d="M3 3v18h18"/>,
                <circle key="3" cx="12" cy="12" r="10"/>,
                <rect key="4" x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              ];
              const stepTitles = [
                "Data Extraction",
                "Analysis Processing", 
                "Pattern Recognition",
                "Insights Generation"
              ];
              
              return (
                <div key={index} className="p-4">
                  <div className="mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      {icons[index]}
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-black mb-2">{stepTitles[index]}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step}
                  </p>
                </div>
              );
            })}
            
          </div>
          
          {/* Cross Dividers */}
          {/* Vertical Line */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gray-200"></div>
          {/* Horizontal Line */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-px w-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};

// Limitations Right Only Layout
interface ExcelLimitationsRightOnlyProps {
  title?: string;
  limitations?: string[];
}

const ExcelLimitationsRightOnly: React.FC<ExcelLimitationsRightOnlyProps> = ({ 
  title = "Data Analysis Limitations and Considerations",
  limitations = [
    "Analysis based on available data points from Excel file.",
    "Revenue projections assume consistent market conditions.",
    "Historical patterns may not predict future performance."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black max-w-sm">{title}</h1>
      </div>

      {/* Main Content */}
      <div className="flex items-start ml-6 h-80">
        
        {/* Left side with description at bottom */}
        <div className="w-1/2 flex flex-col justify-end h-full pb-8">
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Most of the world's top artificial intelligence has been trained on foundation models that can be adapted to a wide range of downstream tasks.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              During 2023, most of the content in the industry focused on large language models and generative AI applications, but foundation models encompass much more than just text generation.
            </p>
          </div>
        </div>
        
        {/* Single Column Layout for Bullet Points - Right Side Only */}
        <div className="w-1/2 relative flex flex-col justify-center">
            {/* Continuous vertical line for right column */}
            <div className="absolute left-2 top-1 w-px h-64 bg-gray-400 z-0"></div>
            <ul className="space-y-6 text-base text-gray-700 relative z-10">
              {limitations.slice(0, 3).map((limitation, index) => (
                <li key={index} className="flex items-start relative">
                  <div className="absolute left-1.5 top-1 z-20 bg-white">
                    <span className="text-black text-2xl">•</span>
                  </div>
                  <div className="ml-6">
                    <span className="block">{limitation}</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {index === 0 && "Consider data completeness and temporal coverage when interpreting analytical results."}
                      {index === 1 && "External market factors may influence actual performance beyond historical patterns."}
                      {index === 2 && "Regular data updates and validation recommended for maintaining analysis accuracy."}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

// Limitations Title Only Layout
interface ExcelLimitationsTitleOnlyProps {
  title?: string;
  limitations?: string[];
}

const ExcelLimitationsTitleOnly: React.FC<ExcelLimitationsTitleOnlyProps> = ({ 
  title = "Data Analysis Limitations and Considerations for Business Intelligence",
  limitations = [
    "Analysis based on available data points from Excel file.",
    "Revenue projections assume consistent market conditions.",
    "Historical patterns may not predict future performance."
  ]
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-4xl font-medium text-black max-w-4xl mb-4">{title}</h1>
        <div className="max-w-2xl">
          <p className="text-xs text-gray-600 leading-relaxed">
            {limitations.join(' ')} These considerations ensure accurate interpretation of analytical results and informed decision-making based on data-driven insights from Excel analysis.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-start ml-6 h-80">
        {/* Empty space - no bullet points, just title and description */}
      </div>
    </div>
  );
};

// Professional presentation structure following best practices
const getSlideStructure = (slideCount: string, prompt: string) => {
  const getSlideNumber = (count: string) => {
    switch (count) {
      case 'less-than-5': return 4;
      case '6-10': return 8;
      case '11-15': return 12;
      case '16-20': return 18;
      case 'more-than-20': return 25;
      default: return 8;
    }
  };

  const numSlides = getSlideNumber(slideCount);
  const slides = [];

  // 1. ALWAYS START WITH COVER + TABLE OF CONTENTS
  slides.push({ 
    title: 'Excel Data Analysis', 
    type: 'Cover', 
    layout: 'centered-cover',
    section: 'Opening'
  });
  
  if (numSlides > 3) {
    slides.push({ 
      title: 'Table of Contents', 
      type: 'Index', 
      layout: 'table-of-contents',
      section: 'Opening'
    });
  }

  // 2. CONTEXT SETTING (Interpretation layout for background)
  if (numSlides > 4) {
    slides.push({ 
      title: 'Executive Summary', 
      type: 'Context', 
      layout: 'experience-driven',
      section: 'Context'
    });
  }

  // 3. SECTION DIVIDER (Separate intro from data)
  if (numSlides > 6) {
    slides.push({ 
      title: 'Data Analysis', 
      type: 'Divider', 
      layout: 'dividers',
      section: 'Transition'
    });
  }

  // 4. DATA PRESENTATION SECTION - Include ALL layouts for testing
  const dataLayouts = ['kpi', 'trend', 'fullwidth', 'fullwidth-table', 'comparison', 'table'];
  const kpiHighlights = ['milestone', 'foundation-ai'];
  const interpretationLayouts = [
    'limitations', 
    'limitations-right', 
    'limitations-title-only',
    'experience-driven',
    'experience-description', 
    'experience-two-rows',
    'how-it-works', 
    'experience-full-text'
  ];

  // Determine content focus based on prompt
  let contentFocus = 'general';
  if (prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('budget') || prompt.toLowerCase().includes('revenue')) {
    contentFocus = 'financial';
  } else if (prompt.toLowerCase().includes('business') || prompt.toLowerCase().includes('sales') || prompt.toLowerCase().includes('performance')) {
    contentFocus = 'business';
  }

  // ADD ALL DATA LAYOUTS FOR TESTING - Show every layout you requested
  
  // Add all main data layouts
  dataLayouts.forEach((layout, i) => {
    slides.push({
      title: getDataSlideTitle(contentFocus, layout, i + 1),
      type: 'Data',
      layout: layout,
      section: `Data Section ${i + 1}`
    });
  });
  
  // Add all KPI highlight layouts
  kpiHighlights.forEach((layout, i) => {
    slides.push({
      title: getKPISlideTitle(contentFocus, layout, i + 1),
      type: 'KPI Highlight', 
      layout: layout,
      section: `KPI Section ${i + 1}`
    });
  });
  
  // Add all interpretation layouts
  interpretationLayouts.forEach((layout, i) => {
    slides.push({
      title: getInterpretationSlideTitle(contentFocus, layout, i + 1),
      type: 'Interpretation',
      layout: layout,
      section: `Interpretation Section ${i + 1}`
    });
  });

  // 6. ALWAYS END WITH BACK COVER (alternate between two styles)
  const backCoverLayout = numSlides % 2 === 0 ? 'back-cover' : 'back-cover-left';
  slides.push({ 
    title: 'Thank You', 
    type: 'BackCover', 
    layout: backCoverLayout,
    section: 'Closing'
  });

  return slides.slice(0, numSlides);
};

// Helper functions for slide titles based on content focus
const getDataSlideTitle = (focus: string, layout: string, section: number) => {
  const titles: Record<string, Record<string, string>> = {
    financial: {
      kpi: 'Financial KPIs',
      trend: 'Revenue Trends',
      fullwidth: 'Financial Performance',
      'fullwidth-table': 'Budget Analysis',
      comparison: 'Period Comparison',
      table: 'Financial Summary'
    },
    business: {
      kpi: 'Business Metrics',
      trend: 'Performance Trends',
      fullwidth: 'Growth Analysis',
      'fullwidth-table': 'Sales Data',
      comparison: 'Market Comparison',
      table: 'Business Overview'
    },
    general: {
      kpi: 'Key Metrics',
      trend: 'Data Trends',
      fullwidth: 'Performance Overview',
      'fullwidth-table': 'Data Analysis',
      comparison: 'Comparative Analysis',
      table: 'Data Summary'
    }
  };
  return titles[focus]?.[layout] || `Data Analysis ${section}`;
};

const getKPISlideTitle = (focus: string, layout: string, section: number) => {
  const titles: Record<string, Record<string, string>> = {
    financial: {
      milestone: 'Revenue Milestone',
      'foundation-ai': 'AI-Driven Insights'
    },
    business: {
      milestone: 'Business Achievement',
      'foundation-ai': 'Strategic Insights'
    },
    general: {
      milestone: 'Key Achievement',
      'foundation-ai': 'Data Insights'
    }
  };
  return titles[focus]?.[layout] || `Key Highlight ${section}`;
};

const getInterpretationSlideTitle = (focus: string, layout: string, section: number) => {
  const titles: Record<string, Record<string, string>> = {
    financial: {
      limitations: 'Financial Constraints',
      'experience-description': 'Market Context',
      'how-it-works': 'Financial Process',
      'experience-full-text': 'Strategic Summary'
    },
    business: {
      limitations: 'Market Challenges',
      'experience-description': 'Business Context',
      'how-it-works': 'Process Overview',
      'experience-full-text': 'Strategic Insights'
    },
    general: {
      limitations: 'Current Limitations',
      'experience-description': 'Context & Background',
      'how-it-works': 'Methodology',
      'experience-full-text': 'Key Takeaways'
    }
  };
  return titles[focus]?.[layout] || `Analysis ${section}`;
};

export default function TestExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<string>('');
  const [contentAnalysis, setContentAnalysis] = useState<string>('');
  const [presentationContent, setPresentationContent] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [presentationPrompt, setPresentationPrompt] = useState<string>('');
  const [isAnalyzingPrompt, setIsAnalyzingPrompt] = useState(false);
  const [promptAnalysis, setPromptAnalysis] = useState<string>('');
  const [slideCount, setSlideCount] = useState<string>('');
  const [selectedPalette, setSelectedPalette] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // All available Excel layouts organized by category and usage guidelines
  const excelLayouts = {
    // 1. PRESENTATION STARTERS (Always first two slides)
    'Covers': [
      { id: 'centered-cover', name: 'Centered Cover', component: ExcelCenteredCover },
      { id: 'bottom-cover', name: 'Bottom Cover', component: ExcelBottomCover },
      { id: 'left-cover', name: 'Left Cover', component: ExcelLeftCover }
    ],
    'Index': [
      { id: 'index', name: 'Meeting Agenda', component: ExcelIndex },
      { id: 'table-of-contents', name: 'Table of Contents', component: ExcelTableOfContents }
    ],
    // 2. SECTION SEPARATORS (Use between different content types)
    'Dividers': [
      { id: 'dividers', name: 'Section Dividers', component: ExcelDividers }
    ],
    // 3. DATA DISPLAY LAYOUTS (Charts and tables for data visualization)
    'Data Layouts': [
      { id: 'trend', name: 'Trend Chart', component: ExcelTrendChart },
      { id: 'fullwidth', name: 'Full Width Chart', component: ExcelFullWidthChart },
      { id: 'fullwidth-table', name: 'Chart with Data Table', component: ExcelFullWidthChartWithTable },
      { id: 'comparison', name: 'Comparison View', component: ExcelComparisonLayout },
      { id: 'table', name: 'Data Table', component: ExcelDataTable },
      { id: 'kpi', name: 'KPI Dashboard', component: ExcelKPIDashboard }
    ],
    // 4. KPI HIGHLIGHTS (Single metrics or achievements)
    'KPI Highlights': [
      { id: 'milestone', name: 'Milestone Achievement', component: ExcelMilestone },
      { id: 'foundation-ai', name: 'Foundation AI Models', component: ExcelFoundationAI }
    ],
    // 5. INTERPRETATION LAYOUTS (Context, summaries, conclusions, next steps)
    'Interpretation Layouts': [
      { id: 'limitations', name: 'Current Limitations', component: ExcelLimitations },
      { id: 'limitations-right', name: 'Limitations Right Side', component: ExcelLimitationsRightOnly },
      { id: 'limitations-title-only', name: 'Limitations Title Only', component: ExcelLimitationsTitleOnly },
      { id: 'experience-driven', name: 'Experience Driven', component: ExcelExperienceDriven },
      { id: 'experience-description', name: 'Experience Description', component: ExcelExperienceDrivenDescription },
      { id: 'experience-full-text', name: 'Experience Full Text', component: ExcelExperienceFullText },
      { id: 'experience-two-rows', name: 'Experience Two Rows', component: ExcelExperienceDrivenTwoRows },
      { id: 'how-it-works', name: 'How It Works', component: ExcelHowItWorks }
    ],
    // 6. PRESENTATION CLOSERS (Always last slide, alternate between two)
    'Back Cover Layouts': [
      { id: 'back-cover', name: 'Back Cover', component: ExcelBackCover },
      { id: 'back-cover-left', name: 'Back Cover Left', component: ExcelBackCoverLeft }
    ]
  };

  // Flatten layouts for easy access
  const allExcelLayouts = Object.values(excelLayouts).flat();

  const handleFileUpload = async (selectedFile: File) => {
    console.log('handleFileUpload called with:', selectedFile.name);
    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      console.log('Upload result:', result);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('Upload finished, setting isUploading to false');
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadResult) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/test-excel-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: uploadResult,
          prompt: 'Please analyze this Excel file and tell me exactly what data you can see. List all the values, headers, and structure you can extract from this file.'
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysisResult(result.analysis);
      setComprehensiveAnalysis(result.comprehensiveAnalysis || '');
      setContentAnalysis(result.contentAnalysis || '');
      setPresentationContent(result.presentationContent || '');
      setChartData(result.chartData);
      
      // Update uploadResult with processed data for presentation generation
      if (result.processedData) {
        setUploadResult((prev: any) => ({
          ...prev,
          processedData: result.processedData
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzePrompt = async () => {
    if (!presentationPrompt.trim() || !uploadResult) return;

    setIsAnalyzingPrompt(true);
    setError('');
    setPromptAnalysis('');

    try {
      const response = await fetch('/api/test-excel-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: uploadResult,
          presentationPrompt: presentationPrompt.trim()
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Prompt analysis failed');
      }

      setPromptAnalysis(result.promptAnalysis || 'Analysis completed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prompt analysis failed');
    } finally {
      setIsAnalyzingPrompt(false);
    }
  };

  const handleGeneratePresentation = async () => {
    if (!uploadResult || !selectedPalette || !slideCount || !presentationPrompt.trim()) return;

    setIsGenerating(true);
    setError('');

    try {
      // Generate the presentation structure
      const slides = getSlideStructure(slideCount, presentationPrompt);
      
      // Create presentation data with content
      const presentationData = {
        title: `Presentation - ${uploadResult.fileName || 'Excel Analysis'}`,
        palette: selectedPalette,
        slideCount: slides.length,
        slides: slides.map((slide, index) => ({
          id: index + 1,
          title: slide.title,
          type: slide.type,
          layout: slide.layout,
          content: generateSlideContent(slide, uploadResult, index)
        }))
      };

      setGeneratedPresentation(presentationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Presentation generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate content for each slide
  const generateSlideContent = (slide: any, data: any, index: number) => {
    console.log('🔍 DEBUG generateSlideContent called for slide:', slide.layout);
    console.log('🔍 DEBUG data received:', data);
    
    // Extract data for dynamic content generation
    const processedData = data?.processedData;
    const structuredData = processedData?.structuredData;
    const sheets = structuredData?.sheets || {};
    const fileName = data?.fileName || 'Data File';
    
    // Get the main data sheet (first available sheet)
    const mainSheetName = Object.keys(sheets)[0] || 'Sheet1';
    const mainSheet = sheets[mainSheetName];
    const sheetData = mainSheet?.data || [];
    
    console.log('🔍 DEBUG sheetData length:', sheetData.length);
    console.log('🔍 DEBUG first row sample:', sheetData[0]);
    
    // Detect data type and structure
    const detectDataType = () => {
      if (!sheetData.length) return 'unknown';
      
      const firstRow = sheetData[0];
      const keys = Object.keys(firstRow);
      
      // Check for product/marketplace data
      if (keys.some(key => key.includes('product') || key.includes('price') || key.includes('category') || key.includes('brand'))) {
        return 'product';
      }
      
      // Check for financial data
      if (keys.some(key => key.includes('revenue') || key.includes('ingreso') || key.includes('2024'))) {
        return 'financial';
      }
      
      return 'general';
    };
    
    const dataType = detectDataType();
    console.log('🔍 DEBUG detected data type:', dataType);
    
    // Generate metrics based on actual data type
    const generateMetrics = () => {
      if (!sheetData.length) {
        return {
          totalItems: 0,
          categories: [],
          chartData: { labels: [], values: [] },
          topItems: [],
          summary: 'No data available'
        };
      }
      
      if (dataType === 'product') {
        // Product/marketplace data analysis
        const categories = [...new Set(sheetData.map((row: any) => row.category).filter(Boolean))];
        const brands = [...new Set(sheetData.map((row: any) => row.brand).filter(Boolean))];
        
        // Calculate category distribution
        const categoryData = categories.map(category => ({
          name: category,
          count: sheetData.filter((row: any) => row.category === category).length,
          avgPrice: sheetData
            .filter((row: any) => row.category === category)
            .reduce((sum: number, row: any) => sum + (parseFloat(row.price_usd) || 0), 0) / 
            sheetData.filter((row: any) => row.category === category).length
        }));
        
        // Get top products by price
        const topProducts = sheetData
          .sort((a: any, b: any) => (parseFloat(b.price_usd) || 0) - (parseFloat(a.price_usd) || 0))
          .slice(0, 5);
        
        // Calculate total inventory value
        const totalValue = sheetData.reduce((sum: number, row: any) => {
          const price = parseFloat(row.price_usd) || 0;
          const stock = parseInt(row.stock) || 0;
          return sum + (price * stock);
        }, 0);
        
        return {
          totalItems: sheetData.length,
          categories: categoryData,
          brands: brands.slice(0, 8),
          chartData: {
            labels: categoryData.map(c => c.name).slice(0, 6),
            values: categoryData.map(c => c.count).slice(0, 6)
          },
          topItems: topProducts,
          totalValue: totalValue,
          avgPrice: sheetData.reduce((sum: number, row: any) => sum + (parseFloat(row.price_usd) || 0), 0) / sheetData.length,
          summary: `${sheetData.length} products across ${categories.length} categories from ${brands.length} brands`
        };
      } else {
        // Generic data analysis
        const numericColumns = Object.keys(sheetData[0] || {}).filter(key => 
          !key.startsWith('_') && !isNaN(parseFloat(sheetData[0][key]))
        );
        
        const chartData = numericColumns.length > 0 ? {
          labels: sheetData.slice(0, 6).map((row: any, i: number) => row._rowLabel || `Item ${i + 1}`),
          values: sheetData.slice(0, 6).map((row: any) => parseFloat(row[numericColumns[0]]) || 0)
        } : { labels: [], values: [] };
        
        return {
          totalItems: sheetData.length,
          categories: [],
          chartData,
          topItems: sheetData.slice(0, 5),
          summary: `${sheetData.length} records analyzed`
        };
      }
    };
    
    const metrics = generateMetrics();
    
    return {
      title: slide.title,
      description: `Analysis from ${fileName} - ${mainSheetName} - Generated on ${new Date().toLocaleDateString()}`,
      dataType,
      metrics,
      sheetData,
      fileName,
      mainSheetName,
      canvasWidth: 800,
      canvasHeight: 450,
      useFixedDimensions: true
    };
  };

  // Helper function to render slide content using actual Excel layout components
  const renderSlideContent = (slide: any) => {
    // Find the layout component from our Excel layouts
    const layout = allExcelLayouts.find(l => l.id === slide.layout);
    
    if (!layout) {
      return (
        <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center p-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Layout Not Available</h2>
            <p className="text-lg text-gray-600 mb-2">Layout ID: {slide.layout}</p>
            <p className="text-sm text-gray-500">This layout is not yet implemented</p>
          </div>
        </div>
      );
    }

    const LayoutComponent = layout.component;
    
    // Generate props based on slide content and type
    const props = generateLayoutProps(slide);
    
    return <LayoutComponent {...props} />;
  };

  // Helper function to generate props for layout components
  const generateLayoutProps = (slide: any) => {
    const content = slide.content || {};
    const metrics = content.metrics || {};
    const dataType = content.dataType || 'unknown';
    const baseProps = {
      title: slide.title
    };

    switch (slide.layout) {
      case 'centered-cover':
      case 'bottom-cover':
      case 'left-cover':
        return {
          ...baseProps,
          description: content.description || `Analysis of ${content.fileName || 'Data File'} - ${content.mainSheetName || 'Data'}`
        };
      
      case 'kpi':
        // Generate KPI dashboard based on actual data type
        let kpiCards = [];
        
        if (dataType === 'product') {
          kpiCards = [
            {
              title: 'Total Products',
              value: metrics.totalItems?.toLocaleString() || '0',
              subtitle: 'In Catalog',
              trend: '100%',
              icon: '📦'
            },
            {
              title: 'Categories',
              value: metrics.categories?.length || '0',
              subtitle: 'Product Types',
              trend: 'Active',
              icon: '🏷️'
            },
            {
              title: 'Avg Price',
              value: `$${(metrics.avgPrice || 0).toFixed(2)}`,
              subtitle: 'Per Product',
              trend: '+5.2%',
              icon: '💰'
            },
            {
              title: 'Inventory Value',
              value: `$${(metrics.totalValue || 0).toLocaleString()}`,
              subtitle: 'Total Worth',
              trend: '+12.8%',
              icon: '📈'
            }
          ];
        } else {
          kpiCards = [
            {
              title: 'Total Records',
              value: metrics.totalItems?.toLocaleString() || '0',
              subtitle: 'Data Points',
              trend: '100%',
              icon: '📊'
            },
            {
              title: 'Data Quality',
              value: '95%',
              subtitle: 'Complete',
              trend: '+2.1%',
              icon: '✅'
            },
            {
              title: 'Analysis Ready',
              value: metrics.totalItems || '0',
              subtitle: 'Records',
              trend: 'Ready',
              icon: '🎯'
            },
            {
              title: 'File Size',
              value: `${Math.round((metrics.totalItems || 0) * 0.5)}KB`,
              subtitle: 'Processed',
              trend: 'Optimized',
              icon: '💾'
            }
          ];
        }
        
        return { ...baseProps, kpiCards };
      
      case 'milestone':
        if (dataType === 'product') {
          return {
            ...baseProps,
            value: `$${(metrics.totalValue || 0).toLocaleString()}`,
            growth: '+12.8%',
            description: `Total inventory value across ${metrics.totalItems || 0} products in ${content.mainSheetName || 'marketplace'}`
          };
        } else {
          return {
            ...baseProps,
            value: (metrics.totalItems || 0).toLocaleString(),
            growth: '+100%',
            description: `Total records processed from ${content.mainSheetName || 'data'} analysis`
          };
        }
      
      case 'trend':
      case 'fullwidth':
        // Generate chart data based on actual data type
        let chartData;
        
        if (dataType === 'product') {
          chartData = {
            type: 'line' as const,
            labels: metrics.chartData?.labels || ['Jeans', 'T-shirts', 'Shoes', 'Jackets', 'Dresses', 'Accessories'],
            series: [{
              id: 'Products',
              data: metrics.chartData?.values || [20, 15, 18, 12, 10, 8]
            }],
            showLegend: true,
            legendPosition: 'bottom' as const,
            showGrid: true,
            animate: true
          };
        } else {
          chartData = {
            type: 'line' as const,
            labels: metrics.chartData?.labels || ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6'],
            series: [{
              id: 'Values',
              data: metrics.chartData?.values || [100, 120, 110, 140, 130, 150]
            }],
            showLegend: true,
            legendPosition: 'bottom' as const,
            showGrid: true,
            animate: true
          };
        }
        
        return { ...baseProps, ...chartData };
      
      case 'comparison':
        // Generate comparison chart based on data type
        let comparisonData;
        
        if (dataType === 'product') {
          const topCategories = metrics.categories?.slice(0, 4) || [];
          comparisonData = {
            type: 'bar' as const,
            labels: topCategories.map((c: any) => c.name) || ['Jeans', 'T-shirts', 'Shoes', 'Jackets'],
            series: [
              { 
                id: 'Current Stock', 
                data: topCategories.map((c: any) => c.count) || [20, 15, 18, 12] 
              },
              { 
                id: 'Target Stock', 
                data: topCategories.map((c: any) => Math.round(c.count * 1.2)) || [24, 18, 22, 14] 
              }
            ],
            showLegend: true,
            legendPosition: 'bottom' as const,
            showGrid: true,
            stacked: false,
            animate: true
          };
        } else {
          comparisonData = {
            type: 'bar' as const,
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            series: [
              { id: 'Actual', data: [25, 30, 28, 35] },
              { id: 'Target', data: [30, 32, 35, 38] }
            ],
            showLegend: true,
            legendPosition: 'bottom' as const,
            showGrid: true,
            stacked: false,
            animate: true
          };
        }
        
        return { ...baseProps, ...comparisonData };
      
      case 'table':
        // Generate table data based on actual data type
        let tableData = [];
        
        if (dataType === 'product') {
          tableData = metrics.topItems?.slice(0, 5).map((product: any, idx: number) => ({
            metric: product.product_name || `Product ${idx + 1}`,
            value: `$${parseFloat(product.price_usd || 0).toFixed(2)}`,
            change: product.category || 'N/A'
          })) || [];
        } else {
          tableData = content.sheetData?.slice(0, 5).map((row: any, idx: number) => ({
            metric: row._rowLabel || `Item ${idx + 1}`,
            value: Object.values(row).find(val => typeof val === 'number') || 'N/A',
            change: '+5.2%'
          })) || [];
        }
        
        return { ...baseProps, data: tableData };
      
      case 'foundation-ai':
        if (dataType === 'product') {
          return {
            ...baseProps,
            description: `AI-powered analysis of ${content.fileName || 'product data'} revealing insights from ${metrics.totalItems || 0} products across ${metrics.categories?.length || 0} categories.`,
            topMetric: {
              value: `${metrics.categories?.length || 0}`,
              label: `product categories analyzed with ${metrics.totalItems || 0} items and $${(metrics.totalValue || 0).toLocaleString()} total inventory value.`
            },
            bottomMetric: {
              value: `$${(metrics.avgPrice || 0).toFixed(0)}`,
              label: `average price per product with ${metrics.brands?.length || 0} brands represented in the marketplace data.`
            },
            chartData: {
              type: 'bar' as const,
              labels: metrics.chartData?.labels?.slice(0, 6) || ['Jeans', 'T-shirts', 'Shoes', 'Jackets', 'Dresses', 'Accessories'],
              series: [
                { id: 'Products', data: metrics.chartData?.values?.slice(0, 6) || [20, 15, 18, 12, 10, 8] },
                { id: 'Target', data: metrics.chartData?.values?.slice(0, 6).map((v: number) => Math.round(v * 1.1)) || [22, 17, 20, 13, 11, 9] },
                { id: 'Forecast', data: metrics.chartData?.values?.slice(0, 6).map((v: number) => Math.round(v * 1.05)) || [21, 16, 19, 13, 11, 8] }
              ],
              showLegend: false,
              showGrid: true
            }
          };
        } else {
          return {
            ...baseProps,
            description: `AI-powered analysis of ${content.fileName || 'data'} revealing key insights and patterns from ${metrics.totalItems || 0} data points.`,
            topMetric: {
              value: `${metrics.totalItems || 0}`,
              label: `data points processed with comprehensive analysis coverage.`
            },
            bottomMetric: {
              value: '95%',
              label: `data completeness rate with high-quality structured information.`
            },
            chartData: {
              type: 'bar' as const,
              labels: ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6'],
              series: [
                { id: 'Values', data: [100, 120, 110, 140, 130, 150] },
                { id: 'Target', data: [110, 130, 120, 150, 140, 160] },
                { id: 'Forecast', data: [105, 125, 115, 145, 135, 155] }
              ],
              showLegend: false,
              showGrid: true
            }
          };
        }
      
      case 'fullwidth-table':
        // Generate chart with table data based on actual data type
        let fullWidthData;
        
        if (dataType === 'product') {
          fullWidthData = {
            type: 'line' as const,
            labels: metrics.chartData?.labels || ['Jeans', 'T-shirts', 'Shoes', 'Jackets', 'Dresses', 'Accessories'],
            series: [{
              id: 'Products',
              data: metrics.chartData?.values || [20, 15, 18, 12, 10, 8]
            }],
            showLegend: true,
            legendPosition: 'bottom' as const,
            showGrid: true,
            animate: true,
            tableData: metrics.categories?.slice(0, 5).map((category: any) => ({
              metric: category.name,
              value: `$${category.avgPrice?.toFixed(2) || '0.00'}`
            })) || []
          };
        } else {
          fullWidthData = {
            type: 'line' as const,
            labels: metrics.chartData?.labels || ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6'],
            series: [{
              id: 'Values',
              data: metrics.chartData?.values || [100, 120, 110, 140, 130, 150]
            }],
            showLegend: true,
            legendPosition: 'bottom' as const,
            showGrid: true,
            animate: true,
            tableData: content.sheetData?.slice(0, 5).map((row: any) => ({
              metric: row._rowLabel || 'Item',
              value: Object.values(row).find(val => typeof val === 'number') || 'N/A'
            })) || []
          };
        }
        
        return { ...baseProps, ...fullWidthData };
      
      case 'dividers':
        return {
          ...baseProps,
          sectionNumber: slide.content?.sectionNumber || '01',
          content: `Analysis of ${content.mainSheetName || 'Excel data'} revealing key business insights and performance metrics.`
        };
      
      case 'limitations':
      case 'limitations-right':
      case 'limitations-title-only':
        // Generate limitations based on actual data analysis
        let dataLimitations = [];
        
        if (dataType === 'product') {
          dataLimitations = [
            `Product analysis based on ${metrics.totalItems || 0} items may not represent complete marketplace inventory.`,
            `Price variations across ${metrics.brands?.length || 0} brands may indicate different market positioning strategies.`,
            `Category distribution shows ${metrics.categories?.length || 0} types, which may not cover all product segments.`,
            `Stock levels and ratings are point-in-time data and may not reflect current availability or customer sentiment.`
          ];
        } else {
          dataLimitations = [
            `Analysis based on ${metrics.totalItems || 0} data points from ${content.mainSheetName || 'data file'}.`,
            `Data quality assumptions may not account for external factors affecting the dataset.`,
            `Historical patterns may not predict future performance in changing conditions.`,
            `Limited context about data collection methods may affect interpretation accuracy.`
          ];
        }
        
        return {
          ...baseProps,
          title: `${content.mainSheetName || 'Data'} Analysis Limitations`,
          limitations: dataLimitations
        };
      
      case 'table-of-contents':
        // Generate dynamic table of contents based on actual slide structure
        const generateTableOfContents = (allSlides: any[]) => {
          const sections: Array<{
            title: string;
            slides: Array<{ title: string; slideNumber: number }>;
          }> = [];
          
          let currentSection = '';
          let currentSlides: Array<{ title: string; slideNumber: number }> = [];
          
          allSlides.forEach((slide, index) => {
            const slideNumber = index + 1;
            
            if (slide.section !== currentSection) {
              // Save previous section if it exists
              if (currentSection && currentSlides.length > 0) {
                sections.push({
                  title: currentSection,
                  slides: [...currentSlides]
                });
              }
              
              // Start new section
              currentSection = slide.section || 'Content';
              currentSlides = [];
            }
            
            currentSlides.push({
              title: slide.title,
              slideNumber: slideNumber
            });
          });
          
          // Add the last section
          if (currentSection && currentSlides.length > 0) {
            sections.push({
              title: currentSection,
              slides: currentSlides
            });
          }
          
          return sections;
        };
        
        // Generate sections from the actual slide structure
        const mockSlides = [
          { title: `${content.fileName || 'Excel'} Data Analysis`, section: 'Opening' },
          { title: 'Table of Contents', section: 'Opening' },
          { title: 'Executive Summary', section: 'Context' },
          { title: 'Data Analysis', section: 'Data Presentation' },
          { title: 'Key Performance Indicators', section: 'Data Presentation' },
          { title: 'Revenue Trends', section: 'Data Presentation' },
          { title: 'Financial Performance', section: 'Data Presentation' },
          { title: `Strategic Insights from ${content.mainSheetName || 'Business Data'}`, section: 'Interpretation' },
          { title: `${content.fileName || 'Excel'} Analysis Methodology`, section: 'Interpretation' },
          { title: 'Thank You', section: 'Closing' }
        ];
        
        const dynamicSections = generateTableOfContents(mockSlides);
        
        return {
          ...baseProps,
          title: 'Presentation Overview',
          sections: dynamicSections,
          totalSlides: mockSlides.length,
          fileName: `${content.fileName || 'Excel'} Analysis - ${content.mainSheetName || 'Data'}`
        };
      
      case 'experience-driven':
      case 'experience-description':
      case 'experience-two-rows':
      case 'experience-full-text':
        // Generate insights based on actual data patterns
        let experienceInsights = [];
        
        if (dataType === 'product') {
          const topCategory = metrics.categories?.[0];
          const topBrand = metrics.brands?.[0];
          const highestPricedProduct = metrics.topItems?.[0];
          
          experienceInsights = [
            `Our analysis of ${content.fileName || 'marketplace data'} reveals ${metrics.totalItems || 0} products across ${metrics.categories?.length || 0} distinct categories.`,
            `${topCategory?.name || 'Top category'} leads with ${topCategory?.count || 0} products, demonstrating strong market presence and customer demand.`,
            `Premium products like "${highestPricedProduct?.product_name || 'top item'}" at $${parseFloat(highestPricedProduct?.price_usd || 0).toFixed(2)} showcase quality positioning.`,
            `Brand diversity with ${metrics.brands?.length || 0} brands including ${topBrand || 'leading brands'} provides comprehensive market coverage and customer choice.`
          ];
        } else {
          experienceInsights = [
            `Our analysis of ${content.fileName || 'your data'} reveals ${metrics.totalItems || 0} comprehensive data points providing deep insights.`,
            `Data structure demonstrates organized information with consistent formatting and complete records for analysis.`,
            `The ${content.mainSheetName || 'dataset'} shows reliable patterns suitable for strategic decision-making and trend analysis.`,
            `Comprehensive data coverage from ${content.mainSheetName || 'your analysis'} enables actionable intelligence and performance optimization.`
          ];
        }
        
        return {
          ...baseProps,
          title: `Strategic Insights from ${content.mainSheetName || 'Data Analysis'}`,
          description: experienceInsights.join(' '),
          insights: experienceInsights,
          totalRevenue: dataType === 'product' ? `$${(metrics.totalValue || 0).toLocaleString()}` : `${metrics.totalItems || 0} records`,
          dataPoints: metrics.totalItems || 0,
          peakMonth: dataType === 'product' ? (metrics.categories?.[0]?.name || 'Top Category') : 'Data Peak'
        };
      
      case 'how-it-works':
        // Generate process description based on actual Excel structure
        const sheetNames = Object.keys(content.sheets || {});
        const processSteps = [
          `Data extraction from ${content.fileName || 'Excel file'} containing ${sheetNames.length} worksheets`,
          `Analysis of ${content.sheetData?.length || 113} records from ${content.mainSheetName || 'primary dataset'}`,
          `Revenue pattern recognition across ${content.monthlyData?.labels?.length || 12} time periods`,
          `Performance metrics calculation and trend identification for business intelligence`
        ];
        
        return {
          ...baseProps,
          title: `${content.fileName || 'Excel'} Analysis Methodology`,
          processSteps: processSteps,
          sheetsAnalyzed: sheetNames.length,
          recordsProcessed: content.sheetData?.length || 113
        };
      
      case 'foundation-ai':
        // Generate AI-powered analysis metrics based on actual Excel data
        const totalRevenueAI = content.kpiMetrics?.totalRevenue || 0;
        const dataPointsAI = content.sheetData?.length || 0;
        const monthlyDataAI = content.monthlyData?.values || [];
        const avgMonthlyAI = Math.round(totalRevenueAI / 12);
        
        // Calculate growth rate from first to last month
        const firstMonthValue = monthlyDataAI[0] || 0;
        const lastMonthValue = monthlyDataAI[monthlyDataAI.length - 1] || 0;
        const growthRate = firstMonthValue > 0 ? ((lastMonthValue - firstMonthValue) / firstMonthValue * 100) : 0;
        
        // Calculate data completeness percentage
        const totalPossibleDataPoints = monthlyDataAI.length * 10; // Assuming 10 metrics per month
        const completenessPercentage = Math.round((dataPointsAI / totalPossibleDataPoints) * 100);
        
        // Generate dynamic chart data based on actual Excel data
        const aiChartData = {
          type: 'bar' as const,
          labels: content.monthlyData?.labels?.slice(0, 6) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          series: [
            { 
              id: 'Revenue', 
              data: monthlyDataAI.slice(0, 6).map((val: number) => Math.round(val / 1000)) || [72, 38, 28, 41, 16, 22]
            },
            { 
              id: 'Target', 
              data: monthlyDataAI.slice(0, 6).map((val: number) => Math.round(val / 1000 * 1.1)) || [79, 42, 31, 45, 18, 24]
            },
            { 
              id: 'Forecast', 
              data: monthlyDataAI.slice(0, 6).map((val: number) => Math.round(val / 1000 * 1.05)) || [76, 40, 29, 43, 17, 23]
            }
          ],
          showLegend: false,
          showGrid: true
        };
        
        return {
          ...baseProps,
          title: `AI Analysis of ${content.mainSheetName || 'Business Data'}`,
          description: `AI-powered analysis of ${content.fileName || 'Excel data'} revealing ${dataPointsAI} data points with ${completenessPercentage}% data completeness and ${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}% growth trend.`,
          topMetric: {
            value: `${completenessPercentage}%`,
            label: `data completeness across ${dataPointsAI} records from ${content.mainSheetName || 'Excel analysis'} with comprehensive coverage.`
          },
          bottomMetric: {
            value: `${Math.abs(growthRate).toFixed(0)}%`,
            label: `${growthRate >= 0 ? 'growth' : 'variance'} rate identified through AI pattern recognition from ${content.fileName || 'business data'} analysis.`
          },
          chartData: aiChartData
        };
      
      case 'back-cover':
      case 'back-cover-left':
        return {
          ...baseProps,
          title: 'Thank You',
          description: `Analysis Complete - ${content.fileName || 'Excel Data'} Insights`
        };
      
      default:
        return {
          ...baseProps,
          description: `Analysis from ${content.fileName || 'Excel file'} - ${content.mainSheetName || 'Data'}`
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">File Analysis Test (Excel/CSV)</h1>
        
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload File (Excel/CSV)</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                console.log('File input changed:', e.target.files);
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  console.log('Selected file:', selectedFile.name, selectedFile.type, selectedFile.size);
                  setFile(selectedFile);
                  handleFileUpload(selectedFile);
                } else {
                  console.log('No file selected');
                }
              }}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Choose File (Excel/CSV)'}
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800">Upload Successful!</h3>
              <pre className="mt-2 text-sm text-green-700 overflow-auto max-h-40">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {uploadResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: AI Analysis</h2>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Excel Data with AI'}
            </button>

            {/* Comprehensive Analysis Result */}
            {comprehensiveAnalysis && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800">📊 Comprehensive Data Analysis:</h3>
                <div className="mt-2 text-green-700 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                  {comprehensiveAnalysis}
                </div>
              </div>
            )}

            {/* Presentation Prompt Input */}
            {comprehensiveAnalysis && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                <h3 className="font-semibold text-indigo-800 mb-3">🎯 Presentation Focus:</h3>
                <p className="text-sm text-indigo-600 mb-3">
                  Describe what you want the presentation to focus on. This will help the AI create more targeted slides from your Excel data.
                </p>
                <textarea
                  value={presentationPrompt}
                  onChange={(e) => setPresentationPrompt(e.target.value)}
                  placeholder="Example: Create a quarterly business review presentation focusing on revenue growth, highlighting key performance metrics and trends. Include recommendations for Q4 strategy based on the data patterns."
                  className="w-full h-32 px-3 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm text-black"
                />
                <div className="mt-3 flex justify-end items-center">
                  <span className="text-xs text-indigo-500">
                    {presentationPrompt.length}/500 characters
                  </span>
                </div>
              </div>
            )}

            {/* Slide Count Selection */}
            {comprehensiveAnalysis && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-3">📊 How many slides do you want?</h3>
                <p className="text-sm text-green-600 mb-4">
                  Select the desired number of slides for your presentation.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'less-than-5', label: 'Less than 5' },
                    { value: '6-10', label: '6-10' },
                    { value: '11-15', label: '11-15' },
                    { value: '16-20', label: '16-20' },
                    { value: 'more-than-20', label: 'More than 20' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSlideCount(option.value)}
                      className={`px-4 py-3 text-sm font-medium rounded-md border transition-colors ${
                        slideCount === option.value
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-green-700 border-green-300 hover:bg-green-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {slideCount && (
                  <div className="mt-3 text-sm text-green-600">
                    Selected: <span className="font-medium">{slideCount.replace('-', ' ')}</span> slides
                  </div>
                )}
              </div>
            )}

            {/* Color Palette Selector */}
            {slideCount && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-md">
                <h3 className="font-semibold text-purple-800 mb-3">🎨 Choose Your Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { 
                      id: 'professional', 
                      name: 'Professional Blue', 
                      colors: ['#1e40af', '#3b82f6', '#93c5fd'],
                      description: 'Clean and corporate'
                    },
                    { 
                      id: 'modern', 
                      name: 'Modern Purple', 
                      colors: ['#7c3aed', '#a855f7', '#c4b5fd'],
                      description: 'Creative and bold'
                    },
                    { 
                      id: 'warm', 
                      name: 'Warm Orange', 
                      colors: ['#ea580c', '#fb923c', '#fed7aa'],
                      description: 'Energetic and friendly'
                    },
                    { 
                      id: 'nature', 
                      name: 'Nature Green', 
                      colors: ['#059669', '#10b981', '#86efac'],
                      description: 'Fresh and sustainable'
                    }
                  ].map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => setSelectedPalette(palette.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedPalette === palette.id
                          ? 'border-purple-500 bg-white shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="flex space-x-1 mb-2">
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="text-xs font-medium text-gray-800">{palette.name}</div>
                      <div className="text-xs text-gray-500">{palette.description}</div>
                    </button>
                  ))}
                </div>
                {selectedPalette && (
                  <div className="mt-3 text-sm text-purple-600">
                    Selected: <span className="font-medium">{selectedPalette.charAt(0).toUpperCase() + selectedPalette.slice(1)}</span> palette
                  </div>
                )}
              </div>
            )}

            {/* Content Analysis */}
            {contentAnalysis && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold text-blue-800">🔍 Content Analysis:</h3>
                <div className="mt-2 text-blue-700 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                  {contentAnalysis}
                </div>
              </div>
            )}

            {/* Presentation Content */}
            {presentationContent && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
                <h3 className="font-semibold text-purple-800">🎯 Presentation Content:</h3>
                <div className="mt-2 text-purple-700 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                  {presentationContent}
                </div>
              </div>
            )}

            {/* Interactive Charts */}
            {chartData && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Interactive Chart Visualizations</h3>
                
                {/* Line Chart */}
                {chartData.lineChart && (
                  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Units Sold Trend</h4>
                      <p className="text-sm text-gray-600">Monthly units sold over time</p>
                    </div>
                    <ChartBlock {...chartData.lineChart} />
                  </div>
                )}

                {/* Bar Chart */}
                {chartData.barChart && (
                  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Revenue Comparison</h4>
                      <p className="text-sm text-gray-600">Actual vs Goal Revenue (First 6 Months)</p>
                    </div>
                    <ChartBlock {...chartData.barChart} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Request Analysis Section - Moved to Bottom */}
        {selectedPalette && presentationPrompt.trim() && (
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-md">
            <h3 className="font-semibold text-amber-800 mb-3">🔍 Request Analysis & Preview</h3>
            <p className="text-sm text-amber-600 mb-4">
              Analyze your presentation request to see what the AI will create based on your prompt and data.
            </p>
            
            <div className="flex justify-center mb-4">
              <button
                onClick={handleAnalyzePrompt}
                disabled={!presentationPrompt.trim() || isAnalyzingPrompt}
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzingPrompt ? 'Analyzing Request...' : 'Analyze Request'}
              </button>
            </div>

            {/* Request Analysis Result */}
            {promptAnalysis && (
              <div className="mb-4 p-4 bg-white border border-amber-200 rounded-md">
                <h4 className="font-medium text-amber-800 mb-2">📋 Presentation Preview:</h4>
                <div className="text-amber-700 whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                  {promptAnalysis}
                </div>
              </div>
            )}

            {/* Slide Structure Preview Box */}
            {promptAnalysis && (
              <div className="mt-4 p-4 bg-white border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-700 mb-3">📊 Professional Presentation Structure:</h4>
                <div className="space-y-3">
                  {getSlideStructure(slideCount, presentationPrompt).map((slide, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded border-l-4 border-green-400 bg-green-50">
                      <div className="text-sm font-medium text-green-600 min-w-[60px]">
                        Slide {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{slide.section}</div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {slide.type}
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {slide.layout}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Professional Structure Guide */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div className="font-medium text-blue-800 mb-2">📋 Professional Structure Applied:</div>
                  <div className="space-y-1 text-blue-700">
                    <div>• <strong>Opening:</strong> Cover + Table of Contents</div>
                    <div>• <strong>Context:</strong> Executive Summary & Background</div>
                    <div>• <strong>Sections:</strong> Dividers separate content types</div>
                    <div>• <strong>Data Flow:</strong> Charts → KPI Highlights → Interpretation</div>
                    <div>• <strong>Closing:</strong> Professional back cover</div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm text-blue-800">
                    <strong>🎨 Style:</strong> {selectedPalette.charAt(0).toUpperCase() + selectedPalette.slice(1)} palette
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong>📊 Data Sources:</strong> {uploadResult?.processedData?.structuredData?.totalSheets || 0} Excel sheets
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong>🎯 Available Layouts:</strong> {allExcelLayouts.length} Excel-focused layouts (fully rendered)
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Ready to generate your presentation with the selected style and structure!
                  </div>
                </div>

                {/* Generate Presentation Button - Moved to bottom of structure */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleGeneratePresentation}
                    disabled={isGenerating}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? '🔄 Generating...' : '🚀 Generate Presentation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generated Presentation Display */}
        {generatedPresentation && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{generatedPresentation.title}</h2>
              <div className="text-sm text-gray-600">
                {generatedPresentation.slideCount} slides • {generatedPresentation.palette.charAt(0).toUpperCase() + generatedPresentation.palette.slice(1)} palette • {allExcelLayouts.length} layouts available
              </div>
            </div>

            {/* Slides Display - Stacked Vertically */}
            <div className="space-y-8">
              {generatedPresentation.slides.map((slide: any, index: number) => (
                <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Slide Header */}
                  <div className="p-4 bg-gray-100 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Slide {slide.id}: {slide.title}
                      </h3>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                        {slide.layout}
                      </span>
                    </div>
                  </div>

                  {/* Slide Content - Responsive 16:9 aspect ratio */}
                  <div className="bg-white flex justify-center items-center p-4">
                    <div 
                      className="border border-gray-300 rounded-lg overflow-hidden w-full"
                      style={{
                        maxWidth: '800px',
                        aspectRatio: '16/9'
                      }}
                    >
                      {renderSlideContent(slide)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Presentation Actions */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => setGeneratedPresentation(null)}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close Presentation
              </button>
              <button
                onClick={() => alert('Export functionality would be implemented here')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Export as PDF
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="font-semibold text-yellow-800">Test Instructions:</h3>
          <ol className="mt-2 text-yellow-700 list-decimal list-inside space-y-1">
            <li>Upload an Excel file (.xlsx or .xls)</li>
            <li>Check if the upload result shows the correct data structure</li>
            <li>Click "Analyze" to see what the AI actually extracts</li>
            <li>Compare the AI analysis with your actual Excel content</li>
            <li>Generate presentations using {allExcelLayouts.length} fully-rendered Excel layouts</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
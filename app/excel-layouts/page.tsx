"use client";

import React, { useState } from 'react';

// Excel-focused layout components designed for PowerPoint/Google Slides compatibility
const ExcelDataTable = ({ title = "Data Overview", data = [] }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9' }}>
    {/* Title - Standard slide title positioning */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
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

const ExcelKPIDashboard = ({ title = "Key Performance Indicators" }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9' }}>
    {/* Title */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
    </div>
    
    {/* KPI Grid - 2x2 layout compatible with slides */}
    <div className="grid grid-cols-2 gap-6 h-4/5">
      {[
        { label: "Total Revenue", value: "$648K", change: "+18.2%", color: "blue" },
        { label: "Units Sold", value: "16.2K", change: "+15.3%", color: "green" },
        { label: "Avg Order Value", value: "$40", change: "+2.5%", color: "purple" },
        { label: "Target Achievement", value: "94.2%", change: "-5.8%", color: "orange" }
      ].map((kpi, idx) => (
        <div key={idx} className={`bg-${kpi.color}-50 border-2 border-${kpi.color}-200 rounded-lg p-4 flex flex-col justify-center items-center`}>
          <div className={`text-3xl font-bold text-${kpi.color}-600 mb-2`}>{kpi.value}</div>
          <div className="text-gray-700 font-medium mb-1">{kpi.label}</div>
          <div className={`text-sm font-semibold ${
            kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>{kpi.change}</div>
        </div>
      ))}
    </div>
  </div>
);

const ExcelTrendChart = ({ title = "Revenue Performance by Quarter" }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9' }}>
    {/* Title */}
    <div className="mb-4">
      <h2 className="text-xl font-bold text-blue-600">{title}</h2>
    </div>
    
    <div className="flex h-5/6">
      {/* Chart Section - Left 70% */}
      <div className="w-2/3 pr-6">
        {/* Y-axis labels and chart area */}
        <div className="relative h-full">
          {/* Y-axis */}
          <div className="absolute left-0 h-full flex flex-col justify-between text-xs text-gray-600 py-4">
            <span>80%</span>
            <span>60%</span>
            <span>40%</span>
            <span>20%</span>
            <span>0%</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-8 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[20, 40, 60, 80].map((line) => (
                <div 
                  key={line}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${100 - line}%` }}
                ></div>
              ))}
            </div>
            
            {/* Box and whisker chart */}
            <div className="flex items-end justify-between h-full px-4 pb-8">
              {[
                { quarter: "Q1 2023", median: 52.2, q1: 34.6, q3: 68.8, min: 22.4, max: 73.2, value: "52.2%" },
                { quarter: "Q2 2023", median: 58.6, q1: 39.9, q3: 68.3, min: 27.8, max: 75.2, value: "58.6%" },
                { quarter: "Q3 2023", median: 43.8, q1: 28.6, q3: 60.8, min: 18.7, max: 64.9, value: "43.8%" },
                { quarter: "Q4 2023", median: 47.8, q1: 31.0, q3: 62.8, min: 18.2, max: 67.4, value: "47.8%" }
              ].map((data, idx) => (
                <div key={idx} className="flex flex-col items-center relative" style={{ height: '100%' }}>
                  {/* Whisker lines */}
                  <div className="relative w-12" style={{ height: '100%' }}>
                    {/* Max whisker */}
                    <div 
                      className="absolute w-0.5 bg-red-400 left-1/2 transform -translate-x-1/2"
                      style={{ 
                        height: '2px',
                        bottom: `${data.max}%`
                      }}
                    ></div>
                    
                    {/* Whisker line to max */}
                    <div 
                      className="absolute w-0.5 bg-red-400 left-1/2 transform -translate-x-1/2"
                      style={{ 
                        height: `${data.max - data.q3}%`,
                        bottom: `${data.q3}%`
                      }}
                    ></div>
                    
                    {/* Box (Q1 to Q3) */}
                    <div 
                      className="absolute w-12 bg-red-400 border border-red-500 left-1/2 transform -translate-x-1/2"
                      style={{ 
                        height: `${data.q3 - data.q1}%`,
                        bottom: `${data.q1}%`
                      }}
                    >
                      {/* Median line */}
                      <div 
                        className="absolute w-full bg-white border-t-2 border-white"
                        style={{ 
                          bottom: `${((data.median - data.q1) / (data.q3 - data.q1)) * 100}%`
                        }}
                      ></div>
                      
                      {/* Value label inside box */}
                      <div 
                        className="absolute text-xs font-semibold text-white text-center w-full"
                        style={{ 
                          bottom: `${((data.median - data.q1) / (data.q3 - data.q1)) * 100 + 10}%`
                        }}
                      >
                        {data.value}
                      </div>
                    </div>
                    
                    {/* Whisker line to min */}
                    <div 
                      className="absolute w-0.5 bg-red-400 left-1/2 transform -translate-x-1/2"
                      style={{ 
                        height: `${data.q1 - data.min}%`,
                        bottom: `${data.min}%`
                      }}
                    ></div>
                    
                    {/* Min whisker */}
                    <div 
                      className="absolute w-0.5 bg-red-400 left-1/2 transform -translate-x-1/2"
                      style={{ 
                        height: '2px',
                        bottom: `${data.min}%`
                      }}
                    ></div>
                  </div>
                  
                  {/* Quarter label */}
                  <div className="text-xs font-medium text-gray-700 mt-2 text-center">
                    {data.quarter}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Insights Panel - Right 30% */}
      <div className="w-1/3 pl-4 border-l border-gray-200">
        <div className="space-y-4 text-sm">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
            <p className="text-gray-800">
              <strong>Q2 shows strongest performance</strong> with median conversion of 58.6%, indicating optimal market conditions and effective strategies.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
            <p className="text-gray-800">
              <strong>Q3 performance dip</strong> to 43.8% suggests seasonal challenges or market saturation requiring strategic adjustment.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
            <p className="text-gray-800">
              <strong>Consistent variability</strong> across quarters shows execution matters more than timing, with top performers achieving 2-3x median rates.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
            <p className="text-gray-800">
              <strong>Opportunity exists</strong> to bring bottom quartile performers (18-28%) closer to median levels through best practice sharing.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ExcelComparisonLayout = ({ title = "Performance Comparison" }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9' }}>
    {/* Title */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
    </div>
    
    {/* Two-column comparison layout */}
    <div className="grid grid-cols-2 gap-8 h-4/5">
      {/* Left Column - Actual Performance */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-green-800 mb-4 text-center">Actual Performance</h3>
        <div className="space-y-3">
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
      
      {/* Right Column - Target Performance */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">Target Performance</h3>
        <div className="space-y-3">
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
);

const ExcelExecutiveSummary = ({ title = "Executive Summary" }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9' }}>
    {/* Title */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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
              Preview: {layouts.find(l => l.id === selectedLayout)?.name}
            </h2>
            <p className="text-sm text-gray-500">16:9 aspect ratio • PowerPoint/Google Slides compatible</p>
          </div>
          
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

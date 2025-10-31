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

const ExcelTrendChart = ({ title = "Monthly Trend Analysis" }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6" style={{ aspectRatio: '16/9' }}>
    {/* Title */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
    </div>
    
    {/* Simple bar chart representation - PowerPoint compatible */}
    <div className="h-4/5 flex items-end justify-between px-4">
      {[
        { month: "Jan", value: 65, revenue: "$42K" },
        { month: "Feb", value: 85, revenue: "$54K" },
        { month: "Mar", value: 75, revenue: "$48K" },
        { month: "Apr", value: 90, revenue: "$58K" },
        { month: "May", value: 80, revenue: "$52K" },
        { month: "Jun", value: 95, revenue: "$62K" },
        { month: "Jul", value: 88, revenue: "$56K" },
        { month: "Aug", value: 70, revenue: "$45K" },
        { month: "Sep", value: 92, revenue: "$59K" },
        { month: "Oct", value: 98, revenue: "$63K" },
        { month: "Nov", value: 100, revenue: "$65K" },
        { month: "Dec", value: 105, revenue: "$68K" }
      ].map((data, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="text-xs font-semibold text-gray-600 mb-1">{data.revenue}</div>
          <div 
            className="bg-blue-500 w-8 rounded-t-sm"
            style={{ height: `${data.value * 2}px` }}
          ></div>
          <div className="text-xs font-medium text-gray-700 mt-2">{data.month}</div>
        </div>
      ))}
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

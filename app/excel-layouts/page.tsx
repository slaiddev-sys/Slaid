"use client";

import React, { useState } from 'react';
import ChartBlock from '../../components/blocks/ChartBlock';
import FileUpload from '../../components/ui/FileUpload';

// Excel-focused layout components designed for PowerPoint/Google Slides compatibility
interface ExcelDataTableProps {
  title?: string;
  data?: any[];
}

// Centered Cover Layout - Clean and professional for presentations
interface ExcelCenteredCoverProps {
  title?: string;
  description?: string;
  logoUrl?: string;
}

const ExcelCenteredCover: React.FC<ExcelCenteredCoverProps> = ({ 
  title = "Our solution", 
  description = "Transforming ideas into results with strategy, craft, and measurable impact.",
  logoUrl = "/logo-placeholder.png"
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center p-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Main Title - Bigger size and centered, positioned higher */}
    <div className="text-center mb-1 -mt-16">
      <h1 className="text-5xl font-normal text-gray-900 leading-tight">{title}</h1>
    </div>
    
    {/* Description - Smaller text, centered below title with minimal spacing */}
    <div className="text-center max-w-2xl">
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

// Bottom Cover Layout - Title left, description right, positioned at bottom
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

// Index Layout - Meeting agenda style with numbered items
interface ExcelIndexProps {
  title?: string;
  items?: Array<{
    number: string;
    title: string;
    description: string;
  }>;
}

const ExcelIndex: React.FC<ExcelIndexProps> = ({ 
  title = "Index",
  items = [
    { number: "01", title: "Market Analysis", description: "Current market trends and opportunities" },
    { number: "02", title: "Product Updates", description: "Latest feature releases and roadmap" },
    { number: "03", title: "Financial Review", description: "Q4 performance and budget planning" },
    { number: "04", title: "Strategic Planning", description: "2025 goals and initiatives" },
    { number: "05", title: "Customer Insights", description: "Voice of customer feedback and analysis" },
    { number: "06", title: "Next Steps", description: "Action items and follow-up tasks" },
    { number: "07", title: "Team Updates", description: "Department progress and milestones" },
    { number: "08", title: "Budget Review", description: "Quarterly budget analysis and planning" },
    { number: "09", title: "Risk Assessment", description: "Current risks and mitigation strategies" },
    { number: "10", title: "Innovation Lab", description: "New technology and innovation updates" },
    { number: "11", title: "Partnership Review", description: "Strategic partnerships and alliances" },
    { number: "12", title: "Compliance Update", description: "Regulatory changes and compliance status" },
    { number: "13", title: "Market Expansion", description: "New market opportunities and strategies" },
    { number: "14", title: "Technology Stack", description: "Technical infrastructure and updates" },
    { number: "15", title: "Customer Success", description: "Customer satisfaction and retention metrics" },
    { number: "16", title: "Competitive Analysis", description: "Market positioning and competitor insights" },
    { number: "17", title: "Resource Planning", description: "Human resources and capacity planning" },
    { number: "18", title: "Action Items", description: "Summary and next steps assignment" }
  ]
}) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-8" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Title */}
    <div className="mb-8">
      <h1 className="text-4xl font-normal text-gray-900 leading-tight text-left">{title}</h1>
    </div>
    
    {/* Three-column grid of agenda items with row dividers */}
    <div className="space-y-2">
      {Array.from({ length: Math.ceil(items.length / 3) }, (_, rowIndex) => (
        <div key={rowIndex}>
          {/* Row of 3 items */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-1 mb-1">
            {items.slice(rowIndex * 3, (rowIndex + 1) * 3).map((item, colIndex) => {
              const itemIndex = rowIndex * 3 + colIndex;
              return (
                <div key={itemIndex} className="flex items-start gap-3">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <span className="text-lg font-medium text-gray-900">{item.number}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-tight">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Divider line (except after last row) */}
          {rowIndex < Math.ceil(items.length / 3) - 1 && (
            <div className="border-b border-gray-200 mb-1"></div>
          )}
        </div>
      ))}
    </div>
  </div>
);

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

const ExcelDataTable: React.FC<ExcelDataTableProps> = ({ title = "Performance Overview", data = [] }) => (
  <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
    {/* Title Section */}
    <div className="mb-6 ml-6 flex items-start justify-between">
      <h1 className="text-2xl font-medium text-black">{title}</h1>
      <div className="text-left max-w-md -ml-16">
        <p className="text-gray-600 text-xs">
          Comprehensive metrics and key performance indicators
        </p>
        <p className="text-gray-600 text-xs">
          showing quarterly growth trends and revenue optimization.
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
          {[
            { metric: "Total Revenue", value: "$648,000", change: "+18.2%" },
            { metric: "Average Monthly", value: "$54,000", change: "+12.5%" },
            { metric: "Peak Month", value: "$68,000", change: "December" },
            { metric: "Units Sold", value: "16,200", change: "+15.3%" },
            { metric: "Target Achievement", value: "94.2%", change: "-5.8%" }
          ].map((row, idx) => (
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

interface ExcelKPIDashboardProps {
  title?: string;
}

const ExcelKPIDashboard: React.FC<ExcelKPIDashboardProps> = ({ title = "Key Performance Indicators" }) => {
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
      
      {/* KPI Grid - 1x3 layout compatible with slides */}
      <div className="flex h-4/5 gap-4 ml-4">
        {/* Revenue KPI with chart */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="text-2xl font-medium text-black">$648K</div>
          <div className="text-gray-700 font-medium">Total Revenue</div>
          <div className="text-xs text-green-600 mb-2">+18% growth this quarter</div>
          <div className="flex-1 -ml-14">
            <ChartBlock {...revenueChartData} />
          </div>
        </div>

        {/* Units Sold KPI with chart */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="text-2xl font-medium text-black">16.2K</div>
          <div className="text-gray-700 font-medium">Units Sold</div>
          <div className="text-xs text-green-600 mb-2">+15% increase from last month</div>
          <div className="flex-1 -ml-14">
            <ChartBlock {...unitsChartData} />
          </div>
        </div>

        {/* Conversion Rate KPI with chart */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="text-2xl font-medium text-black">3.2%</div>
          <div className="text-gray-700 font-medium">Conversion Rate</div>
          <div className="text-xs text-green-600 mb-2">+12% improvement trend</div>
          <div className="flex-1 -ml-14">
            <ChartBlock {...conversionChartData} />
          </div>
        </div>

      </div>
    </div>
  );
};

// Testimonial Layout Component
const ExcelTestimonial: React.FC<{ title?: string }> = ({ 
  title = "Performance Overview" 
}) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12 flex flex-col" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black mb-2">{title}</h1>
        <div className="text-left max-w-lg">
          <p className="text-gray-600 text-xs">
            Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.
          </p>
        </div>
      </div>
      
      {/* Content Area - Metrics at Bottom */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex gap-12 mb-8 ml-8">
          {/* First Metric */}
          <div>
            <div className="text-8xl font-light text-gray-900 mb-2">80<span className="text-5xl">%</span></div>
            <div className="text-xs text-green-600 mb-1">+35% improvement this year</div>
            <p className="text-xs text-gray-700 max-w-32">
              Reduction in scheduling conflicts for global teams.
            </p>
          </div>
          
          {/* Second Metric */}
          <div>
            <div className="text-8xl font-light text-gray-900 mb-2">50<span className="text-5xl">%</span></div>
            <div className="text-xs text-green-600 mb-1">+22% faster than last quarter</div>
            <p className="text-xs text-gray-700 max-w-32">
              Faster meeting setup time due to automation.
            </p>
          </div>
          
          {/* Third Metric */}
          <div>
            <div className="text-8xl font-light text-gray-900 mb-2">95<span className="text-5xl">%</span></div>
            <div className="text-xs text-green-600 mb-1">+8% increase from last survey</div>
            <p className="text-xs text-gray-700 max-w-32">
              User satisfaction rate with the new platform.
            </p>
          </div>
          
          {/* Fourth Metric */}
          <div>
            <div className="text-8xl font-light text-gray-900 mb-2">3.2<span className="text-5xl">x</span></div>
            <div className="text-xs text-green-600 mb-1">+45% boost since implementation</div>
            <p className="text-xs text-gray-700 max-w-32">
              Increase in team productivity and efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Experience Driven Two Rows Layout
interface ExcelExperienceDrivenTwoRowsProps {
  title?: string;
}

const ExcelExperienceDrivenTwoRows: React.FC<ExcelExperienceDrivenTwoRowsProps> = ({ title = "Performance Overview" }) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Title Section */}
      <div className="mb-6 ml-6">
        <h1 className="text-2xl font-medium text-black mb-2">{title}</h1>
        <div className="text-left max-w-lg">
          <p className="text-gray-600 text-xs">
            Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.
          </p>
        </div>
      </div>

      <div className="flex h-full">
        
        {/* Full Width - Bullet Points in Two Rows */}
        <div className="w-full flex flex-col ml-6">
          {/* Bullet Points arranged in 2x2 grid */}
          <div className="flex-1 flex flex-col justify-center">
            {/* First Row - Items 1 and 2 */}
            <div className="flex gap-6 mb-8">
              {/* Item 1 */}
              <div className="w-1/2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      At Twindo, we obsess every day over perfecting our software solution, taking the operational.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Our dedicated team continuously refines and optimizes every aspect of our platform for maximum efficiency.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="w-1/2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Many companies have tried and failed to build their own software—it's a challenging.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Complex technical requirements and resource constraints often lead to incomplete or ineffective solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second Row - Items 3 and 4 */}
            <div className="flex gap-6">
              {/* Item 3 */}
              <div className="w-1/2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Twindo provides smart, user-friendly software specifically developed to streamline renewable.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Our intuitive interface and automated workflows reduce complexity while maintaining powerful functionality.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Item 4 */}
              <div className="w-1/2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Managing renewable energy operations is complex, but it shouldn't be a burden.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      We simplify operational challenges through intelligent automation and comprehensive monitoring tools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// How Savium Works Layout - Title on left, feature cards on right
interface ExcelHowItWorksProps {
  title?: string;
}

const ExcelHowItWorks: React.FC<ExcelHowItWorksProps> = ({ title = "How Savium works" }) => {
  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="flex h-full gap-8">
        
        {/* Left Side - Title */}
        <div className="w-1/3 flex flex-col justify-center ml-6">
          <h1 className="text-4xl font-medium text-black leading-tight mb-4">
            {title}
          </h1>
          <p className="text-gray-600 text-xs leading-relaxed">
            Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.
          </p>
        </div>
        
        {/* Right Side - Feature Cards in 2x2 Grid with Cross Dividers */}
        <div className="w-2/3 flex flex-col justify-center pr-6 relative">
          <div className="grid grid-cols-2 gap-8">
            
            {/* Card 1 - Goal-based planning */}
            <div className="p-4">
              <div className="mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h3 className="text-sm font-medium text-black mb-2">Goal-based planning</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Set, track, and achieve personal and business financial goals with ease.
              </p>
            </div>
            
            {/* Card 2 - Predictive analytics */}
            <div className="p-4">
              <div className="mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <h3 className="text-sm font-medium text-black mb-2">Predictive analytics</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Use data-driven insights to forecast cash flow and anticipate financial needs.
              </p>
            </div>
            
            {/* Card 3 - Smart budgeting */}
            <div className="p-4">
              <div className="mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h3 className="text-sm font-medium text-black mb-2">Smart budgeting</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Automatically organize income and expenses, giving every dollar a purpose.
              </p>
            </div>
            
            {/* Card 4 - Secure management */}
            <div className="p-4">
              <div className="mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h3 className="text-sm font-medium text-black mb-2">Secure management</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bank-level encryption and privacy standards ensure complete user trust.
              </p>
            </div>
            
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

// Back Cover Layout - Simple ending slide
interface ExcelBackCoverProps {
  title?: string;
  description?: string;
}

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

// Back Cover Left Aligned Layout - Duplicate with left alignment
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

// Experience Full Text Layout (No Image)
interface ExcelExperienceFullTextProps {
  title?: string;
}

const ExcelExperienceFullText: React.FC<ExcelExperienceFullTextProps> = ({ title = "Performance Overview" }) => {
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
              At Twindo, we obsess every day over perfecting our software solution, taking the operational complexity out of renewable energy management. Many companies have tried and failed to build their own software—it's a challenging endeavor that requires deep technical expertise and significant resources. Our dedicated team continuously refines and optimizes every aspect of our platform for maximum efficiency, ensuring that complex technical requirements don't become barriers to success.
            </p>
            <br />
            <p className="text-xs text-gray-700 leading-relaxed">
              Twindo provides smart, user-friendly software specifically developed to streamline renewable energy operations. Our intuitive interface and automated workflows reduce complexity while maintaining powerful functionality. Managing renewable energy operations is complex, but it shouldn't be a burden. We simplify operational challenges through intelligent automation and comprehensive monitoring tools, allowing organizations to focus on what matters most—sustainable energy production and growth.
            </p>
          </div>
        </div>
        
        {/* Right Side - Additional Description Paragraph */}
        <div className="w-1/2 flex flex-col ml-6">
          {/* Additional Description Text */}
          <div className="flex-1">
            <p className="text-xs text-gray-700 leading-relaxed">
              The renewable energy sector demands precision, reliability, and scalability in every operational aspect. Traditional approaches often fall short when dealing with the dynamic nature of renewable resources and the complexity of modern energy systems. Our comprehensive platform addresses these challenges by providing real-time monitoring, predictive analytics, and automated decision-making capabilities that adapt to changing conditions and optimize performance continuously.
            </p>
            <br />
            <p className="text-xs text-gray-700 leading-relaxed">
              Through years of industry experience and close collaboration with energy professionals, we've developed solutions that not only meet current operational needs but also anticipate future challenges. Our commitment to innovation ensures that clients benefit from cutting-edge technology while maintaining the stability and reliability essential for critical energy infrastructure. This approach has enabled organizations worldwide to achieve unprecedented levels of operational efficiency and sustainable growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Milestone Layout Component - Based on attached image structure with Results Testimonial styling
const ExcelMilestone: React.FC<{ title?: string }> = ({ 
  title = "Performance Overview" 
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
            500<span className="text-6xl">+</span>
          </div>
          <div className="text-lg text-green-600 flex items-center">
            <span className="mr-2">↑</span>
            <span>32.85% vs last year</span>
          </div>
        </div>
        
        {/* Description Texts - Side by Side */}
        <div className="flex gap-8">
          <div className="max-w-xs text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              Through strategic marketing initiatives and innovative product development, Quantum achieved remarkable growth by welcoming over 500 new clients, validating our position as a leading provider of quantum solutions.
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

interface ExcelTrendChartProps {
  title?: string;
}

const ExcelTrendChart: React.FC<ExcelTrendChartProps> = ({ title = "Revenue Performance by Quarter" }) => {
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

interface ExcelFullWidthChartProps {
  title?: string;
}

const ExcelFullWidthChart: React.FC<ExcelFullWidthChartProps> = ({ title = "Performance Overview" }) => {
  // Chart data for area chart with multiple series
  const chartData = {
    type: 'area' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { id: 'Revenue', data: [6500, 8200, 9500, 11200, 15800, 25000] },
      { id: 'GMV', data: [4200, 5800, 6800, 8500, 12200, 19500] }
    ],
    showLegend: true,
    legendPosition: 'bottom' as const,
    showGrid: true,
    stacked: false,
    animate: true,
    curved: true,
    showDots: true,
    className: 'w-full h-full'
  };

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="fullwidth-chart">
      {/* Title Section */}
      <div className="mb-6 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md -ml-12">
          {/* Overall Performance Metric */}
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-black mr-2">Overall performance</span>
            <span className="text-green-600 flex items-center">
              <span className="mr-1">↑</span>
              <span className="text-sm font-medium">+24.8%</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Comprehensive metrics and key performance indicators
          </p>
          <p className="text-gray-600 text-xs">
            showing quarterly growth trends and revenue optimization.
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

interface ExcelFullWidthChartWithTableProps {
  title?: string;
}

const ExcelFullWidthChartWithTable: React.FC<ExcelFullWidthChartWithTableProps> = ({ title = "Performance Overview" }) => {
  // Chart data for area chart with multiple series
  const chartData = {
    type: 'area' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { id: 'Revenue', data: [6500, 8200, 9500, 11200, 15800, 25000] },
      { id: 'GMV', data: [4200, 5800, 6800, 8500, 12200, 19500] }
    ],
    showLegend: true,
    legendPosition: 'bottom' as const,
    showGrid: true,
    stacked: false,
    animate: true,
    curved: true,
    showDots: true,
    className: 'w-full h-full'
  };

  // Data table showing chart values
  const tableData = [
    { month: 'Jan', revenue: 6500, gmv: 4200 },
    { month: 'Feb', revenue: 8200, gmv: 5800 },
    { month: 'Mar', revenue: 9500, gmv: 6800 },
    { month: 'Apr', revenue: 11200, gmv: 8500 },
    { month: 'May', revenue: 15800, gmv: 12200 },
    { month: 'Jun', revenue: 25000, gmv: 19500 }
  ];

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="fullwidth-chart-table">
      {/* Title Section */}
      <div className="mb-2 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md -ml-12">
          {/* Overall Performance Metric */}
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-black mr-2">Overall performance</span>
            <span className="text-green-600 flex items-center">
              <span className="mr-1">↑</span>
              <span className="text-sm font-medium">+24.8%</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Comprehensive metrics and key performance indicators
          </p>
          <p className="text-gray-600 text-xs">
            showing quarterly growth trends and revenue optimization.
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
              {tableData.map((row, idx) => (
                <th 
                  key={row.month}
                  className="text-black text-center p-2"
                  style={{ 
                    backgroundColor: '#fcfcfc',
                    borderBottom: '0.5px solid #f3f4f6',
                    ...(idx < tableData.length - 1 && { borderRight: '0.5px solid #f3f4f6' })
                  }}
                >
                  {row.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Revenue Row */}
            <tr>
              <td 
                className="text-black p-2"
                style={{ 
                  backgroundColor: '#fcfcfc',
                  borderRight: '0.5px solid #f3f4f6',
                  borderBottom: '0.5px solid #f3f4f6'
                }}
              >
                Revenue ($)
              </td>
              {tableData.map((row, idx) => (
                <td 
                  key={`revenue-${row.month}`}
                  className="text-black text-center p-2"
                  style={{ 
                    backgroundColor: '#fcfcfc',
                    borderBottom: '0.5px solid #f3f4f6',
                    ...(idx < tableData.length - 1 && { borderRight: '0.5px solid #f3f4f6' })
                  }}
                >
                  {row.revenue.toLocaleString()}
                </td>
              ))}
            </tr>
            {/* GMV Row */}
            <tr>
              <td 
                className="text-black p-2"
                style={{ 
                  backgroundColor: '#fcfcfc',
                  borderRight: '0.5px solid #f3f4f6'
                }}
              >
                GMV ($)
              </td>
              {tableData.map((row, idx) => (
                <td 
                  key={`gmv-${row.month}`}
                  className="text-black text-center p-2"
                  style={{ 
                    backgroundColor: '#fcfcfc',
                    ...(idx < tableData.length - 1 && { borderRight: '0.5px solid #f3f4f6' })
                  }}
                >
                  {row.gmv.toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ExcelComparisonLayoutProps {
  title?: string;
}

const ExcelComparisonLayout: React.FC<ExcelComparisonLayoutProps> = ({ title = "Performance Comparison" }) => {
  // Comparison chart data
  const comparisonChartData = {
    type: 'bar' as const,
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { id: 'Actual', data: [156, 168, 162, 162] },
      { id: 'Target', data: [165, 170, 175, 180] }
    ],
    showLegend: true,
    legendPosition: 'bottom' as const,
    legendSize: 'small' as const,
    showGrid: true,
    stacked: false,
    animate: true,
    className: 'w-full h-full'
  };

  return (
    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg p-6 pt-12" style={{ aspectRatio: '16/9', fontFamily: 'Helvetica, Arial, sans-serif' }} data-chart-container="comparison-chart">
      {/* Title Section */}
      <div className="mb-6 ml-6 flex items-start justify-between">
        <h1 className="text-2xl font-medium text-black">{title}</h1>
        <div className="text-left max-w-md ml-6">
          {/* Overall Performance Metric */}
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-black mr-2">Overall performance</span>
            <span className="text-green-600 flex items-center">
              <span className="mr-1">↑</span>
              <span className="text-sm font-medium">+24.8%</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Comprehensive metrics and key performance indicators
          </p>
          <p className="text-gray-600 text-xs">
            showing quarterly growth trends and revenue optimization.
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


// Foundation AI Models Layout - Based on attached image design
interface ExcelFoundationAIProps {
  title?: string;
}

const ExcelFoundationAI: React.FC<ExcelFoundationAIProps> = ({ title = "Foundation AI Models" }) => {
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
              Most of the world's top artificial intelligence has been trained on foundation models that can be adapted to a wide range of downstream tasks. During 2023, Most of the content in the industry focused on large language models and generative AI applications, but foundation models encompass much more than just text generation.
            </p>
          </div>
      </div>
      
        {/* Middle - Two Metrics at Top and Bottom */}
        <div className="w-1/4 flex flex-col justify-between h-full">
          {/* 42% Stat - Top */}
          <div className="text-left">
            <div className="text-9xl font-light text-black mb-2">42<span className="text-5xl">%</span></div>
            <p className="text-xs text-gray-600 leading-relaxed">
              of organizations say they have deployed and are using one or more AI models.
            </p>
          </div>
          
          {/* 86% Stat - Bottom */}
          <div className="text-left">
            <div className="text-9xl font-light text-black mb-2">86<span className="text-5xl">%</span></div>
            <p className="text-xs text-gray-600 leading-relaxed">
              of the organizations that have deployed AI models report that they are seeing a positive ROI.
            </p>
          </div>
        </div>
        
        {/* Right Side - Multi-series Bar Chart at Bottom */}
        <div className="w-2/5 flex flex-col justify-end">
          {/* ChartBlock Multi-Series Bar Chart */}
          <div className="h-80">
            <ChartBlock
              type="bar"
              labels={['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually']}
              series={[
                { id: 'Operations', data: [85, 65, 45, 25, 15] },
                { id: 'Analytics', data: [75, 55, 35, 20, 10] },
                { id: 'Automation', data: [65, 45, 25, 15, 8] }
              ]}
              showLegend={false}
              showGrid={true}
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

// Export buttons component
interface ExportButtonsProps {
  layoutName: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ layoutName }) => {
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

      // Clone the response to handle both JSON and text parsing
      const responseClone = response.clone();
      
      let data;
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          
          // Check if it's a Google OAuth configuration error
          if (errorData.error && errorData.error.includes('Google OAuth credentials not configured')) {
            alert(`Google Slides Export Setup Required\n\nTo enable Google Slides export, you need to:\n1. Set up Google OAuth credentials in Google Cloud Console\n2. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file\n\nSee the console for detailed setup instructions.`);
            return;
          }
          
          throw new Error(errorData.error || `API Error: ${response.status}`);
        } catch (jsonError) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
      }

      try {
        data = await responseClone.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const responseText = await response.text();
        console.error('Response text:', responseText);
        throw new Error('Server returned invalid JSON response');
      }
      
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
      case 'Full Width Chart':
        return {
          title: 'Performance Overview',
          chartData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [6500, 8200, 9500, 11200, 15800, 25000],
            series: [
              { name: 'Revenue', data: [6500, 8200, 9500, 11200, 15800, 25000] },
              { name: 'GMV', data: [4200, 5800, 6800, 8500, 12200, 19500] }
            ]
          },
          description: 'Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.'
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
      case 'Meeting Agenda':
        return {
          title: 'Index',
          items: [
            { number: "01", title: "Market Analysis", description: "Current market trends and opportunities" },
            { number: "02", title: "Product Updates", description: "Latest feature releases and roadmap" },
            { number: "03", title: "Financial Review", description: "Q4 performance and budget planning" },
            { number: "04", title: "Strategic Planning", description: "2025 goals and initiatives" },
            { number: "05", title: "Customer Insights", description: "Voice of customer feedback and analysis" },
            { number: "06", title: "Next Steps", description: "Action items and follow-up tasks" },
            { number: "07", title: "Team Updates", description: "Department progress and milestones" },
            { number: "08", title: "Budget Review", description: "Quarterly budget analysis and planning" },
            { number: "09", title: "Risk Assessment", description: "Current risks and mitigation strategies" },
            { number: "10", title: "Innovation Lab", description: "New technology and innovation updates" },
            { number: "11", title: "Partnership Review", description: "Strategic partnerships and alliances" },
            { number: "12", title: "Compliance Update", description: "Regulatory changes and compliance status" },
            { number: "13", title: "Market Expansion", description: "New market opportunities and strategies" },
            { number: "14", title: "Technology Stack", description: "Technical infrastructure and updates" },
            { number: "15", title: "Customer Success", description: "Customer satisfaction and retention metrics" },
            { number: "16", title: "Competitive Analysis", description: "Market positioning and competitor insights" },
            { number: "17", title: "Resource Planning", description: "Human resources and capacity planning" },
            { number: "18", title: "Action Items", description: "Summary and next steps assignment" }
          ]
        };
      case 'Table of Contents':
        return {
          title: 'Table of Contents',
          items: [
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
        };
      case 'Section Dividers':
        return {
          title: 'Executive summary',
          sectionNumber: '01',
          content: 'Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap'
        };
      case 'Foundation AI Models':
        return {
          title: 'Foundation AI Models',
          stats: [
            { percentage: '42%', description: 'of organizations say they have deployed and are using one or more AI models.' },
            { percentage: '86%', description: 'of the organizations that have deployed AI models report that they are seeing a positive ROI.' }
          ],
          content: 'Most of the world\'s top artificial intelligence has been trained on foundation models that can be adapted to a wide range of downstream tasks. During 2023, Most of the content in the industry focused on large language models and generative AI applications, but foundation models encompass much more than just text generation.',
          chartData: [
            { label: 'Daily', series1: 85, series2: 75, series3: 65 },
            { label: 'Weekly', series1: 65, series2: 55, series3: 45 },
            { label: 'Monthly', series1: 45, series2: 35, series3: 25 },
            { label: 'Quarterly', series1: 25, series2: 20, series3: 15 },
            { label: 'Annually', series1: 15, series2: 10, series3: 8 }
          ]
        };
      default:
        return { title: layoutName };
    }
  };

  return (
    <>
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
    </>
  );
};

const ExcelLayoutsPage: React.FC = () => {
  const [selectedLayout, setSelectedLayout] = useState('centered-cover');
  const [fileData, setFileData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file data extraction
  const handleDataExtracted = (extractedData: any, filename: string, fileType: string) => {
    console.log('📊 Excel data extracted:', { extractedData, filename, fileType });
    setFileData({ 
      type: fileType, 
      processedData: { structuredData: extractedData },
      fileName: filename 
    });
    setFileName(filename);
  };

  // Function to copy chart as image to clipboard
  const copyChartAsImage = async () => {
    try {
      // Find the chart container that includes both chart and legend
      let chartContainer: HTMLElement | null = null;
      
      // First, try to find the parent container that includes both chart and legend
      if (selectedLayout === 'fullwidth') {
        const layoutEl = document.querySelector('[data-chart-container="fullwidth-chart"]');
        // Look for the container that has both recharts and legend
        chartContainer = layoutEl?.querySelector('.w-full') as HTMLElement;
        if (!chartContainer) {
          chartContainer = layoutEl as HTMLElement;
        }
      } else if (selectedLayout === 'kpi') {
        const layoutEl = document.querySelector('[data-chart-container="kpi-dashboard"]');
        chartContainer = layoutEl?.querySelector('.w-full') as HTMLElement;
        if (!chartContainer) {
          chartContainer = layoutEl as HTMLElement;
        }
      } else if (selectedLayout === 'trend') {
        const layoutEl = document.querySelector('[data-chart-container="trend-chart"]');
        chartContainer = layoutEl?.querySelector('.w-full') as HTMLElement;
        if (!chartContainer) {
          chartContainer = layoutEl as HTMLElement;
        }
      } else if (selectedLayout === 'comparison') {
        const layoutEl = document.querySelector('[data-chart-container="comparison-chart"]');
        chartContainer = layoutEl?.querySelector('.w-full') as HTMLElement;
        if (!chartContainer) {
          chartContainer = layoutEl as HTMLElement;
        }
      }
      
      if (!chartContainer) {
        // Fallback: try to find the recharts responsive container parent
        const rechartsEl = document.querySelector('.recharts-responsive-container');
        if (rechartsEl) {
          // Go up to find parent that likely contains legend too
          chartContainer = rechartsEl.parentElement as HTMLElement;
        }
      }
      
      if (!chartContainer) {
        // Final fallback: try to find any chart container
        chartContainer = document.querySelector('[data-chart-container]') as HTMLElement;
      }
      
      if (!chartContainer) {
        throw new Error('Chart container not found. Please make sure a chart layout is selected and the chart has loaded.');
      }

      console.log('Found chart container:', chartContainer);

      // Wait longer for animations and ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a repaint to ensure everything is rendered
      chartContainer.style.transform = 'translateZ(0)';
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Force legend dots to be visible - target the actual legend structure
      // ChartBlock uses div elements with backgroundColor for legend dots
      const legendDots = chartContainer.querySelectorAll('.w-1\\.5.h-1\\.5.rounded-full, [class*="w-1.5"][class*="h-1.5"][class*="rounded-full"]');
      legendDots.forEach((dot, index) => {
        if (index === 0) {
          (dot as HTMLElement).style.backgroundColor = '#3b82f6'; // Blue for Revenue
          (dot as HTMLElement).style.setProperty('background-color', '#3b82f6', 'important');
        } else if (index === 1) {
          (dot as HTMLElement).style.backgroundColor = '#a855f7'; // Purple for GMV  
          (dot as HTMLElement).style.setProperty('background-color', '#a855f7', 'important');
        }
      });
      
      // Also try alternative selectors for legend dots
      const alternativeDots = chartContainer.querySelectorAll('div[style*="background-color"], .flex.items-center.gap-1 > div:first-child');
      alternativeDots.forEach((dot, index) => {
        const element = dot as HTMLElement;
        if (element.className.includes('rounded-full') || element.style.borderRadius === '50%') {
          if (index === 0) {
            element.style.backgroundColor = '#3b82f6';
            element.style.setProperty('background-color', '#3b82f6', 'important');
          } else if (index === 1) {
            element.style.backgroundColor = '#a855f7';
            element.style.setProperty('background-color', '#a855f7', 'important');
          }
        }
      });

      // Import html2canvas dynamically and handle oklch error
      let html2canvas;
      try {
        html2canvas = (await import('html2canvas')).default;
      } catch (importError) {
        console.error('Failed to import html2canvas:', importError);
        throw new Error('Failed to load image capture library');
      }

      // Create canvas with high quality settings
      const canvas = await html2canvas(chartContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for better rendering
        allowTaint: true, // Allow taint for better quality
        logging: false,
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        onclone: (clonedDoc) => {
          // Add CSS to override any problematic colors and improve rendering
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: inherit !important;
              background-color: inherit !important;
              border-color: inherit !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
              text-rendering: optimizeLegibility !important;
            }
            
            /* Legend dot colors - ChartBlock uses div elements for legend dots */
            .flex.items-center.gap-1 > div:first-child,
            .w-1\\.5.h-1\\.5.rounded-full,
            [class*="w-1.5"][class*="h-1.5"][class*="rounded-full"] {
              background-color: #3b82f6 !important; /* Default to blue */
            }
            
            /* Force specific legend dot colors based on position */
            .flex.justify-center.items-center.gap-4 > div:first-child .w-1\\.5.h-1\\.5.rounded-full,
            .flex.justify-center.items-center.gap-4 > div:first-child [class*="w-1.5"][class*="h-1.5"][class*="rounded-full"] {
              background-color: #3b82f6 !important; /* Blue for first item (Revenue) */
            }
            
            .flex.justify-center.items-center.gap-4 > div:last-child .w-1\\.5.h-1\\.5.rounded-full,
            .flex.justify-center.items-center.gap-4 > div:last-child [class*="w-1.5"][class*="h-1.5"][class*="rounded-full"] {
              background-color: #a855f7 !important; /* Purple for last item (GMV) */
            }
            
            /* Alternative selectors for different legend structures */
            div[style*="background-color"] {
              background-color: inherit !important;
            }
            
            /* Tailwind color overrides */
            .text-blue-600 { color: #2563eb !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-purple-500 { color: #a855f7 !important; }
            .bg-blue-600 { background-color: #2563eb !important; }
            .bg-green-600 { background-color: #16a34a !important; }
            .bg-purple-500 { background-color: #a855f7 !important; }
            .bg-white { background-color: #ffffff !important; }
            .text-black { color: #000000 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-900 { color: #111827 !important; }
            
            /* SVG rendering improvements */
            svg {
              shape-rendering: geometricPrecision !important;
            }
            
            /* Force all SVG elements to render properly */
            svg circle, svg rect, svg path {
              shape-rendering: geometricPrecision !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Also manually set legend dot colors if found - target div elements
          const legendDots = clonedDoc.querySelectorAll('.w-1\\.5.h-1\\.5.rounded-full, [class*="w-1.5"][class*="h-1.5"][class*="rounded-full"]');
          legendDots.forEach((dot, index) => {
            const element = dot as HTMLElement;
            if (index === 0) {
              element.style.backgroundColor = '#3b82f6'; // Blue for Revenue
              element.style.setProperty('background-color', '#3b82f6', 'important');
            } else if (index === 1) {
              element.style.backgroundColor = '#a855f7'; // Purple for GMV
              element.style.setProperty('background-color', '#a855f7', 'important');
            }
          });
          
          // Also try alternative approach for legend dots
          const alternativeDots = clonedDoc.querySelectorAll('div[style*="background-color"]');
          alternativeDots.forEach((dot, index) => {
            const element = dot as HTMLElement;
            if (element.className.includes('rounded-full') && (element.className.includes('w-1.5') || element.className.includes('h-1.5'))) {
              if (index === 0) {
                element.style.backgroundColor = '#3b82f6';
                element.style.setProperty('background-color', '#3b82f6', 'important');
              } else if (index === 1) {
                element.style.backgroundColor = '#a855f7';
                element.style.setProperty('background-color', '#a855f7', 'important');
              }
            }
          });
        }
      });

      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Check if clipboard API is available
            if (navigator.clipboard && window.ClipboardItem) {
              // Copy to clipboard
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ]);
              
              // Show success feedback
              alert(`${selectedLayoutName} copied to clipboard! You can now paste it into Google Slides.`);
            } else {
              throw new Error('Clipboard API not supported');
            }
          } catch (clipboardError) {
            console.error('Failed to copy to clipboard:', clipboardError);
            // Fallback: download the image
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedLayoutName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert(`${selectedLayoutName} downloaded in high quality! You can upload it to Google Slides.`);
          }
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/png', 1.0); // Maximum quality PNG
      
    } catch (error) {
      console.error('Failed to copy chart:', error);
      
      // If the error is about oklch, provide a specific message
      if (error instanceof Error && error.message && error.message.includes('oklch')) {
        alert('Browser compatibility issue detected. The chart will be downloaded instead of copied to clipboard.');
        // Force download fallback
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 800;
          canvas.height = 600;
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.fillText('Chart export failed due to browser compatibility.', 50, 100);
            ctx.fillText('Please try using a different browser or update your current browser.', 50, 150);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${selectedLayoutName.replace(/\s+/g, '_')}_error.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      } else {
        alert(`Failed to copy chart: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    }
  };

  // Generate dynamic props based on Excel data
  const generateDynamicProps = (layoutId: string, fileData: any) => {
    if (!fileData || !fileData.processedData?.structuredData) {
      return {}; // Return empty props if no data
    }

    const data = fileData.processedData.structuredData;
    const sheets = data.sheets || {};
    const sheetNames = Object.keys(sheets);
    
    if (sheetNames.length === 0) {
      return {};
    }

    // Get the first sheet with data
    const firstSheetName = sheetNames[0];
    const firstSheet = sheets[firstSheetName];
    const sheetData = firstSheet?.objects || [];

    console.log('🔧 Generating dynamic props for:', layoutId, 'with data:', sheetData.slice(0, 3));

    switch (layoutId) {
      case 'centered-cover':
        return {
          title: `${fileName.replace(/\.(xlsx?|csv)$/i, '')} Analysis`,
          description: `Comprehensive analysis of ${sheetData.length} data points from ${firstSheetName}`
        };

      case 'table':
        if (sheetData.length > 0) {
          const headers = Object.keys(sheetData[0]);
          return {
            title: firstSheetName,
            data: sheetData.slice(0, 10).map((row: any) => {
              const formattedRow: any = {};
              headers.forEach(header => {
                formattedRow[header] = row[header];
              });
              return formattedRow;
            })
          };
        }
        break;

      case 'kpi':
        if (sheetData.length > 0) {
          const numericColumns = Object.keys(sheetData[0]).filter(key => {
            const value = sheetData[0][key];
            return !isNaN(parseFloat(value)) && isFinite(value);
          });

          if (numericColumns.length >= 2) {
            const col1 = numericColumns[0];
            const col2 = numericColumns[1];
            const sum1 = sheetData.reduce((sum: number, row: any) => sum + (parseFloat(row[col1]) || 0), 0);
            const sum2 = sheetData.reduce((sum: number, row: any) => sum + (parseFloat(row[col2]) || 0), 0);
            const avg1 = sum1 / sheetData.length;
            const avg2 = sum2 / sheetData.length;

            return {
              title: `${firstSheetName} KPIs`,
              kpiCards: [
                { title: col1, value: sum1.toLocaleString(), subtitle: 'Total', trend: '+15%', icon: '📊' },
                { title: col2, value: sum2.toLocaleString(), subtitle: 'Total', trend: '+12%', icon: '📈' },
                { title: 'Average ' + col1, value: avg1.toFixed(2), subtitle: 'Per record', trend: '+8%', icon: '📋' },
                { title: 'Records', value: sheetData.length.toString(), subtitle: 'Total count', trend: '+100%', icon: '📦' }
              ]
            };
          }
        }
        break;

      case 'trend':
      case 'fullwidth':
        if (sheetData.length > 0) {
          const numericColumns = Object.keys(sheetData[0]).filter(key => {
            const value = sheetData[0][key];
            return !isNaN(parseFloat(value)) && isFinite(value);
          });

          if (numericColumns.length >= 1) {
            const labels = sheetData.map((row: any, index: number) => {
              // Try to find a date/time column or use index
              const dateColumns = Object.keys(row).filter(key => 
                key.toLowerCase().includes('date') || 
                key.toLowerCase().includes('time') ||
                key.toLowerCase().includes('month') ||
                key.toLowerCase().includes('year')
              );
              
              if (dateColumns.length > 0) {
                return String(row[dateColumns[0]]);
              }
              return `Point ${index + 1}`;
            }).slice(0, 12); // Limit to 12 data points

            const series = numericColumns.slice(0, 2).map((col, index) => ({
              id: col,
              data: sheetData.slice(0, 12).map((row: any) => parseFloat(row[col]) || 0),
              color: index === 0 ? '#4A3AFF' : '#C893FD'
            }));

            return {
              title: `${firstSheetName} Trends`,
              description: `Data visualization from ${fileName}`,
              chart: {
                type: 'area',
                labels,
                series,
                showLegend: true,
                showGrid: true,
                animate: true,
                curved: true,
                legendPosition: 'bottom' as const
              }
            };
          }
        }
        break;

      default:
        return {};
    }

    return {};
  };

  const layoutCategories = {
    'Covers': [
      { id: 'centered-cover', name: 'Centered Cover', component: ExcelCenteredCover },
      { id: 'bottom-cover', name: 'Bottom Cover', component: ExcelBottomCover },
      { id: 'left-cover', name: 'Left Cover', component: ExcelLeftCover }
    ],
    'Index': [
      { id: 'index', name: 'Meeting Agenda', component: ExcelIndex },
      { id: 'table-of-contents', name: 'Table of Contents', component: ExcelTableOfContents }
    ],
    'Data Layouts': [
      { id: 'table', name: 'Data Table', component: ExcelDataTable },
      { id: 'kpi', name: 'KPI Dashboard', component: ExcelKPIDashboard },
      { id: 'trend', name: 'Trend Chart', component: ExcelTrendChart },
      { id: 'fullwidth', name: 'Full Width Chart', component: ExcelFullWidthChart },
      { id: 'fullwidth-table', name: 'Chart with Data Table', component: ExcelFullWidthChartWithTable },
      { id: 'comparison', name: 'Comparison View', component: ExcelComparisonLayout },
      { id: 'foundation-ai', name: 'Foundation AI Models', component: ExcelFoundationAI },
      { id: 'testimonial', name: 'Results Testimonial', component: ExcelTestimonial },
      { id: 'milestone', name: 'Milestone Achievement', component: ExcelMilestone }
    ],
    'Interpretation Layouts': [
      { id: 'experience-full-text', name: 'Experience Full Text', component: ExcelExperienceFullText },
      { id: 'experience-two-rows', name: 'Experience Two Rows', component: ExcelExperienceDrivenTwoRows },
      { id: 'how-it-works', name: 'How It Works', component: ExcelHowItWorks }
    ],
    'Back Cover Layouts': [
      { id: 'back-cover', name: 'Back Cover', component: ExcelBackCover },
      { id: 'back-cover-left', name: 'Back Cover Left', component: ExcelBackCoverLeft }
    ]
  };

  // Flatten layouts for backward compatibility
  const layouts = Object.values(layoutCategories).flat();

  const SelectedComponent = layouts.find(l => l.id === selectedLayout)?.component || ExcelDataTable;
  const selectedLayoutName = layouts.find(l => l.id === selectedLayout)?.name || 'Data Table';
  
  // Generate dynamic props based on Excel data
  const dynamicProps = generateDynamicProps(selectedLayout, fileData);

  return (
    <div className="min-h-screen bg-gray-100 p-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel Presentation Layouts</h1>
          <p className="text-gray-600">PowerPoint & Google Slides compatible layouts for Excel data visualization</p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Excel File</h2>
            <p className="text-gray-600 mb-4">Upload an Excel file to see your data applied to the layouts below. The layouts will automatically adapt to your data structure.</p>
            
            <FileUpload 
              onDataExtracted={handleDataExtracted}
              className="mb-4"
            />
            
            {fileData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">File processed successfully!</span>
                </div>
                <p className="text-green-700 mt-1">
                  <strong>{fileName}</strong> - Data is now being applied to the layouts below. 
                  {fileData.processedData?.structuredData?.sheets && 
                    ` Found ${Object.keys(fileData.processedData.structuredData.sheets).length} sheet(s) with data.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Layout Selector - Organized by Categories */}
        <div className="mb-8">
          {Object.entries(layoutCategories).map(([category, categoryLayouts]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{category}</h3>
              <div className="flex flex-wrap gap-3">
                {categoryLayouts.map((layout) => (
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
          ))}
        </div>

        {/* Layout Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Preview: {selectedLayoutName}
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">16:9 aspect ratio • PowerPoint/Google Slides compatible</p>
              {fileData ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Using Real Data
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Static Preview
                </div>
              )}
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-3 mb-4">
            <ExportButtons layoutName={selectedLayoutName} />
            {/* Copy Chart Button - only show for layouts with charts */}
            {(selectedLayout === 'kpi' || selectedLayout === 'trend' || selectedLayout === 'fullwidth' || selectedLayout === 'comparison') && (
              <button
                onClick={copyChartAsImage}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
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
          
          {/* Layout Container - Fixed 16:9 aspect ratio */}
          <div className="w-full max-w-4xl mx-auto">
            <SelectedComponent {...dynamicProps} />
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
};

export default ExcelLayoutsPage;
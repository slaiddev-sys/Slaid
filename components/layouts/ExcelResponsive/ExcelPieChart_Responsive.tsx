import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelPieChartResponsiveProps {
  title?: string;
  chartData?: {
    type: 'pie';
    labels: string[]; // Changed from 'categories' to 'labels' for consistency with other charts
    series: Array<{ id: string; data: number[]; color?: string }>; // Changed 'name' to 'id' and made it an array of values
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    animate?: boolean;
  };
  insights?: string[];
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelPieChart_Responsive: React.FC<ExcelPieChartResponsiveProps> = ({ 
  title = "Distribution Analysis",
  chartData = {
    type: 'pie' as const,
    labels: ['Revolut', 'Alimentación', 'Ocio', 'Transporte', 'Suscripciones'],
    series: [
      { id: 'Revolut', data: [39.5], color: '#3b82f6' },
      { id: 'Alimentación', data: [20.9], color: '#8b5cf6' },
      { id: 'Ocio', data: [14.9], color: '#10b981' },
      { id: 'Transporte', data: [8.4], color: '#f59e0b' },
      { id: 'Suscripciones', data: [16.3], color: '#ef4444' }
    ],
    showLegend: true,
    legendPosition: 'bottom' as const,
    animate: true
  },
  insights = [
    "The largest category represents the dominant portion of the total distribution.",
    "Category diversity shows balanced resource allocation across multiple segments.",
    "Smaller categories still contribute meaningful value to the overall composition.",
    "Distribution pattern indicates strategic prioritization of key focus areas."
  ],
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const insightFontSize = `${16 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const chartMarginLeft = `${-16 * scaleFactor}px`;
  const paddingRight = `${24 * scaleFactor}px`;
  const paddingLeft = `${16 * scaleFactor}px`;
  const insightSpacing = `${12 * scaleFactor}px`;
  const bulletMarginRight = `${8 * scaleFactor}px`;
  const bulletMarginTop = `${4 * scaleFactor}px`;

  return (
    <div 
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        paddingTop: paddingTop,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
      data-chart-container="pie-chart"
    >
      {/* Title */}
      <div style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h2 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h2>
      </div>
      
      <div className="flex" style={{ height: '83.33%' }}>
        {/* Pie Chart Section - Left 66.67% */}
        <div className="w-2/3" style={{ paddingRight: paddingRight, marginLeft: chartMarginLeft }}>
          <ChartBlock {...chartData} className="w-full h-full" />
        </div>
        
        {/* Insights Panel - Right 33.33% */}
        <div className="w-1/3 border-l border-gray-200" style={{ paddingLeft: paddingLeft }}>
          {/* Insights List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: insightSpacing }}>
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start">
                <span 
                  className="text-black flex-shrink-0" 
                  style={{ 
                    fontSize: insightFontSize, 
                    marginRight: bulletMarginRight,
                    marginTop: bulletMarginTop
                  }}
                >
                  •
                </span>
                <p className="text-gray-800" style={{ fontSize: insightFontSize }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelPieChart_Responsive;


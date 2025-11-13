import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelPieChartResponsiveProps {
  title?: string;
  chartData?: {
    type: 'pie';
    categories: string[];
    series: Array<{ name: string; data: number[]; color?: string }>;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    animate?: boolean;
  };
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelPieChart_Responsive: React.FC<ExcelPieChartResponsiveProps> = ({ 
  title = "Distribution Analysis",
  chartData = {
    type: 'pie' as const,
    categories: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    series: [
      { name: 'Distribution', data: [800, 150, 50, 300, 1050], color: '#16A34A' }
    ],
    showLegend: true,
    legendPosition: 'bottom' as const,
    animate: true
  },
  description = "Comprehensive breakdown of data distribution across different categories.",
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const maxDescriptionWidth = `${448 * scaleFactor}px`;
  const descriptionMarginLeft = `${-48 * scaleFactor}px`;

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
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: maxDescriptionWidth, marginLeft: descriptionMarginLeft }}>
          {description.split('\n').map((line, index) => (
            <p key={index} className="text-gray-600" style={{ fontSize: descriptionFontSize }}>
              {line || description}
            </p>
          ))}
        </div>
      </div>
      
      {/* Pie Chart */}
      <div className="w-full flex items-center justify-center" style={{ height: '80%' }}>
        <ChartBlock {...chartData} className="w-full h-full" />
      </div>
    </div>
  );
};

export default ExcelPieChart_Responsive;


import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelFullWidthChartResponsiveProps {
  title?: string;
  chartData?: {
    type: 'area' | 'line' | 'bar';
    labels: string[];
    series: Array<{ id: string; data: number[]; color?: string }>;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    showGrid?: boolean;
    stacked?: boolean;
    animate?: boolean;
    curved?: boolean;
    showDots?: boolean;
  };
  overallPerformance?: string;
  performanceLabel?: string;
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelFullWidthChart_Responsive: React.FC<ExcelFullWidthChartResponsiveProps> = ({ 
  title = "Performance Overview",
  chartData = {
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
    showDots: true
  },
  overallPerformance = "+24.8%",
  performanceLabel = "Overall performance",
  description = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const metricFontSize = `${14 * scaleFactor}px`;
  const performanceFontSize = `${14 * scaleFactor}px`;
  const descriptionFontSize = `${14 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const performanceMarginBottom = `${8 * scaleFactor}px`;
  const performanceMarginRight = `${8 * scaleFactor}px`;
  const arrowMarginRight = `${4 * scaleFactor}px`;
  const maxDescriptionWidth = `${448 * scaleFactor}px`;
  const descriptionMarginLeft = `${-48 * scaleFactor}px`;

  // Calculate growth from first to last value (same logic as Trend Chart)
  const firstValue = chartData.series[0].data[0] as number;
  const lastValue = chartData.series[0].data[chartData.series[0].data.length - 1] as number;
  const growthPercentage = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = growthPercentage > 0;
  const calculatedPerformance = `${isPositive ? '+' : ''}${growthPercentage.toFixed(1)}%`;
  
  // Use calculated performance if overallPerformance is not provided or is default
  const displayPerformance = (overallPerformance && overallPerformance !== "+24.8%") ? overallPerformance : calculatedPerformance;

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
      data-chart-container="fullwidth-chart"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: maxDescriptionWidth, marginLeft: descriptionMarginLeft }}>
          {/* Overall Performance Metric - Only show if overallPerformance is provided */}
          {displayPerformance && (
            <div className="flex items-center" style={{ marginBottom: performanceMarginBottom }}>
              <span className="font-medium text-black" style={{ fontSize: metricFontSize, marginRight: performanceMarginRight }}>
                {performanceLabel}
              </span>
              <span className={`${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                <span style={{ marginRight: arrowMarginRight }}>{isPositive ? '↑' : '↓'}</span>
                <span className="font-medium" style={{ fontSize: performanceFontSize }}>{displayPerformance}</span>
              </span>
            </div>
          )}
          {description.split('\n').map((line, index) => (
            <p key={index} className="text-gray-600" style={{ fontSize: descriptionFontSize }}>
              {line || description}
            </p>
          ))}
        </div>
      </div>
      
      {/* Full Width Chart */}
      <div className="w-full" style={{ height: '80%' }}>
        <ChartBlock {...chartData} className="w-full h-full" />
      </div>
    </div>
  );
};

export default ExcelFullWidthChart_Responsive;


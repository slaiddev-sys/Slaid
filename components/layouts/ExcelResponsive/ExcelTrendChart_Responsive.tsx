import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelTrendChartResponsiveProps {
  title?: string;
  chartData?: {
    type: 'bar' | 'line' | 'area';
    labels: string[];
    series: Array<{ id: string; data: number[]; color?: string }>;
    showLegend?: boolean;
    showGrid?: boolean;
    stacked?: boolean;
    animate?: boolean;
  };
  insights?: string[];
  performanceLabel?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelTrendChart_Responsive: React.FC<ExcelTrendChartResponsiveProps> = ({ 
  title = "Revenue Performance by Quarter",
  chartData = {
    type: 'bar' as const,
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
    series: [{ id: 'Performance', data: [52.2, 58.6, 43.8, 47.8] }],
    showLegend: true,
    legendPosition: 'bottom' as const,
    legendSize: 'small' as const,
    showGrid: true,
    stacked: false,
    animate: true
  },
  insights = [
    "Q2 shows strongest performance with 58.6% conversion rate, indicating optimal market conditions and effective strategies.",
    "Q3 performance dip to 43.8% suggests seasonal challenges or market saturation requiring strategic adjustment.",
    "Consistent variability across quarters shows execution matters more than timing, with Q2 achieving 34% higher performance than Q3.",
    "Recovery trend in Q4 (47.8%) indicates successful strategic adjustments and potential for continued improvement."
  ],
  performanceLabel = "Overall Performance",
  canvasWidth,
  canvasHeight
}) => {
  // Use container size if not provided, otherwise use provided dimensions
  const [containerWidth, setContainerWidth] = React.useState(canvasWidth || 1280);
  const [containerHeight, setContainerHeight] = React.useState(canvasHeight || 720);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!canvasWidth || !canvasHeight) {
      const updateSize = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [canvasWidth, canvasHeight]);

  // Calculate responsive scale factor
  const scaleFactor = Math.min(containerWidth / 1280, containerHeight / 720);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const metricFontSize = `${24 * scaleFactor}px`;
  const labelFontSize = `${14 * scaleFactor}px`;
  const insightFontSize = `${16 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const chartMarginLeft = `${-16 * scaleFactor}px`;
  const paddingRight = `${24 * scaleFactor}px`;
  const paddingLeft = `${16 * scaleFactor}px`;
  const insightSpacing = `${12 * scaleFactor}px`;
  const bulletMarginRight = `${8 * scaleFactor}px`;
  const bulletMarginTop = `${4 * scaleFactor}px`;

  // Calculate growth from first to last value
  const firstValue = chartData.series[0].data[0] as number;
  const lastValue = chartData.series[0].data[chartData.series[0].data.length - 1] as number;
  const growthPercentage = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = growthPercentage > 0;
  const formattedGrowth = `${isPositive ? '+' : ''}${growthPercentage.toFixed(1)}%`;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        paddingTop: paddingTop
      }}
      data-chart-container="trend-chart"
    >
      {/* Title */}
      <div style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h2 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h2>
      </div>
      
      <div className="flex" style={{ height: '83.33%' }}>
        {/* Chart Section - Left 66.67% */}
        <div className="w-2/3" style={{ paddingRight: paddingRight, marginLeft: chartMarginLeft }}>
          <ChartBlock {...chartData} className="w-full h-full" />
        </div>
        
        {/* Insights Panel - Right 33.33% */}
        <div className="w-1/3 border-l border-gray-200" style={{ paddingLeft: paddingLeft }}>
          {/* Growth Metrics Section - Only show if overallPerformance is provided */}
          {formattedGrowth && (
            <div style={{ marginBottom: marginBottom }}>
              <h3 className="font-semibold text-gray-900" style={{ fontSize: labelFontSize, marginBottom: `${4 * scaleFactor}px` }}>
                {performanceLabel}
              </h3>
              <div className="flex items-center" style={{ gap: `${8 * scaleFactor}px` }}>
                <span className="font-medium text-black" style={{ fontSize: metricFontSize }}>{formattedGrowth}</span>
                <span className={`${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                  <span style={{ marginRight: `${4 * scaleFactor}px` }}>{isPositive ? '↑' : '↓'}</span>
                </span>
              </div>
            </div>
          )}

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

export default ExcelTrendChart_Responsive;


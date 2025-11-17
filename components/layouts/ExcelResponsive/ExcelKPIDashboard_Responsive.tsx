import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelKPIDashboardResponsiveProps {
  title?: string;
  description?: string;
  kpiCards?: Array<{
    value: string;
    label: string;
    subtitle: string;
    trend?: string;
    chartData: {
      type: 'area' | 'line' | 'bar';
      labels: string[];
      series: Array<{ id: string; data: number[]; color?: string }>;
      showLegend?: boolean;
      showGrid?: boolean;
      stacked?: boolean;
      curved?: boolean;
      animate?: boolean;
      showDots?: boolean;
    };
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelKPIDashboard_Responsive: React.FC<ExcelKPIDashboardResponsiveProps> = ({ 
  title = "Key Performance Indicators",
  description = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  kpiCards = [
    {
      value: "$648K",
      label: "Total Revenue",
      subtitle: "+18% growth this quarter",
      chartData: {
        type: 'area' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [{ id: 'Revenue', data: [42, 48, 52, 58, 62, 68] }],
        showLegend: true,
        legendPosition: 'bottom' as const,
        legendSize: 'small' as const,
        showGrid: false,
        stacked: false,
        curved: true,
        animate: true,
        showDots: false
      }
    },
    {
      value: "16.2K",
      label: "Units Sold",
      subtitle: "+15% increase from last month",
      chartData: {
        type: 'line' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [{ id: 'Units', data: [1200, 1350, 1180, 1450, 1520, 1620] }],
        showLegend: true,
        legendPosition: 'bottom' as const,
        legendSize: 'small' as const,
        showGrid: false,
        curved: false,
        animate: true,
        showDots: false
      }
    },
    {
      value: "3.2%",
      label: "Conversion Rate",
      subtitle: "+12% improvement trend",
      chartData: {
        type: 'bar' as const,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [{ id: 'Conversion', data: [2.4, 3.1, 2.8, 3.5, 4.2, 3.9] }],
        showLegend: true,
        legendPosition: 'bottom' as const,
        legendSize: 'small' as const,
        showGrid: false,
        stacked: false,
        animate: true
      }
    }
  ],
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
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const valueFontSize = `${24 * scaleFactor}px`;
  const labelFontSize = `${14 * scaleFactor}px`;
  const subtitleFontSize = `${12 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const gap = `${16 * scaleFactor}px`;
  const cardPadding = `${16 * scaleFactor}px`;
  const chartHeight = `${64 * scaleFactor}px`;
  const chartMarginLeft = `${-56 * scaleFactor}px`;
  const chartMarginBottom = `${8 * scaleFactor}px`;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        paddingTop: paddingTop,
        
      }}
      data-chart-container="kpi-dashboard"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: `${448 * scaleFactor}px`, marginLeft: `${-48 * scaleFactor}px` }}>
          <p className="text-gray-600" style={{ fontSize: descriptionFontSize }}>
            {description}
          </p>
        </div>
      </div>
      
      {/* KPI Grid - 1x3 layout */}
      <div className="flex" style={{ height: '80%', gap: gap, marginLeft: `${16 * scaleFactor}px` }}>
        {kpiCards.map((card, index) => {
          // Parse the value to extract number and suffix
          const valueStr = String(card.value);
          const match = valueStr.match(/^([\d,.]+)([KMB%]?)$/i);
          const numericValue = match ? match[1] : valueStr;
          const suffix = match ? match[2] : '';
          
          return (
            <div key={index} className="flex-1 flex flex-col" style={{ padding: cardPadding }}>
              <div className="font-medium text-black" style={{ fontSize: valueFontSize }}>
                {numericValue}
                {suffix && <span style={{ fontSize: `${16 * scaleFactor}px` }}>{suffix}</span>}
              </div>
              <div className="text-gray-700 font-medium" style={{ fontSize: labelFontSize }}>{card.label}</div>
              <div className="text-green-600" style={{ fontSize: subtitleFontSize, marginBottom: chartMarginBottom }}>{card.subtitle}</div>
              <div className="flex-1" style={{ marginLeft: chartMarginLeft }}>
                <ChartBlock {...card.chartData} className="w-full" style={{ height: chartHeight }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExcelKPIDashboard_Responsive;


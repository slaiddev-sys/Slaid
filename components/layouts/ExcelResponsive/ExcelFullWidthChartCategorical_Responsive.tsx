import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelFullWidthChartCategoricalResponsiveProps {
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
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelFullWidthChartCategorical_Responsive: React.FC<ExcelFullWidthChartCategoricalResponsiveProps> = ({ 
  title = "Category Distribution",
  chartData = {
    type: 'bar' as const,
    labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    series: [
      { id: 'Values', data: [800, 150, 50, 300, 1050] }
    ],
    showLegend: true,
    legendPosition: 'bottom' as const,
    legendSize: 'small' as const,
    showGrid: true,
    stacked: false,
    animate: true,
    curved: false,
    showDots: false
  },
  description = "Comprehensive breakdown of categorical data distribution across different segments.",
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
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const maxDescriptionWidth = `${448 * scaleFactor}px`;
  const descriptionMarginLeft = `${-48 * scaleFactor}px`;

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
      data-chart-container="fullwidth-chart-categorical"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: maxDescriptionWidth, marginLeft: descriptionMarginLeft }}>
          {/* NO Performance Metric - This is for categorical data */}
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

export default ExcelFullWidthChartCategorical_Responsive;


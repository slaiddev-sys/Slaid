import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelComparisonLayoutResponsiveProps {
  title?: string;
  chartData?: {
    type: 'bar' | 'line' | 'area';
    labels: string[];
    series: Array<{ id: string; data: number[]; color?: string }>;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    legendSize?: 'small' | 'medium' | 'large';
    showGrid?: boolean;
    stacked?: boolean;
    animate?: boolean;
  };
  actualData?: Array<{ metric: string; value: string }>;
  targetData?: Array<{ metric: string; value: string }>;
  actualTableTitle?: string;
  targetTableTitle?: string;
  metricColumnHeader?: string;
  actualColumnHeader?: string;
  targetColumnHeader?: string;
  overallPerformance?: string;
  performanceLabel?: string;
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelComparisonLayout_Responsive: React.FC<ExcelComparisonLayoutResponsiveProps> = ({ 
  title = "Performance Comparison",
  chartData = {
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
    animate: true
  },
  actualData = [
    { metric: "Q1", value: "$156K" },
    { metric: "Q2", value: "$168K" },
    { metric: "Q3", value: "$162K" },
    { metric: "Q4", value: "$162K" },
    { metric: "Total", value: "$648K" }
  ],
  targetData = [
    { metric: "Q1", value: "$165K" },
    { metric: "Q2", value: "$170K" },
    { metric: "Q3", value: "$175K" },
    { metric: "Q4", value: "$180K" },
    { metric: "Total", value: "$690K" }
  ],
  actualTableTitle = "Actual Performance",
  targetTableTitle = "Target Performance",
  metricColumnHeader = "Quarter",
  actualColumnHeader = "Revenue",
  targetColumnHeader = "Target",
  overallPerformance = "+24.8%",
  performanceLabel = "Overall performance",
  description = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
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
  const tableTitleFontSize = `${14 * scaleFactor}px`;
  const metricFontSize = `${14 * scaleFactor}px`;
  const performanceFontSize = `${14 * scaleFactor}px`;
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const tableFontSize = `${12 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const performanceMarginBottom = `${8 * scaleFactor}px`;
  const performanceMarginRight = `${8 * scaleFactor}px`;
  const arrowMarginRight = `${4 * scaleFactor}px`;
  const gap = `${24 * scaleFactor}px`;
  const tableGap = `${16 * scaleFactor}px`;
  const tableTitleMarginBottom = `${8 * scaleFactor}px`;
  const cellPaddingVertical = `${8 * scaleFactor}px`;
  const cellPaddingHorizontal = `${12 * scaleFactor}px`;
  const borderWidth = `${0.5 * scaleFactor}px`;

  // Calculate performance gap: (Actual Total - Target Total) / Target Total * 100
  // Find "Total" rows in actualData and targetData
  const actualTotal = actualData?.find(item => item.metric.toLowerCase() === 'total')?.value || '';
  const targetTotal = targetData?.find(item => item.metric.toLowerCase() === 'total')?.value || '';
  
  // Extract numeric values (remove $, K, commas, etc.)
  const parseValue = (val: string): number => {
    const numStr = val.replace(/[$,K]/g, '');
    const parsed = parseFloat(numStr);
    // If 'K' was present, multiply by 1000
    return val.includes('K') ? parsed * 1000 : parsed;
  };
  
  const actualNum = actualTotal ? parseValue(actualTotal) : 0;
  const targetNum = targetTotal ? parseValue(targetTotal) : 0;
  
  let growthPercentage = 0;
  if (targetNum !== 0) {
    growthPercentage = ((actualNum - targetNum) / targetNum) * 100;
  }
  
  const isPositive = growthPercentage > 0;
  const calculatedPerformance = `${isPositive ? '+' : ''}${growthPercentage.toFixed(1)}%`;
  
  // Use calculated performance if overallPerformance is not provided or is default
  const displayPerformance = (overallPerformance && overallPerformance !== "+24.8%") ? overallPerformance : calculatedPerformance;

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
      data-chart-container="comparison-chart"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: `${448 * scaleFactor}px`, marginLeft: `${24 * scaleFactor}px` }}>
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
      
      <div className="flex" style={{ height: '83.33%', gap: gap }}>
        {/* Chart Section - Left 60% */}
        <div className="w-3/5">
          <ChartBlock {...chartData} className="w-full h-full" />
        </div>
        
        {/* Data Tables - Right 40% */}
        <div className="w-2/5 grid grid-cols-1" style={{ gap: tableGap, marginLeft: marginLeft }}>
          {/* Actual Performance */}
          <div className="overflow-hidden">
            <h3 className="text-black text-left font-bold" style={{ fontSize: tableTitleFontSize, marginBottom: tableTitleMarginBottom }}>
              {actualTableTitle}
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc' }} className="text-black">
                  <th 
                    className="text-left" 
                    style={{ 
                      paddingTop: cellPaddingVertical,
                      paddingBottom: cellPaddingVertical,
                      paddingLeft: cellPaddingHorizontal,
                      paddingRight: cellPaddingHorizontal,
                      fontSize: tableFontSize,
                      borderRight: `${borderWidth} solid #f3f4f6`, 
                      borderBottom: `${borderWidth} solid #f3f4f6` 
                    }}
                  >
                    {metricColumnHeader}
                  </th>
                  <th 
                    className="text-left" 
                    style={{ 
                      paddingTop: cellPaddingVertical,
                      paddingBottom: cellPaddingVertical,
                      paddingLeft: cellPaddingHorizontal,
                      paddingRight: cellPaddingHorizontal,
                      fontSize: tableFontSize,
                      borderBottom: `${borderWidth} solid #f3f4f6` 
                    }}
                  >
                    {actualColumnHeader}
                  </th>
                </tr>
              </thead>
              <tbody>
                {actualData.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: '#fcfcfc' }}>
                    <td 
                      className="text-black" 
                      style={{ 
                        paddingTop: cellPaddingVertical,
                        paddingBottom: cellPaddingVertical,
                        paddingLeft: cellPaddingHorizontal,
                        paddingRight: cellPaddingHorizontal,
                        fontSize: tableFontSize,
                        borderRight: `${borderWidth} solid #f3f4f6`, 
                        ...(idx < actualData.length - 1 && { borderBottom: `${borderWidth} solid #f3f4f6` }) 
                      }}
                    >
                      {row.metric}
                    </td>
                    <td 
                      className="text-black" 
                      style={{ 
                        paddingTop: cellPaddingVertical,
                        paddingBottom: cellPaddingVertical,
                        paddingLeft: cellPaddingHorizontal,
                        paddingRight: cellPaddingHorizontal,
                        fontSize: tableFontSize,
                        ...(idx < actualData.length - 1 && { borderBottom: `${borderWidth} solid #f3f4f6` }) 
                      }}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Target Performance */}
          <div className="overflow-hidden">
            <h3 className="text-black text-left font-bold" style={{ fontSize: tableTitleFontSize, marginBottom: tableTitleMarginBottom }}>
              {targetTableTitle}
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc' }} className="text-black">
                  <th 
                    className="text-left" 
                    style={{ 
                      paddingTop: cellPaddingVertical,
                      paddingBottom: cellPaddingVertical,
                      paddingLeft: cellPaddingHorizontal,
                      paddingRight: cellPaddingHorizontal,
                      fontSize: tableFontSize,
                      borderRight: `${borderWidth} solid #f3f4f6`, 
                      borderBottom: `${borderWidth} solid #f3f4f6` 
                    }}
                  >
                    {metricColumnHeader}
                  </th>
                  <th 
                    className="text-left" 
                    style={{ 
                      paddingTop: cellPaddingVertical,
                      paddingBottom: cellPaddingVertical,
                      paddingLeft: cellPaddingHorizontal,
                      paddingRight: cellPaddingHorizontal,
                      fontSize: tableFontSize,
                      borderBottom: `${borderWidth} solid #f3f4f6` 
                    }}
                  >
                    {targetColumnHeader}
                  </th>
                </tr>
              </thead>
              <tbody>
                {targetData.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: '#fcfcfc' }}>
                    <td 
                      className="text-black" 
                      style={{ 
                        paddingTop: cellPaddingVertical,
                        paddingBottom: cellPaddingVertical,
                        paddingLeft: cellPaddingHorizontal,
                        paddingRight: cellPaddingHorizontal,
                        fontSize: tableFontSize,
                        borderRight: `${borderWidth} solid #f3f4f6`, 
                        ...(idx < targetData.length - 1 && { borderBottom: `${borderWidth} solid #f3f4f6` }) 
                      }}
                    >
                      {row.metric}
                    </td>
                    <td 
                      className="text-black" 
                      style={{ 
                        paddingTop: cellPaddingVertical,
                        paddingBottom: cellPaddingVertical,
                        paddingLeft: cellPaddingHorizontal,
                        paddingRight: cellPaddingHorizontal,
                        fontSize: tableFontSize,
                        ...(idx < targetData.length - 1 && { borderBottom: `${borderWidth} solid #f3f4f6` }) 
                      }}
                    >
                      {row.value}
                    </td>
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

export default ExcelComparisonLayout_Responsive;


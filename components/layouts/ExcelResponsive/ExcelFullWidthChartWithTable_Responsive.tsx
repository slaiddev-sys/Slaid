import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelFullWidthChartWithTableResponsiveProps {
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
  tableHeaders?: string[];
  tableData?: Array<Record<string, any>>;
  overallPerformance?: string;
  performanceLabel?: string;
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelFullWidthChartWithTable_Responsive: React.FC<ExcelFullWidthChartWithTableResponsiveProps> = ({ 
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
  tableHeaders,
  tableData = [
    { month: 'Jan', revenue: 6500, gmv: 4200 },
    { month: 'Feb', revenue: 8200, gmv: 5800 },
    { month: 'Mar', revenue: 9500, gmv: 6800 },
    { month: 'Apr', revenue: 11200, gmv: 8500 },
    { month: 'May', revenue: 15800, gmv: 12200 },
    { month: 'Jun', revenue: 25000, gmv: 19500 }
  ],
  overallPerformance = "+24.8%",
  performanceLabel = "Overall performance",
  description = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Derive headers and structure from data
  const actualHeaders = tableHeaders && tableHeaders.length > 0 
    ? tableHeaders 
    : (tableData && tableData.length > 0 ? Object.keys(tableData[0]) : ["Column"]);
  
  // First column is the label (month/period), rest are metric columns
  const labelColumn = actualHeaders[0];
  const metricColumns = actualHeaders.slice(1);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const metricFontSize = `${14 * scaleFactor}px`;
  const performanceFontSize = `${14 * scaleFactor}px`;
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const tableFontSize = `${12 * scaleFactor}px`;
  const marginBottom = `${8 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const chartMarginBottom = `${16 * scaleFactor}px`;
  const performanceMarginBottom = `${8 * scaleFactor}px`;
  const performanceMarginRight = `${8 * scaleFactor}px`;
  const arrowMarginRight = `${4 * scaleFactor}px`;
  const cellPadding = `${8 * scaleFactor}px`;
  const borderWidth = `${0.5 * scaleFactor}px`;

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
      data-chart-container="fullwidth-chart-table"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: `${448 * scaleFactor}px`, marginLeft: `${-48 * scaleFactor}px` }}>
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
      
      {/* Chart - 60% height */}
      <div className="w-full" style={{ height: '60%', marginBottom: chartMarginBottom }}>
        <ChartBlock {...chartData} className="w-full h-full" />
      </div>

      {/* Data Table - Dynamic columns and rows */}
      <div style={{ marginLeft: marginLeft }}>
        <table className="w-full" style={{ fontSize: tableFontSize }}>
          <thead>
            <tr>
              <th 
                className="text-black text-left"
                style={{ 
                  padding: cellPadding,
                  backgroundColor: '#fcfcfc',
                  borderRight: `${borderWidth} solid #f3f4f6`,
                  borderBottom: `${borderWidth} solid #f3f4f6`
                }}
              >
                {labelColumn}
              </th>
              {tableData.map((row, idx) => (
                <th 
                  key={idx}
                  className="text-black text-center"
                  style={{ 
                    padding: cellPadding,
                    backgroundColor: '#fcfcfc',
                    borderBottom: `${borderWidth} solid #f3f4f6`,
                    ...(idx < tableData.length - 1 && { borderRight: `${borderWidth} solid #f3f4f6` })
                  }}
                >
                  {row[labelColumn]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricColumns.map((metricName, metricIdx) => {
              const isLastRow = metricIdx === metricColumns.length - 1;
              return (
                <tr key={metricIdx}>
                  <td 
                    className="text-black"
                    style={{ 
                      padding: cellPadding,
                      backgroundColor: '#fcfcfc',
                      borderRight: `${borderWidth} solid #f3f4f6`,
                      ...(!isLastRow && { borderBottom: `${borderWidth} solid #f3f4f6` })
                    }}
                  >
                    {metricName}
                  </td>
                  {tableData.map((row, idx) => {
                    const cellValue = row[metricName];
                    const displayValue = typeof cellValue === 'number' ? cellValue.toLocaleString() : cellValue;
                    return (
                      <td 
                        key={idx}
                        className="text-black text-center"
                        style={{ 
                          padding: cellPadding,
                          backgroundColor: '#fcfcfc',
                          ...(!isLastRow && { borderBottom: `${borderWidth} solid #f3f4f6` }),
                          ...(idx < tableData.length - 1 && { borderRight: `${borderWidth} solid #f3f4f6` })
                        }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelFullWidthChartWithTable_Responsive;


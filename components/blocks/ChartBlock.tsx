import * as React from 'react';
import Image from 'next/image';
import {
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  ScatterChart,
  ComposedChart,
  Line,
  Bar,
  Area,
  Pie,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Utility function to merge classes
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Utility function to truncate long chart labels
function truncateLabel(label: string | number, maxLength: number = 10): string {
  const str = String(label);
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

// Chart type definition
export type ChartKind = 'line' | 'bar' | 'stacked-bar' | 'stackedBar' | 'bar-stacked' | 'area' | 'pie' | 'scatter' | 'combo' | 'table' | 'heatmap' | 'waterfall' | 'funnel';

// Chart data series interface
export interface ChartSeries {
  id: string;
  data: (number | null | { x: number; y: number; z?: number } | string)[];
  color?: string;
}

// Table data interface
export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

// Heatmap data interface  
export interface HeatmapData {
  x: string | number;
  y: string | number;
  value: number;
}

// Main props interface
export interface ChartBlockProps {
  /**
   * Type of chart to render
   */
  type: ChartKind;
  
  /**
   * Labels for x-axis (not used for pie charts)
   */
  labels?: string[];
  
  /**
   * Data series for the chart
   */
  series: ChartSeries[];
  
  /**
   * Optional chart title
   */
  title?: string;
  
  /**
   * Optional chart description
   */
  description?: string;
  
  /**
   * Additional CSS classes (Tailwind)
   */
  className?: string;
  
  /**
   * Whether to show legend
   */
  showLegend?: boolean;
  
  /**
   * Position of the legend
   */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Size of the legend
   */
  legendSize?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to show grid lines
   */
  showGrid?: boolean;
  
  /**
   * Whether to use curved lines (for line/area charts)
   */
  curved?: boolean;
  
  /**
   * Whether to stack data (for bar/area charts)
   */
  stacked?: boolean;
  
  /**
   * Whether to animate the chart
   */
  animate?: boolean;
  
  /**
   * Table data (for table charts)
   */
  tableData?: TableData;
  
  /**
   * Heatmap data (for heatmap charts)
   */
  heatmapData?: HeatmapData[];
  
  /**
   * Whether to show comparison metric below the chart
   */
  showComparison?: boolean;
  
  /**
   * Custom comparison text (if not provided, will auto-calculate)
   */
  comparisonText?: string;
  
  /**
   * Callback for hover events with bar data
   */
  onBarHover?: (data: { index: number; value: number; isHovering: boolean }) => void;
  
  /**
   * Whether to show dots on line charts (default: true)
   */
  showDots?: boolean;
}

// Predefined color palette - dark blue and purple tones
const DEFAULT_COLORS = [
  '#1e3a8a', // blue-900 (very dark blue)
  '#1e40af', // blue-800 (dark blue)
  '#2563eb', // blue-600 (medium blue)
  '#6366f1', // indigo-500 (blue-purple)
  '#7c3aed', // violet-600 (purple)
  '#8b5cf6', // violet-500 (medium purple)
  '#a78bfa', // violet-400 (light purple)
  '#c4b5fd', // violet-300 (lighter purple)
];

// Custom cursor component for bar charts with rounded corners and bar-height matching
const CustomBarCursor = (props: any) => {
  if (!props || !props.payload || props.payload.length === 0) return null;
  
  const { x, y, width, height, payload } = props;
  
  // Calculate the maximum value in this group to determine background height
  const maxValue = Math.max(...payload.map((p: any) => p.value || 0));
  
  // Get the chart's Y-axis domain to calculate proportional height
  // Assuming the chart starts from 0 and goes to the maximum value across all data
  const allValues = payload.flatMap((p: any) => p.payload ? Object.values(p.payload).filter(v => typeof v === 'number') : []);
  const chartMax = Math.max(...allValues, maxValue);
  
  // Calculate the proportional height based on the tallest bar in this group
  const barHeight = (maxValue / chartMax) * height;
  const backgroundY = y + height - barHeight;
  
  return (
    <rect
      x={x}
      y={backgroundY}
      width={width}
      height={barHeight}
      fill="#F2F1FF"
      fillOpacity={1}
      stroke="none"
      rx={8}
      ry={8}
    />
  );
};

/**
 * ChartBlock Component
 * 
 * A reusable chart block component that renders different types of charts
 * using Recharts library. Supports line, bar, area, and pie charts with
 * customizable styling and behavior.
 */
const ChartBlock = React.memo(function ChartBlock({
  type = 'area',
  labels = [],
  series = [],
  title,
  description,
  className,
  showLegend = true,
  legendPosition = 'bottom',
  legendSize = 'small',
  showGrid = true,
  curved = false,
  stacked = false,
  animate = true,
  tableData,
  heatmapData,
  showComparison = false,
  comparisonText,
  onBarHover,
  showDots = true,
}: ChartBlockProps) {
  // State for tracking hovered bar index
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  // State for client-side rendering to avoid SSR issues with Recharts
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Alternative client-side check
  const isClientSide = typeof window !== 'undefined';
  
  // Memoize expensive calculations to prevent unnecessary re-renders
  const chartData = React.useMemo(() => {
    if (type === 'pie') {
      return series.map((item, index) => ({
        name: item.id,
        value: Array.isArray(item.data) ? item.data[0] : item.data,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      }));
    }
    
    if (type === 'table' && tableData) {
      return tableData;
    }
    
    if (type === 'heatmap' && heatmapData) {
      return heatmapData;
    }
    
    // For other chart types, transform data
    return labels.map((label, index) => {
      const dataPoint: any = { name: label };
      series.forEach(seriesItem => {
        const value = Array.isArray(seriesItem.data) ? seriesItem.data[index] : seriesItem.data;
        dataPoint[seriesItem.id] = value;
      });
      return dataPoint;
    });
  }, [type, labels, series, tableData, heatmapData]);
  
  // Memoize color calculations
  const seriesColors = React.useMemo(() => {
    return series.map((item, index) => 
      item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    );
  }, [series]);
  
  // Helper function to render legend in title area (matching charts preview)
  const renderTitleLegend = (series: ChartSeries[], chartTitle: string) => {
    // Color palette matching charts preview page exactly
    const colors = ['#4A3AFF', '#C893FD', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
    
    // Special colors for stacked bar charts - matching charts preview
    const stackedColors = ['#962DFF', '#C893FD', '#E0C6FD', '#F0E5FC'];
    
    const isStacked = chartTitle?.includes('Stacked') || stacked;
    const colorsToUse = isStacked ? stackedColors : colors;
    
    return (
      <div className="flex flex-col gap-1">
        {series.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: colorsToUse[index % colorsToUse.length] }}
            ></div>
            <span className="text-sm font-normal text-gray-700">{item.id}</span>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render legend at bottom with small size
  const renderBottomLegend = (series: ChartSeries[], chartTitle: string) => {
    // Color palette matching charts preview page exactly
    const defaultColors = ['#4A3AFF', '#C893FD', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
    
    // Special colors for stacked bar charts - matching charts preview
    const stackedColors = ['#962DFF', '#C893FD', '#E0C6FD', '#F0E5FC'];
    
    const isStacked = chartTitle?.includes('Stacked') || stacked;
    const fallbackColors = isStacked ? stackedColors : defaultColors;
    
    // For pie charts, use the series data instead of labels
    if (type === 'pie') {
      return (
        <div className="flex justify-center items-center gap-4 -mt-2">
          {series.map((seriesItem, index) => {
            // Use the color from the series if available, otherwise fall back to default colors
            const color = seriesItem.color || fallbackColors[index % fallbackColors.length];
            
            return (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="font-normal text-gray-600" style={{ fontSize: '10px' }}>{seriesItem.id}</span>
              </div>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="flex justify-center items-center gap-4 -mt-2">
        {series.map((item, index) => {
          // Use the color from the series if available, otherwise fall back to default colors
          const color = item.color || fallbackColors[index % fallbackColors.length];
          
          return (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="font-normal text-gray-600" style={{ fontSize: '10px' }}>{item.id}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Special color palette for stacked bar charts - matching charts preview page exactly
  const STACKED_BAR_COLORS = [
    '#962DFF', // dark purple (bottom) - matches charts preview
    '#C893FD', // medium purple - matches charts preview
    '#E0C6FD', // light purple - matches charts preview
    '#F0E5FC', // very light purple (top) - matches charts preview
  ];

  // Assign default colors to series that don't have colors
  const colorPalette = (type === 'bar' && stacked) ? STACKED_BAR_COLORS : DEFAULT_COLORS;
  
  // Force standard colors for common series names to ensure consistency
  const getStandardColor = (seriesId: string, index: number) => {
    const standardColorMap: { [key: string]: string } = {
      'Revenue': '#4A3AFF',
      'GMV': '#C893FD', 
      'Operating Profit': '#C893FD',
      'Profit': '#C893FD',
      'Sales': '#4A3AFF',
      'Target': '#C893FD'
    };
    
    return standardColorMap[seriesId] || colorPalette[index % colorPalette.length];
  };
  
  const seriesWithColors = series.map((s, index) => ({
    ...s,
    color: s.color || getStandardColor(s.id, index),
  }));

  // Memoized callbacks for bar interactions (after seriesWithColors is defined)
  const handleBarMouseEnter = React.useCallback((data: any, index: number) => {
    setHoveredIndex(index);
    if (onBarHover && data && typeof data.payload === 'object') {
      const value = data.payload[seriesWithColors[0]?.id] || 0;
      onBarHover({ index, value, isHovering: true });
    }
  }, [onBarHover, seriesWithColors]);
  
  const handleBarMouseLeave = React.useCallback(() => {
    setHoveredIndex(null);
    if (onBarHover) {
      onBarHover({ index: -1, value: 0, isHovering: false });
    }
  }, [onBarHover]);
  

  // Calculate comparison metric
  const calculateComparison = () => {
    if (!showComparison || series.length === 0) return null;
    
    // Use custom text if provided
    if (comparisonText) return comparisonText;
    
    // Auto-calculate for the first series
    const firstSeries = series[0];
    if (!firstSeries.data || firstSeries.data.length < 2) return null;
    
    const data = firstSeries.data as number[];
    const lastValue = data[data.length - 1];
    const previousValue = data[data.length - 2];
    
    if (previousValue === 0) return null;
    
    const percentChange = ((lastValue - previousValue) / previousValue) * 100;
    const isIncrease = percentChange > 0;
    const absChange = Math.abs(percentChange);
    
    return {
      isIncrease,
      percentage: absChange.toFixed(1),
      text: `${absChange.toFixed(1)}%`
    };
  };

  const comparisonMetric = calculateComparison();

  // Transform data for Recharts format
  const rechartsData = React.useMemo(() => {
    if (type === 'pie') {
      // For pie charts, use all series as individual slices
      return seriesWithColors.map((series, index) => ({
        name: series.id,
        value: series.data?.[0] || 0, // Each series should have one value for pie charts
        fill: series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }));
    } else {
      // For other charts, combine labels with all series data
      return labels.map((label, index) => {
        const dataPoint: any = { name: label };
        seriesWithColors.forEach(s => {
          dataPoint[s.id] = s.data?.[index] || 0;
        });
        return dataPoint;
      });
    }
  }, [type, labels, seriesWithColors]);

  // Default wrapper classes
  const wrapperClasses = cn(
    "w-full h-64 bg-white p-4",
    className
  );

  // Chart component props
  const chartProps = {
    data: rechartsData,
    margin: { top: 20, right: 30, left: 0, bottom: 5 },
  };

  // Render different chart types
  const renderChart = () => {

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5} />}
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  <div key="chart-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
              />

              {seriesWithColors.map((s, index) => (
                <Line
                  key={`line-${s.id}-${index}`}
                  type={curved ? "monotone" : "linear"}
                  dataKey={s.id}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={showDots ? { fill: s.color, strokeWidth: 0, r: 4 } : false}
                  activeDot={{ r: 6, stroke: s.color, strokeWidth: 2, fill: 'white' }}
                  animationDuration={animate ? 1000 : 0}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
      case 'stacked-bar':
      case 'stackedBar':
      case 'bar-stacked':
        // Determine if this is a single series chart to adjust bar width
        const isSingleSeries = series.length === 1;
        const maxBarSize = isSingleSeries ? 40 : undefined; // Thin bars for single series
        const isStacked = type === 'stacked-bar' || type === 'stackedBar' || type === 'bar-stacked' || stacked === true || String(stacked) === 'true'; // Enable stacking for all naming conventions and string values
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              {...chartProps} 
              maxBarSize={maxBarSize}
            >
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5} />}
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px'
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  <div key="chart-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
                cursor={isSingleSeries ? false : <CustomBarCursor />}
              />
              {seriesWithColors.map((s, index) => (
                <Bar
                  key={`bar-${s.id}-${index}`}
                  dataKey={s.id}
                  fill={s.color}
                  radius={isStacked ? 
                    (index === seriesWithColors.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]) : 
                    [8, 8, 8, 8]
                  }
                  animationDuration={animate ? 1000 : 0}
                  stackId={isStacked ? "stack" : undefined}
                  onMouseEnter={onBarHover && index === 0 ? handleBarMouseEnter : undefined}
                  onMouseLeave={onBarHover && index === 0 ? handleBarMouseLeave : undefined}
                  shape={isSingleSeries ? (props: any) => {
                    const { fill, x, y, width, height, payload } = props;
                    
                    // Get the data index from the payload
                    const dataIndex = rechartsData.findIndex((d: any) => d === payload);
                    
                    // Determine if this bar should be dimmed
                    const shouldDim = hoveredIndex !== null && hoveredIndex !== dataIndex;
                    const barColor = shouldDim ? '#E5EAFC' : fill;
                    
                    const radius = isStacked ? 
                      (index === seriesWithColors.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]) : 
                      [8, 8, 8, 8];
                    
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={barColor}
                        rx={radius[0]}
                        ry={radius[1]}
                        style={{
                          transition: 'fill 0.3s ease-in-out'
                        }}
                      />
                    );
                  } : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...chartProps}>
              <defs>
                {seriesWithColors.map((s, index) => {
                  // Create gradient based on the series color, not grey
                  const baseColor = s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                  // Convert hex to RGB for opacity manipulation
                  const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16)
                    } : { r: 74, g: 58, b: 255 }; // fallback to primary color
                  };
                  const rgb = hexToRgb(baseColor);
                  const gradientId = s.id || `series-${index}`;
                  
                  return (
                    <linearGradient key={`gradient-${gradientId}`} id={`areaGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={baseColor} stopOpacity={0.9} />
                      <stop offset="50%" stopColor={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`} />
                      <stop offset="100%" stopColor={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`} />
                    </linearGradient>
                  );
                })}
              </defs>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5} />}
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  <div key="chart-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
              />

              {seriesWithColors.map((s, index) => {
                const isSingleSeries = series.length === 1;
                const gradientId = s.id || `series-${index}`;
                return (
                  <Area
                    key={`area-${gradientId}-${index}`}
                    type={curved ? "monotone" : "linear"}
                    dataKey={s.id || gradientId}
                    stroke={s.color}
                    fill={`url(#areaGradient-${gradientId})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: s.color }}
                    animationDuration={animate ? 1000 : 0}
                    stackId={stacked ? "stack" : index}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rechartsData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={120}
                paddingAngle={0}
                stroke="none"
                dataKey="value"
                animationDuration={animate ? 1000 : 0}
              >
                {rechartsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any, props: any) => [
                  <div key="pie-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {props.payload?.name || name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5} />}
              <XAxis 
                type="number"
                dataKey="x"
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <YAxis 
                type="number"
                dataKey="y"
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  <div key="chart-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
              />
              {seriesWithColors.map((s) => (
                <Scatter
                  key={`scatter-${s.id}`}
                  dataKey="y"
                  fill={s.color}
                  animationDuration={animate ? 1000 : 0}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'combo':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5} />}
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  <div key="chart-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
              />
              {/* Render first series as bars, second as line */}
              {seriesWithColors.slice(0, 1).map((s) => (
                <Bar
                  key={`combo-bar-${s.id}`}
                  dataKey={s.id}
                  fill={s.color}
                  radius={[8, 8, 0, 0]}
                  animationDuration={animate ? 1000 : 0}
                />
              ))}
              {seriesWithColors.slice(1).map((s) => (
                <Line
                  key={`combo-line-${s.id}`}
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ fill: s.color, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: s.color, strokeWidth: 2, fill: 'white' }}
                  animationDuration={animate ? 1000 : 0}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'table':
        if (!tableData) {
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No table data provided
            </div>
          );
        }
        return (
          <div className="w-full h-full overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {tableData.headers.map((header, index) => (
                    <th key={index} className="text-left p-3 font-semibold text-gray-900 bg-gray-50">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-3 text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'heatmap':
        if (!heatmapData) {
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No heatmap data provided
            </div>
          );
        }
        // Simple heatmap implementation using CSS grid
        const uniqueX = [...new Set(heatmapData.map(d => d.x))];
        const uniqueY = [...new Set(heatmapData.map(d => d.y))];
        const maxValue = Math.max(...heatmapData.map(d => d.value));
        
        return (
          <div className="w-full h-full p-4">
            <div 
              className="grid gap-1 h-full"
              style={{
                gridTemplateColumns: `repeat(${uniqueX.length}, 1fr)`,
                gridTemplateRows: `repeat(${uniqueY.length}, 1fr)`
              }}
            >
              {heatmapData.map((cell, index) => {
                const intensity = cell.value / maxValue;
                const opacity = Math.max(0.1, intensity);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center text-xs font-medium rounded"
                    style={{
                      backgroundColor: `rgba(30, 58, 138, ${opacity})`,
                      color: intensity > 0.5 ? 'white' : '#1e3a8a'
                    }}
                    title={`${cell.x}, ${cell.y}: ${cell.value}`}
                  >
                    {cell.value}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'waterfall':
        // Waterfall chart implementation using bars with different colors
        const waterfallData = rechartsData.map((item, index) => {
          const value = seriesWithColors[0]?.data[index] || 0;
          return {
            ...item,
            value: typeof value === 'number' ? value : 0,
            isPositive: typeof value === 'number' ? value >= 0 : false,
            cumulative: 0 // Will be calculated
          };
        });
        
        // Calculate cumulative values
        let cumulative = 0;
        waterfallData.forEach(item => {
          item.cumulative = cumulative;
          cumulative += item.value;
        });

        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={chartProps.margin}>
              {showGrid && <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5} />}
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => truncateLabel(value, 10)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1E1B39',
                  border: '1px solid #1E1B39',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: 'white', fontSize: '14px' }}
                itemStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  <div key="chart-tooltip">
                    <div style={{ fontSize: '14px', fontWeight: 'normal', marginBottom: '4px' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {value}
                    </div>
                  </div>
                ]}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                animationDuration={animate ? 1000 : 0}
              >
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.isPositive ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        // Simple funnel implementation
        const funnelData = seriesWithColors[0]?.data || [];
        const maxFunnelValue = Math.max(...(funnelData.filter(d => typeof d === 'number') as number[]));
        
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4">
            {labels?.map((label, index) => {
              const value = funnelData[index];
              const numValue = typeof value === 'number' ? value : 0;
              const width = (numValue / maxFunnelValue) * 100;
              
              return (
                <div key={index} className="w-full mb-2 flex flex-col items-center">
                  <div 
                    className="h-12 flex items-center justify-center text-white font-medium rounded"
                    style={{
                      width: `${width}%`,
                      backgroundColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                      minWidth: '120px'
                    }}
                  >
                    {label}: {numValue}
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  // Prevent hydration mismatch by only rendering charts on client
  if (!isClient) {
    return (
      <div className={cn('w-full h-full flex flex-col', className)}>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="w-full flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
          Loading chart...
        </div>
      </div>
    );
  }

  return (
    <div 
      className={wrapperClasses}
      role="img"
      aria-label={title || `${type} chart`}
    >
      {/* Header section with title, description, and legend (matching charts preview) */}
      {(title || description || (showLegend && series.length > 1 && legendPosition !== 'bottom')) && (
        <div className="mb-4 pl-4 pr-12 flex justify-between items-start">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-gray-600">{description}</p>
            )}
          </div>
          {/* Legend aligned with chart right edge */}
          {showLegend && series.length > 1 && legendPosition !== 'bottom' && (
            <div className="flex-shrink-0 -mr-4">
              {renderTitleLegend(series, title || '')}
            </div>
          )}
        </div>
      )}
      
      {/* Comparison metric - positioned before chart */}
      {comparisonMetric && (
        <div className="mb-4 pl-4 flex items-center gap-2">
          <span 
            className="text-sm font-medium text-black"
          >
            {typeof comparisonMetric === 'string' ? comparisonMetric : comparisonMetric.text}
          </span>
          {typeof comparisonMetric !== 'string' && (
            <Image 
              src={comparisonMetric.isIncrease ? '/arrow-up-metric.png' : '/arrow-down-metric.png'}
              alt={comparisonMetric.isIncrease ? 'Increase' : 'Decrease'}
              width={20}
              height={20}
              className="w-5 h-5"
            />
          )}
        </div>
      )}
      
      <div className="w-full" style={{ height: title ? 'calc(100% - 3rem)' : '100%' }}>
        {renderChart()}
      </div>
      
      {/* Bottom legend */}
      {showLegend && legendPosition === 'bottom' && (
        (series.length > 1 || type === 'pie') ? renderBottomLegend(series, title || '') : null
      )}
      
      {/* Visually hidden caption for accessibility */}
      <figcaption className="sr-only">
        {title || `${type} chart`} displaying {series.length} data series
        {labels.length > 0 && ` with ${labels.length} data points`}
      </figcaption>
    </div>
  );
});

export default ChartBlock;

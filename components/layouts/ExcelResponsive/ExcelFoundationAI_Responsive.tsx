import React from 'react';
import ChartBlock from '../../blocks/ChartBlock';

interface ExcelFoundationAIResponsiveProps {
  title?: string;
  description?: string;
  topMetric?: {
    value: string;
    description: string;
  };
  bottomMetric?: {
    value: string;
    description: string;
  };
  chartData?: {
    type: 'bar';
    labels: string[];
    series: Array<{ id: string; data: number[]; color?: string }>;
    showLegend?: boolean;
    showGrid?: boolean;
    stacked?: boolean;
    animate?: boolean;
  };
  legendItems?: Array<{
    color: string;
    label: string;
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelFoundationAI_Responsive: React.FC<ExcelFoundationAIResponsiveProps> = ({ 
  title = "Foundation AI Models",
  description = "Most of the world's top artificial intelligence has been trained on foundation models that can be adapted to a wide range of downstream tasks. During 2023, Most of the content in the industry focused on large language models and generative AI applications, but foundation models encompass much more than just text generation.",
  topMetric = {
    value: "42%",
    description: "of organizations say they have deployed and are using one or more AI models."
  },
  bottomMetric = {
    value: "86%",
    description: "of the organizations that have deployed AI models report that they are seeing a positive ROI."
  },
  chartData = {
    type: 'bar',
    labels: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'],
    series: [
      { id: 'Operations', data: [85, 65, 45, 25, 15] },
      { id: 'Analytics', data: [75, 55, 35, 20, 10] },
      { id: 'Automation', data: [65, 45, 25, 15, 8] }
    ],
    showLegend: true,
    legendPosition: 'bottom',
    legendSize: 'small',
    showGrid: true,
    stacked: false,
    animate: true
  },
  legendItems = [
    { color: '#4A3AFF', label: 'Ops' },
    { color: '#C893FD', label: 'Analytics' },
    { color: '#1e40af', label: 'Auto' }
  ],
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${32 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const metricFontSize = `${144 * scaleFactor}px`;
  const metricPercentFontSize = `${48 * scaleFactor}px`;
  const metricDescFontSize = `${12 * scaleFactor}px`;
  const legendFontSize = `${12 * scaleFactor}px`;
  const gap = `${32 * scaleFactor}px`;
  const metricMarginBottom = `${8 * scaleFactor}px`;
  const legendMarginTop = `${4 * scaleFactor}px`;
  const legendGap = `${8 * scaleFactor}px`;
  const legendDotSize = `${6 * scaleFactor}px`;
  const legendDotGap = `${2 * scaleFactor}px`;
  const chartHeight = `${320 * scaleFactor}px`;

  // Extract percentage and number from metric value
  const parseMetricValue = (value: string) => {
    const matches = value.match(/^(\d+)(.*)$/);
    if (matches) {
      return { number: matches[1], suffix: matches[2] };
    }
    return { number: value, suffix: '' };
  };

  const topMetricParsed = parseMetricValue(topMetric.value);
  const bottomMetricParsed = parseMetricValue(bottomMetric.value);

  return (
    <div 
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    >
      <div className="flex h-full" style={{ gap: gap }}>
        {/* Left Side - Title and Description */}
        <div className="w-1/3 flex flex-col justify-between">
          {/* Title at top */}
          <div>
            <h1 className="font-medium text-black leading-tight" style={{ fontSize: titleFontSize }}>
              {title}
            </h1>
          </div>
          
          {/* Description at bottom */}
          <div>
            <p className="text-gray-600 leading-relaxed" style={{ fontSize: descriptionFontSize }}>
              {description}
            </p>
          </div>
        </div>
        
        {/* Middle - Two Metrics at Top and Bottom */}
        <div className="w-1/4 flex flex-col justify-between h-full">
          {/* Top Metric */}
          <div className="text-left">
            <div className="font-light text-black" style={{ fontSize: metricFontSize, marginBottom: metricMarginBottom }}>
              {topMetricParsed.number}
              <span style={{ fontSize: metricPercentFontSize }}>{topMetricParsed.suffix}</span>
            </div>
            <p className="text-gray-600 leading-relaxed" style={{ fontSize: metricDescFontSize }}>
              {topMetric.description}
            </p>
          </div>
          
          {/* Bottom Metric */}
          <div className="text-left">
            <div className="font-light text-black" style={{ fontSize: metricFontSize, marginBottom: metricMarginBottom }}>
              {bottomMetricParsed.number}
              <span style={{ fontSize: metricPercentFontSize }}>{bottomMetricParsed.suffix}</span>
            </div>
            <p className="text-gray-600 leading-relaxed" style={{ fontSize: metricDescFontSize }}>
              {bottomMetric.description}
            </p>
          </div>
        </div>
        
        {/* Right Side - Multi-series Bar Chart at Bottom */}
        <div className="w-2/5 flex flex-col justify-end">
          {/* ChartBlock Multi-Series Bar Chart */}
          <div style={{ height: chartHeight }}>
            <ChartBlock
              {...chartData}
              className="w-full h-full bg-white"
            />
          </div>
          
          {/* Custom Tiny Legend Below Chart */}
          <div className="flex justify-center" style={{ gap: legendGap, marginTop: legendMarginTop }}>
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center" style={{ gap: legendDotGap }}>
                <div 
                  className="rounded-sm" 
                  style={{ 
                    width: legendDotSize, 
                    height: legendDotSize, 
                    backgroundColor: item.color 
                  }}
                />
                <span className="text-gray-500" style={{ fontSize: legendFontSize }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelFoundationAI_Responsive;


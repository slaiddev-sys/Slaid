import React from 'react';

interface ExcelIndexResponsiveProps {
  title?: string;
  items?: Array<{
    number: string;
    title: string;
    description: string;
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelIndex_Responsive: React.FC<ExcelIndexResponsiveProps> = ({ 
  title = "Index",
  items = [
    { number: "01", title: "Market Analysis", description: "Current market trends and opportunities" },
    { number: "02", title: "Product Updates", description: "Latest feature releases and roadmap" },
    { number: "03", title: "Financial Review", description: "Q4 performance and budget planning" },
    { number: "04", title: "Strategic Planning", description: "2025 goals and initiatives" },
    { number: "05", title: "Customer Insights", description: "Voice of customer feedback and analysis" },
    { number: "06", title: "Next Steps", description: "Action items and follow-up tasks" }
  ],
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${32 * scaleFactor}px`;
  const titleFontSize = `${36 * scaleFactor}px`;
  const numberFontSize = `${18 * scaleFactor}px`;
  const itemTitleFontSize = `${16 * scaleFactor}px`;
  const descriptionFontSize = `${12 * scaleFactor}px`;
  const titleMarginBottom = `${32 * scaleFactor}px`;
  const rowSpacing = `${8 * scaleFactor}px`;
  const columnGap = `${32 * scaleFactor}px`;
  const itemGap = `${12 * scaleFactor}px`;
  const itemTitleMarginBottom = `${4 * scaleFactor}px`;
  const rowMarginBottom = `${4 * scaleFactor}px`;
  const borderWidth = `${1 * scaleFactor}px`;

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
      {/* Title */}
      <div style={{ marginBottom: titleMarginBottom }}>
        <h1 
          className="font-normal text-gray-900 leading-tight text-left"
          style={{ fontSize: titleFontSize }}
        >
          {title}
        </h1>
      </div>
      
      {/* Three-column grid of agenda items with row dividers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rowSpacing }}>
        {Array.from({ length: Math.ceil(items.length / 3) }, (_, rowIndex) => (
          <div key={rowIndex}>
            {/* Row of 3 items */}
            <div 
              className="grid grid-cols-3" 
              style={{ 
                gap: `${4 * scaleFactor}px ${columnGap}`, 
                marginBottom: rowMarginBottom 
              }}
            >
              {items.slice(rowIndex * 3, (rowIndex + 1) * 3).map((item, colIndex) => {
                const itemIndex = rowIndex * 3 + colIndex;
                return (
                  <div key={itemIndex} className="flex items-start" style={{ gap: itemGap }}>
                    {/* Number */}
                    <div className="flex-shrink-0">
                      <span 
                        className="font-medium text-gray-900"
                        style={{ fontSize: numberFontSize }}
                      >
                        {item.number}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-medium text-gray-900 leading-tight"
                        style={{ fontSize: itemTitleFontSize, marginBottom: itemTitleMarginBottom }}
                      >
                        {item.title}
                      </h3>
                      <p 
                        className="text-gray-600 leading-tight"
                        style={{ fontSize: descriptionFontSize }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Divider line (except after last row) */}
            {rowIndex < Math.ceil(items.length / 3) - 1 && (
              <div 
                className="border-b border-gray-200" 
                style={{ 
                  marginBottom: rowMarginBottom,
                  borderBottomWidth: borderWidth
                }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcelIndex_Responsive;


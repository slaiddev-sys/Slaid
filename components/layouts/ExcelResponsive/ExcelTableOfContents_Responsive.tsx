import React from 'react';

interface ExcelTableOfContentsResponsiveProps {
  title?: string;
  items?: Array<{
    page: string;
    title: string;
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelTableOfContents_Responsive: React.FC<ExcelTableOfContentsResponsiveProps> = ({ 
  title = "Table of Contents",
  items = [
    { page: "1", title: "Executive Summary" },
    { page: "2", title: "Founders Letter" },
    { page: "3", title: "Methodology" },
    { page: "4", title: "Conversion" },
    { page: "5", title: "Monetization" },
    { page: "6", title: "Revenue" },
    { page: "7", title: "Retention & Reactivation" },
    { page: "8", title: "Acquisition" }
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
  const padding = `${32 * scaleFactor}px`;
  const titleFontSize = `${36 * scaleFactor}px`;
  const pageFontSize = `${16 * scaleFactor}px`;
  const itemTitleFontSize = `${14 * scaleFactor}px`;
  const paddingRight = `${32 * scaleFactor}px`;
  const itemSpacing = `${4 * scaleFactor}px`;
  const itemPaddingTop = `${4 * scaleFactor}px`;
  const itemPaddingBottom = `${8 * scaleFactor}px`;
  const pageWidth = `${48 * scaleFactor}px`;
  const titleMarginLeft = `${32 * scaleFactor}px`;
  const borderWidth = `${1 * scaleFactor}px`;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white  flex" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        
      }}
    >
      {/* Left side - Title only */}
      <div className="w-1/3" style={{ paddingRight: paddingRight }}>
        <h1 
          className="font-normal text-gray-900 leading-tight text-left"
          style={{ fontSize: titleFontSize }}
        >
          {title}
        </h1>
      </div>
      
      {/* Right side - All items */}
      <div className="w-2/3" style={{ display: 'flex', flexDirection: 'column', gap: itemSpacing }}>
        {items.map((item, index) => (
          <div key={index}>
            {/* Item row */}
            <div 
              className="flex items-center" 
              style={{ 
                paddingTop: itemPaddingTop, 
                paddingBottom: itemPaddingBottom 
              }}
            >
              {/* Page number - black color */}
              <div className="flex-shrink-0" style={{ width: pageWidth }}>
                <span 
                  className="font-medium text-gray-900"
                  style={{ fontSize: pageFontSize }}
                >
                  {item.page}
                </span>
              </div>
              
              {/* Title - takes remaining space */}
              <div className="flex-1" style={{ marginLeft: titleMarginLeft }}>
                <h3 
                  className="font-normal text-gray-900 leading-tight text-left"
                  style={{ fontSize: itemTitleFontSize }}
                >
                  {item.title}
                </h3>
              </div>
            </div>
            
            {/* Divider line (except after last item) */}
            {index < items.length - 1 && (
              <div 
                className="border-b border-gray-200"
                style={{ borderBottomWidth: borderWidth }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcelTableOfContents_Responsive;


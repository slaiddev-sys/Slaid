import React from 'react';

interface ExcelLeftCoverResponsiveProps {
  title?: string;
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelLeftCover_Responsive: React.FC<ExcelLeftCoverResponsiveProps> = ({ 
  title = "Our solution", 
  description = "Transforming ideas into results with strategy, craft, and measurable impact.",
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
  const padding = `${48 * scaleFactor}px`;
  const titleFontSize = `${48 * scaleFactor}px`;
  const descriptionFontSize = `${14 * scaleFactor}px`;
  const maxWidth = `${384 * scaleFactor}px`; // max-w-sm = 24rem = 384px
  const titleMarginBottom = `${8 * scaleFactor}px`;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white  flex items-center" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        
      }}
    >
      {/* Left-aligned content section */}
      <div style={{ maxWidth: maxWidth }}>
        {/* Title - Large, left-aligned */}
        <div style={{ marginBottom: titleMarginBottom }}>
          <h1 
            className="font-normal text-gray-900 leading-tight text-left"
            style={{ fontSize: titleFontSize }}
          >
            {title}
          </h1>
        </div>
        
        {/* Description - Smaller, left-aligned, constrained for two lines */}
        <div>
          <p 
            className="text-gray-600 leading-normal text-left"
            style={{ fontSize: descriptionFontSize }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelLeftCover_Responsive;



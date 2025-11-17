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
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${48 * scaleFactor}px`;
  const titleFontSize = `${48 * scaleFactor}px`;
  const descriptionFontSize = `${14 * scaleFactor}px`;
  const maxWidth = `${384 * scaleFactor}px`; // max-w-sm = 24rem = 384px
  const titleMarginBottom = `${8 * scaleFactor}px`;

  return (
    <div 
      className="w-full h-full bg-white  flex items-center" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
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



import React from 'react';

interface ExcelBottomCoverResponsiveProps {
  title?: string;
  description?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelBottomCover_Responsive: React.FC<ExcelBottomCoverResponsiveProps> = ({ 
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
  const gap = `${32 * scaleFactor}px`;
  const marginBottom = `${4 * scaleFactor}px`;

  return (
    <div 
      className="w-full h-full bg-white  flex flex-col justify-end" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    >
      {/* Bottom section with title left and description right */}
      <div className="flex items-end" style={{ gap: gap, marginBottom: marginBottom }}>
        {/* Title - Left side, large */}
        <div className="flex-1">
          <h1 
            className="font-normal text-gray-900 leading-tight text-left"
            style={{ fontSize: titleFontSize }}
          >
            {title}
          </h1>
        </div>
        
        {/* Description - Right side, smaller */}
        <div className="flex-1">
          <p 
            className="text-gray-600 leading-relaxed text-left"
            style={{ fontSize: descriptionFontSize }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelBottomCover_Responsive;



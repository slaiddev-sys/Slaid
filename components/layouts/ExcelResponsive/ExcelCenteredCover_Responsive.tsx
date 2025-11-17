import React from 'react';

interface ExcelCenteredCoverResponsiveProps {
  title?: string;
  description?: string;
  logoUrl?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelCenteredCover_Responsive: React.FC<ExcelCenteredCoverResponsiveProps> = ({ 
  title = "Our solution", 
  description = "Transforming ideas into results with strategy, craft, and measurable impact.",
  logoUrl = "/logo-placeholder.png",
  canvasWidth,
  canvasHeight
}) => {
  // Calculate responsive scale factor based on canvas size
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive font sizes (scaled from original 5xl = 48px, sm = 14px)
  const titleFontSize = `${48 * scaleFactor}px`;
  const descriptionFontSize = `${14 * scaleFactor}px`;
  const padding = `${48 * scaleFactor}px`;
  const titleMarginTop = `${-64 * scaleFactor}px`;
  const titleMarginBottom = `${4 * scaleFactor}px`;
  const maxDescriptionWidth = `${512 * scaleFactor}px`;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white  flex flex-col items-center justify-center" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        
      }}
    >
      {/* Main Title - Bigger size and centered, positioned higher */}
      <div className="text-center" style={{ marginBottom: titleMarginBottom, marginTop: titleMarginTop }}>
        <h1 
          className="font-normal text-gray-900 leading-tight"
          style={{ fontSize: titleFontSize }}
        >
          {title}
        </h1>
      </div>
      
      {/* Description - Smaller text, centered below title with minimal spacing */}
      <div className="text-center" style={{ maxWidth: maxDescriptionWidth }}>
        <p 
          className="text-gray-600 leading-relaxed"
          style={{ fontSize: descriptionFontSize }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default ExcelCenteredCover_Responsive;



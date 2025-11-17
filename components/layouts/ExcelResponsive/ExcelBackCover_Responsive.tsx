import React from 'react';

interface ExcelBackCoverResponsiveProps {
  title?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelBackCover_Responsive: React.FC<ExcelBackCoverResponsiveProps> = ({ 
  title = "Thank You",
  description = "Questions & Discussion",
  contactEmail = "contact@company.com",
  contactPhone = "+1 (555) 123-4567",
  address = "123 Business Street, City, State 12345",
  website = "www.company.com",
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
  const titleFontSize = `${48 * scaleFactor}px`;
  const descriptionFontSize = `${16 * scaleFactor}px`;
  const contactFontSize = `${14 * scaleFactor}px`;
  const titleMarginBottom = `${8 * scaleFactor}px`;
  const sectionMarginBottom = `${32 * scaleFactor}px`;
  const contactSpacing = `${12 * scaleFactor}px`;
  const horizontalGap = `${32 * scaleFactor}px`;
  const maxDescriptionWidth = `${512 * scaleFactor}px`;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white  flex flex-col justify-center items-center text-center" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        
      }}
    >
      
      {/* Main Title */}
      <div style={{ marginBottom: sectionMarginBottom }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize, marginBottom: titleMarginBottom }}>
          {title}
        </h1>
        <p className="text-gray-600" style={{ fontSize: descriptionFontSize, maxWidth: maxDescriptionWidth }}>
          {description}
        </p>
      </div>
      
      {/* Contact Information */}
      <div className="text-gray-700" style={{ display: 'flex', flexDirection: 'column', gap: contactSpacing }}>
        <div className="flex items-center justify-center" style={{ gap: horizontalGap }}>
          <span style={{ fontSize: contactFontSize }}>{contactEmail}</span>
          <span style={{ fontSize: contactFontSize }}>{contactPhone}</span>
        </div>
        <div className="text-center">
          <span style={{ fontSize: contactFontSize }}>{address}</span>
        </div>
        <div className="text-center">
          <span style={{ fontSize: contactFontSize }}>{website}</span>
        </div>
      </div>
    </div>
  );
};

export default ExcelBackCover_Responsive;



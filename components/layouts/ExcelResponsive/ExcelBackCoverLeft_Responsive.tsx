import React from 'react';

interface ExcelBackCoverLeftResponsiveProps {
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelBackCoverLeft_Responsive: React.FC<ExcelBackCoverLeftResponsiveProps> = ({ 
  title = "Thank You",
  description = "Questions & Discussion",
  email = "contact@company.com",
  phone = "+1 (555) 123-4567",
  address = "123 Business Street, City, State 12345",
  website = "www.company.com",
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  return (
    <div 
      className="w-full h-full bg-white  flex flex-col justify-center" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: `${24 * scaleFactor}px`,
        paddingTop: `${48 * scaleFactor}px`,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    >
      <div style={{ marginBottom: `${32 * scaleFactor}px`, marginLeft: `${24 * scaleFactor}px` }}>
        <h1 className="font-medium text-black" style={{ fontSize: `${48 * scaleFactor}px`, marginBottom: `${8 * scaleFactor}px` }}>
          {title}
        </h1>
        <p className="text-gray-600" style={{ fontSize: `${16 * scaleFactor}px`, maxWidth: `${512 * scaleFactor}px` }}>
          {description}
        </p>
      </div>
      
      <div className="text-gray-700" style={{ display: 'flex', flexDirection: 'column', gap: `${12 * scaleFactor}px`, marginLeft: `${24 * scaleFactor}px` }}>
        <div className="flex items-start" style={{ gap: `${32 * scaleFactor}px` }}>
          <span style={{ fontSize: `${14 * scaleFactor}px` }}>{email}</span>
          <span style={{ fontSize: `${14 * scaleFactor}px` }}>{phone}</span>
        </div>
        <div>
          <span style={{ fontSize: `${14 * scaleFactor}px` }}>{address}</span>
        </div>
        <div>
          <span style={{ fontSize: `${14 * scaleFactor}px` }}>{website}</span>
        </div>
      </div>
    </div>
  );
};

export default ExcelBackCoverLeft_Responsive;


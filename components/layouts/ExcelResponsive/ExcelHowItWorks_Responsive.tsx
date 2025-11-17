import React from 'react';

interface ExcelHowItWorksResponsiveProps {
  title?: string;
  subtitle?: string;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelHowItWorks_Responsive: React.FC<ExcelHowItWorksResponsiveProps> = ({ 
  title = "How Savium works",
  subtitle = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  features = [
    {
      icon: "check",
      title: "Goal-based planning",
      description: "Set, track, and achieve personal and business financial goals with ease."
    },
    {
      icon: "chart",
      title: "Predictive analytics",
      description: "Use data-driven insights to forecast cash flow and anticipate financial needs."
    },
    {
      icon: "smile",
      title: "Smart budgeting",
      description: "Automatically organize income and expenses, giving every dollar a purpose."
    },
    {
      icon: "lock",
      title: "Secure management",
      description: "Bank-level encryption and privacy standards ensure complete user trust."
    }
  ],
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${36 * scaleFactor}px`;
  const subtitleFontSize = `${16 * scaleFactor}px`;
  const featureTitleFontSize = `${14 * scaleFactor}px`;
  const featureDescFontSize = `${16 * scaleFactor}px`;
  const gap = `${32 * scaleFactor}px`;
  const gridGap = `${32 * scaleFactor}px`;
  const cardPadding = `${16 * scaleFactor}px`;
  const featureTitleMarginBottom = `${8 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const paddingRight = `${24 * scaleFactor}px`;
  const titleMarginBottom = `${16 * scaleFactor}px`;
  const dividerWidth = `${1 * scaleFactor}px`;

  return (
    <div 
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        paddingTop: paddingTop,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    >
      <div className="flex h-full" style={{ gap: gap }}>
        
        {/* Left Side - Title */}
        <div className="w-1/3 flex flex-col justify-center" style={{ marginLeft: marginLeft }}>
          <h1 className="font-medium text-black leading-tight" style={{ fontSize: titleFontSize, marginBottom: titleMarginBottom }}>
            {title}
          </h1>
          <p className="text-gray-600 leading-relaxed" style={{ fontSize: subtitleFontSize }}>
            {subtitle}
          </p>
        </div>
        
        {/* Right Side - Feature Cards in 2x2 Grid with Cross Dividers */}
        <div className="w-2/3 flex flex-col justify-center relative" style={{ paddingRight: paddingRight }}>
          <div className="grid grid-cols-2" style={{ gap: gridGap }}>
            
            {features.map((feature, index) => (
              <div key={index} style={{ padding: cardPadding }}>
                <h3 className="font-medium text-black" style={{ fontSize: featureTitleFontSize, marginBottom: featureTitleMarginBottom }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed" style={{ fontSize: featureDescFontSize }}>
                  {feature.description}
                </p>
              </div>
            ))}
            
          </div>
          
          {/* Cross Dividers */}
          <div 
            className="absolute bg-gray-200" 
            style={{ 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%, -50%)', 
              height: '100%', 
              width: dividerWidth 
            }}
          />
          <div 
            className="absolute bg-gray-200" 
            style={{ 
              left: '0', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '100%', 
              height: dividerWidth 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExcelHowItWorks_Responsive;


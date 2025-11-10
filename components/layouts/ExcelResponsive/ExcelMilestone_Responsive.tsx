import React from 'react';

interface ExcelMilestoneResponsiveProps {
  title?: string;
  milestoneValue?: string;
  growth?: string;
  leftDescription?: string;
  rightDescription?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelMilestone_Responsive: React.FC<ExcelMilestoneResponsiveProps> = ({ 
  title = "Performance Overview",
  milestoneValue = "500+",
  growth = "+32.85% vs last year",
  leftDescription = "Through strategic marketing initiatives and innovative product development, Quantum achieved remarkable growth by welcoming over 500 new clients, validating our position as a leading provider of quantum solutions.",
  rightDescription = "Our comprehensive approach to client acquisition and retention has resulted in sustained revenue growth and market expansion. The implementation of advanced analytics and customer feedback systems has optimized our service delivery.",
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  const isPositive = growth?.startsWith?.('+') || false;
  
  // Parse milestone value
  const numberMatch = milestoneValue.match(/^(\d+(?:\.\d+)?)/);
  const suffixMatch = milestoneValue.match(/[^\d.]+$/);
  const number = numberMatch ? numberMatch[1] : milestoneValue;
  const suffix = suffixMatch ? suffixMatch[0] : '';
  
  return (
    <div 
      className="w-full h-full bg-white  flex flex-col" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: `${24 * scaleFactor}px`,
        paddingTop: `${48 * scaleFactor}px`,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`
      }}
    >
      <div className="flex-1 flex flex-col justify-center" style={{ marginLeft: `${24 * scaleFactor}px` }}>
        <div style={{ marginBottom: `${16 * scaleFactor}px` }}>
          <p className="text-gray-600 text-left" style={{ fontSize: `${14 * scaleFactor}px` }}>Milestone</p>
        </div>
        
        <div className="text-left" style={{ marginBottom: `${16 * scaleFactor}px` }}>
          <div className="font-light text-gray-900 leading-none" style={{ fontSize: `${144 * scaleFactor}px`, marginBottom: `${8 * scaleFactor}px` }}>
            {number}<span style={{ fontSize: `${60 * scaleFactor}px` }}>{suffix}</span>
          </div>
          <div className={`${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`} style={{ fontSize: `${18 * scaleFactor}px` }}>
            <span style={{ marginRight: `${8 * scaleFactor}px` }}>{isPositive ? '↑' : '↓'}</span>
            <span>{growth}</span>
          </div>
        </div>
        
        <div className="flex" style={{ gap: `${32 * scaleFactor}px` }}>
          <div className="text-left" style={{ maxWidth: `${320 * scaleFactor}px` }}>
            <p className="text-gray-700 leading-relaxed" style={{ fontSize: `${14 * scaleFactor}px` }}>
              {leftDescription}
            </p>
          </div>
          <div className="text-left" style={{ maxWidth: `${320 * scaleFactor}px` }}>
            <p className="text-gray-700 leading-relaxed" style={{ fontSize: `${14 * scaleFactor}px` }}>
              {rightDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelMilestone_Responsive;


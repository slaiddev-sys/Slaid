import React from 'react';

interface ExcelResultsTestimonialResponsiveProps {
  title?: string;
  subtitle?: string;
  metrics?: Array<{
    value: string;
    growth: string;
    description: string;
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelResultsTestimonial_Responsive: React.FC<ExcelResultsTestimonialResponsiveProps> = ({ 
  title = "Performance Overview",
  subtitle = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  metrics = [
    { value: "80%", growth: "+35% improvement this year", description: "Reduction in scheduling conflicts for global teams." },
    { value: "50%", growth: "+22% faster than last quarter", description: "Faster meeting setup time due to automation." },
    { value: "95%", growth: "+8% increase from last survey", description: "User satisfaction rate with the new platform." },
    { value: "3.2x", growth: "+45% boost since implementation", description: "Increase in team productivity and efficiency." }
  ],
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
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
      <div style={{ marginBottom: `${24 * scaleFactor}px`, marginLeft: `${24 * scaleFactor}px` }}>
        <h1 className="font-medium text-black" style={{ fontSize: `${24 * scaleFactor}px`, marginBottom: `${8 * scaleFactor}px` }}>{title}</h1>
        <div className="text-left" style={{ maxWidth: `${448 * scaleFactor}px` }}>
          <p className="text-gray-600" style={{ fontSize: `${12 * scaleFactor}px` }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex" style={{ gap: `${48 * scaleFactor}px`, marginBottom: `${32 * scaleFactor}px`, marginLeft: `${32 * scaleFactor}px` }}>
          {metrics.map((metric, index) => {
            const numberMatch = metric.value.match(/^([\d.]+)/);
            const suffixMatch = metric.value.match(/[^\d.]+$/);
            const number = numberMatch ? numberMatch[1] : metric.value;
            const suffix = suffixMatch ? suffixMatch[0] : '';
            
            return (
              <div key={index}>
                <div className="font-light text-gray-900" style={{ fontSize: `${128 * scaleFactor}px`, marginBottom: `${8 * scaleFactor}px` }}>
                  {number}<span style={{ fontSize: `${48 * scaleFactor}px` }}>{suffix}</span>
                </div>
                <div className="text-green-600" style={{ fontSize: `${12 * scaleFactor}px`, marginBottom: `${4 * scaleFactor}px` }}>
                  {metric.growth}
                </div>
                <p className="text-gray-700" style={{ fontSize: `${12 * scaleFactor}px`, maxWidth: `${128 * scaleFactor}px` }}>
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExcelResultsTestimonial_Responsive;



import React from 'react';

interface ExcelExperienceFullTextResponsiveProps {
  title?: string;
  leftText?: string;
  rightText?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelExperienceFullText_Responsive: React.FC<ExcelExperienceFullTextResponsiveProps> = ({ 
  title = "Performance Overview",
  leftText = "At Twindo, we obsess every day over perfecting our software solution, taking the operational complexity out of renewable energy management. Many companies have tried and failed to build their own software—it's a challenging endeavor that requires deep technical expertise and significant resources. Our dedicated team continuously refines and optimizes every aspect of our platform for maximum efficiency, ensuring that complex technical requirements don't become barriers to success.\n\nTwindo provides smart, user-friendly software specifically developed to streamline renewable energy operations. Our intuitive interface and automated workflows reduce complexity while maintaining powerful functionality. Managing renewable energy operations is complex, but it shouldn't be a burden. We simplify operational challenges through intelligent automation and comprehensive monitoring tools, allowing organizations to focus on what matters most—sustainable energy production and growth.",
  rightText = "The renewable energy sector demands precision, reliability, and scalability in every operational aspect. Traditional approaches often fall short when dealing with the dynamic nature of renewable resources and the complexity of modern energy systems. Our comprehensive platform addresses these challenges by providing real-time monitoring, predictive analytics, and automated decision-making capabilities that adapt to changing conditions and optimize performance continuously.\n\nThrough years of industry experience and close collaboration with energy professionals, we've developed solutions that not only meet current operational needs but also anticipate future challenges. Our commitment to innovation ensures that clients benefit from cutting-edge technology while maintaining the stability and reliability essential for critical energy infrastructure. This approach has enabled organizations worldwide to achieve unprecedented levels of operational efficiency and sustainable growth.",
  canvasWidth = 1280,
  canvasHeight = 720
}) => {
  // Calculate responsive scale factor
  const scaleFactor = Math.min(canvasWidth / 1280, canvasHeight / 720);
  
  // Responsive measurements
  const padding = `${24 * scaleFactor}px`;
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const textFontSize = `${14 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const gap = `${32 * scaleFactor}px`;

  // Split texts into paragraphs
  const leftParagraphs = leftText.split('\n').filter(p => p.trim());
  const rightParagraphs = rightText.split('\n').filter(p => p.trim());

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
      {/* Title Section */}
      <div style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize }}>{title}</h1>
      </div>

      <div className="flex h-full" style={{ gap: gap }}>
        
        {/* Left Side - Description Paragraph */}
        <div className="w-1/2 flex flex-col" style={{ marginLeft: marginLeft }}>
          <div className="flex-1">
            {leftParagraphs.map((paragraph, index) => (
              <React.Fragment key={index}>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: textFontSize }}>
                  {paragraph}
                </p>
                {index < leftParagraphs.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Right Side - Additional Description Paragraph */}
        <div className="w-1/2 flex flex-col" style={{ marginLeft: marginLeft }}>
          <div className="flex-1">
            {rightParagraphs.map((paragraph, index) => (
              <React.Fragment key={index}>
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: textFontSize }}>
                  {paragraph}
                </p>
                {index < rightParagraphs.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelExperienceFullText_Responsive;



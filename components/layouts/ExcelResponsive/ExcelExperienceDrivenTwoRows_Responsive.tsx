import React from 'react';

interface ExcelExperienceDrivenTwoRowsResponsiveProps {
  title?: string;
  subtitle?: string;
  insights?: Array<{
    main: string;
    sub: string;
  }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ExcelExperienceDrivenTwoRows_Responsive: React.FC<ExcelExperienceDrivenTwoRowsResponsiveProps> = ({ 
  title = "Performance Overview",
  subtitle = "Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.",
  insights = [
    {
      main: "At Twindo, we obsess every day over perfecting our software solution, taking the operational.",
      sub: "Our dedicated team continuously refines and optimizes every aspect of our platform for maximum efficiency."
    },
    {
      main: "Many companies have tried and failed to build their own software—it's a challenging.",
      sub: "Complex technical requirements and resource constraints often lead to incomplete or ineffective solutions."
    },
    {
      main: "Twindo provides smart, user-friendly software specifically developed to streamline renewable.",
      sub: "Our intuitive interface and automated workflows reduce complexity while maintaining powerful functionality."
    },
    {
      main: "Managing renewable energy operations is complex, but it shouldn't be a burden.",
      sub: "We simplify operational challenges through intelligent automation and comprehensive monitoring tools."
    }
  ],
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
  const paddingTop = `${48 * scaleFactor}px`;
  const titleFontSize = `${24 * scaleFactor}px`;
  const subtitleFontSize = `${12 * scaleFactor}px`;
  const mainTextFontSize = `${18 * scaleFactor}px`;
  const subTextFontSize = `${15 * scaleFactor}px`;
  const marginBottom = `${24 * scaleFactor}px`;
  const titleMarginBottom = `${8 * scaleFactor}px`;
  const marginLeft = `${24 * scaleFactor}px`;
  const gap = `${24 * scaleFactor}px`;
  const rowMarginBottom = `${32 * scaleFactor}px`;
  const iconSize = `${14 * scaleFactor}px`;
  const iconMarginRight = `${12 * scaleFactor}px`;
  const iconMarginTop = `${4 * scaleFactor}px`;
  const subTextMarginTop = `${4 * scaleFactor}px`;

  // Split insights into two rows of 2
  const row1 = insights.slice(0, 2);
  const row2 = insights.slice(2, 4);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white" 
      style={{ 
        aspectRatio: '16/9', 
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: padding,
        paddingTop: paddingTop,
        
      }}
    >
      {/* Title Section */}
      <div style={{ marginBottom: marginBottom, marginLeft: marginLeft }}>
        <h1 className="font-medium text-black" style={{ fontSize: titleFontSize, marginBottom: titleMarginBottom }}>
          {title}
        </h1>
        <div className="text-left" style={{ maxWidth: `${448 * scaleFactor}px` }}>
          <p className="text-gray-600" style={{ fontSize: subtitleFontSize }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex h-full">
        {/* Full Width - Bullet Points in Two Rows */}
        <div className="w-full flex flex-col" style={{ marginLeft: marginLeft }}>
          <div className="flex-1 flex flex-col justify-center">
            {/* First Row - Items 1 and 2 */}
            <div className="flex" style={{ gap: gap, marginBottom: rowMarginBottom }}>
              {row1.map((insight, index) => (
                <div key={index} className="w-1/2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0" style={{ marginTop: iconMarginTop, marginRight: iconMarginRight }}>
                      <svg 
                        width={iconSize} 
                        height={iconSize} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        className="text-gray-600"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 leading-relaxed" style={{ fontSize: mainTextFontSize }}>
                        {insight.main}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: subTextFontSize, marginTop: subTextMarginTop }}>
                        {insight.sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Second Row - Items 3 and 4 */}
            <div className="flex" style={{ gap: gap }}>
              {row2.map((insight, index) => (
                <div key={index} className="w-1/2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0" style={{ marginTop: iconMarginTop, marginRight: iconMarginRight }}>
                      <svg 
                        width={iconSize} 
                        height={iconSize} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        className="text-gray-600"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 leading-relaxed" style={{ fontSize: mainTextFontSize }}>
                        {insight.main}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: subTextFontSize, marginTop: subTextMarginTop }}>
                        {insight.sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelExperienceDrivenTwoRows_Responsive;


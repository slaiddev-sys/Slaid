import React from 'react';
import ImageBlock from '../../blocks/ImageBlock';
import IconBlock from '../../blocks/IconBlock';
import { useFigmaSelection, FigmaImage } from '../../figma';
import type { ImageBlockProps } from '../../blocks/ImageBlock';

export interface ProductiPhoneStandaloneProps {
  /**
   * Main title for the product showcase
   */
  title?: string;
  
  /**
   * Description text that appears below the title
   */
  description?: string;
  
  /**
   * Optional bullet points that appear below the description (icon-based structure like Lists layout)
   */
  bulletPoints?: {
    icon: string;
    title: string;
    description: string;
  }[];

  /**
   * Product images configuration
   */
  productImages?: {
    /**
     * Background image (gradient, abstract, etc.)
     */
    background?: ImageBlockProps;
    /**
     * Main product mockup image (standalone iPhone, etc.)
     */
    mockup?: ImageBlockProps;
  };
  
  /**
   * Layout configuration for component positioning
   */
  layout?: {
    /**
     * Column proportions [text, images] - must add up to 12
     */
    columnSizes?: [number, number];
    /**
     * Show/hide title section
     */
    showTitle?: boolean;
    /**
     * Show/hide description
     */
    showDescription?: boolean;
    
    /**
     * Show/hide bullet points
     */
    showBulletPoints?: boolean;

    /**
     * Show/hide product images
     */
    showImages?: boolean;
  };
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Title text color
   */
  titleColor?: string;
  
  /**
   * Description text color
   */
  descriptionColor?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Use fixed dimensions for exact sizing
   */
  useFixedDimensions?: boolean;
  
  /**
   * Canvas width when using fixed dimensions
   */
  canvasWidth?: number;
  
  /**
   * Canvas height when using fixed dimensions
   */
  canvasHeight?: number;
}

/**
 * Product iPhone Standalone Layout
 * 
 * A specialized layout for showcasing mobile products with explanatory text on the left 
 * and standalone iPhone mockup on the right. Features background image and standalone iPhone mockup 
 * for mobile app and product presentation.
 */
export default function Product_iPhoneStandalone({
  title = 'Our Solution',
  description = 'Discover the next generation of innovation with our cutting-edge solution designed for modern businesses.',
  bulletPoints = [],
  productImages = {
    background: {
      src: '/Default-Image-1.png',
      alt: 'Product background',
      size: 'full',
      fit: 'cover',
      rounded: '2xl'
    },
    mockup: {
      src: '/Iphone-MockUp.png',
      alt: 'iPhone standalone mockup',
      size: 'full',
      fit: 'contain',
      rounded: 'none'
    }
  },
  layout = {
    columnSizes: [5, 7],
    showTitle: true,
    showDescription: true,
    showBulletPoints: false,
    showImages: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
}: ProductiPhoneStandaloneProps) {

  // Custom onUpdate handlers for each image type
  const handleBackgroundImageUpdate = (updates: any) => {
    if (onUpdate && updates.imageUrl) {
      onUpdate({ 
        productImages: {
          ...productImages,
          background: { ...productImages?.background, src: updates.imageUrl }
        }
      });
    }
  };

  const handleAppUIImageUpdate = (updates: any) => {
    if (onUpdate && updates.imageUrl) {
      onUpdate({ appUIImageUrl: updates.imageUrl });
    }
  };

  const handleMockupImageUpdate = (updates: any) => {
    if (onUpdate && updates.imageUrl) {
      onUpdate({ 
        productImages: {
          ...productImages,
          mockup: { ...productImages?.mockup, src: updates.imageUrl }
        }
      });
    }
  };

  // Use Figma selection hooks for multiple images
  const [backgroundState, backgroundHandlers] = useFigmaSelection({
    initialImageUrl: productImages?.background?.src,
    onUpdate: handleBackgroundImageUpdate // 🔧 AUTO-UPDATE: Background image
  });
  const [appUIState, appUIHandlers] = useFigmaSelection({
    initialImageUrl: '/app-ui.png',
    onUpdate: handleAppUIImageUpdate // 🔧 AUTO-UPDATE: App UI image
  });
  const [mockupState, mockupHandlers] = useFigmaSelection({
    initialImageUrl: productImages?.mockup?.src,
    onUpdate: handleMockupImageUpdate // 🔧 AUTO-UPDATE: Mockup image
  });

  // Global click outside handler to deselect all images
  const handleGlobalClickOutside = () => {
    backgroundHandlers.handleClickOutside();
    appUIHandlers.handleClickOutside();
    mockupHandlers.handleClickOutside();
  };

  // Helper function to get proper Tailwind column classes
  const getColumnClass = (span: number) => {
    const colSpanMap: { [key: number]: string } = {
      1: 'lg:col-span-1',
      2: 'lg:col-span-2', 
      3: 'lg:col-span-3',
      4: 'lg:col-span-4',
      5: 'lg:col-span-5',
      6: 'lg:col-span-6',
      7: 'lg:col-span-7',
      8: 'lg:col-span-8',
      9: 'lg:col-span-9',
      10: 'lg:col-span-10',
      11: 'lg:col-span-11',
      12: 'lg:col-span-12'
    };
    return colSpanMap[span] || 'lg:col-span-6';
  };

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
  } : {};

  // Base classes for product showcase layout - no right padding for edge-to-edge image
  const containerClasses = useFixedDimensions 
    ? `product-iphone-standalone pl-6 lg:pl-12 pr-0 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `product-iphone-standalone pl-6 lg:pl-12 pr-0 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `product-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  return (
    <section 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Two Column Layout */}
      <div className="flex h-full relative">
        
        {/* Left Column - Text Content Only */}
        <div className="w-1/2 flex flex-col justify-center pr-8 relative z-10">
          
          {/* Title and Description */}
          {layout.showTitle && (
            <div className="max-w-xs">
              <h2 id={headingId} className="text-3xl lg:text-4xl xl:text-5xl font-normal leading-none tracking-tighter text-gray-900 font-helvetica-neue mb-3" style={{ lineHeight: '0.9', letterSpacing: '-0.05em' }}>
          {title}
              </h2>
              {layout.showDescription && description && (
                <p className="text-xs text-gray-600 font-helvetica-neue leading-relaxed max-w-64">
                  {description}
                </p>
              )}
              
              {/* Optional Bullet Points - Icon-Based Structure */}
              {layout.showBulletPoints && bulletPoints && bulletPoints.length > 0 && (
                <div className="mt-4 space-y-3 max-w-64">
                  {bulletPoints.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        <IconBlock
                          iconName={item.icon as any}
                          size="sm"
                          color="#6B7280"
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900 font-helvetica-neue leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 font-helvetica-neue leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Full Edge-to-Edge Image (breaks out of container and extends left) */}
        <div className="absolute overflow-hidden" style={{ 
          top: '-2rem', 
          right: '0', 
          width: '55%',
          height: 'calc(100vh + 4rem)',
          marginTop: '-2rem'
        }}>
          {/* Background Image with Figma-style Selection */}
          <FigmaImage
            src="/Default-Image-2.png"
            alt="Product showcase background"
            size="full"
            fit="cover"
            align="center"
            rounded={false}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            containerClassName="absolute inset-0 w-full h-full"
            state={backgroundState}
            handlers={backgroundHandlers}
          />
          
          {/* Device Mockup Container - Proper Structure */}
          <div className="absolute flex items-center justify-center" style={{ 
            top: '4rem', 
            right: '4rem', 
            width: '70%', 
            height: '70%',
            zIndex: 10
          }}>
          {/* Device Wrapper - Relative Container */}
            <div className="relative w-full h-full">
              
              {/* Mobile App UI Container - Below iPhone Screen */}
              <div 
                className="absolute overflow-hidden"
                style={{
                  top: '2%',
                  left: '5%',
                  width: '290px',
                  height: '570px',
                  zIndex: 1,
                  borderRadius: '24px'
                }}
        >
                <FigmaImage
                  src="/app-ui.png"
                  alt="Mobile App UI"
                  size="full"
                  fit="cover"
                  align="center"
                  rounded={false}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                  state={appUIState}
                  handlers={appUIHandlers}
                />
              </div>

              {/* iPhone Frame Overlay - Above UI */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 2 }}
        >
                <FigmaImage
                  src={productImages?.mockup?.src || "/Iphone-MockUp.png"}
                  alt={productImages?.mockup?.alt || "iPhone standalone mockup"}
                  size="full"
                  fit="contain"
                  align="center"
                  rounded={false}
                  className="w-full h-full object-contain"
                  containerClassName="w-full h-full pointer-events-auto"
                  state={mockupState}
                  handlers={mockupHandlers}
                />
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

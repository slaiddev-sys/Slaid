import React, { useState, useEffect, useRef } from 'react';
import ImageBlock from '../../blocks/ImageBlock';
import IconBlock from '../../blocks/IconBlock';
import type { ImageBlockProps } from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface ProductPhysicalProductProps {
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
     * Main product mockup image (physical product)
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
  
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: string;
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: string;
  
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

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
}

/**
 * Product Physical Product Layout
 * 
 * A specialized layout for showcasing physical products 
 * with explanatory text on the left and product mockup on grey background on the right.
 */
export default function Product_PhysicalProduct({
  title = 'Our Product',
  description = 'Discover our innovative physical product designed to enhance your everyday experience.',
  bulletPoints = [],
  productImages = {
    mockup: {
      src: '/product-mockup.png',
      alt: 'Product mockup',
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
  titleFontSize = 48,
  titleFontFamily = "font-helvetica-neue",
  titleAlignment = "left",
  descriptionFontSize = 12,
  descriptionFontFamily = "font-helvetica-neue",
  descriptionAlignment = "left",
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform
}: ProductPhysicalProductProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [titleAlignmentState, setTitleAlignment] = useState(titleAlignment);
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [descriptionAlignmentState, setDescriptionAlignment] = useState(descriptionAlignment);

  // Additional styling state (colors)
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#1f2937');
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || '#6b7280');

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  // Sync styling props with state
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setTitleAlignment(titleAlignment);
  }, [titleAlignment]);

  useEffect(() => {
    setDescriptionFontSize(descriptionFontSize);
  }, [descriptionFontSize]);

  useEffect(() => {
    setDescriptionFontFamily(descriptionFontFamily);
  }, [descriptionFontFamily]);

  useEffect(() => {
    setDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  // Text selection handlers
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  
  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as 'title' | 'description' | null,
    lastTargetElement: null as 'title' | 'description' | null
  });

  // Use Figma selection hook for the product mockup
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialImageUrl: '/product-mockup.png?v=2',
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleDescriptionTextChange = (newText: string) => {
    setCurrentDescription(newText);
    if (onUpdate) {
      onUpdate({ description: newText });
    }
  };

  // Style change handlers
  const handleTitleChangeSize = (fontSize: number) => {
    setTitleFontSize(fontSize);
    if (onUpdate) onUpdate({ titleFontSize: fontSize });
  };

  const handleTitleChangeFont = (fontFamily: string) => {
    setTitleFontFamily(fontFamily);
    if (onUpdate) onUpdate({ titleFontFamily: fontFamily });
  };

  const handleTitleChangeColor = (color: string) => {
    setCurrentTitleColor(color);
    if (onUpdate) onUpdate({ titleColor: color });
  };

  const handleTitleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setTitleAlignment(alignment);
    if (onUpdate) onUpdate({ titleAlignment: alignment });
  };

  const handleDescriptionChangeSize = (fontSize: number) => {
    setDescriptionFontSize(fontSize);
    if (onUpdate) onUpdate({ descriptionFontSize: fontSize });
  };

  const handleDescriptionChangeFont = (fontFamily: string) => {
    setDescriptionFontFamily(fontFamily);
    if (onUpdate) onUpdate({ descriptionFontFamily: fontFamily });
  };

  const handleDescriptionChangeColor = (color: string) => {
    setCurrentDescriptionColor(color);
    if (onUpdate) onUpdate({ descriptionColor: color });
  };

  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setDescriptionAlignment(alignment);
    if (onUpdate) onUpdate({ descriptionAlignment: alignment });
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) onUpdate({ title: '' });
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) onUpdate({ description: '' });
    if (textSelectionHandlers.handleDescriptionDelete) {
      textSelectionHandlers.handleDescriptionDelete();
    }
  };

  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Custom drag handlers
  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (textSelectionHandlers.handleTitleDragStart) {
      textSelectionHandlers.handleTitleDragStart(e, element);
    }
  };

  const handleDescriptionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (textSelectionHandlers.handleDescriptionDragStart) {
      textSelectionHandlers.handleDescriptionDragStart(e, element);
    }
  };

  // Track previous dragging states
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false
  });

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      const transform = activeTarget === 'title' 
        ? textSelectionState.titleTransform 
        : textSelectionState.descriptionTransform;
      
      const isDragging = activeTarget === 'title'
        ? textSelectionState.isTitleDragging
        : textSelectionState.isDescriptionDragging;

      const wasDragging = activeTarget === 'title'
        ? prevDraggingRef.current.isTitleDragging
        : prevDraggingRef.current.isDescriptionDragging;
      
      if (transform) {
        setTextPopupState(prev => {
          const newPosition = {
            x: prev.originalPosition.x + (transform.x || 0),
            y: prev.originalPosition.y + (transform.y || 0)
          };

          const shouldUpdateOriginal = !isDragging && wasDragging;
          
          return {
            ...prev,
            position: newPosition,
            originalPosition: shouldUpdateOriginal ? newPosition : prev.originalPosition
          };
        });
      }
    }

    // Update previous dragging states
    prevDraggingRef.current = {
      isTitleDragging: textSelectionState.isTitleDragging,
      isDescriptionDragging: textSelectionState.isDescriptionDragging
    };
  }, [
    textSelectionState.titleTransform, 
    textSelectionState.descriptionTransform, 
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    textPopupState.isOpen, 
    textPopupState.targetElement,
    textPopupState.lastTargetElement
  ]);

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

  // Global click outside handler
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      return;
    }
    
    figmaHandlers.handleClickOutside();
    textSelectionHandlers.handleClickOutside();
    setTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
  };

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    // CRITICAL: Fixed canvas size - never changes regardless of content
    overflow: 'visible',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
  } : {
    // For responsive mode, still apply containment to prevent layout influence
    overflow: 'visible',
    contain: 'layout style',
    width: '100%',
    height: '100vh',
    minHeight: '100vh',
  };

  // Base classes for product showcase layout - no right padding for edge-to-edge grey background
  const containerClasses = useFixedDimensions 
    ? `product-physical-product pl-6 lg:pl-12 pr-0 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `product-physical-product pl-6 lg:pl-12 pr-0 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `product-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <section 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Two Column Layout */}
      <div className="flex h-full relative">
        
        {/* Left Column - Text Content Only */}
        <div className="w-1/2 flex flex-col justify-center pr-8 relative z-10" style={{
          // CRITICAL: Fixed positioning container to prevent layout shifts
          position: 'relative',
          overflow: 'visible',
          contain: 'layout style'
        }}>
          
          {/* Title and Description */}
          {layout.showTitle && (
            <div className="max-w-xs relative">
              {/* Title */}
              <div 
                className="title-layer absolute pointer-events-auto"
                style={{
                  left: '0px',
                  top: '-80px',
                  width: 'auto',
                  maxWidth: '320px',
                  zIndex: 10,
                  overflow: 'visible',
                  contain: 'none',
                  position: 'absolute'
                }}
              >
                <FigmaText
                  variant="title"
                  color={currentTitleColor}
                  align={titleAlignmentState as 'left' | 'center' | 'right' | 'justify'}
                  fontFamily={titleFontFamilyState}
                  className={`text-3xl font-normal font-helvetica-neue leading-none tracking-tighter text-left break-words`}
                  style={{
                    fontSize: `${titleFontSizeState}px`,
                    color: currentTitleColor,
                    textAlign: titleAlignmentState as any,
                    lineHeight: '0.9',
                    letterSpacing: '-0.05em',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={textSelectionState.isTitleSelected}
                  transform={textSelectionState.titleTransform}
                  onClick={textSelectionHandlers.handleTitleClick}
                  onTextChange={handleTitleTextChange}
                  onSizeChange={handleTitleSizeChange}
                  onChangeSize={handleTitleChangeSize}
                  onChangeFont={handleTitleChangeFont}
                  onDragStart={handleTitleDragStart}
                  onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                  onDeleteText={handleTitleDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const titleElement = document.querySelector('.product-physical-product .title-layer');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.product-physical-product') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (titleRect.left - canvasRect.left) - 10;
                        const relativeY = (titleRect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily,
                          targetElement: 'title',
                          lastTargetElement: 'title'
                        });
                      }
                    }
                  }}>
                  {currentTitle}
                </FigmaText>
              </div>

              {/* Description */}
              {layout.showDescription && (
                <div 
                  className="description-layer absolute pointer-events-auto"
                  style={{
                    left: '0px',
                    top: '-30px',
                    width: 'auto',
                    maxWidth: '256px',
                    zIndex: 10,
                    overflow: 'visible',
                    contain: 'none',
                    position: 'absolute'
                  }}
                >
                  <FigmaText
                    variant="body"
                    color={currentDescriptionColor}
                    align={descriptionAlignmentState as 'left' | 'center' | 'right' | 'justify'}
                    fontFamily={descriptionFontFamilyState}
                    className={`text-xs font-helvetica-neue text-left break-words`}
                    style={{
                      fontSize: `${descriptionFontSizeState}px`,
                      color: currentDescriptionColor,
                      textAlign: descriptionAlignmentState as any,
                      lineHeight: '1.5',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={textSelectionState.isDescriptionSelected}
                    transform={textSelectionState.descriptionTransform}
                    onClick={textSelectionHandlers.handleDescriptionClick}
                    onTextChange={handleDescriptionTextChange}
                    onSizeChange={handleDescriptionSizeChange}
                    onChangeSize={handleDescriptionChangeSize}
                    onChangeFont={handleDescriptionChangeFont}
                    onDragStart={handleDescriptionDragStart}
                    onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                    onDeleteText={handleDescriptionDelete}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      const descriptionElement = document.querySelector('.product-physical-product .description-layer');
                      if (descriptionElement) {
                        const descriptionRect = descriptionElement.getBoundingClientRect();
                        const canvasContainer = descriptionElement.closest('.product-physical-product') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                          const relativeY = (descriptionRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'description',
                            lastTargetElement: 'description'
                          });
                        }
                      }
                    }}>
                    {currentDescription}
                  </FigmaText>
                </div>
              )}
              
              {/* Optional Bullet Points - Icon-Based Structure */}
              {layout.showBulletPoints && bulletPoints && bulletPoints.length > 0 && (
                <div className="mt-4 space-y-3 max-w-64" style={{
                  // CRITICAL: Fixed positioning to prevent layout shifts
                  position: 'relative',
                  flexShrink: 0,
                  overflow: 'visible',
                  contain: 'layout style'
                }}>
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

        {/* Right Column - Grey Background with Product Mockup */}
        <div className="absolute overflow-hidden" style={{ 
          top: '-2rem', 
          right: '0', 
          width: '55%',
          height: 'calc(100vh + 4rem)',
          marginTop: '-2rem',
          backgroundColor: '#EDEDED'
        }}>
          {/* Product Mockup Container with Figma-style Selection */}
          <div className="absolute flex items-start justify-center w-full h-full pt-16">
            {layout.showImages && productImages.mockup && (
              <FigmaImage
                src="/product-mockup.png?v=2"
                alt="Product mockup"
                size="full"
                fit="contain"
                align="center"
                rounded={false}
                className="w-full h-full object-contain max-w-md max-h-96"
                containerClassName="w-full h-full max-w-md max-h-96"
                state={figmaState}
                handlers={figmaHandlers}
              />
            )}
          </div>
        </div>

      </div>
    </section>
  );

  // Conditionally wrap with CanvasOverlay for fixed dimensions
  return useFixedDimensions ? (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      {/* Text Popup */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleDescriptionChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentDescriptionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? titleAlignmentState : descriptionAlignmentState}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  ) : (
    <>
      {content}
      {/* Text Popup for responsive mode */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleDescriptionChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentDescriptionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? titleAlignmentState : descriptionAlignmentState}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}

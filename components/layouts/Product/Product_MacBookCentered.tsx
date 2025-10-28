'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ImageBlock, IconBlock } from '../../blocks';
import { useFigmaSelection, useFigmaMultiSelection, FigmaImage, FigmaLogo, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface ProductMacBookCenteredProps {
  title?: string;
  description?: string;
  bulletPoints?: {
    icon: string;
    title: string;
    description: string;
  }[];
  productImages?: {
    mockup?: {
      src: string;
      alt: string;
      size: string;
      fit: string;
      rounded: string;
    };
    uiOverlay?: {
      src: string;
      alt: string;
      size: string;
      fit: string;
      rounded: string;
    };
  };
  layout?: {
    showTitle?: boolean;
    showDescription?: boolean;
    showBulletPoints?: boolean;
    showImages?: boolean;
    columnSizes?: [number, number];
  };
  fontFamily?: string;
  titleColor?: string;
  descriptionColor?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: string;
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: string;
  useFixedDimensions?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  className?: string;
  onUpdate?: (updates: any) => void;

  /**
   * Saved mockup image transform for position persistence
   */
  mockupImageTransform?: { x: number; y: number };

  /**
   * Saved SaaS UI image transform for position persistence
   */
  saasImageTransform?: { x: number; y: number };

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
}

const Product_MacBookCentered: React.FC<ProductMacBookCenteredProps> = ({
  title = "Our Solution",
  description = "Experience the future of productivity with our innovative platform designed to streamline your workflow and boost efficiency.",
  bulletPoints = [],
  productImages = {
    mockup: {
      src: "/McBook-MockUp.png",
      alt: "MacBook mockup",
      size: "full",
      fit: "contain",
      rounded: "none"
    },
    uiOverlay: {
      src: "/Saas-preview.png",
      alt: "SaaS UI Preview",
      size: "full",
      fit: "cover",
      rounded: "none"
    }
  },
  layout = {
    showTitle: true,
    showDescription: true,
    showBulletPoints: false,
    showImages: true,
    columnSizes: [12, 12]
  },
  fontFamily = "font-helvetica-neue",
  titleColor = "text-black",
  descriptionColor = "text-gray-600",
  titleFontSize = 48,
  titleFontFamily = "font-helvetica-neue",
  titleAlignment = "center",
  descriptionFontSize = 12,
  descriptionFontFamily = "font-helvetica-neue",
  descriptionAlignment = "center",
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  className = "",
  onUpdate,
  mockupImageTransform: savedMockupImageTransform,
  saasImageTransform: savedSaasImageTransform,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform
}) => {

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

  // Additional styling state (colors)
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#000000');
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || '#6b7280');

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

  // Custom onUpdate handler for multi-image updates
  const handleMultiImageUpdate = (updates: any) => {
    if (onUpdate) {
      // Handle image URL changes
      if (updates.imageUrl) {
        // Determine which image was updated based on the imageId
        if (updates.imageId === 'mockup') {
          onUpdate({
            productImages: {
              ...productImages,
              mockup: { ...productImages?.mockup, src: updates.imageUrl }
            }
          });
        } else if (updates.imageId === 'saas') {
          onUpdate({
            productImages: {
              ...productImages,
              uiOverlay: { ...productImages?.uiOverlay, src: updates.imageUrl }
            }
          });
        }
      }
      
      // Handle image transform changes
      if (updates.imageTransform && updates.imageId) {
        if (updates.imageId === 'mockup') {
          onUpdate({
            mockupImageTransform: updates.imageTransform
          });
        } else if (updates.imageId === 'saas') {
          onUpdate({
            saasImageTransform: updates.imageTransform
          });
        }
      }
    }
  };

  // Set up multi-selection hook for both images (single selection behavior)
  const [multiState, multiHandlers] = useFigmaMultiSelection({
    imageIds: ['mockup', 'saas'],
    initialImageUrls: {
      mockup: productImages?.mockup?.src || "/McBook-MockUp.png",
      saas: productImages?.uiOverlay?.src || "/Saas-preview.png"
    },
    initialImageTransforms: {
      mockup: savedMockupImageTransform || { x: 0, y: 0 },
      saas: savedSaasImageTransform || { x: 0, y: 0 }
    },
    onUpdate: handleMultiImageUpdate // 🔧 AUTO-UPDATE: Multi-image updates
  });
  
  // Get individual image handlers
  const mockupHandlers = multiHandlers.getImageHandlers('mockup');
  const saasHandlers = multiHandlers.getImageHandlers('saas');

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
    
    multiHandlers.handleClickOutside();
    textSelectionHandlers.handleClickOutside();
    setTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
  };

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

  const content = (
    <div 
      className="product-macbook-centered w-full min-h-screen flex flex-col items-center justify-start p-4 bg-white pt-16"
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
      {/* Title and Description at Top */}
      <div className="w-full text-center mb-2 relative z-30" style={{ 
        // CRITICAL: Fixed positioning container to prevent layout shifts
        position: 'relative',
        height: '120px', // Fixed height to prevent expansion
        overflow: 'visible',
        contain: 'layout style'
      }}>
        {layout.showTitle && (
          <div 
            className="title-layer absolute pointer-events-auto"
            style={{
              left: '50%',
              top: '0px',
              transform: 'translateX(-50%)',
              width: 'auto',
              zIndex: 30,
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
              className={`text-3xl font-normal font-helvetica-neue leading-none tracking-tighter text-center break-words`}
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
                const titleElement = document.querySelector('.product-macbook-centered .title-layer');
                if (titleElement) {
                  const titleRect = titleElement.getBoundingClientRect();
                  const canvasContainer = titleElement.closest('.product-macbook-centered') as HTMLElement;
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
        )}
        
        {layout.showDescription && (
          <div 
            className="description-layer absolute pointer-events-auto"
            style={{
              left: '50%',
              top: '55px',
              transform: 'translateX(-50%)',
              width: 'auto',
              maxWidth: '512px',
              zIndex: 30,
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
              className={`text-xs font-helvetica-neue text-center break-words`}
              style={{
                fontSize: `${descriptionFontSizeState}px`,
                color: currentDescriptionColor,
                textAlign: descriptionAlignmentState as any,
                lineHeight: '1.2',
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
                const descriptionElement = document.querySelector('.product-macbook-centered .description-layer');
                if (descriptionElement) {
                  const descriptionRect = descriptionElement.getBoundingClientRect();
                  const canvasContainer = descriptionElement.closest('.product-macbook-centered') as HTMLElement;
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
      </div>

      {/* MacBook Mockup with SaaS Preview on Screen */}
      <div className="relative w-full max-w-7xl h-[500px] mb-8 mx-auto mt-24" style={{
        // CRITICAL: Fixed dimensions to prevent layout shifts
        position: 'relative',
        flexShrink: 0,
        overflow: 'visible',
        contain: 'layout style'
      }}>
        {/* MacBook Mockup - Bottom Layer - Fully clickable */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          <FigmaImage
            src="/McBook-MockUp.png"
            alt="MacBook mockup"
            size="full"
            fit="contain"
            align="center"
            rounded={false}
            className="w-full h-full object-contain"
            containerClassName="w-full h-full"
            imageState={multiState.images.mockup}
            imageHandlers={mockupHandlers}
          />
        </div>
        
        {/* SaaS Preview - Top Layer - Inside MacBook Screen - Clickable */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="relative pointer-events-auto" style={{ width: '75%', height: '65%', top: '-13%', left: '0.2%' }}>
            <FigmaImage
              src="/Saas-preview.png"
              alt="SaaS Preview"
              size="full"
              fit="cover"
              align="center"
              rounded={true}
              className="w-full h-full object-cover object-top rounded-lg"
              containerClassName="w-full h-full rounded-lg"
              imageState={multiState.images.saas}
              imageHandlers={saasHandlers}
            />
          </div>
        </div>
      </div>

      {/* Optional Bullet Points at Bottom */}
      {layout.showBulletPoints && bulletPoints && bulletPoints.length > 0 && (
        <div className="w-full mt-8 relative z-30" style={{
          // CRITICAL: Fixed positioning to prevent layout shifts
          position: 'relative',
          flexShrink: 0,
          overflow: 'visible',
          contain: 'layout style'
        }}>
          <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            {bulletPoints.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <IconBlock
                    iconName={item.icon as any}
                    color="#6B7280"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`${fontFamily} text-black font-medium text-sm mb-1`}>
                    {item.title}
                  </h3>
                  <p className={`${fontFamily} text-gray-600 text-xs leading-relaxed`}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? titleAlignmentState as 'left' | 'center' | 'right' : descriptionAlignmentState as 'left' | 'center' | 'right'}
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
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? titleAlignmentState as 'left' | 'center' | 'right' : descriptionAlignmentState as 'left' | 'center' | 'right'}
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
};

export default Product_MacBookCentered;

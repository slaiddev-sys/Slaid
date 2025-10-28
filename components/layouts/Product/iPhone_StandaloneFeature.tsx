import React, { useState, useEffect, useRef } from 'react';
import { useFigmaSelection, useFigmaMultiSelection, FigmaImage, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface iPhoneStandaloneFeatureProps {
  /**
   * Main image URL for the left column
   */
  imageUrl?: string;
  
  /**
   * Alt text for the main image
   */
  imageAlt?: string;
  
  /**
   * iPhone mockup image URL
   */
  mockupImageUrl?: string;
  
  /**
   * App UI image URL
   */
  appUIImageUrl?: string;
  
  /**
   * Main title text
   */
  title?: string;
  
  /**
   * Paragraph text content
   */
  paragraph?: string;
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Title text color
   */
  titleColor?: string;
  
  /**
   * Paragraph text color
   */
  paragraphColor?: string;
  
  /**
   * Title className for additional styling (font weight, size, etc.)
   */
  titleClassName?: string;
  
  /**
   * Paragraph className for additional styling
   */
  paragraphClassName?: string;
  
  /**
   * Whether to use fixed canvas dimensions (default: false for responsive)
   */
  useFixedDimensions?: boolean;
  
  /**
   * Canvas width in pixels (only used when useFixedDimensions is true)
   */
  canvasWidth?: number;
  
  /**
   * Canvas height in pixels (only used when useFixedDimensions is true)
   */
  canvasHeight?: number;
  
  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Right column horizontal padding (default: responsive)
   */
  rightPadding?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Rounded corners for the left image. Defaults to rounded-xl.
   * Set to false to disable, or provide a specific radius: 'sm'|'md'|'lg'|'xl'|'full'.
   */
  imageRounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Which side the image should appear on. Defaults to 'left'.
   * Set to 'right' to render Image on the right and Text on the left.
   */
  imageSide?: 'left' | 'right';

  /**
   * Toggle visibility of the image. When false, the text column expands to full width.
   * Defaults to true.
   */
  showImage?: boolean;

  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: string;
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: string;

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };

  /**
   * Saved image transforms for position persistence
   */
  imageTransform?: { x: number; y: number };
  mockupImageTransform?: { x: number; y: number };
  appUIImageTransform?: { x: number; y: number };
}

/**
 * iPhone_StandaloneFeature - Two-column product feature layout
 * 
 * Left column (50%): Full-height product image with standalone iPhone mockup
 * Right column (50%): Vertically centered content stack (title, paragraph)
 * 
 * Responsive by default, fits within slide canvas without breaking editor layout.
 */
export default function iPhone_StandaloneFeature({
  imageUrl = '/Default-Image-2.png',
  imageAlt = 'Product image',
  mockupImageUrl = '/Iphone-MockUp.png',
  appUIImageUrl = '/app-ui.png',
  title = 'Product Presentation',
  paragraph = 'Lorem ipsum dolor sit amet consectetur adipiscing elit etiam nec suscipit dui sed cursus nibh id risus ultrices convallis phasellus vel tristique diam nam placerat.',
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  paragraphColor = 'text-gray-600',
  titleClassName = 'font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tight break-words overflow-wrap-anywhere whitespace-normal',
  paragraphClassName = 'text-[12px]',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  rightPadding,
  className = '',
  imageRounded = false,
  imageSide = 'right',
  showImage = true,
  titleFontSize = 48,
  titleFontFamily = "font-helvetica-neue",
  titleAlignment = "center",
  descriptionFontSize = 12,
  descriptionFontFamily = "font-helvetica-neue",
  descriptionAlignment = "left",
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  imageTransform: savedImageTransform,
  mockupImageTransform: savedMockupImageTransform,
  appUIImageTransform: savedAppUIImageTransform
}: iPhoneStandaloneFeatureProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(paragraph);

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(paragraph);
  }, [paragraph]);

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

  // Styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [titleAlignmentState, setTitleAlignment] = useState(titleAlignment);
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [descriptionAlignmentState, setDescriptionAlignment] = useState(descriptionAlignment);

  // Additional styling state (colors)
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#1f2937');
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(paragraphColor || '#6b7280');

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
  
  // Use multi-selection hook for three images (like McBook Feature) - background + iPhone + app UI
  // Custom onUpdate handler for multi-image updates
  const handleMultiImageUpdate = (updates: any) => {
    if (onUpdate) {
      // Handle image URL updates
      if (updates.imageUrl) {
        // Determine which image was updated based on the imageId
        if (updates.imageId === 'background') {
          onUpdate({ imageUrl: updates.imageUrl });
        } else if (updates.imageId === 'mockup') {
          onUpdate({ mockupImageUrl: updates.imageUrl });
        } else if (updates.imageId === 'appui') {
          onUpdate({ appUIImageUrl: updates.imageUrl });
        }
      }
      
      // Handle image transform updates (position persistence)
      if (updates.imageTransform) {
        if (updates.imageId === 'background') {
          onUpdate({ imageTransform: updates.imageTransform });
        } else if (updates.imageId === 'mockup') {
          onUpdate({ mockupImageTransform: updates.imageTransform });
        } else if (updates.imageId === 'appui') {
          onUpdate({ appUIImageTransform: updates.imageTransform });
        }
      }
    }
  };

  const [multiState, multiHandlers] = useFigmaMultiSelection({
    imageIds: ['background', 'mockup', 'appui'],
    initialImageUrls: {
      background: imageUrl,
      mockup: mockupImageUrl,
      appui: appUIImageUrl
    },
    initialImageTransforms: {
      background: savedImageTransform || { x: 0, y: 0 },
      mockup: savedMockupImageTransform || { x: 0, y: 0 },
      appui: savedAppUIImageTransform || { x: 0, y: 0 }
    },
    onUpdate: handleMultiImageUpdate // 🔧 AUTO-UPDATE: Multi-image updates
  });
  
  // Get individual image handlers
  const backgroundHandlers = multiHandlers.getImageHandlers('background');
  const mockupHandlers = multiHandlers.getImageHandlers('mockup');
  const appUIHandlers = multiHandlers.getImageHandlers('appui');

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
      onUpdate({ paragraph: newText });
    }
  };

  // Style change handlers
  const handleTitleChangeSize = (fontSize: number) => {
    setTitleFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ titleFontSize: fontSize });
    }
  };

  const handleTitleChangeFont = (fontFamily: string) => {
    setTitleFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ titleFontFamily: fontFamily });
    }
  };

  const handleTitleChangeColor = (color: string) => {
    setCurrentTitleColor(color);
    if (onUpdate) {
      onUpdate({ titleColor: color });
    }
  };

  const handleTitleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setTitleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ titleAlignment: alignment });
    }
  };

  const handleDescriptionChangeSize = (fontSize: number) => {
    setDescriptionFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ descriptionFontSize: fontSize });
    }
  };

  const handleDescriptionChangeFont = (fontFamily: string) => {
    setDescriptionFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ descriptionFontFamily: fontFamily });
    }
  };

  const handleDescriptionChangeColor = (color: string) => {
    setCurrentDescriptionColor(color);
    if (onUpdate) {
      onUpdate({ descriptionColor: color });
    }
  };

  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setDescriptionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ descriptionAlignment: alignment });
    }
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) {
      onUpdate({ paragraph: '' });
    }
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

  // Global click outside handler to deselect all
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

  // Responsive padding or fixed padding
  const rightColumnStyle = rightPadding ? {
    paddingLeft: `${rightPadding}px`,
    paddingRight: `${rightPadding}px`,
  } : {};

  const isImageRight = imageSide === 'right';
  const hasImage = showImage && !!imageUrl;

  const content = (
    <div 
      className={`iphone-standalonefeature-layout flex items-stretch justify-start gap-x-6 lg:gap-x-8 w-full h-full min-h-[400px] overflow-hidden ${className}`}
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
      {/* Multi-Image Column with Independent Figma Selection - copied from McBook Feature */}
      {hasImage && (
        <div 
          className={`relative h-full flex-none ${isImageRight ? 'order-2' : 'order-1'}`}
          style={{ width: '50%', flexBasis: '50%' }}
        >
          {/* Background Image - Independently selectable */}
          <FigmaImage
            src={imageUrl}
            alt={imageAlt}
            size="full"
            fit="cover"
            align="center"
            rounded={typeof imageRounded === 'boolean' ? imageRounded : false}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            containerClassName="w-full h-full"
            imageState={multiState.images.background}
            imageHandlers={backgroundHandlers}
          />
          
          {/* iPhone Mockup Container - Copied exactly from iPhone in Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 20 }}>
            <div className="relative w-full max-w-xs h-[350px]">
              {/* App UI - Inside iPhone Screen - Clickable */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="relative pointer-events-auto" style={{ width: '90%', height: '130%', top: '19%', left: '0%' }}>
                  <FigmaImage
                    src="/app-ui.png"
                    alt="Mobile App UI"
                    size="full"
                    fit="cover"
                    align="center"
                    rounded="3xl"
                    className="w-full h-full object-cover object-top rounded-[2.5rem]"
                    containerClassName="w-full h-full"
                    imageState={multiState.images.appui}
                    imageHandlers={appUIHandlers}
                  />
                </div>
              </div>
              
              {/* iPhone Mockup - Top Layer with Transparent Screen - Clickable */}
              <div className="relative z-20 pointer-events-auto">
                <FigmaImage
                  src="/Iphone-MockUp.png"
                  alt="iPhone mockup"
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
            </div>
          </div>
        </div>
      )}

      {/* Right Column - Content Stack */}
      <div 
        className={`relative flex flex-col justify-center items-start h-full flex-1 min-w-0 ${isImageRight ? 'order-1' : 'order-2'} ${fontFamily} z-10 pointer-events-none`}
        style={{
          ...rightColumnStyle,
          // CRITICAL: Fixed positioning container to prevent layout shifts
          position: 'relative',
          overflow: 'visible',
          contain: 'layout style'
        }}
      >
        {/* Content stack container with interactive text */}
        <div className="content-stack flex flex-col w-full pl-8 lg:pl-12 pointer-events-auto relative">
          {/* Title */}
          <div 
            className="title-layer absolute pointer-events-auto"
            style={{
              left: '40px',
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
              align={titleAlignmentState}
              fontFamily={titleFontFamily}
              className={`text-3xl font-normal font-helvetica-neue leading-none tracking-tighter text-left break-words`}
              style={{
                fontSize: `${titleFontSize}px`,
                color: currentTitleColor,
                textAlign: titleAlignmentState as 'left' | 'center' | 'right',
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
                const titleElement = document.querySelector('.iphone-standalonefeature-layout .title-layer');
                if (titleElement) {
                  const titleRect = titleElement.getBoundingClientRect();
                  const canvasContainer = titleElement.closest('.iphone-standalonefeature-layout') as HTMLElement;
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
          <div 
            className="description-layer absolute pointer-events-auto"
            style={{
              left: '40px',
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
              align={descriptionAlignmentState}
              fontFamily={descriptionFontFamilyState}
              className={`text-xs font-helvetica-neue text-left break-words`}
              style={{
                fontSize: `${descriptionFontSizeState}px`,
                color: currentDescriptionColor,
                textAlign: descriptionAlignmentState as 'left' | 'center' | 'right',
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
                const descriptionElement = document.querySelector('.iphone-standalonefeature-layout .description-layer');
                if (descriptionElement) {
                  const descriptionRect = descriptionElement.getBoundingClientRect();
                  const canvasContainer = descriptionElement.closest('.iphone-standalonefeature-layout') as HTMLElement;
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
        </div>
      </div>
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
}

import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import { useFigmaSelection, FigmaLogo, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface CoverTextCenterProps {
  // Image props
  imageUrl?: string;
  imageAlt?: string;
  showImage?: boolean;
  imageMaxH?: string; // CSS value for max height, default "75%"
  
  // Logo props
  logoUrl?: string;
  logoAlt?: string;
  showLogo?: boolean;

  // Text content
  title?: string;
  paragraph?: string;

  // Styling
  fontFamily?: string;
  titleColor?: string;
  paragraphColor?: string;
  titleClassName?: string;
  paragraphClassName?: string;

  // Canvas dimensions
  canvasWidth?: number;
  canvasHeight?: number;

  // Canvas editing
  onUpdate?: (updates: any) => void;
  useFixedDimensions?: boolean;

  // Transform overrides for dragged elements
  titleTransform?: { x: number; y: number };
  paragraphTransform?: { x: number; y: number };
  logoTransform?: { x: number; y: number };
  
  // Font styling overrides
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  paragraphFontSize?: number;
  paragraphFontFamily?: string;
  paragraphAlignment?: 'left' | 'center' | 'right';
  
  className?: string;
}

export default function Cover_TextCenter({
  imageUrl = '/Default-Image-2.png',
  imageAlt = 'Default Image',
  showImage = true,
  imageMaxH = '75%',
  logoUrl = '/logo-placeholder.png',
  logoAlt = 'Logo',
  showLogo = true,
  title = 'Professional Presentation',
  paragraph = 'Transforming ideas into results with strategy, craft, and measurable impact.',
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  paragraphColor = 'text-gray-600',
  titleClassName = 'font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tighter break-words overflow-wrap-anywhere whitespace-normal',
  paragraphClassName = 'text-[14px]',
  canvasWidth = 1280,
  canvasHeight = 720,
  useFixedDimensions = false,
  className = '',
  onUpdate,
  titleTransform: savedTitleTransform,
  paragraphTransform: savedParagraphTransform,
  logoTransform: savedLogoTransform,
  titleFontSize: savedTitleFontSize,
  titleFontFamily: savedTitleFontFamily,
  titleAlignment: savedTitleAlignment,
  paragraphFontSize: savedParagraphFontSize,
  paragraphFontFamily: savedParagraphFontFamily,
  paragraphAlignment: savedParagraphAlignment
}: CoverTextCenterProps) {

  // Text content state - same as Cover_ProductLayout
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentParagraph, setCurrentParagraph] = useState(paragraph);

  // Text styling state
  const [titleFontSize, setTitleFontSize] = useState(savedTitleFontSize || 48);
  const [titleFontFamily, setTitleFontFamily] = useState(savedTitleFontFamily || fontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(savedTitleAlignment || 'center');

  const [paragraphFontSize, setParagraphFontSize] = useState(savedParagraphFontSize || 14);
  const [paragraphFontFamily, setParagraphFontFamily] = useState(savedParagraphFontFamily || fontFamily);
  const [currentParagraphColor, setCurrentParagraphColor] = useState(paragraphColor);
  const [currentParagraphAlignment, setCurrentParagraphAlignment] = useState<'left' | 'center' | 'right'>(savedParagraphAlignment || 'center');

  // Text selection handlers with initial width constraints and saved transforms
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedParagraphTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });

  // Use Figma selection hook with saved logo transform
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialLogoUrl: logoUrl,
    initialLogoTransform: savedLogoTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });

  // 🔧 DRAG POSITION SAVING: Now handled automatically by useFigmaSelection hook with onUpdate

  // No need for restore effect - transforms are initialized correctly from the start!
  
  // Let text width adapt to content naturally - no fixed constraints

  // Text popup state (moved from FigmaText to layout level for proper z-index)
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 }, // Store original position for drag offset calculation
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'description' | null,
    lastTargetElement: null as 'title' | 'description' | null // Track last target for drag updates
  });
  
  // Text change handlers - same as Cover_ProductLayout
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
    setCurrentTitleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ titleAlignment: alignment });
    }
  };

  const handleParagraphChangeSize = (fontSize: number) => {
    setParagraphFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ paragraphFontSize: fontSize });
    }
  };

  const handleParagraphChangeFont = (fontFamily: string) => {
    setParagraphFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ paragraphFontFamily: fontFamily });
    }
  };

  const handleParagraphChangeColor = (color: string) => {
    setCurrentParagraphColor(color);
    if (onUpdate) {
      onUpdate({ paragraphColor: color });
    }
  };

  const handleParagraphChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentParagraphAlignment(alignment);
    if (onUpdate) {
      onUpdate({ paragraphAlignment: alignment });
    }
  };

  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleParagraphTextChange = (newText: string) => {
    setCurrentParagraph(newText);
    if (onUpdate) {
      onUpdate({ paragraph: newText });
    }
  };

  // Create custom logo handlers that include onUpdate
  const customLogoHandlers = {
    ...figmaHandlers,
    handleLogoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // Call the original handler first
      if (figmaHandlers.handleLogoFileChange) {
        figmaHandlers.handleLogoFileChange(event);
      }
      
      // Then call onUpdate with the new image URL
      const file = event.target.files?.[0];
      if (file && onUpdate) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newSrc = e.target?.result as string;
          if (newSrc) {
            onUpdate({ logoUrl: newSrc });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };


  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleParagraphDelete = () => {
    setCurrentParagraph('');
    if (textSelectionHandlers.handleDescriptionDelete) {
      textSelectionHandlers.handleDescriptionDelete();
    }
  };

  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleParagraphSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Custom drag handlers that update popup position
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

  // Track previous dragging states to detect when dragging ends
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false,
    isLogoDragging: false
  });

  // Track if we need to save positions (using ref to avoid re-renders)
  const shouldSavePositions = useRef({
    title: false,
    paragraph: false,
    logo: false
  });

  // Update popup position when text is dragged - same as Cover_ProductLayout
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
          // Calculate new position based on current original position and transform
          const newPosition = {
            x: prev.originalPosition.x + (transform.x || 0),
            y: prev.originalPosition.y + (transform.y || 0)
          };

          // If dragging just ended, update the original position to the new position
          const shouldUpdateOriginal = !isDragging && wasDragging;
          
          // Mark position for saving when dragging ends (non-interfering)
          if (shouldUpdateOriginal && transform) {
            if (activeTarget === 'title') {
              shouldSavePositions.current.title = true;
            } else {
              shouldSavePositions.current.paragraph = true;
            }
          }
          
          return {
            ...prev,
            position: newPosition,
            originalPosition: shouldUpdateOriginal ? newPosition : prev.originalPosition
          };
        });
      }
    }

    // Handle logo drag end detection
    const isLogoDragging = figmaState.isLogoDragging;
    const wasLogoDragging = prevDraggingRef.current.isLogoDragging;
    const logoTransform = figmaState.logoTransform;
    
    // Mark logo position for saving when dragging ends (non-interfering)
    if (!isLogoDragging && wasLogoDragging && logoTransform) {
      shouldSavePositions.current.logo = true;
    }

    // Update previous dragging states
    prevDraggingRef.current = {
      isTitleDragging: textSelectionState.isTitleDragging,
      isDescriptionDragging: textSelectionState.isDescriptionDragging,
      isLogoDragging: figmaState.isLogoDragging
    };
  }, [
    textSelectionState.titleTransform, 
    textSelectionState.descriptionTransform, 
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    figmaState.isLogoDragging,
    figmaState.logoTransform,
    textPopupState.isOpen, 
    textPopupState.targetElement,
    textPopupState.lastTargetElement,
    onUpdate
  ]);

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    console.log('🌍 Global click outside handler called', e.target);
    
    // Don't intercept clicks on FigmaText or FigmaLogo components or text popup
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('.logo-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      console.log('🎯 Click on Figma element - allowing event to bubble');
      return; // Let the event bubble to the FigmaText/FigmaLogo components
    }
    
    console.log('🌍 Click outside - deselecting all but keeping text popup open');
    figmaHandlers.handleClickOutside();
    textSelectionHandlers.handleClickOutside();
    // Keep text popup open but detach it from any specific element
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null,
      // Don't close popup immediately - let it stay open for user convenience
    }));
  };

  // Fixed canvas dimensions - no responsive behavior to prevent layout shifts
  const hasLogo = showLogo && logoUrl;

  const content = (
    <div 
      className={`cover-text-center-layout relative ${className}`}
      style={{
        // Fixed canvas size - never changes regardless of content
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        // CRITICAL: Allow internal overflow but let parent clip
        overflow: 'visible',
        contain: 'layout style',
        // Prevent any size calculations from affecting ancestors
        flexShrink: 0,
        minWidth: `${canvasWidth}px`,
        minHeight: `${canvasHeight}px`,
        maxWidth: `${canvasWidth}px`,
        maxHeight: `${canvasHeight}px`,
        position: 'relative'
      }}
      onClick={handleGlobalClickOutside}
    >
      {/* Logo Layer - Independent overlay, centered */}
      {hasLogo && (
        <div 
          className="logo-layer absolute pointer-events-auto"
           style={{
             left: '50%',
             top: '36%',
             transform: 'translateX(-50%)',
             zIndex: 10
           }}
        >
          <FigmaLogo
            src={logoUrl}
            alt={logoAlt}
            size="sm"
            fit="contain"
            align="center"
            className="max-w-24 lg:max-w-28 h-auto"
            containerClassName=""
            state={figmaState}
            handlers={customLogoHandlers}
          />
        </div>
      )}
      
      {/* Title Layer - Independent overlay, centered */}
      <div 
        className="title-layer absolute pointer-events-auto"
         style={{
           left: currentTitleAlignment === 'center' 
             ? '50%' 
             : currentTitleAlignment === 'right'
             ? 'calc(100% - 44px)' 
             : '44px', // Left align
           top: hasLogo ? '42%' : '37%',
           transform: currentTitleAlignment === 'center' ? 'translateX(-50%)' : currentTitleAlignment === 'right' ? 'translateX(-100%)' : 'none',
           width: 'auto', // Width controlled by transform
           zIndex: 10
         }}
        >
            <FigmaText
            variant="title"
            color={titleColor}
            align={currentTitleAlignment}
              fontFamily={titleFontFamily}
              className={`${titleClassName} ${currentTitleAlignment === 'left' ? 'text-left' : currentTitleAlignment === 'center' ? 'text-center' : 'text-right'} break-words`}
              style={{
                fontSize: `${titleFontSize}px`,
                color: currentTitleColor,
                textAlign: currentTitleAlignment,
                lineHeight: '0.9',
                letterSpacing: '-0.05em',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal' // Ensure text wraps
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
                // Only recalculate position if popup is not already open for this element
                if (textPopupState.isOpen && (textPopupState.targetElement === 'title' || textPopupState.lastTargetElement === 'title')) {
                  // Popup is already open for this element, just update the target
                  setTextPopupState(prev => ({
                    ...prev,
                    targetElement: 'title',
                    lastTargetElement: 'title',
                    currentFontSize: fontSize,
                    currentFontFamily: fontFamily
                  }));
                } else {
                  // Calculate position relative to the title element in THIS specific layout
                  const titleElement = document.querySelector('.cover-text-center-layout .title-layer');
                  if (titleElement) {
                    const titleRect = titleElement.getBoundingClientRect();
                    const canvasContainer = titleElement.closest('.cover-text-center-layout') as HTMLElement;
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
                  } else {
                    // Fallback to provided position
                    setTextPopupState({
                      isOpen: true,
                      position,
                      originalPosition: position,
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
      
      {/* Description Layer - Independent overlay, centered */}
      <div 
        className="description-layer absolute pointer-events-auto"
         style={{
           left: currentParagraphAlignment === 'center' 
             ? '50%' 
             : currentParagraphAlignment === 'right'
             ? 'calc(100% - 44px)' 
             : '44px', // Left align
           top: hasLogo ? '53%' : '48%',
           transform: currentParagraphAlignment === 'center' ? 'translateX(-50%)' : currentParagraphAlignment === 'right' ? 'translateX(-100%)' : 'none',
           width: 'auto', // Width controlled by transform
           zIndex: 10
         }}
      >
              <FigmaText
              variant="body"
              color={paragraphColor}
              align={currentParagraphAlignment}
                fontFamily={paragraphFontFamily}
                className={`${paragraphClassName} ${currentParagraphAlignment === 'left' ? 'text-left' : currentParagraphAlignment === 'center' ? 'text-center' : 'text-right'} break-words`}
                style={{
                  fontSize: `${paragraphFontSize}px`,
                  color: currentParagraphColor,
                  textAlign: currentParagraphAlignment,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal' // Ensure text wraps
                }}
                isSelected={textSelectionState.isDescriptionSelected}
                transform={textSelectionState.descriptionTransform}
                onClick={textSelectionHandlers.handleDescriptionClick}
                onTextChange={handleParagraphTextChange}
                onSizeChange={handleParagraphSizeChange}
                onChangeSize={handleParagraphChangeSize}
                onChangeFont={handleParagraphChangeFont}
                onDragStart={handleDescriptionDragStart}
                onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                onDeleteText={handleParagraphDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  // Only recalculate position if popup is not already open for this element
                  if (textPopupState.isOpen && (textPopupState.targetElement === 'description' || textPopupState.lastTargetElement === 'description')) {
                    // Popup is already open for this element, just update the target
                    setTextPopupState(prev => ({
                      ...prev,
                      targetElement: 'description',
                      lastTargetElement: 'description',
                      currentFontSize: fontSize,
                      currentFontFamily: fontFamily
                    }));
                  } else {
                    // Calculate position relative to the description element in THIS specific layout
                    const descriptionElement = document.querySelector('.cover-text-center-layout .description-layer');
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.cover-text-center-layout') as HTMLElement;
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
                    } else {
                      // Fallback to provided position
                      setTextPopupState({
                        isOpen: true,
                        position,
                        originalPosition: position,
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily,
                        targetElement: 'description',
                        lastTargetElement: 'description'
                      });
                    }
                  }
                }}>
                {currentParagraph}
              </FigmaText>
        </div>
    </div>
  );

  // Conditionally wrap with CanvasOverlay for fixed dimensions - Original Behavior
  return useFixedDimensions ? (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      {/* Text Popup - same as Cover_ProductLayout */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleParagraphChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleParagraphChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleParagraphChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleParagraphChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentParagraphColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentParagraphAlignment}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleParagraphDelete();
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
              handleParagraphChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleParagraphChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleParagraphChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleParagraphChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentParagraphColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentParagraphAlignment}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleParagraphDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}



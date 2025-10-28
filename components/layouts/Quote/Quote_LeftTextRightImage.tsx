import React, { useState, useEffect, useRef } from 'react';
import { FigmaImage, useFigmaSelection, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface QuoteLeftTextRightImageProps {
  /**
   * The main quote text to display
   */
  quote?: string;
  
  /**
   * Attribution for the quote (e.g., "— Native Proverb")
   */
  attribution?: string;
  
  /**
   * Additional description text below the quote
   */
  description?: string;
  
  /**
   * Vision/mission section title
   */
  visionTitle?: string;
  
  /**
   * Vision/mission section text
   */
  visionText?: string;
  
  /**
   * Image URL for the right side
   */
  imageUrl?: string;
  
  /**
   * Image alt text
   */
  imageAlt?: string;
  
  /**
   * Show/hide the image
   */
  showImage?: boolean;
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Quote text color
   */
  quoteColor?: string;
  
  /**
   * Attribution text color
   */
  attributionColor?: string;
  
  /**
   * Description text color
   */
  descriptionColor?: string;
  
  /**
   * Vision title color
   */
  visionTitleColor?: string;
  
  /**
   * Vision text color
   */
  visionTextColor?: string;
  
  /**
   * Background color for the layout
   */
  backgroundColor?: string;
  
  /**
   * Width percentage for the left column
   */
  leftWidthPercent?: number;
  
  /**
   * Canvas dimensions for fixed layouts
   */
  canvasWidth?: number;
  canvasHeight?: number;
  useFixedDimensions?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Quote transform for positioning
   */
  quoteTransform?: { x: number; y: number };

  /**
   * Attribution transform for positioning
   */
  attributionTransform?: { x: number; y: number };

  // Styling props
  quoteFontSize?: number;
  quoteFontFamily?: string;
  quoteAlignment?: string;
  quoteColor?: string;
  attributionFontSize?: number;
  attributionFontFamily?: string;
  attributionAlignment?: string;
  attributionColor?: string;

  /**
   * Saved image transform for position persistence
   */
  imageTransform?: { x: number; y: number };
}

export default function Quote_LeftTextRightImage({
  quote = '"We do not inherit the Earth from our ancestors, we borrow it from our children."',
  attribution = '— Native Proverb',
  description = '',
  visionTitle = '',
  visionText = '',
  imageUrl = '/Default-Image-2.png',
  imageAlt = 'Sustainability image',
  showImage = true,
  fontFamily = 'font-helvetica-neue',
  quoteColor = 'text-gray-900',
  attributionColor = 'text-gray-600',
  descriptionColor = 'text-gray-500',
  visionTitleColor = 'text-gray-900',
  visionTextColor = 'text-gray-700',
  backgroundColor = 'bg-white',
  leftWidthPercent = 50,
  quoteFontSize = 30,
  quoteFontFamily = 'font-helvetica-neue',
  quoteAlignment = 'left',
  attributionFontSize = 14,
  attributionFontFamily = 'font-helvetica-neue',
  attributionAlignment = 'left',
  canvasWidth = 1280,
  canvasHeight = 720,
  useFixedDimensions = false,
  className = '',
  onUpdate,
  imageTransform: savedImageTransform,
  quoteTransform: savedQuoteTransform,
  attributionTransform: savedAttributionTransform
}: QuoteLeftTextRightImageProps) {

  // Text content state
  const [currentQuote, setCurrentQuote] = useState(quote);
  const [currentAttribution, setCurrentAttribution] = useState(attribution);

  // Text styling state
  const [quoteFontSizeState, setQuoteFontSize] = useState(quoteFontSize);
  const [quoteFontFamilyState, setQuoteFontFamily] = useState(quoteFontFamily);
  const [currentQuoteColor, setCurrentQuoteColor] = useState(quoteColor);
  const [quoteAlignmentState, setQuoteAlignment] = useState(quoteAlignment);

  const [attributionFontSizeState, setAttributionFontSize] = useState(attributionFontSize);
  const [attributionFontFamilyState, setAttributionFontFamily] = useState(attributionFontFamily);
  const [currentAttributionColor, setCurrentAttributionColor] = useState(attributionColor);
  const [attributionAlignmentState, setAttributionAlignment] = useState(attributionAlignment);

  // Sync styling props with state
  useEffect(() => {
    setQuoteFontSize(quoteFontSize);
  }, [quoteFontSize]);

  useEffect(() => {
    setQuoteFontFamily(quoteFontFamily);
  }, [quoteFontFamily]);

  useEffect(() => {
    setQuoteAlignment(quoteAlignment);
  }, [quoteAlignment]);

  useEffect(() => {
    setAttributionFontSize(attributionFontSize);
  }, [attributionFontSize]);

  useEffect(() => {
    setAttributionFontFamily(attributionFontFamily);
  }, [attributionFontFamily]);

  useEffect(() => {
    setAttributionAlignment(attributionAlignment);
  }, [attributionAlignment]);

  // Text selection handlers with initial transforms and onUpdate
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedQuoteTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedAttributionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });

  // Custom drag handlers to ensure proper drag functionality
  const handleQuoteDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    console.log('🔥 Quote drag start triggered!', e, element);
    if (textSelectionHandlers.handleTitleDragStart) {
      textSelectionHandlers.handleTitleDragStart(e, element);
    }
  };

  const handleAttributionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    console.log('🔥 Attribution drag start triggered!', e, element);
    if (textSelectionHandlers.handleDescriptionDragStart) {
      textSelectionHandlers.handleDescriptionDragStart(e, element);
    }
  };
  
  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as 'quote' | 'attribution' | null,
    lastTargetElement: null as 'quote' | 'attribution' | null
  });

  // Use Figma selection hook for the image
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Text change handlers
  const handleQuoteTextChange = (newText: string) => {
    setCurrentQuote(newText);
    if (onUpdate) {
      onUpdate({ quote: newText });
    }
  };

  const handleAttributionTextChange = (newText: string) => {
    setCurrentAttribution(newText);
    if (onUpdate) {
      onUpdate({ attribution: newText });
    }
  };

  // Style change handlers
  const handleQuoteChangeSize = (fontSize: number) => {
    setQuoteFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ quoteFontSize: fontSize });
    }
  };

  const handleQuoteChangeFont = (fontFamily: string) => {
    setQuoteFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ quoteFontFamily: fontFamily });
    }
  };

  const handleQuoteChangeColor = (color: string) => {
    setCurrentQuoteColor(color);
    if (onUpdate) {
      onUpdate({ quoteColor: color });
    }
  };

  const handleQuoteChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setQuoteAlignment(alignment);
    if (onUpdate) {
      onUpdate({ quoteAlignment: alignment });
    }
  };

  const handleAttributionChangeSize = (fontSize: number) => {
    setAttributionFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ attributionFontSize: fontSize });
    }
  };

  const handleAttributionChangeFont = (fontFamily: string) => {
    setAttributionFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ attributionFontFamily: fontFamily });
    }
  };

  const handleAttributionChangeColor = (color: string) => {
    setCurrentAttributionColor(color);
    if (onUpdate) {
      onUpdate({ attributionColor: color });
    }
  };

  const handleAttributionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setAttributionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ attributionAlignment: alignment });
    }
  };

  // Delete handlers
  const handleQuoteDelete = () => {
    setCurrentQuote('');
    if (onUpdate) {
      onUpdate({ quote: '' });
    }
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleAttributionDelete = () => {
    setCurrentAttribution('');
    if (onUpdate) {
      onUpdate({ attribution: '' });
    }
    if (textSelectionHandlers.handleDescriptionDelete) {
      textSelectionHandlers.handleDescriptionDelete();
    }
  };

  const handleQuoteSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleAttributionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };


  // Track previous dragging states
  const prevDraggingRef = useRef({
    isQuoteDragging: false,
    isAttributionDragging: false
  });

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      const transform = activeTarget === 'quote' 
        ? textSelectionState.titleTransform 
        : textSelectionState.descriptionTransform;
      
      const isDragging = activeTarget === 'quote'
        ? textSelectionState.isTitleDragging
        : textSelectionState.isDescriptionDragging;

      const wasDragging = activeTarget === 'quote'
        ? prevDraggingRef.current.isQuoteDragging
        : prevDraggingRef.current.isAttributionDragging;
      
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
      isQuoteDragging: textSelectionState.isTitleDragging,
      isAttributionDragging: textSelectionState.isDescriptionDragging
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
                          target.closest('.quote-layer') ||
                          target.closest('.attribution-layer') ||
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

  const containerClasses = useFixedDimensions
    ? `quote-left-text-right-image relative flex h-full ${backgroundColor} ${className}`
    : `quote-left-text-right-image relative flex h-full w-full min-h-[400px] ${backgroundColor} ${className}`;

  const containerStyle = useFixedDimensions
    ? {
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        maxWidth: `${canvasWidth}px`,
        maxHeight: `${canvasHeight}px`,
        minWidth: `${canvasWidth}px`,
        minHeight: `${canvasHeight}px`,
        // CRITICAL: Allow infinite expansion beyond canvas
        overflow: 'visible',
        contain: 'layout style',
        // Prevent any size calculations from affecting ancestors
        flexShrink: 0,
        position: 'relative'
      }
    : {
        // Responsive mode constraints
        overflow: 'visible',
        contain: 'layout style',
        width: '100%',
        height: '100%',
        minHeight: '400px'
      };

  const content = (
    <div 
      className={containerClasses}
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
      {/* Left Column - Quote and Text Content */}
      <div 
        className="flex flex-col justify-start px-8 lg:px-12 py-8 lg:py-12 relative z-10"
        style={{ width: `${leftWidthPercent}%` }}
      >
        {/* Main Quote */}
        <div 
          className="quote-layer"
          style={{
            position: 'relative',
            width: 'auto',
            height: 'auto'
          }}
        >
          <FigmaText
            variant="title"
            color={currentQuoteColor}
            align={quoteAlignmentState}
            fontFamily={quoteFontFamilyState}
            className={`text-3xl font-normal font-helvetica-neue leading-none tracking-tight text-left break-words`}
            style={{
              fontSize: `${quoteFontSizeState}px`,
              color: currentQuoteColor,
              textAlign: quoteAlignmentState as 'left' | 'center' | 'right',
              lineHeight: '1.0',
              letterSpacing: '-0.025em',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              cursor: 'pointer'
            }}
            isSelected={textSelectionState.isTitleSelected}
            transform={textSelectionState.titleTransform}
            onDragStart={handleQuoteDragStart}
            onResizeStart={textSelectionHandlers.handleTitleResizeStart}
            onClick={(e: React.MouseEvent) => {
              console.log('🔥 Quote clicked!', e);
              e.stopPropagation();
              textSelectionHandlers.handleTitleClick(e);
            }}
            onTextChange={handleQuoteTextChange}
            onSizeChange={handleQuoteSizeChange}
            onChangeSize={handleQuoteChangeSize}
            onChangeFont={handleQuoteChangeFont}
            onDeleteText={handleQuoteDelete}
            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
              const quoteElement = document.querySelector('.quote-left-text-right-image .quote-layer');
              if (quoteElement) {
                const quoteRect = quoteElement.getBoundingClientRect();
                const canvasContainer = quoteElement.closest('.quote-left-text-right-image') as HTMLElement;
                if (canvasContainer) {
                  const canvasRect = canvasContainer.getBoundingClientRect();
                  const relativeX = (quoteRect.left - canvasRect.left) - 10;
                  const relativeY = (quoteRect.top - canvasRect.top) - 50;
                  
                  setTextPopupState({
                    isOpen: true,
                    position: { x: relativeX, y: relativeY },
                    originalPosition: { x: relativeX, y: relativeY },
                    currentFontSize: fontSize,
                    currentFontFamily: fontFamily,
                    targetElement: 'quote',
                    lastTargetElement: 'quote'
                  });
                }
              }
            }}>
            {currentQuote}
          </FigmaText>
        </div>

        {/* Attribution */}
        {currentAttribution && (
          <div 
            className="attribution-layer"
            style={{
              position: 'relative',
              width: 'auto',
              height: 'auto',
              marginTop: '20px'
            }}
          >
            <FigmaText
              variant="body"
              color={currentAttributionColor}
              align={attributionAlignmentState}
              fontFamily={attributionFontFamilyState}
              className={`text-sm font-helvetica-neue text-left break-words`}
              style={{
                fontSize: `${attributionFontSizeState}px`,
                color: currentAttributionColor,
                textAlign: attributionAlignmentState as 'left' | 'center' | 'right',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                cursor: 'pointer'
              }}
              isSelected={textSelectionState.isDescriptionSelected}
              transform={textSelectionState.descriptionTransform}
              onDragStart={handleAttributionDragStart}
              onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                textSelectionHandlers.handleDescriptionClick(e);
              }}
              onTextChange={handleAttributionTextChange}
              onSizeChange={handleAttributionSizeChange}
              onChangeSize={handleAttributionChangeSize}
              onChangeFont={handleAttributionChangeFont}
              onDeleteText={handleAttributionDelete}
              onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                const attributionElement = document.querySelector('.quote-left-text-right-image .attribution-layer');
                if (attributionElement) {
                  const attributionRect = attributionElement.getBoundingClientRect();
                  const canvasContainer = attributionElement.closest('.quote-left-text-right-image') as HTMLElement;
                  if (canvasContainer) {
                    const canvasRect = canvasContainer.getBoundingClientRect();
                    const relativeX = (attributionRect.left - canvasRect.left) - 10;
                    const relativeY = (attributionRect.top - canvasRect.top) - 50;
                    
                    setTextPopupState({
                      isOpen: true,
                      position: { x: relativeX, y: relativeY },
                      originalPosition: { x: relativeX, y: relativeY },
                      currentFontSize: fontSize,
                      currentFontFamily: fontFamily,
                      targetElement: 'attribution',
                      lastTargetElement: 'attribution'
                    });
                  }
                }
              }}>
              {currentAttribution}
            </FigmaText>
          </div>
        )}
      </div>

      {/* Image - Right side with Figma-style Selection */}
      {showImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            left: `${leftWidthPercent}%`,
            width: `${100 - leftWidthPercent}%`
          }}
        >
          <FigmaImage
            src={imageUrl || '/Default-Image-2.png'}
            alt={imageAlt || 'Quote image'}
            size="full"
            fit="cover"
            align="center"
            rounded={false}
            fill
            className="w-full h-full object-cover rounded-none"
            containerClassName="w-full h-full"
            state={figmaState}
            handlers={figmaHandlers}
          />
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
            if (target === 'quote') {
              handleQuoteChangeSize(fontSize);
            } else if (target === 'attribution') {
              handleAttributionChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeFont(fontFamily);
            } else if (target === 'attribution') {
              handleAttributionChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeColor(color);
            } else if (target === 'attribution') {
              handleAttributionChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeAlignment(alignment);
            } else if (target === 'attribution') {
              handleAttributionChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? quoteFontSizeState : attributionFontSizeState}
          currentFontFamily={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? quoteFontFamilyState : attributionFontFamilyState}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? currentQuoteColor : currentAttributionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? quoteAlignmentState as 'left' | 'center' | 'right' : attributionAlignmentState as 'left' | 'center' | 'right'}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteDelete();
            } else if (target === 'attribution') {
              handleAttributionDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  ) : (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      {/* Text Popup for responsive mode */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeSize(fontSize);
            } else if (target === 'attribution') {
              handleAttributionChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeFont(fontFamily);
            } else if (target === 'attribution') {
              handleAttributionChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeColor(color);
            } else if (target === 'attribution') {
              handleAttributionChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteChangeAlignment(alignment);
            } else if (target === 'attribution') {
              handleAttributionChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? quoteFontSizeState : attributionFontSizeState}
          currentFontFamily={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? quoteFontFamilyState : attributionFontFamilyState}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? currentQuoteColor : currentAttributionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'quote' ? quoteAlignmentState as 'left' | 'center' | 'right' : attributionAlignmentState as 'left' | 'center' | 'right'}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'quote') {
              handleQuoteDelete();
            } else if (target === 'attribution') {
              handleAttributionDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  );
}

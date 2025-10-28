import React, { useState, useEffect, useRef } from 'react';
import { useFigmaSelection, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
export interface QuoteMissionStatementProps {
  /**
   * The quote text to display
   */
  quote?: string;
  
  /**
   * Attribution text (e.g., "— Native Proverb")
   */
  attribution?: string;
  
  /**
   * Font family for the quote text
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
   * Background color for the left section
   */
  leftBackgroundColor?: string;
  
  /**
   * Quote text alignment
   */
  quoteAlign?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Custom CSS classes for the quote text
   */
  quoteClassName?: string;
  
  /**
   * Width percentage for the left column (empty section)
   */
  leftWidthPercent?: number;
  
  /**
   * Gap between left and right columns
   */
  gapXClass?: string;
  
  /**
   * Content vertical alignment within the right column
   */
  contentJustify?: 'start' | 'center' | 'end';
  
  /**
   * Content horizontal alignment within the right column
   */
  contentItems?: 'start' | 'center' | 'end';
  
  /**
   * Custom CSS classes for the container
   */
  className?: string;
  
  /**
   * Whether to use fixed dimensions
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
  attributionFontSize?: number;
  attributionFontFamily?: string;
  attributionAlignment?: string;
}

/**
 * Quote_MissionStatement Component
 * 
 * Simple centered quote text in the middle of the screen.
 */
export default function Quote_MissionStatement({
  quote = 'A mission statement is a concise statement that outlines the purpose, goals, and values of an organization or company.',
  attribution = '— Native Proverb',
  fontFamily = 'font-helvetica-neue',
  quoteColor = 'text-gray-900',
  attributionColor = 'text-gray-600',
  leftBackgroundColor,
  quoteAlign = 'center',
  quoteClassName = '',
  leftWidthPercent,
  gapXClass,
  contentJustify = 'center',
  contentItems = 'center',
  quoteFontSize = 36,
  quoteFontFamily = 'font-helvetica-neue',
  quoteAlignment = 'center',
  attributionFontSize = 16,
  attributionFontFamily = 'font-helvetica-neue',
  attributionAlignment = 'center',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  quoteTransform: savedQuoteTransform,
  attributionTransform: savedAttributionTransform
}: QuoteMissionStatementProps) {

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

  // Layout constraints - prevent layout shifts
  const containerStyle = useFixedDimensions ? {
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
  } : {
    // Responsive mode constraints
    overflow: 'visible',
    contain: 'layout style',
    width: '100%',
    height: '100%',
    minHeight: '400px'
  };

  const justifyClass =
    contentJustify === 'start' ? 'justify-start' :
    contentJustify === 'center' ? 'justify-center' :
    contentJustify === 'end' ? 'justify-end' : 'justify-center';

  const itemsClass =
    contentItems === 'start' ? 'items-start' :
    contentItems === 'center' ? 'items-center' : 'items-end';

  const containerClasses = useFixedDimensions 
    ? `quote-mission-statement-layout flex ${itemsClass} ${justifyClass} overflow-hidden relative bg-white p-8 ${className}`
    : `quote-mission-statement-layout flex ${itemsClass} ${justifyClass} w-full h-full min-h-[400px] overflow-hidden relative bg-white p-8 ${className}`;

  // Determine text alignment classes
  const textAlignClass = 
    quoteAlign === 'left' ? 'text-left' :
    quoteAlign === 'right' ? 'text-right' :
    quoteAlign === 'justify' ? 'text-justify' : 'text-center';

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

  // Custom drag handlers
  const handleQuoteDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (textSelectionHandlers.handleTitleDragStart) {
      textSelectionHandlers.handleTitleDragStart(e, element);
    }
  };

  const handleAttributionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (textSelectionHandlers.handleDescriptionDragStart) {
      textSelectionHandlers.handleDescriptionDragStart(e, element);
    }
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
    
    textSelectionHandlers.handleClickOutside();
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null
    }));
  };

  const content = (
    <div 
      className={containerClasses}
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
      {/* Main Quote - Full Width */}
      <div 
        className="quote-layer absolute pointer-events-auto"
        style={{
          left: '50%',
          top: '30%',
          transform: 'translateX(-50%)',
          width: '85%',
          maxWidth: '85%',
          zIndex: 10,
          // Critical: Allow infinite expansion beyond canvas
          overflow: 'visible',
          contain: 'none',
          // Ensure no layout influence on parent
          position: 'absolute'
        }}
      >
          <FigmaText
            variant="title"
            color={currentQuoteColor}
            align={quoteAlignmentState}
            fontFamily={quoteFontFamilyState}
            className={`text-4xl font-normal font-helvetica-neue text-center break-words w-full px-16`}
            style={{
              fontSize: `${quoteFontSizeState}px`,
              color: currentQuoteColor,
              textAlign: quoteAlignmentState as 'left' | 'center' | 'right',
              lineHeight: '1.0',
              letterSpacing: '-0.05em',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              width: '100%',
              display: 'block'
            }}
            isSelected={textSelectionState.isTitleSelected}
            transform={textSelectionState.titleTransform}
            onClick={textSelectionHandlers.handleTitleClick}
            onTextChange={handleQuoteTextChange}
            onSizeChange={handleQuoteSizeChange}
            onChangeSize={handleQuoteChangeSize}
            onChangeFont={handleQuoteChangeFont}
            onDragStart={handleQuoteDragStart}
            onResizeStart={textSelectionHandlers.handleTitleResizeStart}
            onDeleteText={handleQuoteDelete}
            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
              const quoteElement = document.querySelector('.quote-mission-statement-layout .quote-layer');
              if (quoteElement) {
                const quoteRect = quoteElement.getBoundingClientRect();
                const canvasContainer = quoteElement.closest('.quote-mission-statement-layout') as HTMLElement;
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
            className="attribution-layer absolute pointer-events-auto"
            style={{
              left: '50%',
              top: '55%',
              transform: 'translateX(-50%)',
              width: 'auto',
              zIndex: 10,
              // Critical: Allow infinite expansion beyond canvas
              overflow: 'visible',
              contain: 'none',
              // Ensure no layout influence on parent
              position: 'absolute'
            }}
          >
            <FigmaText
              variant="body"
              color={currentAttributionColor}
              align={attributionAlignmentState}
              fontFamily={attributionFontFamilyState}
              className={`text-sm font-helvetica-neue ${attributionAlignmentState === 'left' ? 'text-left' : attributionAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
              style={{
                fontSize: `${attributionFontSizeState}px`,
                color: currentAttributionColor,
                textAlign: attributionAlignmentState as 'left' | 'center' | 'right',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal'
              }}
              isSelected={textSelectionState.isDescriptionSelected}
              transform={textSelectionState.descriptionTransform}
              onClick={textSelectionHandlers.handleDescriptionClick}
              onTextChange={handleAttributionTextChange}
              onSizeChange={handleAttributionSizeChange}
              onChangeSize={handleAttributionChangeSize}
              onChangeFont={handleAttributionChangeFont}
              onDragStart={handleAttributionDragStart}
              onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
              onDeleteText={handleAttributionDelete}
              onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                const attributionElement = document.querySelector('.quote-mission-statement-layout .attribution-layer');
                if (attributionElement) {
                  const attributionRect = attributionElement.getBoundingClientRect();
                  const canvasContainer = attributionElement.closest('.quote-mission-statement-layout') as HTMLElement;
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
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
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
    <>
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
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
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
    </>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import IconBlock from '../../blocks/IconBlock';
import type { ImageBlockProps } from '../../blocks/ImageBlock';

export interface ListsCardsLayoutProps {
  /**
   * Main title for the section (appears on the left)
   */
  title?: string;
  
  /**
   * Description text that appears on the right
   */
  description?: string;
  
  /**
   * Array of cards to display (2-4 cards)
   */
  cards?: {
    icon: string;
    title: string;
    description: string;
  }[];
  
  /**
   * Layout configuration
   */
  layout?: {
    /**
     * Show/hide title section
     */
    showTitle?: boolean;
    /**
     * Show/hide description
     */
    showDescription?: boolean;
    /**
     * Show/hide cards
     */
    showCards?: boolean;
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

  /**
   * Styling props for persistence
   */
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  cardStyles?: {
    [key: string]: {
      titleFontSize: number;
      titleFontFamily: string;
      titleColor: string;
      titleAlignment: 'left' | 'center' | 'right';
      descriptionFontSize: number;
      descriptionFontFamily: string;
      descriptionColor: string;
      descriptionAlignment: 'left' | 'center' | 'right';
    };
  };

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  // Transform overrides for dragged elements
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  cardTransforms?: { x: number; y: number }[];
  
  // Font styling overrides (saved values)
  savedTitleFontSize?: number;
  savedTitleFontFamily?: string;
  savedTitleAlignment?: 'left' | 'center' | 'right';
  savedDescriptionFontSize?: number;
  savedDescriptionFontFamily?: string;
  savedDescriptionAlignment?: 'left' | 'center' | 'right';
  savedCardTransforms?: { x: number; y: number }[];
}

/**
 * Lists Cards Layout
 * 
 * A modular layout with title on the left, description on the right, and 2-4 cards below.
 * Perfect for showcasing key benefits, features, or opportunities with dynamic sizing.
 */
export default function Lists_CardsLayout({
  title = 'Investor Benefits',
  description = 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.',
  cards = [
    {
      icon: 'Target',
      title: 'Access to Token',
      description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.'
    },
    {
      icon: 'TrendingUp',
      title: 'Equity & Profit-Sharing Opportunities',
      description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.'
    },
    {
      icon: 'Zap',
      title: 'High-Growth Potential',
      description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future while unlocking high-growth potential, equity rewards, and exclusive token benefits.'
    }
  ],
  layout = {
    showTitle: true,
    showDescription: true,
    showCards: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  titleFontSize = 32,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  cardStyles = {},
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  cardTransforms: savedCardTransforms,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: ListsCardsLayoutProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentCards, setCurrentCards] = useState(cards);

  // Text styling state with saved overrides
  const [titleFontSizeState, setTitleFontSize] = useState(savedTitleFontSize || titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(savedTitleFontFamily || titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#1f2937');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(savedTitleAlignment || titleAlignment);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(savedDescriptionFontSize || descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(savedDescriptionFontFamily || descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || '#6b7280');
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(savedDescriptionAlignment || descriptionAlignment);

  // Card styling state
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [cardStylesState, setCardStyles] = useState<Record<string, {
    titleFontSize: number;
    titleFontFamily: string;
    titleColor: string;
    titleAlignment: 'left' | 'center' | 'right';
    descriptionFontSize: number;
    descriptionFontFamily: string;
    descriptionColor: string;
    descriptionAlignment: 'left' | 'center' | 'right';
  }>>(cardStyles || {});
  const [cardTransforms, setCardTransforms] = useState<Record<string, any>>({});

  // 🔧 SYNC PROPS TO STATE - Update state when props change (for persistence)
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setCurrentTitleColor(titleColor || '#1f2937');
  }, [titleColor]);

  useEffect(() => {
    setCurrentTitleAlignment(titleAlignment);
  }, [titleAlignment]);

  useEffect(() => {
    setDescriptionFontSize(descriptionFontSize);
  }, [descriptionFontSize]);

  useEffect(() => {
    setDescriptionFontFamily(descriptionFontFamily);
  }, [descriptionFontFamily]);

  useEffect(() => {
    setCurrentDescriptionColor(descriptionColor || '#6b7280');
  }, [descriptionColor]);

  useEffect(() => {
    setCurrentDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  useEffect(() => {
    setCardStyles(cardStyles || {});
  }, [JSON.stringify(cardStyles)]);

  // Helper function to create card update handler
  const createCardUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      // Update the specific card transform
      const newTransforms = [...(savedCardTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ cardTransforms: newTransforms });
    }
  };

  // Individual Figma selection hooks for each card (up to 4) with persistence
  const card1State = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[0] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(0)
  });
  const card2State = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[1] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(1)
  });
  const card3State = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[2] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(2)
  });
  const card4State = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[3] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(3)
  });

  // Array of all card states for easy access
  const cardFigmaStates = [
    card1State, card2State, card3State, card4State
  ];

  // Text selection handlers with saved transforms and onUpdate
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });

  // Global selection state - only one text element can be selected at a time
  const [globalSelectedElement, setGlobalSelectedElement] = useState<string | null>(null);
  
  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as 'title' | 'description' | string | null,
    lastTargetElement: null as 'title' | 'description' | string | null
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

  const handleCardTextChange = (index: number, field: 'title' | 'description', newText: string) => {
    setCurrentCards(prev => prev.map((card, i) => 
      i === index ? { ...card, [field]: newText } : card
    ));
    if (onUpdate) {
      const updatedCards = currentCards.map((card, i) => 
        i === index ? { ...card, [field]: newText } : card
      );
      onUpdate({ cards: updatedCards });
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
    setCurrentTitleAlignment(alignment);
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
    setCurrentDescriptionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ descriptionAlignment: alignment });
    }
  };

  // Card style handlers
  const handleCardChangeSize = (index: number, field: 'title' | 'description', fontSize: number) => {
    const key = `card-${index}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}FontSize`]: fontSize
        }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleCardChangeFont = (index: number, field: 'title' | 'description', fontFamily: string) => {
    const key = `card-${index}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}FontFamily`]: fontFamily
        }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleCardChangeColor = (index: number, field: 'title' | 'description', color: string) => {
    const key = `card-${index}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}Color`]: color
        }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleCardChangeAlignment = (index: number, field: 'title' | 'description', alignment: 'left' | 'center' | 'right') => {
    const key = `card-${index}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}Alignment`]: alignment
        }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  // Get card style with defaults
  const getCardStyle = (index: number, field: 'title' | 'description') => {
    const key = `card-${index}`;
    const defaults = field === 'title' 
      ? { fontSize: 16, fontFamily: 'font-helvetica-neue', color: '#1f2937', alignment: 'left' as const }
      : { fontSize: 12, fontFamily: 'font-helvetica-neue', color: '#6b7280', alignment: 'left' as const };
    
    const style = cardStyles[key];
    const baseStyle = {
      fontSize: style?.[`${field}FontSize`] || defaults.fontSize,
      fontFamily: style?.[`${field}FontFamily`] || defaults.fontFamily,
      color: style?.[`${field}Color`] || defaults.color,
      alignment: style?.[`${field}Alignment`] || defaults.alignment
    };

    // Override color to white when hovered
    if (hoveredCard === key) {
      return {
        ...baseStyle,
        color: '#ffffff'
      };
    }
    
    return baseStyle;
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
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

  // Global selection management
  const handleElementSelection = (elementId: string, clickHandler: (e: React.MouseEvent) => void) => {
    return (e: React.MouseEvent) => {
      // Deselect all other elements first
      if (globalSelectedElement && globalSelectedElement !== elementId) {
        // Deselect main title/description
        if (globalSelectedElement === 'title') {
          textSelectionHandlers.handleClickOutside();
        } else if (globalSelectedElement === 'description') {
          textSelectionHandlers.handleClickOutside();
        } else if (globalSelectedElement.startsWith('card-')) {
          // Deselect card elements
          const [, indexStr] = globalSelectedElement.split('-');
          const index = parseInt(indexStr);
          if (cardFigmaStates[index]) {
            cardFigmaStates[index][1].handleClickOutside();
          }
        }
      }
      
      // Set new global selection
      setGlobalSelectedElement(elementId);
      
      // Execute the click handler with the event
      clickHandler(e);
    };
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
    
    // Deselect all elements
    textSelectionHandlers.handleClickOutside();
    cardFigmaStates.forEach(state => {
      state[1].handleClickOutside();
    });
    
    setGlobalSelectedElement(null);
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
    // CRITICAL: Allow infinite expansion beyond canvas
    overflow: 'visible',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
    position: 'relative' as const
   } : {
     // Responsive mode constraints
     overflow: 'visible',
     contain: 'layout style',
     width: '100%',
     height: '100%',
     minHeight: '400px'
   };

  // Base classes for cards layout
  const containerClasses = useFixedDimensions 
    ? `lists-cards-layout px-6 lg:px-12 pt-8 lg:pt-10 pb-6 lg:pb-8 bg-white ${className}`
    : `lists-cards-layout px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `lists-cards-heading-${currentTitle?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <section 
      className={`${containerClasses} flex flex-col relative`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
        {/* Title Section - Left */}
        {layout.showTitle && (
        <div 
          className="title-layer absolute pointer-events-auto"
           style={{
             left: '40px', // Add more left margin (was 24px)
             top: '48px', // Lower the title (was 32px)
             width: 'calc(50% - 48px)', // Adjust width to account for increased left margin
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
            color={currentTitleColor}
            align={currentTitleAlignment}
            fontFamily={titleFontFamily}
            className={`text-2xl lg:text-3xl xl:text-4xl font-normal leading-none tracking-tighter break-words`}
            style={{
              fontSize: `${titleFontSize}px`,
              color: currentTitleColor,
              textAlign: currentTitleAlignment,
              lineHeight: '0.9',
              letterSpacing: '-0.05em',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
            isSelected={textSelectionState.isTitleSelected}
            transform={textSelectionState.titleTransform}
            onDragStart={textSelectionHandlers.handleTitleDragStart}
            onResizeStart={textSelectionHandlers.handleTitleResizeStart}
            onClick={handleElementSelection('title', textSelectionHandlers.handleTitleClick)}
            onTextChange={handleTitleTextChange}
            onSizeChange={handleTitleSizeChange}
            onChangeSize={handleTitleChangeSize}
            onChangeFont={handleTitleChangeFont}
            onDeleteText={handleTitleDelete}
            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
              const titleElement = document.querySelector('.lists-cards-layout .title-layer');
              if (titleElement) {
                const titleRect = titleElement.getBoundingClientRect();
                const canvasContainer = titleElement.closest('.lists-cards-layout') as HTMLElement;
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

        {/* Description Section - Right */}
      {layout.showDescription && currentDescription && (
        <div 
          className="description-layer absolute pointer-events-auto"
           style={{
             left: 'calc(50% + 8px)', // Default right position
             top: '55px', // Default position
             width: 'calc(50% - 32px)',
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
            color={currentDescriptionColor}
            align={currentDescriptionAlignment}
            fontFamily={descriptionFontFamily}
            className={`text-sm font-helvetica-neue break-words`}
            style={{
              fontSize: `${descriptionFontSize}px`,
              color: currentDescriptionColor,
              textAlign: currentDescriptionAlignment,
              lineHeight: '1.4',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
            isSelected={textSelectionState.isDescriptionSelected}
            transform={textSelectionState.descriptionTransform}
            onDragStart={textSelectionHandlers.handleDescriptionDragStart}
            onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
            onClick={handleElementSelection('description', textSelectionHandlers.handleDescriptionClick)}
            onTextChange={handleDescriptionTextChange}
            onSizeChange={handleDescriptionSizeChange}
            onChangeSize={handleDescriptionChangeSize}
            onChangeFont={handleDescriptionChangeFont}
            onDeleteText={handleDescriptionDelete}
            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
              const descriptionElement = document.querySelector('.lists-cards-layout .description-layer');
              if (descriptionElement) {
                const descriptionRect = descriptionElement.getBoundingClientRect();
                const canvasContainer = descriptionElement.closest('.lists-cards-layout') as HTMLElement;
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

      {/* Cards Section - Modular 2-4 Cards */}
      {layout.showCards && currentCards && currentCards.length > 0 && (
        <div 
          className="absolute"
           style={{
             left: '40px', // Align with title (was 24px)
             top: '120px', // Move higher (was 160px)
             right: '40px', // Match left margin for symmetry
             bottom: '80px', // Shorten cards from bottom (was 24px)
             zIndex: 5
           }}
        >
          {(() => {
            const cardCount = Math.min(Math.max(currentCards.length, 2), 4); // Clamp between 2-4
            const validCards = currentCards.slice(0, 4); // Take only first 4 cards
        
        // Dynamic grid layout based on card count
        const getGridLayout = () => {
          switch(cardCount) {
            case 2:
              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
            case 3:
              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4:
            default:
              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
          }
        };
        
        // Dynamic sizing based on card count
        const getDynamicSizing = () => {
          switch(cardCount) {
            case 2:
              return {
                padding: 'p-8 lg:p-10', // More padding for fewer cards
                spacing: 'space-y-4', // More space between elements
                iconSize: 20, // Larger icons
                titleSize: '20px', // Larger title text
                descriptionSize: '12px', // Larger description text
                gap: 'gap-4 lg:gap-6' // More gap between cards
              };
            case 3:
              return {
                padding: 'p-6 lg:p-8', // Standard padding
                spacing: 'space-y-3', // Standard space
                iconSize: 18, // Standard icons
                titleSize: '18px', // Standard title text
                descriptionSize: '10px', // Standard description text
                gap: 'gap-3 lg:gap-4' // Standard gap
              };
            case 4:
            default:
              return {
                padding: 'p-5 lg:p-6', // Less padding for more cards
                spacing: 'space-y-2', // Less space between elements
                iconSize: 16, // Smaller icons
                titleSize: '16px', // Smaller title text
                descriptionSize: '9px', // Smaller description text
                gap: 'gap-2 lg:gap-3' // Less gap between cards
              };
          }
        };
        
        const gridLayout = getGridLayout();
        const sizing = getDynamicSizing();
        
        return (
              <div className={`grid ${gridLayout} ${sizing.gap} w-full h-full`}>
                {validCards.map((card, index) => {
                  const cardState = cardFigmaStates[index];
                  const titleStyle = getCardStyle(index, 'title');
                  const descriptionStyle = getCardStyle(index, 'description');
                  
                  return (
                <div 
                  key={index} 
                      className={`${sizing.padding} transition-all duration-300 hover:bg-blue-600 group cursor-pointer bg-gray-100 relative`}
                      onMouseEnter={() => setHoveredCard(`card-${index}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Icon */}
                  <div className={`mb-4 ${cardCount === 4 ? '-ml-3' : '-ml-5'}`}>
                    <div className="w-10 h-10 flex items-center justify-center">
                      <div className="text-gray-700 group-hover:text-white transition-colors duration-300">
                        <IconBlock 
                          iconName={card.icon as any}
                          size={sizing.iconSize}
                          color="currentColor"
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={sizing.spacing}>
                                          {/* Title */}
                        <div 
                          className={`card-title-layer-${index} absolute pointer-events-auto`}
                          style={{
                            left: '24px', // Move title text to the right (was 16px)
                            top: '68px', // Move title lower (was 56px)
                            width: 'calc(100% - 40px)', // Adjust width to account for increased left margin
                            zIndex: 15,
                            overflow: 'visible',
                            contain: 'none',
                            position: 'absolute'
                          }}
                        >
                          <FigmaText
                            variant="title"
                            color={titleStyle.color}
                            align={titleStyle.alignment}
                            fontFamily={titleStyle.fontFamily}
                            className="font-medium font-helvetica-neue leading-tight break-words hyphens-none"
                            style={{
                              fontSize: `${titleStyle.fontSize}px`,
                              color: titleStyle.color,
                              textAlign: titleStyle.alignment,
                              lineHeight: '1.2',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal'
                            }}
                            isSelected={cardState[0].isTitleSelected}
                            transform={cardState[0].titleTransform}
                            onClick={handleElementSelection(`card-${index}-title`, cardState[1].handleTitleClick)}
                            onTextChange={(newText) => handleCardTextChange(index, 'title', newText)}
                            onSizeChange={cardState[1].handleTitleSizeChange}
                            onChangeSize={(fontSize) => handleCardChangeSize(index, 'title', fontSize)}
                            onChangeFont={(fontFamily) => handleCardChangeFont(index, 'title', fontFamily)}
                            onDragStart={cardState[1].handleTitleDragStart}
                            onResizeStart={cardState[1].handleTitleResizeStart}
                            onDeleteText={() => handleCardTextChange(index, 'title', '')}
                            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                              const cardElement = document.querySelector(`.card-title-layer-${index}`);
                              if (cardElement) {
                                const cardRect = cardElement.getBoundingClientRect();
                                const canvasContainer = cardElement.closest('.lists-cards-layout') as HTMLElement;
                                if (canvasContainer) {
                                  const canvasRect = canvasContainer.getBoundingClientRect();
                                  const relativeX = (cardRect.left - canvasRect.left) - 10;
                                  const relativeY = (cardRect.top - canvasRect.top) - 50;
                                  
                                  setTextPopupState({
                                    isOpen: true,
                                    position: { x: relativeX, y: relativeY },
                                    originalPosition: { x: relativeX, y: relativeY },
                                    currentFontSize: fontSize,
                                    currentFontFamily: fontFamily,
                                    targetElement: `card-${index}-title`,
                                    lastTargetElement: `card-${index}-title`
                                  });
                                }
                              }
                            }}>
          {card.title}
                          </FigmaText>
                        </div>
                      
                      {/* Description */}
                        <div 
                          className={`card-desc-layer-${index} absolute pointer-events-auto`}
                          style={{
                            left: '24px', // Move description text to the right (was 16px)
                            top: '90px', // Move description lower to maintain spacing with title (was 78px)
                            width: 'calc(100% - 40px)', // Adjust width to account for increased left margin
                            zIndex: 15,
                            overflow: 'visible',
                            contain: 'none',
                            position: 'absolute'
                          }}
                        >
                          <FigmaText
                            variant="body"
                            color={descriptionStyle.color}
                            align={descriptionStyle.alignment}
                            fontFamily={descriptionStyle.fontFamily}
                            className="font-helvetica-neue leading-relaxed break-words"
                            style={{
                              fontSize: `${descriptionStyle.fontSize}px`,
                              color: descriptionStyle.color,
                              textAlign: descriptionStyle.alignment,
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal'
                            }}
                            isSelected={cardState[0].isDescriptionSelected}
                            transform={cardState[0].descriptionTransform}
                            onClick={handleElementSelection(`card-${index}-description`, cardState[1].handleDescriptionClick)}
                            onTextChange={(newText) => handleCardTextChange(index, 'description', newText)}
                            onSizeChange={cardState[1].handleDescriptionSizeChange}
                            onChangeSize={(fontSize) => handleCardChangeSize(index, 'description', fontSize)}
                            onChangeFont={(fontFamily) => handleCardChangeFont(index, 'description', fontFamily)}
                            onDragStart={cardState[1].handleDescriptionDragStart}
                            onResizeStart={cardState[1].handleDescriptionResizeStart}
                            onDeleteText={() => handleCardTextChange(index, 'description', '')}
                            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                              const cardElement = document.querySelector(`.card-desc-layer-${index}`);
                              if (cardElement) {
                                const cardRect = cardElement.getBoundingClientRect();
                                const canvasContainer = cardElement.closest('.lists-cards-layout') as HTMLElement;
                                if (canvasContainer) {
                                  const canvasRect = canvasContainer.getBoundingClientRect();
                                  const relativeX = (cardRect.left - canvasRect.left) - 10;
                                  const relativeY = (cardRect.top - canvasRect.top) - 50;
                                  
                                  setTextPopupState({
                                    isOpen: true,
                                    position: { x: relativeX, y: relativeY },
                                    originalPosition: { x: relativeX, y: relativeY },
                                    currentFontSize: fontSize,
                                    currentFontFamily: fontFamily,
                                    targetElement: `card-${index}-description`,
                                    lastTargetElement: `card-${index}-description`
                                  });
                                }
                              }
                            }}>
          {card.description}
                          </FigmaText>
                  </div>
                </div>
            </div>
                  );
                })}
          </div>
        );
      })()}
        </div>
      )}
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
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeSize(index, field as 'title' | 'description', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeFont(index, field as 'title' | 'description', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeColor(index, field as 'title' | 'description', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeAlignment(index, field as 'title' | 'description', alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleColor;
            if (target === 'description') return currentDescriptionColor;
            if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getCardStyle(index, field as 'title' | 'description');
              return style.color;
            }
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getCardStyle(index, field as 'title' | 'description');
              return style.alignment;
            }
            return currentTitleAlignment;
          })()}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardTextChange(index, field as 'title' | 'description', '');
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
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeSize(index, field as 'title' | 'description', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeFont(index, field as 'title' | 'description', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeColor(index, field as 'title' | 'description', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardChangeAlignment(index, field as 'title' | 'description', alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleColor;
            if (target === 'description') return currentDescriptionColor;
            if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getCardStyle(index, field as 'title' | 'description');
              return style.color;
            }
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getCardStyle(index, field as 'title' | 'description');
              return style.alignment;
            }
            return currentTitleAlignment;
          })()}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target && target.startsWith('card-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleCardTextChange(index, field as 'title' | 'description', '');
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}

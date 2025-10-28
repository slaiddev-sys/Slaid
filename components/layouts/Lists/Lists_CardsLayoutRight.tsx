import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection, FigmaSelectionState, FigmaSelectionHandlers } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import IconBlock from '../../blocks/IconBlock';

export interface ListsCardsLayoutRightProps {
  /**
   * Main title for the section (appears on the left)
   */
  title?: string;
  
  /**
   * Description text that appears on the left below title
   */
  description?: string;
  
  /**
   * Array of cards to display on the right (exactly 4 cards)
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
   * Card title text color
   */
  cardTitleColor?: string;
  
  /**
   * Card description text color
   */
  cardDescriptionColor?: string;
  
  /**
   * Background color for the entire layout
   */
  backgroundColor?: string;
  
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
  cardDescTransforms?: { x: number; y: number }[];
  
  // Font styling overrides (saved values)
  savedTitleFontSize?: number;
  savedTitleFontFamily?: string;
  savedTitleAlignment?: 'left' | 'center' | 'right';
  savedDescriptionFontSize?: number;
  savedDescriptionFontFamily?: string;
  savedDescriptionAlignment?: 'left' | 'center' | 'right';
  savedCardTransforms?: { x: number; y: number }[];
  savedCardDescTransforms?: { x: number; y: number }[];
}

export default function Lists_CardsLayoutRight({
  title = 'How Savium works',
  description = 'Comprehensive suite of features designed to streamline your workflow and boost productivity.',
  cards = [
    {
      icon: 'Target',
      title: 'Goal Planning',
      description: 'Set, track and achieve personal and business financial goals with ease.'
    },
    {
      icon: 'TrendingUp',
      title: 'Analytics',
      description: 'Use data-driven insights to forecast cash flow and anticipate financial trends.'
    },
    {
      icon: 'DollarSign',
      title: 'Smart Budgeting',
      description: 'Automatically organize income and expenses, giving every dollar a purpose.'
    },
    {
      icon: 'Shield',
      title: 'Secure Management',
      description: 'Bank-level encryption and privacy standards ensure complete user trust.'
    },
    {
      icon: 'Zap',
      title: 'High-Growth Potential',
      description: 'Web3 is one of the fastest-growing sectors in tech, and early investors have the opportunity to shape its future.'
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
  cardTitleColor = 'text-gray-900',
  cardDescriptionColor = 'text-gray-600',
  backgroundColor = 'bg-white',
  canvasWidth = 1280,
  canvasHeight = 720,
  useFixedDimensions = false,
  className = '',
  titleFontSize = 48,
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
  cardDescTransforms: savedCardDescTransforms,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: ListsCardsLayoutRightProps) {

  // Interactive text state management
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentCards, setCurrentCards] = useState(cards);

  // Title styling state with saved overrides
  const [titleFontSizeState, setTitleFontSize] = useState(savedTitleFontSize || titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(savedTitleFontFamily || titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(savedTitleAlignment || titleAlignment);

  // Description styling state with saved overrides
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(savedDescriptionFontSize || descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(savedDescriptionFontFamily || descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(savedDescriptionAlignment || descriptionAlignment);

  // Card styling state
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardStylesState, setCardStyles] = useState<Record<string, any>>(cardStyles || {});

  // 🔧 SYNC PROPS TO STATE - Update state when props change (for persistence)
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setCurrentTitleColor(titleColor);
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
    setCurrentDescriptionColor(descriptionColor);
  }, [descriptionColor]);

  useEffect(() => {
    setCurrentDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  useEffect(() => {
    setCardStyles(cardStyles || {});
  }, [JSON.stringify(cardStyles)]);
  const [cardTransforms, setCardTransforms] = useState<Record<string, any>>({});

  // Hover state for cards
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Global selection state - only one text element can be selected at a time
  const [globalSelectedElement, setGlobalSelectedElement] = useState<string | null>(null);

  // Text selection handlers with saved transforms and onUpdate
  const textSelectionResult = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });
  const textSelectionState = textSelectionResult[0];
  const textSelectionHandlers = textSelectionResult[1];

  // Helper function to create card title update handler
  const createCardUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      // Update the specific card title transform
      const newTransforms = [...(savedCardTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ cardTransforms: newTransforms });
    }
    if (onUpdate && updates.descriptionTransform) {
      // Update the specific card description transform
      const newDescTransforms = [...(savedCardDescTransforms || [])];
      newDescTransforms[index] = updates.descriptionTransform;
      onUpdate({ cardDescTransforms: newDescTransforms });
    }
  };

  // Card figma selection states with persistence
  const card1Result = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[0] || { x: 0, y: 0 },
    initialDescriptionTransform: savedCardDescTransforms?.[0] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(0)
  });
  const card1State = card1Result[0];
  const card1Handlers = card1Result[1];
  
  const card2Result = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[1] || { x: 0, y: 0 },
    initialDescriptionTransform: savedCardDescTransforms?.[1] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(1)
  });
  const card2State = card2Result[0];
  const card2Handlers = card2Result[1];
  
  const card3Result = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[2] || { x: 0, y: 0 },
    initialDescriptionTransform: savedCardDescTransforms?.[2] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(2)
  });
  const card3State = card3Result[0];
  const card3Handlers = card3Result[1];
  
  const card4Result = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[3] || { x: 0, y: 0 },
    initialDescriptionTransform: savedCardDescTransforms?.[3] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(3)
  });
  const card4State = card4Result[0];
  const card4Handlers = card4Result[1];
  
  const card5Result = useFigmaSelection({
    initialTitleTransform: savedCardTransforms?.[4] || { x: 0, y: 0 },
    initialDescriptionTransform: savedCardDescTransforms?.[4] || { x: 0, y: 0 },
    onUpdate: createCardUpdateHandler(4)
  });
  const card5State = card5Result[0];
  const card5Handlers = card5Result[1];

  // Array of all card states for easy access
  const cardFigmaStates: [FigmaSelectionState, FigmaSelectionHandlers][] = [
    [card1State, card1Handlers],
    [card2State, card2Handlers],
    [card3State, card3Handlers],
    [card4State, card4Handlers],
    [card5State, card5Handlers]
  ];

  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as string | null,
    lastTargetElement: null as string | null
  });

  const containerClasses = useFixedDimensions
    ? `lists-cards-layout-right px-6 lg:px-12 pt-8 lg:pt-10 pb-6 lg:pb-8 ${backgroundColor} ${className}`
    : `lists-cards-layout-right px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 ${backgroundColor} w-full h-full min-h-[400px] ${className}`;

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
        position: 'relative' as const
      }
    : {
        // Responsive mode constraints
        overflow: 'visible',
        contain: 'layout style',
        width: '100%',
        height: '100%',
        minHeight: '400px'
      };

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
    setCurrentCards(prev => prev?.map((card, i) => 
      i === index ? { ...card, [field]: newText } : card
    ) || []);
    if (onUpdate) {
      const updatedCards = (currentCards || []).map((card, i) => 
        i === index ? { ...card, [field]: newText } : card
      );
      onUpdate({ cards: updatedCards });
    }
  };

  // Title styling handlers
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

  // Description styling handlers
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

  // Card styling handlers
  const handleCardChangeSize = (index: number, field: 'title' | 'description', fontSize: number) => {
    const key = `card-${index}-${field}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: { ...prev[key], fontSize }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleCardChangeFont = (index: number, field: 'title' | 'description', fontFamily: string) => {
    const key = `card-${index}-${field}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: { ...prev[key], fontFamily }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleCardChangeColor = (index: number, field: 'title' | 'description', color: string) => {
    const key = `card-${index}-${field}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: { ...prev[key], color }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleCardChangeAlignment = (index: number, field: 'title' | 'description', alignment: 'left' | 'center' | 'right') => {
    const key = `card-${index}-${field}`;
    setCardStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: { ...prev[key], alignment }
      };
      if (onUpdate) {
        onUpdate({ cardStyles: newStyles });
      }
      return newStyles;
    });
  };

  // Get card style with defaults
  const getCardStyle = (index: number, field: 'title' | 'description') => {
    const key = `card-${index}-${field}`;
    const defaults = field === 'title' 
      ? { fontSize: 14, fontFamily: 'font-helvetica-neue', color: '#1f2937', alignment: 'left' as const }
      : { fontSize: 11, fontFamily: 'font-helvetica-neue', color: '#6b7280', alignment: 'left' as const };
    
    const baseStyle = { ...defaults, ...cardStyles[key] };

    // Override color to white when hovered
    if (hoveredCard === `card-${index}`) {
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
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
  };

  // Size change handlers
  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Drag handlers
  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    textSelectionHandlers.handleTitleDragStart(e, element);
  };

  const handleDescriptionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    textSelectionHandlers.handleDescriptionDragStart(e, element);
  };

  // Resize handlers
  const handleTitleResizeStart = (e: React.MouseEvent, handle: string, element: HTMLElement) => {
    textSelectionHandlers.handleTitleResizeStart(e, handle, element);
  };

  const handleDescriptionResizeStart = (e: React.MouseEvent, handle: string, element: HTMLElement) => {
    textSelectionHandlers.handleDescriptionResizeStart(e, handle, element);
  };

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
            const [, cardHandlers] = cardFigmaStates[index];
            cardHandlers.handleClickOutside();
          }
        }
      }
      
      // Set new global selection
      setGlobalSelectedElement(elementId);
      
      // Execute the click handler with the event
      clickHandler(e);
    };
  };

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      let transform;
      let isDragging;
      
      if (activeTarget === 'title') {
        transform = textSelectionState.titleTransform;
        isDragging = textSelectionState.isTitleDragging;
      } else if (activeTarget === 'description') {
        transform = textSelectionState.descriptionTransform;
        isDragging = textSelectionState.isDescriptionDragging;
      } else if (activeTarget?.startsWith('card-')) {
        const [, indexStr] = activeTarget.split('-');
        const index = parseInt(indexStr);
        const [cardState] = cardFigmaStates[index] || [];
        if (cardState) {
          if (activeTarget.includes('title')) {
            transform = cardState.titleTransform;
            isDragging = cardState.isTitleDragging;
          } else {
            transform = cardState.descriptionTransform;
            isDragging = cardState.isDescriptionDragging;
          }
        }
      }
      
      if (transform) {
        setTextPopupState(prev => {
          // Calculate new position based on current original position and transform
          const newPosition = {
            x: prev.originalPosition.x + (transform.x || 0),
            y: prev.originalPosition.y + (transform.y || 0)
          };
          
          return {
            ...prev,
            position: newPosition
          };
        });
      }
    }
  }, [
    textSelectionState.titleTransform,
    textSelectionState.descriptionTransform,
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    card1State.titleTransform,
    card1State.descriptionTransform,
    card1State.isTitleDragging,
    card1State.isDescriptionDragging,
    card2State.titleTransform,
    card2State.descriptionTransform,
    card2State.isTitleDragging,
    card2State.isDescriptionDragging,
    card3State.titleTransform,
    card3State.descriptionTransform,
    card3State.isTitleDragging,
    card3State.isDescriptionDragging,
    card4State.titleTransform,
    card4State.descriptionTransform,
    card4State.isTitleDragging,
    card4State.isDescriptionDragging,
    card5State.titleTransform,
    card5State.descriptionTransform,
    card5State.isTitleDragging,
    card5State.isDescriptionDragging,
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
    
    // Deselect all elements
    textSelectionHandlers.handleClickOutside();
    cardFigmaStates.forEach(([cardState, cardHandlers]) => {
      cardHandlers.handleClickOutside();
    });
    
    setGlobalSelectedElement(null);
    setTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
  };

  return (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
    <div 
      className={containerClasses}
      style={containerStyle}
        onClick={handleGlobalClickOutside}
    >
      <div className="flex flex-col lg:flex-row lg:items-center h-full">
        
        {/* Left Column - Title and Description */}
        <div className="flex-shrink-0 w-1/3 flex items-center pr-6">
          <div className="w-full max-w-xs">
            {/* Title */}
              {layout.showTitle && (
                <div 
                  className="title-layer absolute pointer-events-auto"
                  style={{
                    left: '40px',
                    top: '170px',
                    width: 'auto',
                    zIndex: 10,
                    overflow: 'visible',
                    contain: 'none',
                    position: 'absolute'
                  }}
                >
                  <FigmaText
                    variant="title"
                    color={currentTitleColor}
                    align={currentTitleAlignment}
                    fontFamily={titleFontFamily}
                    className="font-normal font-helvetica-neue leading-none tracking-tighter break-words"
                    style={{
                      fontSize: `${titleFontSize}px`,
                      color: currentTitleColor,
                      textAlign: currentTitleAlignment,
                      lineHeight: '0.9',
                      letterSpacing: '-0.05em',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '300px'
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
                      const titleElement = document.querySelector('.lists-cards-layout-right .title-layer');
                      if (titleElement) {
                        const titleRect = titleElement.getBoundingClientRect();
                        const canvasContainer = titleElement.closest('.lists-cards-layout-right') as HTMLElement;
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

            {/* Description */}
              {layout.showDescription && currentDescription && (
                <div 
                  className="description-layer absolute pointer-events-auto"
                  style={{
                    left: '40px', // Default position
                    top: '225px', // Default position
                    width: 'auto',
                    zIndex: 10,
                    overflow: 'visible',
                    contain: 'none',
                    position: 'absolute'
                  }}
                >
                  <FigmaText
                    variant="body"
                    color={currentDescriptionColor}
                    align={currentDescriptionAlignment}
                    fontFamily={descriptionFontFamily}
                    className="font-helvetica-neue leading-relaxed break-words"
                    style={{
                      fontSize: `${descriptionFontSize}px`,
                      color: currentDescriptionColor,
                      textAlign: currentDescriptionAlignment,
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '220px'
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
                      const descriptionElement = document.querySelector('.lists-cards-layout-right .description-layer');
                      if (descriptionElement) {
                        const descriptionRect = descriptionElement.getBoundingClientRect();
                        const canvasContainer = descriptionElement.closest('.lists-cards-layout-right') as HTMLElement;
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
        </div>

        {/* Right Column - Cards Grid */}
        {layout.showCards && currentCards && currentCards.length > 0 && (
          <div className="flex-1 w-2/3 pl-3">
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {currentCards.slice(0, 5).map((card, index) => {
                const [cardState, cardHandlers] = cardFigmaStates[index];
                const titleStyle = getCardStyle(index, 'title');
                const descriptionStyle = getCardStyle(index, 'description');
                
                return (
                <div
                  key={index}
                    className="p-4 lg:p-5 transition-all duration-300 hover:bg-blue-600 group cursor-pointer bg-gray-100 relative min-h-[200px]"
                    onMouseEnter={() => setHoveredCard(`card-${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Icon */}
                  <div className="mb-4 -ml-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <div className="text-gray-700 group-hover:text-white transition-colors duration-300">
                        <IconBlock
                          iconName={card.icon as any}
                          size={16}
                          color="currentColor"
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    {/* Title */}
                      <div 
                        className={`card-title-layer-${index} absolute pointer-events-auto`}
                        style={{
                          left: '16px',
                          top: '56px',
                          width: 'calc(100% - 32px)',
                          zIndex: 25,
                          overflow: 'visible',
                          contain: 'none',
                          position: 'absolute',
                          pointerEvents: 'auto'
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
                            whiteSpace: 'normal',
                            maxWidth: '200px'
                          }}
                          isSelected={cardState.isTitleSelected}
                          transform={cardState.titleTransform}
                          onClick={handleElementSelection(`card-${index}-title`, cardHandlers.handleTitleClick)}
                          onTextChange={(newText) => handleCardTextChange(index, 'title', newText)}
                          onSizeChange={cardHandlers.handleTitleSizeChange}
                          onChangeSize={(fontSize) => handleCardChangeSize(index, 'title', fontSize)}
                          onChangeFont={(fontFamily) => handleCardChangeFont(index, 'title', fontFamily)}
                          onDragStart={cardHandlers.handleTitleDragStart}
                          onResizeStart={cardHandlers.handleTitleResizeStart}
                          onDeleteText={() => handleCardTextChange(index, 'title', '')}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            const cardElement = document.querySelector(`.lists-cards-layout-right .card-title-layer-${index}`);
                            if (cardElement) {
                              const cardRect = cardElement.getBoundingClientRect();
                              const canvasContainer = cardElement.closest('.lists-cards-layout-right') as HTMLElement;
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
                          left: '16px',
                          top: '80px',
                          width: 'calc(100% - 32px)',
                          zIndex: 25,
                          overflow: 'visible',
                          contain: 'none',
                          position: 'absolute',
                          pointerEvents: 'auto'
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
                            whiteSpace: 'normal',
                            maxWidth: '200px'
                          }}
                          isSelected={cardState.isDescriptionSelected}
                          transform={cardState.descriptionTransform}
                          onClick={handleElementSelection(`card-${index}-description`, cardHandlers.handleDescriptionClick)}
                          onTextChange={(newText) => handleCardTextChange(index, 'description', newText)}
                          onSizeChange={cardHandlers.handleDescriptionSizeChange}
                          onChangeSize={(fontSize) => handleCardChangeSize(index, 'description', fontSize)}
                          onChangeFont={(fontFamily) => handleCardChangeFont(index, 'description', fontFamily)}
                          onDragStart={cardHandlers.handleDescriptionDragStart}
                          onResizeStart={cardHandlers.handleDescriptionResizeStart}
                          onDeleteText={() => handleCardTextChange(index, 'description', '')}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            const cardElement = document.querySelector(`.lists-cards-layout-right .card-desc-layer-${index}`);
                            if (cardElement) {
                              const cardRect = cardElement.getBoundingClientRect();
                              const canvasContainer = cardElement.closest('.lists-cards-layout-right') as HTMLElement;
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
          </div>
        )}

      </div>
    </div>

      {/* Text Popup */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
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
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
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
  );
}
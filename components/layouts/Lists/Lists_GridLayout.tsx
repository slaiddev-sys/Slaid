import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import IconBlock from '../../blocks/IconBlock';
import type { ImageBlockProps } from '../../blocks/ImageBlock';

export interface ListsGridLayoutProps {
  /**
   * Main title for the section
   */
  title?: string;
  
  /**
   * Description text that appears below the title
   */
  description?: string;
  
  /**
   * Array of bullet points to display in grid format (2-8 items)
   */
  bulletPoints?: {
    icon: string;
    title: string;
    description: string;
  }[];
  
  /**
   * Layout configuration for grid positioning
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
     * Show/hide bullet points
     */
    showBulletPoints?: boolean;
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
  bulletPointStyles?: {
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
   * Update callback for canvas editing
   */
  onUpdate?: (updates: any) => void;

  // Transform overrides for dragged elements
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  bulletPointTransforms?: { x: number; y: number }[];
  
  // Font styling overrides (saved values)
  savedTitleFontSize?: number;
  savedTitleFontFamily?: string;
  savedTitleAlignment?: 'left' | 'center' | 'right';
  savedDescriptionFontSize?: number;
  savedDescriptionFontFamily?: string;
  savedDescriptionAlignment?: 'left' | 'center' | 'right';
  savedBulletPointTransforms?: { x: number; y: number }[];
}

/**
 * Lists Grid Layout
 * 
 * A modular grid layout for displaying 2-8 bullet point items in responsive columns.
 * Automatically adjusts column count based on item count:
 * - 2 items: 2 columns
 * - 3-4 items: 3 columns  
 * - 5-6 items: 3 columns
 * - 7-8 items: 4 columns
 * Features dynamic sizing and professional spacing.
 */
export default function Lists_GridLayout({
  title = 'How your company solves the problem and how this benefits',
  description = 'Key solutions and benefits overview.',
  bulletPoints = [
    {
      icon: 'CheckCircle',
      title: 'Lorem ipsum dolor sit amet',
      description: 'Lorem ipsum dolor sit amet consectetur. Senectus aliquet aenean risus quis. Neque viverra amet leo nisl. Morbi habitant cras ornare gravida sed arcu tempor elementum nibh sem.'
    },
    {
      icon: 'CheckCircle', 
      title: 'Lorem ipsum dolor sit amet',
      description: 'Lorem ipsum dolor sit amet consectetur. Senectus aliquet aenean risus quis. Neque viverra amet leo nisl. Morbi habitant cras ornare gravida sed arcu tempor elementum nibh sem.'
    },
    {
      icon: 'CheckCircle',
      title: 'Lorem ipsum dolor sit amet', 
      description: 'Lorem ipsum dolor sit amet consectetur. Senectus aliquet aenean risus quis. Neque viverra amet leo nisl. Morbi habitant cras ornare gravida sed arcu tempor elementum nibh sem.'
    },
    {
      icon: 'CheckCircle',
      title: 'Lorem ipsum dolor sit amet',
      description: 'Lorem ipsum dolor sit amet consectetur. Senectus aliquet aenean risus quis. Neque viverra amet leo nisl. Morbi habitant cras ornare gravida sed arcu tempor elementum nibh sem.'
    },
    {
      icon: 'CheckCircle',
      title: 'Lorem ipsum dolor sit amet',
      description: 'Lorem ipsum dolor sit amet consectetur. Senectus aliquet aenean risus quis. Neque viverra amet leo nisl. Morbi habitant cras ornare gravida sed arcu tempor elementum nibh sem.'
    },
    {
      icon: 'CheckCircle',
      title: 'Lorem ipsum dolor sit amet',
      description: 'Lorem ipsum dolor sit amet consectetur. Senectus aliquet aenean risus quis. Neque viverra amet leo nisl. Morbi habitant cras ornare gravida sed arcu tempor elementum nibh sem.'
    }
  ],
  layout = {
    showTitle: true,
    showDescription: true,
    showBulletPoints: true
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
  bulletPointStyles = {},
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  bulletPointTransforms: savedBulletPointTransforms,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: ListsGridLayoutProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentBulletPoints, setCurrentBulletPoints] = useState(bulletPoints);

  // Text styling state with saved overrides
  const [titleFontSizeState, setTitleFontSize] = useState(savedTitleFontSize || titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(savedTitleFontFamily || titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#1f2937');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(savedTitleAlignment || titleAlignment);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(savedDescriptionFontSize || descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(savedDescriptionFontFamily || descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || '#6b7280');
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(savedDescriptionAlignment || descriptionAlignment);

  // Bullet point styling state
  const [selectedBulletPoint, setSelectedBulletPoint] = useState<string | null>(null);
  const [hoveredBulletPoint, setHoveredBulletPoint] = useState<string | null>(null);
  const [bulletPointStylesState, setBulletPointStyles] = useState<Record<string, {
    titleFontSize: number;
    titleFontFamily: string;
    titleColor: string;
    titleAlignment: 'left' | 'center' | 'right';
    descriptionFontSize: number;
    descriptionFontFamily: string;
    descriptionColor: string;
    descriptionAlignment: 'left' | 'center' | 'right';
  }>>(bulletPointStyles || {});
  const [bulletPointTransforms, setBulletPointTransforms] = useState<Record<string, any>>({});

  // 🔧 SYNC PROPS TO STATE - Update state when props change (for persistence)
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setCurrentTitleAlignment(titleAlignment);
  }, [titleAlignment]);

  useEffect(() => {
    setCurrentTitleColor(titleColor || '#1f2937');
  }, [titleColor]);

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
    setBulletPointStyles(bulletPointStyles || {});
  }, [JSON.stringify(bulletPointStyles)]);

  // Helper function to create bullet point update handler
  const createBulletPointUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      // Update the specific bullet point transform
      const newTransforms = [...(savedBulletPointTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ bulletPointTransforms: newTransforms });
    }
  };

  // Individual Figma selection hooks for each bullet point (up to 8) with persistence
  const bulletPoint1State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[0] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(0)
  });
  const bulletPoint2State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[1] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(1)
  });
  const bulletPoint3State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[2] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(2)
  });
  const bulletPoint4State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[3] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(3)
  });
  const bulletPoint5State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[4] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(4)
  });
  const bulletPoint6State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[5] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(5)
  });
  const bulletPoint7State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[6] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(6)
  });
  const bulletPoint8State = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[7] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(7)
  });

  // Array of all bullet point states for easy access
  const bulletPointFigmaStates = [
    bulletPoint1State, bulletPoint2State, bulletPoint3State, bulletPoint4State,
    bulletPoint5State, bulletPoint6State, bulletPoint7State, bulletPoint8State
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
  };

  const handleDescriptionTextChange = (newText: string) => {
    setCurrentDescription(newText);
  };

  const handleBulletPointTextChange = (index: number, field: 'title' | 'description', newText: string) => {
    setCurrentBulletPoints(prev => prev.map((point, i) => 
      i === index ? { ...point, [field]: newText } : point
    ));
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

  // Bullet point style handlers
  const handleBulletPointChangeSize = (index: number, field: 'title' | 'description', fontSize: number) => {
    const key = `bullet-${index}`;
    setBulletPointStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}FontSize`]: fontSize
        }
      };
      if (onUpdate) {
        onUpdate({ bulletPointStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleBulletPointChangeFont = (index: number, field: 'title' | 'description', fontFamily: string) => {
    const key = `bullet-${index}`;
    setBulletPointStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}FontFamily`]: fontFamily
        }
      };
      if (onUpdate) {
        onUpdate({ bulletPointStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleBulletPointChangeColor = (index: number, field: 'title' | 'description', color: string) => {
    const key = `bullet-${index}`;
    setBulletPointStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}Color`]: color
        }
      };
      if (onUpdate) {
        onUpdate({ bulletPointStyles: newStyles });
      }
      return newStyles;
    });
  };

  const handleBulletPointChangeAlignment = (index: number, field: 'title' | 'description', alignment: 'left' | 'center' | 'right') => {
    const key = `bullet-${index}`;
    setBulletPointStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}Alignment`]: alignment
        }
      };
      if (onUpdate) {
        onUpdate({ bulletPointStyles: newStyles });
      }
      return newStyles;
    });
  };

  // Get bullet point style with defaults
  const getBulletPointStyle = (index: number, field: 'title' | 'description') => {
    const key = `bullet-${index}`;
    const defaults = field === 'title' 
      ? { fontSize: 14, fontFamily: 'font-helvetica-neue', color: '#1f2937', alignment: 'left' as const }
      : { fontSize: 10, fontFamily: 'font-helvetica-neue', color: '#6b7280', alignment: 'left' as const };
    
    const style = bulletPointStyles[key];
    const baseStyle = {
      fontSize: style?.[`${field}FontSize`] || defaults.fontSize,
      fontFamily: style?.[`${field}FontFamily`] || defaults.fontFamily,
      color: style?.[`${field}Color`] || defaults.color,
      alignment: style?.[`${field}Alignment`] || defaults.alignment
    };

    // Override color to white when hovered
    if (hoveredBulletPoint === key) {
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
        } else if (globalSelectedElement.startsWith('bullet-')) {
          // Deselect bullet point elements
          const [, indexStr] = globalSelectedElement.split('-');
          const index = parseInt(indexStr);
          if (bulletPointFigmaStates[index]) {
            bulletPointFigmaStates[index][1].handleClickOutside();
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
    bulletPointFigmaStates.forEach(state => {
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

  // Base classes for grid layout
  const containerClasses = useFixedDimensions 
    ? `lists-grid-layout px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `lists-grid-layout px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `lists-grid-heading-${currentTitle?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <section 
      className={`${containerClasses} flex flex-col relative`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Title Section */}
      {layout.showTitle && (
        <div 
          className="title-layer absolute pointer-events-auto"
           style={{
             left: '40px', // Add more left margin (was 24px)
             top: '48px', // Lower the title (was 32px)
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
            variant="title"
            color={currentTitleColor}
            align={currentTitleAlignment}
            fontFamily={titleFontFamily}
            className={`text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight tracking-tight break-words`}
            style={{
              fontSize: `${titleFontSize}px`,
              color: currentTitleColor,
              textAlign: currentTitleAlignment,
              lineHeight: '1.1',
              letterSpacing: '-0.025em',
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
              const titleElement = document.querySelector('.lists-grid-layout .title-layer');
              if (titleElement) {
                const titleRect = titleElement.getBoundingClientRect();
                const canvasContainer = titleElement.closest('.lists-grid-layout') as HTMLElement;
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

      {/* Description Section */}
      {layout.showDescription && currentDescription && (
        <div 
          className="description-layer absolute pointer-events-auto"
           style={{
             left: '40px', // Default position
             top: '85px', // Default position
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
              const descriptionElement = document.querySelector('.lists-grid-layout .description-layer');
              if (descriptionElement) {
                const descriptionRect = descriptionElement.getBoundingClientRect();
                const canvasContainer = descriptionElement.closest('.lists-grid-layout') as HTMLElement;
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

      {/* Modular Grid - Dynamic columns based on item count (2-8 items) */}
      {layout.showBulletPoints && currentBulletPoints && currentBulletPoints.length > 0 && (
        <div 
          className="absolute"
           style={{
             left: '40px', // Align with title and description (was 24px)
             top: '140px', // Move higher (was 180px)
             right: '40px', // Match left margin for symmetry
             bottom: '24px',
             zIndex: 5
           }}
        >
          {(() => {
            const itemCount = Math.min(Math.max(currentBulletPoints.length, 2), 8); // Clamp between 2-8
            const validBulletPoints = currentBulletPoints.slice(0, 8); // Take only first 8 items
        
        // Dynamic grid configuration based on item count
        const getGridConfig = () => {
          switch(true) {
            case itemCount === 2:
              return {
                gridCols: 'grid-cols-1 md:grid-cols-2',
                gap: 'gap-4 lg:gap-6',
                padding: 'p-4 lg:p-5',
                iconSize: 20,
                titleSize: '16px',
                descriptionSize: '10px',
                spacing: 'space-y-1'
              };
            case itemCount <= 4:
              return {
                gridCols: 'grid-cols-1 md:grid-cols-2',
                gap: 'gap-3 lg:gap-4',
                padding: 'p-4 lg:p-5',
                iconSize: 18,
                titleSize: '14px', 
                descriptionSize: '9px',
                spacing: 'space-y-1'
              };
            case itemCount <= 6:
              return {
                gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                gap: 'gap-3 lg:gap-4',
                padding: 'p-4 lg:p-5',
                iconSize: 16,
                titleSize: '13px',
                descriptionSize: '9px', 
                spacing: 'space-y-1'
              };
            case itemCount <= 8:
            default:
              return {
                gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
                gap: 'gap-2 lg:gap-3',
                padding: 'p-3 lg:p-4',
                iconSize: 16,
                titleSize: '12px',
                descriptionSize: '8px',
                spacing: 'space-y-1'
              };
          }
        };
        
        const config = getGridConfig();
        
        return (
              <div className={`grid ${config.gridCols} ${config.gap} w-full h-full`}>
                {validBulletPoints.map((point, index) => {
                  const bulletPointState = bulletPointFigmaStates[index];
                  const titleStyle = getBulletPointStyle(index, 'title');
                  const descriptionStyle = getBulletPointStyle(index, 'description');
                  
                  return (
                <div 
                  key={index} 
                      className={`${config.padding} transition-all duration-300 hover:bg-blue-600 group cursor-pointer bg-gray-100 relative`}
                      onMouseEnter={() => setHoveredBulletPoint(`bullet-${index}`)}
                      onMouseLeave={() => setHoveredBulletPoint(null)}
                >
                  {/* Icon */}
                  <div className="mb-2 -ml-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <div className="text-gray-700 group-hover:text-white transition-colors duration-300">
                        <IconBlock 
                          iconName={point.icon as any}
                          size={config.iconSize}
                          color="currentColor"
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={config.spacing}>
                    {/* Title */}
                        <div 
                          className={`bullet-title-layer-${index} absolute pointer-events-auto`}
                          style={{
                            left: '12px', // Adjust left position for moved icon
                            top: '55px', // Lower the title position
                            width: 'calc(100% - 24px)',
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
                            className="font-medium font-helvetica-neue leading-tight break-words"
                            style={{
                              fontSize: `${titleStyle.fontSize}px`,
                              color: titleStyle.color,
                              textAlign: titleStyle.alignment,
                              lineHeight: '1.2',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal'
                            }}
                            isSelected={bulletPointState[0].isTitleSelected}
                            transform={bulletPointState[0].titleTransform}
                            onClick={handleElementSelection(`bullet-${index}-title`, bulletPointState[1].handleTitleClick)}
                            onTextChange={(newText) => handleBulletPointTextChange(index, 'title', newText)}
                            onSizeChange={bulletPointState[1].handleTitleSizeChange}
                            onChangeSize={(fontSize) => handleBulletPointChangeSize(index, 'title', fontSize)}
                            onChangeFont={(fontFamily) => handleBulletPointChangeFont(index, 'title', fontFamily)}
                            onDragStart={bulletPointState[1].handleTitleDragStart}
                            onResizeStart={bulletPointState[1].handleTitleResizeStart}
                            onDeleteText={() => handleBulletPointTextChange(index, 'title', '')}
                            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                              const bulletElement = document.querySelector(`.bullet-title-layer-${index}`);
                              if (bulletElement) {
                                const bulletRect = bulletElement.getBoundingClientRect();
                                const canvasContainer = bulletElement.closest('.lists-grid-layout') as HTMLElement;
                                if (canvasContainer) {
                                  const canvasRect = canvasContainer.getBoundingClientRect();
                                  const relativeX = (bulletRect.left - canvasRect.left) - 10;
                                  const relativeY = (bulletRect.top - canvasRect.top) - 50;
                                  
                                  setTextPopupState({
                                    isOpen: true,
                                    position: { x: relativeX, y: relativeY },
                                    originalPosition: { x: relativeX, y: relativeY },
                                    currentFontSize: fontSize,
                                    currentFontFamily: fontFamily,
                                    targetElement: `bullet-${index}-title`,
                                    lastTargetElement: `bullet-${index}-title`
                                  });
                                }
                              }
                            }}>
          {point.title}
                          </FigmaText>
                        </div>
                    
                    {/* Description */}
                        <div 
                          className={`bullet-desc-layer-${index} absolute pointer-events-auto`}
                          style={{
                            left: '12px', // Adjust left position for moved icon
                            top: '80px', // Adjust to maintain spacing with lowered title
                            width: 'calc(100% - 24px)',
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
                            isSelected={bulletPointState[0].isDescriptionSelected}
                            transform={bulletPointState[0].descriptionTransform}
                            onClick={handleElementSelection(`bullet-${index}-description`, bulletPointState[1].handleDescriptionClick)}
                            onTextChange={(newText) => handleBulletPointTextChange(index, 'description', newText)}
                            onSizeChange={bulletPointState[1].handleDescriptionSizeChange}
                            onChangeSize={(fontSize) => handleBulletPointChangeSize(index, 'description', fontSize)}
                            onChangeFont={(fontFamily) => handleBulletPointChangeFont(index, 'description', fontFamily)}
                            onDragStart={bulletPointState[1].handleDescriptionDragStart}
                            onResizeStart={bulletPointState[1].handleDescriptionResizeStart}
                            onDeleteText={() => handleBulletPointTextChange(index, 'description', '')}
                            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                              const bulletElement = document.querySelector(`.bullet-desc-layer-${index}`);
                              if (bulletElement) {
                                const bulletRect = bulletElement.getBoundingClientRect();
                                const canvasContainer = bulletElement.closest('.lists-grid-layout') as HTMLElement;
                                if (canvasContainer) {
                                  const canvasRect = canvasContainer.getBoundingClientRect();
                                  const relativeX = (bulletRect.left - canvasRect.left) - 10;
                                  const relativeY = (bulletRect.top - canvasRect.top) - 50;
                                  
                                  setTextPopupState({
                                    isOpen: true,
                                    position: { x: relativeX, y: relativeY },
                                    originalPosition: { x: relativeX, y: relativeY },
                                    currentFontSize: fontSize,
                                    currentFontFamily: fontFamily,
                                    targetElement: `bullet-${index}-description`,
                                    lastTargetElement: `bullet-${index}-description`
                                  });
                                }
                              }
                            }}>
          {point.description}
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
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeSize(index, field as 'title' | 'description', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeFont(index, field as 'title' | 'description', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeColor(index, field as 'title' | 'description', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeAlignment(index, field as 'title' | 'description', alignment);
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
            if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getBulletPointStyle(index, field as 'title' | 'description');
              return style.color;
            }
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getBulletPointStyle(index, field as 'title' | 'description');
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
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointTextChange(index, field as 'title' | 'description', '');
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
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeSize(index, field as 'title' | 'description', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeFont(index, field as 'title' | 'description', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeColor(index, field as 'title' | 'description', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointChangeAlignment(index, field as 'title' | 'description', alignment);
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
            if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getBulletPointStyle(index, field as 'title' | 'description');
              return style.color;
            }
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              const style = getBulletPointStyle(index, field as 'title' | 'description');
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
            } else if (target && target.startsWith('bullet-')) {
              const [, indexStr, field] = target.split('-');
              const index = parseInt(indexStr);
              handleBulletPointTextChange(index, field as 'title' | 'description', '');
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}

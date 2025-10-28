import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import ImageBlock from '../../blocks/ImageBlock';
import IconBlock from '../../blocks/IconBlock';
import { useFigmaSelection, FigmaImage, FigmaText, TextPopup } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import type { ImageBlockProps } from '../../blocks/ImageBlock';

export interface ListsLeftTextRightImageProps {
  /**
   * Main title for the financial metrics section
   */
  title?: string;
  
  /**
   * Description text that appears below the title
   */
  description?: string;
  
  /**
   * Array of bullet points to display below the description
   */
  bulletPoints?: {
    icon: string;
    title: string;
    description: string;
  }[];
  
  /**
   * Array of short paragraphs/notes to display in the left column
   */
  notes?: string[];
  
  /**
   * Image configuration passed to ImageBlock component
   */
  image?: ImageBlockProps;
  
  /**
   * Layout configuration for component positioning
   */
  layout?: {
    /**
     * Column proportions [text, image] - must add up to 12
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
     * Position of the image: 'left' or 'right'
     */
    imagePosition?: 'left' | 'right';
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
   * Notes text color
   */
  notesColor?: string;
  
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
   * Title styling props
   */
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  
  /**
   * Description styling props
   */
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionColor?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  
  /**
   * Bullet point styling props
   */
  bulletPointStyles?: {[key: string]: any};

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  // Transform overrides for dragged elements
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  imageTransform?: { x: number; y: number };
  bulletPointTransforms?: { x: number; y: number }[];
  bulletPointDescTransforms?: { x: number; y: number }[];
  
  // Font styling overrides (saved values)
  savedTitleFontSize?: number;
  savedTitleFontFamily?: string;
  savedTitleAlignment?: 'left' | 'center' | 'right';
  savedDescriptionFontSize?: number;
  savedDescriptionFontFamily?: string;
  savedDescriptionAlignment?: 'left' | 'center' | 'right';
  savedBulletPointTransforms?: { x: number; y: number }[];
  savedBulletPointDescTransforms?: { x: number; y: number }[];
}

/**
 * Lists Modular Text Image Layout
 * 
 * A flexible 2-column layout that can display text and image in either configuration:
 * - Text left, Image right (default: imagePosition: 'right')
 * - Text right, Image left (configurable: imagePosition: 'left')
 * Features dynamic bullet points (2-4 items) with responsive sizing. Perfect for business presentations.
 */
export default function Lists_LeftTextRightImage({
  title = 'Monthly Revenue Performance',
  description = 'Tracking our growth trajectory. Key financial metrics overview.',
  bulletPoints = [
    {
      icon: 'TrendingUp',
      title: 'Revenue Growth',
      description: 'Revenue exceeded projections by 15% driven by new product launches'
    },
    {
      icon: 'Users',
      title: 'Customer Acquisition',
      description: 'Customer acquisition cost decreased while retention improved significantly'
    },
    {
      icon: 'DollarSign',
      title: 'Order Value',
      description: 'Average order value increased by 22% across all customer segments'
    }
  ],
  notes = [
    'Achieved 24.5% growth vs last quarter',
    'Exceeded monthly targets by 18%', 
    'Strong performance in enterprise segment',
    'Consistent upward trend across all regions'
  ],
  image = {
    src: '/Default-Image-1.png',
    alt: 'Financial performance visualization',
    size: 'full',
    fit: 'cover',
    rounded: '2xl',
    shadow: false
  },
  layout = {
    columnSizes: [4, 8],
    showTitle: true,
    showDescription: true,
    showBulletPoints: true,
    imagePosition: 'right'
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  notesColor = 'text-gray-600',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  titleFontSize = 32,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionColor = 'text-gray-600',
  descriptionAlignment = 'left',
  bulletPointStyles = {},
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  imageTransform: savedImageTransform,
  bulletPointTransforms: savedBulletPointTransforms,
  bulletPointDescTransforms: savedBulletPointDescTransforms,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: ListsLeftTextRightImageProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  
  // Text styling state with saved overrides
  const [titleFontSizeState, setTitleFontSize] = useState(savedTitleFontSize || titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(savedTitleFontFamily || titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#1f2937');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(savedTitleAlignment || titleAlignment);
  
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(savedDescriptionFontSize || descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(savedDescriptionFontFamily || descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || '#6b7280');
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(savedDescriptionAlignment || descriptionAlignment);
  
  // Bullet points state with fallback
  const [currentBulletPoints, setCurrentBulletPoints] = useState(() => {
    // Ensure we always have bulletPoints for Topic Presentations
    if (!bulletPoints || bulletPoints.length === 0) {
      console.warn('🚨 Lists_LeftTextRightImage: No bulletPoints provided, using fallback');
      return [
        {
          icon: 'BookOpen',
          title: 'Key Information',
          description: 'Essential details and important concepts related to this topic'
        },
        {
          icon: 'Lightbulb',
          title: 'Key Insights',
          description: 'Important discoveries and findings that provide valuable understanding'
        },
        {
          icon: 'Target',
          title: 'Applications',
          description: 'Practical uses and real-world implementations of these concepts'
        }
      ];
    }
    return bulletPoints;
  });
  
  // Debug logging
  console.log('🔍 Lists_LeftTextRightImage Debug:', {
    bulletPointsProp: bulletPoints,
    currentBulletPoints,
    bulletPointsLength: bulletPoints?.length || 0,
    showBulletPoints: layout.showBulletPoints,
    hasValidBulletPoints: currentBulletPoints && currentBulletPoints.length > 0
  });

  // Update bulletPoints when prop changes
  useEffect(() => {
    if (bulletPoints && bulletPoints.length > 0) {
      // Only update if the bullet points have actually changed
      setCurrentBulletPoints(prevBulletPoints => {
        if (JSON.stringify(prevBulletPoints) !== JSON.stringify(bulletPoints)) {
          return bulletPoints;
        }
        return prevBulletPoints;
      });
    }
  }, [bulletPoints]);
  const [bulletPointStylesState, setBulletPointStyles] = useState<{
    [key: string]: {
      titleFontSize: number;
      titleColor: string;
      titleAlignment: 'left' | 'center' | 'right';
      descriptionFontSize: number;
      descriptionColor: string;
      descriptionAlignment: 'left' | 'center' | 'right';
    }
  }>(bulletPointStyles || {});

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
    setCurrentDescriptionColor(descriptionColor);
  }, [descriptionColor]);

  useEffect(() => {
    setCurrentDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  useEffect(() => {
    setBulletPointStyles(bulletPointStyles || {});
  }, [JSON.stringify(bulletPointStyles)]);
  
  // Text selection handlers with saved transforms and onUpdate
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });
  
  // Helper function to create bullet point title update handler
  const createBulletPointUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      // Update the specific bullet point title transform
      const newTransforms = [...(savedBulletPointTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ bulletPointTransforms: newTransforms });
    }
  };

  // Helper function to create bullet point description update handler
  const createBulletPointDescUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      // Update the specific bullet point description transform
      const newTransforms = [...(savedBulletPointDescTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ bulletPointDescTransforms: newTransforms });
    }
  };

  // Bullet point selection handlers - create individual hooks for each bullet point with persistence
  // We need to create a fixed number of hooks to avoid violating Rules of Hooks
  const bullet0TitleSelection = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[0] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(0)
  });
  const bullet0DescSelection = useFigmaSelection({
    initialTitleTransform: savedBulletPointDescTransforms?.[0] || { x: 0, y: 0 },
    onUpdate: createBulletPointDescUpdateHandler(0)
  });
  const bullet1TitleSelection = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[1] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(1)
  });
  const bullet1DescSelection = useFigmaSelection({
    initialTitleTransform: savedBulletPointDescTransforms?.[1] || { x: 0, y: 0 },
    onUpdate: createBulletPointDescUpdateHandler(1)
  });
  const bullet2TitleSelection = useFigmaSelection({
    initialTitleTransform: savedBulletPointTransforms?.[2] || { x: 0, y: 0 },
    onUpdate: createBulletPointUpdateHandler(2)
  });
  const bullet2DescSelection = useFigmaSelection({
    initialTitleTransform: savedBulletPointDescTransforms?.[2] || { x: 0, y: 0 },
    onUpdate: createBulletPointDescUpdateHandler(2)
  });
  const bullet3TitleSelection = useFigmaSelection();
  const bullet3DescSelection = useFigmaSelection();
  const bullet4TitleSelection = useFigmaSelection();
  const bullet4DescSelection = useFigmaSelection();
  
  // Map the hooks to the bullet points
  const bulletPointSelectionStates = {
    'bullet-0-title': bullet0TitleSelection,
    'bullet-0-description': bullet0DescSelection,
    'bullet-1-title': bullet1TitleSelection,
    'bullet-1-description': bullet1DescSelection,
    'bullet-2-title': bullet2TitleSelection,
    'bullet-2-description': bullet2DescSelection,
    'bullet-3-title': bullet3TitleSelection,
    'bullet-3-description': bullet3DescSelection,
    'bullet-4-title': bullet4TitleSelection,
    'bullet-4-description': bullet4DescSelection,
  };
  
  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 32,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'description' | string | null,
    lastTargetElement: null as 'title' | 'description' | string | null,
  });

  // Text width state for wrapping
  const [titleWidth, setTitleWidth] = useState<number | null>(null);
  const [descriptionWidth, setDescriptionWidth] = useState<number | null>(null);

  // Previous dragging state tracking
  const prevDraggingRef = useRef({
    titleDragging: false,
    descriptionDragging: false,
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

  // Text styling handlers
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

  // Bullet point handlers
  const handleBulletPointTitleChange = (index: number, newText: string) => {
    const updatedBulletPoints = [...currentBulletPoints];
    updatedBulletPoints[index] = { ...updatedBulletPoints[index], title: newText };
    setCurrentBulletPoints(updatedBulletPoints);
    if (onUpdate) {
      onUpdate({ bulletPoints: updatedBulletPoints });
    }
  };

  const handleBulletPointDescriptionChange = (index: number, newText: string) => {
    const updatedBulletPoints = [...currentBulletPoints];
    updatedBulletPoints[index] = { ...updatedBulletPoints[index], description: newText };
    setCurrentBulletPoints(updatedBulletPoints);
    if (onUpdate) {
      onUpdate({ bulletPoints: updatedBulletPoints });
    }
  };

  // Bullet point styling handlers
  const handleBulletPointTitleStyleChange = (index: number, property: string, value: any) => {
    setBulletPointStyles(prev => ({
      ...prev,
      [`bullet-${index}-title`]: {
        ...prev[`bullet-${index}-title`],
        [property]: value
      }
    }));
    if (onUpdate) {
      onUpdate({ 
        bulletPointStyles: {
          ...bulletPointStylesState,
          [`bullet-${index}-title`]: {
            ...bulletPointStylesState[`bullet-${index}-title`],
            [property]: value
          }
        }
      });
    }
  };

  const handleBulletPointDescriptionStyleChange = (index: number, property: string, value: any) => {
    setBulletPointStyles(prev => ({
      ...prev,
      [`bullet-${index}-description`]: {
        ...prev[`bullet-${index}-description`],
        [property]: value
      }
    }));
    if (onUpdate) {
      onUpdate({ 
        bulletPointStyles: {
          ...bulletPointStylesState,
          [`bullet-${index}-description`]: {
            ...bulletPointStylesState[`bullet-${index}-description`],
            [property]: value
          }
        }
      });
    }
  };

  // Helper function to deselect all elements except the specified one
  const deselectAllExcept = (exceptElement: string | null = null) => {
    // Deselect title and description if they're not the exception
    // Note: title and description share the same textSelectionHandlers
    if (exceptElement !== 'title' && exceptElement !== 'description') {
      textSelectionHandlers.handleClickOutside();
    }
    
    // Deselect all bullet points if they're not the exception
    Object.keys(bulletPointSelectionStates).forEach(key => {
      if (exceptElement !== key) {
        const handlers = bulletPointSelectionStates[key]?.[1];
        if (handlers?.handleClickOutside) {
          handlers.handleClickOutside();
        }
      }
    });
    
    // Close popup if no element is selected
    if (!exceptElement) {
      setTextPopupState(prev => ({ ...prev, isOpen: false, targetElement: null }));
    }
  };

  // Global click handler to deselect all elements
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') ||
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-container') ||
                          target.closest('[data-text-popup]');

    if (isFigmaElement) {
      return;
    }

    // Deselect all text elements
    deselectAllExcept(null);
  };

  // Custom onUpdate handler for image
  const handleImageUpdate = (updates: any) => {
    if (onUpdate) {
      if (updates.imageUrl) {
        // Handle image URL changes (when user uploads new image)
        onUpdate({ 
          image: { 
            ...image, 
            src: updates.imageUrl 
          } 
        });
      }
      if (updates.imageTransform) {
        // Handle image position changes (when user drags image)
        onUpdate({ 
          imageTransform: updates.imageTransform
        });
      }
    }
  };

  // Use Figma selection hook for the image with saved transform
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialImageUrl: image?.src,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: handleImageUpdate // 🔧 AUTO-UPDATE: Pass custom onUpdate for image object
  });

  // Update popup position when text is dragged (like Quote layout)
  useEffect(() => {
    if (!textPopupState.isOpen || (!textPopupState.targetElement && !textPopupState.lastTargetElement)) {
      return;
    }

    const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
    
    let transform;
    let isDragging;
    let wasDragging;
    
    if (activeTarget === 'title') {
      transform = textSelectionState.titleTransform;
      isDragging = textSelectionState.isTitleDragging;
      wasDragging = prevDraggingRef.current.titleDragging;
    } else if (activeTarget === 'description') {
      transform = textSelectionState.descriptionTransform;
      isDragging = textSelectionState.isDescriptionDragging;
      wasDragging = prevDraggingRef.current.descriptionDragging;
    } else if (activeTarget?.startsWith('bullet-')) {
      // For bullet points, we need to get the transform from the bullet point selection states
      const bulletSelectionState = bulletPointSelectionStates[activeTarget]?.[0];
      if (bulletSelectionState) {
        transform = bulletSelectionState.titleTransform;
        isDragging = bulletSelectionState.isTitleDragging;
        wasDragging = false; // We don't track bullet point dragging in prevDraggingRef yet
      }
    }
    
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

    // Update previous dragging states
    prevDraggingRef.current = {
      titleDragging: textSelectionState.isTitleDragging,
      descriptionDragging: textSelectionState.isDescriptionDragging,
    };
  }, [
    textSelectionState.titleTransform?.x,
    textSelectionState.titleTransform?.y,
    textSelectionState.descriptionTransform?.x,
    textSelectionState.descriptionTransform?.y,
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    textPopupState.isOpen,
    textPopupState.targetElement,
    textPopupState.originalPosition.x,
    textPopupState.originalPosition.y
  ]);

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    // CRITICAL: Clip overflow to prevent container expansion
    overflow: 'hidden',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
    position: 'relative'
  } : {
    // Responsive mode constraints
    overflow: 'hidden',
    contain: 'layout style',
    width: '100%',
    height: '100%',
    minHeight: '400px',
  };

  // Base classes for modular layout - dynamic padding based on image position
  const containerClasses = useFixedDimensions 
    ? `lists-left-text-right-image ${layout.imagePosition === 'left' ? 'pl-0' : 'pl-6 lg:pl-12'} pr-0 pt-0 pb-0 bg-white relative overflow-hidden ${className}`
    : `lists-left-text-right-image ${layout.imagePosition === 'left' ? 'pl-0' : 'pl-6 lg:pl-12'} pr-0 pt-0 pb-0 bg-white w-full h-full min-h-[400px] relative overflow-hidden ${className}`;

  // Generate unique ID for accessibility - use static ID to avoid hydration issues
  const headingId = `lists-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <section 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Modular Two-Column Layout - Image position configurable */}
      <div className="flex h-full relative overflow-hidden" style={{ overflow: 'hidden' }}>
        
        {/* Text Column - Position based on imagePosition */}
        <div className={`w-1/2 relative z-0 flex flex-col justify-start pt-20 lg:pt-24 pb-6 lg:pb-8 ${layout.imagePosition === 'left' ? 'order-2 pl-8' : 'order-1 pr-8'}`} style={{ marginLeft: layout.imagePosition === 'left' ? '50%' : '0%' }}>
          
          {/* Title - Absolute positioned */}
          {layout.showTitle && (
            <div 
              className="absolute pointer-events-auto"
              style={{
                left: '0px',
                top: '60px',
                width: 'auto',
                zIndex: 10,
                // Critical: Allow infinite expansion beyond canvas
                overflow: 'visible',
                contain: 'none',
                // Ensure no layout influence on parent
                position: 'absolute'
              }}
              data-figma-text
            >
              <FigmaText
                variant="title"
                color={currentTitleColor}
                align={currentTitleAlignment}
                fontFamily={titleFontFamily}
                className="font-normal text-2xl lg:text-3xl xl:text-4xl leading-none tracking-tighter break-words overflow-wrap-anywhere whitespace-normal"
                style={{
                  fontSize: `${titleFontSizeState}px`,
                  color: currentTitleColor,
                  lineHeight: '0.9',
                  letterSpacing: '-0.05em',
                  maxWidth: titleWidth ? `${titleWidth}px` : '400px'
                }}
                isSelected={textSelectionState.isTitleSelected}
                transform={textSelectionState.titleTransform}
                onDragStart={textSelectionHandlers.handleTitleDragStart}
                onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deselectAllExcept('title');
                  textSelectionHandlers.handleTitleClick(e);
                }}
                onTextChange={handleTitleTextChange}
                onDeleteText={() => {
                  setCurrentTitle('');
                  if (onUpdate) {
                    onUpdate({ title: '' });
                  }
                }}
                onResizeStart={(e: React.MouseEvent, direction: string) => {
                  const element = e.currentTarget as HTMLElement;
                  if (element && textSelectionHandlers.handleTitleResizeStart) {
                    textSelectionHandlers.handleTitleResizeStart(e, direction, element);
                  }
                }}
                onChangeSize={(fontSize: number) => setTitleFontSize(fontSize)}
                onChangeFont={(fontFamily: string) => setTitleFontFamily(fontFamily)}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const titleElement = document.querySelector('.lists-left-text-right-image [data-figma-text]');
                  if (titleElement) {
                    const titleRect = titleElement.getBoundingClientRect();
                    const canvasContainer = titleElement.closest('.lists-left-text-right-image') as HTMLElement;
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
                }}
              >
                {currentTitle}
              </FigmaText>
            </div>
          )}

          {/* Description - Absolute positioned */}
          {layout.showDescription && currentDescription && (
            <div 
              className="absolute pointer-events-auto"
              style={{
                left: '0px',
                top: '95px',
                width: 'auto',
                zIndex: 10,
                // Critical: Allow infinite expansion beyond canvas
                overflow: 'visible',
                contain: 'none',
                // Ensure no layout influence on parent
                position: 'absolute'
              }}
              data-figma-text
            >
                {(() => {
                const itemCount = Math.min(Math.max(currentBulletPoints?.length || 5, 2), 5);
                const getDescriptionSize = () => {
                  switch(itemCount) {
                      case 2: return 14; // Reduced to match bullet point description size for 2 items
                      case 3: return 12; // Reduced to match bullet point description size for 3 items
                      case 4: return 11; // Reduced to match bullet point description size for 4 items
                    case 5:
                      default: return 10; // Match bullet point description size for 5 items
                  }
                };
                
                return (
                    <FigmaText
                    variant="body"
                    color={currentDescriptionColor}
                    align={currentDescriptionAlignment}
                    fontFamily={descriptionFontFamily}
                    className="mt-2 leading-relaxed break-words hyphens-auto whitespace-normal"
                    style={{
                      fontSize: `${descriptionFontSizeState}px`,
                      color: currentDescriptionColor,
                      maxWidth: descriptionWidth ? `${descriptionWidth}px` : '320px'
                    }}
                    isSelected={textSelectionState.isDescriptionSelected}
                    transform={textSelectionState.descriptionTransform}
                    onDragStart={textSelectionHandlers.handleDescriptionDragStart}
                    onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      deselectAllExcept('description');
                      textSelectionHandlers.handleDescriptionClick(e);
                    }}
                    onTextChange={handleDescriptionTextChange}
                    onDeleteText={() => {
                      setCurrentDescription('');
                      if (onUpdate) {
                        onUpdate({ description: '' });
                      }
                    }}
                    onResizeStart={(e: React.MouseEvent, direction: string) => {
                      const element = e.currentTarget as HTMLElement;
                      if (element && textSelectionHandlers.handleDescriptionResizeStart) {
                        textSelectionHandlers.handleDescriptionResizeStart(e, direction, element);
                      }
                    }}
                    onChangeSize={(fontSize: number) => setDescriptionFontSize(fontSize)}
                    onChangeFont={(fontFamily: string) => setDescriptionFontFamily(fontFamily)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      const descriptionElements = document.querySelectorAll('.lists-left-text-right-image [data-figma-text]');
                      const descriptionElement = descriptionElements[1]; // Second element is description
                      if (descriptionElement) {
                        const descriptionRect = descriptionElement.getBoundingClientRect();
                        const canvasContainer = descriptionElement.closest('.lists-left-text-right-image') as HTMLElement;
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
                    }}
                  >
                    {currentDescription}
                  </FigmaText>
                );
              })()}
            </div>
          )}

          {/* Bullet Points - Back in original position */}
          <div className="mt-12">
          {layout.showBulletPoints && currentBulletPoints && currentBulletPoints.length > 0 && (() => {
            const itemCount = Math.min(Math.max(currentBulletPoints.length, 2), 5); // Clamp between 2-5
            const validBulletPoints = currentBulletPoints.slice(0, 5); // Take only first 5 items
            
            // Dynamic sizing based on item count
            const getDynamicSizing = () => {
              switch(itemCount) {
                case 2:
                  return {
                    spacing: 'space-y-10', // Much more space between items
                    iconSize: 18, // Larger icons
                    titleSize: '16px', // Reduced from 18px
                    descriptionSize: '14px', // Reduced from 16px
                    titleMargin: 'mb-4', // More margin below title
                    gap: 'gap-4' // Larger gap between icon and title
                  };
                case 3:
                  return {
                    spacing: 'space-y-8', // More space between items
                    iconSize: 16, // Larger icons
                    titleSize: '14px', // Reduced from 16px
                    descriptionSize: '12px', // Reduced from 14px
                    titleMargin: 'mb-3', // More margin below title
                    gap: 'gap-4' // Larger gap between icon and title
                  };
                case 4:
                  return {
                    spacing: 'space-y-6', // Medium space
                    iconSize: 14, // Medium icons
                    titleSize: '14px', // Reduced from 16px
                    descriptionSize: '11px', // Reduced from 14px
                    titleMargin: 'mb-2', // Standard margin
                    gap: 'gap-3' // Standard gap
                  };
                case 5:
                default:
                  return {
                    spacing: 'space-y-4', // Standard space
                    iconSize: 12, // Standard icons
                    titleSize: '12px', // Reduced from 14px
                    descriptionSize: '10px', // Reduced from 12px
                    titleMargin: 'mb-2', // Standard margin
                    gap: 'gap-3' // Standard gap
                  };
              }
            };
            
            const sizing = getDynamicSizing();
            
            return (
              <div className={sizing.spacing}>
                {validBulletPoints.slice(0, 5).map((point, index) => (
                  <div key={index} className="w-full" style={{ marginBottom: '16px' }}>
                    <div className={`flex items-start ${sizing.gap} ${sizing.titleMargin}`}>
                      <IconBlock 
                        iconName={point.icon as any}
                        size={sizing.iconSize}
                        color="#374151"
                        className="flex-shrink-0 mt-0.5"
                      />
                        <div className="flex-1" data-figma-text>
                        <FigmaText
                          variant="title"
                          color={bulletPointStyles[`bullet-${index}-title`]?.titleColor || '#1f2937'}
                          align={bulletPointStyles[`bullet-${index}-title`]?.titleAlignment || 'left'}
                          fontFamily={bulletPointStyles[`bullet-${index}-title`]?.titleFontFamily || fontFamily}
                          className="font-medium leading-tight break-words"
                          style={{
                            fontSize: `${bulletPointStylesState[`bullet-${index}-title`]?.titleFontSize || parseInt(sizing.titleSize)}px`,
                            color: bulletPointStylesState[`bullet-${index}-title`]?.titleColor || '#1f2937'
                          }}
                          isSelected={bulletPointSelectionStates[`bullet-${index}-title`]?.[0]?.isTitleSelected}
                          transform={bulletPointSelectionStates[`bullet-${index}-title`]?.[0]?.titleTransform}
                          onClick={(e: React.MouseEvent) => {
                            console.log('🎯 Bullet point title clicked:', index, point.title);
                            e.stopPropagation();
                            deselectAllExcept(`bullet-${index}-title`);
                            bulletPointSelectionStates[`bullet-${index}-title`]?.[1]?.handleTitleClick(e);
                          }}
                          onTextChange={(newText: string) => handleBulletPointTitleChange(index, newText)}
                          onDeleteText={() => {
                            handleBulletPointTitleChange(index, '');
                          }}
                          onDragStart={(e: React.MouseEvent) => {
                            const element = e.currentTarget as HTMLElement;
                            const handlers = bulletPointSelectionStates[`bullet-${index}-title`]?.[1];
                            if (element && handlers?.handleTitleDragStart) {
                              handlers.handleTitleDragStart(e, element);
                            }
                          }}
                          onResizeStart={(e: React.MouseEvent, direction: string) => {
                            const element = e.currentTarget as HTMLElement;
                            const handlers = bulletPointSelectionStates[`bullet-${index}-title`]?.[1];
                            if (element && handlers?.handleTitleResizeStart) {
                              handlers.handleTitleResizeStart(e, direction, element);
                            }
                          }}
                          onChangeSize={(fontSize: number) => handleBulletPointTitleStyleChange(index, 'titleFontSize', fontSize)}
                          onChangeFont={(fontFamily: string) => handleBulletPointTitleStyleChange(index, 'titleFontFamily', fontFamily)}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            const bulletElements = document.querySelectorAll('.lists-left-text-right-image [data-figma-text]');
                            const bulletTitleElement = bulletElements[2 + index * 2]; // Skip title and description, then 2 elements per bullet point
                            if (bulletTitleElement) {
                              const bulletRect = bulletTitleElement.getBoundingClientRect();
                              const canvasContainer = bulletTitleElement.closest('.lists-left-text-right-image') as HTMLElement;
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
                          }}
                        >
          {point.title}
                        </FigmaText>
                        {/* Dynamic Description - Aligned with title */}
                        <div data-figma-text style={{ maxWidth: '100%', width: '100%' }}>
                        <FigmaText
                          variant="body"
                          color={bulletPointStyles[`bullet-${index}-description`]?.descriptionColor || '#6b7280'}
                          align={bulletPointStyles[`bullet-${index}-description`]?.descriptionAlignment || 'left'}
                          fontFamily={bulletPointStyles[`bullet-${index}-description`]?.descriptionFontFamily || fontFamily}
                          className="leading-tight mt-1 break-words"
                          style={{
                            fontSize: `${bulletPointStylesState[`bullet-${index}-description`]?.descriptionFontSize || parseInt(sizing.descriptionSize)}px`,
                            color: bulletPointStylesState[`bullet-${index}-description`]?.descriptionColor || '#6b7280',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            maxWidth: '100%'
                          }}
                          isSelected={bulletPointSelectionStates[`bullet-${index}-description`]?.[0]?.isTitleSelected}
                          transform={bulletPointSelectionStates[`bullet-${index}-description`]?.[0]?.titleTransform}
                          onClick={(e: React.MouseEvent) => {
                            console.log('🎯 Bullet point description clicked:', index, point.description);
                            e.stopPropagation();
                            deselectAllExcept(`bullet-${index}-description`);
                            bulletPointSelectionStates[`bullet-${index}-description`]?.[1]?.handleTitleClick(e);
                          }}
                          onTextChange={(newText: string) => handleBulletPointDescriptionChange(index, newText)}
                          onDeleteText={() => {
                            handleBulletPointDescriptionChange(index, '');
                          }}
                          onDragStart={(e: React.MouseEvent) => {
                            const element = e.currentTarget as HTMLElement;
                            const handlers = bulletPointSelectionStates[`bullet-${index}-description`]?.[1];
                            if (element && handlers?.handleTitleDragStart) {
                              handlers.handleTitleDragStart(e, element);
                            }
                          }}
                          onResizeStart={(e: React.MouseEvent, direction: string) => {
                            const element = e.currentTarget as HTMLElement;
                            const handlers = bulletPointSelectionStates[`bullet-${index}-description`]?.[1];
                            if (element && handlers?.handleTitleResizeStart) {
                              handlers.handleTitleResizeStart(e, direction, element);
                            }
                          }}
                          onChangeSize={(fontSize: number) => handleBulletPointDescriptionStyleChange(index, 'descriptionFontSize', fontSize)}
                          onChangeFont={(fontFamily: string) => handleBulletPointDescriptionStyleChange(index, 'descriptionFontFamily', fontFamily)}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            const bulletElements = document.querySelectorAll('.lists-left-text-right-image [data-figma-text]');
                            const bulletDescElement = bulletElements[2 + index * 2 + 1]; // Skip title and description, then 2 elements per bullet point, +1 for description
                            if (bulletDescElement) {
                              const bulletRect = bulletDescElement.getBoundingClientRect();
                              const canvasContainer = bulletDescElement.closest('.lists-left-text-right-image') as HTMLElement;
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
                          }}
                        >
          {point.description}
                        </FigmaText>
                        </div>
                      </div>
                    </div>
                    
                    {/* Divider (except for last item) - Width matches content */}
                    {index < validBulletPoints.length - 1 && (
                      <div className="max-w-md h-px bg-gray-200 mt-4"></div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
          </div>
        </div>

        {/* Image with Figma-style Selection - Absolute positioning for free movement */}
        <div className="absolute inset-0 z-0" style={{ 
          left: layout.imagePosition === 'left' ? '0%' : '50%',
          width: '50%'
        }}>
          <FigmaImage
            src={image?.src || '/Default-Image-1.png'}
            alt={image?.alt || 'Financial performance visualization'}
            size="full"
            fit="cover"
            align="center"
            rounded={false}
            fill
            className="w-full h-full object-cover shadow-none rounded-none"
            containerClassName="w-full h-full"
            hoverStyle={{ filter: 'none', transition: 'all 0.2s ease' }}
            state={figmaState}
            handlers={figmaHandlers}
            hoverIconStyle={{ color: '#3b82f6', filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(211deg) brightness(99%) contrast(107%)' }}
            clickOverlayStyle={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}
            showHoverOverlay={false}
          />
        </div>

      </div>

      {/* Text Popup for styling controls */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          onChangeSize={(fontSize: number) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (textPopupState.targetElement === 'description') {
              handleDescriptionChangeSize(fontSize);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointTitleStyleChange(index, 'titleFontSize', fontSize);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointDescriptionStyleChange(index, 'descriptionFontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily: string) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (textPopupState.targetElement === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointTitleStyleChange(index, 'titleFontFamily', fontFamily);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointDescriptionStyleChange(index, 'descriptionFontFamily', fontFamily);
            }
          }}
          onChangeColor={(color: string) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeColor(color);
            } else if (textPopupState.targetElement === 'description') {
              handleDescriptionChangeColor(color);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointTitleStyleChange(index, 'titleColor', color);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointDescriptionStyleChange(index, 'descriptionColor', color);
            }
          }}
          onChangeAlignment={(alignment: 'left' | 'center' | 'right') => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (textPopupState.targetElement === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointTitleStyleChange(index, 'titleAlignment', alignment);
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointDescriptionStyleChange(index, 'descriptionAlignment', alignment);
            }
          }}
          onDeleteText={() => {
            if (textPopupState.targetElement === 'title') {
              setCurrentTitle('');
              if (onUpdate) {
                onUpdate({ title: '' });
              }
            } else if (textPopupState.targetElement === 'description') {
              setCurrentDescription('');
              if (onUpdate) {
                onUpdate({ description: '' });
              }
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointTitleChange(index, '');
            } else if (textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description')) {
              const index = parseInt(textPopupState.targetElement.split('-')[1]);
              handleBulletPointDescriptionChange(index, '');
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </section>
  );

  // Always wrap with CanvasOverlay for drag functionality to work
  return (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
    </CanvasOverlayProvider>
  );
}
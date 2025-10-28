import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import ImageBlock from '../../blocks/ImageBlock';
import IconBlock from '../../blocks/IconBlock';
import type { ImageBlockProps } from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import TextPopup from '../../figma/TextPopup';

export interface ListsLeftTextRightImageDescriptionProps {
  /**
   * Main title for the section
   */
  title?: string;
  
  /**
   * Main description text that appears below the title
   */
  description?: string;
  
  /**
   * Optional array of bullet points to display below the description
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
   * Callback for when component data is updated
   */
  onUpdate?: (updates: any) => void;

  // Transform overrides for dragged elements
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  imageTransform?: { x: number; y: number };
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
 * Lists Text Image Description Layout
 * 
 * A flexible 2-column layout that displays text and image with emphasis on description content:
 * - Text left, Image right (default: imagePosition: 'right')
 * - Text right, Image left (configurable: imagePosition: 'left')
 * Features a prominent description section with optional bullet points. Perfect for content-focused presentations.
 */
export default function Lists_LeftTextRightImageDescription({
  title = 'Our Solution',
  description = 'We provide comprehensive solutions that address the core challenges facing modern businesses in today\'s rapidly evolving digital landscape. Our approach combines cutting-edge innovative technology with time-tested proven methodologies to deliver measurable results that drive sustainable growth and operational efficiency across all aspects of your organization. Through strategic partnerships, advanced analytics, and continuous optimization, we ensure that every solution is tailored to meet your specific business objectives while maintaining scalability for future expansion. Our team of experts works closely with your organization to identify opportunities, implement best practices, and monitor performance metrics to guarantee long-term success and competitive advantage in your industry. We understand that each business faces unique challenges, which is why our methodology begins with a comprehensive assessment of your current operations, market position, and growth objectives. Our solutions encompass digital transformation initiatives, process automation, data analytics implementation, customer experience optimization, and strategic technology integration. We leverage artificial intelligence, machine learning, and advanced data processing capabilities to provide insights that drive informed decision-making and accelerate business outcomes. Our commitment extends beyond initial implementation to include ongoing support, performance monitoring, continuous improvement initiatives, and strategic guidance to ensure your organization remains competitive and continues to thrive in an ever-changing business environment. Through our proven track record of successful implementations across various industries, we have developed a deep understanding of market dynamics, regulatory requirements, and best practices that enable us to deliver solutions that not only meet immediate needs but also position your organization for long-term success and sustainable growth.',
  bulletPoints = [],
  notes = [],
  image = {
    src: '/Default-Image-1.png',
    alt: 'Financial performance visualization',
    size: 'full',
    fit: 'cover',
    rounded: 'xl',
    shadow: false
  },
  layout = {
    columnSizes: [4, 8],
    showTitle: true,
    showDescription: true,
    showBulletPoints: false, // Default to false - description-focused
    imagePosition: 'right'
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  notesColor = 'text-gray-600',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  titleFontSize = 48,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  bulletPointStyles = {},
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  imageTransform: savedImageTransform,
  bulletPointTransforms: savedBulletPointTransforms,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: ListsLeftTextRightImageDescriptionProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentBulletPoints, setCurrentBulletPoints] = useState(bulletPoints);

  // Text styling state for title with saved overrides
  const [titleFontSizeState, setTitleFontSize] = useState(savedTitleFontSize || titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(savedTitleFontFamily || titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || '#1f2937');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(savedTitleAlignment || titleAlignment);

  // Text styling state for description with saved overrides
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(savedDescriptionFontSize || descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(savedDescriptionFontFamily || descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(notesColor || '#6b7280');
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(savedDescriptionAlignment || descriptionAlignment);

  // Bullet point styling state
  const [bulletPointStylesState, setBulletPointStyles] = useState(bulletPointStyles || {});

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
    setCurrentDescriptionColor(notesColor || '#6b7280');
  }, [notesColor]);

  useEffect(() => {
    setCurrentDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  useEffect(() => {
    setBulletPointStyles(bulletPointStyles || {});
  }, [JSON.stringify(bulletPointStyles)]);

  // Text selection handlers - separate for each text element with saved transforms and onUpdate
  const [titleSelectionState, titleSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });
  const [descriptionSelectionState, descriptionSelectionHandlers] = useFigmaSelection({
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });
  
  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as string | null,
    lastTargetElement: null as string | null
  });

  // Helper function to create bullet point update handler
  const createBulletPointUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      // Update the specific bullet point transform
      const newTransforms = [...(savedBulletPointTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ bulletPointTransforms: newTransforms });
    }
  };

  // Bullet point selection hooks (up to 5 bullet points) with persistence
  const bulletPointSelectionStates: {[key: string]: any} = {};
  for (let i = 0; i < 5; i++) {
    bulletPointSelectionStates[`bullet-${i}-title`] = useFigmaSelection({
      initialTitleTransform: savedBulletPointTransforms?.[i] || { x: 0, y: 0 },
      onUpdate: createBulletPointUpdateHandler(i)
    });
    bulletPointSelectionStates[`bullet-${i}-description`] = useFigmaSelection();
  }

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

  const handleBulletPointTitleChange = (index: number, newText: string) => {
    const updatedBulletPoints = [...(currentBulletPoints || [])];
    if (updatedBulletPoints[index]) {
      updatedBulletPoints[index] = { ...updatedBulletPoints[index], title: newText };
      setCurrentBulletPoints(updatedBulletPoints);
      if (onUpdate) {
        onUpdate({ bulletPoints: updatedBulletPoints });
      }
    }
  };

  const handleBulletPointDescriptionChange = (index: number, newText: string) => {
    const updatedBulletPoints = [...(currentBulletPoints || [])];
    if (updatedBulletPoints[index]) {
      updatedBulletPoints[index] = { ...updatedBulletPoints[index], description: newText };
      setCurrentBulletPoints(updatedBulletPoints);
      if (onUpdate) {
        onUpdate({ bulletPoints: updatedBulletPoints });
      }
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
      onUpdate({ notesColor: color });
    }
  };

  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentDescriptionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ descriptionAlignment: alignment });
    }
  };

  // Bullet point style handlers
  const handleBulletPointStyleChange = (index: number, field: 'title' | 'description', property: string, value: any) => {
    const key = `bullet-${index}`;
    setBulletPointStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key],
          [`${field}${property.charAt(0).toUpperCase() + property.slice(1)}`]: value
        }
      };
      if (onUpdate) {
        onUpdate({ bulletPointStyles: newStyles });
      }
      return newStyles;
    });
  };

  // Size change handlers for resize functionality
  const handleTitleSizeChange = (newTransform: any) => {
    titleSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    descriptionSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Helper to deselect all text elements except the specified one
  const deselectAllExcept = (targetElement: string) => {
    if (targetElement !== 'title') {
      titleSelectionHandlers.handleClickOutside();
    }
    if (targetElement !== 'description') {
      descriptionSelectionHandlers.handleClickOutside();
    }
    Object.keys(bulletPointSelectionStates).forEach(key => {
      if (key !== targetElement) {
        bulletPointSelectionStates[key][1]?.handleClickOutside();
      }
    });
  };

  // Popup following effect - Exact Quote layout implementation
  const prevDraggingRef = useRef({ 
    isTitleDragging: false, 
    isDescriptionDragging: false
  });
  
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      const transform = activeTarget === 'title' 
        ? titleSelectionState.titleTransform 
        : activeTarget === 'description'
        ? descriptionSelectionState.descriptionTransform
        : null;
      
      const isDragging = activeTarget === 'title'
        ? titleSelectionState.isTitleDragging
        : activeTarget === 'description'
        ? descriptionSelectionState.isDescriptionDragging
        : false;

      const wasDragging = activeTarget === 'title'
        ? prevDraggingRef.current.isTitleDragging
        : activeTarget === 'description'
        ? prevDraggingRef.current.isDescriptionDragging
        : false;
      
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
      isTitleDragging: titleSelectionState.isTitleDragging,
      isDescriptionDragging: descriptionSelectionState.isDescriptionDragging
    };
  }, [
    titleSelectionState.titleTransform, 
    descriptionSelectionState.descriptionTransform, 
    titleSelectionState.isTitleDragging,
    descriptionSelectionState.isDescriptionDragging,
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
    return colSpanMap[span] || 'lg:col-span-4';
  };

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    overflow: 'visible',
    contain: 'layout style',
    position: 'relative' as const
  } : {
    overflow: 'visible',
    contain: 'layout style',
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    minHeight: '400px'
  };

  // Base classes for modular layout - dynamic padding based on image position
  const containerClasses = useFixedDimensions 
    ? `lists-left-text-right-image-description ${layout.imagePosition === 'left' ? 'pl-0' : 'pl-6 lg:pl-12'} pr-0 pt-0 pb-0 bg-white ${className}`
    : `lists-left-text-right-image-description ${layout.imagePosition === 'left' ? 'pl-0' : 'pl-6 lg:pl-12'} pr-0 pt-0 pb-0 bg-white ${className}`;

  // Generate unique ID for accessibility - use static ID to avoid hydration issues
  const headingId = `lists-description-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <section 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={(e: React.MouseEvent) => {
        // Handle image deselection
        figmaHandlers.handleClickOutside();
        
        // Handle text deselection - deselect all text elements when clicking outside
        const target = e.target as HTMLElement;
        const isTextElement = target.closest('[data-figma-text]');
        
        if (!isTextElement) {
          titleSelectionHandlers.handleClickOutside();
          descriptionSelectionHandlers.handleClickOutside();
          Object.keys(bulletPointSelectionStates).forEach(key => {
            bulletPointSelectionStates[key][1]?.handleClickOutside();
          });
        }
      }}
    >
      {/* Cards Layout Right style flex layout */}
      <div 
        className="flex flex-col lg:flex-row lg:items-center h-full" 
        style={{ 
          overflow: 'visible', 
          contain: 'layout style',
          position: 'relative',
          height: '100%',
          minHeight: '400px'
        }}
      >
        
        {/* Text Column - Cards Layout Right style positioning */}
        <div 
          className="flex-shrink-0 w-2/5 flex items-center pr-6 relative z-10" 
          style={{ 
            overflow: 'visible', 
            contain: 'layout style',
            height: '100%',
            pointerEvents: 'auto'
          }}
        >
          <div 
            className="w-full max-w-xs relative" 
            style={{ 
              overflow: 'visible', 
              contain: 'layout style',
              height: '100%',
              pointerEvents: 'auto'
            }}
          >
            {/* Title - Absolute positioned with independent context */}
            {layout.showTitle && (
              <div 
                className="absolute pointer-events-auto"
                style={{
                  left: '0px',
                  top: '160px',
                  width: 'auto',
                  maxWidth: '100%',
                  zIndex: 11,
                  overflow: 'visible',
                  contain: 'none',
                  position: 'absolute',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  isolation: 'isolate',
                  transform: 'translateZ(0)'
                }}
                data-figma-text
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <FigmaText
                  variant="title"
                  color={currentTitleColor}
                  align={currentTitleAlignment}
                  fontFamily={titleFontFamily}
                  className="font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tighter break-words"
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
                  isSelected={titleSelectionState.isTitleSelected}
                  transform={titleSelectionState.titleTransform}
                  onDragStart={titleSelectionHandlers.handleTitleDragStart}
                  onResizeStart={titleSelectionHandlers.handleTitleResizeStart}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    deselectAllExcept('title');
                    titleSelectionHandlers.handleTitleClick(e);
                  }}
                  onTextChange={handleTitleTextChange}
                  onDeleteText={() => setCurrentTitle('')}
                  onSizeChange={handleTitleSizeChange}
                  onChangeSize={handleTitleChangeSize}
                  onChangeFont={handleTitleChangeFont}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const titleElement = document.querySelector('.lists-left-text-right-image-description [data-figma-text]');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.lists-left-text-right-image-description') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (titleRect.left - canvasRect.left) - 10;
                        const relativeY = (titleRect.top - canvasRect.top) - 60; // Position above text
                        
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

            {/* Main Description - Absolute positioned with independent context */}
            {layout.showDescription && currentDescription && (
              <div 
                className="absolute pointer-events-auto"
                style={{
                  left: '0px', // Default position
                  top: '220px', // Moved higher from 250px to 220px
                  width: 'auto',
                  maxWidth: '100%',
                  zIndex: 12,
                  overflow: 'visible',
                  contain: 'none',
                  position: 'absolute',
                  cursor: 'move',
                  pointerEvents: 'auto',
                  isolation: 'isolate',
                  transform: 'translateZ(0)'
                }}
                data-figma-text
              >
                <FigmaText
                  variant="body"
                  color={currentDescriptionColor}
                  align={currentDescriptionAlignment}
                  fontFamily={descriptionFontFamily}
                  className="leading-relaxed break-words"
                  style={{
                    fontSize: `${descriptionFontSize}px`,
                    color: currentDescriptionColor,
                    textAlign: currentDescriptionAlignment,
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={descriptionSelectionState.isDescriptionSelected}
                  transform={descriptionSelectionState.descriptionTransform}
                  onDragStart={descriptionSelectionHandlers.handleDescriptionDragStart}
                  onResizeStart={descriptionSelectionHandlers.handleDescriptionResizeStart}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    deselectAllExcept('description');
                    descriptionSelectionHandlers.handleDescriptionClick(e);
                  }}
                  onTextChange={handleDescriptionTextChange}
                  onDeleteText={() => setCurrentDescription('')}
                  onSizeChange={handleDescriptionSizeChange}
                  onChangeSize={handleDescriptionChangeSize}
                  onChangeFont={handleDescriptionChangeFont}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const descElements = document.querySelectorAll('.lists-left-text-right-image-description [data-figma-text]');
                    const descElement = descElements[1]; // Second element (after title)
                    if (descElement) {
                      const descRect = descElement.getBoundingClientRect();
                      const canvasContainer = descElement.closest('.lists-left-text-right-image-description') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (descRect.left - canvasRect.left) - 10;
                        const relativeY = (descRect.top - canvasRect.top) - 60; // Position above text
                        
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
              </div>
            )}

          {/* Optional Bullet Points - Absolute positioned with independent context */}
          <div 
            className="absolute pointer-events-auto"
            style={{
              left: '0px',
              top: '160px',
              width: 'auto',
              maxWidth: '100%',
              zIndex: 13,
              overflow: 'visible',
              contain: 'none',
              position: 'absolute',
              pointerEvents: 'auto',
              isolation: 'isolate',
              transform: 'translateZ(0)'
            }}
          >
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
                    titleSize: '18px', // Larger title text
                    descriptionSize: '16px', // Larger description text
                    titleMargin: 'mb-4', // More margin below title
                    gap: 'gap-4' // Larger gap between icon and title
                  };
                case 3:
                  return {
                    spacing: 'space-y-8', // More space between items
                    iconSize: 16, // Larger icons
                    titleSize: '16px', // Larger title text
                    descriptionSize: '14px', // Larger description text
                    titleMargin: 'mb-3', // More margin below title
                    gap: 'gap-4' // Larger gap between icon and title
                  };
                case 4:
                  return {
                    spacing: 'space-y-6', // Medium space
                    iconSize: 14, // Medium icons
                    titleSize: '14px', // Medium title text
                    descriptionSize: '12px', // Medium description text
                    titleMargin: 'mb-2', // Standard margin
                    gap: 'gap-3' // Standard gap
                  };
                case 5:
                default:
                  return {
                    spacing: 'space-y-4', // Standard space
                    iconSize: 12, // Standard icons
                    titleSize: '11px', // Standard title text
                    descriptionSize: '10px', // Standard description text
                    titleMargin: 'mb-2', // Standard margin
                    gap: 'gap-3' // Standard gap
                  };
              }
            };
            
            const sizing = getDynamicSizing();
            
            return (
              <div className={sizing.spacing}>
                {validBulletPoints.map((point, index) => (
                  <div key={index} className="w-full">
                    {/* Dynamic Icon + Title */}
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
                            fontSize: `${bulletPointStyles[`bullet-${index}-title`]?.titleFontSize || parseInt(sizing.titleSize)}px`,
                            color: bulletPointStyles[`bullet-${index}-title`]?.titleColor || '#1f2937'
                          }}
                          isSelected={bulletPointSelectionStates[`bullet-${index}-title`]?.[0]?.isTitleSelected}
                          transform={bulletPointSelectionStates[`bullet-${index}-title`]?.[0]?.titleTransform}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deselectAllExcept(`bullet-${index}-title`);
                            bulletPointSelectionStates[`bullet-${index}-title`]?.[1]?.handleTitleClick(e);
                          }}
                          onTextChange={(newText: string) => handleBulletPointTitleChange(index, newText)}
                          onDeleteText={() => handleBulletPointTitleChange(index, '')}
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
                          onChangeSize={(fontSize: number) => handleBulletPointStyleChange(index, 'title', 'fontSize', fontSize)}
                          onChangeFont={(fontFamily: string) => handleBulletPointStyleChange(index, 'title', 'fontFamily', fontFamily)}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            const bulletElements = document.querySelectorAll('.lists-left-text-right-image-description [data-figma-text]');
                            const bulletTitleElement = bulletElements[2 + index * 2]; // Skip title and description, then 2 elements per bullet point
                            if (bulletTitleElement) {
                              const bulletRect = bulletTitleElement.getBoundingClientRect();
                              const canvasContainer = bulletTitleElement.closest('.lists-left-text-right-image-description') as HTMLElement;
                              if (canvasContainer) {
                                const canvasRect = canvasContainer.getBoundingClientRect();
                                const relativeX = (bulletRect.left - canvasRect.left) - 10;
                                const relativeY = (bulletRect.top - canvasRect.top) - 60; // Position above text
                                
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
                        <div data-figma-text>
                        <FigmaText
                          variant="body"
                          color={bulletPointStyles[`bullet-${index}-description`]?.descriptionColor || '#6b7280'}
                          align={bulletPointStyles[`bullet-${index}-description`]?.descriptionAlignment || 'left'}
                          fontFamily={bulletPointStyles[`bullet-${index}-description`]?.descriptionFontFamily || fontFamily}
                          className="leading-tight mt-1 break-words"
                          style={{
                            fontSize: `${bulletPointStyles[`bullet-${index}-description`]?.descriptionFontSize || parseInt(sizing.descriptionSize)}px`,
                            color: bulletPointStyles[`bullet-${index}-description`]?.descriptionColor || '#6b7280'
                          }}
                          isSelected={bulletPointSelectionStates[`bullet-${index}-description`]?.[0]?.isTitleSelected}
                          transform={bulletPointSelectionStates[`bullet-${index}-description`]?.[0]?.titleTransform}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deselectAllExcept(`bullet-${index}-description`);
                            bulletPointSelectionStates[`bullet-${index}-description`]?.[1]?.handleTitleClick(e);
                          }}
                          onTextChange={(newText: string) => handleBulletPointDescriptionChange(index, newText)}
                          onDeleteText={() => handleBulletPointDescriptionChange(index, '')}
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
                          onChangeSize={(fontSize: number) => handleBulletPointStyleChange(index, 'description', 'fontSize', fontSize)}
                          onChangeFont={(fontFamily: string) => handleBulletPointStyleChange(index, 'description', 'fontFamily', fontFamily)}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            const bulletElements = document.querySelectorAll('.lists-left-text-right-image-description [data-figma-text]');
                            const bulletDescElement = bulletElements[2 + index * 2 + 1]; // Skip title and description, then 2 elements per bullet point, +1 for description
                            if (bulletDescElement) {
                              const bulletRect = bulletDescElement.getBoundingClientRect();
                              const canvasContainer = bulletDescElement.closest('.lists-left-text-right-image-description') as HTMLElement;
                              if (canvasContainer) {
                                const canvasRect = canvasContainer.getBoundingClientRect();
                                const relativeX = (bulletRect.left - canvasRect.left) - 10;
                                const relativeY = (bulletRect.top - canvasRect.top) - 60; // Position above text
                                
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
        </div>

        {/* Image Column - Cards Layout Right style positioning with Figma-style Selection */}
        <div className="flex-1 w-3/5 pl-3">
          <div className="h-full">
            <FigmaImage
              src={image?.src || '/Default-Image-1.png'}
              alt={image?.alt || 'Solution visualization'}
              size="full"
              fit="cover"
              align="center"
              rounded={false}
              className="w-full h-full object-cover shadow-none rounded-none"
              containerClassName="w-full h-full"
              state={figmaState}
              handlers={figmaHandlers}
            />
          </div>
        </div>

      </div>

      {/* Text Popup - Quote Layout Style */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={
            textPopupState.targetElement === 'title' ? currentTitleColor :
            textPopupState.targetElement === 'description' ? currentDescriptionColor :
            textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title') ? 
              (bulletPointStyles[textPopupState.targetElement]?.titleColor || '#1f2937') :
            textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description') ? 
              (bulletPointStyles[textPopupState.targetElement]?.descriptionColor || '#6b7280') :
            '#1f2937'
          }
          currentAlignment={
            textPopupState.targetElement === 'title' ? currentTitleAlignment :
            textPopupState.targetElement === 'description' ? currentDescriptionAlignment :
            textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-title') ? 
              (bulletPointStyles[textPopupState.targetElement]?.titleAlignment || 'left') :
            textPopupState.targetElement?.startsWith('bullet-') && textPopupState.targetElement?.endsWith('-description') ? 
              (bulletPointStyles[textPopupState.targetElement]?.descriptionAlignment || 'left') :
            'left'
          }
          onChangeSize={(fontSize: number) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleDescriptionChangeSize(fontSize);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-title')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'title', 'fontSize', fontSize);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-description')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'description', 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily: string) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-title')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'title', 'fontFamily', fontFamily);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-description')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'description', 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color: string) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-title')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'title', 'color', color);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-description')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'description', 'color', color);
            }
          }}
          onChangeAlignment={(alignment: 'left' | 'center' | 'right') => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-title')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'title', 'alignment', alignment);
            } else if (target?.startsWith('bullet-') && target?.endsWith('-description')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointStyleChange(index, 'description', 'alignment', alignment);
            }
          }}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              setCurrentTitle('');
            } else if (target === 'description') {
              setCurrentDescription('');
            } else if (target?.startsWith('bullet-') && target?.endsWith('-title')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointTitleChange(index, '');
            } else if (target?.startsWith('bullet-') && target?.endsWith('-description')) {
              const index = parseInt(target.split('-')[1]);
              handleBulletPointDescriptionChange(index, '');
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
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

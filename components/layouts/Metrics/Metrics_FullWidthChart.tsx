import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import ChartBlock from '../../blocks/ChartBlock';
import type { ChartBlockProps } from '../../blocks/ChartBlock';

export interface MetricsFullWidthChartProps {
  /**
   * Main title for the metrics section
   */
  title?: string;
  
  /**
   * Description text that appears below the title
   */
  description?: string;
  
  /**
   * Chart configuration passed to ChartBlock component
   */
  chart?: ChartBlockProps;
  
  /**
   * Layout configuration for component positioning
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
     * Title alignment: 'left', 'center', or 'right'
     */
    titleAlignment?: 'left' | 'center' | 'right';
    /**
     * Right margin for right-aligned text
     */
    rightMargin?: string;
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

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Title transform for positioning
   */
  titleTransform?: { x: number; y: number };

  /**
   * Description transform for positioning
   */
  descriptionTransform?: { x: number; y: number };
}

/**
 * Metrics Full Width Chart Layout
 * 
 * A layout for displaying metrics with a full-width chart below the title and description.
 * Based on Metrics_FinancialsSplit but simplified to show only title, description, and chart.
 */
const Metrics_FullWidthChart = React.memo(function Metrics_FullWidthChart({
  title = 'Performance Overview',
  description = 'Comprehensive metrics and key performance indicators\nshowing quarterly growth trends and revenue optimization.',
  chart = {
    type: 'area' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { id: 'Revenue', data: [6.5, 11.2, 9.8, 15.1, 18.2, 24.5], color: '#4A3AFF' },
      { id: 'GMV', data: [5.8, 10.5, 9.2, 13.8, 17.1, 21.8], color: '#C893FD' }
    ],
    showLegend: true,
    showGrid: true,
    animate: true,
    stacked: false,
    curved: true,
    showDots: false,
    legendPosition: 'bottom',
    legendSize: 'medium',
    margin: { top: 20, right: 80, left: -10, bottom: 5 }
  },
  layout = {
    showTitle: true,
    showDescription: true,
    titleAlignment: 'left',
    rightMargin: 'mr-8 lg:mr-12'
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
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform
}: MetricsFullWidthChartProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);
  
  // Memoize chart props to prevent unnecessary re-renders
  const memoizedChart = React.useMemo(() => chart, [
    chart.type, 
    chart.labels, 
    chart.series, 
    chart.showLegend, 
    chart.showGrid, 
    chart.animate, 
    chart.stacked, 
    chart.curved, 
    chart.showDots, 
    chart.legendPosition, 
    chart.legendSize, 
    chart.margin
  ]);
  
  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);
  
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);

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
  
  // Text selection handlers with initial transforms and onUpdate
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
    currentFontSize: 32,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'description' | null,
    lastTargetElement: null as 'title' | 'description' | null,
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

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) {
      onUpdate({ description: '' });
    }
  };

  // Drag handlers
  const handleTitleDragStart = (e: React.MouseEvent) => {
    textSelectionHandlers.handleTitleDragStart?.(e, e.currentTarget as HTMLElement);
  };

  const handleDescriptionDragStart = (e: React.MouseEvent) => {
    textSelectionHandlers.handleDescriptionDragStart?.(e, e.currentTarget as HTMLElement);
  };

  // Resize handlers for text wrapping
  const handleTitleResize = (e: React.MouseEvent, direction: string) => {
    textSelectionHandlers.handleTitleResizeStart?.(e, direction, e.currentTarget as HTMLElement);
  };

  const handleDescriptionResize = (e: React.MouseEvent, direction: string) => {
    textSelectionHandlers.handleDescriptionResizeStart?.(e, direction, e.currentTarget as HTMLElement);
  };

  // Click handlers for single selection
  const handleTitleClick = (e: React.MouseEvent) => {
    // Deselect description first
    if (textSelectionHandlers.handleClickOutside) {
      textSelectionHandlers.handleClickOutside();
    }
    // Then handle title click
    textSelectionHandlers.handleTitleClick?.(e);
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    // Deselect title first
    if (textSelectionHandlers.handleClickOutside) {
      textSelectionHandlers.handleClickOutside();
    }
    // Then handle description click
    textSelectionHandlers.handleDescriptionClick?.(e);
  };

  // Update popup position when text is dragged
  useEffect(() => {
    const titleTransform = textSelectionState.titleTransform;
    const descriptionTransform = textSelectionState.descriptionTransform;
    const isTitleDragging = textSelectionState.isTitleDragging;
    const isDescriptionDragging = textSelectionState.isDescriptionDragging;

    // Update popup position for title
    if (titleTransform && isTitleDragging && textPopupState.targetElement === 'title') {
      setTextPopupState(prev => {
        const newPosition = {
          x: prev.originalPosition.x + (titleTransform.x || 0),
          y: prev.originalPosition.y + (titleTransform.y || 0)
        };
        return { ...prev, position: newPosition };
      });
    }

    // Update popup position for description
    if (descriptionTransform && isDescriptionDragging && textPopupState.targetElement === 'description') {
      setTextPopupState(prev => {
        const newPosition = {
          x: prev.originalPosition.x + (descriptionTransform.x || 0),
          y: prev.originalPosition.y + (descriptionTransform.y || 0)
        };
        return { ...prev, position: newPosition };
      });
    }

    // Update previous dragging state
    prevDraggingRef.current = {
      titleDragging: isTitleDragging,
      descriptionDragging: isDescriptionDragging,
    };
  }, [textSelectionState.titleTransform, textSelectionState.descriptionTransform, textSelectionState.isTitleDragging, textSelectionState.isDescriptionDragging, textPopupState.targetElement, textPopupState.originalPosition]);

  // Global click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside all text elements AND outside the TextPopup
      const isClickOnText = target.closest('[data-figma-text]') !== null;
      const isClickOnPopup = target.closest('[data-text-popup]') !== null;
      const isClickOnColorArea = target.closest('[data-color-area]') !== null;
      const isClickOnHueSlider = target.closest('[data-hue-slider]') !== null;
      
      if (!isClickOnText && !isClickOnPopup && !isClickOnColorArea && !isClickOnHueSlider) {
        // Deselect all text elements
        if (textSelectionHandlers.handleClickOutside) textSelectionHandlers.handleClickOutside();
        
        // Close the popup when clicking outside
        setTextPopupState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textSelectionHandlers]);

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
  } : {
    // Responsive mode constraints
    overflow: 'visible',
    contain: 'layout style',
    width: '100%',
    height: '100%',
    minHeight: '400px',
  };

  // Base classes for responsive layout
  const containerClasses = useFixedDimensions 
    ? `metrics-fullwidth-chart-layout pl-2 lg:pl-4 pr-2 lg:pr-4 pt-8 lg:pt-12 pb-8 lg:pb-12 bg-white overflow-hidden relative ${className}`
    : `metrics-fullwidth-chart-layout pl-2 lg:pl-4 pr-2 lg:pr-4 pt-8 lg:pt-12 pb-8 lg:pb-12 bg-white w-full h-full min-h-[400px] overflow-hidden relative ${className}`;

  // Generate unique ID for accessibility
  const headingId = `fullwidth-chart-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  return (
    <section 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
    >
      {/* Title Section - Dynamic alignment based on layout.titleAlignment */}
      {layout.showTitle && (
        <div className={`title-container w-full mb-3 ${
          layout.titleAlignment === 'center' ? 'text-center flex flex-col items-center' :
          layout.titleAlignment === 'right' ? `text-right flex flex-col items-end ${layout.rightMargin || 'mr-20'}` :
          'text-left ml-8 lg:ml-12'
        }`} style={{ contain: 'none', overflow: 'visible', flexShrink: 0 }}>
          {currentTitle && (
            <div className="absolute pointer-events-auto" style={{ 
              top: '60px',
              left: layout.titleAlignment === 'center' ? '50%' : layout.titleAlignment === 'right' ? 'auto' : '48px',
              right: layout.titleAlignment === 'right' ? '48px' : 'auto',
              transform: layout.titleAlignment === 'center' ? 'translateX(-50%)' : 'none',
              zIndex: 1000, 
              width: titleWidth ? `${titleWidth}px` : '400px', 
              maxWidth: '400px',
              contain: 'none',
              overflow: 'visible'
            }} data-figma-text>
              <FigmaText
                variant="title"
                color={currentTitleColor}
                align={currentTitleAlignment}
                fontFamily={titleFontFamilyState}
                className="font-normal"
                style={{
                  fontSize: `${titleFontSizeState}px`,
                  textAlign: currentTitleAlignment,
                  color: currentTitleColor,
                  lineHeight: '0.9',
                  letterSpacing: '-0.05em',
                  width: titleWidth ? `${titleWidth}px` : 'auto',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  fontWeight: '400 !important'
                }}
                isSelected={textSelectionState.isTitleSelected}
                transform={textSelectionState.titleTransform}
                onClick={handleTitleClick}
                onTextChange={handleTitleTextChange}
                onDeleteText={handleTitleDelete}
                onDragStart={handleTitleDragStart}
                onResizeStart={handleTitleResize}
                onChangeSize={handleTitleChangeSize}
                onChangeFont={handleTitleChangeFont}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  // Calculate position relative to the title element (same approach as Quote layout)
                  const titleElement = document.querySelector('.metrics-fullwidth-chart-layout .title-container [data-figma-text]');
                  if (titleElement) {
                    const titleRect = titleElement.getBoundingClientRect();
                    const canvasContainer = titleElement.closest('.metrics-fullwidth-chart-layout') as HTMLElement;
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
          {layout.showDescription && currentDescription && (
            <div className="absolute pointer-events-auto" style={{ 
              top: '90px',
              left: layout.titleAlignment === 'center' ? '50%' : layout.titleAlignment === 'right' ? 'auto' : '48px',
              right: layout.titleAlignment === 'right' ? '48px' : 'auto',
              transform: layout.titleAlignment === 'center' ? 'translateX(-50%)' : 'none',
              zIndex: 1000, 
              width: descriptionWidth ? `${descriptionWidth}px` : '300px', 
              maxWidth: '300px',
              contain: 'none',
              overflow: 'visible'
            }} data-figma-text>
              <FigmaText
                variant="body"
                color={currentDescriptionColor}
                align={currentDescriptionAlignment}
                fontFamily={descriptionFontFamilyState}
                className="font-normal"
                style={{
                  fontSize: `${descriptionFontSizeState}px`,
                  textAlign: currentDescriptionAlignment,
                  color: currentDescriptionColor,
                  width: descriptionWidth ? `${descriptionWidth}px` : 'auto',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-line',
                  fontWeight: '400 !important'
                }}
                isSelected={textSelectionState.isDescriptionSelected}
                transform={textSelectionState.descriptionTransform}
                onClick={handleDescriptionClick}
                onTextChange={handleDescriptionTextChange}
                onDeleteText={handleDescriptionDelete}
                onDragStart={handleDescriptionDragStart}
                onResizeStart={handleDescriptionResize}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  // Calculate position relative to the description element (same approach as Quote layout)
                  const descriptionElement = document.querySelector('.metrics-fullwidth-chart-layout .title-container [data-figma-text]:nth-child(2)');
                  if (descriptionElement) {
                    const descriptionRect = descriptionElement.getBoundingClientRect();
                    const canvasContainer = descriptionElement.closest('.metrics-fullwidth-chart-layout') as HTMLElement;
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
      )}

      {/* Full Width Chart Section */}
      <div className="chart-container w-full h-[320px] lg:h-[360px] flex flex-col items-start justify-start overflow-visible mt-16" style={{ flexShrink: 0, contain: 'layout style' }}>
        
        <ChartBlock
          {...memoizedChart}
          margin={{ top: 20, right: 80, left: -10, bottom: 5, ...memoizedChart.margin }}
          className={memoizedChart.className || 'w-full h-[280px] lg:h-[320px] bg-white p-0'}
          showComparison={false}
          onBarHover={undefined}
        />
      </div>

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
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentDescriptionAlignment}
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
    </section>
  );
});

export default Metrics_FullWidthChart;

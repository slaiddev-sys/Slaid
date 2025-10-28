import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
export interface RoadmapTimelineProps {
  /**
   * Main title for the roadmap
   */
  title?: string;
  
  /**
   * Description text that appears on the right side
   */
  description?: string;
  
  /**
   * Roadmap timeline data
   */
  roadmapData?: {
    periods: string[]; // e.g., ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
    items: {
      name: string;
      timeline: {
        period: string; // Which period this spans
        duration: number; // How many periods it spans
        color: string; // Color for the timeline bar
      };
    }[];
  };
  
  /**
   * Layout configuration
   */
  layout?: {
    /**
     * Column proportions [left, right] - must add up to 12
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
     * Show/hide roadmap timeline
     */
    showTimeline?: boolean;
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
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };

  /**
   * Callback function called when roadmap data changes due to user interactions
   */
  onDataChange?: (newRoadmapData: RoadmapTimelineProps['roadmapData']) => void;
}

/**
 * Roadmap Timeline Layout
 * 
 * A layout for displaying project roadmaps and timelines.
 * Top shows title and description side by side, bottom shows timeline with periods and development items.
 */
export default function Roadmap_Timeline({
  title = 'Timeline for Implementation and Development Process',
  description = 'Based on the identified usability issues, we\'ve outlined specific and actionable UX improvements. These solutions aim to reduce friction, enhance usability, and align with best practices in interaction design.',
  roadmapData = {
    periods: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    items: [
      {
        name: 'Planning',
        timeline: {
          period: 'Week 1',
          duration: 1,
          color: '#E5E7EB' // Light gray
        }
      },
      {
        name: 'Quick Wins',
        timeline: {
          period: 'Week 1',
          duration: 1,
          color: '#A1B7FF' // Clear blue (TAM color)
        }
      },
      {
        name: 'Core Journey Redesign',
        timeline: {
          period: 'Week 2',
          duration: 3,
          color: '#8B5CF6' // Purple color
        }
      },
      {
        name: 'User Testing',
        timeline: {
          period: 'Week 5',
          duration: 2,
          color: '#3044E3' // SAM color (medium blue)
        }
      },
      {
        name: 'Final Launch',
        timeline: {
          period: 'Week 7',
          duration: 1,
          color: '#1C00BB' // SOM color (dark blue)
        }
      }
    ]
  },
  layout = {
    columnSizes: [6, 6],
    showTitle: true,
    showDescription: true,
    showTimeline: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  titleFontSize = 36,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  onDataChange,
}: RoadmapTimelineProps) {
  
  // Interactive state for drag and drop
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [draggedOverRow, setDraggedOverRow] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState<number | null>(null);
  const [isDraggingHorizontally, setIsDraggingHorizontally] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number} | null>(null);
  const [dragMode, setDragMode] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [localRoadmapData, setLocalRoadmapData] = useState(roadmapData);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Interactive text state (from Cover_LeftImageTextRight)
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Sync props with state when they change (CRITICAL for secondary text editing)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  // Text selection handlers using useFigmaSelection hook with saved transforms
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });


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

  // Title styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);

  // Description styling state
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  useEffect(() => {
    setLocalRoadmapData(roadmapData);
  }, [roadmapData]);

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


  // Text popup state (moved from FigmaText to layout level for proper z-index)
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 }, // Store original position for drag offset calculation
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'description' | null,
    lastTargetElement: null as 'title' | 'description' | null // Remember last target for controls
  });

  // Track previous dragging states for popup positioning
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false
  });

  // Helper function to update local state and notify parent
  const updateRoadmapData = useCallback((newData: typeof roadmapData) => {
    setLocalRoadmapData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  }, [onDataChange]);

  // Update current content when props change
  useEffect(() => {
    setCurrentTitle(title || '');
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description || '');
  }, [description]);

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    console.log('🌍 Global click outside handler called', e.target);
    
    // Don't intercept clicks on FigmaText components or text popup
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      console.log('🎯 Click on Figma element - allowing event to bubble');
      return; // Let the event bubble to the FigmaText components
    }
    
    console.log('🌍 Click outside - deselecting all but keeping text popup open');
    textSelectionHandlers.handleClickOutside();
    // Keep text popup open but detach it from any specific element
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null, // Remove association but keep popup visible
      lastTargetElement: prev.targetElement // Remember the last target for controls
    }));
  };

  // Custom text handlers that actually update the styling
  const handleTitleChangeSize = (fontSize: number) => {
    setTitleFontSize(fontSize);
  };

  const handleTitleChangeFont = (fontFamily: string) => {
    setTitleFontFamily(fontFamily);
  };

  const handleTitleChangeColor = (color: string) => {
    setCurrentTitleColor(color);
  };

  const handleTitleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentTitleAlignment(alignment);
  };

  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleTitleDelete = () => {
    setCurrentTitle('');
  };

  const handleDescriptionChangeSize = (fontSize: number) => {
    setDescriptionFontSize(fontSize);
  };

  const handleDescriptionChangeFont = (fontFamily: string) => {
    setDescriptionFontFamily(fontFamily);
  };

  const handleDescriptionChangeColor = (color: string) => {
    setCurrentDescriptionColor(color);
  };

  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentDescriptionAlignment(alignment);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
  };

  // Text popup positioning effect (follows dragged text)
  useEffect(() => {
    if (textPopupState.isOpen && textPopupState.targetElement) {
      let transform;
      let isDragging = false;
      let wasDragging = false;
      
      const activeTarget = textPopupState.targetElement;
      
      if (activeTarget === 'title') {
        transform = textSelectionState.titleTransform;
        isDragging = textSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isTitleDragging;
      } else if (activeTarget === 'description') {
        transform = textSelectionState.descriptionTransform;
        isDragging = textSelectionState.isDescriptionDragging;
        wasDragging = prevDraggingRef.current.isDescriptionDragging;
      }
      
      if (transform) {
        setTextPopupState(prev => {
          // Calculate new position based on current original position and transform
          const newPosition = {
            x: prev.originalPosition.x + (transform.x || 0),
            y: prev.originalPosition.y + (transform.y || 0)
          };

          // If dragging just ended, update the original position to the new position
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
        isTitleDragging: textSelectionState.isTitleDragging || false,
        isDescriptionDragging: textSelectionState.isDescriptionDragging || false
      };
    }
  }, [textSelectionState.titleTransform, textSelectionState.descriptionTransform, textSelectionState.isTitleDragging, textSelectionState.isDescriptionDragging, textPopupState.isOpen, textPopupState.targetElement]);

  // Calculate grid columns based on number of periods
  const totalPeriods = localRoadmapData.periods.length;
  
  // Helper function to get grid column class based on number of periods (1-8 supported)
  const getGridColsClass = () => {
    switch (totalPeriods) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      case 7: return 'grid-cols-7';
      case 8: return 'grid-cols-8';
      default: return 'grid-cols-4'; // fallback for invalid values
    }
  };

  // Helper function to get responsive padding based on number of periods (1-8 supported)
  const getCellPadding = () => {
    if (totalPeriods >= 8) return 'p-1.5'; // Small padding for 8 periods
    if (totalPeriods >= 6) return 'p-2'; // Medium padding for 6-7 periods
    if (totalPeriods >= 4) return 'p-3'; // Default padding for 4-5 periods
    return 'p-4'; // Larger padding for 1-3 periods
  };

  // Helper function to find which period index a timeline item starts at
  const getPeriodIndex = (period: string) => {
    return localRoadmapData.periods.findIndex(p => p === period);
  };

  // Helper function to render timeline bars (each on its own row)
  const renderTimelineBar = (item: typeof roadmapData.items[0], itemIndex: number) => {
    const startIndex = getPeriodIndex(item.timeline.period);
    if (startIndex === -1) return null;

    // Calculate position and width as percentages
    // Boxes should be positioned between dividers, not starting at them
    const totalPeriods = localRoadmapData.periods.length;
    const columnWidth = 100 / totalPeriods;
    
    // Generic positioning logic that works for any number of periods
    // Base offset to position boxes between dividers
    let baseOffset = 2.5; // Consistent offset for all boxes
    
    // Margin adjustments based on duration, not specific names
    let leftMargin, rightMargin;
    if (item.timeline.duration === 1) {
      // Single-period boxes get small margins on both sides
      leftMargin = 0.3;
      rightMargin = 0.3;
    } else {
      // Multi-period boxes get minimal margins
      leftMargin = 0.1;
      rightMargin = 0.3;
    }
    
    // Fine-tune positioning for specific boxes
    if (item.name === 'Planning' || item.name === 'Quick Wins' || item.name === 'Core Journey Redesign') {
      baseOffset = 3.2; // Move to the right
    } else if (item.name === 'Final Launch') {
      baseOffset = 2.3; // Move slightly to the left
    }
    
    let startPercent = (startIndex * columnWidth) + baseOffset + leftMargin;
    let widthPercent = (item.timeline.duration * columnWidth) - leftMargin - rightMargin;
    
    // Ensure the box doesn't extend beyond the table boundaries (0% to 100%)
    const maxEndPercent = 100;
    const endPercent = startPercent + widthPercent;
    
    if (endPercent > maxEndPercent) {
      // If the box would extend beyond the right boundary, adjust it
      widthPercent = maxEndPercent - startPercent;
    }
    
    // Ensure minimum width
    if (widthPercent < 5) {
      widthPercent = 5;
      if (startPercent + widthPercent > maxEndPercent) {
        startPercent = maxEndPercent - widthPercent;
      }
    }

    return (
      <div
        key={item.name}
        draggable
        className={`absolute h-8 flex items-center justify-center text-white text-xs font-medium overflow-hidden whitespace-nowrap text-ellipsis cursor-move hover:scale-105 transition-all duration-200 group ${draggedItem === itemIndex ? 'opacity-50' : ''} ${isResizing === itemIndex ? 'cursor-ew-resize' : ''}`}
        style={{
          backgroundColor: item.timeline.color,
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderRadius: '9999px',
          padding: '0 12px', // Use inline padding instead of Tailwind px-3
          boxSizing: 'border-box', // Ensure padding is included in width
        }}
        onDragStart={(e) => {
          // Check if the drag started from a resize handle
          const target = e.target as HTMLElement;
          if (target.classList.contains('resize-handle')) {
            e.preventDefault();
            return false;
          }
          
          // Always allow HTML5 drag to start, we'll handle conflicts in mouse events
          setDraggedItem(itemIndex);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
          setDraggedItem(null);
          setDraggedOverRow(null);
          setDragMode('none');
        }}>
          {/* Left resize handle */}
        <div 
          className="absolute left-0 top-0 w-4 h-full cursor-ew-resize resize-handle"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResizeStart(e, itemIndex, 'left');
          }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        />
        
        <span className="truncate pointer-events-none">{item.name}</span>
        
        {/* Right resize handle */}
        <div 
          className="absolute right-0 top-0 w-4 h-full cursor-ew-resize resize-handle"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResizeStart(e, itemIndex, 'right');
          }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        />
      </div>
    );
  };

  // Handler functions for drag and drop
  const handleItemMove = useCallback((fromIndex: number, toIndex: number) => {
    const newItems = [...localRoadmapData.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    updateRoadmapData({
      ...localRoadmapData,
      items: newItems
    });
  }, [localRoadmapData, updateRoadmapData]);

      const handleHorizontalDragStart = useCallback((e: React.MouseEvent, itemIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHorizontally(itemIndex);

    const startX = e.clientX;
    const item = localRoadmapData.items[itemIndex];
    const originalStartPeriodIndex = getPeriodIndex(item.timeline.period);
    let currentPeriodIndex = originalStartPeriodIndex;

    // Get the current scale factor from the editor (if present)
    const getScaleFactor = () => {
      // Try multiple approaches to find the scaled container
      let scaleFactor = 1;
      
      // Method 1: Look for parent with transform style
      let element = timelineRef.current?.parentElement;
      while (element) {
        const transform = window.getComputedStyle(element).transform;
        if (transform && transform !== 'none') {
          const scaleMatch = transform.match(/matrix\(([^,]+),\s*[^,]+,\s*[^,]+,\s*([^,]+)/);
          if (scaleMatch) {
            scaleFactor = parseFloat(scaleMatch[1]);
            break;
          }
        }
        
        // Method 2: Look for inline transform style
        if (element.style.transform) {
          const scaleMatch = element.style.transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            scaleFactor = parseFloat(scaleMatch[1]);
            break;
          }
        }
        
        element = element.parentElement;
      }
      
      return scaleFactor;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const totalWidth = rect.width - 80; // Account for padding
      const periodWidth = totalWidth / localRoadmapData.periods.length;

      // Calculate how many periods to move based on mouse movement
      // Adjust for scale factor in editor
      const scaleFactor = getScaleFactor();
      const deltaX = (e.clientX - startX) / scaleFactor; // Adjust for scale
      const periodDelta = Math.round(deltaX / periodWidth);
      
      // Calculate new start period
      let newStartPeriodIndex = originalStartPeriodIndex + periodDelta;
      
      // Apply boundary constraints
      const maxStartPeriodIndex = localRoadmapData.periods.length - item.timeline.duration;
      newStartPeriodIndex = Math.max(0, Math.min(maxStartPeriodIndex, newStartPeriodIndex));

      // Only update if position actually changed
      if (newStartPeriodIndex !== currentPeriodIndex) {
        currentPeriodIndex = newStartPeriodIndex;
        
        // Update only the local state for instant visual feedback
        const newItems = [...localRoadmapData.items];
        newItems[itemIndex] = {
          ...item,
          timeline: {
            ...item.timeline,
            period: localRoadmapData.periods[newStartPeriodIndex]
          }
        };

        setLocalRoadmapData({
          ...localRoadmapData,
          items: newItems
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHorizontally(null);
      
      // Only call updateRoadmapData once at the end for persistence
      if (currentPeriodIndex !== originalStartPeriodIndex) {
        const newItems = [...localRoadmapData.items];
        newItems[itemIndex] = {
          ...item,
          timeline: {
            ...item.timeline,
            period: localRoadmapData.periods[currentPeriodIndex]
          }
        };

        updateRoadmapData({
          ...localRoadmapData,
          items: newItems
        });
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [localRoadmapData, getPeriodIndex, updateRoadmapData]);

  const handleResizeStart = useCallback((e: React.MouseEvent, itemIndex: number, direction: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(itemIndex);

      const startX = e.clientX;
      const item = localRoadmapData.items[itemIndex];
      const startPeriodIndex = getPeriodIndex(item.timeline.period);
      const originalDuration = item.timeline.duration;

      // Get the current scale factor from the editor (if present)
      const getScaleFactor = () => {
        // Try multiple approaches to find the scaled container
        let scaleFactor = 1;
        
        // Method 1: Look for parent with transform style
        let element = timelineRef.current?.parentElement;
        while (element) {
          const transform = window.getComputedStyle(element).transform;
          if (transform && transform !== 'none') {
            const scaleMatch = transform.match(/matrix\(([^,]+),\s*[^,]+,\s*[^,]+,\s*([^,]+)/);
            if (scaleMatch) {
              scaleFactor = parseFloat(scaleMatch[1]);
              break;
            }
          }
          
          // Method 2: Look for inline transform style
          if (element.style.transform) {
            const scaleMatch = element.style.transform.match(/scale\(([^)]+)\)/);
            if (scaleMatch) {
              scaleFactor = parseFloat(scaleMatch[1]);
              break;
            }
          }
          
          element = element.parentElement;
        }
        
        return scaleFactor;
      };

      let lastUpdateTime = 0;
      const updateThrottle = 16; // ~60fps

      const handleMouseMove = (e: MouseEvent) => {
        if (!timelineRef.current) return;
        
        // Throttle updates for smoother performance
        const now = Date.now();
        if (now - lastUpdateTime < updateThrottle) {
          return;
        }
        lastUpdateTime = now;

        const rect = timelineRef.current.getBoundingClientRect();
        const totalWidth = rect.width - 80; // Account for padding
        const periodWidth = totalWidth / localRoadmapData.periods.length;
        
        // Adjust for scale factor in editor
        const scaleFactor = getScaleFactor();
        const deltaX = (e.clientX - startX) / scaleFactor;
        
        // Calculate how many periods the mouse has moved
        const periodsMoved = deltaX / periodWidth;
        
        let newDuration = originalDuration;
        let newStartPeriod = startPeriodIndex;

        if (direction === 'right') {
          // Resize from right edge - only change duration
          newDuration = originalDuration + periodsMoved;
          
          // Ensure minimum duration of 0.5 periods
          newDuration = Math.max(0.5, newDuration);
          
          // Ensure the box doesn't extend beyond the last period
          const maxDuration = localRoadmapData.periods.length - startPeriodIndex;
          newDuration = Math.min(newDuration, maxDuration);
          
        } else {
          // Resize from left edge - move start position and adjust duration
          const newStartFloat = startPeriodIndex - periodsMoved;
          
          // Keep start position within bounds
          newStartPeriod = Math.max(0, Math.min(localRoadmapData.periods.length - 1, newStartFloat));
          
          // Calculate new duration to maintain right edge position
          const rightEdge = startPeriodIndex + originalDuration;
          newDuration = rightEdge - newStartPeriod;
          
          // Ensure minimum duration
          newDuration = Math.max(0.5, newDuration);
          
          // If duration would be too small, adjust start position
          if (newDuration < 0.5) {
            newDuration = 0.5;
            newStartPeriod = rightEdge - 0.5;
          }
          
          // Final bounds check for start position
          newStartPeriod = Math.max(0, Math.min(localRoadmapData.periods.length - newDuration, newStartPeriod));
        }

        // Convert start position to integer for period index
        const finalStartPeriodIndex = Math.floor(newStartPeriod);
        
        // Update the item
        const newItems = [...localRoadmapData.items];
        newItems[itemIndex] = {
          ...item,
          timeline: {
            ...item.timeline,
            period: localRoadmapData.periods[finalStartPeriodIndex],
            duration: newDuration
          }
        };

        updateRoadmapData({
          ...localRoadmapData,
          items: newItems
        });
      };
    
    const handleMouseUp = () => {
      setIsResizing(null);
      // Remove global cursor style
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add global cursor style during resize
    document.body.style.cursor = 'ew-resize';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [localRoadmapData, getPeriodIndex, updateRoadmapData]);

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
  } : {};

  // Base classes for roadmap layout
  const containerClasses = useFixedDimensions 
    ? `roadmap-timeline px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `roadmap-timeline px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `roadmap-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  return (
    <CanvasOverlayProvider>
      <section 
        className={`${containerClasses} flex flex-col roadmap-timeline`}
        style={containerStyle}
        aria-labelledby={headingId}
        onClick={handleGlobalClickOutside}
      >
      {/* Title and Description Section */}
      <div className="relative mb-8" style={{ height: '120px' }}>
        {/* Title */}
        {layout.showTitle && (
          <div 
            className="title-layer absolute pointer-events-auto"
            style={{
              left: '0px',
              top: '0px',
              width: '300px', // Fixed width to force wrapping
              zIndex: 10,
              // Critical: Allow infinite expansion beyond canvas
              overflow: 'visible',
              contain: 'none',
              // Ensure no layout influence on parent
              position: 'absolute'
            }}
          >
            <FigmaText
              className="title-layer"
              initialAdaptWidth={true}
              fontFamily={titleFontFamilyState}
              style={{
                fontSize: `${titleFontSizeState}px`,
                color: currentTitleColor,
                textAlign: currentTitleAlignment,
                fontWeight: 'normal',
                lineHeight: '1.0',
                letterSpacing: '-0.025em',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}
              isSelected={textSelectionState.isTitleSelected}
              transform={textSelectionState.titleTransform}
              onTextChange={handleTitleTextChange}
              onSizeChange={handleTitleSizeChange}
              onDeleteText={handleTitleDelete}
              onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                textSelectionHandlers.handleTitleDragStart(e, element);
              }}
              onResizeStart={(e: React.MouseEvent, handle: string, element: HTMLElement) => {
                textSelectionHandlers.handleTitleResizeStart(e, handle, element);
              }}
              onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                console.log('🎯 Title selected with fontSize:', fontSize, 'fontFamily:', fontFamily);
                
                // Trigger selection state
                textSelectionHandlers.handleTitleClick();
                
                // Calculate position relative to the title element in THIS specific layout
                const titleElement = document.querySelector('.roadmap-timeline .title-layer');
                if (titleElement) {
                  const titleRect = titleElement.getBoundingClientRect();
                  const canvasContainer = titleElement.closest('.roadmap-timeline') as HTMLElement;
                  if (canvasContainer) {
                    const canvasRect = canvasContainer.getBoundingClientRect();
                    const relativeX = (titleRect.left - canvasRect.left) - 10;
                    const relativeY = (titleRect.top - canvasRect.top) - 50;
                    
                    setTextPopupState({
                      isOpen: true,
                      position: { x: relativeX, y: relativeY },
                      originalPosition: { x: relativeX, y: relativeY }, // Store original position
                      currentFontSize: titleFontSize,
                      currentFontFamily: titleFontFamily,
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

        {/* Description */}
        {layout.showDescription && currentDescription && (
          <div 
            className="description-layer absolute pointer-events-auto"
            style={{
              left: '50%',
              top: '0px',
              width: '400px', // Fixed width to force wrapping
              zIndex: 10,
              // Critical: Allow infinite expansion beyond canvas
              overflow: 'visible',
              contain: 'none',
              // Ensure no layout influence on parent
              position: 'absolute'
            }}
          >
            <FigmaText
              className="description-layer"
              initialAdaptWidth={true}
              fontFamily={descriptionFontFamilyState}
              style={{
                fontSize: `${descriptionFontSizeState}px`,
                color: currentDescriptionColor,
                textAlign: currentDescriptionAlignment,
                lineHeight: '1.6',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}
              isSelected={textSelectionState.isDescriptionSelected}
              transform={textSelectionState.descriptionTransform}
              onTextChange={handleDescriptionTextChange}
              onSizeChange={handleDescriptionSizeChange}
              onDeleteText={handleDescriptionDelete}
              onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                textSelectionHandlers.handleDescriptionDragStart(e, element);
              }}
              onResizeStart={(e: React.MouseEvent, handle: string, element: HTMLElement) => {
                textSelectionHandlers.handleDescriptionResizeStart(e, handle, element);
              }}
              onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                console.log('🎯 Description selected with fontSize:', fontSize, 'fontFamily:', fontFamily);
                
                // Trigger selection state
                textSelectionHandlers.handleDescriptionClick();
                
                // Calculate position relative to the description element in THIS specific layout
                const descriptionElement = document.querySelector('.roadmap-timeline .description-layer');
                if (descriptionElement) {
                  const descriptionRect = descriptionElement.getBoundingClientRect();
                  const canvasContainer = descriptionElement.closest('.roadmap-timeline') as HTMLElement;
                  if (canvasContainer) {
                    const canvasRect = canvasContainer.getBoundingClientRect();
                    const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                    const relativeY = (descriptionRect.top - canvasRect.top) - 50;
                    
                    setTextPopupState({
                      isOpen: true,
                      position: { x: relativeX, y: relativeY },
                      originalPosition: { x: relativeX, y: relativeY }, // Store original position
                      currentFontSize: descriptionFontSize,
                      currentFontFamily: descriptionFontFamily,
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
      </div>

      {/* Timeline Section */}
      {layout.showTimeline && (
        <div className="w-full">
          <div className="bg-white overflow-hidden relative" style={{ backgroundColor: '#FCFCFC' }}>
          {/* Continuous vertical dividers - positioned absolutely to extend full height */}
            <div className={`absolute inset-0 grid ${getGridColsClass()}`} style={{ paddingLeft: '40px' }}>
          {localRoadmapData.periods.map((_, periodIndex) => (
                <div key={periodIndex} className="border-l border-gray-100 h-full">
                </div>
              ))}
            </div>

            {/* Period Headers */}
            <div className={`grid ${getGridColsClass()} mb-2 p-4 relative z-10`}>
              {localRoadmapData.periods.map((period, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    {period}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Items */}
            <div className="p-4 pt-0 relative z-10" style={{ marginTop: '-1rem' }} ref={timelineRef}>

              {/* Each timeline item gets its own row */}
              {localRoadmapData.items.slice(0, 5).map((item, index) => (
                <div 
                  key={index} 
                  className={`relative h-12 mb-0 ${draggedOverRow === index ? 'bg-blue-100' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggedOverRow(index);
                  }}
                  onDragLeave={() => setDraggedOverRow(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    console.log('Drop event - draggedItem:', draggedItem, 'targetIndex:', index);
                    if (draggedItem !== null && draggedItem !== index) {
                      console.log('Moving item from', draggedItem, 'to', index);
                      handleItemMove(draggedItem, index);
                    } else {
                      console.log('Drop ignored - same position or null draggedItem');
                    }
                    setDraggedItem(null);
                    setDraggedOverRow(null);
                  }}>
          {/* Timeline pill positioned in its own row */}
                  <div className="absolute inset-0 flex items-center pointer-events-none" style={{ paddingLeft: '40px', paddingRight: '2px' }}>
                    <div className="pointer-events-auto">
                      {renderTimelineBar(item, index)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Popup - Rendered at layout level for proper z-index */}
      <TextPopup
        isOpen={textPopupState.isOpen}
        onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
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
        onDeleteText={() => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleDelete();
          } else if (target === 'description') {
            handleDescriptionDelete();
          }
          setTextPopupState(prev => ({ ...prev, isOpen: false }));
        }}
        position={textPopupState.position}
        currentFontSize={textPopupState.currentFontSize}
        currentFontFamily={textPopupState.currentFontFamily}
        currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentDescriptionColor}
        currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentDescriptionAlignment}
      />
      </section>
    </CanvasOverlayProvider>
  );
}

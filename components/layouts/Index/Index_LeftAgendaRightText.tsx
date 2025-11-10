import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import ImageBlock from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText, TextPopup } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface IndexLeftAgendaRightTextProps {
  /**
   * Main title for the agenda
   */
  title?: string;
  
  /**
   * Optional description text
   */
  description?: string;
  
  /**
   * Array of agenda items (modular: minimum 2, maximum 6 items)
   * - If less than 2 items provided, will be padded with placeholder items
   * - If more than 6 items provided, will be truncated to 6 items
   * - Default: 6 items
   */
  agenda?: Array<{
    title: string;
    duration: string;
    description: string;
  }>;
  
  /**
   * Image URL for the right side
   */
  imageUrl?: string;
  
  /**
   * Alt text for the image
   */
  imageAlt?: string;
  
  /**
   * Layout configuration
   */
  layout?: {
    showTitle?: boolean;
    showAgenda?: boolean;
    showImage?: boolean;
    showDescription?: boolean;
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
   * Title font size
   */
  titleFontSize?: number;
  
  /**
   * Title font family
   */
  titleFontFamily?: string;
  
  /**
   * Title alignment
   */
  titleAlignment?: 'left' | 'center' | 'right';
  
  /**
   * Agenda item styles
   */
  agendaItemStyles?: Record<string, {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right';
  }>;
  
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
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  // Transform overrides for dragged elements
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  
  // Font styling overrides (saved values)
  savedTitleFontSize?: number;
  savedTitleFontFamily?: string;
  savedTitleAlignment?: 'left' | 'center' | 'right';
  savedDescriptionFontSize?: number;
  savedDescriptionFontFamily?: string;
  savedDescriptionAlignment?: 'left' | 'center' | 'right';
}

/**
 * Index Left Agenda Right Image Layout
 * 
 * A two-column layout for meeting agendas and index pages.
 * Left side shows agenda items, right side shows an image.
 */
export default function Index_LeftAgendaRightText({
  title = 'Meeting Agenda',
  description = '',
  agenda = [
    { title: 'Market Analysis', duration: '15 min', description: 'Current market trends and opportunities' },
    { title: 'Product Updates', duration: '20 min', description: 'Latest feature releases and roadmap' },
    { title: 'Financial Review', duration: '25 min', description: 'Q4 performance and budget planning' },
    { title: 'Strategic Planning', duration: '30 min', description: '2025 goals and initiatives' },
    { title: 'Customer Insights', duration: '20 min', description: 'Voice of customer feedback and analysis' },
    { title: 'Next Steps', duration: '10 min', description: 'Action items and follow-up tasks' },
    { title: 'Team Updates', duration: '15 min', description: 'Department progress and milestones' },
    { title: 'Budget Review', duration: '20 min', description: 'Quarterly budget analysis and planning' },
    { title: 'Risk Assessment', duration: '15 min', description: 'Current risks and mitigation strategies' },
    { title: 'Innovation Lab', duration: '25 min', description: 'New technology and innovation updates' },
    { title: 'Partnership Review', duration: '20 min', description: 'Strategic partnerships and alliances' },
    { title: 'Compliance Update', duration: '15 min', description: 'Regulatory changes and compliance status' },
    { title: 'Market Expansion', duration: '30 min', description: 'New market opportunities and strategies' },
    { title: 'Technology Stack', duration: '20 min', description: 'Technical infrastructure and updates' },
    { title: 'Customer Success', duration: '15 min', description: 'Customer satisfaction and retention metrics' },
    { title: 'Competitive Analysis', duration: '25 min', description: 'Market positioning and competitor insights' },
    { title: 'Resource Planning', duration: '20 min', description: 'Human resources and capacity planning' },
    { title: 'Action Items', duration: '10 min', description: 'Summary and next steps assignment' }
  ],
  imageUrl = '/Default-Image-1.png',
  imageAlt = 'Meeting agenda visualization',
  layout = {
    showTitle: true,
    showAgenda: true,
    showImage: true,
    showDescription: false
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  titleFontSize = 36,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  agendaItemStyles = {},
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: IndexLeftAgendaRightTextProps) {

  // Use Figma selection hook for the image (not used in this layout but kept for consistency)
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Text selection and editing state with saved transforms and onUpdate
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate to enable automatic drag position saving
  });

  // Current text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentAgenda, setCurrentAgenda] = useState(agenda); // Use all agenda items

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentAgenda(agenda);
  }, [JSON.stringify(agenda)]);
  

  // Individual selection states for agenda items
  const [selectedAgendaItem, setSelectedAgendaItem] = useState<string | null>(null);
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null);

  // Individual transform states for agenda items
  const [agendaItemTransforms, setAgendaItemTransforms] = useState<Record<string, {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    scale: number;
    width?: number;
    height?: number;
  }>>({});

  // Current text styling state with saved overrides
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [titleFontSizeState, setTitleFontSize] = useState(savedTitleFontSize || titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(savedTitleFontFamily || titleFontFamily);
  const [titleAlignmentState, setTitleAlignment] = useState(savedTitleAlignment || titleAlignment);
  
  // Description styling state with saved overrides
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(savedDescriptionFontSize || 10);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(savedDescriptionFontFamily || 'font-helvetica-neue');
  const [descriptionAlignmentState, setDescriptionAlignment] = useState(savedDescriptionAlignment || 'left');

  // Agenda item styling states
  const [agendaItemStylesState, setAgendaItemStyles] = useState<Record<string, {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right';
  }>>(agendaItemStyles || {});


  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    targetElement: null as 'title' | 'description' | `agenda-${number}-title` | `agenda-${number}-description` | null,
    lastTargetElement: null as 'title' | 'description' | `agenda-${number}-title` | `agenda-${number}-description` | null,
    currentFontSize: 48,
    currentFontFamily: 'Helvetica Neue'
  });

  // Sync props with state when they change
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setTitleAlignment(titleAlignment);
  }, [titleAlignment]);

  useEffect(() => {
    setAgendaItemStyles(agendaItemStyles || {});
  }, [JSON.stringify(agendaItemStyles)]);

  // Ref to track previous dragging states for popup following
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false
  });

  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleAgendaItemChange = (index: number, field: 'title' | 'description', newText: string) => {
    setCurrentAgenda(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: newText } : item
    ));
    if (onUpdate) {
      // Update the agenda array structure properly
      const updatedAgenda = currentAgenda.map((item, i) => 
        i === index ? { ...item, [field]: newText } : item
      );
      onUpdate({ agenda: updatedAgenda });
    }
  };

  // Text style change handlers
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

  // Description style change handlers
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

  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setDescriptionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ descriptionAlignment: alignment });
    }
  };

  const handleDescriptionChangeColor = (color: string) => {
    if (onUpdate) {
      onUpdate({ descriptionColor: color });
    }
  };

  // Color change handlers
  const handleTitleChangeColor = (color: string) => {
    setCurrentTitleColor(color);
    if (onUpdate) {
      onUpdate({ titleColor: color });
    }
  };

  // Alignment change handlers
  const handleTitleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentTitleAlignment(alignment);
    setTitleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ titleAlignment: alignment });
    }
  };

  // Agenda item styling handlers
  const handleAgendaItemChangeSize = (itemId: string, fontSize: number) => {
    setAgendaItemStyles(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        fontSize
      }
    }));
    if (onUpdate) {
      onUpdate({ agendaItemStyles: { ...agendaItemStylesState, [itemId]: { ...agendaItemStylesState[itemId], fontSize } } });
    }
  };

  const handleAgendaItemChangeFont = (itemId: string, fontFamily: string) => {
    setAgendaItemStyles(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        fontFamily
      }
    }));
    if (onUpdate) {
      onUpdate({ agendaItemStyles: { ...agendaItemStylesState, [itemId]: { ...agendaItemStylesState[itemId], fontFamily } } });
    }
  };

  const handleAgendaItemChangeColor = (itemId: string, color: string) => {
    setAgendaItemStyles(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        color
      }
    }));
    if (onUpdate) {
      onUpdate({ agendaItemStyles: { ...agendaItemStylesState, [itemId]: { ...agendaItemStylesState[itemId], color } } });
    }
  };

  const handleAgendaItemChangeAlignment = (itemId: string, alignment: 'left' | 'center' | 'right') => {
    setAgendaItemStyles(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        alignment
      }
    }));
    if (onUpdate) {
      onUpdate({ agendaItemStyles: { ...agendaItemStylesState, [itemId]: { ...agendaItemStylesState[itemId], alignment } } });
    }
  };

  // Get agenda item style with defaults
  const getAgendaItemStyle = (itemId: string, isTitle: boolean) => {
    const defaults = isTitle 
      ? { fontSize: 14, fontFamily: 'font-helvetica-neue', color: 'text-gray-900', alignment: 'left' as const }
      : { fontSize: 12, fontFamily: 'font-helvetica-neue', color: 'text-gray-600', alignment: 'left' as const };
    
    return { ...defaults, ...agendaItemStylesState[itemId] };
  };

  // Get agenda item transform with defaults
  const getAgendaItemTransform = (itemId: string) => {
    const defaults = {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      scale: 1
    };
    
    return { ...defaults, ...agendaItemTransforms[itemId] };
  };

  // Update agenda item transform
  const updateAgendaItemTransform = (itemId: string, newTransform: Partial<{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    scale: number;
    width?: number;
    height?: number;
  }>) => {
    setAgendaItemTransforms(prev => ({
      ...prev,
      [itemId]: {
        ...getAgendaItemTransform(itemId),
        ...newTransform
      }
    }));
  };

  // Text delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
  };

  // Size change handlers (crucial for width resizing)
  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleAgendaItemSizeChange = (itemId: string, newTransform: any) => {
    updateAgendaItemTransform(itemId, newTransform);
  };

  // Agenda item selection handler
  const handleAgendaItemClick = (itemId: string) => {
    setSelectedAgendaItem(itemId);
  };

  // Custom drag handlers for agenda items
  const handleAgendaItemDragStart = (itemId: string, e: React.MouseEvent, element: HTMLElement) => {
    if (selectedAgendaItem !== itemId) return;
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target.dataset.resizeHandle) {
      return; // Don't start drag if clicking on a handle
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = getAgendaItemTransform(itemId);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      updateAgendaItemTransform(itemId, {
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Custom resize handlers for agenda items
  const handleAgendaItemResizeStart = (itemId: string, e: React.MouseEvent, handle: string, element: HTMLElement) => {
    if (selectedAgendaItem !== itemId) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = getAgendaItemTransform(itemId);
    const rect = element.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newTransform = { ...startTransform };
      
      // Handle text resizing - mainly width for text wrapping
      switch (handle) {
        case 'e': // Right handle - adjust width
        case 'w': // Left handle - adjust width
          const newWidth = Math.max(100, (startTransform.width || rect.width) + (handle === 'e' ? deltaX : -deltaX));
          newTransform.width = newWidth;
          break;
        case 's': // Bottom handle - adjust height (for fixed-height text boxes)
        case 'n': // Top handle - adjust height
          const newHeight = Math.max(50, (startTransform.height || rect.height) + (handle === 's' ? deltaY : -deltaY));
          newTransform.height = newHeight;
          break;
        case 'se': // Southeast corner - adjust both
        case 'sw': // Southwest corner
        case 'ne': // Northeast corner
        case 'nw': // Northwest corner
          const newWidthCorner = Math.max(100, (startTransform.width || rect.width) + (handle.includes('e') ? deltaX : -deltaX));
          const newHeightCorner = Math.max(50, (startTransform.height || rect.height) + (handle.includes('s') ? deltaY : -deltaY));
          newTransform.width = newWidthCorner;
          newTransform.height = newHeightCorner;
          break;
      }
      
      updateAgendaItemTransform(itemId, newTransform);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    console.log('🌍 Global click outside handler called', e.target);
    
    // Don't intercept clicks on FigmaText or FigmaImage components or text popup
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.agenda-item-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      console.log('🎯 Click on Figma element - allowing event to bubble');
      return; // Let the event bubble to the FigmaText/FigmaImage components
    }
    
    console.log('🌍 Click outside - deselecting all elements');
    
    // Immediately deselect all elements for instant feedback
    figmaHandlers.handleClickOutside();
    textSelectionHandlers.handleClickOutside();
    setSelectedAgendaItem(null); // Deselect agenda items instantly
    
    // Close text popup immediately
    setTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
  };

  // Update popup position when text is dragged (crucial for popup following)
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      let transform;
      let isDragging;
      let wasDragging;
      
      if (activeTarget === 'title') {
        transform = textSelectionState.titleTransform;
        isDragging = textSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isTitleDragging;
      } else if (activeTarget && activeTarget.startsWith('agenda-') && selectedAgendaItem === activeTarget) {
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
  }, [textSelectionState.titleTransform, textSelectionState.descriptionTransform, textSelectionState.isTitleDragging, textSelectionState.isDescriptionDragging, textPopupState.isOpen, textPopupState.targetElement, textPopupState.lastTargetElement, selectedAgendaItem]);

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    // CRITICAL: Fixed canvas size - never changes regardless of content
    overflow: 'visible',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
  } : {
    // For responsive mode, still apply containment to prevent layout influence
    overflow: 'visible',
    contain: 'layout style',
    width: '100%',
    height: '100%',
    minHeight: '400px'
  };

  // Base classes for index layout
  const containerClasses = useFixedDimensions 
    ? `index-left-agenda-right-image px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `index-left-agenda-right-image px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `index-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  // Ensure agenda items are between 2-18 items (modular constraint for 3 columns)
  const displayAgenda = React.useMemo(() => {
    if (!agenda || agenda.length === 0) return [];
    
    // Minimum 2 items, maximum 18 items (6 per column)
    const minItems = 2;
    const maxItems = 18;
    
    if (agenda.length < minItems) {
      // If less than minimum, pad with placeholder items
      const paddedAgenda = [...agenda];
      while (paddedAgenda.length < minItems) {
        paddedAgenda.push({
          title: `Item ${paddedAgenda.length + 1}`,
          duration: '10 min',
          description: 'Additional agenda item'
        });
      }
      return paddedAgenda;
    } else if (agenda.length > maxItems) {
      // If more than maximum, truncate to max items
      return agenda.slice(0, maxItems);
    }
    
    return agenda;
  }, [agenda]);

  const content = (
    <section 
      className={useFixedDimensions ? `index-left-agenda-right-image bg-white ${className}` : `index-left-agenda-right-image bg-white w-full h-full min-h-[400px] ${className}`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Title - Spans across all columns */}
          {layout.showTitle && (
            <div className="title-layer absolute pointer-events-auto" style={{
          top: '8%',
              left: '48px',
          right: '48px',
          zIndex: 10
            }}>
               <FigmaText
                 variant="title"
                 color={currentTitleColor}
                 fontFamily={titleFontFamilyState}
                 className={`text-2xl lg:text-3xl xl:text-4xl font-normal leading-none tracking-tighter break-words overflow-wrap-anywhere whitespace-normal ${titleFontFamilyState} ${titleAlignmentState === 'left' ? 'text-left' : titleAlignmentState === 'center' ? 'text-center' : 'text-right'}`}
                 style={{
                   fontSize: `${titleFontSizeState}px`,
                   lineHeight: '0.9',
                   letterSpacing: '-0.08em',
                   wordWrap: 'break-word',
                   overflowWrap: 'break-word',
                   whiteSpace: 'normal',
                   color: currentTitleColor,
                   textAlign: titleAlignmentState as 'left' | 'center' | 'right'
                 }}
                 transform={textSelectionState.titleTransform}
                 isSelected={textSelectionState.isTitleSelected}
                 onClick={textSelectionHandlers.handleTitleClick}
                 onDragStart={textSelectionHandlers.handleTitleDragStart}
                 onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                 onTextChange={handleTitleTextChange}
                 onSizeChange={handleTitleSizeChange}
                 onChangeSize={handleTitleChangeSize}
                 onChangeFont={handleTitleChangeFont}
                 onDeleteText={handleTitleDelete}
                 useFixedWidth={true}
                 initialAdaptWidth={true}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  if (textPopupState.isOpen && (textPopupState.targetElement === 'title' || textPopupState.lastTargetElement === 'title')) {
                    setTextPopupState(prev => ({
                      ...prev,
                      targetElement: 'title',
                      lastTargetElement: 'title',
                      currentFontSize: titleFontSizeState,
                      currentFontFamily: titleFontFamilyState
                    }));
                  } else {
                    const titleElement = document.querySelector('.index-left-agenda-right-image .title-layer');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.index-left-agenda-right-image') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (titleRect.left - canvasRect.left) - 10;
                        const relativeY = (titleRect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: titleFontSizeState,
                          currentFontFamily: titleFontFamilyState,
                          targetElement: 'title',
                          lastTargetElement: 'title'
                        });
                      }
                    }
                  }
                }}>
                {currentTitle}
              </FigmaText>
            </div>
          )}

          {/* Description Section */}
          {layout.showDescription && description && (
            <div className="description-layer absolute pointer-events-auto" style={{
              top: '40px',
              right: '48px',
              width: '300px'
            }}>
              <FigmaText
                variant="caption"
                color="text-gray-600"
                fontFamily="font-helvetica-neue"
                className="text-gray-600 font-helvetica-neue leading-relaxed"
                style={{ 
                  fontSize: `${descriptionFontSizeState}px`,
                  textAlign: descriptionAlignmentState as 'left' | 'center' | 'right'
                }}
                transform={textSelectionState.descriptionTransform}
                isSelected={textSelectionState.isDescriptionSelected}
                onClick={textSelectionHandlers.handleDescriptionClick}
                onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                  textSelectionHandlers.handleDescriptionDragStart(e, element);
                }}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  if (textPopupState.isOpen && (textPopupState.targetElement === 'description' || textPopupState.lastTargetElement === 'description')) {
                    setTextPopupState(prev => ({
                      ...prev,
                      targetElement: 'description',
                      lastTargetElement: 'description',
                      currentFontSize: 10,
                      currentFontFamily: 'font-helvetica-neue'
                    }));
                  } else {
                    const descriptionElement = document.querySelector('.index-left-agenda-right-image .description-layer');
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.index-left-agenda-right-image') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                        const relativeY = (descriptionRect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                      currentFontSize: descriptionFontSizeState,
                      currentFontFamily: descriptionFontFamilyState,
                          targetElement: 'description',
                          lastTargetElement: 'description'
                        });
                      }
                    }
                  }
                }}
              >
                {description}
              </FigmaText>
            </div>
          )}

      <div className="flex h-full">
        {/* First Column - Items 1-6 */}
         <div className="w-1/3 relative pl-12 lg:pl-20 pr-4 lg:pr-6 pt-8 lg:pt-12 pb-6 lg:pb-8 pointer-events-none">

          {/* Agenda Items */}
          {layout.showAgenda && currentAgenda && (
             <div className="absolute pointer-events-auto" style={{
               top: '120px',
               left: '48px',
               right: '24px'
             }}>
            <div className="relative">
              {currentAgenda.slice(0, 6).map((item, index) => (
                 <div key={index} className="agenda-item-layer absolute flex items-start space-x-4 pointer-events-auto" data-agenda-id={`agenda-${index}-title`} style={{
                   top: `${index * 60}px`,
                   left: '0',
                   right: '0'
                 }}>
                  {/* Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 relative">
                    {/* Title - Absolutely positioned */}
                    <div className="absolute" style={{ top: '0px', left: '0', right: '0', transform: selectedAgendaItem === `agenda-${index}-title` ? 'none' : undefined }}>
                      <FigmaText
                      variant="heading"
                      color={getAgendaItemStyle(`agenda-${index}-title`, true).color}
                      fontFamily={getAgendaItemStyle(`agenda-${index}-title`, true).fontFamily}
                      className={`text-sm font-medium leading-tight break-words overflow-wrap-anywhere whitespace-normal ${getAgendaItemStyle(`agenda-${index}-title`, true).fontFamily}`}
                      style={{
                        fontSize: `${getAgendaItemStyle(`agenda-${index}-title`, true).fontSize}px`,
                        lineHeight: '1.25',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: getAgendaItemStyle(`agenda-${index}-title`, true).alignment
                      }}
                      transform={selectedAgendaItem === `agenda-${index}-title` ? getAgendaItemTransform(`agenda-${index}-title`) : undefined}
                      isSelected={selectedAgendaItem === `agenda-${index}-title`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgendaItem(`agenda-${index}-title`);
                        textSelectionHandlers.handleDescriptionClick(e);
                      }}
                      onDragStart={(e, element) => {
                        handleAgendaItemDragStart(`agenda-${index}-title`, e, element);
                      }}
                      onResizeStart={(e, handle, element) => {
                        handleAgendaItemResizeStart(`agenda-${index}-title`, e, handle, element);
                      }}
                      onSizeChange={(newTransform) => handleAgendaItemSizeChange(`agenda-${index}-title`, newTransform)}
                      onTextChange={(newText) => handleAgendaItemChange(index, 'title', newText)}
                      onChangeSize={(fontSize) => handleAgendaItemChangeSize(`agenda-${index}-title`, fontSize)}
                      onChangeFont={(fontFamily) => handleAgendaItemChangeFont(`agenda-${index}-title`, fontFamily)}
                      useFixedWidth={true}
                      initialAdaptWidth={true}
                      onShowPopup={(position: { x: number; y: number }) => {
                        const agendaElement = document.querySelector(`.agenda-item-layer:nth-child(${index + 1})`);
                        if (agendaElement) {
                          const agendaRect = agendaElement.getBoundingClientRect();
                          const canvasContainer = agendaElement.closest('.index-left-agenda-right-image') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (agendaRect.left - canvasRect.left) - 10;
                            const relativeY = (agendaRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: 14,
                              currentFontFamily: 'Helvetica Neue',
                              targetElement: `agenda-${index}-title` as any,
                              lastTargetElement: `agenda-${index}-title` as any
                            });
                          }
                        }
                      }}>
                      {item.title}
                      </FigmaText>
                    </div>
                    
                     {/* Description - Absolutely positioned */}
                     <div className="absolute" style={{ top: '20px', left: '0', right: '0' }}>
                      <FigmaText
                      variant="body"
                      color={getAgendaItemStyle(`agenda-${index}-description`, false).color}
                      fontFamily={getAgendaItemStyle(`agenda-${index}-description`, false).fontFamily}
                      className={`text-xs leading-relaxed break-words overflow-wrap-anywhere whitespace-normal ${getAgendaItemStyle(`agenda-${index}-description`, false).fontFamily}`}
                      style={{
                        fontSize: `${getAgendaItemStyle(`agenda-${index}-description`, false).fontSize}px`,
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: getAgendaItemStyle(`agenda-${index}-description`, false).alignment
                      }}
                      transform={selectedAgendaItem === `agenda-${index}-description` ? getAgendaItemTransform(`agenda-${index}-description`) : undefined}
                      isSelected={selectedAgendaItem === `agenda-${index}-description`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgendaItem(`agenda-${index}-description`);
                        textSelectionHandlers.handleDescriptionClick(e);
                      }}
                      onDragStart={(e, element) => {
                        handleAgendaItemDragStart(`agenda-${index}-description`, e, element);
                      }}
                      onResizeStart={(e, handle, element) => {
                        handleAgendaItemResizeStart(`agenda-${index}-description`, e, handle, element);
                      }}
                      onSizeChange={(newTransform) => handleAgendaItemSizeChange(`agenda-${index}-description`, newTransform)}
                      onTextChange={(newText) => handleAgendaItemChange(index, 'description', newText)}
                      onChangeSize={(fontSize) => handleAgendaItemChangeSize(`agenda-${index}-description`, fontSize)}
                      onChangeFont={(fontFamily) => handleAgendaItemChangeFont(`agenda-${index}-description`, fontFamily)}
                      useFixedWidth={true}
                      initialAdaptWidth={true}
                      onShowPopup={(position: { x: number; y: number }) => {
                        const agendaElement = document.querySelector(`[data-agenda-id="agenda-${index}-title"]`);
                        if (agendaElement) {
                          const agendaRect = agendaElement.getBoundingClientRect();
                          const canvasContainer = agendaElement.closest('.index-left-agenda-right-image') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (agendaRect.left - canvasRect.left) - 10;
                            const relativeY = (agendaRect.top - canvasRect.top) - 30;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: 12,
                              currentFontFamily: 'Helvetica Neue',
                              targetElement: `agenda-${index}-description` as any,
                              lastTargetElement: `agenda-${index}-description` as any
                            });
                          }
                        }
                      }}>
                      {item.description}
                      </FigmaText>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        {/* Second Column - Items 7-12 */}
        <div className="w-1/3 relative px-4 lg:px-6 pt-8 lg:pt-12 pb-6 lg:pb-8 pointer-events-none">
          {/* Agenda Items - Second Column */}
          {layout.showAgenda && currentAgenda && (
             <div className="absolute pointer-events-auto" style={{
               top: '120px',
               left: '16px',
               right: '16px'
             }}>
            <div className="relative">
              {currentAgenda.slice(6, 12).map((item, index) => (
                 <div key={index + 6} className="agenda-item-layer absolute flex items-start space-x-4 pointer-events-auto" data-agenda-id={`agenda-${index + 6}-title`} style={{
                   top: `${index * 60}px`,
                   left: '0',
                   right: '0'
                 }}>
                  {/* Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">
                      {String(index + 7).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 relative">
                    {/* Title - Absolutely positioned */}
                    <div className="absolute" style={{ top: '0px', left: '0', right: '0', transform: selectedAgendaItem === `agenda-${index + 6}-title` ? 'none' : undefined }}>
                    <FigmaText
                      variant="heading"
                      color={getAgendaItemStyle(`agenda-${index + 6}-title`, true).color}
                      fontFamily={getAgendaItemStyle(`agenda-${index + 6}-title`, true).fontFamily}
                      className={`text-sm font-medium leading-tight break-words overflow-wrap-anywhere whitespace-normal ${getAgendaItemStyle(`agenda-${index + 6}-title`, true).fontFamily}`}
                      style={{
                        fontSize: `${getAgendaItemStyle(`agenda-${index + 6}-title`, true).fontSize}px`,
                        lineHeight: '1.25',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: getAgendaItemStyle(`agenda-${index + 6}-title`, true).alignment
                      }}
                      transform={selectedAgendaItem === `agenda-${index + 6}-title` ? getAgendaItemTransform(`agenda-${index + 6}-title`) : undefined}
                      isSelected={selectedAgendaItem === `agenda-${index + 6}-title`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgendaItem(`agenda-${index + 6}-title`);
                        textSelectionHandlers.handleDescriptionClick(e);
                      }}
                      onDragStart={(e, element) => {
                        handleAgendaItemDragStart(`agenda-${index + 6}-title`, e, element);
                      }}
                      onResizeStart={(e, handle, element) => {
                        handleAgendaItemResizeStart(`agenda-${index + 6}-title`, e, handle, element);
                      }}
                      onSizeChange={(newTransform) => handleAgendaItemSizeChange(`agenda-${index + 6}-title`, newTransform)}
                      onTextChange={(newText) => handleAgendaItemChange(index + 6, 'title', newText)}
                      onChangeSize={(fontSize) => handleAgendaItemChangeSize(`agenda-${index + 6}-title`, fontSize)}
                      onChangeFont={(fontFamily) => handleAgendaItemChangeFont(`agenda-${index + 6}-title`, fontFamily)}
                      useFixedWidth={true}
                      initialAdaptWidth={true}
                      onShowPopup={(position: { x: number; y: number }) => {
                        const agendaElement = document.querySelector(`[data-agenda-id="agenda-${index + 6}-title"]`);
                          if (agendaElement) {
                            const agendaRect = agendaElement.getBoundingClientRect();
                            const canvasContainer = agendaElement.closest('.index-left-agenda-right-image') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (agendaRect.left - canvasRect.left) - 10;
                              const relativeY = (agendaRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: 14,
                              currentFontFamily: 'Helvetica Neue',
                              targetElement: `agenda-${index + 6}-title` as any,
                              lastTargetElement: `agenda-${index + 6}-title` as any
                            });
                          }
                        }
                      }}>
                      {item.title}
                      </FigmaText>
                    </div>
                    
                     {/* Description - Absolutely positioned */}
                     <div className="absolute" style={{ top: '20px', left: '0', right: '0' }}>
                      <FigmaText
                      variant="body"
                      color={getAgendaItemStyle(`agenda-${index + 6}-description`, false).color}
                      fontFamily={getAgendaItemStyle(`agenda-${index + 6}-description`, false).fontFamily}
                      className={`text-xs leading-relaxed break-words overflow-wrap-anywhere whitespace-normal ${getAgendaItemStyle(`agenda-${index + 6}-description`, false).fontFamily}`}
                      style={{
                        fontSize: `${getAgendaItemStyle(`agenda-${index + 6}-description`, false).fontSize}px`,
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: getAgendaItemStyle(`agenda-${index + 6}-description`, false).alignment
                      }}
                      transform={selectedAgendaItem === `agenda-${index + 6}-description` ? getAgendaItemTransform(`agenda-${index + 6}-description`) : undefined}
                      isSelected={selectedAgendaItem === `agenda-${index + 6}-description`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgendaItem(`agenda-${index + 6}-description`);
                        textSelectionHandlers.handleDescriptionClick(e);
                      }}
                      onDragStart={(e, element) => {
                        handleAgendaItemDragStart(`agenda-${index + 6}-description`, e, element);
                      }}
                      onResizeStart={(e, handle, element) => {
                        handleAgendaItemResizeStart(`agenda-${index + 6}-description`, e, handle, element);
                      }}
                      onSizeChange={(newTransform) => handleAgendaItemSizeChange(`agenda-${index + 6}-description`, newTransform)}
                      onTextChange={(newText) => handleAgendaItemChange(index + 6, 'description', newText)}
                      onChangeSize={(fontSize) => handleAgendaItemChangeSize(`agenda-${index + 6}-description`, fontSize)}
                      onChangeFont={(fontFamily) => handleAgendaItemChangeFont(`agenda-${index + 6}-description`, fontFamily)}
                      useFixedWidth={true}
                      initialAdaptWidth={true}
                      onShowPopup={(position: { x: number; y: number }) => {
                        const agendaElement = document.querySelector(`[data-agenda-id="agenda-${index + 6}-title"]`);
                        if (agendaElement) {
                          const agendaRect = agendaElement.getBoundingClientRect();
                          const canvasContainer = agendaElement.closest('.index-left-agenda-right-image') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (agendaRect.left - canvasRect.left) - 10;
                            const relativeY = (agendaRect.top - canvasRect.top) - 30;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: 12,
                              currentFontFamily: 'Helvetica Neue',
                              targetElement: `agenda-${index + 6}-description` as any,
                              lastTargetElement: `agenda-${index + 6}-description` as any
                            });
                          }
                        }
                      }}>
                      {item.description}
                    </FigmaText>
                  </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        {/* Third Column - Items 13-18 */}
        <div className="w-1/3 relative pl-4 lg:pl-6 pr-6 lg:pr-12 pt-8 lg:pt-12 pb-6 lg:pb-8 pointer-events-none">
          {/* Agenda Items - Third Column */}
          {layout.showAgenda && currentAgenda && (
             <div className="absolute pointer-events-auto" style={{
               top: '120px',
               left: '16px',
               right: '24px'
             }}>
            <div className="relative">
              {currentAgenda.slice(12, 18).map((item, index) => (
                 <div key={index + 12} className="agenda-item-layer absolute flex items-start space-x-4 pointer-events-auto" data-agenda-id={`agenda-${index + 12}-title`} style={{
                   top: `${index * 60}px`,
                   left: '0',
                   right: '0'
                 }}>
                  {/* Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">
                      {String(index + 13).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 relative">
                    {/* Title - Absolutely positioned */}
                    <div className="absolute" style={{ top: '0px', left: '0', right: '0', transform: selectedAgendaItem === `agenda-${index + 12}-title` ? 'none' : undefined }}>
                    <FigmaText
                      variant="heading"
                      color={getAgendaItemStyle(`agenda-${index + 12}-title`, true).color}
                      fontFamily={getAgendaItemStyle(`agenda-${index + 12}-title`, true).fontFamily}
                      className={`text-sm font-medium leading-tight break-words overflow-wrap-anywhere whitespace-normal ${getAgendaItemStyle(`agenda-${index + 12}-title`, true).fontFamily}`}
                      style={{
                        fontSize: `${getAgendaItemStyle(`agenda-${index + 12}-title`, true).fontSize}px`,
                        lineHeight: '1.25',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: getAgendaItemStyle(`agenda-${index + 12}-title`, true).alignment
                      }}
                      transform={selectedAgendaItem === `agenda-${index + 12}-title` ? getAgendaItemTransform(`agenda-${index + 12}-title`) : undefined}
                      isSelected={selectedAgendaItem === `agenda-${index + 12}-title`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgendaItem(`agenda-${index + 12}-title`);
                        textSelectionHandlers.handleDescriptionClick(e);
                      }}
                      onDragStart={(e, element) => {
                        handleAgendaItemDragStart(`agenda-${index + 12}-title`, e, element);
                      }}
                      onResizeStart={(e, handle, element) => {
                        handleAgendaItemResizeStart(`agenda-${index + 12}-title`, e, handle, element);
                      }}
                      onSizeChange={(newTransform) => handleAgendaItemSizeChange(`agenda-${index + 12}-title`, newTransform)}
                      onTextChange={(newText) => handleAgendaItemChange(index + 12, 'title', newText)}
                      onChangeSize={(fontSize) => handleAgendaItemChangeSize(`agenda-${index + 12}-title`, fontSize)}
                      onChangeFont={(fontFamily) => handleAgendaItemChangeFont(`agenda-${index + 12}-title`, fontFamily)}
                      useFixedWidth={true}
                      initialAdaptWidth={true}
                      onShowPopup={(position: { x: number; y: number }) => {
                        const agendaElement = document.querySelector(`[data-agenda-id="agenda-${index + 12}-title"]`);
                          if (agendaElement) {
                            const agendaRect = agendaElement.getBoundingClientRect();
                            const canvasContainer = agendaElement.closest('.index-left-agenda-right-image') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (agendaRect.left - canvasRect.left) - 10;
                              const relativeY = (agendaRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: 14,
                              currentFontFamily: 'Helvetica Neue',
                              targetElement: `agenda-${index + 12}-title` as any,
                              lastTargetElement: `agenda-${index + 12}-title` as any
                            });
                          }
                        }
                      }}>
                      {item.title}
                    </FigmaText>
                    </div>
                    
                     {/* Description - Absolutely positioned */}
                     <div className="absolute" style={{ top: '20px', left: '0', right: '0' }}>
                    <FigmaText
                      variant="body"
                      color={getAgendaItemStyle(`agenda-${index + 12}-description`, false).color}
                      fontFamily={getAgendaItemStyle(`agenda-${index + 12}-description`, false).fontFamily}
                      className={`text-xs leading-relaxed break-words overflow-wrap-anywhere whitespace-normal ${getAgendaItemStyle(`agenda-${index + 12}-description`, false).fontFamily}`}
                      style={{
                        fontSize: `${getAgendaItemStyle(`agenda-${index + 12}-description`, false).fontSize}px`,
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: getAgendaItemStyle(`agenda-${index + 12}-description`, false).alignment
                      }}
                      transform={selectedAgendaItem === `agenda-${index + 12}-description` ? getAgendaItemTransform(`agenda-${index + 12}-description`) : undefined}
                      isSelected={selectedAgendaItem === `agenda-${index + 12}-description`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgendaItem(`agenda-${index + 12}-description`);
                        textSelectionHandlers.handleDescriptionClick(e);
                      }}
                      onDragStart={(e, element) => {
                        handleAgendaItemDragStart(`agenda-${index + 12}-description`, e, element);
                      }}
                      onResizeStart={(e, handle, element) => {
                        handleAgendaItemResizeStart(`agenda-${index + 12}-description`, e, handle, element);
                      }}
                      onSizeChange={(newTransform) => handleAgendaItemSizeChange(`agenda-${index + 12}-description`, newTransform)}
                      onTextChange={(newText) => handleAgendaItemChange(index + 12, 'description', newText)}
                      onChangeSize={(fontSize) => handleAgendaItemChangeSize(`agenda-${index + 12}-description`, fontSize)}
                      onChangeFont={(fontFamily) => handleAgendaItemChangeFont(`agenda-${index + 12}-description`, fontFamily)}
                      useFixedWidth={true}
                      initialAdaptWidth={true}
                      onShowPopup={(position: { x: number; y: number }) => {
                        const agendaElement = document.querySelector(`[data-agenda-id="agenda-${index + 12}-title"]`);
                          if (agendaElement) {
                            const agendaRect = agendaElement.getBoundingClientRect();
                            const canvasContainer = agendaElement.closest('.index-left-agenda-right-image') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (agendaRect.left - canvasRect.left) - 10;
                            const relativeY = (agendaRect.top - canvasRect.top) - 30;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: 12,
                              currentFontFamily: 'Helvetica Neue',
                              targetElement: `agenda-${index + 12}-description` as any,
                              lastTargetElement: `agenda-${index + 12}-description` as any
                            });
                          }
                        }
                      }}>
                    {item.description}
                    </FigmaText>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );

  // Always wrap with CanvasOverlay to prevent layout positioning issues
  return (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      <TextPopup
        isOpen={textPopupState.isOpen}
        position={textPopupState.position}
        onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
        onChangeSize={(size) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeSize(size);
          } else if (target === 'description') {
            handleDescriptionChangeSize(size);
          } else if (target && target.startsWith('agenda-')) {
            handleAgendaItemChangeSize(target, size);
          }
        }}
        onChangeFont={(family) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeFont(family);
          } else if (target === 'description') {
            handleDescriptionChangeFont(family);
          } else if (target && target.startsWith('agenda-')) {
            handleAgendaItemChangeFont(target, family);
          }
        }}
        onChangeColor={(color) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeColor(color);
          } else if (target === 'description') {
            handleDescriptionChangeColor(color);
          } else if (target && target.startsWith('agenda-')) {
            handleAgendaItemChangeColor(target, color);
          }
        }}
        onChangeAlignment={(alignment) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeAlignment(alignment);
          } else if (target === 'description') {
            handleDescriptionChangeAlignment(alignment);
          } else if (target && target.startsWith('agenda-')) {
            handleAgendaItemChangeAlignment(target, alignment);
          }
        }}
        onDeleteText={() => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleDelete();
          }
          // Note: Agenda items and description cannot be deleted individually
          setTextPopupState(prev => ({ ...prev, isOpen: false }));
        }}
        currentFontSize={
          (() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return titleFontSizeState;
            if (target === 'description') return 10;
            if (target && target.startsWith('agenda-')) {
              const isTitle = target.includes('-title');
              return getAgendaItemStyle(target, isTitle).fontSize;
            }
            return textPopupState.currentFontSize;
          })()
        }
        currentFontFamily={
          (() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return titleFontFamilyState;
            if (target === 'description') return descriptionFontFamilyState;
            if (target && target.startsWith('agenda-')) {
              const isTitle = target.includes('-title');
              return getAgendaItemStyle(target, isTitle).fontFamily;
            }
            return textPopupState.currentFontFamily;
          })()
        }
        currentColor={
          (() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleColor;
            if (target === 'description') return 'text-gray-600';
            if (target && target.startsWith('agenda-')) {
              const isTitle = target.includes('-title');
              return getAgendaItemStyle(target, isTitle).color;
            }
            return currentTitleColor;
          })()
        }
        currentAlignment={
          (() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return titleAlignmentState as 'left' | 'center' | 'right';
            if (target === 'description') return descriptionAlignmentState as 'left' | 'center' | 'right';
            if (target && target.startsWith('agenda-')) {
              const isTitle = target.includes('-title');
              return getAgendaItemStyle(target, isTitle).alignment;
            }
            return titleAlignmentState as 'left' | 'center' | 'right';
          })()
        }
      />
    </CanvasOverlayProvider>
  );
}
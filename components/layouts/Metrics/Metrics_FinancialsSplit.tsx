import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import ChartBlock from '../../blocks/ChartBlock';
import IconBlock from '../../blocks/IconBlock';
import type { ChartBlockProps } from '../../blocks/ChartBlock';

export interface MetricsFinancialsSplitProps {
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
   * Chart configuration passed to ChartBlock component
   */
  chart?: ChartBlockProps;
  
  /**
   * Layout configuration for component positioning
   */
  layout?: {
    /**
     * Chart position: 'left' or 'right'
     */
    chartPosition?: 'left' | 'right';
    /**
     * Content position: 'left' or 'right' (opposite of chart)
     */
    contentPosition?: 'left' | 'right';
    /**
     * Column proportions [content, chart] - must add up to 12
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

  /**
   * Bullet point title transforms for positioning
   */
  bulletPointTitleTransforms?: { x: number; y: number }[];

  /**
   * Bullet point description transforms for positioning
   */
  bulletPointDescriptionTransforms?: { x: number; y: number }[];
}

/**
 * Metrics Financials Split Layout
 * 
 * A 2-column layout for displaying financial metrics with text on the left 
 * and a chart on the right. Based on Cover_ImageLeftTextRight structure
 * but adapted for metrics visualization.
 */
const Metrics_FinancialsSplit = React.memo(function Metrics_FinancialsSplit({
  title = '',
  description = '',
  bulletPoints,
  notes = [],
  chart = {
    type: 'bar' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { id: 'Revenue', data: [6.5, 11.2, 9.8, 15.1, 18.2, 24.5], color: '#4A3AFF' },
      { id: 'GMV', data: [5.8, 10.5, 9.2, 13.8, 17.1, 21.8], color: '#C893FD' }
    ],
    showLegend: true,
    showGrid: true,
    animate: true,
    stacked: true,
    legendPosition: 'bottom',
    legendSize: 'small'
  },
  layout = {
    chartPosition: 'right',
    contentPosition: 'left',
    columnSizes: [4, 8],
    showTitle: true,
    showDescription: true,
    showBulletPoints: true
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
  descriptionAlignment = 'left',
  bulletPointStyles = {},
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  bulletPointTitleTransforms: savedBulletPointTitleTransforms,
  bulletPointDescriptionTransforms: savedBulletPointDescriptionTransforms
}: MetricsFinancialsSplitProps) {

  // Generate adaptive bullet points based on chart data and language
  const getAdaptiveBulletPoints = () => {
    // Detect language from title and description
    const isSpanish = /[áéíóúñü]|análisis|financiero|ingresos|ventas|servicios|crecimiento|rendimiento|datos|información|desglose/i.test((title || '') + ' ' + (description || ''));

    if (isSpanish) {
      return [
        {
          icon: 'TrendingUp',
          title: 'Crecimiento de Ingresos',
          description: 'Los ingresos superaron las proyecciones impulsados por nuevos lanzamientos'
        },
        {
          icon: 'Users',
          title: 'Adquisición de Clientes',
          description: 'El costo de adquisición disminuyó mientras la retención mejoró significativamente'
        },
        {
          icon: 'DollarSign',
          title: 'Valor del Pedido',
          description: 'El valor promedio del pedido aumentó en todos los segmentos de clientes'
        },
        {
          icon: 'Globe',
          title: 'Rendimiento Regional',
          description: 'Fuerte rendimiento en todas las regiones con trayectoria de crecimiento consistente'
        }
      ];
    } else {
      return [
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
        },
        {
          icon: 'Globe',
          title: 'Regional Performance',
          description: 'Strong performance across all regions with consistent growth trajectory'
        }
      ];
    }
  };

  // Use provided bullet points or generate adaptive ones
  const adaptiveBulletPoints = bulletPoints || getAdaptiveBulletPoints();

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
  
  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);
  
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(notesColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);

  const [bulletPointStylesState, setBulletPointStyles] = useState(bulletPointStyles || {});

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
    setCurrentDescriptionColor(notesColor);
  }, [notesColor]);

  useEffect(() => {
    setCurrentDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  useEffect(() => {
    setBulletPointStyles(bulletPointStyles || {});
  }, [JSON.stringify(bulletPointStyles)]);
  
  // Generate adaptive bullet points based on chart data and language
  const generateAdaptiveBulletPoints = () => {
    if (!chart || !chart.series || chart.series.length === 0) {
      return [];
    }

    // Detect language from title and description
    const isSpanish = /[áéíóúñü]|análisis|financiero|ingresos|ventas|servicios|crecimiento|rendimiento|datos|información/i.test((title || '') + ' ' + (description || ''));

    // Generate bullet points based on chart data
    const adaptiveBulletPoints: Array<{icon: string; title: string; description: string}> = [];

    if (chart.type === 'pie') {
      // For pie charts, create bullet points for each segment
      chart.series.forEach((segment, index) => {
        if (index < 4) { // Limit to 4 bullet points
          const icons = ['TrendingUp', 'Users', 'DollarSign', 'Globe'];
          adaptiveBulletPoints.push({
            icon: icons[index] || 'TrendingUp',
            title: segment.id || (isSpanish ? 'Segmento' : 'Segment'),
            description: isSpanish 
              ? `Representa el ${segment.data?.[0] || 0}% del total`
              : `Represents ${segment.data?.[0] || 0}% of total`
          });
        }
      });
    }

    return adaptiveBulletPoints;
  };

  // Debug logging
  console.log('🔍 Metrics_FinancialsSplit Debug:', {
    bulletPointsProp: bulletPoints,
    adaptiveBulletPoints,
    bulletPointsLength: bulletPoints?.length || 0,
    showBulletPoints: layout.showBulletPoints,
    hasValidBulletPoints: adaptiveBulletPoints && adaptiveBulletPoints.length > 0,
    chart: chart,
    hasChart: !!chart
  });
  
  // Bullet points state
  const [currentBulletPoints, setCurrentBulletPoints] = useState(adaptiveBulletPoints);
  
  // Text selection handlers with initial transforms and onUpdate
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  
  // Bullet point update handlers
  const createBulletPointTitleUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      const newTransforms = [...(savedBulletPointTitleTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ bulletPointTitleTransforms: newTransforms });
    }
  };

  const createBulletPointDescriptionUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      const newTransforms = [...(savedBulletPointDescriptionTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ bulletPointDescriptionTransforms: newTransforms });
    }
  };

  // Bullet point selection handlers - create individual hooks for each bullet point with persistence
  const bulletPointSelectionStates = currentBulletPoints.reduce((acc, _, index) => {
    acc[`bullet-${index}-title`] = useFigmaSelection({
      initialTitleTransform: savedBulletPointTitleTransforms?.[index] || { x: 0, y: 0 },
      onUpdate: createBulletPointTitleUpdateHandler(index)
    });
    acc[`bullet-${index}-description`] = useFigmaSelection({
      initialTitleTransform: savedBulletPointDescriptionTransforms?.[index] || { x: 0, y: 0 },
      onUpdate: createBulletPointDescriptionUpdateHandler(index)
    });
    return acc;
  }, {} as Record<string, [any, any]>);
  
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
      onUpdate({ notesColor: color });
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

  // Bullet point helper functions
  const getBulletPointStyle = (index: number, type: 'title' | 'description', property: string) => {
    const key = `bullet-${index}`;
    const styles = bulletPointStyles[key];
    if (!styles) {
      // Default values
      if (type === 'title') {
        return property === 'fontSize' ? 11 : 
               property === 'color' ? '#1f2937' : 
               property === 'fontFamily' ? 'font-helvetica-neue' : 
               'left';
      } else {
        return property === 'fontSize' ? 10 : 
               property === 'color' ? '#6b7280' : 
               property === 'fontFamily' ? 'font-helvetica-neue' : 
               'left';
      }
    }
    if (type === 'title') {
      return property === 'fontSize' ? styles.titleFontSize : 
             property === 'color' ? styles.titleColor : 
             property === 'fontFamily' ? styles.titleFontFamily : 
             styles.titleAlignment;
    } else {
      return property === 'fontSize' ? styles.descriptionFontSize : 
             property === 'color' ? styles.descriptionColor : 
             property === 'fontFamily' ? styles.descriptionFontFamily : 
             styles.descriptionAlignment;
    }
  };

  const setBulletPointStyle = (index: number, type: 'title' | 'description', property: string, value: any) => {
    const key = `bullet-${index}`;
    setBulletPointStyles(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...prev[key] || {
            titleFontSize: 11,
            titleFontFamily: 'font-helvetica-neue',
            titleColor: '#1f2937',
            titleAlignment: 'left' as const,
            descriptionFontSize: 10,
            descriptionFontFamily: 'font-helvetica-neue',
            descriptionColor: '#6b7280',
            descriptionAlignment: 'left' as const,
          },
          [`${type}${property.charAt(0).toUpperCase() + property.slice(1)}`]: value
        }
      };
      
      // Call onUpdate to persist the changes
      if (onUpdate) {
        onUpdate({ bulletPointStyles: newStyles });
      }
      
      return newStyles;
    });
  };

  // Bullet point text change handlers
  const handleBulletPointTitleChange = (index: number, newText: string) => {
    setCurrentBulletPoints(prev => prev.map((point, i) => 
      i === index ? { ...point, title: newText } : point
    ));
    if (onUpdate) {
      // Update the bulletPoints array structure properly
      const updatedBulletPoints = currentBulletPoints.map((point, i) => 
        i === index ? { ...point, title: newText } : point
      );
      onUpdate({ bulletPoints: updatedBulletPoints });
    }
  };

  const handleBulletPointDescriptionChange = (index: number, newText: string) => {
    setCurrentBulletPoints(prev => prev.map((point, i) => 
      i === index ? { ...point, description: newText } : point
    ));
    if (onUpdate) {
      // Update the bulletPoints array structure properly
      const updatedBulletPoints = currentBulletPoints.map((point, i) => 
        i === index ? { ...point, description: newText } : point
      );
      onUpdate({ bulletPoints: updatedBulletPoints });
    }
  };

  // Bullet point delete handlers
  const handleBulletPointTitleDelete = (index: number) => {
    handleBulletPointTitleChange(index, '');
  };

  const handleBulletPointDescriptionDelete = (index: number) => {
    handleBulletPointDescriptionChange(index, '');
  };

  // Helper functions to get bullet point selection state and handlers
  const getBulletPointSelectionState = (index: number, type: 'title' | 'description') => {
    const key = `bullet-${index}-${type}`;
    return bulletPointSelectionStates[key]?.[0] || {};
  };

  const getBulletPointHandlers = (index: number, type: 'title' | 'description') => {
    const key = `bullet-${index}-${type}`;
    return bulletPointSelectionStates[key]?.[1] || {};
  };

  // Bullet point click handlers for single selection
  const handleBulletPointClick = (index: number, type: 'title' | 'description', e: React.MouseEvent) => {
    // Deselect all other elements first
    if (textSelectionHandlers.handleClickOutside) {
      textSelectionHandlers.handleClickOutside();
    }
    
    // Deselect all other bullet points
    Object.keys(bulletPointSelectionStates).forEach(key => {
      const currentKey = `bullet-${index}-${type}`;
      if (key !== currentKey) {
        const handlers = bulletPointSelectionStates[key]?.[1];
        if (handlers?.handleClickOutside) {
          handlers.handleClickOutside();
        }
      }
    });
    
    // Select the current bullet point
    const handlers = getBulletPointHandlers(index, type);
    if (handlers.handleTitleClick) {
      handlers.handleTitleClick(e);
    }
  };

  // Bullet point drag handlers
  const handleBulletPointDragStart = (index: number, type: 'title' | 'description', e: React.MouseEvent) => {
    const handlers = getBulletPointHandlers(index, type);
    if (handlers.handleTitleDragStart) {
      handlers.handleTitleDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  // Bullet point resize handlers
  const handleBulletPointResize = (index: number, type: 'title' | 'description', e: React.MouseEvent, direction: string) => {
    const handlers = getBulletPointHandlers(index, type);
    if (handlers.handleTitleResizeStart) {
      handlers.handleTitleResizeStart(e, direction, e.currentTarget as HTMLElement);
    }
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
        // Deselect main title and description
        if (textSelectionHandlers.handleClickOutside) textSelectionHandlers.handleClickOutside();
        
        // Deselect all bullet points
        Object.values(bulletPointSelectionStates).forEach(([, handlers]) => {
          if (handlers?.handleClickOutside) {
            handlers.handleClickOutside();
          }
        });
        
        // Close the popup when clicking outside
        setTextPopupState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textSelectionHandlers]);

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

  // Base classes for responsive layout with reduced top padding
  const containerClasses = useFixedDimensions 
    ? `metrics-financials-split-layout pl-6 lg:pl-12 pr-2 lg:pr-4 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white overflow-hidden relative ${className}`
    : `metrics-financials-split-layout pl-6 lg:pl-12 pr-2 lg:pr-4 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] overflow-hidden relative ${className}`;

  // Generate unique ID for accessibility - use static ID to avoid hydration issues
  const headingId = `financials-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  return (
    <section 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
    >
      {/* Title Section - Always at top, positioned based on chart location */}
      {layout.showTitle && (
        <div className={`title-container w-full mb-6 text-left ${layout.chartPosition === 'left' ? 'pl-0' : ''}`} style={{ contain: 'none', overflow: 'visible' }}>
          {currentTitle && (
            <div className="absolute pointer-events-auto" style={{ top: '60px', left: '48px', zIndex: 1000, width: titleWidth ? `${titleWidth}px` : '400px', maxWidth: '400px' }} data-figma-text>
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
                  whiteSpace: 'pre-line',
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
                  // Only recalculate position if popup is not already open for this element
                  if (textPopupState.isOpen && (textPopupState.targetElement === 'title' || textPopupState.lastTargetElement === 'title')) {
                    // Popup is already open for this element, just update the target
                    setTextPopupState(prev => ({
                      ...prev,
                      targetElement: 'title',
                      lastTargetElement: 'title',
                      currentFontSize: fontSize,
                      currentFontFamily: fontFamily
                    }));
                  } else {
                    // Calculate position relative to the title element in THIS specific layout
                    const titleElement = document.querySelector('.metrics-financials-split-layout .title-container [data-figma-text]');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.metrics-financials-split-layout') as HTMLElement;
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
                  }
                }}>
                {currentTitle}
              </FigmaText>
            </div>
          )}
          {layout.showDescription && currentDescription && (
            <div className="absolute pointer-events-auto" style={{ top: '95px', left: '50px', zIndex: 1000, width: descriptionWidth ? `${descriptionWidth}px` : '300px', maxWidth: '300px' }} data-figma-text>
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
                  whiteSpace: 'normal',
                  fontWeight: '400 !important',
                  marginLeft: '0px',
                  paddingLeft: '0px'
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
                  // Only recalculate position if popup is not already open for this element
                  if (textPopupState.isOpen && (textPopupState.targetElement === 'description' || textPopupState.lastTargetElement === 'description')) {
                    // Popup is already open for this element, just update the target
                    setTextPopupState(prev => ({
                      ...prev,
                      targetElement: 'description',
                      lastTargetElement: 'description',
                      currentFontSize: fontSize,
                      currentFontFamily: fontFamily
                    }));
                  } else {
                    // Calculate position relative to the description element in THIS specific layout
                    const descriptionElement = document.querySelector('.metrics-financials-split-layout .title-container [data-figma-text]:nth-child(2)');
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.metrics-financials-split-layout') as HTMLElement;
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
                  }
                }}>
                {currentDescription}
              </FigmaText>
            </div>
          )}
        </div>
      )}

      {/* Modular Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full items-start">
        
        {/* Render Chart First if chartPosition is 'left' */}
        {layout.chartPosition === 'left' && (
          <div className={`${getColumnClass(layout.columnSizes?.[1] ?? 8)} flex flex-col items-start justify-start -ml-16 lg:-ml-20`}>
            <div className="chart-container w-full h-full flex items-start justify-start mb-20 mt-20">
              <ChartBlock
                {...chart}
                className={chart.className || 'w-full h-80 bg-white p-0'}
              />
            </div>
          </div>
        )}
        
        {/* Content Column */}
        <div className={`${getColumnClass(layout.columnSizes?.[0] ?? 4)} flex flex-col justify-start items-start mt-20`}>
          {layout.showBulletPoints && currentBulletPoints && currentBulletPoints.length > 0 && (
            <div className="bullet-points w-full space-y-4">
              {currentBulletPoints.map((point, index) => (
                <div key={index} className="w-full">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <IconBlock 
                      iconName={point.icon as any}
                      size={12}
                      color="#374151"
                    />
                    <div className="flex-1" data-figma-text>
                      <FigmaText
                        variant="body"
                        color={getBulletPointStyle(index, 'title', 'color') as string}
                        align={getBulletPointStyle(index, 'title', 'alignment') as 'left' | 'center' | 'right'}
                        fontFamily={getBulletPointStyle(index, 'title', 'fontFamily') as string}
                        className="font-normal"
                        style={{
                          fontSize: `${getBulletPointStyle(index, 'title', 'fontSize')}px`,
                          textAlign: getBulletPointStyle(index, 'title', 'alignment') as 'left' | 'center' | 'right',
                          color: getBulletPointStyle(index, 'title', 'color') as string,
                          fontWeight: '500 !important',
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        isSelected={getBulletPointSelectionState(index, 'title').isTitleSelected}
                        transform={getBulletPointSelectionState(index, 'title').titleTransform}
                        onClick={(e: React.MouseEvent) => handleBulletPointClick(index, 'title', e)}
                        onTextChange={(newText: string) => handleBulletPointTitleChange(index, newText)}
                        onDeleteText={() => handleBulletPointTitleDelete(index)}
                        onDragStart={(e: React.MouseEvent) => handleBulletPointDragStart(index, 'title', e)}
                        onResizeStart={(e: React.MouseEvent, direction: string) => handleBulletPointResize(index, 'title', e, direction)}
                        onChangeSize={(fontSize: number) => setBulletPointStyle(index, 'title', 'fontSize', fontSize)}
                        onChangeFont={(fontFamily: string) => setBulletPointStyle(index, 'title', 'fontFamily', fontFamily)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          console.log('🎯 Bullet title popup triggered:', { position, fontSize, fontFamily, index });
                          const targetElement = `bullet-${index}-title`;
                          
                          // Debug: Check what elements we can find
                          const allBulletElements = document.querySelectorAll('.metrics-financials-split-layout .bullet-points .flex-1 [data-figma-text]');
                          console.log('🔍 Found bullet elements:', allBulletElements.length, allBulletElements);
                          
                          // Try a simpler approach - use the position from FigmaText but convert to canvas-relative
                          const canvasContainer = document.querySelector('.metrics-financials-split-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            // Convert viewport coordinates to canvas-relative
                            const relativeX = position.x - canvasRect.left - 10;
                            const relativeY = position.y - canvasRect.top - 50;
                            
                            console.log('📍 Canvas positioning:', { 
                              viewport: position, 
                              canvasRect: { left: canvasRect.left, top: canvasRect.top },
                              relative: { x: relativeX, y: relativeY }
                            });
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: targetElement,
                              lastTargetElement: targetElement
                            });
                          }
                        }}>
          {point.title}
                      </FigmaText>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="ml-6" data-figma-text>
                    <FigmaText
                      variant="body"
                      color={getBulletPointStyle(index, 'description', 'color') as string}
                      align={getBulletPointStyle(index, 'description', 'alignment') as 'left' | 'center' | 'right'}
                      fontFamily={getBulletPointStyle(index, 'description', 'fontFamily') as string}
                      className="font-normal"
                      style={{
                        fontSize: `${getBulletPointStyle(index, 'description', 'fontSize')}px`,
                        textAlign: getBulletPointStyle(index, 'description', 'alignment') as 'left' | 'center' | 'right',
                        color: getBulletPointStyle(index, 'description', 'color') as string,
                        fontWeight: '400 !important',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      isSelected={getBulletPointSelectionState(index, 'description').isTitleSelected}
                      transform={getBulletPointSelectionState(index, 'description').titleTransform}
                      onClick={(e: React.MouseEvent) => handleBulletPointClick(index, 'description', e)}
                      onTextChange={(newText: string) => handleBulletPointDescriptionChange(index, newText)}
                      onDeleteText={() => handleBulletPointDescriptionDelete(index)}
                      onDragStart={(e: React.MouseEvent) => handleBulletPointDragStart(index, 'description', e)}
                      onResizeStart={(e: React.MouseEvent, direction: string) => handleBulletPointResize(index, 'description', e, direction)}
                      onChangeSize={(fontSize: number) => setBulletPointStyle(index, 'description', 'fontSize', fontSize)}
                      onChangeFont={(fontFamily: string) => setBulletPointStyle(index, 'description', 'fontFamily', fontFamily)}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        console.log('🎯 Bullet description popup triggered:', { position, fontSize, fontFamily, index });
                        const targetElement = `bullet-${index}-description`;
                        
                        // Debug: Check what elements we can find
                        const allBulletDescElements = document.querySelectorAll('.metrics-financials-split-layout .bullet-points .ml-9 [data-figma-text]');
                        console.log('🔍 Found bullet desc elements:', allBulletDescElements.length, allBulletDescElements);
                        
                        // Try a simpler approach - use the position from FigmaText but convert to canvas-relative
                        const canvasContainer = document.querySelector('.metrics-financials-split-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          // Convert viewport coordinates to canvas-relative
                          const relativeX = position.x - canvasRect.left - 10;
                          const relativeY = position.y - canvasRect.top - 50;
                          
                          console.log('📍 Canvas positioning (desc):', { 
                            viewport: position, 
                            canvasRect: { left: canvasRect.left, top: canvasRect.top },
                            relative: { x: relativeX, y: relativeY }
                          });
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: targetElement,
                            lastTargetElement: targetElement
                          });
                        }
                      }}>
          {point.description}
                    </FigmaText>
                  </div>
                  
                  {/* Divider (except for last item) */}
                  {index < currentBulletPoints.length - 1 && (
                    <div className="w-full h-px bg-gray-200 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Render Chart Last if chartPosition is 'right' */}
        {layout.chartPosition === 'right' && (
          <div className={`${getColumnClass(layout.columnSizes?.[1] ?? 8)} flex flex-col items-end justify-start -mt-4`}>
            <div className="chart-container w-full h-full flex items-start justify-end mb-20 mt-20">
              <ChartBlock
                {...chart}
                className={chart.className || 'w-full h-80 bg-white p-0'}
              />
            </div>
          </div>
        )}

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
            } else if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              setBulletPointStyle(index, type as 'title' | 'description', 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              setBulletPointStyle(index, type as 'title' | 'description', 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              setBulletPointStyle(index, type as 'title' | 'description', 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              setBulletPointStyle(index, type as 'title' | 'description', 'alignment', alignment);
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
            if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              return getBulletPointStyle(index, type as 'title' | 'description', 'color') as string;
            }
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              return getBulletPointStyle(index, type as 'title' | 'description', 'alignment') as 'left' | 'center' | 'right';
            }
            return currentTitleAlignment;
          })()}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (typeof target === 'string' && target.startsWith('bullet-')) {
              const [, indexStr, type] = target.split('-');
              const index = parseInt(indexStr);
              if (type === 'title') {
                handleBulletPointTitleDelete(index);
              } else {
                handleBulletPointDescriptionDelete(index);
              }
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </section>
  );
});

export default Metrics_FinancialsSplit;

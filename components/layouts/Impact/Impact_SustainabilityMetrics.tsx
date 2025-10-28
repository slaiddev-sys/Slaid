import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import IconBlock from '../../blocks/IconBlock';

export interface ImpactSustainabilityMetricsProps {
  /**
   * Main title for the impactful metrics
   */
  title?: string;
  
  /**
   * Description text that appears on the right side
   */
  description?: string;
  
  /**
   * Carbon emissions impact metrics data
   */
  metricsData?: {
    metric1: {
      value: string;
      label: string;
      description: string;
      icon: string;
    };
    metric2: {
      value: string;
      label: string;
      description: string;
      icon: string;
    };
    metric3: {
      value: string;
      label: string;
      description: string;
      icon: string;
    };
    metric4: {
      value: string;
      label: string;
      description: string;
      icon: string;
    };
  };
  
  /**
   * Impact numbers displayed on the right side
   */
  impactNumbers?: {
    number1: {
      value: string;
      label: string;
    };
    number2: {
      value: string;
      label: string;
    };
    number3: {
      value: string;
      label: string;
    };
    number4: {
      value: string;
      label: string;
    };
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
     * Show/hide legend boxes
     */
    showLegends?: boolean;
    /**
     * Show/hide impact numbers
     */
    showImpactNumbers?: boolean;
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
   * Transform props for positional persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;
}

/**
 * Impact Legend and Metrics Layout
 * 
 * A two-column layout for legend and impact metrics.
 * Left side shows title and 4 legend boxes, right side shows description and impact numbers.
 */
export default function Impact_SustainabilityMetrics({
  title = 'Legend and Metrics',
  description = 'Carbon dioxide emissions are a critical challenge facing our planet. Our solutions directly address this problem by reducing CO₂ output and creating measurable environmental impact.',
  metricsData = {
    metric1: {
      value: '',
      label: 'CO₂ Emissions Reduced',
      description: 'Direct reduction in carbon dioxide emissions compared to traditional industrial processes and energy consumption.',
      icon: 'Leaf'
    },
    metric2: {
      value: '',
      label: 'Carbon Footprint Impact',
      description: 'Measurable decrease in overall carbon footprint through innovative solutions and process optimization.',
      icon: 'TrendingDown'
    },
    metric3: {
      value: '',
      label: 'Clean Energy Generated',
      description: 'Carbon-neutral energy production that replaces fossil fuel dependency and reduces atmospheric CO₂.',
      icon: 'Zap'
    },
    metric4: {
      value: '',
      label: 'Emission Prevention',
      description: 'Proactive measures preventing future CO₂ emissions through sustainable practices and technology.',
      icon: 'Shield'
    }
  },
  impactNumbers = {
    number1: {
      value: '500 tons',
      label: 'CO₂ Emissions Reduced'
    },
    number2: {
      value: '14,000 kWh',
      label: 'Clean Energy Generated'
    },
    number3: {
      value: '80%',
      label: 'Carbon Footprint Impact'
    },
    number4: {
      value: '2.3M kg',
      label: 'Emission Prevention'
    }
  },
  layout = {
    columnSizes: [6, 6],
    showTitle: true,
    showDescription: true,
    showLegends: true,
    showImpactNumbers: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  titleFontSize = 32,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  onUpdate
}: ImpactSustainabilityMetricsProps) {

  // Interactive text state management
  const [currentTitle, setCurrentTitle] = useState(title);

  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || 'text-gray-900');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);

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
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | string | null,
    lastTargetElement: null as 'title' | string | null
  });

  // Ref to track previous dragging states for popup following
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false,
    legendLabelDragging: [false, false, false, false],
    legendDescriptionDragging: [false, false, false, false],
    impactValueDragging: [false, false, false, false],
    impactNumberDragging: [false, false],
    impactNumberLabelDragging: [false, false, false, false]
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

  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

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

  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
    textSelectionHandlers.handleClickOutside();
  };

  // Impact Numbers interactive text state
  const [impactValues, setImpactValues] = useState([
    typeof impactNumbers.number1.value === 'string' ? impactNumbers.number1.value : String(impactNumbers.number1.value),
    typeof impactNumbers.number2.value === 'string' ? impactNumbers.number2.value : String(impactNumbers.number2.value),
    typeof impactNumbers.number3.value === 'string' ? impactNumbers.number3.value : String(impactNumbers.number3.value),
    typeof impactNumbers.number4.value === 'string' ? impactNumbers.number4.value : String(impactNumbers.number4.value)
  ]);
  const [impactLabels, setImpactLabels] = useState([
    typeof impactNumbers.number1.label === 'string' ? impactNumbers.number1.label : String(impactNumbers.number1.label),
    typeof impactNumbers.number2.label === 'string' ? impactNumbers.number2.label : String(impactNumbers.number2.label),
    typeof impactNumbers.number3.label === 'string' ? impactNumbers.number3.label : String(impactNumbers.number3.label),
    typeof impactNumbers.number4.label === 'string' ? impactNumbers.number4.label : String(impactNumbers.number4.label)
  ]);

  // Impact text styling states
  const [impactValueFontSizes, setImpactValueFontSizes] = useState([36, 36, 36, 36]);
  const [impactLabelFontSizes, setImpactLabelFontSizes] = useState([12, 12, 12, 12]);
  const [impactValueFontFamilies, setImpactValueFontFamilies] = useState(['font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue']);
  const [impactValueColors, setImpactValueColors] = useState(['#111827', '#111827', '#111827', '#111827']);
  const [impactValueAlignments, setImpactValueAlignments] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left', 'left']);

  // Impact text selection handlers
  const impactValueSelectionStates = [useFigmaSelection(), useFigmaSelection(), useFigmaSelection(), useFigmaSelection()];
  const impactLabelSelectionStates = [useFigmaSelection(), useFigmaSelection(), useFigmaSelection(), useFigmaSelection()];

  // Impact text change handlers
  const handleImpactValueChange = (index: number, newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    setImpactValues(prev => prev.map((value, i) => i === index ? safeText : value));
  };

  const handleImpactLabelChange = (index: number, newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    setImpactLabels(prev => prev.map((label, i) => i === index ? safeText : label));
  };

  const handleImpactValueDelete = (index: number) => {
    setImpactValues(prev => prev.map((value, i) => i === index ? '' : value));
    impactValueSelectionStates[index][1].handleClickOutside();
  };

  const handleImpactLabelDelete = (index: number) => {
    setImpactLabels(prev => prev.map((label, i) => i === index ? '' : label));
    impactLabelSelectionStates[index][1].handleClickOutside();
  };

  // Legend cards text state (4 cards with labels and descriptions)
  const [legendLabels, setLegendLabels] = useState([
    metricsData.metric1.label,
    metricsData.metric2.label,
    metricsData.metric3.label,
    metricsData.metric4.label
  ]);
  const [legendDescriptions, setLegendDescriptions] = useState([
    metricsData.metric1.description,
    metricsData.metric2.description,
    metricsData.metric3.description,
    metricsData.metric4.description
  ]);

  // Legend text styling states
  const [legendLabelFontSizes, setLegendLabelFontSizes] = useState([12, 12, 12, 12]);
  const [legendDescriptionFontSizes, setLegendDescriptionFontSizes] = useState([10, 10, 10, 10]);
  const [legendLabelFontFamilies, setLegendLabelFontFamilies] = useState(['font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue']);
  const [legendDescriptionFontFamilies, setLegendDescriptionFontFamilies] = useState(['font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue']);
  const [legendLabelColors, setLegendLabelColors] = useState(['#111827', '#111827', '#111827', '#111827']);
  const [legendDescriptionColors, setLegendDescriptionColors] = useState(['#6B7280', '#6B7280', '#6B7280', '#6B7280']);
  const [legendLabelAlignments, setLegendLabelAlignments] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left', 'left']);
  const [legendDescriptionAlignments, setLegendDescriptionAlignments] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left', 'left']);

  // Legend text selection handlers - create arrays for each legend card
  const legendLabelSelectionStates = [0, 1, 2, 3].map(() => useFigmaSelection());
  const legendDescriptionSelectionStates = [0, 1, 2, 3].map(() => useFigmaSelection());

  // Description section state
  const [currentDescription, setCurrentDescription] = useState(description || '');
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || '#6B7280');
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);
  const [descriptionSelectionState, descriptionSelectionHandlers] = useFigmaSelection();

  // Impact number labels and values state (for numbers 3 and 4 that aren't interactive yet)
  const [impactNumber3Value, setImpactNumber3Value] = useState(
    typeof impactNumbers.number3.value === 'string' ? impactNumbers.number3.value : String(impactNumbers.number3.value)
  );
  const [impactNumber4Value, setImpactNumber4Value] = useState(
    typeof impactNumbers.number4?.value === 'string' ? impactNumbers.number4.value : String(impactNumbers.number4?.value || '')
  );
  const [impactNumber3ValueFontSize, setImpactNumber3ValueFontSize] = useState(36);
  const [impactNumber4ValueFontSize, setImpactNumber4ValueFontSize] = useState(36);
  const [impactNumber3ValueFontFamily, setImpactNumber3ValueFontFamily] = useState('font-helvetica-neue');
  const [impactNumber4ValueFontFamily, setImpactNumber4ValueFontFamily] = useState('font-helvetica-neue');
  const [impactNumber3ValueColor, setImpactNumber3ValueColor] = useState('#111827');
  const [impactNumber4ValueColor, setImpactNumber4ValueColor] = useState('#111827');
  const [impactNumber3ValueAlignment, setImpactNumber3ValueAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [impactNumber4ValueAlignment, setImpactNumber4ValueAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [impactNumber3ValueSelectionState, impactNumber3ValueSelectionHandlers] = useFigmaSelection();
  const [impactNumber4ValueSelectionState, impactNumber4ValueSelectionHandlers] = useFigmaSelection();

  // Additional impact number labels state (for the span elements)
  const [impactNumber1Label, setImpactNumber1Label] = useState(
    typeof impactNumbers.number1.label === 'string' ? impactNumbers.number1.label : String(impactNumbers.number1.label)
  );
  const [impactNumber2Label, setImpactNumber2Label] = useState(
    typeof impactNumbers.number2.label === 'string' ? impactNumbers.number2.label : String(impactNumbers.number2.label)
  );
  const [impactNumber3Label, setImpactNumber3Label] = useState(
    typeof impactNumbers.number3.label === 'string' ? impactNumbers.number3.label : String(impactNumbers.number3.label)
  );
  const [impactNumber4Label, setImpactNumber4Label] = useState(
    typeof impactNumbers.number4?.label === 'string' ? impactNumbers.number4.label : String(impactNumbers.number4?.label || '')
  );

  const [impactNumberLabelFontSizes, setImpactNumberLabelFontSizes] = useState([12, 12, 12, 12]);
  const [impactNumberLabelFontFamilies, setImpactNumberLabelFontFamilies] = useState(['font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue']);
  const [impactNumberLabelColors, setImpactNumberLabelColors] = useState(['#6B7280', '#6B7280', '#6B7280', '#6B7280']);
  const [impactNumberLabelAlignments, setImpactNumberLabelAlignments] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left', 'left']);
  const impactNumberLabelSelectionStates = [0, 1, 2, 3].map(() => useFigmaSelection());

  // Legend text change handlers
  const handleLegendLabelChange = (index: number, newText: string) => {
    setLegendLabels(prev => prev.map((label, i) => i === index ? newText : label));
  };

  const handleLegendDescriptionChange = (index: number, newText: string) => {
    setLegendDescriptions(prev => prev.map((desc, i) => i === index ? newText : desc));
  };

  const handleLegendLabelDelete = (index: number) => {
    setLegendLabels(prev => prev.map((label, i) => i === index ? '' : label));
    legendLabelSelectionStates[index][1].handleClickOutside();
  };

  const handleLegendDescriptionDelete = (index: number) => {
    setLegendDescriptions(prev => prev.map((desc, i) => i === index ? '' : desc));
    legendDescriptionSelectionStates[index][1].handleClickOutside();
  };

  // Description change handlers
  const handleDescriptionChange = (newText: string) => {
    setCurrentDescription(newText);
    if (onUpdate) {
      onUpdate({ description: newText });
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) {
      onUpdate({ description: '' });
    }
    descriptionSelectionHandlers.handleClickOutside();
  };

  // Impact number value change handlers
  const handleImpactNumber3ValueChange = (newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    setImpactNumber3Value(safeText);
  };

  const handleImpactNumber4ValueChange = (newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    setImpactNumber4Value(safeText);
  };

  const handleImpactNumber3ValueDelete = () => {
    setImpactNumber3Value('');
    impactNumber3ValueSelectionHandlers.handleClickOutside();
  };

  const handleImpactNumber4ValueDelete = () => {
    setImpactNumber4Value('');
    impactNumber4ValueSelectionHandlers.handleClickOutside();
  };

  // Impact number label change handlers
  const handleImpactNumberLabelChange = (index: number, newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    if (index === 0) setImpactNumber1Label(safeText);
    else if (index === 1) setImpactNumber2Label(safeText);
    else if (index === 2) setImpactNumber3Label(safeText);
    else if (index === 3) setImpactNumber4Label(safeText);
  };

  const handleImpactNumberLabelDelete = (index: number) => {
    if (index === 0) setImpactNumber1Label('');
    else if (index === 1) setImpactNumber2Label('');
    else if (index === 2) setImpactNumber3Label('');
    else if (index === 3) setImpactNumber4Label('');
    impactNumberLabelSelectionStates[index][1].handleClickOutside();
  };

  // Function to deselect all other text elements when one is selected
  const deselectAllOtherElements = (exceptElement: string) => {
    if (exceptElement !== 'title') textSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'description') descriptionSelectionHandlers.handleClickOutside();
    
    // Deselect legend elements except the selected one
    legendLabelSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `legend-label-${index}`) handlers.handleClickOutside();
    });
    legendDescriptionSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `legend-description-${index}`) handlers.handleClickOutside();
    });
    
    // Deselect impact number labels except the selected one
    impactNumberLabelSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `impact-number-label-${index}`) handlers.handleClickOutside();
    });
    
    // Deselect impact number values except the selected one
    if (exceptElement !== 'impact-number-3-value') impactNumber3ValueSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'impact-number-4-value') impactNumber4ValueSelectionHandlers.handleClickOutside();
    
    // Deselect all impact elements except the selected one
    impactValueSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `impact-value-${index}`) handlers.handleClickOutside();
    });
    impactLabelSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `impact-label-${index}`) handlers.handleClickOutside();
    });
  };

  // Update popup position when text is dragged (crucial for popup following)
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      let transform: any;
      let isDragging: boolean = false;
      let wasDragging: boolean = false;
      
      // Handle different text elements
      if (activeTarget === 'title') {
        transform = textSelectionState.titleTransform;
        isDragging = textSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isTitleDragging;
      } else if (activeTarget === 'description') {
        transform = descriptionSelectionState.titleTransform;
        isDragging = descriptionSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isDescriptionDragging;
      } else if (activeTarget?.startsWith('legend-label-')) {
        const index = parseInt(activeTarget.split('-')[2]);
        transform = legendLabelSelectionStates[index][0].titleTransform;
        isDragging = legendLabelSelectionStates[index][0].isTitleDragging;
        wasDragging = prevDraggingRef.current.legendLabelDragging[index];
      } else if (activeTarget?.startsWith('legend-description-')) {
        const index = parseInt(activeTarget.split('-')[2]);
        transform = legendDescriptionSelectionStates[index][0].titleTransform;
        isDragging = legendDescriptionSelectionStates[index][0].isTitleDragging;
        wasDragging = prevDraggingRef.current.legendDescriptionDragging[index];
      } else if (activeTarget?.startsWith('impact-value-')) {
        const index = parseInt(activeTarget.split('-')[2]);
        transform = impactValueSelectionStates[index][0].titleTransform;
        isDragging = impactValueSelectionStates[index][0].isTitleDragging;
        wasDragging = prevDraggingRef.current.impactValueDragging[index];
      } else if (activeTarget === 'impact-number-3-value') {
        transform = impactNumber3ValueSelectionState.titleTransform;
        isDragging = impactNumber3ValueSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.impactNumberDragging[0];
      } else if (activeTarget === 'impact-number-4-value') {
        transform = impactNumber4ValueSelectionState.titleTransform;
        isDragging = impactNumber4ValueSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.impactNumberDragging[1];
      } else if (activeTarget?.startsWith('impact-number-label-')) {
        const index = parseInt(activeTarget.split('-')[3]);
        transform = impactNumberLabelSelectionStates[index][0].titleTransform;
        isDragging = impactNumberLabelSelectionStates[index][0].isTitleDragging;
        wasDragging = prevDraggingRef.current.impactNumberLabelDragging[index];
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
    }

    // Update previous dragging states
    prevDraggingRef.current = {
      isTitleDragging: textSelectionState.isTitleDragging || false,
      isDescriptionDragging: descriptionSelectionState.isTitleDragging || false,
      legendLabelDragging: legendLabelSelectionStates.map(([state]) => state.isTitleDragging || false),
      legendDescriptionDragging: legendDescriptionSelectionStates.map(([state]) => state.isTitleDragging || false),
      impactValueDragging: impactValueSelectionStates.map(([state]) => state.isTitleDragging || false),
      impactNumberDragging: [
        impactNumber3ValueSelectionState.isTitleDragging || false,
        impactNumber4ValueSelectionState.isTitleDragging || false
      ],
      impactNumberLabelDragging: impactNumberLabelSelectionStates.map(([state]) => state.isTitleDragging || false)
    };
  }, [
    textSelectionState.titleTransform,
    textSelectionState.isTitleDragging,
    descriptionSelectionState.titleTransform,
    descriptionSelectionState.isTitleDragging,
    textPopupState.isOpen,
    textPopupState.targetElement,
    textPopupState.lastTargetElement
  ]);

  // Global click handler to deselect all elements
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-container') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      return;
    }
    
    textSelectionHandlers.handleClickOutside();
    descriptionSelectionHandlers.handleClickOutside();
    
    // Deselect legend elements
    legendLabelSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    legendDescriptionSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    
    // Deselect impact number labels and values
    impactNumberLabelSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    impactNumber3ValueSelectionHandlers.handleClickOutside();
    impactNumber4ValueSelectionHandlers.handleClickOutside();
    
    // Deselect all impact elements
    impactValueSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    impactLabelSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null
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
  } : {};

  // Base classes for sustainability layout
  const containerClasses = useFixedDimensions 
    ? `impact-sustainability-metrics px-6 lg:px-12 pt-6 lg:pt-8 pb-6 lg:pb-8 bg-white ${className}`
    : `impact-sustainability-metrics px-6 lg:px-12 pt-6 lg:pt-8 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `sustainability-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  // Calculate column classes
  const [leftCols, rightCols] = layout.columnSizes || [6, 6];
  const leftColClass = `w-full lg:w-${leftCols}/12`;
  const rightColClass = `w-full lg:w-${rightCols}/12`;

  return (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
    <section 
      className={`impact-sustainability-metrics relative impact-sustainability-metrics-layout bg-white ${className}`}
      style={{
        // Fixed canvas size - never changes regardless of content
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        // CRITICAL: Allow internal overflow but let parent clip
        overflow: 'visible',
        contain: 'layout style',
        // Prevent any size calculations from affecting ancestors
        flexShrink: 0,
        minWidth: `${canvasWidth}px`,
        minHeight: `${canvasHeight}px`,
        maxWidth: `${canvasWidth}px`,
        maxHeight: `${canvasHeight}px`,
        position: 'relative'
      }}
      aria-labelledby={headingId}
        onClick={handleGlobalClickOutside}
    >
      {/* Title Layer - Independent overlay, positioned absolutely */}
      {layout.showTitle && (
        <div 
          className="title-layer absolute pointer-events-auto"
          style={{
            left: '48px',
            top: '48px',
            width: 'auto',
            zIndex: 25, // Above legend cards (20) but below impact numbers when selected
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
                fontFamily={titleFontFamilyState}
                className={`font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tighter break-words overflow-wrap-anywhere whitespace-normal ${currentTitleAlignment === 'left' ? 'text-left' : currentTitleAlignment === 'center' ? 'text-center' : 'text-right'} break-words`}
                style={{
                  fontSize: `${titleFontSizeState}px`,
                  color: currentTitleColor,
                  textAlign: currentTitleAlignment,
                  lineHeight: '0.9',
                  letterSpacing: '-0.05em',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '400px'
                }}
                useFixedWidth={false}
                isSelected={textSelectionState.isTitleSelected}
                transform={textSelectionState.titleTransform}
                onDragStart={textSelectionHandlers.handleTitleDragStart}
                onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  textSelectionHandlers.handleTitleClick(e);
                }}
                onTextChange={handleTitleTextChange}
                onSizeChange={(newTransform: any) => textSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                onChangeSize={handleTitleChangeSize}
                onChangeFont={handleTitleChangeFont}
                onDeleteText={handleTitleDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  // Calculate position relative to the title element in THIS specific layout
                  const titleElement = document.querySelector('.impact-sustainability-metrics-layout .title-layer');
                  if (titleElement) {
                    const titleRect = titleElement.getBoundingClientRect();
                    const canvasContainer = titleElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
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

      {/* Legend Cards Layer - Independent overlay, positioned absolutely */}
      {layout.showLegends && (
        <div 
          className="legend-cards-layer absolute pointer-events-auto"
          style={{
            left: '48px',
            top: '140px',
            width: 'auto',
            maxWidth: '400px',
            zIndex: 20,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute' as const
          }}
        >
              <div className="grid grid-cols-2 gap-3">
                {/* Metric 1 - CO₂ Saved */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 relative z-20">
                  <div className="flex flex-col items-start">
                    <div className="w-8 h-8 flex items-center justify-center mb-3">
                      <IconBlock
                        iconName={metricsData.metric1.icon as any}
                        size={16}
                        color="#000000"
                      />
                    </div>
                    <div className="w-full">
                      <FigmaText
                        variant="body"
                        color={legendLabelColors[0]}
                        align={legendLabelAlignments[0]}
                        fontFamily={legendLabelFontFamilies[0]}
                        className="text-xs font-medium text-gray-900 mb-1 font-helvetica-neue break-words"
                        style={{
                          fontSize: `${legendLabelFontSizes[0]}px`,
                          color: legendLabelColors[0],
                          textAlign: legendLabelAlignments[0],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          marginBottom: '0.25rem'
                        }}
                        useFixedWidth={false}
                        isSelected={legendLabelSelectionStates[0][0].isTitleSelected}
                        transform={legendLabelSelectionStates[0][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-label-0');
                          legendLabelSelectionStates[0][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendLabelChange(0, newText)}
                        onSizeChange={(newTransform: any) => legendLabelSelectionStates[0][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendLabelFontSizes(prev => prev.map((size, i) => i === 0 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendLabelSelectionStates[0][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendLabelSelectionStates[0][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendLabelDelete(0)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Only recalculate position if popup is not already open for this element
                          if (textPopupState.isOpen && (textPopupState.targetElement === 'legend-label-0' || textPopupState.lastTargetElement === 'legend-label-0')) {
                            // Popup is already open for this element, just update the target
                            setTextPopupState(prev => ({
                              ...prev,
                              targetElement: 'legend-label-0',
                              lastTargetElement: 'legend-label-0',
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily
                            }));
                          } else {
                            // Calculate position relative to this specific element
                            const targetElement = document.querySelector('.impact-sustainability-metrics-layout .legend-cards-layer');
                            if (targetElement) {
                              const targetRect = targetElement.getBoundingClientRect();
                              const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                              if (canvasContainer) {
                                const canvasRect = canvasContainer.getBoundingClientRect();
                                const relativeX = (targetRect.left - canvasRect.left) - 10;
                                const relativeY = (targetRect.top - canvasRect.top) - 50;
                                
                                setTextPopupState({
                                  isOpen: true,
                                  position: { x: relativeX, y: relativeY },
                                  originalPosition: { x: relativeX, y: relativeY },
                                  currentFontSize: fontSize,
                                  currentFontFamily: fontFamily,
                                  targetElement: 'legend-label-0',
                                  lastTargetElement: 'legend-label-0'
                                });
                              }
                            }
                          }
                        }}
                      >
                        {legendLabels[0]}
                      </FigmaText>
                      
                      <FigmaText
                        variant="body"
                        color={legendDescriptionColors[0]}
                        align={legendDescriptionAlignments[0]}
                        fontFamily={legendDescriptionFontFamilies[0]}
                        className="break-words"
                        style={{
                          fontSize: `${legendDescriptionFontSizes[0]}px`,
                          color: legendDescriptionColors[0],
                          textAlign: legendDescriptionAlignments[0],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        useFixedWidth={false}
                        isSelected={legendDescriptionSelectionStates[0][0].isTitleSelected}
                        transform={legendDescriptionSelectionStates[0][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-description-0');
                          legendDescriptionSelectionStates[0][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendDescriptionChange(0, newText)}
                        onSizeChange={(newTransform: any) => legendDescriptionSelectionStates[0][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendDescriptionFontSizes(prev => prev.map((size, i) => i === 0 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendDescriptionSelectionStates[0][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendDescriptionSelectionStates[0][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendDescriptionDelete(0)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-description-0',
                            lastTargetElement: 'legend-description-0'
                          });
                        }}
                      >
                        {legendDescriptions[0]}
                      </FigmaText>
                    </div>
                  </div>
                </div>

                {/* Metric 2 - Waste Usage Reduced */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 relative z-20">
                  <div className="flex flex-col items-start">
                    <div className="w-8 h-8 flex items-center justify-center mb-3">
                      <IconBlock
                        iconName={metricsData.metric2.icon as any}
                        size={16}
                        color="#000000"
                      />
                    </div>
                    <div className="w-full">
                      <FigmaText
                        variant="body"
                        color={legendLabelColors[1]}
                        align={legendLabelAlignments[1]}
                        fontFamily={legendLabelFontFamilies[1]}
                        className="text-xs font-medium text-gray-900 mb-1 font-helvetica-neue break-words"
                        style={{
                          fontSize: `${legendLabelFontSizes[1]}px`,
                          color: legendLabelColors[1],
                          textAlign: legendLabelAlignments[1],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          marginBottom: '0.25rem'
                        }}
                        useFixedWidth={false}
                        isSelected={legendLabelSelectionStates[1][0].isTitleSelected}
                        transform={legendLabelSelectionStates[1][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-label-1');
                          legendLabelSelectionStates[1][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendLabelChange(1, newText)}
                        onSizeChange={(newTransform: any) => legendLabelSelectionStates[1][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendLabelFontSizes(prev => prev.map((size, i) => i === 1 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendLabelSelectionStates[1][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendLabelSelectionStates[1][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendLabelDelete(1)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-label-1',
                            lastTargetElement: 'legend-label-1'
                          });
                        }}
                      >
                        {legendLabels[1]}
                      </FigmaText>
                      
                      <FigmaText
                        variant="body"
                        color={legendDescriptionColors[1]}
                        align={legendDescriptionAlignments[1]}
                        fontFamily={legendDescriptionFontFamilies[1]}
                        className="break-words"
                        style={{
                          fontSize: `${legendDescriptionFontSizes[1]}px`,
                          color: legendDescriptionColors[1],
                          textAlign: legendDescriptionAlignments[1],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        useFixedWidth={false}
                        isSelected={legendDescriptionSelectionStates[1][0].isTitleSelected}
                        transform={legendDescriptionSelectionStates[1][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-description-1');
                          legendDescriptionSelectionStates[1][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendDescriptionChange(1, newText)}
                        onSizeChange={(newTransform: any) => legendDescriptionSelectionStates[1][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendDescriptionFontSizes(prev => prev.map((size, i) => i === 1 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendDescriptionSelectionStates[1][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendDescriptionSelectionStates[1][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendDescriptionDelete(1)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-description-1',
                            lastTargetElement: 'legend-description-1'
                          });
                        }}
                      >
                        {legendDescriptions[1]}
                      </FigmaText>
                    </div>
                  </div>
                </div>

                {/* Metric 3 - Clean Energy Output */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 relative z-20">
                  <div className="flex flex-col items-start">
                    <div className="w-8 h-8 flex items-center justify-center mb-3">
                      <IconBlock
                        iconName={metricsData.metric3.icon as any}
                        size={16}
                        color="#000000"
                      />
                    </div>
                    <div className="w-full">
                      <FigmaText
                        variant="body"
                        color={legendLabelColors[2]}
                        align={legendLabelAlignments[2]}
                        fontFamily={legendLabelFontFamilies[2]}
                        className="text-xs font-medium text-gray-900 mb-1 font-helvetica-neue break-words"
                        style={{
                          fontSize: `${legendLabelFontSizes[2]}px`,
                          color: legendLabelColors[2],
                          textAlign: legendLabelAlignments[2],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          marginBottom: '0.25rem'
                        }}
                        useFixedWidth={false}
                        isSelected={legendLabelSelectionStates[2][0].isTitleSelected}
                        transform={legendLabelSelectionStates[2][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-label-2');
                          legendLabelSelectionStates[2][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendLabelChange(2, newText)}
                        onSizeChange={(newTransform: any) => legendLabelSelectionStates[2][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendLabelFontSizes(prev => prev.map((size, i) => i === 2 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendLabelSelectionStates[2][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendLabelSelectionStates[2][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendLabelDelete(2)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-label-2',
                            lastTargetElement: 'legend-label-2'
                          });
                        }}
                      >
                        {legendLabels[2]}
                      </FigmaText>
                      
                      <FigmaText
                        variant="body"
                        color={legendDescriptionColors[2]}
                        align={legendDescriptionAlignments[2]}
                        fontFamily={legendDescriptionFontFamilies[2]}
                        className="break-words"
                        style={{
                          fontSize: `${legendDescriptionFontSizes[2]}px`,
                          color: legendDescriptionColors[2],
                          textAlign: legendDescriptionAlignments[2],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        useFixedWidth={false}
                        isSelected={legendDescriptionSelectionStates[2][0].isTitleSelected}
                        transform={legendDescriptionSelectionStates[2][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-description-2');
                          legendDescriptionSelectionStates[2][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendDescriptionChange(2, newText)}
                        onSizeChange={(newTransform: any) => legendDescriptionSelectionStates[2][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendDescriptionFontSizes(prev => prev.map((size, i) => i === 2 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendDescriptionSelectionStates[2][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendDescriptionSelectionStates[2][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendDescriptionDelete(2)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-description-2',
                            lastTargetElement: 'legend-description-2'
                          });
                        }}
                      >
                        {legendDescriptions[2]}
                      </FigmaText>
                    </div>
                  </div>
                </div>

                {/* Metric 4 - Water Saved */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 relative z-20">
                  <div className="flex flex-col items-start">
                    <div className="w-8 h-8 flex items-center justify-center mb-3">
                      <IconBlock
                        iconName={metricsData.metric4.icon as any}
                        size={16}
                        color="#000000"
                      />
                    </div>
                    <div className="w-full">
                      <FigmaText
                        variant="body"
                        color={legendLabelColors[3]}
                        align={legendLabelAlignments[3]}
                        fontFamily={legendLabelFontFamilies[3]}
                        className="text-xs font-medium text-gray-900 mb-1 font-helvetica-neue break-words"
                        style={{
                          fontSize: `${legendLabelFontSizes[3]}px`,
                          color: legendLabelColors[3],
                          textAlign: legendLabelAlignments[3],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          marginBottom: '0.25rem'
                        }}
                        useFixedWidth={false}
                        isSelected={legendLabelSelectionStates[3][0].isTitleSelected}
                        transform={legendLabelSelectionStates[3][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-label-3');
                          legendLabelSelectionStates[3][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendLabelChange(3, newText)}
                        onSizeChange={(newTransform: any) => legendLabelSelectionStates[3][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendLabelFontSizes(prev => prev.map((size, i) => i === 3 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendLabelSelectionStates[3][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendLabelSelectionStates[3][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendLabelDelete(3)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-label-3',
                            lastTargetElement: 'legend-label-3'
                          });
                        }}
                      >
                        {legendLabels[3]}
                      </FigmaText>
                      
                      <FigmaText
                        variant="body"
                        color={legendDescriptionColors[3]}
                        align={legendDescriptionAlignments[3]}
                        fontFamily={legendDescriptionFontFamilies[3]}
                        className="break-words"
                        style={{
                          fontSize: `${legendDescriptionFontSizes[3]}px`,
                          color: legendDescriptionColors[3],
                          textAlign: legendDescriptionAlignments[3],
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        useFixedWidth={false}
                        isSelected={legendDescriptionSelectionStates[3][0].isTitleSelected}
                        transform={legendDescriptionSelectionStates[3][0].titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('legend-description-3');
                          legendDescriptionSelectionStates[3][1].handleTitleClick(e);
                        }}
                        onTextChange={(newText: string) => handleLegendDescriptionChange(3, newText)}
                        onSizeChange={(newTransform: any) => legendDescriptionSelectionStates[3][1].handleTitleSizeChange?.(newTransform)}
                        onChangeSize={(fontSize: number) => {
                          setLegendDescriptionFontSizes(prev => prev.map((size, i) => i === 3 ? fontSize : size));
                        }}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          legendDescriptionSelectionStates[3][1].handleTitleDragStart?.(e, element);
                        }}
                        onResizeStart={legendDescriptionSelectionStates[3][1].handleTitleResizeStart}
                        onDeleteText={() => handleLegendDescriptionDelete(3)}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          // Use simple positioning that works reliably
                          setTextPopupState({
                            isOpen: true,
                            position: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                            originalPosition: { x: Math.max(50, position.x - 20), y: Math.max(50, position.y - 80) },
                              
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'legend-description-3',
                            lastTargetElement: 'legend-description-3'
                          });
                        }}
                      >
                        {legendDescriptions[3]}
                      </FigmaText>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      )}

      {/* Description Layer - Independent overlay, positioned absolutely */}
      {layout.showDescription && currentDescription && (
        <div 
          className="description-layer absolute pointer-events-auto"
          style={{
            left: '500px',
            top: '48px',
            width: 'auto',
            zIndex: 20,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute' as const
          }}
        >
              <FigmaText
                variant="body"
                color={currentDescriptionColor}
                align={currentDescriptionAlignment}
                fontFamily={descriptionFontFamilyState}
                className="leading-relaxed break-words"
                style={{
                  fontSize: `${descriptionFontSizeState}px`,
                  color: currentDescriptionColor,
                  textAlign: currentDescriptionAlignment,
                  lineHeight: '1.6',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal', // Ensure text wraps
                  maxWidth: '300px' // Fixed constraint like quote_left
                }}
                useFixedWidth={false}
                isSelected={textSelectionState.isDescriptionSelected}
                transform={textSelectionState.descriptionTransform}
                onDragStart={textSelectionHandlers.handleDescriptionDragStart}
                onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  textSelectionHandlers.handleDescriptionClick(e);
                }}
                onTextChange={handleDescriptionChange}
                onSizeChange={(newTransform: any) => textSelectionHandlers.handleDescriptionSizeChange?.(newTransform)}
                onChangeSize={(fontSize: number) => setDescriptionFontSize(fontSize)}
                onDeleteText={handleDescriptionDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  // Calculate position relative to the description element in THIS specific layout
                  const descriptionElement = document.querySelector('.impact-sustainability-metrics-layout .description-layer');
                  if (descriptionElement) {
                    const descriptionRect = descriptionElement.getBoundingClientRect();
                    const canvasContainer = descriptionElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
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
        </div>
      )}

      {/* Impact Numbers Layer - Independent overlay, positioned absolutely */}
      {layout.showImpactNumbers && (
        <div 
          className="impact-numbers-layer absolute pointer-events-auto"
          style={{
            left: '500px',
            top: '120px',
            width: 'auto',
            zIndex: 20,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute' as const
          }}
        >
            <div className="-mt-2">
              {/* Impact Number 1 */}
              <div className="flex items-start justify-between py-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <IconBlock
                      iconName="Leaf"
                      size={16}
                      color="#000000"
                    />
                  </div>
                  <FigmaText
                    variant="body"
                    color={impactNumberLabelColors[0]}
                    align={impactNumberLabelAlignments[0]}
                    fontFamily={impactNumberLabelFontFamilies[0]}
                    className="text-xs leading-tight break-words"
                    style={{
                      fontSize: `${impactNumberLabelFontSizes[0]}px`,
                      color: impactNumberLabelColors[0],
                      textAlign: impactNumberLabelAlignments[0],
                      lineHeight: '1.25',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactNumberLabelSelectionStates[0][0].isTitleSelected}
                    transform={impactNumberLabelSelectionStates[0][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-number-label-0');
                      impactNumberLabelSelectionStates[0][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactNumberLabelChange(0, newText)}
                    onSizeChange={(newTransform: any) => impactNumberLabelSelectionStates[0][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactNumberLabelFontSizes(prev => prev.map((size, i) => i === 0 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactNumberLabelSelectionStates[0][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactNumberLabelSelectionStates[0][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactNumberLabelDelete(0)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      // Only recalculate position if popup is not already open for this element
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-number-label-0' || textPopupState.lastTargetElement === 'impact-number-label-0')) {
                        // Popup is already open for this element, just update the target
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-number-label-0',
                          lastTargetElement: 'impact-number-label-0',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        // Calculate position relative to the impact numbers layer
                        const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                        if (targetElement) {
                          const targetRect = targetElement.getBoundingClientRect();
                          const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (targetRect.left - canvasRect.left) - 10;
                            const relativeY = (targetRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-number-label-0',
                              lastTargetElement: 'impact-number-label-0'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactNumber1Label.split(' ').length > 3 ? (
                      <>
                        {impactNumber1Label.split(' ').slice(0, 2).join(' ')}<br />
                        {impactNumber1Label.split(' ').slice(2).join(' ')}
                      </>
                    ) : (
                      impactNumber1Label
                    )}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color={impactValueColors[0]}
                  align={impactValueAlignments[0]}
                  fontFamily={impactValueFontFamilies[0]}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight break-words"
                  style={{
                    fontSize: `${impactValueFontSizes[0]}px`,
                    color: impactValueColors[0],
                    textAlign: impactValueAlignments[0],
                    lineHeight: '1.1',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '200px' // Fixed constraint to prevent layout pushing
                  }}
                  isSelected={impactValueSelectionStates[0][0].isTitleSelected}
                  transform={impactValueSelectionStates[0][0].titleTransform}
                  onClick={(e: React.MouseEvent) => {
                    deselectAllOtherElements('impact-value-0');
                    impactValueSelectionStates[0][1].handleTitleClick(e);
                  }}
                  onTextChange={(newText: string) => handleImpactValueChange(0, newText)}
                  onSizeChange={(newTransform: any) => impactValueSelectionStates[0][1].handleTitleSizeChange?.(newTransform)}
                  onChangeSize={(fontSize: number) => {
                    setImpactValueFontSizes(prev => prev.map((size, i) => i === 0 ? fontSize : size));
                  }}
                  onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                    impactValueSelectionStates[0][1].handleTitleDragStart?.(e, element);
                  }}
                  useFixedWidth={false}
                  onResizeStart={impactValueSelectionStates[0][1].handleTitleResizeStart}
                  onDeleteText={() => handleImpactValueDelete(0)}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    // Only recalculate position if popup is not already open for this element
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-value-0' || textPopupState.lastTargetElement === 'impact-value-0')) {
                      // Popup is already open for this element, just update the target
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-value-0',
                        lastTargetElement: 'impact-value-0',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      // Calculate position relative to the impact numbers layer
                      const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                      if (targetElement) {
                        const targetRect = targetElement.getBoundingClientRect();
                        const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (targetRect.left - canvasRect.left) - 10;
                          const relativeY = (targetRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'impact-value-0',
                            lastTargetElement: 'impact-value-0'
                          });
                        }
                      }
                    }
                  }}
                >
                  {impactValues[0]}
                </FigmaText>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200"></div>

              {/* Impact Number 2 */}
              <div className="flex items-start justify-between py-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <IconBlock
                      iconName="Zap"
                      size={16}
                      color="#000000"
                    />
                  </div>
                  <FigmaText
                    variant="body"
                    color={impactNumberLabelColors[1]}
                    align={impactNumberLabelAlignments[1]}
                    fontFamily={impactNumberLabelFontFamilies[1]}
                    className="text-xs leading-tight break-words"
                    style={{
                      fontSize: `${impactNumberLabelFontSizes[1]}px`,
                      color: impactNumberLabelColors[1],
                      textAlign: impactNumberLabelAlignments[1],
                      lineHeight: '1.25',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactNumberLabelSelectionStates[1][0].isTitleSelected}
                    transform={impactNumberLabelSelectionStates[1][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-number-label-1');
                      impactNumberLabelSelectionStates[1][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactNumberLabelChange(1, newText)}
                    onSizeChange={(newTransform: any) => impactNumberLabelSelectionStates[1][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactNumberLabelFontSizes(prev => prev.map((size, i) => i === 1 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactNumberLabelSelectionStates[1][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactNumberLabelSelectionStates[1][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactNumberLabelDelete(1)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      // Only recalculate position if popup is not already open for this element
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-number-label-1' || textPopupState.lastTargetElement === 'impact-number-label-1')) {
                        // Popup is already open for this element, just update the target
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-number-label-1',
                          lastTargetElement: 'impact-number-label-1',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        // Calculate position relative to the impact numbers layer
                        const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                        if (targetElement) {
                          const targetRect = targetElement.getBoundingClientRect();
                          const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (targetRect.left - canvasRect.left) - 10;
                            const relativeY = (targetRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-number-label-1',
                              lastTargetElement: 'impact-number-label-1'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactNumber2Label === 'Clean Energy Generated' ? (
                      <>
                        Clean Energy<br />
                        Generated
                      </>
                    ) : impactNumber2Label.split(' ').length > 3 ? (
                      <>
                        {impactNumber2Label.split(' ').slice(0, 2).join(' ')}<br />
                        {impactNumber2Label.split(' ').slice(2).join(' ')}
                      </>
                    ) : (
                      impactNumber2Label
                    )}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color={impactValueColors[1]}
                  align={impactValueAlignments[1]}
                  fontFamily={impactValueFontFamilies[1]}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight break-words"
                  style={{
                    fontSize: `${impactValueFontSizes[1]}px`,
                    color: impactValueColors[1],
                    textAlign: impactValueAlignments[1],
                    lineHeight: '1.1',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '200px' // Fixed constraint to prevent layout pushing
                  }}
                  isSelected={impactValueSelectionStates[1][0].isTitleSelected}
                  transform={impactValueSelectionStates[1][0].titleTransform}
                  onClick={(e: React.MouseEvent) => {
                    deselectAllOtherElements('impact-value-1');
                    impactValueSelectionStates[1][1].handleTitleClick(e);
                  }}
                  onTextChange={(newText: string) => handleImpactValueChange(1, newText)}
                  onSizeChange={(newTransform: any) => impactValueSelectionStates[1][1].handleTitleSizeChange?.(newTransform)}
                  onChangeSize={(fontSize: number) => {
                    setImpactValueFontSizes(prev => prev.map((size, i) => i === 1 ? fontSize : size));
                  }}
                  onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                    impactValueSelectionStates[1][1].handleTitleDragStart?.(e, element);
                  }}
                  useFixedWidth={false}
                  onResizeStart={impactValueSelectionStates[1][1].handleTitleResizeStart}
                  onDeleteText={() => handleImpactValueDelete(1)}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    // Only recalculate position if popup is not already open for this element
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-value-1' || textPopupState.lastTargetElement === 'impact-value-1')) {
                      // Popup is already open for this element, just update the target
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-value-1',
                        lastTargetElement: 'impact-value-1',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      // Calculate position relative to the impact numbers layer
                      const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                      if (targetElement) {
                        const targetRect = targetElement.getBoundingClientRect();
                        const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (targetRect.left - canvasRect.left) - 10;
                          const relativeY = (targetRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'impact-value-1',
                            lastTargetElement: 'impact-value-1'
                          });
                        }
                      }
                    }
                  }}
                >
                  {impactValues[1]}
                </FigmaText>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200"></div>

              {/* Impact Number 3 */}
              <div className="flex items-start justify-between py-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <IconBlock
                      iconName="TrendingDown"
                      size={16}
                      color="#000000"
                    />
                  </div>
                  <FigmaText
                    variant="body"
                    color={impactNumberLabelColors[2]}
                    align={impactNumberLabelAlignments[2]}
                    fontFamily={impactNumberLabelFontFamilies[2]}
                    className="text-xs leading-tight break-words"
                    style={{
                      fontSize: `${impactNumberLabelFontSizes[2]}px`,
                      color: impactNumberLabelColors[2],
                      textAlign: impactNumberLabelAlignments[2],
                      lineHeight: '1.25',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactNumberLabelSelectionStates[2][0].isTitleSelected}
                    transform={impactNumberLabelSelectionStates[2][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-number-label-2');
                      impactNumberLabelSelectionStates[2][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactNumberLabelChange(2, newText)}
                    onSizeChange={(newTransform: any) => impactNumberLabelSelectionStates[2][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactNumberLabelFontSizes(prev => prev.map((size, i) => i === 2 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactNumberLabelSelectionStates[2][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactNumberLabelSelectionStates[2][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactNumberLabelDelete(2)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      // Only recalculate position if popup is not already open for this element
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-number-label-2' || textPopupState.lastTargetElement === 'impact-number-label-2')) {
                        // Popup is already open for this element, just update the target
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-number-label-2',
                          lastTargetElement: 'impact-number-label-2',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        // Calculate position relative to the impact numbers layer
                        const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                        if (targetElement) {
                          const targetRect = targetElement.getBoundingClientRect();
                          const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (targetRect.left - canvasRect.left) - 10;
                            const relativeY = (targetRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-number-label-2',
                              lastTargetElement: 'impact-number-label-2'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactNumber3Label === 'Carbon Footprint Impact' ? (
                      <>
                        Carbon Footprint<br />
                        Impact
                      </>
                    ) : impactNumber3Label.split(' ').length > 3 ? (
                      <>
                        {impactNumber3Label.split(' ').slice(0, 2).join(' ')}<br />
                        {impactNumber3Label.split(' ').slice(2).join(' ')}
                      </>
                    ) : (
                      impactNumber3Label
                    )}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color={impactNumber3ValueColor}
                  align={impactNumber3ValueAlignment}
                  fontFamily={impactNumber3ValueFontFamily}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight break-words"
                  style={{
                    fontSize: `${impactNumber3ValueFontSize}px`,
                    color: impactNumber3ValueColor,
                    textAlign: impactNumber3ValueAlignment,
                    lineHeight: '1.1',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '200px' // Fixed constraint to prevent layout pushing
                  }}
                  isSelected={impactNumber3ValueSelectionState.isTitleSelected}
                  transform={impactNumber3ValueSelectionState.titleTransform}
                  onClick={(e: React.MouseEvent) => {
                    deselectAllOtherElements('impact-number-3-value');
                    impactNumber3ValueSelectionHandlers.handleTitleClick(e);
                  }}
                  onTextChange={handleImpactNumber3ValueChange}
                  onSizeChange={(newTransform: any) => impactNumber3ValueSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                  onChangeSize={(fontSize: number) => setImpactNumber3ValueFontSize(fontSize)}
                  onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                    impactNumber3ValueSelectionHandlers.handleTitleDragStart?.(e, element);
                  }}
                  useFixedWidth={false}
                  onResizeStart={impactNumber3ValueSelectionHandlers.handleTitleResizeStart}
                  onDeleteText={handleImpactNumber3ValueDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    // Only recalculate position if popup is not already open for this element
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-number-3-value' || textPopupState.lastTargetElement === 'impact-number-3-value')) {
                      // Popup is already open for this element, just update the target
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-number-3-value',
                        lastTargetElement: 'impact-number-3-value',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      // Calculate position relative to the impact numbers layer
                      const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                      if (targetElement) {
                        const targetRect = targetElement.getBoundingClientRect();
                        const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (targetRect.left - canvasRect.left) - 10;
                          const relativeY = (targetRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'impact-number-3-value',
                            lastTargetElement: 'impact-number-3-value'
                          });
                        }
                      }
                    }
                  }}
                >
                  {impactNumber3Value}
                </FigmaText>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200"></div>

              {/* Impact Number 4 */}
              <div className="flex items-start justify-between py-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <IconBlock
                      iconName="Shield"
                      size={16}
                      color="#000000"
                    />
                  </div>
                  <FigmaText
                    variant="body"
                    color={impactNumberLabelColors[3]}
                    align={impactNumberLabelAlignments[3]}
                    fontFamily={impactNumberLabelFontFamilies[3]}
                    className="text-xs leading-tight break-words"
                    style={{
                      fontSize: `${impactNumberLabelFontSizes[3]}px`,
                      color: impactNumberLabelColors[3],
                      textAlign: impactNumberLabelAlignments[3],
                      lineHeight: '1.25',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactNumberLabelSelectionStates[3][0].isTitleSelected}
                    transform={impactNumberLabelSelectionStates[3][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-number-label-3');
                      impactNumberLabelSelectionStates[3][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactNumberLabelChange(3, newText)}
                    onSizeChange={(newTransform: any) => impactNumberLabelSelectionStates[3][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactNumberLabelFontSizes(prev => prev.map((size, i) => i === 3 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactNumberLabelSelectionStates[3][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactNumberLabelSelectionStates[3][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactNumberLabelDelete(3)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      // Only recalculate position if popup is not already open for this element
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-number-label-3' || textPopupState.lastTargetElement === 'impact-number-label-3')) {
                        // Popup is already open for this element, just update the target
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-number-label-3',
                          lastTargetElement: 'impact-number-label-3',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        // Calculate position relative to the impact numbers layer
                        const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                        if (targetElement) {
                          const targetRect = targetElement.getBoundingClientRect();
                          const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (targetRect.left - canvasRect.left) - 10;
                            const relativeY = (targetRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-number-label-3',
                              lastTargetElement: 'impact-number-label-3'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactNumber4Label.split(' ').length > 3 ? (
                      <>
                        {impactNumber4Label.split(' ').slice(0, 2).join(' ')}<br />
                        {impactNumber4Label.split(' ').slice(2).join(' ')}
                      </>
                    ) : (
                      impactNumber4Label
                    )}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color={impactNumber4ValueColor}
                  align={impactNumber4ValueAlignment}
                  fontFamily={impactNumber4ValueFontFamily}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight break-words"
                  style={{
                    fontSize: `${impactNumber4ValueFontSize}px`,
                    color: impactNumber4ValueColor,
                    textAlign: impactNumber4ValueAlignment,
                    lineHeight: '1.1',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '200px' // Fixed constraint to prevent layout pushing
                  }}
                  isSelected={impactNumber4ValueSelectionState.isTitleSelected}
                  transform={impactNumber4ValueSelectionState.titleTransform}
                  onClick={(e: React.MouseEvent) => {
                    deselectAllOtherElements('impact-number-4-value');
                    impactNumber4ValueSelectionHandlers.handleTitleClick(e);
                  }}
                  onTextChange={handleImpactNumber4ValueChange}
                  onSizeChange={(newTransform: any) => impactNumber4ValueSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                  onChangeSize={(fontSize: number) => setImpactNumber4ValueFontSize(fontSize)}
                  onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                    impactNumber4ValueSelectionHandlers.handleTitleDragStart?.(e, element);
                  }}
                  useFixedWidth={false}
                  onResizeStart={impactNumber4ValueSelectionHandlers.handleTitleResizeStart}
                  onDeleteText={handleImpactNumber4ValueDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    // Only recalculate position if popup is not already open for this element
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-number-4-value' || textPopupState.lastTargetElement === 'impact-number-4-value')) {
                      // Popup is already open for this element, just update the target
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-number-4-value',
                        lastTargetElement: 'impact-number-4-value',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      // Calculate position relative to the impact numbers layer
                      const targetElement = document.querySelector('.impact-sustainability-metrics-layout .impact-numbers-layer');
                      if (targetElement) {
                        const targetRect = targetElement.getBoundingClientRect();
                        const canvasContainer = targetElement.closest('.impact-sustainability-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (targetRect.left - canvasRect.left) - 10;
                          const relativeY = (targetRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'impact-number-4-value',
                            lastTargetElement: 'impact-number-4-value'
                          });
                        }
                      }
                    }
                  }}
                >
                  {impactNumber4Value}
                </FigmaText>
              </div>
            </div>
        </div>
      )}

      {/* Text Popup */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          onChangeSize={(fontSize: number) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              setDescriptionFontSize(fontSize);
            } else if (target?.startsWith('legend-label-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendLabelFontSizes(prev => prev.map((size, i) => i === index ? fontSize : size));
            } else if (target?.startsWith('legend-description-')) {
              const index = parseInt(target.split('-')[3]);
              setLegendDescriptionFontSizes(prev => prev.map((size, i) => i === index ? fontSize : size));
            } else if (target?.startsWith('impact-number-label-')) {
              const index = parseInt(target.split('-')[3]);
              setImpactNumberLabelFontSizes(prev => prev.map((size, i) => i === index ? fontSize : size));
            } else if (target === 'impact-number-3-value') {
              setImpactNumber3ValueFontSize(fontSize);
            } else if (target === 'impact-number-4-value') {
              setImpactNumber4ValueFontSize(fontSize);
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueFontSizes(prev => prev.map((size, i) => i === index ? fontSize : size));
            } else if (target?.startsWith('impact-label-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactLabelFontSizes(prev => prev.map((size, i) => i === index ? fontSize : size));
            }
          }}
          onChangeFont={(fontFamily: string) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              setDescriptionFontFamily(fontFamily);
            } else if (target?.startsWith('legend-label-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendLabelFontFamilies(prev => prev.map((family, i) => i === index ? fontFamily : family));
            } else if (target?.startsWith('legend-description-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendDescriptionFontFamilies(prev => prev.map((family, i) => i === index ? fontFamily : family));
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueFontFamilies(prev => prev.map((family, i) => i === index ? fontFamily : family));
            } else if (target === 'impact-number-3-value') {
              setImpactNumber3ValueFontFamily(fontFamily);
            } else if (target === 'impact-number-4-value') {
              setImpactNumber4ValueFontFamily(fontFamily);
            } else if (target?.startsWith('impact-number-label-')) {
              const index = parseInt(target.split('-')[3]);
              setImpactNumberLabelFontFamilies(prev => prev.map((family, i) => i === index ? fontFamily : family));
            }
          }}
          onChangeColor={(color: string) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              setCurrentDescriptionColor(color);
            } else if (target?.startsWith('legend-label-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendLabelColors(prev => prev.map((c, i) => i === index ? color : c));
            } else if (target?.startsWith('legend-description-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendDescriptionColors(prev => prev.map((c, i) => i === index ? color : c));
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueColors(prev => prev.map((c, i) => i === index ? color : c));
            } else if (target === 'impact-number-3-value') {
              setImpactNumber3ValueColor(color);
            } else if (target === 'impact-number-4-value') {
              setImpactNumber4ValueColor(color);
            } else if (target?.startsWith('impact-number-label-')) {
              const index = parseInt(target.split('-')[3]);
              setImpactNumberLabelColors(prev => prev.map((c, i) => i === index ? color : c));
            }
          }}
          onChangeAlignment={(alignment: 'left' | 'center' | 'right') => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              setCurrentDescriptionAlignment(alignment);
            } else if (target?.startsWith('legend-label-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendLabelAlignments(prev => prev.map((a, i) => i === index ? alignment : a));
            } else if (target?.startsWith('legend-description-')) {
              const index = parseInt(target.split('-')[2]);
              setLegendDescriptionAlignments(prev => prev.map((a, i) => i === index ? alignment : a));
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueAlignments(prev => prev.map((a, i) => i === index ? alignment : a));
            } else if (target === 'impact-number-3-value') {
              setImpactNumber3ValueAlignment(alignment);
            } else if (target === 'impact-number-4-value') {
              setImpactNumber4ValueAlignment(alignment);
            } else if (target?.startsWith('impact-number-label-')) {
              const index = parseInt(target.split('-')[3]);
              setImpactNumberLabelAlignments(prev => prev.map((a, i) => i === index ? alignment : a));
            }
          }}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target?.startsWith('legend-label-')) {
              const index = parseInt(target.split('-')[2]);
              handleLegendLabelDelete(index);
            } else if (target?.startsWith('legend-description-')) {
              const index = parseInt(target.split('-')[3]);
              handleLegendDescriptionDelete(index);
            } else if (target?.startsWith('impact-number-label-')) {
              const index = parseInt(target.split('-')[3]);
              handleImpactNumberLabelDelete(index);
            } else if (target === 'impact-number-3-value') {
              handleImpactNumber3ValueDelete();
            } else if (target === 'impact-number-4-value') {
              handleImpactNumber4ValueDelete();
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              handleImpactValueDelete(index);
            } else if (target?.startsWith('impact-label-')) {
              const index = parseInt(target.split('-')[2]);
              handleImpactLabelDelete(index);
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </section>
    </CanvasOverlayProvider>
  );
}

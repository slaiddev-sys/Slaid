import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import type { ImageBlockProps } from '../../blocks/ImageBlock';

export interface MarketSizeAnalysisProps {
  /**
   * Main title for the market analysis
   */
  title?: string;
  
  /**
   * Description text that appears on the right side
   */
  description?: string;
  
  /**
   * Market size data for TAM, SAM, SOM
   */
  marketData?: {
    tam: {
      value: string;
      label: string;
      description: string;
      color?: string;
    };
    sam: {
      value: string;
      label: string;
      description: string;
      color?: string;
    };
    som: {
      value: string;
      label: string;
      description: string;
      color?: string;
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
     * Show/hide market circles (TAM/SAM/SOM)
     */
    showCircles?: boolean;
    /**
     * Show/hide market specifications
     */
    showSpecs?: boolean;
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
  
  // TAM/SAM/SOM styling props
  tamLabelFontSize?: number;
  tamLabelFontFamily?: string;
  tamLabelColor?: string;
  tamLabelAlignment?: 'left' | 'center' | 'right';
  tamValueFontSize?: number;
  tamValueFontFamily?: string;
  tamValueColor?: string;
  tamValueAlignment?: 'left' | 'center' | 'right';
  
  samLabelFontSize?: number;
  samLabelFontFamily?: string;
  samLabelColor?: string;
  samLabelAlignment?: 'left' | 'center' | 'right';
  samValueFontSize?: number;
  samValueFontFamily?: string;
  samValueColor?: string;
  samValueAlignment?: 'left' | 'center' | 'right';
  
  somLabelFontSize?: number;
  somLabelFontFamily?: string;
  somLabelColor?: string;
  somLabelAlignment?: 'left' | 'center' | 'right';
  somValueFontSize?: number;
  somValueFontFamily?: string;
  somValueColor?: string;
  somValueAlignment?: 'left' | 'center' | 'right';
  
  // Spec text styling props
  specDescriptionFontSize?: number;
  specDescriptionFontFamily?: string;
  specDescriptionColor?: string;
  specDescriptionAlignment?: 'left' | 'center' | 'right';
  specValueFontSize?: number;
  specValueFontFamily?: string;
  specValueColor?: string;
  specValueAlignment?: 'left' | 'center' | 'right';
  
  // Spec label styling props
  specLabelFontFamily?: string;
  specLabelColor?: string;
  specLabelAlignment?: 'left' | 'center' | 'right';

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  tamLabelTransform?: { x: number; y: number };
  tamValueTransform?: { x: number; y: number };
  samLabelTransform?: { x: number; y: number };
  samValueTransform?: { x: number; y: number };
  somLabelTransform?: { x: number; y: number };
  somValueTransform?: { x: number; y: number };
}

/**
 * Market Size Analysis Layout
 * 
 * A two-column layout for market analysis with TAM/SAM/SOM visualization.
 * Left side shows title and concentric circles chart, right side shows description and specifications.
 */
export default function Market_SizeAnalysis({
  title = 'Market Size',
  description = 'Our initial focus is on underserved industrial and municipal sectors in high-growth regions. With a clear product-market fit and scalable deployment model, we\'re positioned to capture a strong share of a rapidly growing multi-billion dollar opportunity.',
  marketData = {
    tam: {
      value: '$4.5B',
      label: 'TAM',
      description: 'Global CleanTech Market'
    },
    sam: {
      value: '$2B', 
      label: 'SAM',
      description: 'B2B Waste-to-Energy Systems in Target Sectors'
    },
    som: {
      value: '$876M',
      label: 'SOM', 
      description: 'Initial Target Market'
    }
  },
  layout = {
    columnSizes: [6, 6],
    showTitle: true,
    showDescription: true,
    showCircles: true,
    showSpecs: true
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
  
  // TAM/SAM/SOM styling props
  tamLabelFontSize = 10,
  tamLabelFontFamily = 'font-helvetica-neue',
  tamLabelColor = '#ffffff',
  tamLabelAlignment = 'center',
  tamValueFontSize = 48,
  tamValueFontFamily = 'font-helvetica-neue',
  tamValueColor = '#ffffff',
  tamValueAlignment = 'center',
  
  samLabelFontSize = 10,
  samLabelFontFamily = 'font-helvetica-neue',
  samLabelColor = '#ffffff',
  samLabelAlignment = 'center',
  samValueFontSize = 48,
  samValueFontFamily = 'font-helvetica-neue',
  samValueColor = '#ffffff',
  samValueAlignment = 'center',
  
  somLabelFontSize = 10,
  somLabelFontFamily = 'font-helvetica-neue',
  somLabelColor = '#ffffff',
  somLabelAlignment = 'center',
  somValueFontSize = 32,
  somValueFontFamily = 'font-helvetica-neue',
  somValueColor = '#ffffff',
  somValueAlignment = 'center',
  
  // Spec text styling props
  specDescriptionFontSize = 10,
  specDescriptionFontFamily = 'font-helvetica-neue',
  specDescriptionColor = '#6b7280',
  specDescriptionAlignment = 'left',
  specValueFontSize = 48,
  specValueFontFamily = 'font-helvetica-neue',
  specValueColor = '#6b7280',
  specValueAlignment = 'right',
  
  // Spec label styling props
  specLabelFontFamily = 'font-helvetica-neue',
  specLabelColor = '#374151',
  specLabelAlignment = 'left',
  
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  tamLabelTransform: savedTamLabelTransform,
  tamValueTransform: savedTamValueTransform,
  samLabelTransform: savedSamLabelTransform,
  samValueTransform: savedSamValueTransform,
  somLabelTransform: savedSomLabelTransform,
  somValueTransform: savedSomValueTransform
}: MarketSizeAnalysisProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  
  // Market data state for interactive editing
  const [currentMarketData, setCurrentMarketData] = useState(marketData);

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  useEffect(() => {
    setCurrentMarketData(marketData);
  }, [marketData]);

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

  // TAM/SAM/SOM prop synchronization
  useEffect(() => { setTamLabelFontSize(tamLabelFontSize); }, [tamLabelFontSize]);
  useEffect(() => { setTamLabelFontFamily(tamLabelFontFamily); }, [tamLabelFontFamily]);
  useEffect(() => { setTamLabelColor(tamLabelColor); }, [tamLabelColor]);
  useEffect(() => { setTamLabelAlignment(tamLabelAlignment); }, [tamLabelAlignment]);
  useEffect(() => { setTamValueFontSize(tamValueFontSize); }, [tamValueFontSize]);
  useEffect(() => { setTamValueFontFamily(tamValueFontFamily); }, [tamValueFontFamily]);
  useEffect(() => { setTamValueColor(tamValueColor); }, [tamValueColor]);
  useEffect(() => { setTamValueAlignment(tamValueAlignment); }, [tamValueAlignment]);
  
  useEffect(() => { setSamLabelFontSize(samLabelFontSize); }, [samLabelFontSize]);
  useEffect(() => { setSamLabelFontFamily(samLabelFontFamily); }, [samLabelFontFamily]);
  useEffect(() => { setSamLabelColor(samLabelColor); }, [samLabelColor]);
  useEffect(() => { setSamLabelAlignment(samLabelAlignment); }, [samLabelAlignment]);
  useEffect(() => { setSamValueFontSize(samValueFontSize); }, [samValueFontSize]);
  useEffect(() => { setSamValueFontFamily(samValueFontFamily); }, [samValueFontFamily]);
  useEffect(() => { setSamValueColor(samValueColor); }, [samValueColor]);
  useEffect(() => { setSamValueAlignment(samValueAlignment); }, [samValueAlignment]);
  
  useEffect(() => { setSomLabelFontSize(somLabelFontSize); }, [somLabelFontSize]);
  useEffect(() => { setSomLabelFontFamily(somLabelFontFamily); }, [somLabelFontFamily]);
  useEffect(() => { setSomLabelColor(somLabelColor); }, [somLabelColor]);
  useEffect(() => { setSomLabelAlignment(somLabelAlignment); }, [somLabelAlignment]);
  useEffect(() => { setSomValueFontSize(somValueFontSize); }, [somValueFontSize]);
  useEffect(() => { setSomValueFontFamily(somValueFontFamily); }, [somValueFontFamily]);
  useEffect(() => { setSomValueColor(somValueColor); }, [somValueColor]);
  useEffect(() => { setSomValueAlignment(somValueAlignment); }, [somValueAlignment]);

  // Spec text prop synchronization
  useEffect(() => { setSpecDescriptionFontSize(specDescriptionFontSize); }, [specDescriptionFontSize]);
  useEffect(() => { setSpecDescriptionFontFamily(specDescriptionFontFamily); }, [specDescriptionFontFamily]);
  useEffect(() => { setSpecDescriptionColor(specDescriptionColor); }, [specDescriptionColor]);
  useEffect(() => { setSpecDescriptionAlignment(specDescriptionAlignment); }, [specDescriptionAlignment]);
  useEffect(() => { setSpecValueFontSize(specValueFontSize); }, [specValueFontSize]);
  useEffect(() => { setSpecValueFontFamily(specValueFontFamily); }, [specValueFontFamily]);
  useEffect(() => { setSpecValueColor(specValueColor); }, [specValueColor]);
  useEffect(() => { setSpecValueAlignment(specValueAlignment); }, [specValueAlignment]);

  // Spec label prop synchronization
  useEffect(() => { setSpecLabelFontFamily(specLabelFontFamily); }, [specLabelFontFamily]);
  useEffect(() => { setSpecLabelColor(specLabelColor); }, [specLabelColor]);
  useEffect(() => { setSpecLabelAlignment(specLabelAlignment); }, [specLabelAlignment]);

  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);

  // TAM/SAM/SOM styling state
  const [tamLabelFontSizeState, setTamLabelFontSize] = useState(tamLabelFontSize);
  const [tamLabelFontFamilyState, setTamLabelFontFamily] = useState(tamLabelFontFamily);
  const [tamLabelColorState, setTamLabelColor] = useState(tamLabelColor);
  const [tamLabelAlignmentState, setTamLabelAlignment] = useState<'left' | 'center' | 'right'>(tamLabelAlignment);
  const [tamValueFontSizeState, setTamValueFontSize] = useState(tamValueFontSize);
  const [tamValueFontFamilyState, setTamValueFontFamily] = useState(tamValueFontFamily);
  const [tamValueColorState, setTamValueColor] = useState(tamValueColor);
  const [tamValueAlignmentState, setTamValueAlignment] = useState<'left' | 'center' | 'right'>(tamValueAlignment);
  const [samLabelFontSizeState, setSamLabelFontSize] = useState(samLabelFontSize);
  const [samLabelFontFamilyState, setSamLabelFontFamily] = useState(samLabelFontFamily);
  const [samLabelColorState, setSamLabelColor] = useState(samLabelColor);
  const [samLabelAlignmentState, setSamLabelAlignment] = useState<'left' | 'center' | 'right'>(samLabelAlignment);
  const [samValueFontSizeState, setSamValueFontSize] = useState(samValueFontSize);
  const [samValueFontFamilyState, setSamValueFontFamily] = useState(samValueFontFamily);
  const [samValueColorState, setSamValueColor] = useState(samValueColor);
  const [samValueAlignmentState, setSamValueAlignment] = useState<'left' | 'center' | 'right'>(samValueAlignment);
  const [somLabelFontSizeState, setSomLabelFontSize] = useState(somLabelFontSize);
  const [somLabelFontFamilyState, setSomLabelFontFamily] = useState(somLabelFontFamily);
  const [somLabelColorState, setSomLabelColor] = useState(somLabelColor);
  const [somLabelAlignmentState, setSomLabelAlignment] = useState<'left' | 'center' | 'right'>(somLabelAlignment);
  const [somValueFontSizeState, setSomValueFontSize] = useState(somValueFontSize);
  const [somValueFontFamilyState, setSomValueFontFamily] = useState(somValueFontFamily);
  const [somValueColorState, setSomValueColor] = useState(somValueColor);
  const [somValueAlignmentState, setSomValueAlignment] = useState<'left' | 'center' | 'right'>(somValueAlignment);
  
  // Specification text styling
  const [specDescriptionFontSizeState, setSpecDescriptionFontSize] = useState(specDescriptionFontSize);
  const [specDescriptionFontFamilyState, setSpecDescriptionFontFamily] = useState(specDescriptionFontFamily);
  const [specDescriptionColorState, setSpecDescriptionColor] = useState(specDescriptionColor);
  const [specDescriptionAlignmentState, setSpecDescriptionAlignment] = useState<'left' | 'center' | 'right'>(specDescriptionAlignment);
  const [specValueFontSizeState, setSpecValueFontSize] = useState(specValueFontSize);
  const [specValueFontFamilyState, setSpecValueFontFamily] = useState(specValueFontFamily);
  const [specValueColorState, setSpecValueColor] = useState(specValueColor);
  const [specValueAlignmentState, setSpecValueAlignment] = useState<'left' | 'center' | 'right'>(specValueAlignment);
  const [specLabelFontFamilyState, setSpecLabelFontFamily] = useState(specLabelFontFamily);
  const [specLabelColorState, setSpecLabelColor] = useState(specLabelColor);
  const [specLabelAlignmentState, setSpecLabelAlignment] = useState<'left' | 'center' | 'right'>(specLabelAlignment);

  // Text selection handlers with saved transforms
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });

  // Individual selection hooks for TAM/SAM/SOM elements with transforms
  const [tamLabelState, tamLabelHandlers] = useFigmaSelection({
    initialTitleTransform: savedTamLabelTransform || { x: 0, y: 0 },
    onUpdate: (updates: any) => {
      if (onUpdate && updates.titleTransform) {
        onUpdate({ tamLabelTransform: updates.titleTransform });
      }
    }
  });
  
  const [tamValueState, tamValueHandlers] = useFigmaSelection({
    initialTitleTransform: savedTamValueTransform || { x: 0, y: 0 },
    onUpdate: (updates: any) => {
      if (onUpdate && updates.titleTransform) {
        onUpdate({ tamValueTransform: updates.titleTransform });
      }
    }
  });
  
  const [samLabelState, samLabelHandlers] = useFigmaSelection({
    initialTitleTransform: savedSamLabelTransform || { x: 0, y: 0 },
    onUpdate: (updates: any) => {
      if (onUpdate && updates.titleTransform) {
        onUpdate({ samLabelTransform: updates.titleTransform });
      }
    }
  });
  
  const [samValueState, samValueHandlers] = useFigmaSelection({
    initialTitleTransform: savedSamValueTransform || { x: 0, y: 0 },
    onUpdate: (updates: any) => {
      if (onUpdate && updates.titleTransform) {
        onUpdate({ samValueTransform: updates.titleTransform });
      }
    }
  });
  
  const [somLabelState, somLabelHandlers] = useFigmaSelection({
    initialTitleTransform: savedSomLabelTransform || { x: 0, y: 0 },
    onUpdate: (updates: any) => {
      if (onUpdate && updates.titleTransform) {
        onUpdate({ somLabelTransform: updates.titleTransform });
      }
    }
  });
  
  const [somValueState, somValueHandlers] = useFigmaSelection({
    initialTitleTransform: savedSomValueTransform || { x: 0, y: 0 },
    onUpdate: (updates: any) => {
      if (onUpdate && updates.titleTransform) {
        onUpdate({ somValueTransform: updates.titleTransform });
      }
    }
  });
  
  // Selection states for specification elements
  const [tamSpecLabelSelected, setTamSpecLabelSelected] = useState(false);
  const [tamSpecDescSelected, setTamSpecDescSelected] = useState(false);
  const [tamSpecValueSelected, setTamSpecValueSelected] = useState(false);
  const [samSpecLabelSelected, setSamSpecLabelSelected] = useState(false);
  const [samSpecDescSelected, setSamSpecDescSelected] = useState(false);
  const [samSpecValueSelected, setSamSpecValueSelected] = useState(false);
  const [somSpecLabelSelected, setSomSpecLabelSelected] = useState(false);
  const [somSpecDescSelected, setSomSpecDescSelected] = useState(false);
  const [somSpecValueSelected, setSomSpecValueSelected] = useState(false);

  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as 'title' | 'description' | 'tam-label' | 'tam-value' | 'sam-label' | 'sam-value' | 'som-label' | 'som-value' | 'tam-spec-desc' | 'tam-spec-value' | 'sam-spec-desc' | 'sam-spec-value' | 'som-spec-desc' | 'som-spec-value' | null,
    lastTargetElement: null as 'title' | 'description' | 'tam-label' | 'tam-value' | 'sam-label' | 'sam-value' | 'som-label' | 'som-value' | 'tam-spec-desc' | 'tam-spec-value' | 'sam-spec-desc' | 'sam-spec-value' | 'som-spec-desc' | 'som-spec-value' | null
  });

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

  const handleDescriptionTextChange = (newText: string) => {
    setCurrentDescription(newText);
    if (onUpdate) {
      onUpdate({ description: newText });
    }
  };

  // Market data text change handlers
  const handleMarketDataChange = (section: 'tam' | 'sam' | 'som', field: 'label' | 'value' | 'description', newText: string) => {
    setCurrentMarketData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: newText
      }
    }));
    if (onUpdate) {
      // Update the marketData structure properly
      const updatedMarketData = {
        ...currentMarketData,
        [section]: {
          ...currentMarketData[section],
          [field]: newText
        }
      };
      onUpdate({ marketData: updatedMarketData });
    }
  };

  const deselectAllMarketElements = () => {
    // Deselect TAM/SAM/SOM elements using new selection handlers
    tamLabelHandlers.handleClickOutside();
    tamValueHandlers.handleClickOutside();
    samLabelHandlers.handleClickOutside();
    samValueHandlers.handleClickOutside();
    somLabelHandlers.handleClickOutside();
    somValueHandlers.handleClickOutside();
    
    // Keep spec element deselection for now
    setTamSpecLabelSelected(false);
    setTamSpecDescSelected(false);
    setTamSpecValueSelected(false);
    setSamSpecLabelSelected(false);
    setSamSpecDescSelected(false);
    setSamSpecValueSelected(false);
    setSomSpecLabelSelected(false);
    setSomSpecDescSelected(false);
    setSomSpecValueSelected(false);
  };

  // Selection handlers for market data elements
  const handleMarketElementClick = (element: string) => {
    // Deselect all other elements first
    deselectAllMarketElements();
    textSelectionHandlers.handleTitleClick(undefined, false);
    textSelectionHandlers.handleDescriptionClick(undefined, false);

    // Select the clicked element using new handlers
    switch (element) {
      case 'tam-label':
        tamLabelHandlers.handleTitleClick();
        break;
      case 'tam-value':
        tamValueHandlers.handleTitleClick();
        break;
      case 'sam-label':
        samLabelHandlers.handleTitleClick();
        break;
      case 'sam-value':
        samValueHandlers.handleTitleClick();
        break;
      case 'som-label':
        somLabelHandlers.handleTitleClick();
        break;
      case 'som-value':
        somValueHandlers.handleTitleClick();
        break;
      case 'tam-spec-label':
        setTamSpecLabelSelected(true);
        break;
      case 'tam-spec-desc':
        setTamSpecDescSelected(true);
        break;
      case 'tam-spec-value':
        setTamSpecValueSelected(true);
        break;
      case 'sam-spec-label':
        setSamSpecLabelSelected(true);
        break;
      case 'sam-spec-desc':
        setSamSpecDescSelected(true);
        break;
      case 'sam-spec-value':
        setSamSpecValueSelected(true);
        break;
      case 'som-spec-label':
        setSomSpecLabelSelected(true);
        break;
      case 'som-spec-desc':
        setSomSpecDescSelected(true);
        break;
      case 'som-spec-value':
        setSomSpecValueSelected(true);
        break;
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
    textSelectionHandlers.handleTitleDelete();
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    textSelectionHandlers.handleDescriptionDelete();
  };

  // Size change handlers for transforms
  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Custom drag handlers that update popup position
  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    textSelectionHandlers.handleTitleDragStart(e, element);
  };

  const handleDescriptionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    textSelectionHandlers.handleDescriptionDragStart(e, element);
  };

  // Update popup position when text is being dragged
  useEffect(() => {
    if (textPopupState.isOpen && textPopupState.targetElement) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      let transform = null;
      let isDragging = false;
      let wasDragging = false;

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
      
      prevDraggingRef.current = {
        isTitleDragging: textSelectionState.isTitleDragging || false,
        isDescriptionDragging: textSelectionState.isDescriptionDragging || false
      };
    }
  }, [textSelectionState.titleTransform, textSelectionState.descriptionTransform, textSelectionState.isTitleDragging, textSelectionState.isDescriptionDragging, textPopupState.isOpen, textPopupState.targetElement, textPopupState.lastTargetElement]);

  // Global click handler to close popup and deselect text
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (!target.closest('[data-text-popup]') && 
        !target.closest('.figma-text') && 
        !target.closest('.text-selection-handle')) {
      setTextPopupState(prev => ({ ...prev, isOpen: false }));
      textSelectionHandlers.handleTitleClick(undefined, false);
      textSelectionHandlers.handleDescriptionClick(undefined, false);
      // Deselect all market data elements
      deselectAllMarketElements();
    }
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
    // For responsive mode, still apply containment to prevent layout influence
    overflow: 'visible',
    contain: 'layout style',
    width: '100%',
    height: '100vh',
    minHeight: '100vh',
  };

  // Base classes for market layout
  const containerClasses = useFixedDimensions 
    ? `market-size-analysis px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `market-size-analysis px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `market-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  // Calculate column classes
  const [leftCols, rightCols] = layout.columnSizes || [6, 6];
  const leftColClass = `w-full lg:w-${leftCols}/12`;
  const rightColClass = `w-full lg:w-${rightCols}/12`;

  const content = (
    <section 
      className={`${containerClasses} flex flex-col`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      <div className="flex h-full">
        {/* Left Column - Title and Chart */}
        <div className={`${leftColClass} flex flex-col justify-start pr-8 relative`}>
          {/* Title Section */}
          {layout.showTitle && (
            <div className="absolute top-0 left-0" style={{ width: '400px' }}>
              <div 
                className="title-layer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '400px',
                  zIndex: 10,
                  overflow: 'visible',
                  contain: 'none'
                }}
              >
                <FigmaText
                  variant="title"
                  color={currentTitleColor}
                  align={currentTitleAlignment}
                  fontFamily={titleFontFamilyState}
                  className="text-2xl lg:text-3xl xl:text-4xl font-normal leading-none tracking-tight text-gray-900 font-helvetica-neue text-left break-words overflow-wrap-anywhere whitespace-normal"
                  containerClassName="max-w-full"
                  style={{
                    fontSize: `${titleFontSizeState}px`,
                    color: currentTitleColor,
                    textAlign: currentTitleAlignment,
                    lineHeight: '1.0',
                    letterSpacing: '-0.025em',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '100%'
                  }}
                  isSelected={textSelectionState.isTitleSelected}
                  transform={textSelectionState.titleTransform}
                  onClick={(e) => {
                    e.stopPropagation();
                    deselectAllMarketElements();
                    textSelectionHandlers.handleTitleClick(e, true);
                  }}
                  onTextChange={handleTitleTextChange}
                  onSizeChange={handleTitleSizeChange}
                  onChangeSize={handleTitleChangeSize}
                  onChangeFont={handleTitleChangeFont}
                  onDragStart={handleTitleDragStart}
                  onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                  onDeleteText={handleTitleDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const titleElement = document.querySelector('.market-size-analysis .title-layer');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.market-size-analysis') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (titleRect.left - canvasRect.left) - 10;
                        const relativeY = (titleRect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: titleFontSize,
                          currentFontFamily: titleFontFamily,
                          targetElement: 'title',
                          lastTargetElement: 'title'
                        });
                      }
                    }
                  }}>
                  {currentTitle}
                </FigmaText>
              </div>
            </div>
          )}

          {/* Market Chart - Concentric Circles */}
          {layout.showCircles && (
            <div className="flex-1 flex items-center justify-center pt-16">
              <div className="relative w-88 h-88" style={{ width: '21rem', height: '21rem' }}>
          {/* TAM - Outer Circle (bottom-aligned) */}
                <div className="absolute bottom-0 left-0 rounded-full flex items-start justify-center pt-8" style={{ width: '21rem', height: '21rem', backgroundColor: currentMarketData.tam.color || '#A1B7FF' }}>
                  <div className="text-center">
                <div className="tam-label-layer mb-1" style={{ marginLeft: '50px' }}>
                  <FigmaText
                    variant="body"
                    color={tamLabelColor}
                    align={tamLabelAlignment}
                    fontFamily={tamLabelFontFamilyState}
                    className="text-white text-[10px] font-bold break-words overflow-wrap-anywhere whitespace-normal"
                    containerClassName="max-w-full"
                    style={{
                      fontSize: `${tamLabelFontSizeState}px`,
                      color: tamLabelColorState,
                      textAlign: 'center',
                      lineHeight: '1.2',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%'
                    }}
                    isSelected={tamLabelState.isTitleSelected}
                    transform={tamLabelState.titleTransform}
                    onDragStart={tamLabelHandlers.handleTitleDragStart}
                    onResizeStart={tamLabelHandlers.handleTitleResizeStart}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarketElementClick('tam-label');
                    }}
                    onTextChange={(newText) => handleMarketDataChange('tam', 'label', newText)}
                    onChangeSize={(fontSize) => {
                      setTamLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ tamLabelFontSize: fontSize });
              }
                      if (onUpdate) {
                        onUpdate({ tamLabelFontSize: fontSize });
                      }
                    }}
                    onChangeFont={(fontFamily) => {
                      setTamLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ tamLabelFontFamily: fontFamily });
              }
                      if (onUpdate) {
                        onUpdate({ tamLabelFontFamily: fontFamily });
                      }
                    }}
                    onChangeColor={(color) => {
                      setTamLabelColor(color);
              if (onUpdate) {
                onUpdate({ tamLabelColor: color });
              }
                      if (onUpdate) {
                        onUpdate({ tamLabelColor: color });
                      }
                    }}
                    onChangeAlignment={(alignment) => {
                      setTamLabelAlignment(alignment);
                      if (onUpdate) {
                        onUpdate({ tamLabelAlignment: alignment });
                      }
                    }}
                    onDeleteText={() => handleMarketDataChange('tam', 'label', '')}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        const tamLabelElement = document.querySelector('.market-size-analysis .tam-label-layer');
                        if (tamLabelElement) {
                          const tamLabelRect = tamLabelElement.getBoundingClientRect();
                          const canvasContainer = tamLabelElement.closest('.market-size-analysis') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (tamLabelRect.left - canvasRect.left) - 10;
                            const relativeY = (tamLabelRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: tamLabelFontSize,
                              currentFontFamily: tamLabelFontFamily,
                              targetElement: 'tam-label',
                              lastTargetElement: 'tam-label'
                            });
                          }
                        }
                      }}>
                    {currentMarketData.tam.label}
                  </FigmaText>
                </div>
                    <div className="tam-value-layer">
                      <FigmaText
                        variant="title"
                        color={tamValueColor}
                        align={tamValueAlignment}
                        fontFamily={tamValueFontFamilyState}
                        className="text-white text-3xl font-normal break-words overflow-wrap-anywhere whitespace-normal"
                        containerClassName="max-w-full"
                        style={{
                          fontSize: `${tamValueFontSizeState}px`,
                          color: tamValueColorState,
                          textAlign: 'center',
                          lineHeight: '1.0',
                          fontWeight: '100',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={tamValueState.isTitleSelected}
                        transform={tamValueState.titleTransform}
                        onDragStart={tamValueHandlers.handleTitleDragStart}
                        onResizeStart={tamValueHandlers.handleTitleResizeStart}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('tam-value');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('tam', 'value', newText)}
                        onChangeSize={(fontSize) => {
                          setTamValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ tamValueFontSize: fontSize });
              }
                          if (onUpdate) {
                            onUpdate({ tamValueFontSize: fontSize });
                          }
                        }}
                        onChangeFont={(fontFamily) => {
                          setTamValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ tamValueFontFamily: fontFamily });
              }
                          if (onUpdate) {
                            onUpdate({ tamValueFontFamily: fontFamily });
                          }
                        }}
                        onChangeColor={(color) => {
                          setTamValueColor(color);
              if (onUpdate) {
                onUpdate({ tamValueColor: color });
              }
                          if (onUpdate) {
                            onUpdate({ tamValueColor: color });
                          }
                        }}
                        onChangeAlignment={(alignment) => {
                          setTamValueAlignment(alignment);
                          if (onUpdate) {
                            onUpdate({ tamValueAlignment: alignment });
                          }
                        }}
                        onDeleteText={() => handleMarketDataChange('tam', 'value', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const tamValueElement = document.querySelector('.market-size-analysis .tam-value-layer');
                          if (tamValueElement) {
                            const tamValueRect = tamValueElement.getBoundingClientRect();
                            const canvasContainer = tamValueElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (tamValueRect.left - canvasRect.left) - 10;
                              const relativeY = (tamValueRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: tamValueFontSize,
                                currentFontFamily: tamValueFontFamily,
                                targetElement: 'tam-value',
                                lastTargetElement: 'tam-value'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.tam.value}
                      </FigmaText>
                    </div>
                  </div>
                </div>
                
                {/* SAM - Middle Circle (bottom-aligned, centered) */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-56 h-56 rounded-full flex items-start justify-center pt-6" style={{ backgroundColor: currentMarketData.sam.color || '#3044E3' }}>
                  <div className="text-center">
                    <div className="sam-label-layer mb-1" style={{ marginLeft: '35px' }}>
                      <FigmaText
                        variant="body"
                        color={samLabelColor}
                        align={samLabelAlignment}
                        fontFamily={samLabelFontFamilyState}
                        className="text-white text-[10px] font-bold break-words overflow-wrap-anywhere whitespace-normal"
                        containerClassName="max-w-full"
                        style={{
                          fontSize: `${samLabelFontSizeState}px`,
                          color: samLabelColorState,
                          textAlign: 'center',
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={samLabelState.isTitleSelected}
                        transform={samLabelState.titleTransform}
                        onDragStart={samLabelHandlers.handleTitleDragStart}
                        onResizeStart={samLabelHandlers.handleTitleResizeStart}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('sam-label');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('sam', 'label', newText)}
                        onChangeSize={(fontSize) => {
                          setSamLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ samLabelFontSize: fontSize });
              }
                          if (onUpdate) {
                            onUpdate({ samLabelFontSize: fontSize });
                          }
                        }}
                        onChangeFont={(fontFamily) => {
                          setSamLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ samLabelFontFamily: fontFamily });
              }
                          if (onUpdate) {
                            onUpdate({ samLabelFontFamily: fontFamily });
                          }
                        }}
                        onChangeColor={(color) => {
                          setSamLabelColor(color);
              if (onUpdate) {
                onUpdate({ samLabelColor: color });
              }
                          if (onUpdate) {
                            onUpdate({ samLabelColor: color });
                          }
                        }}
                        onChangeAlignment={(alignment) => {
                          setSamLabelAlignment(alignment);
                          if (onUpdate) {
                            onUpdate({ samLabelAlignment: alignment });
                          }
                        }}
                        onDeleteText={() => handleMarketDataChange('sam', 'label', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const samLabelElement = document.querySelector('.market-size-analysis .sam-label-layer');
                          if (samLabelElement) {
                            const samLabelRect = samLabelElement.getBoundingClientRect();
                            const canvasContainer = samLabelElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (samLabelRect.left - canvasRect.left) - 10;
                              const relativeY = (samLabelRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: samLabelFontSize,
                                currentFontFamily: samLabelFontFamily,
                                targetElement: 'sam-label',
                                lastTargetElement: 'sam-label'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.sam.label}
                      </FigmaText>
                    </div>
                    <div className="sam-value-layer">
                      <FigmaText
                        variant="title"
                        color={samValueColor}
                        align={samValueAlignment}
                        fontFamily={samValueFontFamilyState}
                        className="text-white text-3xl font-normal break-words overflow-wrap-anywhere whitespace-normal"
                        containerClassName="max-w-full"
                        style={{
                          fontSize: `${samValueFontSizeState}px`,
                          color: samValueColorState,
                          textAlign: 'center',
                          lineHeight: '1.0',
                          fontWeight: '100',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={samValueState.isTitleSelected}
                        transform={samValueState.titleTransform}
                        onDragStart={samValueHandlers.handleTitleDragStart}
                        onResizeStart={samValueHandlers.handleTitleResizeStart}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('sam-value');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('sam', 'value', newText)}
                        onChangeSize={(fontSize) => {
                          setSamValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ samValueFontSize: fontSize });
              }
                          if (onUpdate) {
                            onUpdate({ samValueFontSize: fontSize });
                          }
                        }}
                        onChangeFont={(fontFamily) => {
                          setSamValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ samValueFontFamily: fontFamily });
              }
                          if (onUpdate) {
                            onUpdate({ samValueFontFamily: fontFamily });
                          }
                        }}
                        onChangeColor={(color) => {
                          setSamValueColor(color);
              if (onUpdate) {
                onUpdate({ samValueColor: color });
              }
                          if (onUpdate) {
                            onUpdate({ samValueColor: color });
                          }
                        }}
                        onChangeAlignment={(alignment) => {
                          setSamValueAlignment(alignment);
                          if (onUpdate) {
                            onUpdate({ samValueAlignment: alignment });
                          }
                        }}
                        onDeleteText={() => handleMarketDataChange('sam', 'value', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const samValueElement = document.querySelector('.market-size-analysis .sam-value-layer');
                          if (samValueElement) {
                            const samValueRect = samValueElement.getBoundingClientRect();
                            const canvasContainer = samValueElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (samValueRect.left - canvasRect.left) - 10;
                              const relativeY = (samValueRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: samValueFontSize,
                                currentFontFamily: samValueFontFamily,
                                targetElement: 'sam-value',
                                lastTargetElement: 'sam-value'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.sam.value}
                      </FigmaText>
                    </div>
                  </div>
                </div>
                
                {/* SOM - Inner Circle (bottom-aligned, centered) */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full flex items-start justify-center pt-6" style={{ backgroundColor: currentMarketData.som.color || '#1C00BB' }}>
                  <div className="text-center">
                    <div className="som-label-layer mb-0.5" style={{ marginLeft: '30px' }}>
                      <FigmaText
                        variant="body"
                        color={somLabelColor}
                        align={somLabelAlignment}
                        fontFamily={somLabelFontFamilyState}
                        className="text-white text-[10px] font-bold break-words overflow-wrap-anywhere whitespace-normal"
                        containerClassName="max-w-full"
                        style={{
                          fontSize: `${somLabelFontSizeState}px`,
                          color: somLabelColorState,
                          textAlign: 'center',
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={somLabelState.isTitleSelected}
                        transform={somLabelState.titleTransform}
                        onDragStart={somLabelHandlers.handleTitleDragStart}
                        onResizeStart={somLabelHandlers.handleTitleResizeStart}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('som-label');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('som', 'label', newText)}
                        onChangeSize={(fontSize) => {
                          setSomLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ somLabelFontSize: fontSize });
              }
                          if (onUpdate) {
                            onUpdate({ somLabelFontSize: fontSize });
                          }
                        }}
                        onChangeFont={(fontFamily) => {
                          setSomLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ somLabelFontFamily: fontFamily });
              }
                          if (onUpdate) {
                            onUpdate({ somLabelFontFamily: fontFamily });
                          }
                        }}
                        onChangeColor={(color) => {
                          setSomLabelColor(color);
              if (onUpdate) {
                onUpdate({ somLabelColor: color });
              }
                          if (onUpdate) {
                            onUpdate({ somLabelColor: color });
                          }
                        }}
                        onChangeAlignment={(alignment) => {
                          setSomLabelAlignment(alignment);
                          if (onUpdate) {
                            onUpdate({ somLabelAlignment: alignment });
                          }
                        }}
                        onDeleteText={() => handleMarketDataChange('som', 'label', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const somLabelElement = document.querySelector('.market-size-analysis .som-label-layer');
                          if (somLabelElement) {
                            const somLabelRect = somLabelElement.getBoundingClientRect();
                            const canvasContainer = somLabelElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (somLabelRect.left - canvasRect.left) - 10;
                              const relativeY = (somLabelRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: somLabelFontSize,
                                currentFontFamily: somLabelFontFamily,
                                targetElement: 'som-label',
                                lastTargetElement: 'som-label'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.som.label}
                      </FigmaText>
                    </div>
                    <div className="som-value-layer">
                      <FigmaText
                        variant="title"
                        color={somValueColor}
                        align={somValueAlignment}
                        fontFamily={somValueFontFamilyState}
                        className="text-white text-2xl font-normal break-words overflow-wrap-anywhere whitespace-normal"
                        containerClassName="max-w-full"
                        style={{
                          fontSize: `${somValueFontSizeState}px`,
                          color: somValueColorState,
                          textAlign: 'center',
                          lineHeight: '1.0',
                          fontWeight: '100',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={somValueState.isTitleSelected}
                        transform={somValueState.titleTransform}
                        onDragStart={somValueHandlers.handleTitleDragStart}
                        onResizeStart={somValueHandlers.handleTitleResizeStart}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('som-value');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('som', 'value', newText)}
                        onChangeSize={(fontSize) => {
                          setSomValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ somValueFontSize: fontSize });
              }
                          if (onUpdate) {
                            onUpdate({ somValueFontSize: fontSize });
                          }
                        }}
                        onChangeFont={(fontFamily) => {
                          setSomValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ somValueFontFamily: fontFamily });
              }
                          if (onUpdate) {
                            onUpdate({ somValueFontFamily: fontFamily });
                          }
                        }}
                        onChangeColor={(color) => {
                          setSomValueColor(color);
              if (onUpdate) {
                onUpdate({ somValueColor: color });
              }
                          if (onUpdate) {
                            onUpdate({ somValueColor: color });
                          }
                        }}
                        onChangeAlignment={(alignment) => {
                          setSomValueAlignment(alignment);
                          if (onUpdate) {
                            onUpdate({ somValueAlignment: alignment });
                          }
                        }}
                        onDeleteText={() => handleMarketDataChange('som', 'value', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const somValueElement = document.querySelector('.market-size-analysis .som-value-layer');
                          if (somValueElement) {
                            const somValueRect = somValueElement.getBoundingClientRect();
                            const canvasContainer = somValueElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (somValueRect.left - canvasRect.left) - 10;
                              const relativeY = (somValueRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: somValueFontSize,
                                currentFontFamily: somValueFontFamily,
                                targetElement: 'som-value',
                                lastTargetElement: 'som-value'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.som.value}
                      </FigmaText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Description and Specifications */}
        <div className={`${rightColClass} flex flex-col justify-start pl-8`}>
          {/* Description Section */}
          {layout.showDescription && currentDescription && (
            <div className="mb-8">
              <div 
                className="description-layer"
                style={{
                  position: 'relative',
                  width: 'auto',
                  maxWidth: '100%',
                  zIndex: 10,
                  overflow: 'visible',
                  contain: 'none'
                }}
              >
                <FigmaText
                  variant="body"
                  color={currentDescriptionColor}
                  align={currentDescriptionAlignment}
                  fontFamily={descriptionFontFamilyState}
                  className="text-gray-600 font-helvetica-neue leading-relaxed break-words overflow-wrap-anywhere whitespace-normal"
                  containerClassName="max-w-full"
                  style={{
                    fontSize: `${descriptionFontSizeState}px`,
                    color: currentDescriptionColor,
                    textAlign: currentDescriptionAlignment,
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '100%'
                  }}
                  isSelected={textSelectionState.isDescriptionSelected}
                  transform={textSelectionState.descriptionTransform}
                  onClick={(e) => {
                    e.stopPropagation();
                    deselectAllMarketElements();
                    textSelectionHandlers.handleDescriptionClick(e, true);
                  }}
                  onTextChange={handleDescriptionTextChange}
                  onSizeChange={handleDescriptionSizeChange}
                  onChangeSize={handleDescriptionChangeSize}
                  onChangeFont={handleDescriptionChangeFont}
                  onDragStart={handleDescriptionDragStart}
                  onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                  onDeleteText={handleDescriptionDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const descriptionElement = document.querySelector('.market-size-analysis .description-layer');
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.market-size-analysis') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                        const relativeY = (descriptionRect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: descriptionFontSize,
                          currentFontFamily: descriptionFontFamily,
                          targetElement: 'description',
                          lastTargetElement: 'description'
                        });
                      }
                    }
                  }}>
                  {currentDescription}
                </FigmaText>
              </div>
            </div>
          )}

          {/* Market Specifications */}
          {layout.showSpecs && (
            <div className="space-y-6 mt-8">
              {/* TAM Specification */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-baseline mb-1">
                    <svg width="16" height="12" viewBox="0 0 16 12" className="w-4 h-3 transform -rotate-45 mr-2">
                      <path d="M14 1H5L1 6L5 11H14C14.5523 11 15 10.5523 15 10V2C15 1.44772 14.5523 1 14 1Z" 
                            fill="none" 
                            stroke={currentMarketData.tam.color || "#A1B7FF"} 
                            strokeWidth="1.5"/>
                      <circle cx="12" cy="6" r="1" fill="none" stroke={currentMarketData.tam.color || "#A1B7FF"} strokeWidth="1.5"/>
                    </svg>
                    <div className="tam-spec-label-layer">
                      <FigmaText
                        variant="body"
                        color={specLabelColorState}
                        align={specLabelAlignmentState}
                        fontFamily={specLabelFontFamilyState}
                        className="text-xs font-bold text-gray-700 break-words"
                        style={{
                          fontSize: '12px',
                          color: specLabelColorState,
                          textAlign: 'left',
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={tamSpecLabelSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('tam-spec-label');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('tam', 'label', newText)}
                        onChangeSize={() => {}} // Fixed size for spec labels
                        onChangeFont={(fontFamily) => setSpecLabelFontFamily(fontFamily)}
                        onChangeColor={(color) => setSpecLabelColor(color)}
                        onChangeAlignment={(alignment) => setSpecLabelAlignment(alignment)}
                        onDeleteText={() => handleMarketDataChange('tam', 'label', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const tamSpecLabelElement = document.querySelector('.market-size-analysis .tam-spec-label-layer');
                          if (tamSpecLabelElement) {
                            const tamSpecLabelRect = tamSpecLabelElement.getBoundingClientRect();
                            const canvasContainer = tamSpecLabelElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (tamSpecLabelRect.left - canvasRect.left) - 10;
                              const relativeY = (tamSpecLabelRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: specLabelFontFamily,
                                targetElement: 'tam-spec-label',
                                lastTargetElement: 'tam-spec-label'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.tam.label}
                      </FigmaText>
                  </div>
                </div>
                  <div className="tam-spec-desc-layer">
                    <FigmaText
                      variant="body"
                      color={specDescriptionColorState}
                      align={specDescriptionAlignmentState}
                      fontFamily={specDescriptionFontFamilyState}
                      className="text-gray-600 break-words"
                      style={{
                        fontSize: `${specDescriptionFontSizeState}px`,
                        color: specDescriptionColorState,
                        textAlign: 'left',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      isSelected={tamSpecDescSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarketElementClick('tam-spec-desc');
                      }}
                      onTextChange={(newText) => handleMarketDataChange('tam', 'description', newText)}
                      onChangeSize={(fontSize) => {
                        setSpecDescriptionFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specDescriptionFontSize: fontSize });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionFontSize: fontSize });
                        }
                      }}
                      onChangeFont={(fontFamily) => {
                        setSpecDescriptionFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specDescriptionFontFamily: fontFamily });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionFontFamily: fontFamily });
                        }
                      }}
                      onChangeColor={(color) => {
                        setSpecDescriptionColor(color);
              if (onUpdate) {
                onUpdate({ specDescriptionColor: color });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionColor: color });
                        }
                      }}
                      onChangeAlignment={(alignment) => {
                        setSpecDescriptionAlignment(alignment);
                        if (onUpdate) {
                          onUpdate({ specDescriptionAlignment: alignment });
                        }
                      }}
                      onDeleteText={() => handleMarketDataChange('tam', 'description', '')}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        const tamSpecDescElement = document.querySelector('.market-size-analysis .tam-spec-desc-layer');
                        if (tamSpecDescElement) {
                          const tamSpecDescRect = tamSpecDescElement.getBoundingClientRect();
                          const canvasContainer = tamSpecDescElement.closest('.market-size-analysis') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (tamSpecDescRect.left - canvasRect.left) - 10;
                            const relativeY = (tamSpecDescRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: specDescriptionFontFamily,
                              targetElement: 'tam-spec-desc',
                              lastTargetElement: 'tam-spec-desc'
                            });
                          }
                        }
                      }}>
                      {currentMarketData.tam.description}
                    </FigmaText>
                  </div>
                </div>
                <div className="tam-spec-value-layer flex-shrink-0">
                  <FigmaText
                    variant="title"
                    color={specValueColorState}
                    align={specValueAlignmentState}
                    fontFamily={specValueFontFamilyState}
                    className="text-4xl font-normal text-gray-500 break-words"
                    style={{
                      fontSize: `${specValueFontSizeState}px`,
                      color: specValueColorState,
                      textAlign: 'right',
                      fontWeight: '100',
                      lineHeight: '1.0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={tamSpecValueSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarketElementClick('tam-spec-value');
                    }}
                    onTextChange={(newText) => handleMarketDataChange('tam', 'value', newText)}
                    onChangeSize={(fontSize) => {
                      setSpecValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specValueFontSize: fontSize });
              }
                      if (onUpdate) {
                        onUpdate({ specValueFontSize: fontSize });
                      }
                    }}
                    onChangeFont={(fontFamily) => {
                      setSpecValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specValueFontFamily: fontFamily });
              }
                      if (onUpdate) {
                        onUpdate({ specValueFontFamily: fontFamily });
                      }
                    }}
                    onChangeColor={(color) => {
                      setSpecValueColor(color);
              if (onUpdate) {
                onUpdate({ specValueColor: color });
              }
                      if (onUpdate) {
                        onUpdate({ specValueColor: color });
                      }
                    }}
                    onChangeAlignment={(alignment) => {
                      setSpecValueAlignment(alignment);
                      if (onUpdate) {
                        onUpdate({ specValueAlignment: alignment });
                      }
                    }}
                    onDeleteText={() => handleMarketDataChange('tam', 'value', '')}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      const tamSpecValueElement = document.querySelector('.market-size-analysis .tam-spec-value-layer');
                      if (tamSpecValueElement) {
                        const tamSpecValueRect = tamSpecValueElement.getBoundingClientRect();
                        const canvasContainer = tamSpecValueElement.closest('.market-size-analysis') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (tamSpecValueRect.left - canvasRect.left) - 10;
                          const relativeY = (tamSpecValueRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: specValueFontFamily,
                            targetElement: 'tam-spec-value',
                            lastTargetElement: 'tam-spec-value'
                          });
                        }
                      }
                    }}>
                    {currentMarketData.tam.value}
                  </FigmaText>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200"></div>

              {/* SAM Specification */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-baseline mb-1">
                    <svg width="16" height="12" viewBox="0 0 16 12" className="w-4 h-3 transform -rotate-45 mr-2">
                      <path d="M14 1H5L1 6L5 11H14C14.5523 11 15 10.5523 15 10V2C15 1.44772 14.5523 1 14 1Z" 
                            fill="none" 
                            stroke={currentMarketData.sam.color || "#3044E3"} 
                            strokeWidth="1.5"/>
                      <circle cx="12" cy="6" r="1" fill="none" stroke={currentMarketData.sam.color || "#3044E3"} strokeWidth="1.5"/>
                    </svg>
                    <div className="sam-spec-label-layer">
                      <FigmaText
                        variant="body"
                        color={specLabelColorState}
                        align={specLabelAlignmentState}
                        fontFamily={specLabelFontFamilyState}
                        className="text-xs font-bold text-gray-700 break-words"
                        style={{
                          fontSize: '12px',
                          color: specLabelColorState,
                          textAlign: 'left',
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={samSpecLabelSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('sam-spec-label');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('sam', 'label', newText)}
                        onChangeSize={() => {}} // Fixed size for spec labels
                        onChangeFont={(fontFamily) => setSpecLabelFontFamily(fontFamily)}
                        onChangeColor={(color) => setSpecLabelColor(color)}
                        onChangeAlignment={(alignment) => setSpecLabelAlignment(alignment)}
                        onDeleteText={() => handleMarketDataChange('sam', 'label', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const samSpecLabelElement = document.querySelector('.market-size-analysis .sam-spec-label-layer');
                          if (samSpecLabelElement) {
                            const samSpecLabelRect = samSpecLabelElement.getBoundingClientRect();
                            const canvasContainer = samSpecLabelElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (samSpecLabelRect.left - canvasRect.left) - 10;
                              const relativeY = (samSpecLabelRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: specLabelFontFamily,
                                targetElement: 'sam-spec-label',
                                lastTargetElement: 'sam-spec-label'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.sam.label}
                      </FigmaText>
                  </div>
                </div>
                  <div className="sam-spec-desc-layer">
                    <FigmaText
                      variant="body"
                      color={specDescriptionColorState}
                      align={specDescriptionAlignmentState}
                      fontFamily={specDescriptionFontFamilyState}
                      className="text-gray-600 break-words"
                      style={{
                        fontSize: `${specDescriptionFontSizeState}px`,
                        color: specDescriptionColorState,
                        textAlign: 'left',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      isSelected={samSpecDescSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarketElementClick('sam-spec-desc');
                      }}
                      onTextChange={(newText) => handleMarketDataChange('sam', 'description', newText)}
                      onChangeSize={(fontSize) => {
                        setSpecDescriptionFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specDescriptionFontSize: fontSize });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionFontSize: fontSize });
                        }
                      }}
                      onChangeFont={(fontFamily) => {
                        setSpecDescriptionFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specDescriptionFontFamily: fontFamily });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionFontFamily: fontFamily });
                        }
                      }}
                      onChangeColor={(color) => {
                        setSpecDescriptionColor(color);
              if (onUpdate) {
                onUpdate({ specDescriptionColor: color });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionColor: color });
                        }
                      }}
                      onChangeAlignment={(alignment) => {
                        setSpecDescriptionAlignment(alignment);
                        if (onUpdate) {
                          onUpdate({ specDescriptionAlignment: alignment });
                        }
                      }}
                      onDeleteText={() => handleMarketDataChange('sam', 'description', '')}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        const samSpecDescElement = document.querySelector('.market-size-analysis .sam-spec-desc-layer');
                        if (samSpecDescElement) {
                          const samSpecDescRect = samSpecDescElement.getBoundingClientRect();
                          const canvasContainer = samSpecDescElement.closest('.market-size-analysis') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (samSpecDescRect.left - canvasRect.left) - 10;
                            const relativeY = (samSpecDescRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: specDescriptionFontFamily,
                              targetElement: 'sam-spec-desc',
                              lastTargetElement: 'sam-spec-desc'
                            });
                          }
                        }
                      }}>
                      {currentMarketData.sam.description}
                    </FigmaText>
                  </div>
                </div>
                <div className="sam-spec-value-layer flex-shrink-0">
                  <FigmaText
                    variant="title"
                    color={specValueColorState}
                    align={specValueAlignmentState}
                    fontFamily={specValueFontFamilyState}
                    className="text-4xl font-normal text-gray-500 break-words"
                    style={{
                      fontSize: `${specValueFontSizeState}px`,
                      color: specValueColorState,
                      textAlign: 'right',
                      fontWeight: '100',
                      lineHeight: '1.0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={samSpecValueSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarketElementClick('sam-spec-value');
                    }}
                    onTextChange={(newText) => handleMarketDataChange('sam', 'value', newText)}
                    onChangeSize={(fontSize) => {
                      setSpecValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specValueFontSize: fontSize });
              }
                      if (onUpdate) {
                        onUpdate({ specValueFontSize: fontSize });
                      }
                    }}
                    onChangeFont={(fontFamily) => {
                      setSpecValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specValueFontFamily: fontFamily });
              }
                      if (onUpdate) {
                        onUpdate({ specValueFontFamily: fontFamily });
                      }
                    }}
                    onChangeColor={(color) => {
                      setSpecValueColor(color);
              if (onUpdate) {
                onUpdate({ specValueColor: color });
              }
                      if (onUpdate) {
                        onUpdate({ specValueColor: color });
                      }
                    }}
                    onChangeAlignment={(alignment) => {
                      setSpecValueAlignment(alignment);
                      if (onUpdate) {
                        onUpdate({ specValueAlignment: alignment });
                      }
                    }}
                    onDeleteText={() => handleMarketDataChange('sam', 'value', '')}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      const samSpecValueElement = document.querySelector('.market-size-analysis .sam-spec-value-layer');
                      if (samSpecValueElement) {
                        const samSpecValueRect = samSpecValueElement.getBoundingClientRect();
                        const canvasContainer = samSpecValueElement.closest('.market-size-analysis') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (samSpecValueRect.left - canvasRect.left) - 10;
                          const relativeY = (samSpecValueRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: specValueFontFamily,
                            targetElement: 'sam-spec-value',
                            lastTargetElement: 'sam-spec-value'
                          });
                        }
                      }
                    }}>
                    {currentMarketData.sam.value}
                  </FigmaText>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200"></div>

              {/* SOM Specification */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-baseline mb-1">
                    <svg width="16" height="12" viewBox="0 0 16 12" className="w-4 h-3 transform -rotate-45 mr-2">
                      <path d="M14 1H5L1 6L5 11H14C14.5523 11 15 10.5523 15 10V2C15 1.44772 14.5523 1 14 1Z" 
                            fill="none" 
                            stroke={currentMarketData.som.color || "#1C00BB"} 
                            strokeWidth="1.5"/>
                      <circle cx="12" cy="6" r="1" fill="none" stroke={currentMarketData.som.color || "#1C00BB"} strokeWidth="1.5"/>
                    </svg>
                    <div className="som-spec-label-layer">
                      <FigmaText
                        variant="body"
                        color={specLabelColorState}
                        align={specLabelAlignmentState}
                        fontFamily={specLabelFontFamilyState}
                        className="text-xs font-bold text-gray-700 break-words"
                        style={{
                          fontSize: '12px',
                          color: specLabelColorState,
                          textAlign: 'left',
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        }}
                        isSelected={somSpecLabelSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarketElementClick('som-spec-label');
                        }}
                        onTextChange={(newText) => handleMarketDataChange('som', 'label', newText)}
                        onChangeSize={() => {}} // Fixed size for spec labels
                        onChangeFont={(fontFamily) => setSpecLabelFontFamily(fontFamily)}
                        onChangeColor={(color) => setSpecLabelColor(color)}
                        onChangeAlignment={(alignment) => setSpecLabelAlignment(alignment)}
                        onDeleteText={() => handleMarketDataChange('som', 'label', '')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const somSpecLabelElement = document.querySelector('.market-size-analysis .som-spec-label-layer');
                          if (somSpecLabelElement) {
                            const somSpecLabelRect = somSpecLabelElement.getBoundingClientRect();
                            const canvasContainer = somSpecLabelElement.closest('.market-size-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (somSpecLabelRect.left - canvasRect.left) - 10;
                              const relativeY = (somSpecLabelRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: specLabelFontFamily,
                                targetElement: 'som-spec-label',
                                lastTargetElement: 'som-spec-label'
                              });
                            }
                          }
                        }}>
                        {currentMarketData.som.label}
                      </FigmaText>
                  </div>
                </div>
                  <div className="som-spec-desc-layer">
                    <FigmaText
                      variant="body"
                      color={specDescriptionColorState}
                      align={specDescriptionAlignmentState}
                      fontFamily={specDescriptionFontFamilyState}
                      className="text-gray-600 break-words"
                      style={{
                        fontSize: `${specDescriptionFontSizeState}px`,
                        color: specDescriptionColorState,
                        textAlign: 'left',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      isSelected={somSpecDescSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarketElementClick('som-spec-desc');
                      }}
                      onTextChange={(newText) => handleMarketDataChange('som', 'description', newText)}
                      onChangeSize={(fontSize) => {
                        setSpecDescriptionFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specDescriptionFontSize: fontSize });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionFontSize: fontSize });
                        }
                      }}
                      onChangeFont={(fontFamily) => {
                        setSpecDescriptionFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specDescriptionFontFamily: fontFamily });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionFontFamily: fontFamily });
                        }
                      }}
                      onChangeColor={(color) => {
                        setSpecDescriptionColor(color);
              if (onUpdate) {
                onUpdate({ specDescriptionColor: color });
              }
                        if (onUpdate) {
                          onUpdate({ specDescriptionColor: color });
                        }
                      }}
                      onChangeAlignment={(alignment) => {
                        setSpecDescriptionAlignment(alignment);
                        if (onUpdate) {
                          onUpdate({ specDescriptionAlignment: alignment });
                        }
                      }}
                      onDeleteText={() => handleMarketDataChange('som', 'description', '')}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        const somSpecDescElement = document.querySelector('.market-size-analysis .som-spec-desc-layer');
                        if (somSpecDescElement) {
                          const somSpecDescRect = somSpecDescElement.getBoundingClientRect();
                          const canvasContainer = somSpecDescElement.closest('.market-size-analysis') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (somSpecDescRect.left - canvasRect.left) - 10;
                            const relativeY = (somSpecDescRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: specDescriptionFontFamily,
                              targetElement: 'som-spec-desc',
                              lastTargetElement: 'som-spec-desc'
                            });
                          }
                        }
                      }}>
                      {currentMarketData.som.description}
                    </FigmaText>
                  </div>
                </div>
                <div className="som-spec-value-layer flex-shrink-0">
                  <FigmaText
                    variant="title"
                    color={specValueColorState}
                    align={specValueAlignmentState}
                    fontFamily={specValueFontFamilyState}
                    className="text-4xl font-normal text-gray-500 break-words"
                    style={{
                      fontSize: `${specValueFontSizeState}px`,
                      color: specValueColorState,
                      textAlign: 'right',
                      fontWeight: '100',
                      lineHeight: '1.0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={somSpecValueSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarketElementClick('som-spec-value');
                    }}
                    onTextChange={(newText) => handleMarketDataChange('som', 'value', newText)}
                    onChangeSize={(fontSize) => {
                      setSpecValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specValueFontSize: fontSize });
              }
                      if (onUpdate) {
                        onUpdate({ specValueFontSize: fontSize });
                      }
                    }}
                    onChangeFont={(fontFamily) => {
                      setSpecValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specValueFontFamily: fontFamily });
              }
                      if (onUpdate) {
                        onUpdate({ specValueFontFamily: fontFamily });
                      }
                    }}
                    onChangeColor={(color) => {
                      setSpecValueColor(color);
              if (onUpdate) {
                onUpdate({ specValueColor: color });
              }
                      if (onUpdate) {
                        onUpdate({ specValueColor: color });
                      }
                    }}
                    onChangeAlignment={(alignment) => {
                      setSpecValueAlignment(alignment);
                      if (onUpdate) {
                        onUpdate({ specValueAlignment: alignment });
                      }
                    }}
                    onDeleteText={() => handleMarketDataChange('som', 'value', '')}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      const somSpecValueElement = document.querySelector('.market-size-analysis .som-spec-value-layer');
                      if (somSpecValueElement) {
                        const somSpecValueRect = somSpecValueElement.getBoundingClientRect();
                        const canvasContainer = somSpecValueElement.closest('.market-size-analysis') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (somSpecValueRect.left - canvasRect.left) - 10;
                          const relativeY = (somSpecValueRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: specValueFontFamily,
                            targetElement: 'som-spec-value',
                            lastTargetElement: 'som-spec-value'
                          });
                        }
                      }
                    }}>
                    {currentMarketData.som.value}
                  </FigmaText>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
            } else if (target === 'tam-label') {
              setTamLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ tamLabelFontSize: fontSize });
              }
            } else if (target === 'tam-value') {
              setTamValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ tamValueFontSize: fontSize });
              }
            } else if (target === 'sam-label') {
              setSamLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ samLabelFontSize: fontSize });
              }
            } else if (target === 'sam-value') {
              setSamValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ samValueFontSize: fontSize });
              }
            } else if (target === 'som-label') {
              setSomLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ somLabelFontSize: fontSize });
              }
            } else if (target === 'som-value') {
              setSomValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ somValueFontSize: fontSize });
              }
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              // Spec labels use fixed 12px font size - no change needed
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specDescriptionFontSize: fontSize });
              }
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specValueFontSize: fontSize });
              }
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target === 'tam-label') {
              setTamLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ tamLabelFontFamily: fontFamily });
              }
            } else if (target === 'tam-value') {
              setTamValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ tamValueFontFamily: fontFamily });
              }
            } else if (target === 'sam-label') {
              setSamLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ samLabelFontFamily: fontFamily });
              }
            } else if (target === 'sam-value') {
              setSamValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ samValueFontFamily: fontFamily });
              }
            } else if (target === 'som-label') {
              setSomLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ somLabelFontFamily: fontFamily });
              }
            } else if (target === 'som-value') {
              setSomValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ somValueFontFamily: fontFamily });
              }
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              setSpecLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specLabelFontFamily: fontFamily });
              }
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specDescriptionFontFamily: fontFamily });
              }
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specValueFontFamily: fontFamily });
              }
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target === 'tam-label') {
              setTamLabelColor(color);
              if (onUpdate) {
                onUpdate({ tamLabelColor: color });
              }
            } else if (target === 'tam-value') {
              setTamValueColor(color);
              if (onUpdate) {
                onUpdate({ tamValueColor: color });
              }
            } else if (target === 'sam-label') {
              setSamLabelColor(color);
              if (onUpdate) {
                onUpdate({ samLabelColor: color });
              }
            } else if (target === 'sam-value') {
              setSamValueColor(color);
              if (onUpdate) {
                onUpdate({ samValueColor: color });
              }
            } else if (target === 'som-label') {
              setSomLabelColor(color);
              if (onUpdate) {
                onUpdate({ somLabelColor: color });
              }
            } else if (target === 'som-value') {
              setSomValueColor(color);
              if (onUpdate) {
                onUpdate({ somValueColor: color });
              }
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              setSpecLabelColor(color);
              if (onUpdate) {
                onUpdate({ specLabelColor: color });
              }
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionColor(color);
              if (onUpdate) {
                onUpdate({ specDescriptionColor: color });
              }
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueColor(color);
              if (onUpdate) {
                onUpdate({ specValueColor: color });
              }
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target === 'tam-label') {
              setTamLabelAlignment(alignment);
            } else if (target === 'tam-value') {
              setTamValueAlignment(alignment);
            } else if (target === 'sam-label') {
              setSamLabelAlignment(alignment);
            } else if (target === 'sam-value') {
              setSamValueAlignment(alignment);
            } else if (target === 'som-label') {
              setSomLabelAlignment(alignment);
            } else if (target === 'som-value') {
              setSomValueAlignment(alignment);
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              setSpecLabelAlignment(alignment);
              if (onUpdate) {
                onUpdate({ specLabelAlignment: alignment });
              }
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionAlignment(alignment);
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueAlignment(alignment);
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
            if (target === 'tam-label') return tamLabelColor;
            if (target === 'tam-value') return tamValueColor;
            if (target === 'sam-label') return samLabelColor;
            if (target === 'sam-value') return samValueColor;
            if (target === 'som-label') return somLabelColor;
            if (target === 'som-value') return somValueColor;
            if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') return specLabelColor;
            if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') return specDescriptionColor;
            if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') return specValueColor;
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target === 'tam-label') return tamLabelAlignment;
            if (target === 'tam-value') return tamValueAlignment;
            if (target === 'sam-label') return samLabelAlignment;
            if (target === 'sam-value') return samValueAlignment;
            if (target === 'som-label') return somLabelAlignment;
            if (target === 'som-value') return somValueAlignment;
            if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') return specLabelAlignment;
            if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') return specDescriptionAlignment;
            if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') return specValueAlignment;
            return currentTitleAlignment;
          })()}
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
            } else if (target === 'tam-label') {
              setTamLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ tamLabelFontSize: fontSize });
              }
            } else if (target === 'tam-value') {
              setTamValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ tamValueFontSize: fontSize });
              }
            } else if (target === 'sam-label') {
              setSamLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ samLabelFontSize: fontSize });
              }
            } else if (target === 'sam-value') {
              setSamValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ samValueFontSize: fontSize });
              }
            } else if (target === 'som-label') {
              setSomLabelFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ somLabelFontSize: fontSize });
              }
            } else if (target === 'som-value') {
              setSomValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ somValueFontSize: fontSize });
              }
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              // Spec labels use fixed 12px font size - no change needed
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specDescriptionFontSize: fontSize });
              }
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueFontSize(fontSize);
              if (onUpdate) {
                onUpdate({ specValueFontSize: fontSize });
              }
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target === 'tam-label') {
              setTamLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ tamLabelFontFamily: fontFamily });
              }
            } else if (target === 'tam-value') {
              setTamValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ tamValueFontFamily: fontFamily });
              }
            } else if (target === 'sam-label') {
              setSamLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ samLabelFontFamily: fontFamily });
              }
            } else if (target === 'sam-value') {
              setSamValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ samValueFontFamily: fontFamily });
              }
            } else if (target === 'som-label') {
              setSomLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ somLabelFontFamily: fontFamily });
              }
            } else if (target === 'som-value') {
              setSomValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ somValueFontFamily: fontFamily });
              }
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              setSpecLabelFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specLabelFontFamily: fontFamily });
              }
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specDescriptionFontFamily: fontFamily });
              }
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueFontFamily(fontFamily);
              if (onUpdate) {
                onUpdate({ specValueFontFamily: fontFamily });
              }
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target === 'tam-label') {
              setTamLabelColor(color);
              if (onUpdate) {
                onUpdate({ tamLabelColor: color });
              }
            } else if (target === 'tam-value') {
              setTamValueColor(color);
              if (onUpdate) {
                onUpdate({ tamValueColor: color });
              }
            } else if (target === 'sam-label') {
              setSamLabelColor(color);
              if (onUpdate) {
                onUpdate({ samLabelColor: color });
              }
            } else if (target === 'sam-value') {
              setSamValueColor(color);
              if (onUpdate) {
                onUpdate({ samValueColor: color });
              }
            } else if (target === 'som-label') {
              setSomLabelColor(color);
              if (onUpdate) {
                onUpdate({ somLabelColor: color });
              }
            } else if (target === 'som-value') {
              setSomValueColor(color);
              if (onUpdate) {
                onUpdate({ somValueColor: color });
              }
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              setSpecLabelColor(color);
              if (onUpdate) {
                onUpdate({ specLabelColor: color });
              }
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionColor(color);
              if (onUpdate) {
                onUpdate({ specDescriptionColor: color });
              }
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueColor(color);
              if (onUpdate) {
                onUpdate({ specValueColor: color });
              }
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target === 'tam-label') {
              setTamLabelAlignment(alignment);
            } else if (target === 'tam-value') {
              setTamValueAlignment(alignment);
            } else if (target === 'sam-label') {
              setSamLabelAlignment(alignment);
            } else if (target === 'sam-value') {
              setSamValueAlignment(alignment);
            } else if (target === 'som-label') {
              setSomLabelAlignment(alignment);
            } else if (target === 'som-value') {
              setSomValueAlignment(alignment);
            } else if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') {
              setSpecLabelAlignment(alignment);
              if (onUpdate) {
                onUpdate({ specLabelAlignment: alignment });
              }
            } else if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') {
              setSpecDescriptionAlignment(alignment);
            } else if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') {
              setSpecValueAlignment(alignment);
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
            if (target === 'tam-label') return tamLabelColor;
            if (target === 'tam-value') return tamValueColor;
            if (target === 'sam-label') return samLabelColor;
            if (target === 'sam-value') return samValueColor;
            if (target === 'som-label') return somLabelColor;
            if (target === 'som-value') return somValueColor;
            if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') return specLabelColor;
            if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') return specDescriptionColor;
            if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') return specValueColor;
            return currentTitleColor;
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target === 'tam-label') return tamLabelAlignment;
            if (target === 'tam-value') return tamValueAlignment;
            if (target === 'sam-label') return samLabelAlignment;
            if (target === 'sam-value') return samValueAlignment;
            if (target === 'som-label') return somLabelAlignment;
            if (target === 'som-value') return somValueAlignment;
            if (target === 'tam-spec-label' || target === 'sam-spec-label' || target === 'som-spec-label') return specLabelAlignment;
            if (target === 'tam-spec-desc' || target === 'sam-spec-desc' || target === 'som-spec-desc') return specDescriptionAlignment;
            if (target === 'tam-spec-value' || target === 'sam-spec-value' || target === 'som-spec-value') return specValueAlignment;
            return currentTitleAlignment;
          })()}
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
    </>
  );
}

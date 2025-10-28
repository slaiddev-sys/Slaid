import React, { useState, useEffect } from 'react';
import TextBlock from '../../blocks/TextBlock';
import IconBlock from '../../blocks/IconBlock';
import ImageBlock from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText, TextPopup } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface ImpactImageMetricsProps {
  /**
   * Main title for the impact metrics
   */
  title?: string;
  
  /**
   * Description text that appears on the right side
   */
  description?: string;
  
  /**
   * Image configuration for the left side
   */
  image?: {
    src?: string;
    alt?: string;
    rounded?: boolean | string;
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
     * Show/hide image
     */
    showImage?: boolean;
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

  // Impact styling arrays for persistence
  impactValueFontSizes?: number[];
  impactValueFontFamilies?: string[];
  impactValueColors?: string[];
  impactValueAlignments?: ('left' | 'center' | 'right')[];
  impactLabelFontSizes?: number[];
  impactLabelFontFamilies?: string[];
  impactLabelColors?: string[];
  impactLabelAlignments?: ('left' | 'center' | 'right')[];

  /**
   * Transform props for positional persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  impactValueTransforms?: { x: number; y: number }[];
  impactLabelTransforms?: { x: number; y: number }[];

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved image transform for position persistence
   */
  imageTransform?: { x: number; y: number };
}

/**
 * Impact Image Metrics Layout
 * 
 * A two-column layout for impact metrics with visual emphasis.
 * Left side shows an image, right side shows title, description and impact numbers.
 */
export default function Impact_ImageMetrics({
  title = 'Environmental Impact',
  description = 'Our comprehensive approach to environmental sustainability creates measurable impact across multiple dimensions, driving positive change for our planet.',
  image = {
    src: 'Default-Image-2.png',
    alt: 'Environmental impact visualization',
    rounded: false
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
    showImage: true,
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
  
  // Impact styling arrays for persistence
  impactValueFontSizes = [],
  impactValueFontFamilies = [],
  impactValueColors = [],
  impactValueAlignments = [],
  impactLabelFontSizes = [],
  impactLabelFontFamilies = [],
  impactLabelColors = [],
  impactLabelAlignments = [],
  
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  impactValueTransforms: savedImpactValueTransforms,
  impactLabelTransforms: savedImpactLabelTransforms,
  onUpdate,
  imageTransform: savedImageTransform
}: ImpactImageMetricsProps) {

  // Detect export mode from URL parameters
  const isExportMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('export') === 'true';

  // Simplified rendering for export mode
  if (isExportMode) {
    console.log('📄 Impact_ImageMetrics: Rendering in export mode');
    
    const containerStyle = useFixedDimensions ? {
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`,
    } : {};

    return (
      <div 
        style={{
          ...containerStyle,
          backgroundColor: 'white',
          width: '100%',
          height: '100%',
          minHeight: '495px'
        }}
      >
        <div style={{ display: 'flex', height: '100%', minHeight: '495px' }}>
          {/* Left Column - Image */}
          {layout.showImage && (
            <div style={{
              width: '50%',
              padding: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '0'
            }}>
              <img 
                src={image?.src || '/Default-Image-2.png'} 
                alt={image?.alt || 'Impact visualization'}
                style={{
                  maxWidth: '80%',
                  maxHeight: '80%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  console.log('📄 Image failed to load:', image?.src);
                  // Fallback to a placeholder
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEzMEg3MEwxMDAgNzBaIiBmaWxsPSIjOUI5QkEwIi8+CjxjaXJjbGUgY3g9IjEzMCIgY3k9IjgwIiByPSIxMCIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                }}
              />
            </div>
          )}
          
          {/* Right Column - Content */}
          <div style={{
            width: '50%',
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Title */}
            {layout.showTitle && title && (
              <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#111827',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '24px',
                margin: '0 0 24px 0',
                lineHeight: '1.1'
              }}>
                {title}
              </h1>
            )}
            
            {/* Description */}
            {layout.showDescription && description && (
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '40px',
                margin: '0 0 40px 0',
                lineHeight: '1.6'
              }}>
                {description}
              </p>
            )}
            
            {/* Impact Numbers */}
            {layout.showImpactNumbers && impactNumbers && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '32px',
                marginTop: '8px'
              }}>
                <div style={{ 
                  textAlign: 'left',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: '8px',
                    fontFamily: 'Arial, sans-serif'
                  }}>{impactNumbers.number1.value}</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>{impactNumbers.number1.label}</div>
                </div>
                <div style={{ 
                  textAlign: 'left',
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '8px',
                    fontFamily: 'Arial, sans-serif'
                  }}>{impactNumbers.number2.value}</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>{impactNumbers.number2.label}</div>
                </div>
                <div style={{ 
                  textAlign: 'left',
                  padding: '16px',
                  backgroundColor: '#faf5ff',
                  borderRadius: '8px',
                  border: '1px solid #e9d5ff'
                }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '8px',
                    fontFamily: 'Arial, sans-serif'
                  }}>{impactNumbers.number3.value}</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>{impactNumbers.number3.label}</div>
                </div>
                <div style={{ 
                  textAlign: 'left',
                  padding: '16px',
                  backgroundColor: '#fff7ed',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa'
                }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#ea580c',
                    marginBottom: '8px',
                    fontFamily: 'Arial, sans-serif'
                  }}>{impactNumbers.number4.value}</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.4'
                  }}>{impactNumbers.number4.label}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interactive text state management
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || 'text-gray-900');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || 'text-gray-600');
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
  const [titleSelectionState, titleSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [descriptionSelectionState, descriptionSelectionHandlers] = useFigmaSelection({
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
    targetElement: null as 'title' | 'description' | string | null,
    lastTargetElement: null as 'title' | 'description' | string | null
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

  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
    titleSelectionHandlers.handleClickOutside();
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) {
      onUpdate({ description: '' });
    }
    descriptionSelectionHandlers.handleClickOutside();
  };

  // Impact Numbers interactive text state
  const [impactValues, setImpactValues] = useState([
    typeof impactNumbers?.number1?.value === 'string' ? impactNumbers.number1.value : String(impactNumbers?.number1?.value || '500 tons'),
    typeof impactNumbers?.number2?.value === 'string' ? impactNumbers.number2.value : String(impactNumbers?.number2?.value || '14,000 kWh'),
    typeof impactNumbers?.number3?.value === 'string' ? impactNumbers.number3.value : String(impactNumbers?.number3?.value || '80%'),
    typeof impactNumbers?.number4?.value === 'string' ? impactNumbers.number4.value : String(impactNumbers?.number4?.value || '2.3M kg')
  ]);

  // Impact Labels interactive text state
  const [impactLabels, setImpactLabels] = useState([
    typeof impactNumbers?.number1?.label === 'string' ? impactNumbers.number1.label : String(impactNumbers?.number1?.label || 'CO₂ Emissions Reduced'),
    typeof impactNumbers?.number2?.label === 'string' ? impactNumbers.number2.label : String(impactNumbers?.number2?.label || 'Clean Energy Generated'),
    typeof impactNumbers?.number3?.label === 'string' ? impactNumbers.number3.label : String(impactNumbers?.number3?.label || 'Carbon Footprint Impact'),
    typeof impactNumbers?.number4?.label === 'string' ? impactNumbers.number4.label : String(impactNumbers?.number4?.label || 'Emission Prevention')
  ]);

  // Impact text styling states - use props if available, otherwise defaults
  const [impactValueFontSizesState, setImpactValueFontSizes] = useState(
    impactValueFontSizes.length > 0 ? impactValueFontSizes : [36, 36, 36, 36]
  );
  const [impactLabelFontSizesState, setImpactLabelFontSizes] = useState(
    impactLabelFontSizes.length > 0 ? impactLabelFontSizes : [12, 12, 12, 12]
  );
  const [impactValueFontFamiliesState, setImpactValueFontFamilies] = useState(
    impactValueFontFamilies.length > 0 ? impactValueFontFamilies : ['font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue']
  );
  const [impactLabelFontFamiliesState, setImpactLabelFontFamilies] = useState(
    impactLabelFontFamilies.length > 0 ? impactLabelFontFamilies : ['font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue', 'font-helvetica-neue']
  );
  const [impactValueColorsState, setImpactValueColors] = useState(
    impactValueColors.length > 0 ? impactValueColors : ['#111827', '#111827', '#111827', '#111827']
  );
  const [impactLabelColorsState, setImpactLabelColors] = useState(
    impactLabelColors.length > 0 ? impactLabelColors : ['#6B7280', '#6B7280', '#6B7280', '#6B7280']
  );
  const [impactValueAlignmentsState, setImpactValueAlignments] = useState<('left' | 'center' | 'right')[]>(
    impactValueAlignments.length > 0 ? impactValueAlignments : ['left', 'left', 'left', 'left']
  );
  const [impactLabelAlignmentsState, setImpactLabelAlignments] = useState<('left' | 'center' | 'right')[]>(
    impactLabelAlignments.length > 0 ? impactLabelAlignments : ['left', 'left', 'left', 'left']
  );

  // Sync props with state when they change (CRITICAL for secondary text editing)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  // Impact styling prop synchronization
  useEffect(() => {
    if (impactValueFontSizes.length > 0) {
      setImpactValueFontSizes(impactValueFontSizes);
    }
  }, [JSON.stringify(impactValueFontSizes)]);

  useEffect(() => {
    if (impactLabelFontSizes.length > 0) {
      setImpactLabelFontSizes(impactLabelFontSizes);
    }
  }, [JSON.stringify(impactLabelFontSizes)]);

  useEffect(() => {
    if (impactValueFontFamilies.length > 0) {
      setImpactValueFontFamilies(impactValueFontFamilies);
    }
  }, [JSON.stringify(impactValueFontFamilies)]);

  useEffect(() => {
    if (impactLabelFontFamilies.length > 0) {
      setImpactLabelFontFamilies(impactLabelFontFamilies);
    }
  }, [JSON.stringify(impactLabelFontFamilies)]);

  useEffect(() => {
    if (impactValueColors.length > 0) {
      setImpactValueColors(impactValueColors);
    }
  }, [JSON.stringify(impactValueColors)]);

  useEffect(() => {
    if (impactLabelColors.length > 0) {
      setImpactLabelColors(impactLabelColors);
    }
  }, [JSON.stringify(impactLabelColors)]);

  useEffect(() => {
    if (impactValueAlignments.length > 0) {
      setImpactValueAlignments(impactValueAlignments);
    }
  }, [JSON.stringify(impactValueAlignments)]);

  useEffect(() => {
    if (impactLabelAlignments.length > 0) {
      setImpactLabelAlignments(impactLabelAlignments);
    }
  }, [JSON.stringify(impactLabelAlignments)]);

  useEffect(() => {
    if (impactNumbers) {
      setImpactValues([
        typeof impactNumbers?.number1?.value === 'string' ? impactNumbers.number1.value : String(impactNumbers?.number1?.value || '500 tons'),
        typeof impactNumbers?.number2?.value === 'string' ? impactNumbers.number2.value : String(impactNumbers?.number2?.value || '14,000 kWh'),
        typeof impactNumbers?.number3?.value === 'string' ? impactNumbers.number3.value : String(impactNumbers?.number3?.value || '80%'),
        typeof impactNumbers?.number4?.value === 'string' ? impactNumbers.number4.value : String(impactNumbers?.number4?.value || '2.3M kg')
      ]);
      setImpactLabels([
        typeof impactNumbers?.number1?.label === 'string' ? impactNumbers.number1.label : String(impactNumbers?.number1?.label || 'CO₂ Emissions Reduced'),
        typeof impactNumbers?.number2?.label === 'string' ? impactNumbers.number2.label : String(impactNumbers?.number2?.label || 'Clean Energy Generated'),
        typeof impactNumbers?.number3?.label === 'string' ? impactNumbers.number3.label : String(impactNumbers?.number3?.label || 'Carbon Footprint Impact'),
        typeof impactNumbers?.number4?.label === 'string' ? impactNumbers.number4.label : String(impactNumbers?.number4?.label || 'Emission Prevention')
      ]);
    }
  }, [impactNumbers]);

  // Impact text selection handlers with positional persistence
  const createImpactValueUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      const newTransforms = [...(savedImpactValueTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ impactValueTransforms: newTransforms });
    }
  };

  const createImpactLabelUpdateHandler = (index: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      const newTransforms = [...(savedImpactLabelTransforms || [])];
      newTransforms[index] = updates.titleTransform;
      onUpdate({ impactLabelTransforms: newTransforms });
    }
  };

  const impactValueSelectionStates = [
    useFigmaSelection({
      initialTitleTransform: savedImpactValueTransforms?.[0] || { x: 0, y: 0 },
      onUpdate: createImpactValueUpdateHandler(0)
    }),
    useFigmaSelection({
      initialTitleTransform: savedImpactValueTransforms?.[1] || { x: 0, y: 0 },
      onUpdate: createImpactValueUpdateHandler(1)
    }),
    useFigmaSelection({
      initialTitleTransform: savedImpactValueTransforms?.[2] || { x: 0, y: 0 },
      onUpdate: createImpactValueUpdateHandler(2)
    }),
    useFigmaSelection({
      initialTitleTransform: savedImpactValueTransforms?.[3] || { x: 0, y: 0 },
      onUpdate: createImpactValueUpdateHandler(3)
    })
  ];

  const impactLabelSelectionStates = [
    useFigmaSelection({
      initialTitleTransform: savedImpactLabelTransforms?.[0] || { x: 0, y: 0 },
      onUpdate: createImpactLabelUpdateHandler(0)
    }),
    useFigmaSelection({
      initialTitleTransform: savedImpactLabelTransforms?.[1] || { x: 0, y: 0 },
      onUpdate: createImpactLabelUpdateHandler(1)
    }),
    useFigmaSelection({
      initialTitleTransform: savedImpactLabelTransforms?.[2] || { x: 0, y: 0 },
      onUpdate: createImpactLabelUpdateHandler(2)
    }),
    useFigmaSelection({
      initialTitleTransform: savedImpactLabelTransforms?.[3] || { x: 0, y: 0 },
      onUpdate: createImpactLabelUpdateHandler(3)
    })
  ];

  // Impact text change handlers
  const handleImpactValueChange = (index: number, newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    setImpactValues(prev => prev.map((value, i) => i === index ? safeText : value));
    if (onUpdate) {
      // Update the impactNumbers structure properly
      const numberKey = `number${index + 1}` as 'number1' | 'number2' | 'number3' | 'number4';
      onUpdate({ 
        impactNumbers: {
          ...impactNumbers,
          [numberKey]: {
            ...impactNumbers?.[numberKey],
            value: safeText
          }
        }
      });
    }
  };

  const handleImpactValueDelete = (index: number) => {
    setImpactValues(prev => prev.map((value, i) => i === index ? '' : value));
    impactValueSelectionStates[index][1].handleClickOutside();
  };

  const handleImpactLabelChange = (index: number, newText: string) => {
    const safeText = typeof newText === 'string' ? newText : String(newText);
    setImpactLabels(prev => prev.map((label, i) => i === index ? safeText : label));
    if (onUpdate) {
      // Update the impactNumbers structure properly
      const numberKey = `number${index + 1}` as 'number1' | 'number2' | 'number3' | 'number4';
      onUpdate({ 
        impactNumbers: {
          ...impactNumbers,
          [numberKey]: {
            ...impactNumbers?.[numberKey],
            label: safeText
          }
        }
      });
    }
  };

  const handleImpactLabelDelete = (index: number) => {
    setImpactLabels(prev => prev.map((label, i) => i === index ? '' : label));
    impactLabelSelectionStates[index][1].handleClickOutside();
  };

  // Function to deselect all other text elements when one is selected
  const deselectAllOtherElements = (exceptElement: string) => {
    if (exceptElement !== 'title') titleSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'description') descriptionSelectionHandlers.handleClickOutside();
    
    // Deselect all impact elements except the selected one
    impactValueSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `impact-value-${index}`) handlers.handleClickOutside();
    });
    impactLabelSelectionStates.forEach(([, handlers], index) => {
      if (exceptElement !== `impact-label-${index}`) handlers.handleClickOutside();
    });
  };

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
    
    titleSelectionHandlers.handleClickOutside();
    descriptionSelectionHandlers.handleClickOutside();
    
    // Deselect all impact elements
    impactValueSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    impactLabelSelectionStates.forEach(([, handlers]) => handlers.handleClickOutside());
    
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null
    }));
  };

  // Custom onUpdate handler for image
  const handleImageUpdate = (updates: any) => {
    if (onUpdate) {
      if (updates.imageUrl) {
        onUpdate({ 
          image: { 
            ...image, 
            src: updates.imageUrl 
          } 
        });
      }
      if (updates.imageTransform) {
        onUpdate({ 
          imageTransform: updates.imageTransform
        });
      }
    }
  };

  // Use Figma selection hook for the main image
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialImageUrl: image?.src,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: handleImageUpdate // 🔧 AUTO-UPDATE: Pass custom onUpdate for image object
  });

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    // CRITICAL: Allow internal overflow but let parent clip
    overflow: 'visible',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
  } : {
    // For responsive mode, still apply containment to prevent layout influence
    overflow: 'visible',
    contain: 'layout style',
  };

  // Base classes for impact layout
  const containerClasses = useFixedDimensions 
    ? `impact-image-metrics bg-white ${className}`
    : `impact-image-metrics bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `impact-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  // Calculate column classes
  const [leftCols, rightCols] = layout.columnSizes || [6, 6];
  const leftColClass = `w-full lg:w-${leftCols}/12`;
  const rightColClass = `w-full lg:w-${rightCols}/12`;

  const content = (
    <section 
      className={`${containerClasses} relative flex flex-col impact-image-metrics-layout`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Image with Figma-style Selection - Absolute positioning for free movement */}
        {layout.showImage && (
          <div className="absolute inset-0 z-0" style={{ width: `${(leftCols/12)*100}%` }}>
            <FigmaImage
              src={image.src || 'Default-Image-2.png'}
              alt={image.alt || 'Environmental impact visualization'}
              size="full"
              fit="cover"
              align="center"
              rounded={false}
              fill
              className="w-full h-full object-cover rounded-none"
              containerClassName="w-full h-full"
              state={figmaState}
              handlers={figmaHandlers}
            />
          </div>
        )}

        {/* Title Section - Absolutely positioned and independent */}
        {layout.showTitle && (
          <div 
            className="title-layer absolute pointer-events-auto z-0"
            style={{
              left: `${(leftCols/12)*100 + 5}%`,
              top: '9%',
              width: 'auto',
              zIndex: 0,
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
              className="text-2xl lg:text-3xl xl:text-4xl font-normal leading-none tracking-tight font-helvetica-neue text-left break-words"
              style={{
                fontSize: `${titleFontSizeState}px`,
                color: currentTitleColor,
                textAlign: currentTitleAlignment,
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                maxWidth: '400px' // Fixed constraint to prevent layout pushing
              }}
                isSelected={titleSelectionState.isTitleSelected}
                transform={titleSelectionState.titleTransform}
                onDragStart={titleSelectionHandlers.handleTitleDragStart}
                onResizeStart={titleSelectionHandlers.handleTitleResizeStart}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  titleSelectionHandlers.handleTitleClick(e);
                }}
                onTextChange={handleTitleTextChange}
                onSizeChange={(newTransform: any) => titleSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                onChangeSize={handleTitleChangeSize}
                onChangeFont={handleTitleChangeFont}
                useFixedWidth={false}
                onDeleteText={handleTitleDelete}
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
                    // Calculate position relative to the title element
                    const titleElement = document.querySelector('.impact-image-metrics-layout .title-layer');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.impact-image-metrics-layout') as HTMLElement;
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
                }}
              >
                {currentTitle}
              </FigmaText>
            </div>
          )}

        {/* Description Section - Absolutely positioned and independent */}
        {layout.showDescription && currentDescription && (
          <div 
            className="description-layer absolute pointer-events-auto z-0"
            style={{
              left: `${(leftCols/12)*100 + 5}%`,
              top: '15%',
              width: 'auto',
              zIndex: 0,
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
              fontFamily={descriptionFontFamilyState}
              className="text-gray-600 font-helvetica-neue leading-relaxed break-words"
              style={{
                fontSize: `${descriptionFontSizeState}px`,
                color: currentDescriptionColor,
                textAlign: currentDescriptionAlignment,
                lineHeight: '1.6',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                maxWidth: '300px' // Fixed constraint to wrap text properly
              }}
                isSelected={descriptionSelectionState.isDescriptionSelected}
                transform={descriptionSelectionState.descriptionTransform}
                onDragStart={descriptionSelectionHandlers.handleDescriptionDragStart}
                onResizeStart={descriptionSelectionHandlers.handleDescriptionResizeStart}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  descriptionSelectionHandlers.handleDescriptionClick(e);
                }}
                onTextChange={handleDescriptionTextChange}
                onSizeChange={(newTransform: any) => descriptionSelectionHandlers.handleDescriptionSizeChange?.(newTransform)}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                useFixedWidth={false}
                onDeleteText={handleDescriptionDelete}
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
                    // Calculate position relative to the description element
                    const descriptionElement = document.querySelector('.impact-image-metrics-layout .description-layer');
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.impact-image-metrics-layout') as HTMLElement;
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
                }}
              >
                {currentDescription}
              </FigmaText>
            </div>
          )}

        {/* Impact Numbers - Absolutely positioned and independent */}
        {layout.showImpactNumbers && (
          <div 
            className="absolute z-20 impact-numbers-container"
            style={{ 
              left: `${(leftCols/12)*100 + 5}%`,
              top: '22%',
              width: `${(rightCols/12)*100 - 10}%`,
              maxWidth: `${(rightCols/12)*100 - 10}%`,
              contain: 'layout'
            }}
          >
            <div>
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
                    color="text-gray-600"
                    align={impactLabelAlignmentsState[0]}
                    fontFamily={impactLabelFontFamiliesState[0]}
                    className="text-xs text-gray-600 leading-tight font-helvetica-neue break-words"
                    style={{
                      fontSize: `${impactLabelFontSizesState[0]}px`,
                      color: impactLabelColorsState[0],
                      textAlign: impactLabelAlignmentsState[0],
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactLabelSelectionStates[0][0].isTitleSelected}
                    transform={impactLabelSelectionStates[0][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-label-0');
                      impactLabelSelectionStates[0][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactLabelChange(0, newText)}
                    onSizeChange={(newTransform: any) => impactLabelSelectionStates[0][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactLabelFontSizes(prev => prev.map((size, i) => i === 0 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactLabelSelectionStates[0][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactLabelSelectionStates[0][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactLabelDelete(0)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-label-0' || textPopupState.lastTargetElement === 'impact-label-0')) {
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-label-0',
                          lastTargetElement: 'impact-label-0',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                        if (impactElement) {
                          const impactRect = impactElement.getBoundingClientRect();
                          const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (impactRect.left - canvasRect.left) - 10;
                            const relativeY = (impactRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-label-0',
                              lastTargetElement: 'impact-label-0'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactLabels[0]}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color="text-gray-900"
                  align={impactValueAlignments[0]}
                  fontFamily={impactValueFontFamilies[0]}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight"
                  style={{
                    fontSize: `${impactValueFontSizesState[0]}px`,
                    color: impactValueColorsState[0],
                    textAlign: impactValueAlignmentsState[0],
                    lineHeight: '1.1',
                    whiteSpace: 'nowrap'
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
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-value-0' || textPopupState.lastTargetElement === 'impact-value-0')) {
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-value-0',
                        lastTargetElement: 'impact-value-0',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                      if (impactElement) {
                        const impactRect = impactElement.getBoundingClientRect();
                        const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (impactRect.left - canvasRect.left) - 10;
                          const relativeY = (impactRect.top - canvasRect.top) - 50;
                          
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
                    color="text-gray-600"
                    align={impactLabelAlignments[1]}
                    fontFamily={impactLabelFontFamilies[1]}
                    className="text-xs text-gray-600 leading-tight font-helvetica-neue break-words"
                    style={{
                      fontSize: `${impactLabelFontSizesState[1]}px`,
                      color: impactLabelColorsState[1],
                      textAlign: impactLabelAlignmentsState[1],
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactLabelSelectionStates[1][0].isTitleSelected}
                    transform={impactLabelSelectionStates[1][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-label-1');
                      impactLabelSelectionStates[1][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactLabelChange(1, newText)}
                    onSizeChange={(newTransform: any) => impactLabelSelectionStates[1][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactLabelFontSizes(prev => prev.map((size, i) => i === 1 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactLabelSelectionStates[1][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactLabelSelectionStates[1][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactLabelDelete(1)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-label-1' || textPopupState.lastTargetElement === 'impact-label-1')) {
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-label-1',
                          lastTargetElement: 'impact-label-1',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                        if (impactElement) {
                          const impactRect = impactElement.getBoundingClientRect();
                          const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (impactRect.left - canvasRect.left) - 10;
                            const relativeY = (impactRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-label-1',
                              lastTargetElement: 'impact-label-1'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactLabels[1]}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color="text-gray-900"
                  align={impactValueAlignments[1]}
                  fontFamily={impactValueFontFamilies[1]}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight"
                  style={{
                    fontSize: `${impactValueFontSizesState[1]}px`,
                    color: impactValueColorsState[1],
                    textAlign: impactValueAlignmentsState[1],
                    lineHeight: '1.1',
                    whiteSpace: 'nowrap'
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
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-value-1' || textPopupState.lastTargetElement === 'impact-value-1')) {
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-value-1',
                        lastTargetElement: 'impact-value-1',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                      if (impactElement) {
                        const impactRect = impactElement.getBoundingClientRect();
                        const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (impactRect.left - canvasRect.left) - 10;
                          const relativeY = (impactRect.top - canvasRect.top) - 50;
                          
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
                    color="text-gray-600"
                    align={impactLabelAlignments[2]}
                    fontFamily={impactLabelFontFamilies[2]}
                    className="text-xs text-gray-600 leading-tight font-helvetica-neue break-words"
                    style={{
                      fontSize: `${impactLabelFontSizesState[2]}px`,
                      color: impactLabelColorsState[2],
                      textAlign: impactLabelAlignmentsState[2],
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactLabelSelectionStates[2][0].isTitleSelected}
                    transform={impactLabelSelectionStates[2][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-label-2');
                      impactLabelSelectionStates[2][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactLabelChange(2, newText)}
                    onSizeChange={(newTransform: any) => impactLabelSelectionStates[2][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactLabelFontSizes(prev => prev.map((size, i) => i === 2 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactLabelSelectionStates[2][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactLabelSelectionStates[2][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactLabelDelete(2)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-label-2' || textPopupState.lastTargetElement === 'impact-label-2')) {
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-label-2',
                          lastTargetElement: 'impact-label-2',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                        if (impactElement) {
                          const impactRect = impactElement.getBoundingClientRect();
                          const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (impactRect.left - canvasRect.left) - 10;
                            const relativeY = (impactRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-label-2',
                              lastTargetElement: 'impact-label-2'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactLabels[2]}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color="text-gray-900"
                  align={impactValueAlignments[2]}
                  fontFamily={impactValueFontFamilies[2]}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight"
                  style={{
                    fontSize: `${impactValueFontSizesState[2]}px`,
                    color: impactValueColorsState[2],
                    textAlign: impactValueAlignmentsState[2],
                    lineHeight: '1.1',
                    whiteSpace: 'nowrap'
                  }}
                  isSelected={impactValueSelectionStates[2][0].isTitleSelected}
                  transform={impactValueSelectionStates[2][0].titleTransform}
                  onClick={(e: React.MouseEvent) => {
                    deselectAllOtherElements('impact-value-2');
                    impactValueSelectionStates[2][1].handleTitleClick(e);
                  }}
                  onTextChange={(newText: string) => handleImpactValueChange(2, newText)}
                  onSizeChange={(newTransform: any) => impactValueSelectionStates[2][1].handleTitleSizeChange?.(newTransform)}
                  onChangeSize={(fontSize: number) => {
                    setImpactValueFontSizes(prev => prev.map((size, i) => i === 2 ? fontSize : size));
                  }}
                  onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                    impactValueSelectionStates[2][1].handleTitleDragStart?.(e, element);
                  }}
                  useFixedWidth={false}
                  onResizeStart={impactValueSelectionStates[2][1].handleTitleResizeStart}
                  onDeleteText={() => handleImpactValueDelete(2)}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-value-2' || textPopupState.lastTargetElement === 'impact-value-2')) {
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-value-2',
                        lastTargetElement: 'impact-value-2',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                      if (impactElement) {
                        const impactRect = impactElement.getBoundingClientRect();
                        const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (impactRect.left - canvasRect.left) - 10;
                          const relativeY = (impactRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'impact-value-2',
                            lastTargetElement: 'impact-value-2'
                          });
                        }
                      }
                    }
                  }}
                >
                  {impactValues[2]}
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
                    color="text-gray-600"
                    align={impactLabelAlignments[3]}
                    fontFamily={impactLabelFontFamilies[3]}
                    className="text-xs text-gray-600 leading-tight font-helvetica-neue break-words"
                    style={{
                      fontSize: `${impactLabelFontSizesState[3]}px`,
                      color: impactLabelColorsState[3],
                      textAlign: impactLabelAlignmentsState[3],
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={impactLabelSelectionStates[3][0].isTitleSelected}
                    transform={impactLabelSelectionStates[3][0].titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('impact-label-3');
                      impactLabelSelectionStates[3][1].handleTitleClick(e);
                    }}
                    onTextChange={(newText: string) => handleImpactLabelChange(3, newText)}
                    onSizeChange={(newTransform: any) => impactLabelSelectionStates[3][1].handleTitleSizeChange?.(newTransform)}
                    onChangeSize={(fontSize: number) => {
                      setImpactLabelFontSizes(prev => prev.map((size, i) => i === 3 ? fontSize : size));
                    }}
                    onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                      impactLabelSelectionStates[3][1].handleTitleDragStart?.(e, element);
                    }}
                    useFixedWidth={false}
                    onResizeStart={impactLabelSelectionStates[3][1].handleTitleResizeStart}
                    onDeleteText={() => handleImpactLabelDelete(3)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-label-3' || textPopupState.lastTargetElement === 'impact-label-3')) {
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: 'impact-label-3',
                          lastTargetElement: 'impact-label-3',
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                        if (impactElement) {
                          const impactRect = impactElement.getBoundingClientRect();
                          const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (impactRect.left - canvasRect.left) - 10;
                            const relativeY = (impactRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'impact-label-3',
                              lastTargetElement: 'impact-label-3'
                            });
                          }
                        }
                      }
                    }}
                  >
                    {impactLabels[3]}
                  </FigmaText>
                </div>
                <FigmaText
                  variant="body"
                  color="text-gray-900"
                  align={impactValueAlignments[3]}
                  fontFamily={impactValueFontFamilies[3]}
                  className="text-4xl font-normal text-gray-900 flex-shrink-0 tracking-tight"
                  style={{
                    fontSize: `${impactValueFontSizesState[3]}px`,
                    color: impactValueColorsState[3],
                    textAlign: impactValueAlignmentsState[3],
                    lineHeight: '1.1',
                    whiteSpace: 'nowrap'
                  }}
                  isSelected={impactValueSelectionStates[3][0].isTitleSelected}
                  transform={impactValueSelectionStates[3][0].titleTransform}
                  onClick={(e: React.MouseEvent) => {
                    deselectAllOtherElements('impact-value-3');
                    impactValueSelectionStates[3][1].handleTitleClick(e);
                  }}
                  onTextChange={(newText: string) => handleImpactValueChange(3, newText)}
                  onSizeChange={(newTransform: any) => impactValueSelectionStates[3][1].handleTitleSizeChange?.(newTransform)}
                  onChangeSize={(fontSize: number) => {
                    setImpactValueFontSizes(prev => prev.map((size, i) => i === 3 ? fontSize : size));
                  }}
                  onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                    impactValueSelectionStates[3][1].handleTitleDragStart?.(e, element);
                  }}
                  useFixedWidth={false}
                  onResizeStart={impactValueSelectionStates[3][1].handleTitleResizeStart}
                  onDeleteText={() => handleImpactValueDelete(3)}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    if (textPopupState.isOpen && (textPopupState.targetElement === 'impact-value-3' || textPopupState.lastTargetElement === 'impact-value-3')) {
                      setTextPopupState(prev => ({
                        ...prev,
                        targetElement: 'impact-value-3',
                        lastTargetElement: 'impact-value-3',
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily
                      }));
                    } else {
                      const impactElement = document.querySelector('.impact-image-metrics-layout .impact-numbers-container');
                      if (impactElement) {
                        const impactRect = impactElement.getBoundingClientRect();
                        const canvasContainer = impactElement.closest('.impact-image-metrics-layout') as HTMLElement;
                        if (canvasContainer) {
                          const canvasRect = canvasContainer.getBoundingClientRect();
                          const relativeX = (impactRect.left - canvasRect.left) - 10;
                          const relativeY = (impactRect.top - canvasRect.top) - 50;
                          
                          setTextPopupState({
                            isOpen: true,
                            position: { x: relativeX, y: relativeY },
                            originalPosition: { x: relativeX, y: relativeY },
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily,
                            targetElement: 'impact-value-3',
                            lastTargetElement: 'impact-value-3'
                          });
                        }
                      }
                    }
                  }}
                >
                  {impactValues[3]}
                </FigmaText>
              </div>
            </div>
          </div>
        )}
      </div>

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
              handleDescriptionChangeSize(fontSize);
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ impactValueFontSizes: newSizes });
                }
                return newSizes;
              });
            } else if (target?.startsWith('impact-label-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactLabelFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ impactLabelFontSizes: newSizes });
                }
                return newSizes;
              });
            }
          }}
          onChangeFont={(fontFamily: string) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ impactValueFontFamilies: newFonts });
                }
                return newFonts;
              });
            } else if (target?.startsWith('impact-label-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactLabelFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ impactLabelFontFamilies: newFonts });
                }
                return newFonts;
              });
            }
          }}
          onChangeColor={(color: string) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ impactValueColors: newColors });
                }
                return newColors;
              });
            } else if (target?.startsWith('impact-label-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactLabelColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ impactLabelColors: newColors });
                }
                return newColors;
              });
            }
          }}
          onChangeAlignment={(alignment: 'left' | 'center' | 'right') => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target?.startsWith('impact-value-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactValueAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ impactValueAlignments: newAlignments });
                }
                return newAlignments;
              });
            } else if (target?.startsWith('impact-label-')) {
              const index = parseInt(target.split('-')[2]);
              setImpactLabelAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ impactLabelAlignments: newAlignments });
                }
                return newAlignments;
              });
            }
          }}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
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
  );

  // Conditionally wrap with CanvasOverlay for fixed dimensions
  return useFixedDimensions ? (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
    </CanvasOverlayProvider>
  ) : content;
}

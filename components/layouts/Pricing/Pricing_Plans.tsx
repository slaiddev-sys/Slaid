import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
export interface PricingPlansProps {
  /**
   * Main title for the pricing section
   */
  title?: string;
  
  /**
   * Description text that appears on the right side
   */
  description?: string;
  
  /**
   * Pricing plans data
   */
  pricingData?: {
    plans: {
      name: string;
      price: string;
      period: string;
      discount?: string;
      targetAudience: string;
      features: string[];
    }[];
  };
  
  /**
   * Layout configuration
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
     * Show/hide pricing table
     */
    showPricing?: boolean;
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
 * Pricing Plans Layout
 * 
 * A layout for displaying pricing tiers with features and pricing information.
 * Shows title and description at the top, with pricing cards below.
 */
export default function Pricing_Plans({
  title = 'Pricing',
  description = 'Lorem ipsum dolor sit amet consectetur. Est facilisis amet consectetur eu egestas gravida eu. Tempor malesuada posuere id consequat eu tortor quam aenean. Tortor turpis lectus sem proin.',
  pricingData = {
    plans: [
      {
        name: 'Free',
        price: '$0',
        period: 'per user/month, billed annually',
        targetAudience: 'For Small Teams',
        features: [
          'Real-time contact syncing',
          'Automatic data enrichment',
          'Up to 3 seats',
          'Basic support'
        ]
      },
      {
        name: 'Basic',
        price: '$39',
        period: 'per user/month, billed annually',
        discount: '-15%',
        targetAudience: 'For Growing Teams',
        features: [
          'Private lists',
          'Enhanced email sending',
          'No seat limits',
          'Advanced analytics',
          'Priority support',
          'Custom integrations'
        ]
      },
      {
        name: 'Enterprise',
        price: '$129',
        period: 'per user/month, billed annually',
        targetAudience: 'For Big Corporation',
        features: [
          'Unlimited reporting',
          'SAML and SSO',
          'Custom billing',
          'Dedicated account manager',
          'White-label options',
          'API access',
          'Advanced security',
          '24/7 phone support'
        ]
      }
    ]
  },
  layout = {
    showTitle: true,
    showDescription: true,
    showPricing: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform
}: PricingPlansProps) {
  const [toggleStates, setToggleStates] = useState<boolean[]>([false, false, false]);

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Text styling state
  const [titleFontSize, setTitleFontSize] = useState(32);
  const [titleFontFamily, setTitleFontFamily] = useState('font-helvetica-neue');
  const [currentTitleColor, setCurrentTitleColor] = useState('#1f2937');
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>('left');

  const [descriptionFontSize, setDescriptionFontSize] = useState(10);
  const [descriptionFontFamily, setDescriptionFontFamily] = useState('font-helvetica-neue');
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState('#6b7280');
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>('left');

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
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as 'title' | 'description' | string | null,
    lastTargetElement: null as 'title' | 'description' | string | null
  });

  // Pricing card text state - for each plan's text elements
  const [pricingCardTexts, setPricingCardTexts] = useState(() => {
    return pricingData.plans.map((plan, index) => {
      // Calculate initial annual price with 15% discount for backwards compatibility
      const numericPrice = parseInt(plan.price.replace(/[^0-9]/g, ''));
      const annualPrice = isNaN(numericPrice) || numericPrice === 0 ? plan.price : `$${Math.round(numericPrice * 0.85)}`;
      
      return {
        planName: plan.name,
        monthlyPrice: plan.price,
        annualPrice: annualPrice,
        targetAudience: plan.targetAudience,
        features: [...plan.features]
      };
    });
  });

  // Pricing card text styling state
  const [pricingCardStyles, setPricingCardStyles] = useState(() => {
    return pricingData.plans.map(() => ({
      planName: { fontSize: 14, fontFamily: 'font-helvetica-neue', color: '#1f2937', alignment: 'left' as 'left' | 'center' | 'right' },
      price: { fontSize: 40, fontFamily: 'font-helvetica-neue', color: '#1f2937', alignment: 'left' as 'left' | 'center' | 'right' },
      targetAudience: { fontSize: 12, fontFamily: 'font-helvetica-neue', color: '#6b7280', alignment: 'left' as 'left' | 'center' | 'right' },
      features: { fontSize: 12, fontFamily: 'font-helvetica-neue', color: '#374151', alignment: 'left' as 'left' | 'center' | 'right' }
    }));
  });

  // Individual selection states for pricing card elements
  const [pricingCardSelections, setPricingCardSelections] = useState(() => {
    return pricingData.plans.map((plan) => ({
      planName: { isSelected: false, transform: { x: 0, y: 0, width: 0, height: 0 }, isDragging: false },
      price: { isSelected: false, transform: { x: 0, y: 0, width: 0, height: 0 }, isDragging: false },
      targetAudience: { isSelected: false, transform: { x: 0, y: 0, width: 0, height: 0 }, isDragging: false },
      features: plan.features.map(() => ({ isSelected: false, transform: { x: 0, y: 0, width: 0, height: 0 }, isDragging: false }))
    }));
  });

  // Sync props with state when they change (CRITICAL for secondary text editing)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  useEffect(() => {
    if (pricingData && pricingData.plans) {
      setPricingCardTexts(pricingData.plans.map((plan, index) => {
        // Calculate initial annual price with 15% discount for backwards compatibility
        const numericPrice = parseInt(plan.price.replace(/[^0-9]/g, ''));
        const annualPrice = isNaN(numericPrice) || numericPrice === 0 ? plan.price : `$${Math.round(numericPrice * 0.85)}`;
        
        return {
          planName: plan.name,
          monthlyPrice: plan.price,
          annualPrice: annualPrice,
          targetAudience: plan.targetAudience,
          features: [...plan.features]
        };
      }));
    }
  }, [pricingData]);

  // Get the appropriate price based on billing period for specific plan
  const getCurrentPrice = (planIndex: number) => {
    return toggleStates[planIndex] 
      ? pricingCardTexts[planIndex].annualPrice 
      : pricingCardTexts[planIndex].monthlyPrice;
  };

  // Calculate total annual price for display
  const calculateAnnualTotal = (planIndex: number) => {
    const annualPrice = pricingCardTexts[planIndex].annualPrice;
    const numericPrice = parseInt(annualPrice.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice) || numericPrice === 0) return null;
    
    const annualTotal = numericPrice * 12;
    return `$${annualTotal}/year`;
  };

  // Calculate dynamic discount percentage between monthly and annual prices
  const calculateDiscountPercentage = (planIndex: number) => {
    const monthlyPrice = pricingCardTexts[planIndex].monthlyPrice;
    const annualPrice = pricingCardTexts[planIndex].annualPrice;
    
    const monthlyNumeric = parseInt(monthlyPrice.replace(/[^0-9]/g, ''));
    const annualNumeric = parseInt(annualPrice.replace(/[^0-9]/g, ''));
    
    if (isNaN(monthlyNumeric) || isNaN(annualNumeric) || monthlyNumeric === 0) return null;
    
    // Calculate percentage difference: ((monthly - annual) / monthly) * 100
    const discountPercentage = Math.round(((monthlyNumeric - annualNumeric) / monthlyNumeric) * 100);
    
    if (discountPercentage > 0) {
      return `-${discountPercentage}%`; // Discount (annual is cheaper)
    } else if (discountPercentage < 0) {
      return `+${Math.abs(discountPercentage)}%`; // Premium (annual is more expensive)
    } else {
      return null; // No difference
    }
  };

  // Toggle billing period for specific plan
  const toggleBilling = (planIndex: number) => {
    setToggleStates(prev => 
      prev.map((state, index) => index === planIndex ? !state : state)
    );
  };

  // Calculate dynamic text size based on number of features (max 8 items)
  const getFeatureTextSize = (featuresCount: number) => {
    if (featuresCount <= 4) return 'text-xs'; // 12px - default size
    if (featuresCount <= 6) return 'text-[11px]'; // 11px - slightly smaller
    return 'text-[10px]'; // 10px - smallest for 7-8 items
  };

  // Calculate dynamic spacing based on number of features
  const getFeatureSpacing = (featuresCount: number) => {
    if (featuresCount <= 4) return 'space-y-2'; // default spacing
    if (featuresCount <= 6) return 'space-y-1.5'; // tighter spacing
    return 'space-y-1'; // tightest spacing for 7-8 items
  };

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
  };

  const handleTitleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentTitleAlignment(alignment);
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
  };

  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentDescriptionAlignment(alignment);
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

  // Pricing card text handlers
  const handlePricingCardTextChange = (planIndex: number, textType: string, newText: string, featureIndex?: number) => {
    setPricingCardTexts(prev => {
      const updated = [...prev];
      if (textType === 'feature' && featureIndex !== undefined) {
        updated[planIndex].features[featureIndex] = newText;
      } else if (textType === 'price') {
        // Update the appropriate price based on current toggle state
        if (toggleStates[planIndex]) {
          updated[planIndex].annualPrice = newText;
        } else {
          updated[planIndex].monthlyPrice = newText;
        }
      } else {
        (updated[planIndex] as any)[textType] = newText;
      }
      return updated;
    });
    
    // Call onUpdate to save changes through handleCanvasEdit
    if (onUpdate) {
      // Update the pricingData structure properly
      const updatedPlans = pricingData.plans.map((plan, i) => {
        if (i === planIndex) {
          if (textType === 'feature' && featureIndex !== undefined) {
            const updatedFeatures = [...plan.features];
            updatedFeatures[featureIndex] = newText;
            return { ...plan, features: updatedFeatures };
          } else if (textType === 'price') {
            return { ...plan, price: newText };
          } else if (textType === 'planName') {
            return { ...plan, name: newText };
          } else if (textType === 'targetAudience') {
            return { ...plan, targetAudience: newText };
          }
        }
        return plan;
      });
      onUpdate({ pricingData: { ...pricingData, plans: updatedPlans } });
    }
  };

  const handlePricingCardStyleChange = (planIndex: number, textType: string, styleType: string, value: any) => {
    setPricingCardStyles(prev => {
      const updated = [...prev];
      // Map 'feature' to 'features' for consistency with the state structure
      const actualTextType = textType === 'feature' ? 'features' : textType;
      (updated[planIndex] as any)[actualTextType][styleType] = value;
      return updated;
    });
  };

  const handlePricingCardDelete = (planIndex: number, textType: string, featureIndex?: number) => {
    if (textType === 'feature' && featureIndex !== undefined) {
      setPricingCardTexts(prev => {
        const updated = [...prev];
        updated[planIndex].features[featureIndex] = '';
        return updated;
      });
    } else {
      setPricingCardTexts(prev => {
        const updated = [...prev];
        (updated[planIndex] as any)[textType] = '';
        return updated;
      });
    }
  };

  // Individual selection handlers for pricing card elements
  const handlePricingCardClick = (planIndex: number, textType: string, featureIndex?: number) => {
    // Deselect all other elements first
    setPricingCardSelections(prev => {
      const updated = prev.map((plan, pIndex) => ({
        planName: { ...plan.planName, isSelected: false },
        price: { ...plan.price, isSelected: false },
        targetAudience: { ...plan.targetAudience, isSelected: false },
        features: plan.features.map(feature => ({ ...feature, isSelected: false }))
      }));
      
      // Select the clicked element
      if (textType === 'feature' && featureIndex !== undefined) {
        updated[planIndex].features[featureIndex].isSelected = true;
      } else {
        (updated[planIndex] as any)[textType].isSelected = true;
      }
      
      return updated;
    });

    // Also deselect main title/description
    textSelectionHandlers.handleClickOutside();
  };

  const handlePricingCardSizeChange = (planIndex: number, textType: string, newTransform: any, featureIndex?: number) => {
    setPricingCardSelections(prev => {
      const updated = [...prev];
      if (textType === 'feature' && featureIndex !== undefined) {
        updated[planIndex].features[featureIndex].transform = newTransform;
      } else {
        (updated[planIndex] as any)[textType].transform = newTransform;
      }
      return updated;
    });
  };

  const handlePricingCardDragStart = (planIndex: number, textType: string, e: React.MouseEvent, element: HTMLElement, featureIndex?: number) => {
    setPricingCardSelections(prev => {
      const updated = [...prev];
      if (textType === 'feature' && featureIndex !== undefined) {
        updated[planIndex].features[featureIndex].isDragging = true;
      } else {
        (updated[planIndex] as any)[textType].isDragging = true;
      }
      return updated;
    });
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
    height: '100vh',
    minHeight: '100vh',
  };

  // Base classes for pricing layout with bottom margin to prevent overflow
  const containerClasses = useFixedDimensions 
    ? `pricing-plans px-6 lg:px-12 pt-8 lg:pt-12 pb-12 lg:pb-16 bg-white ${className}`
    : `pricing-plans px-6 lg:px-12 pt-8 lg:pt-12 pb-12 lg:pb-16 bg-white w-full h-full min-h-[400px] ${className}`;

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('.pricing-card-text') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      return;
    }
    
    // Deselect main title/description
    textSelectionHandlers.handleClickOutside();
    
    // Deselect all pricing card elements
    setPricingCardSelections(prev => {
      return prev.map(plan => ({
        planName: { ...plan.planName, isSelected: false },
        price: { ...plan.price, isSelected: false },
        targetAudience: { ...plan.targetAudience, isSelected: false },
        features: plan.features.map(feature => ({ ...feature, isSelected: false }))
      }));
    });
    
    setTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
  };

  // Generate unique ID for accessibility
  const headingId = `pricing-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <section 
      className={`${containerClasses} flex flex-col`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Title and Description Section */}
      <div className="flex mb-8">
        {/* Title */}
        {layout.showTitle && (
          <div className="w-1/2 pr-8 relative">
            <div 
              className="title-layer absolute pointer-events-auto"
              style={{
                left: '0px',
                top: '0px',
                width: 'auto',
                maxWidth: '320px',
                zIndex: 10,
                overflow: 'visible',
                contain: 'none',
                position: 'absolute'
              }}
            >
              <FigmaText
                variant="title"
                color={currentTitleColor}
                align={currentTitleAlignment}
                fontFamily={titleFontFamily}
                className={`text-2xl lg:text-3xl xl:text-4xl font-normal font-helvetica-neue leading-none tracking-tighter text-left break-words`}
              style={{
                fontSize: `${titleFontSize}px`,
                fontWeight: '400',
                color: currentTitleColor,
                textAlign: currentTitleAlignment,
                lineHeight: '0.9',
                letterSpacing: '-0.05em',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                margin: '0',
                padding: '0'
              }}
                isSelected={textSelectionState.isTitleSelected}
                transform={textSelectionState.titleTransform}
                onClick={textSelectionHandlers.handleTitleClick}
                onTextChange={handleTitleTextChange}
                onSizeChange={handleTitleSizeChange}
                onChangeSize={handleTitleChangeSize}
                onChangeFont={handleTitleChangeFont}
                onDragStart={handleTitleDragStart}
                onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                onDeleteText={handleTitleDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const titleElement = document.querySelector('.pricing-plans .title-layer');
                  if (titleElement) {
                    const titleRect = titleElement.getBoundingClientRect();
                    const canvasContainer = titleElement.closest('.pricing-plans') as HTMLElement;
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
          </div>
        )}

        {/* Description */}
        {layout.showDescription && currentDescription && (
          <div className="w-1/2 pl-8 relative">
            <div 
              className="description-layer absolute pointer-events-auto"
              style={{
                left: '60px',
                top: '0px',
                width: 'auto',
                maxWidth: '320px',
                zIndex: 10,
                overflow: 'visible',
                contain: 'none',
                position: 'absolute'
              }}
            >
              <FigmaText
                variant="body"
                color={currentDescriptionColor}
                align={currentDescriptionAlignment}
                fontFamily={descriptionFontFamily}
                className={`text-xs font-helvetica-neue text-left break-words`}
              style={{
                fontSize: `${descriptionFontSize}px`,
                fontWeight: '400',
                color: currentDescriptionColor,
                textAlign: currentDescriptionAlignment,
                lineHeight: '1.5',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                margin: '0',
                padding: '0'
              }}
                isSelected={textSelectionState.isDescriptionSelected}
                transform={textSelectionState.descriptionTransform}
                onClick={textSelectionHandlers.handleDescriptionClick}
                onTextChange={handleDescriptionTextChange}
                onSizeChange={handleDescriptionSizeChange}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                onDragStart={handleDescriptionDragStart}
                onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                onDeleteText={handleDescriptionDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const descriptionElement = document.querySelector('.pricing-plans .description-layer');
                  if (descriptionElement) {
                    const descriptionRect = descriptionElement.getBoundingClientRect();
                    const canvasContainer = descriptionElement.closest('.pricing-plans') as HTMLElement;
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
          </div>
        )}
      </div>

      {/* Pricing Cards Section */}
      {layout.showPricing && (
        <div className="w-full mt-8">
          <div className="grid grid-cols-3 gap-6">
            {pricingData.plans.map((plan, index) => (
              <div key={index} className={`${
                index === 1 
                  ? 'p-1 scale-[1.03]' 
                  : 'p-6 border border-transparent'
              } flex flex-col transition-all duration-300 cursor-pointer group`} style={{
                backgroundColor: index === 1 ? undefined : '#f2f3f6'
              }}>
                <div className={index === 1 ? "p-5 flex flex-col h-full transition-all duration-300" : "flex flex-col h-full"} style={{
                  backgroundColor: index === 1 ? '#f2f3f6' : undefined
                }}>
          {/* Plan Header */}
                <div className="mb-3">
                  {/* Plan Icon */}
                  <div className="mb-3 flex justify-start">
                    <div className="w-full flex justify-between items-start">
                    {index === 0 && (
                      // Free plan - User icon in square container
                      <div className="flex items-center justify-start">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {index === 0 && (
                      // Individual Billing Toggle for Free plan
                      <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                        <button
                          onClick={() => toggleBilling(index)}
                                                     className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            !toggleStates[index] 
                              ? 'bg-white text-gray-900' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => toggleBilling(index)}
                                                     className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            toggleStates[index] 
                              ? 'bg-white text-gray-900' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Annual
                        </button>
                      </div>
                    )}
                    {index === 1 && (
                      // Basic plan - Suitcase icon in square container
                      <div className="flex items-center justify-start">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                    )}
                    {index === 1 && (
                      // Individual Billing Toggle for Basic plan
                      <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                        <button
                          onClick={() => toggleBilling(index)}
                                                     className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            !toggleStates[index] 
                              ? 'bg-white text-gray-900' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => toggleBilling(index)}
                                                     className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            toggleStates[index] 
                              ? 'bg-white text-gray-900' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Annual
                        </button>
                      </div>
                    )}
                    {index === 2 && (
                      // Enterprise plan - Building icon in square container
                      <div className="flex items-center justify-start">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    {index === 2 && (
                      // Individual Billing Toggle for Enterprise plan
                      <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                        <button
                          onClick={() => toggleBilling(index)}
                                                     className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            !toggleStates[index] 
                              ? 'bg-white text-gray-900' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => toggleBilling(index)}
                                                     className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            toggleStates[index] 
                              ? 'bg-white text-gray-900' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Annual
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                  <div className={`pricing-card-text mb-2 plan-name-${index}`}>
                    <FigmaText
                      variant="title"
                      color={pricingCardStyles[index].planName.color}
                      align={pricingCardStyles[index].planName.alignment}
                      fontFamily={pricingCardStyles[index].planName.fontFamily}
                      className="text-sm font-medium text-gray-900 text-left break-words"
                      style={{
                        fontSize: `${pricingCardStyles[index].planName.fontSize}px`,
                        fontWeight: '500',
                        color: pricingCardStyles[index].planName.color,
                        textAlign: pricingCardStyles[index].planName.alignment,
                        lineHeight: '1.25',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        margin: '0',
                        padding: '0'
                      }}
                      isSelected={pricingCardSelections[index].planName.isSelected}
                      transform={pricingCardSelections[index].planName.transform}
                      onClick={() => handlePricingCardClick(index, 'planName')}
                      onTextChange={(newText) => handlePricingCardTextChange(index, 'planName', newText)}
                      onSizeChange={(newTransform) => handlePricingCardSizeChange(index, 'planName', newTransform)}
                      onChangeSize={(fontSize) => handlePricingCardStyleChange(index, 'planName', 'fontSize', fontSize)}
                      onChangeFont={(fontFamily) => handlePricingCardStyleChange(index, 'planName', 'fontFamily', fontFamily)}
                      onDragStart={(e, element) => handlePricingCardDragStart(index, 'planName', e, element)}
                      onResizeStart={() => {}}
                      onDeleteText={() => handlePricingCardDelete(index, 'planName')}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        const planNameElement = document.querySelector(`.pricing-plans .plan-name-${index}`);
                        if (planNameElement) {
                          const planNameRect = planNameElement.getBoundingClientRect();
                          const canvasContainer = planNameElement.closest('.pricing-plans') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (planNameRect.left - canvasRect.left) - 10;
                            const relativeY = (planNameRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: `plan-${index}-planName`,
                              lastTargetElement: `plan-${index}-planName`
                            });
                          }
                        }
                      }}>
                      {pricingCardTexts[index].planName}
                    </FigmaText>
                  </div>
                  <div className="flex items-baseline justify-start mb-1">
                    <div className={`pricing-card-text price-${index}`}>
                      <FigmaText
                        variant="title"
                        color={pricingCardStyles[index].price.color}
                        align={pricingCardStyles[index].price.alignment}
                        fontFamily={pricingCardStyles[index].price.fontFamily}
                        className="text-2xl font-normal text-gray-900 break-words"
                        style={{
                          fontSize: `${pricingCardStyles[index].price.fontSize}px`,
                          fontWeight: '400',
                          color: pricingCardStyles[index].price.color,
                          textAlign: pricingCardStyles[index].price.alignment,
                          lineHeight: '1',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          margin: '0',
                          padding: '0'
                        }}
                        isSelected={pricingCardSelections[index].price.isSelected}
                        transform={pricingCardSelections[index].price.transform}
                        onClick={() => handlePricingCardClick(index, 'price')}
                        onTextChange={(newText) => handlePricingCardTextChange(index, 'price', newText)}
                        onSizeChange={(newTransform) => handlePricingCardSizeChange(index, 'price', newTransform)}
                        onChangeSize={(fontSize) => handlePricingCardStyleChange(index, 'price', 'fontSize', fontSize)}
                        onChangeFont={(fontFamily) => handlePricingCardStyleChange(index, 'price', 'fontFamily', fontFamily)}
                        onDragStart={(e, element) => handlePricingCardDragStart(index, 'price', e, element)}
                        onResizeStart={() => {}}
                        onDeleteText={() => handlePricingCardDelete(index, 'price')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const priceElement = document.querySelector(`.pricing-plans .price-${index}`);
                          if (priceElement) {
                            const priceRect = priceElement.getBoundingClientRect();
                            const canvasContainer = priceElement.closest('.pricing-plans') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (priceRect.left - canvasRect.left) - 10;
                              const relativeY = (priceRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: `plan-${index}-price`,
                                lastTargetElement: `plan-${index}-price`
                              });
                            }
                          }
                        }}>
                        {getCurrentPrice(index)}
                      </FigmaText>
                    </div>
                    <span className="text-sm text-gray-500 ml-1">/month</span>
                    {toggleStates[index] && calculateDiscountPercentage(index) && (
                      <span className={`ml-2 text-sm font-medium ${
                        calculateDiscountPercentage(index)?.startsWith('-') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculateDiscountPercentage(index)}
                      </span>
                    )}
                  </div>
                  <div className={`pricing-card-text target-audience-${index}`}>
                    <FigmaText
                      variant="body"
                      color={pricingCardStyles[index].targetAudience.color}
                      align={pricingCardStyles[index].targetAudience.alignment}
                      fontFamily={pricingCardStyles[index].targetAudience.fontFamily}
                      className="text-xs text-gray-600 text-left break-words"
                      style={{
                        fontSize: `${pricingCardStyles[index].targetAudience.fontSize}px`,
                        fontWeight: '400',
                        color: pricingCardStyles[index].targetAudience.color,
                        textAlign: pricingCardStyles[index].targetAudience.alignment,
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        margin: '0',
                        padding: '0'
                      }}
                      isSelected={pricingCardSelections[index].targetAudience.isSelected}
                      transform={pricingCardSelections[index].targetAudience.transform}
                      onClick={() => handlePricingCardClick(index, 'targetAudience')}
                      onTextChange={(newText) => handlePricingCardTextChange(index, 'targetAudience', newText)}
                      onSizeChange={(newTransform) => handlePricingCardSizeChange(index, 'targetAudience', newTransform)}
                      onChangeSize={(fontSize) => handlePricingCardStyleChange(index, 'targetAudience', 'fontSize', fontSize)}
                      onChangeFont={(fontFamily) => handlePricingCardStyleChange(index, 'targetAudience', 'fontFamily', fontFamily)}
                      onDragStart={(e, element) => handlePricingCardDragStart(index, 'targetAudience', e, element)}
                      onResizeStart={() => {}}
                      onDeleteText={() => handlePricingCardDelete(index, 'targetAudience')}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        const targetAudienceElement = document.querySelector(`.pricing-plans .target-audience-${index}`);
                        if (targetAudienceElement) {
                          const targetAudienceRect = targetAudienceElement.getBoundingClientRect();
                          const canvasContainer = targetAudienceElement.closest('.pricing-plans') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (targetAudienceRect.left - canvasRect.left) - 10;
                            const relativeY = (targetAudienceRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: `plan-${index}-targetAudience`,
                              lastTargetElement: `plan-${index}-targetAudience`
                            });
                          }
                        }
                      }}>
                      {pricingCardTexts[index].targetAudience}
                    </FigmaText>
                    {toggleStates[index] && calculateAnnualTotal(index) && (
                      <div className="text-xs text-gray-500 mt-1">{calculateAnnualTotal(index)}</div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1">
                  <ul className={getFeatureSpacing(plan.features.length)}>
                    {plan.features.slice(0, 8).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {/* Checkmark */}
                        <div className="flex-shrink-0 mr-2 mt-0.5">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className={`pricing-card-text feature-${index}-${featureIndex}`}>
                          <FigmaText
                            variant="body"
                            color={pricingCardStyles[index].features.color}
                            align={pricingCardStyles[index].features.alignment}
                            fontFamily={pricingCardStyles[index].features.fontFamily}
                            className={`${getFeatureTextSize(plan.features.length)} text-gray-700 break-words`}
                            style={{
                              fontSize: `${pricingCardStyles[index].features.fontSize}px`,
                              fontWeight: '400',
                              color: pricingCardStyles[index].features.color,
                              textAlign: pricingCardStyles[index].features.alignment,
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal',
                              margin: '0',
                              padding: '0'
                            }}
                            isSelected={pricingCardSelections[index].features[featureIndex].isSelected}
                            transform={pricingCardSelections[index].features[featureIndex].transform}
                            onClick={() => handlePricingCardClick(index, 'feature', featureIndex)}
                            onTextChange={(newText) => handlePricingCardTextChange(index, 'feature', newText, featureIndex)}
                            onSizeChange={(newTransform) => handlePricingCardSizeChange(index, 'feature', newTransform, featureIndex)}
                            onChangeSize={(fontSize) => handlePricingCardStyleChange(index, 'features', 'fontSize', fontSize)}
                            onChangeFont={(fontFamily) => handlePricingCardStyleChange(index, 'features', 'fontFamily', fontFamily)}
                            onDragStart={(e, element) => handlePricingCardDragStart(index, 'feature', e, element, featureIndex)}
                            onResizeStart={() => {}}
                            onDeleteText={() => handlePricingCardDelete(index, 'feature', featureIndex)}
                            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                              const featureElement = document.querySelector(`.pricing-plans .feature-${index}-${featureIndex}`);
                              if (featureElement) {
                                const featureRect = featureElement.getBoundingClientRect();
                                const canvasContainer = featureElement.closest('.pricing-plans') as HTMLElement;
                                if (canvasContainer) {
                                  const canvasRect = canvasContainer.getBoundingClientRect();
                                  const relativeX = (featureRect.left - canvasRect.left) - 10;
                                  const relativeY = (featureRect.top - canvasRect.top) - 50;
                                  
                                  setTextPopupState({
                                    isOpen: true,
                                    position: { x: relativeX, y: relativeY },
                                    originalPosition: { x: relativeX, y: relativeY },
                                    currentFontSize: fontSize,
                                    currentFontFamily: fontFamily,
                                    targetElement: `plan-${index}-feature-${featureIndex}`,
                                    lastTargetElement: `plan-${index}-feature-${featureIndex}`
                                  });
                                }
                              }
                            }}>
                            {pricingCardTexts[index].features[featureIndex]}
                          </FigmaText>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              </div>
            ))}
          </div>
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
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'alignment', alignment);
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
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardDelete(parseInt(planIndex), textType, featureIndex ? parseInt(featureIndex) : undefined);
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
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardStyleChange(parseInt(planIndex), textType, 'alignment', alignment);
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
            } else if (typeof target === 'string' && target.includes('plan-')) {
              const [, planIndex, textType, featureIndex] = target.split('-');
              handlePricingCardDelete(parseInt(planIndex), textType, featureIndex ? parseInt(featureIndex) : undefined);
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import { useFigmaSelection, FigmaImage, FigmaLogo, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface CoverProductLayoutProps {
  /**
   * Main image URL for the left column
   */
  imageUrl?: string;
  
  /**
   * Alt text for the main image
   */
  imageAlt?: string;
  
  /**
   * Optional logo URL for the top of right column
   */
  logoUrl?: string;
  
  /**
   * Alt text for the logo
   */
  logoAlt?: string;
  
  /**
   * SaaS preview image URL
   */
  saasImageUrl?: string;
  
  /**
   * Laptop mockup image URL
   */
  mockupImageUrl?: string;
  
  /**
   * Main title text
   */
  title?: string;
  
  /**
   * Paragraph text content
   */
  paragraph?: string;
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Title text color
   */
  titleColor?: string;
  
  /**
   * Paragraph text color
   */
  paragraphColor?: string;
  
  /**
   * Title className for additional styling (font weight, size, etc.)
   */
  titleClassName?: string;
  
  /**
   * Paragraph className for additional styling
   */
  paragraphClassName?: string;
  
  /**
   * Whether to use fixed canvas dimensions (default: false for responsive)
   */
  useFixedDimensions?: boolean;
  
  /**
   * Canvas width in pixels (only used when useFixedDimensions is true)
   */
  canvasWidth?: number;
  
  /**
   * Canvas height in pixels (only used when useFixedDimensions is true)
   */
  canvasHeight?: number;
  
  /**
   * Right column horizontal padding (default: responsive)
   */
  rightPadding?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Rounded corners for the left image. Defaults to rounded-xl.
   * Set to false to disable, or provide a specific radius: 'sm'|'md'|'lg'|'xl'|'full'.
   */
  imageRounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Which side the image should appear on. Defaults to 'left'.
   * Set to 'right' to render Image on the right and Text on the left.
   */
  imageSide?: 'left' | 'right';

  /**
   * Toggle visibility of the image. When false, the text column expands to full width.
   * Defaults to true.
   */
  showImage?: boolean;

  /**
   * Toggle visibility of the logo. When false, the logo row is omitted.
   * Defaults to true.
   */
  showLogo?: boolean;

  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: string;
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: string;
  
  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved image transform for position persistence
   */
  imageTransform?: { x: number; y: number };

  /**
   * Saved SaaS preview image transform for position persistence
   */
  saasImageTransform?: { x: number; y: number };

  /**
   * Saved mockup image transform for position persistence
   */
  mockupImageTransform?: { x: number; y: number };

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  
  /**
   * Saved logo transform for position persistence
   */
  logoTransform?: { x: number; y: number };
}

/**
 * Cover_ProductLayout - Two-column product cover layout
 * 
 * Left column (50%): Full-height product image
 * Right column (50%): Vertically centered content stack (logo, title, paragraph)
 * 
 * Responsive by default, fits within slide canvas without breaking editor layout.
 */
export default function Cover_ProductLayout({
  imageUrl = '/Default-Image-1.png',
  imageAlt = 'Product image',
  logoUrl = '/logo-placeholder.png',
  logoAlt = 'Logo',
  saasImageUrl = '/Saas-preview.png',
  mockupImageUrl = '/Laptop-MockUp.png',
  title = 'Product Presentation',
  paragraph = 'Lorem ipsum dolor sit amet consectetur adipiscing elit etiam nec suscipit dui sed cursus nibh id risus ultrices convallis phasellus vel tristique diam nam placerat.',
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  paragraphColor = 'text-gray-600',
  titleClassName = 'font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tight break-words overflow-wrap-anywhere whitespace-normal',
  paragraphClassName = 'text-[14px]',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  rightPadding,
  className = '',
  imageRounded = false,
  imageSide = 'right',
  showImage = true,
  showLogo = true,
  titleFontSize = 48,
  titleFontFamily = "font-helvetica-neue",
  titleAlignment = "left",
  descriptionFontSize = 14,
  descriptionFontFamily = "font-helvetica-neue",
  descriptionAlignment = "left",
  onUpdate,
  imageTransform: savedImageTransform,
  saasImageTransform: savedSaasImageTransform,
  mockupImageTransform: savedMockupImageTransform,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  logoTransform: savedLogoTransform
}: CoverProductLayoutProps) {
  
  // Text state management
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentParagraph, setCurrentParagraph] = useState(paragraph);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentParagraphColor, setCurrentParagraphColor] = useState(paragraphColor);
  
  // Styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [titleAlignmentState, setTitleAlignment] = useState(titleAlignment);
  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [descriptionAlignmentState, setDescriptionAlignment] = useState(descriptionAlignment);

  // Update state when props change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentParagraph(paragraph);
  }, [paragraph]);

  // Sync styling props with state
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
    setDescriptionFontSize(descriptionFontSize);
  }, [descriptionFontSize]);

  useEffect(() => {
    setDescriptionFontFamily(descriptionFontFamily);
  }, [descriptionFontFamily]);

  useEffect(() => {
    setDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  useEffect(() => {
    setCurrentTitleColor(titleColor);
  }, [titleColor]);

  useEffect(() => {
    setCurrentParagraphColor(paragraphColor);
  }, [paragraphColor]);
  
  // Custom onUpdate handlers for each image type
  const handleBackgroundImageUpdate = (updates: any) => {
    if (onUpdate) {
      if (updates.imageUrl) {
        onUpdate({ imageUrl: updates.imageUrl });
      }
      if (updates.imageTransform) {
        onUpdate({ imageTransform: updates.imageTransform });
      }
    }
  };

  const handleSaasImageUpdate = (updates: any) => {
    if (onUpdate) {
      if (updates.imageUrl) {
        onUpdate({ saasImageUrl: updates.imageUrl });
      }
      if (updates.imageTransform) {
        onUpdate({ saasImageTransform: updates.imageTransform });
      }
    }
  };

  const handleMockupImageUpdate = (updates: any) => {
    if (onUpdate) {
      if (updates.imageUrl) {
        onUpdate({ mockupImageUrl: updates.imageUrl });
      }
      if (updates.imageTransform) {
        onUpdate({ mockupImageTransform: updates.imageTransform });
      }
    }
  };

  const handleLogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.logoUrl) {
        updateData.logoUrl = updates.logoUrl;
      }
      if (updates.logoTransform) {
        updateData.logoTransform = updates.logoTransform;
      }
      if (Object.keys(updateData).length > 0) {
        onUpdate(updateData);
      }
    }
  };

  // Use separate Figma selection hooks for each image
  const [backgroundState, backgroundHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: handleBackgroundImageUpdate // 🔧 AUTO-UPDATE: Background image
  });
  
  const [saasState, saasHandlers] = useFigmaSelection({
    initialImageUrl: saasImageUrl,
    initialImageTransform: savedSaasImageTransform || { x: 0, y: 0 },
    onUpdate: handleSaasImageUpdate // 🔧 AUTO-UPDATE: SaaS preview image
  });
  
  const [mockupState, mockupHandlers] = useFigmaSelection({
    initialImageUrl: mockupImageUrl,
    initialImageTransform: savedMockupImageTransform || { x: 0, y: 0 },
    onUpdate: handleMockupImageUpdate // 🔧 AUTO-UPDATE: Laptop mockup image
  });
  
  const [logoState, logoHandlers] = useFigmaSelection({
    initialLogoUrl: logoUrl,
    initialLogoTransform: savedLogoTransform || { x: 0, y: 0 },
    onUpdate: handleLogoUpdate // 🔧 AUTO-UPDATE: Logo
  });

  // Text selection handlers with saved transforms
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

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

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    console.log('🌍 Global click outside handler called', e.target);
    
    // Don't intercept clicks on FigmaText or FigmaImage components or text popup
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('.image-layer') ||
                          target.closest('.logo-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      console.log('🎯 Click on Figma element - allowing event to bubble');
      return; // Let the event bubble to the FigmaText/FigmaImage components
    }
    
    console.log('🚫 Deselecting all elements');
    backgroundHandlers.handleClickOutside();
    saasHandlers.handleClickOutside();
    mockupHandlers.handleClickOutside();
    logoHandlers.handleClickOutside();
    textSelectionHandlers.handleClickOutside();
    
    // Close text popup
    setTextPopupState(prev => ({ ...prev, isOpen: false }));
  };

  // Text editing handlers - same as Cover_LeftImageTextRight
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
    setTitleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ titleAlignment: alignment });
    }
  };

  const handleTitleSizeChange = (newTransform: any) => {
    if (textSelectionHandlers.handleTitleSizeChange) {
      textSelectionHandlers.handleTitleSizeChange(newTransform);
    }
  };

  const handleParagraphChangeSize = (fontSize: number) => {
    setDescriptionFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ descriptionFontSize: fontSize });
    }
  };

  const handleParagraphChangeFont = (fontFamily: string) => {
    setDescriptionFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ descriptionFontFamily: fontFamily });
    }
  };

  const handleParagraphChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setDescriptionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ descriptionAlignment: alignment });
    }
  };

  const handleParagraphChangeColor = (color: string) => {
    setCurrentParagraphColor(color);
  };


  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleParagraphTextChange = (newText: string) => {
    setCurrentParagraph(newText);
    if (onUpdate) {
      onUpdate({ paragraph: newText });
    }
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleParagraphDelete = () => {
    setCurrentParagraph('');
    if (onUpdate) {
      onUpdate({ paragraph: '' });
    }
    if (textSelectionHandlers.handleDescriptionDelete) {
      textSelectionHandlers.handleDescriptionDelete();
    }
  };

  const handleParagraphSizeChange = (newTransform: any) => {
    if (textSelectionHandlers.handleDescriptionSizeChange) {
      textSelectionHandlers.handleDescriptionSizeChange(newTransform);
    }
  };

  // Custom drag handlers that update popup position
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

  // Track previous dragging states to detect when dragging ends
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false
  });

  // Update popup position when text is dragged - same as Cover_LeftImageTextRight
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

  // Custom click handlers that ensure only one element is selected at a time
  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Deselect all other elements first
    saasHandlers.handleClickOutside();
    mockupHandlers.handleClickOutside();
    logoHandlers.handleClickOutside();
    // Then handle this element's selection
    backgroundHandlers.handleImageClick(e);
  };

  const handleSaasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Deselect all other elements first
    backgroundHandlers.handleClickOutside();
    mockupHandlers.handleClickOutside();
    logoHandlers.handleClickOutside();
    // Then handle this element's selection
    saasHandlers.handleImageClick(e);
  };

  const handleMockupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Deselect all other elements first
    backgroundHandlers.handleClickOutside();
    saasHandlers.handleClickOutside();
    logoHandlers.handleClickOutside();
    // Then handle this element's selection
    mockupHandlers.handleImageClick(e);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Deselect all other elements first
    backgroundHandlers.handleClickOutside();
    saasHandlers.handleClickOutside();
    mockupHandlers.handleClickOutside();
    // Then handle this element's selection
    logoHandlers.handleLogoClick(e);
  };




  // Fixed canvas dimensions - no responsive behavior to prevent layout shifts

  const isImageRight = imageSide === 'right';
  const hasImage = showImage && !!imageUrl;
  const hasLogo = showLogo && !!logoUrl;

  const content = (
    <div 
      className={`cover-product-layout relative ${className}`}
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
        maxHeight: `${canvasHeight}px`
      }}
      onClick={handleGlobalClickOutside}
    >
      {/* Multi-Image Layer - Fixed position, no layout influence */}
      {hasImage && (
        <div
          className="image-layer absolute inset-0 z-0"
          style={{ 
            left: '50%', // Always on the right side
            width: '50%'
          }}
        >
          {/* Background Image - Independently selectable */}
          <FigmaImage
            src={imageUrl}
            alt={imageAlt}
            size="full"
            fit="cover"
            align="center"
            rounded={imageRounded === true}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            containerClassName="w-full h-full"
            state={backgroundState}
            handlers={{
              ...backgroundHandlers,
              handleImageClick: handleBackgroundClick
            }}
          />
          
          {/* Device Mockup Container - Separate from background */}
          <div className="absolute flex items-end justify-center w-full h-full" style={{ zIndex: 10, bottom: '-4rem', right: '-2rem' }}>
            {/* Device Wrapper - Relative Container */}
            <div className="relative w-full h-full">
              
              {/* Laptop Mockup - Bottom Layer - Independently selectable and clickable */}
              <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 1 }}>
                <FigmaImage
                  src={mockupState.currentImageUrl}
                  alt="Laptop mockup"
                  size="full"
                  fit="contain"
                  align="center"
                  rounded={false}
                  className="w-full h-full object-contain"
                  containerClassName="w-full h-full"
                  state={mockupState}
                  handlers={{
                    ...mockupHandlers,
                    handleImageClick: handleMockupClick
                  }}
                />
              </div>

              {/* SaaS UI - Top Layer - Independently selectable */}
              <div className="absolute" style={{ top: '12%', left: '2.2%', width: '95%', height: '85%', zIndex: 2 }}>
                <FigmaImage
                  src={saasState.currentImageUrl}
                  alt="SaaS Preview"
                  size="full"
                  fit="cover"
                  align="center"
                  rounded={true}
                  className="w-full h-full object-cover object-left rounded-lg"
                  containerClassName="w-full h-full"
                  state={saasState}
                  handlers={{
                    ...saasHandlers,
                    handleImageClick: handleSaasClick
                  }}
                />
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Logo Layer - Independent overlay, highest z-index */}
      {hasLogo && (
        <div 
          className="logo-layer absolute pointer-events-auto" 
          style={{ 
            top: '150px',
            left: '44px', // Always on the left side
            zIndex: 30
          }}
        >
            <FigmaLogo
              src={logoUrl}
              alt={logoAlt}
              size="sm"
              fit="contain"
              align="left"
            className="max-w-20 lg:max-w-24 h-auto"
            containerClassName=""
              state={logoState}
              handlers={{
                ...logoHandlers,
                handleLogoClick: handleLogoClick
              }}
            />
        </div>
      )}

      {/* Title Layer - Independent overlay, visible text */}
      <div 
        className="title-layer absolute pointer-events-auto" 
        style={{ 
          top: hasLogo ? '180px' : '165px',
          left: titleAlignmentState === 'center' 
            ? '25%' // Center in left half
            : titleAlignmentState === 'right'
            ? 'calc(50% - 4px)' // Right align to edge of left half
            : '44px', // Left align (default)
          transform: titleAlignmentState === 'center' ? 'translateX(-50%)' : titleAlignmentState === 'right' ? 'translateX(-100%)' : 'none',
          width: 'auto', // Width controlled by transform
          zIndex: 20,
          // Allow text to be visible
          overflow: 'visible',
          contain: 'none',
          // Ensure no layout influence on parent
          position: 'absolute',
          // Give enough space for text
          maxWidth: '400px',
          minHeight: '60px'
        }}
      >
        <FigmaText
              variant="title"
              color={titleColor}
          fontFamily={titleFontFamilyState}
          className={`${titleClassName} ${titleAlignmentState === 'left' ? 'text-left' : titleAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
          style={{
            fontSize: `${titleFontSizeState}px`,
            color: currentTitleColor,
            textAlign: titleAlignmentState as any,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            display: 'block',
            visibility: 'visible'
          }}
          isSelected={textSelectionState.isTitleSelected}
          transform={textSelectionState.titleTransform}
          onClick={textSelectionHandlers.handleTitleClick}
          onDragStart={handleTitleDragStart}
          onResizeStart={textSelectionHandlers.handleTitleResizeStart}
          onTextChange={handleTitleTextChange}
          onSizeChange={handleTitleSizeChange}
          onChangeSize={handleTitleChangeSize}
          onChangeFont={handleTitleChangeFont}
          onDeleteText={handleTitleDelete}
          onShowPopup={(position, fontSize, fontFamily) => {
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
               // Calculate position relative to the actual title element position in THIS layout
               const titleElement = document.querySelector('.cover-product-layout .title-layer');
               if (titleElement) {
                 const titleRect = titleElement.getBoundingClientRect();
                 const canvasContainer = titleElement.closest('.cover-product-layout') as HTMLElement;
                 if (canvasContainer) {
                   const canvasRect = canvasContainer.getBoundingClientRect();
                   // Position popup above and to the left of the actual text position
                   const relativeX = (titleRect.left - canvasRect.left) - 100; // 100px to the left
                   const relativeY = (titleRect.top - canvasRect.top) - 60;  // 60px above
                   
                   // Ensure popup stays within canvas bounds
                   const clampedX = Math.max(10, Math.min(relativeX, canvasRect.width - 300));
                   const clampedY = Math.max(10, relativeY);
                   
                   setTextPopupState({
                     isOpen: true,
                     position: { x: clampedX, y: clampedY },
                     originalPosition: { x: clampedX, y: clampedY },
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

      {/* Description Layer - Independent overlay, visible text */}
      <div 
        className="description-layer absolute pointer-events-auto" 
        style={{ 
          top: hasLogo ? '235px' : '220px',
          left: descriptionAlignmentState === 'center' 
            ? '25%' // Center in left half
            : descriptionAlignmentState === 'right'
            ? 'calc(50% - 4px)' // Right align to edge of left half
            : '44px', // Left align (default)
          transform: descriptionAlignmentState === 'center' ? 'translateX(-50%)' : descriptionAlignmentState === 'right' ? 'translateX(-100%)' : 'none',
          width: 'auto', // Width controlled by transform
          zIndex: 10,
          // Allow text to be visible
          overflow: 'visible',
          contain: 'none',
          // Give enough space for text
          maxWidth: '350px',
          minHeight: '100px'
        }}
      >
        <FigmaText
              variant="body"
              color={paragraphColor}
          fontFamily={descriptionFontFamilyState}
          className={`leading-relaxed ${paragraphClassName} ${descriptionAlignmentState === 'left' ? 'text-left' : descriptionAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words hyphens-none whitespace-normal text-wrap overflow-wrap-break-word`}
          style={{
            fontSize: `${descriptionFontSizeState}px`,
            color: currentParagraphColor,
            textAlign: descriptionAlignmentState as any,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            display: 'block',
            visibility: 'visible'
          }}
          isSelected={textSelectionState.isDescriptionSelected}
          transform={textSelectionState.descriptionTransform}
          onClick={textSelectionHandlers.handleDescriptionClick}
          onDragStart={handleDescriptionDragStart}
          onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
          onTextChange={handleParagraphTextChange}
          onSizeChange={handleParagraphSizeChange}
          onChangeSize={handleParagraphChangeSize}
          onChangeFont={handleParagraphChangeFont}
          onDeleteText={handleParagraphDelete}
          onShowPopup={(position, fontSize, fontFamily) => {
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
               // Calculate position relative to the actual description element position in THIS layout
               const descriptionElement = document.querySelector('.cover-product-layout .description-layer');
               if (descriptionElement) {
                 const descriptionRect = descriptionElement.getBoundingClientRect();
                 const canvasContainer = descriptionElement.closest('.cover-product-layout') as HTMLElement;
                 if (canvasContainer) {
                   const canvasRect = canvasContainer.getBoundingClientRect();
                   // Position popup above and to the left of the actual text position
                   const relativeX = (descriptionRect.left - canvasRect.left) - 100; // 100px to the left
                   const relativeY = (descriptionRect.top - canvasRect.top) - 60;  // 60px above
                   
                   // Ensure popup stays within canvas bounds
                   const clampedX = Math.max(10, Math.min(relativeX, canvasRect.width - 300));
                   const clampedY = Math.max(10, relativeY);
                   
                   setTextPopupState({
                     isOpen: true,
                     position: { x: clampedX, y: clampedY },
                     originalPosition: { x: clampedX, y: clampedY },
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
          {currentParagraph}
        </FigmaText>
      </div>
    </div>
  );

  // Always wrap with CanvasOverlay for proper text popup positioning
  return (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      {/* Text Popup - same as Cover_LeftImageTextRight */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          position={textPopupState.position}
          onChangeSize={(size) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeSize(size);
            } else if (textPopupState.targetElement === 'description') {
              handleParagraphChangeSize(size);
            }
          }}
          onChangeFont={(font) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeFont(font);
            } else if (textPopupState.targetElement === 'description') {
              handleParagraphChangeFont(font);
            }
          }}
          onChangeColor={(color) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeColor(color);
            } else if (textPopupState.targetElement === 'description') {
              handleParagraphChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            if (textPopupState.targetElement === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (textPopupState.targetElement === 'description') {
              handleParagraphChangeAlignment(alignment);
            }
          }}
          onDeleteText={() => {
            if (textPopupState.targetElement === 'title') {
              handleTitleDelete();
            } else if (textPopupState.targetElement === 'description') {
              handleParagraphDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={textPopupState.targetElement === 'title' ? currentTitleColor : currentParagraphColor}
          currentAlignment={textPopupState.targetElement === 'title' ? titleAlignmentState as 'left' | 'center' | 'right' : descriptionAlignmentState as 'left' | 'center' | 'right'}
        />
      )}
    </CanvasOverlayProvider>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import { useFigmaSelection, FigmaImage, FigmaLogo, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import { isFigmaElementClick } from '../../../utils/figmaClickDetection';

export interface CoverLeftImageTextRightProps {
  /**
   * Main image URL for the left column
   */
  imageUrl?: string;
  
  /**
   * Alt text for the image
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
   * Main title text
   */
  title?: string;
  
  /**
   * Paragraph text content
   */
  paragraph?: string;
  
  /**
   * Font family for all text elements
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
   * Custom CSS classes for title styling
   */
  titleClassName?: string;
  
  /**
   * Custom CSS classes for paragraph styling
   */
  paragraphClassName?: string;
  
  /**
   * Whether to use fixed dimensions (for canvas mode)
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
   * Additional CSS classes for the container
   */
  className?: string;
  
  /**
   * Whether the image should have rounded corners
   */
  imageRounded?: boolean;
  
  /**
   * Which side the image should be on
   */
  imageSide?: 'left' | 'right';
  
  /**
   * Whether to show the image
   */
  showImage?: boolean;
  
  /**
   * Whether to show the logo
   */
  showLogo?: boolean;

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
 * Cover layout with image on left and text content on right.
 * Features Figma-style selection, drag, resize, and upload for both image and logo.
 * Responsive by default, fits within slide canvas without breaking editor layout.
 */
export default function Cover_LeftImageTextRight({
  imageUrl = '/Default-Image-1.png',
  imageAlt = 'Cover image',
  logoUrl = '/logo-placeholder.png',
  logoAlt = 'Logo',
  title = 'Your Presentation Title',
  paragraph = 'Lorem ipsum dolor sit amet consectetur adipiscing elit etiam nec suscipit dui sed cursus nibh id risus ultrices convallis phasellus vel tristique diam nam placerat.',
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  paragraphColor = 'text-gray-600',
  titleClassName = 'font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tight break-words overflow-wrap-anywhere whitespace-normal',
  paragraphClassName = 'text-[14px]',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  className = '',
  imageRounded = false,
  imageSide = 'left',
  showImage = true,
  showLogo = true,
  onUpdate,
  imageTransform: savedImageTransform
}: CoverLeftImageTextRightProps) {
  
  // State for dynamic text properties
  const [titleFontSize, setTitleFontSize] = useState(48); // Default title size
  const [titleFontFamily, setTitleFontFamily] = useState(fontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState('#000000'); // Default title color
  const [paragraphFontSize, setParagraphFontSize] = useState(14); // Default paragraph size
  const [paragraphFontFamily, setParagraphFontFamily] = useState(fontFamily);
  const [currentParagraphColor, setCurrentParagraphColor] = useState('#000000'); // Default paragraph color
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>('left'); // Default title alignment
  const [currentParagraphAlignment, setCurrentParagraphAlignment] = useState<'left' | 'center' | 'right'>('left'); // Default paragraph alignment
  
  // State for text content (to enable deletion)
  const [currentTitle, setCurrentTitle] = useState(title || '');
  const [currentParagraph, setCurrentParagraph] = useState(paragraph || '');

  // Update state when props change
  useEffect(() => {
    setCurrentTitle(title || '');
  }, [title]);

  useEffect(() => {
    setCurrentParagraph(paragraph || '');
  }, [paragraph]);

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
  
  // Use separate Figma selection hooks for each element (like Product Layout)
  const [imageSelectionState, imageSelectionHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });
  
  const [logoSelectionState, logoSelectionHandlers] = useFigmaSelection({
    initialLogoUrl: logoUrl,
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });
  
  // Combined selection state for text elements (keeping existing pattern)
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    console.log('🌍 Global click outside handler called', e.target);
    
    const target = e.target as HTMLElement;
    
    if (isFigmaElementClick(target)) {
      console.log('🎯 Click on Figma element - allowing event to bubble');
      return; // Let the event bubble to the FigmaText/FigmaImage components
    }
    
    console.log('🌍 Click outside - deselecting all but keeping text popup open');
    imageSelectionHandlers.handleClickOutside();
    logoSelectionHandlers.handleClickOutside();
    textSelectionHandlers.handleClickOutside();
    // Keep text popup open but detach it from any specific element
    // The popup will remain in its current position but won't follow any text
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null, // Remove association but keep popup visible
      lastTargetElement: prev.targetElement // Remember the last target for controls
    }));
  };

  // Custom text handlers that actually update the styling
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

  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleParagraphChangeSize = (fontSize: number) => {
    setParagraphFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ paragraphFontSize: fontSize });
    }
  };

  const handleParagraphChangeFont = (fontFamily: string) => {
    setParagraphFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ paragraphFontFamily: fontFamily });
    }
  };

  const handleParagraphChangeColor = (color: string) => {
    setCurrentParagraphColor(color);
    if (onUpdate) {
      onUpdate({ paragraphColor: color });
    }
  };

  const handleParagraphChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentParagraphAlignment(alignment);
    if (onUpdate) {
      onUpdate({ paragraphAlignment: alignment });
    }
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
    // Also deselect the title to remove the blue handles
    textSelectionHandlers.handleTitleDelete();
  };

  const handleParagraphDelete = () => {
    setCurrentParagraph('');
    // Also deselect the description to remove the blue handles
    textSelectionHandlers.handleDescriptionDelete();
  };

  const handleParagraphSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Custom drag handlers that update popup position
  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    textSelectionHandlers.handleTitleDragStart(e, element);
  };

  const handleDescriptionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    textSelectionHandlers.handleDescriptionDragStart(e, element);
  };

  // Track previous dragging states to detect when dragging ends
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

  // No dynamic container styles - canvas is always fixed size

  const isImageRight = imageSide === 'right';
  const hasImage = showImage && !!imageUrl;
  const hasLogo = showLogo && !!logoUrl;

  return (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
    <div 
      className={`cover-left-image-text-right-layout relative ${className}`}
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
      {/* Image Layer - Fixed position, no layout influence */}
      {hasImage && (
        <div
          className="image-layer absolute inset-0 z-0"
          style={{ 
            left: isImageRight ? '50%' : '0%',
            width: '50%'
          }}
        >
          <FigmaImage
            src={imageUrl}
            alt={imageAlt}
            size="full"
            fit="cover"
            align="center"
            rounded={imageRounded}
            fill
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
            state={imageSelectionState}
            handlers={imageSelectionHandlers}
          />
        </div>
      )}

      {/* Logo Layer - Independent overlay, highest z-index */}
      {hasLogo && (
        <div 
          className="logo-layer absolute pointer-events-auto" 
          style={{ 
            top: '150px',
            left: isImageRight ? '44px' : 'calc(50% + 44px)',
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
            state={logoSelectionState}
            handlers={logoSelectionHandlers}
          />
        </div>
      )}

      {/* Title Layer - Independent overlay, infinite growth allowed */}
      <div 
        className="title-layer absolute pointer-events-auto" 
        style={{ 
          top: hasLogo ? '180px' : '165px',
          left: currentTitleAlignment === 'center' 
            ? (isImageRight ? '50%' : '75%') // Use 50% for centering with transform
            : currentTitleAlignment === 'right'
            ? (isImageRight ? 'calc(50% - 4px)' : 'calc(100% - 4px)') // Right align
            : (isImageRight ? '44px' : 'calc(50% + 44px)'), // Left align (default)
          transform: currentTitleAlignment === 'center' ? 'translateX(-50%)' : currentTitleAlignment === 'right' ? 'translateX(-100%)' : 'none',
          width: 'auto', // Width controlled by transform
          zIndex: 20,
          // Critical: Allow infinite expansion beyond canvas
          overflow: 'visible',
          contain: 'none',
          // Ensure no layout influence on parent
          position: 'absolute'
        }}
      >
        <FigmaText
          variant="title"
          color={titleColor}
                  fontFamily={titleFontFamily}
                  className={`${titleClassName} ${currentTitleAlignment === 'left' ? 'text-left' : currentTitleAlignment === 'center' ? 'text-center' : 'text-right'} break-words`}
                  style={{ 
                    fontSize: `${titleFontSize}px`, 
                    color: currentTitleColor,
                    textAlign: currentTitleAlignment,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '400px'
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
              // Calculate position relative to the title element in THIS specific layout
              const titleElement = document.querySelector('.cover-left-image-text-right-layout .title-layer');
              if (titleElement) {
                const titleRect = titleElement.getBoundingClientRect();
                const canvasContainer = titleElement.closest('.cover-left-image-text-right-layout') as HTMLElement;
                if (canvasContainer) {
                  const canvasRect = canvasContainer.getBoundingClientRect();
                  const relativeX = (titleRect.left - canvasRect.left) - 10;
                  const relativeY = (titleRect.top - canvasRect.top) - 50;
                  
                  setTextPopupState({
                    isOpen: true,
                    position: { x: relativeX, y: relativeY },
                    originalPosition: { x: relativeX, y: relativeY }, // Store original position
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

      {/* Description Layer - Independent overlay, fixed position */}
      <div 
        className="description-layer absolute pointer-events-auto" 
        style={{ 
          top: hasLogo ? '235px' : '220px',
          left: currentParagraphAlignment === 'center' 
            ? (isImageRight ? '50%' : '75%') // Use 50% for centering with transform
            : currentParagraphAlignment === 'right'
            ? (isImageRight ? 'calc(50% - 4px)' : 'calc(100% - 4px)') // Right align
            : (isImageRight ? '44px' : 'calc(50% + 44px)'), // Left align (default)
          transform: currentParagraphAlignment === 'center' ? 'translateX(-50%)' : currentParagraphAlignment === 'right' ? 'translateX(-100%)' : 'none',
          width: 'auto', // Width controlled by transform
          zIndex: 10
        }}
      >
        <FigmaText
          variant="body"
          color={paragraphColor}
                  fontFamily={paragraphFontFamily}
                  className={`leading-relaxed ${paragraphClassName} ${currentParagraphAlignment === 'left' ? 'text-left' : currentParagraphAlignment === 'center' ? 'text-center' : 'text-right'} break-words hyphens-none whitespace-normal text-wrap overflow-wrap-break-word`}
                  style={{ 
                    fontSize: `${paragraphFontSize}px`, 
                    color: currentParagraphColor,
                    textAlign: currentParagraphAlignment,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '300px'
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
              // Calculate position relative to the description element in THIS specific layout
              const descriptionElement = document.querySelector('.cover-left-image-text-right-layout .description-layer');
              if (descriptionElement) {
                const descriptionRect = descriptionElement.getBoundingClientRect();
                const canvasContainer = descriptionElement.closest('.cover-left-image-text-right-layout') as HTMLElement;
                if (canvasContainer) {
                  const canvasRect = canvasContainer.getBoundingClientRect();
                  const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                  const relativeY = (descriptionRect.top - canvasRect.top) - 50;
                  
                  setTextPopupState({
                    isOpen: true,
                    position: { x: relativeX, y: relativeY },
                    originalPosition: { x: relativeX, y: relativeY }, // Store original position
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

      {/* Text Popup - Rendered at layout level for proper z-index */}
      <TextPopup
        isOpen={textPopupState.isOpen}
        onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
        onChangeSize={(fontSize) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeSize(fontSize);
          } else if (target === 'description') {
            handleParagraphChangeSize(fontSize);
          }
        }}
        onChangeFont={(fontFamily) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeFont(fontFamily);
          } else if (target === 'description') {
            handleParagraphChangeFont(fontFamily);
          }
        }}
        onChangeColor={(color) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeColor(color);
          } else if (target === 'description') {
            handleParagraphChangeColor(color);
          }
        }}
        onChangeAlignment={(alignment) => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleChangeAlignment(alignment);
          } else if (target === 'description') {
            handleParagraphChangeAlignment(alignment);
          }
        }}
        onDeleteText={() => {
          const target = textPopupState.targetElement || textPopupState.lastTargetElement;
          if (target === 'title') {
            handleTitleDelete();
          } else if (target === 'description') {
            handleParagraphDelete();
          }
          setTextPopupState(prev => ({ ...prev, isOpen: false }));
        }}
        position={textPopupState.position}
        currentFontSize={textPopupState.currentFontSize}
        currentFontFamily={textPopupState.currentFontFamily}
        currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentParagraphColor}
        currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentParagraphAlignment}
      />
    </div>
    </CanvasOverlayProvider>
  );
}

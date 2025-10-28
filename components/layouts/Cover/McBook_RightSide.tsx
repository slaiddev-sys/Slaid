'use client';

import React from 'react';
import { useFigmaSelection, FigmaImage, FigmaLogo } from '../../figma';

export interface McBookRightSideProps {
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
 * McBook RightSide layout with image on left and text content on right.
 * Features Figma-style selection, drag, resize, and upload for both image and logo.
 * Responsive by default, fits within slide canvas without breaking editor layout.
 */
export default function McBook_RightSide({
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
}: McBookRightSideProps) {
  
  // Use Figma selection hooks for image and logo
  const [imageState, imageHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });
  
  const [logoState, logoHandlers] = useFigmaSelection({
    initialLogoUrl: logoUrl,
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = () => {
    imageHandlers.handleClickOutside();
    logoHandlers.handleClickOutside();
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

  // Calculate responsive padding for right column
  const rightPadding = useFixedDimensions ? Math.max(32, canvasWidth * 0.05) : 32;
  const rightColumnStyle = useFixedDimensions ? {
    paddingRight: `${rightPadding}px`,
  } : {};

  const isImageRight = imageSide === 'right';
  const hasImage = showImage && !!imageUrl;
  const hasLogo = showLogo && !!logoUrl;

  return (
    <CanvasOverlayProvider>
      <TextPopup
        isOpen={textPopupState.isOpen}
        position={textPopupState.position}
        onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
        onChangeSize={textPopupState.targetElement === 'title' ? handleTitleChangeSize : handleParagraphChangeSize}
        onChangeFont={textPopupState.targetElement === 'title' ? handleTitleChangeFont : handleParagraphChangeFont}
        onChangeColor={textPopupState.targetElement === 'title' ? handleTitleChangeColor : handleParagraphChangeColor}
        onChangeAlignment={textPopupState.targetElement === 'title' ? handleTitleChangeAlignment : handleParagraphChangeAlignment}
        onDeleteText={textPopupState.targetElement === 'title' ? handleTitleDelete : handleParagraphDelete}
        currentFontSize={textPopupState.targetElement === 'title' ? titleFontSize : paragraphFontSize}
        currentFontFamily={textPopupState.targetElement === 'title' ? titleFontFamily : paragraphFontFamily}
        currentColor={textPopupState.targetElement === 'title' ? currentTitleColor : currentParagraphColor}
        currentAlignment={textPopupState.targetElement === 'title' ? currentTitleAlignment : currentParagraphAlignment}
      />
      (
    <div 
      className={`mcbook-rightside-layout relative flex items-stretch justify-start gap-x-6 lg:gap-x-8 w-full h-full min-h-[400px] overflow-hidden ${className}`}
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
      {/* Image with Figma-style Selection - Absolute positioning for free movement */}
      {hasImage && (
        <div
          className={`absolute inset-0 z-0 ${isImageRight ? '' : ''}`}
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
            state={imageState}
            handlers={imageHandlers}
          />
        </div>
      )}

      {/* Text Column - Content Stack */}
      <div 
        className={`relative flex flex-col justify-center items-start h-full flex-1 min-w-0 z-10 ${isImageRight ? 'order-1' : 'order-2'} ${fontFamily}`}
        style={{
          ...rightColumnStyle,
          width: '50%',
          marginLeft: isImageRight ? '0%' : '50%'
        }}
      >
        {/* Use explicit margins instead of space-y so AI props can override */}
        <div className="content-stack flex flex-col w-full pl-8 lg:pl-12">
          
          {/* Optional Logo with Figma-style Selection */}
          {hasLogo && (
            <FigmaLogo
              src={logoUrl}
              alt={logoAlt}
              size="sm"
              fit="contain"
              align="left"
              className="max-w-24 lg:max-w-28 h-auto"
              containerClassName="mb-2"
              state={logoState}
              handlers={logoHandlers}
            />
          )}

          {/* Title */}
          <div className="title-container mb-2 w-full pr-8">
            <FigmaText
          variant="title"
          color={currentTitleColor}
          fontFamily={titleFontFamily}
          style={{ fontSize: `${titleFontSize}px`, textAlign: currentTitleAlignment }}
          isSelected={textSelectionState.isTitleSelected}
          transform={textSelectionState.titleTransform}
          onClick={textSelectionHandlers.handleTitleClick}
          onTextChange={(text) => setCurrentTitle(text)}
          onChangeSize={handleTitleChangeSize}
          onChangeFont={handleTitleChangeFont}
          onDragStart={textSelectionHandlers.handleTitleDragStart}
          onResizeStart={textSelectionHandlers.handleTitleResizeStart}
          onDeleteText={handleTitleDelete}>
          {title}
        </FigmaText>
          </div>

          {/* Paragraph */}
          <div className="paragraph-container w-full pr-8">
            <FigmaText
          variant="body"
          color={currentParagraphColor}
          fontFamily={paragraphFontFamily}
          style={{ fontSize: `${paragraphFontSize}px`, textAlign: currentParagraphAlignment }}
          isSelected={textSelectionState.isDescriptionSelected}
          transform={textSelectionState.descriptionTransform}
          onClick={textSelectionHandlers.handleDescriptionClick}
          onTextChange={(text) => setCurrentParagraph(text)}
          onChangeSize={handleParagraphChangeSize}
          onChangeFont={handleParagraphChangeFont}
          onDragStart={textSelectionHandlers.handleDescriptionDragStart}
          onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
          onDeleteText={handleParagraphDelete}>
          {paragraph}
        </FigmaText>
          </div>

        </div>
      </div>
    </div>
    </CanvasOverlayProvider>
  );
}

import React, { useState } from 'react';
import { useFigmaSelection, useFigmaMultiSelection, FigmaImage, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface iPhoneHandFeatureProps {
  /**
   * Main image URL for the left column
   */
  imageUrl?: string;
  
  /**
   * Alt text for the main image
   */
  imageAlt?: string;
  
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
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };

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

}

/**
 * iPhone_HandFeature - Two-column product feature layout
 * 
 * Left column (50%): Full-height product image with iPhone in hand mockup
 * Right column (50%): Vertically centered content stack (title, paragraph)
 * 
 * Responsive by default, fits within slide canvas without breaking editor layout.
 */
export default function iPhone_HandFeature({
  imageUrl = '/Default-Image-2.png',
  imageAlt = 'Product image',
  title = 'Product Presentation',
  paragraph = 'Lorem ipsum dolor sit amet consectetur adipiscing elit etiam nec suscipit dui sed cursus nibh id risus ultrices convallis phasellus vel tristique diam nam placerat.',
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  paragraphColor = 'text-gray-600',
  titleClassName = 'font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tight break-words overflow-wrap-anywhere whitespace-normal',
  paragraphClassName = 'text-[12px]',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  rightPadding,
  className = '',
  imageRounded = false,
  imageSide = 'right',
  showImage = true
}: iPhoneHandFeatureProps) {
  
  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentParagraph, setCurrentParagraph] = useState(paragraph);

  // Text styling state
  const [titleFontSize, setTitleFontSize] = useState(48);
  const [titleFontFamily, setTitleFontFamily] = useState(fontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>('left');

  const [paragraphFontSize, setParagraphFontSize] = useState(14);
  const [paragraphFontFamily, setParagraphFontFamily] = useState(fontFamily);
  const [currentParagraphColor, setCurrentParagraphColor] = useState(paragraphColor);
  const [currentParagraphAlignment, setCurrentParagraphAlignment] = useState<'left' | 'center' | 'right'>('left');

  // Text selection handlers
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });

  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetElement: null as 'title' | 'description' | null,
    currentFontSize: 16,
    currentFontFamily: fontFamily
  });

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

  // Font change handlers
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

  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
  };

  const handleParagraphDelete = () => {
    setCurrentParagraph('');
    if (onUpdate) {
      onUpdate({ paragraph: '' });
    }
  };

  // Use multi-selection hook for all images (single selection behavior)
  const [multiState, multiHandlers] = useFigmaMultiSelection({
    imageIds: ['background', 'app', 'mockup'],
    initialImageUrls: {
      background: imageUrl,
      app: '/app-ui.png',
      mockup: '/Hand-iPhone-MockUp.png'
    }
  });
  
  // Get individual image handlers
  const backgroundHandlers = multiHandlers.getImageHandlers('background');
  const appHandlers = multiHandlers.getImageHandlers('app');
  const mockupHandlers = multiHandlers.getImageHandlers('mockup');

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = () => {
    multiHandlers.handleClickOutside();
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

  // Responsive padding or fixed padding
  const rightColumnStyle = rightPadding ? {
    paddingLeft: `${rightPadding}px`,
    paddingRight: `${rightPadding}px`,
  } : {};

  const isImageRight = imageSide === 'right';
  const hasImage = showImage && !!imageUrl;

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
      className={`iphone-handfeature-layout flex items-stretch justify-start gap-x-6 lg:gap-x-8 w-full h-full min-h-[400px] overflow-hidden ${className}`}
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
      {/* Multi-Image Column with Independent Figma Selection */}
      {hasImage && (
        <div
          className={`relative h-full flex-none ${isImageRight ? 'order-2' : 'order-1'}`}
          style={{ width: '50%', flexBasis: '50%' }}>
          {/* Background Image - Independently selectable */}
          <FigmaImage
            src={imageUrl}
            alt={imageAlt}
            size="full"
            fit="cover"
            align="center"
            rounded={typeof imageRounded === 'boolean' ? imageRounded : false}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            containerClassName="w-full h-full"
            imageState={multiState.images.background}
            imageHandlers={backgroundHandlers}
          />
          
          {/* Hand iPhone Mockup - Positioned on top of background with larger sizing */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 20 }}>
            <div className="relative pointer-events-auto" style={{ width: '800px', height: '900px' }}>
              <FigmaImage
                src="/Hand-iPhone-MockUp.png"
                alt="iPhone in hand mockup"
                size="full"
                fit="contain"
                align="center"
                rounded={false}
                className="w-full h-full object-contain"
                containerClassName="w-full h-full"
                imageState={multiState.images.mockup}
                imageHandlers={mockupHandlers}
              />
            </div>
          </div>

        </div>
      )}

      {/* Right Column - Content Stack */}
      <div 
        className={`relative flex flex-col justify-center items-start h-full flex-1 min-w-0 ${isImageRight ? 'order-1' : 'order-2'} ${fontFamily} z-10`}
        style={rightColumnStyle}
      >
        {/* Use explicit margins instead of space-y so AI props can override */}
        <div className="content-stack flex flex-col w-full pl-8 lg:pl-12">

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
          onTextChange={handleTitleTextChange}
          onChangeSize={handleTitleChangeSize}
          onChangeFont={handleTitleChangeFont}
          onDragStart={textSelectionHandlers.handleTitleDragStart}
          onResizeStart={textSelectionHandlers.handleTitleResizeStart}
          onDeleteText={handleTitleDelete}>{currentTitle}
            
        </FigmaText>
          </div>

          {/* Paragraph */}
          <div className="paragraph-container max-w-64 pr-8">
            <FigmaText
          variant="body"
          color={currentParagraphColor}
          fontFamily={paragraphFontFamily}
          style={{ fontSize: `${paragraphFontSize}px`, textAlign: currentParagraphAlignment }}
          isSelected={textSelectionState.isDescriptionSelected}
          transform={textSelectionState.descriptionTransform}
          onClick={textSelectionHandlers.handleDescriptionClick}
          onTextChange={handleParagraphTextChange}
          onChangeSize={handleParagraphChangeSize}
          onChangeFont={handleParagraphChangeFont}
          onDragStart={textSelectionHandlers.handleDescriptionDragStart}
          onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
          onDeleteText={handleParagraphDelete}>{currentParagraph}
            
        </FigmaText>
          </div>

        </div>
      </div>
    </div>
    </CanvasOverlayProvider>
  );
}

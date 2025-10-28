import React, { useRef, useEffect, useState } from 'react';
import ImageBlock from '../blocks/ImageBlock';
import { FigmaSelectionState, FigmaSelectionHandlers, FigmaTransform } from '../hooks/useFigmaSelection';
import ImagePopup from './ImagePopup';
import { useCanvasOverlay } from './CanvasOverlay';

// Simple selection outline component that positions itself around the actual image
interface SelectionOutlineProps {
  imageElement: HTMLImageElement;
  containerElement: HTMLDivElement;
  imageTransform: FigmaTransform;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

function SelectionOutline({ imageElement, containerElement, imageTransform, onResizeStart }: SelectionOutlineProps) {
  // Use the same simple approach as FigmaLogo - just cover the container
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        outline: '2px solid #1FB6FF',
        outlineOffset: '-2px'
      }}
    >
      {/* Corner Resize Handles - Same as FigmaLogo */}
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 -left-1 cursor-nw-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="nw"
        onMouseDown={(e) => onResizeStart(e, 'nw')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 -right-1 cursor-ne-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="ne"
        onMouseDown={(e) => onResizeStart(e, 'ne')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 -left-1 cursor-sw-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="sw"
        onMouseDown={(e) => onResizeStart(e, 'sw')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 -right-1 cursor-se-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="se"
        onMouseDown={(e) => onResizeStart(e, 'se')}
      ></div>
      
      {/* Side Resize Handles - Same as FigmaLogo */}
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="n"
        onMouseDown={(e) => onResizeStart(e, 'n')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="s"
        onMouseDown={(e) => onResizeStart(e, 's')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 top-1/2 -left-1 transform -translate-y-1/2 cursor-w-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="w"
        onMouseDown={(e) => onResizeStart(e, 'w')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 top-1/2 -right-1 transform -translate-y-1/2 cursor-e-resize pointer-events-auto hover:bg-blue-50"
        data-resize-handle="e"
        onMouseDown={(e) => onResizeStart(e, 'e')}
      ></div>
    </div>
  );
}

export interface FigmaImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  align?: 'left' | 'center' | 'right';
  rounded?: boolean;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  // Support both old and new selection patterns
  state?: FigmaSelectionState;
  handlers?: FigmaSelectionHandlers;
  // New multi-selection pattern
  imageState?: {
    currentUrl: string;
    isHovered: boolean;
    isIconHovered: boolean;
    isSelected: boolean;
    isDragging: boolean;
    dragHandle: string | null;
    transform: FigmaTransform;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
  };
  imageHandlers?: {
    handleUpload: () => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleClick: (e: React.MouseEvent) => void;
    handleDragStart: (e: React.MouseEvent) => void;
    handleResizeStart: (e: React.MouseEvent, handle: string) => void;
    handleImageDelete: () => void;
    setIsHovered: (hovered: boolean) => void;
    setIsIconHovered: (hovered: boolean) => void;
  };
  children?: React.ReactNode; // For complex image structures like mockups

  /**
   * Canvas editing update handler - called when image changes
   */
  onUpdate?: (updates: any) => void;
}

export default function FigmaImage({
  src,
  alt,
  size = 'full',
  fit = 'cover',
  align = 'center',
  rounded = false,
  fill = false,
  className = '',
  containerClassName = '',
  containerStyle = {},
  state,
  handlers,
  imageState,
  imageHandlers,
  children,
  onUpdate
}: FigmaImageProps) {
  
  // Support both old and new selection patterns
  const useNewPattern = imageState && imageHandlers;
  
  // Extract state values
  const currentImageUrl = useNewPattern ? imageState.currentUrl : state?.currentImageUrl;
  const isImageHovered = useNewPattern ? imageState.isHovered : state?.isImageHovered;
  const isImageIconHovered = useNewPattern ? imageState.isIconHovered : state?.isImageIconHovered;
  const isImageSelected = useNewPattern ? imageState.isSelected : state?.isImageSelected;
  const isImageDragging = useNewPattern ? imageState.isDragging : state?.isImageDragging;
  const imageDragHandle = useNewPattern ? imageState.dragHandle : state?.imageDragHandle;
  const imageTransform = useNewPattern ? imageState.transform : state?.imageTransform;
  const imageFileInputRef = useNewPattern ? imageState.fileInputRef : state?.imageFileInputRef;
  const imageContainerRef = useNewPattern ? imageState.containerRef : state?.imageContainerRef;
  
  // Extract handler functions
  const handleImageUpload = useNewPattern ? imageHandlers.handleUpload : handlers?.handleImageUpload;
  const handleImageFileChange = useNewPattern ? imageHandlers.handleFileChange : handlers?.handleImageFileChange;
  const handleImageClick = useNewPattern ? imageHandlers.handleClick : handlers?.handleImageClick;
  const handleImageDragStart = useNewPattern ? imageHandlers.handleDragStart : handlers?.handleImageDragStart;
  const handleImageResizeStart = useNewPattern ? imageHandlers.handleResizeStart : handlers?.handleImageResizeStart;
  const setIsImageHovered = useNewPattern ? imageHandlers.setIsHovered : handlers?.setIsImageHovered;
  const setIsImageIconHovered = useNewPattern ? imageHandlers.setIsIconHovered : handlers?.setIsImageIconHovered;

  const imageRef = useRef<HTMLImageElement>(null);
  
  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // Canvas overlay for unified popup positioning (optional)
  let canvasOverlay;
  try {
    canvasOverlay = useCanvasOverlay();
  } catch (error) {
    // Canvas overlay not available, use fallback behavior
    canvasOverlay = null;
  }
  

  // Handle image click to show popup and selection handles
  const handleImageClickWithPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (canvasOverlay) {
      // Use canvas overlay system (new unified approach)
      const position = canvasOverlay.calculatePosition(e);
      if (position) {
        // Show popup in canvas overlay
        canvasOverlay.showPopup(
          <ImagePopup
            isOpen={true}
            onClose={() => {
              canvasOverlay.hidePopup();
              setShowPopup(false);
            }}
            onChangeImage={handleChangeImage}
            onDeleteImage={handleDeleteImage}
            position={{ x: 0, y: 0 }} // Position handled by overlay
          />,
          { x: position.x, y: position.y - 8 } // 8px offset above click
        );
        
        setShowPopup(true);
      }
    } else {
      // Fallback to old behavior for layouts without CanvasOverlay
      const imageElement = imageContainerRef?.current;
      if (imageElement) {
        // Find the canvas container (the layout root with fixed dimensions)
        const canvasContainer = imageElement.closest('[class*="cover-"][class*="-layout"]') as HTMLElement;
        
        if (canvasContainer) {
          const canvasRect = canvasContainer.getBoundingClientRect();
          
          // Calculate canvas scale using rect.width / 1280 method
          const scale = canvasRect.width / 1280;
          
          // Convert click position to canvas-relative coordinates
          const clickX = e.clientX;
          const clickY = e.clientY;
          const canvasRelativeX = (clickX - canvasRect.left) / scale;
          const canvasRelativeY = (clickY - canvasRect.top) / scale;
          
          // Position popup at click location with 8px upward offset
          const popupWidth = 200; // Approximate popup width
          const offset = 8; // 8px upward offset
          
          const position = {
            x: canvasRelativeX - (popupWidth / 2), // Center popup horizontally on click
            y: canvasRelativeY - offset // 8px above click point
          };
          
          setPopupPosition(position);
          setShowPopup(true);
        }
      }
    }
    
    // First, trigger the original selection behavior to show handles
    handleImageClick?.(e);
  };

  // Handle change image
  const handleChangeImage = () => {
    if (imageFileInputRef?.current) {
      imageFileInputRef.current.click();
    } else {
      handleImageUpload?.();
    }
  };

  // Handle delete image - simply hide the image
  const handleDeleteImage = () => {
    // SIMPLE SOLUTION: Just hide the image by setting display to none
    if (imageContainerRef?.current) {
      imageContainerRef.current.style.display = 'none';
    }
    
    // Close the popup
    setShowPopup(false);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
      
      {/* Image Container with Selection */}
      <div
        ref={imageContainerRef}
        className={`relative ${isImageDragging ? '' : 'transition-all duration-200'} ${
          isImageSelected ? (isImageDragging && imageDragHandle === 'move' ? 'cursor-grabbing' : 'cursor-pointer') : 'cursor-pointer hover:brightness-95'
        } ${isImageDragging ? 'select-none' : ''} ${containerClassName}`}
        onMouseEnter={() => setIsImageHovered?.(true)}
        onMouseLeave={() => setIsImageHovered?.(false)}
        onClick={handleImageClickWithPopup}
        onMouseDown={handleImageDragStart}
        style={{
          transform: imageTransform ? `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) scaleX(${imageTransform.scaleX}) scaleY(${imageTransform.scaleY})` : 'none',
          transformOrigin: 'center center',
          ...containerStyle
        }}
      >
        {/* Base Image - Only render if there's a valid src */}
        {(currentImageUrl || src) && (
          <div className="w-full h-full">
            <img
              ref={imageRef}
              src={currentImageUrl || src}
              alt={alt}
              className={`${className} ${
                fit === 'cover' ? 'object-cover' :
                fit === 'contain' ? 'object-contain' :
                fit === 'fill' ? 'object-fill' :
                fit === 'scale-down' ? 'object-scale-down' : 'object-cover'
              } ${
                align === 'left' ? 'object-left' :
                align === 'right' ? 'object-right' : 'object-center'
              } ${fill ? 'w-full h-full' : 'w-full h-auto'}`}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        )}
        
        {/* Show placeholder when image is deleted */}
        {!(currentImageUrl || src) && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-sm">Image removed</p>
              <p className="text-xs">Right-click to add new image</p>
            </div>
          </div>
        )}
        
        {/* Children (for complex structures like mockups) */}
        {children}
        
        
        {/* Figma-style Selection Outline - Fixed position relative to actual image */}
        {isImageSelected && imageRef.current && imageContainerRef?.current && imageTransform && handleImageResizeStart && (
          <SelectionOutline
            imageElement={imageRef.current}
            containerElement={imageContainerRef.current}
            imageTransform={imageTransform}
            onResizeStart={handleImageResizeStart}
          />
        )}
      </div>

      {/* Image Popup - CanvasOverlay or fallback */}
      {!canvasOverlay && (
        <ImagePopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onChangeImage={handleChangeImage}
          onDeleteImage={handleDeleteImage}
          position={popupPosition}
        />
      )}

    </>
  );
}

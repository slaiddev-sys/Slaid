import React, { useState } from 'react';
import ImageBlock from '../blocks/ImageBlock';
import ImagePopup from './ImagePopup';
import { useCanvasOverlay } from './CanvasOverlay';
import { FigmaSelectionState, FigmaSelectionHandlers } from '../hooks/useFigmaSelection';

export interface FigmaLogoProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  align?: 'left' | 'center' | 'right';
  className?: string;
  containerClassName?: string;
  state: FigmaSelectionState;
  handlers: FigmaSelectionHandlers;
  onUpdate?: (newSrc: string) => void;
}

export default function FigmaLogo({
  src,
  alt,
  size = 'sm',
  fit = 'contain',
  align = 'left',
  className = 'max-w-24 lg:max-w-28 h-auto',
  containerClassName = 'mb-2',
  state,
  handlers,
  onUpdate
}: FigmaLogoProps) {
  
  const {
    currentLogoUrl,
    isLogoHovered,
    isLogoIconHovered,
    isLogoSelected,
    isLogoDragging,
    logoDragHandle,
    logoTransform,
    logoFileInputRef,
    logoContainerRef
  } = state;

  const {
    handleLogoUpload,
    handleLogoFileChange,
    handleLogoClick,
    handleLogoDragStart,
    handleLogoResizeStart,
    setIsLogoHovered,
    setIsLogoIconHovered
  } = handlers;

  // Popup state for logo management
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

  // Handle logo click to show popup and selection handles
  const handleLogoClickWithPopup = (e: React.MouseEvent) => {
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
            onChangeImage={handleChangeLogo}
            onDeleteImage={handleDeleteLogo}
            position={{ x: 0, y: 0 }} // Position handled by overlay
          />,
          { x: position.x, y: position.y - 8 } // 8px offset above click
        );
        
        setShowPopup(true);
      }
    } else {
      // Fallback to old behavior for layouts without CanvasOverlay
      const logoElement = logoContainerRef.current;
      if (logoElement) {
        // Find the canvas container (the layout root with fixed dimensions)
        const canvasContainer = logoElement.closest('[class*="cover-"][class*="-layout"]') as HTMLElement;
        
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
    handleLogoClick?.(e);
  };

  // Handle delete logo
  const handleDeleteLogo = () => {
    // Hide the logo by setting display to none
    if (logoContainerRef?.current) {
      logoContainerRef.current.style.display = 'none';
    }
    
    // Close the popup
    setShowPopup(false);
  };

  // Handle change logo
  const handleChangeLogo = () => {
    if (logoFileInputRef?.current) {
      logoFileInputRef.current.click();
    }
    setShowPopup(false);
  };

  return (
    <div className={`logo-container ${containerClassName}`}>
      {/* Hidden logo file input */}
      <input
        ref={logoFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoFileChange}
        className="hidden"
      />
      
      <div
        ref={logoContainerRef}
        className={`relative inline-block ${isLogoDragging ? '' : 'transition-all duration-200'} ${
          isLogoSelected ? (isLogoDragging && logoDragHandle === 'move' ? 'cursor-grabbing' : 'cursor-move') : 'cursor-pointer hover:brightness-95'
        } ${isLogoDragging ? 'select-none' : ''}`}
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => setIsLogoHovered(false)}
        onClick={handleLogoClickWithPopup}
        onMouseDown={handleLogoDragStart}
        style={{
          transform: `translate(${logoTransform.x}px, ${logoTransform.y}px) scale(${logoTransform.scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Base Logo */}
        <ImageBlock 
          src={currentLogoUrl || src} 
          alt={alt} 
          size={size} 
          fit={fit} 
          align={align} 
          className={`transition-all duration-200 ${isLogoHovered ? 'brightness-75' : ''} ${className}`}
        />
        
        {/* Figma-style Selection Outline */}
        {isLogoSelected && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              outline: '2px solid #1FB6FF',
              outlineOffset: '-2px'
            }}
          >
            {/* Corner Resize Handles */}
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 -left-1 cursor-nw-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="nw"
              onMouseDown={(e) => handleLogoResizeStart(e, 'nw')}
            ></div>
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 -right-1 cursor-ne-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="ne"
              onMouseDown={(e) => handleLogoResizeStart(e, 'ne')}
            ></div>
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 -left-1 cursor-sw-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="sw"
              onMouseDown={(e) => handleLogoResizeStart(e, 'sw')}
            ></div>
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 -right-1 cursor-se-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="se"
              onMouseDown={(e) => handleLogoResizeStart(e, 'se')}
            ></div>
            
            {/* Side Resize Handles */}
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="n"
              onMouseDown={(e) => handleLogoResizeStart(e, 'n')}
            ></div>
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="s"
              onMouseDown={(e) => handleLogoResizeStart(e, 's')}
            ></div>
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 top-1/2 -left-1 transform -translate-y-1/2 cursor-w-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="w"
              onMouseDown={(e) => handleLogoResizeStart(e, 'w')}
            ></div>
            <div 
              className="absolute w-2 h-2 bg-white border border-blue-500 top-1/2 -right-1 transform -translate-y-1/2 cursor-e-resize pointer-events-auto hover:bg-blue-50"
              data-resize-handle="e"
              onMouseDown={(e) => handleLogoResizeStart(e, 'e')}
            ></div>
          </div>
        )}
      </div>

      {/* Logo Popup - CanvasOverlay or fallback */}
      {!canvasOverlay && (
        <ImagePopup
          isOpen={showPopup}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onDeleteImage={handleDeleteLogo}
          onChangeImage={handleChangeLogo}
        />
      )}
    </div>
  );
}

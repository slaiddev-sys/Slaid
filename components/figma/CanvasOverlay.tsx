import React, { createContext, useContext, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface CanvasOverlayContextType {
  canvasRef: React.RefObject<HTMLDivElement>;
  showPopup: (popup: React.ReactNode, position: { x: number; y: number }) => void;
  hidePopup: () => void;
  calculatePosition: (e: React.MouseEvent) => { x: number; y: number } | null;
}

const CanvasOverlayContext = createContext<CanvasOverlayContextType | null>(null);

export function useCanvasOverlay() {
  const context = useContext(CanvasOverlayContext);
  if (!context) {
    throw new Error('useCanvasOverlay must be used within a CanvasOverlayProvider');
  }
  return context;
}

interface CanvasOverlayProviderProps {
  children: React.ReactNode;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function CanvasOverlayProvider({ 
  children, 
  canvasWidth = 1280, 
  canvasHeight = 720 
}: CanvasOverlayProviderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentPopup, setCurrentPopup] = React.useState<{
    content: React.ReactNode;
    position: { x: number; y: number };
  } | null>(null);

  const calculatePosition = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate canvas scale using rect.width / 1280 method
    const scale = canvasRect.width / canvasWidth;
    
    // Convert click position to canvas-relative coordinates
    const clickX = e.clientX;
    const clickY = e.clientY;
    const canvasRelativeX = (clickX - canvasRect.left) / scale;
    const canvasRelativeY = (clickY - canvasRect.top) / scale;

    // Debug logging
    console.log('🎯 CANVAS OVERLAY POSITION:', {
      canvasRect: { 
        left: canvasRect.left, 
        top: canvasRect.top, 
        width: canvasRect.width, 
        height: canvasRect.height 
      },
      canvasScale: scale,
      clickViewport: { x: clickX, y: clickY },
      clickCanvas: { x: canvasRelativeX, y: canvasRelativeY }
    });

    return { x: canvasRelativeX, y: canvasRelativeY };
  }, [canvasWidth]);

  const showPopup = useCallback((popup: React.ReactNode, position: { x: number; y: number }) => {
    setCurrentPopup({ content: popup, position });
  }, []);

  const hidePopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  const contextValue: CanvasOverlayContextType = {
    canvasRef,
    showPopup,
    hidePopup,
    calculatePosition
  };

  return (
    <CanvasOverlayContext.Provider value={contextValue}>
      <div 
        ref={canvasRef}
        className="relative"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        {children}
        
        {/* Canvas Overlay for Popups */}
        {currentPopup && (
          <div
            className="absolute z-[99999999] pointer-events-none"
            style={{
              left: `${currentPopup.position.x}px`,
              top: `${currentPopup.position.y}px`,
              transform: 'translate(-50%, -100%)', // Center horizontally, position above
            }}
          >
            <div className="pointer-events-auto">
              {currentPopup.content}
            </div>
          </div>
        )}
      </div>
    </CanvasOverlayContext.Provider>
  );
}

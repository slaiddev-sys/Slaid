/**
 * Shared popup positioning logic for FigmaImage and FigmaLogo
 * Ensures both popups use identical coordinate conversion and canvas scale calculation
 */

export interface PopupPosition {
  x: number;
  y: number;
}

export interface CanvasInfo {
  rect: DOMRect;
  scale: number;
  element: HTMLElement;
}

/**
 * Calculate canvas scale using rect.width / 1280 method
 */
export function getCanvasScale(canvasRect: DOMRect): number {
  return canvasRect.width / 1280;
}

/**
 * Get canvas container and its info
 */
export function getCanvasInfo(element: HTMLElement): CanvasInfo | null {
  const canvasContainer = element.closest('[class*="cover-"][class*="-layout"]') as HTMLElement;
  if (!canvasContainer) return null;
  
  const rect = canvasContainer.getBoundingClientRect();
  const scale = getCanvasScale(rect);
  
  return {
    rect,
    scale,
    element: canvasContainer
  };
}

/**
 * Convert click coordinates to canvas-relative position
 */
export function calculatePopupPosition(
  clickEvent: React.MouseEvent,
  element: HTMLElement,
  options: {
    popupWidth?: number;
    offsetY?: number;
  } = {}
): PopupPosition | null {
  const { popupWidth = 200, offsetY = 8 } = options;
  
  const canvasInfo = getCanvasInfo(element);
  if (!canvasInfo) return null;
  
  // Convert click position to canvas-relative coordinates
  const clickX = clickEvent.clientX;
  const clickY = clickEvent.clientY;
  const canvasRelativeX = (clickX - canvasInfo.rect.left) / canvasInfo.scale;
  const canvasRelativeY = (clickY - canvasInfo.rect.top) / canvasInfo.scale;
  
  // Position popup centered horizontally on click, with upward offset
  const position = {
    x: canvasRelativeX - (popupWidth / 2), // Center popup horizontally on click
    y: canvasRelativeY - offsetY // Offset above click point
  };
  
  // Debug logging
  console.log('🎯 POPUP POSITION DEBUG:', {
    canvasSelector: canvasInfo.element.className || canvasInfo.element.tagName,
    canvasRect: { 
      left: canvasInfo.rect.left, 
      top: canvasInfo.rect.top, 
      width: canvasInfo.rect.width, 
      height: canvasInfo.rect.height 
    },
    canvasScale: canvasInfo.scale,
    clickViewport: { x: clickX, y: clickY },
    clickCanvas: { x: canvasRelativeX, y: canvasRelativeY },
    finalPosition: position
  });
  
  return position;
}

/**
 * Add debug crosshair at the computed position (temporary for debugging)
 */
export function addDebugCrosshair(position: PopupPosition, canvasElement: HTMLElement, id: string) {
  // Remove existing crosshair
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  
  // Create crosshair
  const crosshair = document.createElement('div');
  crosshair.id = id;
  crosshair.style.cssText = `
    position: absolute;
    left: ${position.x}px;
    top: ${position.y}px;
    width: 20px;
    height: 20px;
    pointer-events: none;
    z-index: 999999;
    transform: translate(-50%, -50%);
  `;
  crosshair.innerHTML = `
    <div style="
      position: absolute;
      left: 50%;
      top: 0;
      width: 1px;
      height: 20px;
      background: red;
      transform: translateX(-50%);
    "></div>
    <div style="
      position: absolute;
      left: 0;
      top: 50%;
      width: 20px;
      height: 1px;
      background: red;
      transform: translateY(-50%);
    "></div>
  `;
  
  canvasElement.appendChild(crosshair);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 3000);
}

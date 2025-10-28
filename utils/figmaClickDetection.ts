/**
 * Utility function to detect if a click should be allowed to reach Figma elements
 * This helps prevent global click handlers from interfering with text and image interactions
 */

export function isFigmaElementClick(target: HTMLElement): boolean {
  // Check for various ways a click might be on a Figma element
  return !!(
    target.closest('[class*="figma-"]') || 
    target.closest('[data-figma-element]') ||
    target.closest('.title-layer') ||
    target.closest('.description-layer') ||
    target.closest('.image-layer') ||
    target.closest('.logo-layer') ||
    target.closest('[data-text-popup]') ||
    target.closest('[data-color-area]') ||
    target.closest('[data-hue-slider]') ||
    // Also check if the element itself has these attributes
    target.hasAttribute('contenteditable') ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    // Check if it's inside a contenteditable element
    target.closest('[contenteditable="true"]') ||
    // Check if it's a text element that should be clickable
    target.closest('h1, h2, h3, h4, h5, h6, p, span, div[role="textbox"]') ||
    // Check if it's inside a FigmaText or FigmaImage component container
    target.closest('[data-component-type]') ||
    // Check for specific layout layer classes
    target.closest('.figma-text-container') ||
    target.closest('.figma-image-container') ||
    // Additional safety checks for common interactive elements
    target.closest('button') ||
    target.closest('a') ||
    target.closest('[role="button"]') ||
    target.closest('[tabindex]')
  );
}

/**
 * Enhanced global click outside handler that properly detects Figma elements
 */
export function createGlobalClickOutsideHandler(
  deselectionCallbacks: (() => void)[]
) {
  return (e: React.MouseEvent) => {
    console.log('🌍 Global click outside handler called', e.target);
    
    const target = e.target as HTMLElement;
    
    if (isFigmaElementClick(target)) {
      console.log('🎯 Click on Figma element - allowing event to bubble');
      return; // Let the event bubble to the FigmaText/FigmaImage components
    }
    
    console.log('🌍 Click outside - deselecting all elements');
    // Call all deselection callbacks
    deselectionCallbacks.forEach(callback => callback());
  };
}

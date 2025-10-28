/**
 * Universal Autosave Wrapper - Automatically wraps ALL components
 * 
 * This system automatically detects and saves text changes across ALL components
 * without requiring any manual integration or component modifications.
 */

import React from 'react';

// Global state to track autosave
let globalAutosaveContext: {
  trackEdit?: (patch: any) => void;
  slideId?: string;
  presentationId?: number;
} = {};

// Set the global context (called from editor)
export function setGlobalAutosaveContext(context: typeof globalAutosaveContext) {
  globalAutosaveContext = context;
}

// Universal text change detector
export function setupUniversalAutosave() {
  // Remove existing listeners to avoid duplicates
  document.removeEventListener('input', handleGlobalTextChange, true);
  document.removeEventListener('blur', handleGlobalTextChange, true);
  
  // Add global listeners
  document.addEventListener('input', handleGlobalTextChange, true);
  document.addEventListener('blur', handleGlobalTextChange, true);
  
  console.log('🚀 Universal autosave system activated');
}

// Global text change handler
function handleGlobalTextChange(event: Event) {
  const target = event.target as HTMLElement;
  
  // Only process contentEditable elements and inputs
  if (!target.isContentEditable && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
    return;
  }
  
  // Skip if no autosave context
  if (!globalAutosaveContext.trackEdit) {
    return;
  }
  
  console.log('🎯 Universal autosave - DOM event detected:', {
    eventType: event.type,
    tagName: target.tagName,
    isContentEditable: target.isContentEditable,
    textContent: target.textContent?.substring(0, 30) + '...'
  });
  
  // Get the text content
  const newValue = target.textContent || (target as HTMLInputElement).value;
  if (!newValue || newValue.trim() === '') {
    return;
  }
  
  // Try to determine what was changed by looking at element attributes and classes
  let propPath = 'text';
  let blockIndex = 0;
  
  // Look for data attributes that indicate the property
  if (target.hasAttribute('data-prop')) {
    propPath = target.getAttribute('data-prop') || 'text';
  } else if (target.hasAttribute('data-field')) {
    propPath = target.getAttribute('data-field') || 'text';
  } else {
    // Guess based on classes and content
    const classes = target.className.toLowerCase();
    if (classes.includes('title') || target.tagName === 'H1' || target.tagName === 'H2') {
      propPath = 'title';
    } else if (classes.includes('description') || classes.includes('paragraph')) {
      propPath = 'description';
    } else if (classes.includes('quote')) {
      propPath = 'quote';
    } else if (classes.includes('author') || classes.includes('attribution')) {
      propPath = 'author';
    }
  }
  
  // Look for block index
  const blockContainer = target.closest('[data-block-index]');
  if (blockContainer) {
    blockIndex = parseInt(blockContainer.getAttribute('data-block-index') || '0');
  } else {
    // Try to find the layout component and guess it's block 1 (after background)
    const layoutContainer = target.closest('[class*="layout-"], [class*="Cover_"], [class*="Team_"], [class*="Quote_"], [class*="BackCover_"]');
    if (layoutContainer) {
      blockIndex = 1;
    }
  }
  
  console.log('🎯 Universal autosave detected change:', {
    propPath,
    blockIndex,
    newValue: newValue.substring(0, 50) + '...',
    tagName: target.tagName,
    classes: target.className
  });
  
  // Create the patch
  const patch = {
    blocks: {
      [blockIndex]: {
        props: {
          [propPath]: newValue
        }
      }
    }
  };
  
  // Debounce the save
  clearTimeout((window as any).universalAutosaveTimeout);
  (window as any).universalAutosaveTimeout = setTimeout(() => {
    console.log('🚀 Universal autosave - calling trackEdit with patch:', patch);
    globalAutosaveContext.trackEdit?.(patch);
  }, 2000); // Increased to 2 seconds to match main autosave debounce
}

// Component wrapper that adds autosave data attributes
export function withUniversalAutosave<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  componentType: string
) {
  const AutosaveWrappedComponent = React.forwardRef<any, T>((props, ref) => {
    return (
      <div 
        data-component-type={componentType}
        data-block-index={1} // Most layout components are block 1 (after background)
        className={`autosave-wrapper ${componentType.toLowerCase()}`}
      >
        <WrappedComponent {...props} ref={ref} />
      </div>
    );
  });
  
  AutosaveWrappedComponent.displayName = `withUniversalAutosave(${componentType})`;
  return AutosaveWrappedComponent;
}

// Enhanced component map that automatically adds autosave
export function createAutosaveComponentMap(originalComponents: Record<string, React.ComponentType<any>>) {
  const autosaveComponents: Record<string, React.ComponentType<any>> = {};
  
  Object.entries(originalComponents).forEach(([name, Component]) => {
    autosaveComponents[name] = withUniversalAutosave(Component, name);
  });
  
  return autosaveComponents;
}

// Hook for manual autosave integration (if needed)
export function useUniversalAutosave() {
  React.useEffect(() => {
    setupUniversalAutosave();
    
    return () => {
      document.removeEventListener('input', handleGlobalTextChange, true);
      document.removeEventListener('blur', handleGlobalTextChange, true);
    };
  }, []);
  
  return {
    setContext: setGlobalAutosaveContext,
    isActive: !!globalAutosaveContext.trackEdit
  };
}

export default {
  setupUniversalAutosave,
  setGlobalAutosaveContext,
  withUniversalAutosave,
  createAutosaveComponentMap,
  useUniversalAutosave
};

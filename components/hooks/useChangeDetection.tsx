/**
 * Enhanced Change Detection System for SlaidAI
 * 
 * This system provides comprehensive change detection for all types of user interactions:
 * - Text editing in contentEditable elements
 * - Form input changes
 * - Drag and drop operations
 * - Element resizing and repositioning
 * - Style and formatting changes
 * - Image uploads and replacements
 * - Component prop modifications
 */

import React, { useCallback, useEffect, useRef } from 'react';

// Types for change detection
export interface ChangeEvent {
  type: 'text' | 'style' | 'position' | 'size' | 'image' | 'props' | 'structure';
  element: HTMLElement;
  slideId?: string;
  blockIndex?: number;
  property?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: number;
}

export interface ChangeDetectionConfig {
  enableTextChanges?: boolean;
  enableStyleChanges?: boolean;
  enablePositionChanges?: boolean;
  enableImageChanges?: boolean;
  enableStructuralChanges?: boolean;
  debounceMs?: number;
  onChangeDetected?: (change: ChangeEvent) => void;
}

const DEFAULT_CONFIG: Required<ChangeDetectionConfig> = {
  enableTextChanges: true,
  enableStyleChanges: true,
  enablePositionChanges: true,
  enableImageChanges: true,
  enableStructuralChanges: true,
  debounceMs: 100,
  onChangeDetected: () => {},
};

/**
 * Enhanced Change Detection Hook
 */
export function useChangeDetection(config: ChangeDetectionConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const changeBufferRef = useRef<ChangeEvent[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<MutationObserver>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const lastPositionsRef = useRef<Map<Element, { x: number; y: number }>>(new Map());
  
  // Flush buffered changes
  const flushChanges = useCallback(() => {
    if (changeBufferRef.current.length > 0) {
      changeBufferRef.current.forEach(change => {
        finalConfig.onChangeDetected(change);
      });
      changeBufferRef.current = [];
    }
  }, [finalConfig]);
  
  // Add change to buffer with debouncing
  const addChange = useCallback((change: ChangeEvent) => {
    changeBufferRef.current.push(change);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      flushChanges();
    }, finalConfig.debounceMs);
  }, [flushChanges, finalConfig.debounceMs]);
  
  // Get slide and block information from element
  const getElementContext = useCallback((element: HTMLElement) => {
    // Look for slide container
    const slideContainer = element.closest('[data-slide-id]');
    const slideId = slideContainer?.getAttribute('data-slide-id') || undefined;
    
    // Look for block container
    const blockContainer = element.closest('[data-block-index]');
    const blockIndex = blockContainer ? parseInt(blockContainer.getAttribute('data-block-index') || '0') : undefined;
    
    return { slideId, blockIndex };
  }, []);
  
  // Text change detection
  const handleTextChange = useCallback((event: Event) => {
    if (!finalConfig.enableTextChanges) return;
    
    const target = event.target as HTMLElement;
    
    // Only process editable elements
    if (!target.isContentEditable && 
        target.tagName !== 'INPUT' && 
        target.tagName !== 'TEXTAREA') {
      return;
    }
    
    const context = getElementContext(target);
    const newValue = target.textContent || (target as HTMLInputElement).value;
    
    addChange({
      type: 'text',
      element: target,
      ...context,
      property: 'textContent',
      newValue,
      timestamp: Date.now(),
    });
  }, [finalConfig.enableTextChanges, getElementContext, addChange]);
  
  // Style change detection
  const handleStyleChange = useCallback((element: HTMLElement, property: string, newValue: string) => {
    if (!finalConfig.enableStyleChanges) return;
    
    const context = getElementContext(element);
    
    addChange({
      type: 'style',
      element,
      ...context,
      property,
      newValue,
      timestamp: Date.now(),
    });
  }, [finalConfig.enableStyleChanges, getElementContext, addChange]);
  
  // Position change detection
  const handlePositionChange = useCallback((element: Element) => {
    if (!finalConfig.enablePositionChanges) return;
    
    const rect = element.getBoundingClientRect();
    const newPosition = { x: rect.left, y: rect.top };
    const lastPosition = lastPositionsRef.current.get(element);
    
    if (!lastPosition || 
        Math.abs(newPosition.x - lastPosition.x) > 1 || 
        Math.abs(newPosition.y - lastPosition.y) > 1) {
      
      const context = getElementContext(element as HTMLElement);
      
      addChange({
        type: 'position',
        element: element as HTMLElement,
        ...context,
        property: 'position',
        oldValue: lastPosition,
        newValue: newPosition,
        timestamp: Date.now(),
      });
      
      lastPositionsRef.current.set(element, newPosition);
    }
  }, [finalConfig.enablePositionChanges, getElementContext, addChange]);
  
  // Size change detection
  const handleSizeChange = useCallback((entries: ResizeObserverEntry[]) => {
    if (!finalConfig.enablePositionChanges) return;
    
    entries.forEach(entry => {
      const element = entry.target as HTMLElement;
      const context = getElementContext(element);
      
      addChange({
        type: 'size',
        element,
        ...context,
        property: 'size',
        newValue: {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        },
        timestamp: Date.now(),
      });
    });
  }, [finalConfig.enablePositionChanges, getElementContext, addChange]);
  
  // Image change detection
  const handleImageChange = useCallback((element: HTMLImageElement) => {
    if (!finalConfig.enableImageChanges) return;
    
    const context = getElementContext(element);
    
    addChange({
      type: 'image',
      element,
      ...context,
      property: 'src',
      newValue: element.src,
      timestamp: Date.now(),
    });
  }, [finalConfig.enableImageChanges, getElementContext, addChange]);
  
  // Setup event listeners
  useEffect(() => {
    const eventListeners: Array<{
      target: EventTarget;
      event: string;
      handler: EventListener;
      options?: boolean | AddEventListenerOptions;
    }> = [];
    
    // Text input events
    if (finalConfig.enableTextChanges) {
      const textEvents = ['input', 'blur', 'paste', 'keyup'];
      textEvents.forEach(eventType => {
        document.addEventListener(eventType, handleTextChange, true);
        eventListeners.push({
          target: document,
          event: eventType,
          handler: handleTextChange,
          options: true,
        });
      });
    }
    
    // Drag and drop events for position changes
    if (finalConfig.enablePositionChanges) {
      const dragEvents = ['dragend', 'drop'];
      dragEvents.forEach(eventType => {
        document.addEventListener(eventType, (event) => {
          const target = event.target as HTMLElement;
          if (target && target.draggable) {
            setTimeout(() => handlePositionChange(target), 0);
          }
        }, true);
        eventListeners.push({
          target: document,
          event: eventType,
          handler: (event) => {
            const target = event.target as HTMLElement;
            if (target && target.draggable) {
              setTimeout(() => handlePositionChange(target), 0);
            }
          },
          options: true,
        });
      });
    }
    
    // Image load events
    if (finalConfig.enableImageChanges) {
      document.addEventListener('load', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          handleImageChange(target as HTMLImageElement);
        }
      }, true);
      eventListeners.push({
        target: document,
        event: 'load',
        handler: (event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'IMG') {
            handleImageChange(target as HTMLImageElement);
          }
        },
        options: true,
      });
    }
    
    // Cleanup function
    return () => {
      eventListeners.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
      });
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    finalConfig.enableTextChanges,
    finalConfig.enablePositionChanges,
    finalConfig.enableImageChanges,
    handleTextChange,
    handlePositionChange,
    handleImageChange,
  ]);
  
  // Setup MutationObserver for structural changes
  useEffect(() => {
    if (!finalConfig.enableStructuralChanges) return;
    
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target as HTMLElement;
        const context = getElementContext(target);
        
        if (mutation.type === 'childList') {
          addChange({
            type: 'structure',
            element: target,
            ...context,
            property: 'childList',
            newValue: {
              addedNodes: Array.from(mutation.addedNodes),
              removedNodes: Array.from(mutation.removedNodes),
            },
            timestamp: Date.now(),
          });
        } else if (mutation.type === 'attributes') {
          const attributeName = mutation.attributeName;
          const newValue = target.getAttribute(attributeName || '');
          
          // Handle style attribute changes
          if (attributeName === 'style') {
            handleStyleChange(target, 'style', newValue || '');
          } else {
            addChange({
              type: 'props',
              element: target,
              ...context,
              property: attributeName || 'unknown',
              newValue,
              timestamp: Date.now(),
            });
          }
        }
      });
    });
    
    // Start observing
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [finalConfig.enableStructuralChanges, getElementContext, addChange, handleStyleChange]);
  
  // Setup ResizeObserver for size changes
  useEffect(() => {
    if (!finalConfig.enablePositionChanges) return;
    
    resizeObserverRef.current = new ResizeObserver(handleSizeChange);
    
    // Observe all potentially resizable elements
    const resizableElements = document.querySelectorAll([
      '[data-resizable]',
      '.layout-component',
      '.slide-container',
      '.block-container',
      'img',
      'video',
      'canvas'
    ].join(', '));
    
    resizableElements.forEach(element => {
      resizeObserverRef.current?.observe(element);
    });
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [finalConfig.enablePositionChanges, handleSizeChange]);
  
  // Manual change trigger function
  const triggerChange = useCallback((change: Partial<ChangeEvent> & { element: HTMLElement }) => {
    const context = getElementContext(change.element);
    
    addChange({
      type: 'props',
      timestamp: Date.now(),
      ...context,
      ...change,
    } as ChangeEvent);
  }, [getElementContext, addChange]);
  
  // Force flush function
  const forceFlush = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    flushChanges();
  }, [flushChanges]);
  
  return {
    triggerChange,
    forceFlush,
    isActive: true,
  };
}

/**
 * Higher-Order Component for automatic change detection
 */
export function withChangeDetection<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  config: ChangeDetectionConfig = {}
) {
  const EnhancedComponent = React.forwardRef<any, T>((props, ref) => {
    useChangeDetection(config);
    
    return (
      <div data-change-detection="enabled">
        <WrappedComponent {...props} ref={ref} />
      </div>
    );
  });
  
  EnhancedComponent.displayName = `withChangeDetection(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return EnhancedComponent;
}

export default useChangeDetection;

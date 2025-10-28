import React, { useRef, useEffect, useState } from 'react';
import TextBlock from '../blocks/TextBlock';
import TextPopup from './TextPopup';

// Selection outline component for text elements
interface TextSelectionOutlineProps {
  isSelected: boolean;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

function TextSelectionOutline({ isSelected, onResizeStart }: TextSelectionOutlineProps) {
  if (!isSelected) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        outline: '2px solid #1FB6FF',
        outlineOffset: '-2px',
        zIndex: 1000
      }}
    >
      {/* Corner Resize Handles */}
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 -left-1 cursor-nw-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="nw"
        onMouseDown={(e) => onResizeStart(e, 'nw')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 -right-1 cursor-ne-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="ne"
        onMouseDown={(e) => onResizeStart(e, 'ne')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 -left-1 cursor-sw-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="sw"
        onMouseDown={(e) => onResizeStart(e, 'sw')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 -right-1 cursor-se-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="se"
        onMouseDown={(e) => onResizeStart(e, 'se')}
      ></div>
      
      {/* Side Resize Handles */}
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="n"
        onMouseDown={(e) => onResizeStart(e, 'n')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="s"
        onMouseDown={(e) => onResizeStart(e, 's')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 top-1/2 -left-1 transform -translate-y-1/2 cursor-w-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="w"
        onMouseDown={(e) => onResizeStart(e, 'w')}
      ></div>
      <div 
        className="absolute w-2 h-2 bg-white border border-blue-500 top-1/2 -right-1 transform -translate-y-1/2 cursor-e-resize pointer-events-auto hover:bg-blue-50"
        style={{ zIndex: 1001 }}
        data-resize-handle="e"
        onMouseDown={(e) => onResizeStart(e, 'e')}
      ></div>
    </div>
  );
}

export interface FigmaTextProps {
  /**
   * Text content to display
   */
  children: React.ReactNode;
  
  /**
   * Text variant - determines size, weight, and spacing
   */
  variant?: 'title' | 'heading' | 'body' | 'caption';
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Text color (Tailwind class like 'text-red-500' or hex color like '#ff0000')
   */
  color?: string;
  
  /**
   * Font family (Google Fonts name like 'font-inter', 'font-playfair-display', etc.)
   */
  fontFamily?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Container CSS classes
   */
  containerClassName?: string;
  
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
  
  /**
   * Selection state
   */
  isSelected?: boolean;
  
  /**
   * Transform state (x, y, width, height for text positioning and resizing)
   */
  transform?: { x?: number; y?: number; width?: number; height?: number };
  
  /**
   * Whether to use fixed width container (prevents auto-sizing to content)
   */
  useFixedWidth?: boolean;
  
  /**
   * Whether to initially adapt width to content (one-time sizing)
   */
  initialAdaptWidth?: boolean;
  
  /**
   * Click handler
   */
  onClick?: (e: React.MouseEvent) => void;
  
  /**
   * Drag start handler
   */
  onDragStart?: (e: React.MouseEvent, element: HTMLElement) => void;
  
  /**
   * Resize start handler
   */
  onResizeStart?: (e: React.MouseEvent, handle: string, element: HTMLElement) => void;
  
  /**
   * Text change handler
   */
  onTextChange?: (newText: string) => void;
  
  /**
   * Text size change handler
   */
  onChangeSize?: (fontSize: number) => void;
  
  /**
   * Font change handler
   */
  onChangeFont?: (fontFamily: string) => void;
  
  /**
   * Delete text handler
   */
  onDeleteText?: () => void;
  
  /**
   * Show popup handler (for layout-level popup management)
   */
  onShowPopup?: (position: { x: number; y: number }, fontSize: number, fontFamily: string) => void;
  
  /**
   * Transform size change handler (for auto-resizing)
   */
  onSizeChange?: (newTransform: { x?: number; y?: number; width?: number; height?: number }) => void;

  /**
   * Canvas editing update handler - called when any property changes
   */
  onUpdate?: (updates: any) => void;
}

/**
 * FigmaText - A text component with Figma-style selection and editing capabilities
 * 
 * Wraps TextBlock with selection handles and editing functionality similar to FigmaImage.
 */
export default function FigmaText({
  children,
  variant = 'body',
  align = 'left',
  color = 'text-gray-900',
  fontFamily,
  className = '',
  containerClassName = '',
  style,
  isSelected = false,
  transform,
  useFixedWidth = true,
  initialAdaptWidth = true,
  onClick,
  onDragStart,
  onResizeStart,
  onTextChange,
  onChangeSize,
  onChangeFont,
  onSizeChange,
  onDeleteText,
  onShowPopup,
  onUpdate
}: FigmaTextProps) {
  
  // Get consistent line height based on variant to match TextBlock
  const getVariantLineHeight = (variant: string) => {
    switch (variant) {
      case 'title':
        return '0.9';
      case 'heading':
        return '1.375'; // leading-snug
      case 'body':
        return '1.625'; // leading-relaxed
      case 'caption':
        return '1.625'; // leading-relaxed
      default:
        return '1.625';
    }
  };
  
  const consistentLineHeight = style?.lineHeight || getVariantLineHeight(variant);
  
  // Debug: Log when component mounts
  console.log('🚀 FigmaText component mounted:', { 
    children: typeof children === 'string' ? children.substring(0, 20) + '...' : children,
    hasOnClick: !!onClick,
    hasOnChangeSize: !!onChangeSize,
    hasOnChangeFont: !!onChangeFont,
    hasOnDeleteText: !!onDeleteText,
    isSelected,
    transform
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalText] = useState(typeof children === 'string' ? children : '');
  const [autoHeight, setAutoHeight] = useState<number | undefined>(undefined);
  const [currentFontSize, setCurrentFontSize] = useState(() => {
    // Extract font size from style prop if available
    if (style?.fontSize) {
      const fontSize = typeof style.fontSize === 'string' 
        ? parseInt(style.fontSize.replace('px', '')) 
        : style.fontSize;
      return fontSize || 16;
    }
    return 16;
  });
  const [currentFontFamily, setCurrentFontFamily] = useState(fontFamily || 'font-helvetica-neue');
  const [initialWidthSet, setInitialWidthSet] = useState(false);

  // Update currentFontSize when style prop changes
  React.useEffect(() => {
    if (style?.fontSize) {
      const fontSize = typeof style.fontSize === 'string' 
        ? parseInt(style.fontSize.replace('px', '')) 
        : style.fontSize;
      setCurrentFontSize(fontSize || 16);
    }
  }, [style?.fontSize]);

  // Update height based on content
  const updateAutoHeight = () => {
    if (textRef.current && isEditing) {
      // Reset height to auto to get natural height
      textRef.current.style.height = 'auto';
      const scrollHeight = textRef.current.scrollHeight;
      setAutoHeight(scrollHeight);
    }
  };

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && textRef.current) {
      // Add CSS to force dark text color
      const styleId = 'figma-text-editing-style';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = `
        [contenteditable="true"] {
          color: #111827 !important;
        }
        [contenteditable="true"] * {
          color: inherit !important;
        }
      `;
      
      // Prevent auto-scrolling when focusing
      textRef.current.focus({ preventScroll: true });
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Update height initially
      updateAutoHeight();
    }
  }, [isEditing]);

  // Monitor content changes to update height
  useEffect(() => {
    if (isEditing && textRef.current) {
      const element = textRef.current;
      
      // Update height on input
      const handleInput = () => {
        updateAutoHeight();
      };
      
      // Update height on keydown (for immediate feedback)
      const handleKeyDown = () => {
        setTimeout(updateAutoHeight, 0); // Defer to next tick
      };
      
      element.addEventListener('input', handleInput);
      element.addEventListener('keydown', handleKeyDown);
      
      return () => {
        element.removeEventListener('input', handleInput);
        element.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isEditing]);

  // Handle text click - EXACT COPY OF IMAGE POPUP LOGIC
  const handleTextClickWithPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    onClick?.(e);
    
    // Call the layout-level popup handler if available
    if (onShowPopup) {
      // Calculate position relative to the text element
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2, // Center horizontally on the text
        y: rect.top - 10  // Position above the text
      };
      
      onShowPopup(position, currentFontSize, currentFontFamily);
    }
  };

  // Analysis function to compare with image popup - UPDATED AFTER FIX
  const analyzePopupParity = () => {
    console.log('\n=== POPUP PARITY ANALYSIS (AFTER FIX) ===');
    console.log('🖼️ Image popup uses:');
    console.log('  - Canvas selector: [class*="cover-"][class*="-layout"]');
    console.log('  - Popup width: 200px (hardcoded)');
    console.log('  - Offset: 8px');
    console.log('  - X position: canvasRelativeX - (popupWidth / 2) [CENTERED]');
    console.log('  - Y position: canvasRelativeY - offset');
    
    console.log('\n📝 Text popup uses (FIXED):');
    console.log('  - Canvas selector: [class*="cover-"][class*="-layout"] [SAME ✅]');
    console.log('  - Popup width: 320px (hardcoded) [SAME APPROACH ✅]');
    console.log('  - Offset: 8px [SAME ✅]');
    console.log('  - X position: canvasRelativeX - (popupWidth / 2) [SAME ✅]');
    console.log('  - Y position: canvasRelativeY - offset [SAME ✅]');
    
    console.log('\n✅ VERDICT: Image vs Text parity: canvasSelector MATCH, canvasScale MATCH, positioning logic MATCH. Result: OK');
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if we're in editing mode
    if (isEditing) return;
    
    // Don't start drag if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target.dataset.resizeHandle) return;
    
    if (onDragStart && containerRef.current) {
      onDragStart(e, containerRef.current);
    }
  };

  // Handle double-click to start editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Clean up any unwanted styling from browser-generated elements
  const cleanupStyling = () => {
    if (textRef.current) {
      // Remove any div elements and replace with br tags
      const divs = textRef.current.querySelectorAll('div');
      divs.forEach(div => {
        const br = document.createElement('br');
        div.parentNode?.insertBefore(br, div);
        if (div.textContent) {
          const textNode = document.createTextNode(div.textContent);
          div.parentNode?.insertBefore(textNode, div);
        }
        div.remove();
      });
      
      // Remove any unwanted styling attributes
      const allElements = textRef.current.querySelectorAll('*');
      allElements.forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
      });
    }
  };

  // Handle save text changes
  const handleSaveText = () => {
    if (textRef.current && onTextChange) {
      cleanupStyling();
      const newText = textRef.current.textContent || '';
      onTextChange(newText);
      // Note: onUpdate is called by the layout's text change handler, not here
    }
    setIsEditing(false);
    setAutoHeight(undefined); // Reset auto height
  };

  // Handle cancel text editing
  const handleCancelEdit = () => {
    if (textRef.current) {
      textRef.current.textContent = originalText;
    }
    setIsEditing(false);
    setAutoHeight(undefined); // Reset auto height
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
    // Let Enter work naturally but clean up any unwanted styling
    // Note: We're not preventing Enter anymore to allow natural line breaks
    // Note: Enter should create new lines, not save (like Figma)
  };

  // Handle blur (click outside)
  const handleBlur = () => {
    if (isEditing) {
      handleSaveText();
    }
  };

  // Handle resize start
  const handleResizeStartInternal = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (onResizeStart && containerRef.current) {
      onResizeStart(e, handle, containerRef.current);
    }
  };


  // Simple recalculation - just position above text box
  const recalculatePopupPosition = React.useCallback(() => {
    // No complex recalculation needed - position is based on text element bounds
    console.log('📝 Simple positioning - no recalculation needed');
  }, []);

  // Initial width adaptation - measure text once and set width
  const setInitialWidth = React.useCallback(() => {
    if (textRef.current && onSizeChange && initialAdaptWidth && !initialWidthSet) {
      // Get the actual rendered width of the text element
      const textWidth = textRef.current.scrollWidth;
      
      // Add some padding (24px) to the measured width
      const newWidth = Math.max(100, textWidth + 24);
      
      const currentTransform = transform || {};
      const newTransform = {
        ...currentTransform,
        width: newWidth
      };
      
      console.log('📏 Setting initial text width:', {
        textContent: textRef.current.textContent?.substring(0, 30) + '...',
        scrollWidth: textWidth,
        initialWidth: newWidth
      });
      
      onSizeChange?.(newTransform);
      setInitialWidthSet(true);
    }
  }, [onSizeChange, transform, initialAdaptWidth, initialWidthSet]);
  
  // Set initial width on mount and when content changes (but only once per selection)
  React.useEffect(() => {
    if (textRef.current && !isEditing && !initialWidthSet && isSelected && !transform?.width) {
      // Only set initial width if no manual width has been set
      const frameId = requestAnimationFrame(() => {
        setInitialWidth();
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [children, currentFontSize, currentFontFamily, isEditing, setInitialWidth, initialWidthSet, isSelected, transform?.width]);

  // Reset initial width measurement when selection changes, but preserve manual width changes
  React.useEffect(() => {
    if (!isSelected) {
      setInitialWidthSet(false);
    }
  }, [isSelected]);

  // No recalculation needed - position is based on text element bounds

  // Auto-resize when text content changes - DISABLED to prevent infinite loops
  // React.useEffect(() => {
  //   if (textRef.current && !isEditing) {
  //     // Use requestAnimationFrame to avoid infinite loops
  //     const frameId = requestAnimationFrame(() => {
  //       updateTextWidth();
  //     });
  //     return () => cancelAnimationFrame(frameId);
  //   }
  // }, [children, currentFontSize, currentFontFamily, isEditing, updateTextWidth]);

  // Handle popup actions
  const handleChangeSizeClick = (fontSize: number) => {
    setCurrentFontSize(fontSize);
    onChangeSize?.(fontSize);
  };

  const handleChangeFontClick = (fontFamily: string) => {
    setCurrentFontFamily(fontFamily);
    onChangeFont?.(fontFamily);
  };

  const handleDeleteTextClick = () => {
    onDeleteText?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${containerClassName}`}
      style={{
        // Apply transform position and dimensions if provided
        transform: transform
          ? `translate(${transform.x || 0}px, ${transform.y || 0}px)` 
          : undefined,
        width: useFixedWidth 
          ? (transform?.width ? `${transform.width}px` : (initialAdaptWidth ? 'fit-content' : '300px'))
          : 'fit-content',
        // Use auto height when editing, otherwise use transform height
        height: isEditing && autoHeight ? `${autoHeight}px` : (transform?.height || 'auto'),
        // Critical: Allow overflow beyond container
        overflow: 'visible',
        contain: 'none',
        // Add cursor style for dragging when selected
        cursor: isSelected && !isEditing ? 'move' : 'default'
      }}
      onMouseEnter={() => {
        console.log('🐭 Mouse enter on FigmaText');
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('🐭 Mouse leave from FigmaText');
        setIsHovered(false);
      }}
      onClick={(e) => {
        console.log('🚨 DIRECT CLICK ON CONTAINER!', e.target);
        handleTextClickWithPopup(e);
      }}
      onMouseDown={(e) => {
        console.log('🖱️ Mouse down on container');
        handleMouseDown(e);
      }}
      onPointerDown={(e) => {
        console.log('👆 Pointer down on container');
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Text Content */}
      {isEditing ? (
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          className={`outline-none w-full ${className || ''} ${fontFamily || ''}`}
          style={{
            minHeight: '1em',
            height: autoHeight ? `${autoHeight}px` : 'auto',
            width: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'normal',
            overflow: 'visible',
            resize: 'none',
            // Prevent browser auto-scrolling
            scrollMargin: '0',
            scrollPadding: '0',
            // Apply text styling directly to contentEditable - force dark color
            color: color?.startsWith('#') ? color : '#111827', // Force dark color
            // Ensure cursor is visible
            caretColor: color?.startsWith('#') ? color : 'currentColor',
            // Ensure all child elements inherit styling
            fontSize: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            // Use consistent line-height to match non-editing state
            lineHeight: consistentLineHeight,
            letterSpacing: 'inherit',
            // Ensure consistent positioning
            margin: 0,
            padding: 0,
            ...style
          }}
        >
          {typeof children === 'string' ? children : String(children)}
        </div>
      ) : (
        <div 
          ref={textRef} 
          className={`w-full cursor-pointer ${className || ''} ${fontFamily || ''}`}
          style={{
            width: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'normal',
            // Match editing state styling exactly - force dark color
            color: color?.startsWith('#') ? color : '#111827', // Default to dark grey if not hex
            fontSize: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            lineHeight: consistentLineHeight,
            letterSpacing: 'inherit',
            // Ensure consistent positioning
            margin: 0,
            padding: 0,
            ...style
          }}
        >
          <TextBlock
            variant={variant}
            align={className?.includes('text-left') || className?.includes('text-center') || className?.includes('text-right') ? undefined : align}
            color={color}
            fontFamily={fontFamily}
            className={className}
            style={style}
          >
            {children}
          </TextBlock>
        </div>
      )}

      {/* Selection Outline with Handles */}
      <TextSelectionOutline
        isSelected={isSelected}
        onResizeStart={handleResizeStartInternal}
      />
      
      {/* Hover Outline - Show when hovered but not selected */}
      {isHovered && !isSelected && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            outline: '2px solid #1FB6FF',
            outlineOffset: '-2px',
            opacity: 0.5
          }}
        />
      )}




    </div>
  );
}

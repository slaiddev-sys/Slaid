import React, { useRef, useState } from 'react';
import ImagePopup from '../figma/ImagePopup';

export interface ImageBlockProps {
  /**
   * Image source URL (required)
   */
  src: string;

  /**
   * Alt text for accessibility (required)
   */
  alt: string;

  /**
   * Image size control
   * - xs: 96px (very small thumbnails)
   * - sm: 160px (small images, avatars)
   * - md: 256px (standard content images) - default
   * - lg: 320px (featured images)
   * - xl: 384px (hero images, showcases)
   * - full: 100% width (responsive full-width)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * How the image should fit within its container
   * - cover: Fill container completely, may crop (default)
   * - contain: Scale to fit, show entire image
   * - fill: Stretch to exact container size
   * - scale-down: Only scale down, never up
   */
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down';

  /**
   * Image alignment within its container
   * - left: Align to left side
   * - center: Center horizontally (default)
   * - right: Align to right side
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Border radius to apply to the image
   * - false: No rounding
   * - 'sm': Small rounded corners (rounded-sm)
   * - 'md': Medium rounded corners (rounded-md)
   * - 'lg': Large rounded corners (rounded-lg)
   * - 'xl': Extra large rounded corners (rounded-xl)
   * - 'full': Perfect circle (rounded-full) - ideal for profile pics
   * - true: Defaults to 'xl' for backward compatibility
   */
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether to apply a shadow to the image
   */
  shadow?: boolean;

  /**
   * Custom shadow color (HEX format like #000000, #fc4b08, etc.)
   * If not provided, uses default shadow color
   * Only applies when shadow=true
   */
  shadowColor?: string;

  /**
   * Optional caption displayed below the image
   */
  caption?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional click handler
   */
  onClick?: () => void;

  /**
   * When true, the image will fill the container height (h-full) and use object-cover.
   * Useful for layouts that require edge-to-edge coverage.
   */
  fill?: boolean;

  /**
   * Visual opacity for the image (0-1). Default: 1 (fully opaque)
   */
  opacity?: number;

  /**
   * Visual brightness multiplier (0-2). 1 = normal, <1 darker, >1 brighter. Default: 1
   */
  brightness?: number;

  /**
   * Callback when image should be deleted
   */
  onDelete?: () => void;

  /**
   * Callback when image should be changed/uploaded
   */
  onUpload?: () => void;
}

/**
 * ImageBlock - A flexible image component for presentations
 *
 * Simple, predictable image component with clear props for size, alignment, 
 * styling, and semantic structure. Optimized for AI-controlled presentations.
 */
export default function ImageBlock({
  src,
  alt,
  size = 'md',
  fit = 'cover',
  align = 'center',
  rounded = false,
  shadow = false,
  shadowColor,
  caption,
  className = '',
  onClick,
  fill = false,
  opacity = 1,
  brightness = 1,
  onDelete,
  onUpload
}: ImageBlockProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Check if this should be a perfect circle
  const isCircle = rounded === 'full';

  // Helper function to get size classes
  const getSizeClasses = (size: string, isCircle: boolean): string => {
    if (isCircle) {
      // For circles, use square dimensions (width = height)
      switch (size) {
        case 'xs': return 'w-24 h-24';         // 96px × 96px
        case 'sm': return 'w-40 h-40';         // 160px × 160px
        case 'md': return 'w-64 h-64';         // 256px × 256px
        case 'lg': return 'w-80 h-80';         // 320px × 320px
        case 'xl': return 'w-96 h-96';         // 384px × 384px
        case 'full': return 'w-full aspect-square'; // Full width but square
        default: return 'w-64 h-64';
      }
    } else {
      // For non-circles, use max-width (responsive)
      switch (size) {
        case 'xs': return 'max-w-24';       // 96px
        case 'sm': return 'max-w-40';       // 160px
        case 'md': return 'max-w-64';       // 256px
        case 'lg': return 'max-w-80';       // 320px
        case 'xl': return 'max-w-96';       // 384px
        case 'full': return 'w-full';       // 100%
        default: return 'max-w-64';
      }
    }
  };

  // Helper function to get object fit classes
  const getFitClasses = (fit: string): string => {
    switch (fit) {
      case 'cover': return 'object-cover';
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      case 'scale-down': return 'object-scale-down';
      default: return 'object-cover';
    }
  };

  // Helper function to get alignment classes
  const getAlignClasses = (align: string): string => {
    switch (align) {
      case 'left': return '';
      case 'center': return 'mx-auto';
      case 'right': return 'ml-auto';
      default: return 'mx-auto';
    }
  };

  // Helper function to get rounded classes
  const getRoundedClasses = (rounded: boolean | string): string => {
    if (!rounded) return '';
    if (rounded === true) return 'rounded-xl'; // Backward compatibility
    
    switch (rounded) {
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'full': return 'rounded-full';
      case 't-sm': return 'rounded-t-sm';
      case 't-md': return 'rounded-t-md';
      case 't-lg': return 'rounded-t-lg';
      case 't-xl': return 'rounded-t-xl';
      case 't-2xl': return 'rounded-t-2xl';
      case 't-3xl': return 'rounded-t-3xl';
      default: return 'rounded-xl';
    }
  };

  // Helper function to get shadow classes and styles
  const getShadowConfig = (shadow: boolean, shadowColor?: string) => {
    if (!shadow) return { classes: '', style: {} };
    
    if (shadowColor) {
      // Custom shadow color using inline style
      const hexColor = shadowColor.startsWith('#') ? shadowColor : `#${shadowColor}`;
      return {
        classes: '', // No Tailwind shadow class when using custom color
        style: {
          filter: `drop-shadow(0 4px 6px ${hexColor}40) drop-shadow(0 1px 3px ${hexColor}60)` // 40 = 25% opacity, 60 = 37.5% opacity
        }
      };
    } else {
      // Default Tailwind shadow
      return {
        classes: 'shadow-md',
        style: {}
      };
    }
  };

  // Build classes
  const sizeClasses = getSizeClasses(size, isCircle);
  const fitClasses = getFitClasses(fit);
  const alignClasses = getAlignClasses(align);
  const roundedClasses = getRoundedClasses(rounded);
  const shadowConfig = getShadowConfig(shadow, shadowColor);

  // Container classes
  // Remove any default padding/margins from the wrapper to ensure true edge-to-edge when desired
  const containerClasses = `${sizeClasses} ${alignClasses} ${className}`.trim();

  // Image classes
  const imageClasses = isCircle
    ? `block w-full h-full object-cover ${roundedClasses} ${shadowConfig.classes}`.trim()
    : fill
      ? `block w-full h-full object-cover ${roundedClasses} ${shadowConfig.classes}`.trim()
      : `block w-full h-auto ${fitClasses} ${roundedClasses} ${shadowConfig.classes}`.trim();


  // Handle right-click to show popup
  const handleContextMenu = (e: React.MouseEvent) => {
    if (onDelete || onUpload) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      setPopupPosition({ x, y });
      setShowPopup(true);
    }
  };

  // Handle upload functionality
  const handleUploadClick = () => {
    setShowPopup(false);
    onUpload?.();
  };

  // Handle delete functionality
  const handleDeleteClick = () => {
    setShowPopup(false);
    onDelete?.();
  };

  // Handle click events and merge with shadow styles
  const handleClick = onClick ? { 
    onClick, 
    role: 'button', 
    tabIndex: 0,
    style: { cursor: 'pointer', ...shadowConfig.style }
  } : {};

  // Add context menu if delete or upload handlers are provided
  const contextMenuProps = (onDelete || onUpload) ? {
    ...handleClick,
    onContextMenu: handleContextMenu,
    style: { ...(handleClick.style || {}), cursor: 'context-menu' }
  } : handleClick;

  // Image inline styles (for custom shadows when not clicking)
  // Compose inline styles: custom shadow + opacity + brightness
  const composedStyle: React.CSSProperties = !onClick ? { ...shadowConfig.style } : {};
  const clampedOpacity = Math.max(0, Math.min(1, opacity ?? 1));
  if (clampedOpacity !== 1) {
    composedStyle.opacity = clampedOpacity;
  }
  const clampedBrightness = Math.max(0, Math.min(2, brightness ?? 1));
  if (clampedBrightness !== 1) {
    composedStyle.filter = `${composedStyle.filter ? composedStyle.filter + ' ' : ''}brightness(${clampedBrightness})`;
  }

  // Render the component
  if (caption) {
    return (
      <>
        <figure className={`${containerClasses} m-0 p-0 relative`} style={{ padding: 0, margin: 0 }} {...contextMenuProps}>
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={imageClasses}
            style={composedStyle}
            loading="lazy"
          />
          <figcaption className="mt-2 text-center text-gray-600 text-sm m-0">
            {caption}
          </figcaption>
        </figure>
        
        {/* Image Management Popup */}
        {(onDelete || onUpload) && (
          <ImagePopup
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
            onChangeImage={handleUploadClick}
            onDeleteImage={handleDeleteClick}
            position={popupPosition}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`${containerClasses} m-0 p-0 relative`} style={{ padding: 0, margin: 0 }} {...contextMenuProps}>
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={imageClasses}
          style={composedStyle}
          loading="lazy"
        />
      </div>
      
      {/* Image Management Popup */}
      {(onDelete || onUpload) && (
        <ImagePopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onChangeImage={handleUploadClick}
          onDeleteImage={handleDeleteClick}
          position={popupPosition}
        />
      )}
    </>
  );
} 
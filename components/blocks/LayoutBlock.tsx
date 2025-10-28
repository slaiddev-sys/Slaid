import React from 'react';

export interface LayoutBlockProps {
  /**
   * Layout variant - determines the structure and arrangement
   */
  variant: 'single' | 'split' | 'grid' | 'hero' | 'stack';

  /**
   * Child elements to render within the layout
   */
  children: React.ReactNode;

  /**
   * Canvas dimensions - exact width and height for precise fitting
   */
  canvasWidth?: number;
  canvasHeight?: number;

  /**
   * Whether to use full canvas dimensions (default: true)
   * When true, layout fills entire canvas exactly
   */
  fullCanvas?: boolean;

  /**
   * Internal spacing between layout sections
   */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Content alignment within layout sections
   */
  contentAlign?: 'start' | 'center' | 'end';

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * LayoutBlock - Precision canvas-fitted layout system
 * 
 * Designed to fit exactly within slide canvas dimensions with no overflow
 * or distortion. Provides precise positioning for content blocks.
 */
export default function LayoutBlock({
  variant,
  children,
  canvasWidth = 1920,  // Standard presentation width
  canvasHeight = 1080, // Standard presentation height
  fullCanvas = true,
  spacing = 'md',
  contentAlign = 'center',
  className = ''
}: LayoutBlockProps) {

  // Get spacing values in pixels
  const getSpacing = (size: string): number => {
    switch (size) {
      case 'none': return 0;
      case 'xs': return 8;
      case 'sm': return 16;
      case 'md': return 24;
      case 'lg': return 32;
      default: return 24;
    }
  };

  // Get alignment classes
  const getAlignmentClasses = (align: string): string => {
    switch (align) {
      case 'start': return 'justify-start items-start';
      case 'center': return 'justify-center items-center';
      case 'end': return 'justify-end items-end';
      default: return 'justify-center items-center';
    }
  };

  // Get variant-specific layout classes
  const getVariantClasses = (variant: string): string => {
    const baseClasses = 'flex';
    
    switch (variant) {
      case 'single':
        return `${baseClasses} flex-col`;
      case 'split':
        return `${baseClasses} flex-row`;
      case 'grid':
        return 'grid grid-cols-2 grid-rows-2';
      case 'hero':
        return `${baseClasses} flex-col`;
      case 'stack':
        return `${baseClasses} flex-col`;
      default:
        return `${baseClasses} flex-col`;
    }
  };

  // Calculate exact dimensions
  const containerStyle = fullCanvas ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    gap: `${getSpacing(spacing)}px`
  } : {
    gap: `${getSpacing(spacing)}px`
  };

  // Build complete class string
  const containerClasses = [
    // Variant-specific layout
    getVariantClasses(variant),
    
    // Alignment
    getAlignmentClasses(contentAlign),
    
    // Overflow control for exact fitting
    'overflow-hidden',
    
    // Position control
    'relative',
    
    // Additional classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      style={containerStyle}
    >
      {children}
    </div>
  );
} 
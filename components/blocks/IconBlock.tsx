import React from 'react';
import * as LucideIcons from 'lucide-react';

// Type for all available Lucide icon names
type LucideIconName = keyof typeof LucideIcons;

export interface IconBlockProps {
  /**
   * Name of the Lucide icon to display
   */
  iconName: LucideIconName;
  
  /**
   * Size of the icon in pixels
   */
  size?: number;
  
  /**
   * Color of the icon (CSS color value)
   */
  color?: string;
  
  /**
   * Stroke width of the icon
   */
  strokeWidth?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
  
  /**
   * Click handler for the icon
   */
  onClick?: () => void;
  
  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;
}

/**
 * IconBlock Component
 * 
 * A flexible icon component that uses Lucide React icons.
 * Provides easy access to the entire Lucide icon library with customization options.
 * 
 * @see https://lucide.dev/ for available icons
 */
export default function IconBlock({
  iconName,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  style = {},
  onClick,
  ariaLabel,
}: IconBlockProps) {
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[iconName] as React.ComponentType<any>;
  
  // If icon doesn't exist, show a fallback
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in Lucide icons`);
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ 
          width: size, 
          height: size, 
          color,
          ...style 
        }}
        aria-label={ariaLabel || `Missing icon: ${iconName}`}
      >
        <LucideIcons.AlertCircle size={size} color={color} strokeWidth={strokeWidth} />
      </div>
    );
  }
  
  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel || `${iconName} icon`}
    />
  );
}

// Export common icon names for easier usage
export const CommonIcons = {
  // Navigation
  ArrowLeft: 'ArrowLeft' as LucideIconName,
  ArrowRight: 'ArrowRight' as LucideIconName,
  ArrowUp: 'ArrowUp' as LucideIconName,
  ArrowDown: 'ArrowDown' as LucideIconName,
  ChevronLeft: 'ChevronLeft' as LucideIconName,
  ChevronRight: 'ChevronRight' as LucideIconName,
  
  // Actions
  Plus: 'Plus' as LucideIconName,
  Minus: 'Minus' as LucideIconName,
  X: 'X' as LucideIconName,
  Check: 'Check' as LucideIconName,
  Edit: 'Edit' as LucideIconName,
  Trash: 'Trash' as LucideIconName,
  
  // Content
  Heart: 'Heart' as LucideIconName,
  Star: 'Star' as LucideIconName,
  Share: 'Share' as LucideIconName,
  Download: 'Download' as LucideIconName,
  Upload: 'Upload' as LucideIconName,
  
  // Communication
  Mail: 'Mail' as LucideIconName,
  Phone: 'Phone' as LucideIconName,
  MessageCircle: 'MessageCircle' as LucideIconName,
  
  // Business
  TrendingUp: 'TrendingUp' as LucideIconName,
  TrendingDown: 'TrendingDown' as LucideIconName,
  BarChart: 'BarChart' as LucideIconName,
  PieChart: 'PieChart' as LucideIconName,
  DollarSign: 'DollarSign' as LucideIconName,
  
  // Status
  AlertCircle: 'AlertCircle' as LucideIconName,
  CheckCircle: 'CheckCircle' as LucideIconName,
  Info: 'Info' as LucideIconName,
  AlertTriangle: 'AlertTriangle' as LucideIconName,
} as const;

import React from 'react';

export interface BackgroundBlockProps {
  /**
   * Background color (Tailwind class like 'bg-blue-500' or hex color like '#ff0000')
   */
  color?: string;
  
  /**
   * Background gradient (Tailwind gradient class like 'bg-gradient-to-r from-purple-500 to-indigo-500')
   * If provided, this overrides the color prop
   */
  gradient?: string;
  
  /**
   * Background image URL
   * If provided, this overrides both color and gradient props
   * Can be combined with gradient for overlay effects
   */
  imageUrl?: string;
  
  /**
   * Image brightness (0-2, where 1 is normal, 0.5 is darker, 1.5 is brighter)
   * Only applies when imageUrl is provided
   */
  brightness?: number;
  
  /**
   * Background opacity (0-1, where 1 is fully opaque, 0.5 is semi-transparent)
   * Applies to all background types: images, colors, and gradients
   */
  opacity?: number;
  
  /**
   * Enable standalone blur effect (blurs the background content)
   */
  blur?: boolean;
  
  /**
   * Backdrop blur level (default: "backdrop-blur-md")
   * Works with both standalone blur and glassmorphism
   * Options: "backdrop-blur-sm", "backdrop-blur-md", "backdrop-blur-lg", "backdrop-blur-xl", "backdrop-blur-2xl"
   */
  blurLevel?: string;
  
  /**
   * Enable glassmorphism effect (frosted glass appearance)
   */
  glassmorphism?: boolean;
  
  /**
   * Glass layer opacity for glassmorphism (0-1, default: 0.6)
   */
  glassOpacity?: number;
  
  /**
   * Z-index layering control
   * - "back": z-[-10] - Behind everything (default for backgrounds)
   * - "default": z-0 - Normal stacking
   * - "front": z-10 - In front of normal content
   * - number: Custom z-index value (e.g., 5, -5, 20)
   */
  zIndex?: 'back' | 'default' | 'front' | number;
  
  /**
   * Overlay color (Tailwind class like 'bg-black' or hex code like '#000000')
   * Creates a semi-transparent color layer on top of the background
   */
  overlayColor?: string;
  
  /**
   * Overlay opacity (0-1, where 1 is fully opaque, 0 is transparent)
   * Controls the transparency of the overlay layer
   */
  overlayOpacity?: number;
  
  /**
   * Container fit mode
   * - "parent": Fits to parent container (default)
   * - "screen": Full screen coverage
   * - "viewport": Full viewport height/width
   */
  fit?: 'parent' | 'screen' | 'viewport';
  
  /**
   * Background image position for better responsive control
   * - "center": center center (default)
   * - "top": center top
   * - "bottom": center bottom
   * - "left": left center
   * - "right": right center
   * - Custom: "top left", "bottom right", etc.
   */
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | string;
  
  /**
   * Enable dark mode responsive support
   * Automatically adds dark: variants for colors and overlays
   */
  darkMode?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Child elements to render on top of the background
   */
  children?: React.ReactNode;
}

/**
 * BackgroundBlock - A background component for slides
 * 
 * Supports both Tailwind color classes and hex color codes.
 * Fills the entire slide area to provide background styling.
 */
export default function BackgroundBlock({
  color = 'bg-white',
  gradient,
  imageUrl,
  brightness = 1,
  opacity = 1,
  blur = false,
  blurLevel = 'backdrop-blur-md',
  glassmorphism = false,
  glassOpacity = 0.6,
  zIndex = 'back',
  overlayColor,
  overlayOpacity = 0.5,
  fit = 'parent',
  imagePosition = 'center',
  darkMode = false,
  className = '',
  children,
}: BackgroundBlockProps) {
  // Helper function to convert zIndex prop to CSS class or inline style
  const getZIndexStyle = (zIndex: 'back' | 'default' | 'front' | number): { className: string; style?: React.CSSProperties } => {
    switch (zIndex) {
      case 'back':
        return { className: '-z-10' };
      case 'default':
        return { className: 'z-0' };
      case 'front':
        return { className: 'z-10' };
      default:
        // For custom numbers, use inline style for full flexibility
        if (typeof zIndex === 'number') {
          return { 
            className: '', 
            style: { zIndex: zIndex } 
          };
        }
        // Fallback to back
        return { className: '-z-10' };
    }
  };

  // Get z-index styling
  const zIndexStyle = getZIndexStyle(zIndex);
  
  // Helper function for responsive container sizing
  const getContainerClasses = (fit: 'parent' | 'screen' | 'viewport'): string => {
    const baseClasses = 'absolute inset-0';
    
    switch (fit) {
      case 'screen':
        return `${baseClasses} w-screen h-screen`;
      case 'viewport':
        return `${baseClasses} w-full min-h-screen`;
      case 'parent':
      default:
        return `${baseClasses} w-full h-full`;
    }
  };
  
  // Helper function for image positioning
  const getImagePositionClasses = (position: string): string => {
    const positionMap: { [key: string]: string } = {
      'center': 'bg-center',
      'top': 'bg-top',
      'bottom': 'bg-bottom',
      'left': 'bg-left',
      'right': 'bg-right',
      'top left': 'bg-left-top',
      'top right': 'bg-right-top',
      'bottom left': 'bg-left-bottom',
      'bottom right': 'bg-right-bottom'
    };
    
    return positionMap[position] || 'bg-center';
  };
  
  // Helper function to add responsive classes
  const addResponsiveClasses = (baseClass: string): string => {
    if (!baseClass) return '';
    
    // If class already has responsive prefixes, return as-is
    if (baseClass.includes('sm:') || baseClass.includes('md:') || baseClass.includes('lg:')) {
      return baseClass;
    }
    
    // Add dark mode variant if enabled
    if (darkMode && baseClass.startsWith('bg-')) {
      const darkVariant = baseClass.replace('bg-', 'dark:bg-');
      return `${baseClass} ${darkVariant}`;
    }
    
    return baseClass;
  };
  
  // Base responsive container classes
  const containerClasses = getContainerClasses(fit);
  
  // Base styles for full slide coverage with dynamic z-index
  const baseStyles = `${containerClasses} ${zIndexStyle.className}`.trim();
  
  // Helper function to convert Tailwind color classes to RGB values
  const getTailwindColorRGB = (colorClass: string): string | null => {
    const colorMap: { [key: string]: string } = {
      // Blue colors
      'bg-blue-100': '219, 234, 254',
      'bg-blue-200': '191, 219, 254',
      'bg-blue-300': '147, 197, 253',
      'bg-blue-400': '96, 165, 250',
      'bg-blue-500': '59, 130, 246',
      'bg-blue-600': '37, 99, 235',
      'bg-blue-700': '29, 78, 216',
      'bg-blue-800': '30, 64, 175',
      'bg-blue-900': '30, 58, 138',
      // Red colors
      'bg-red-100': '254, 226, 226',
      'bg-red-200': '252, 165, 165',
      'bg-red-300': '248, 113, 113',
      'bg-red-400': '248, 113, 113',
      'bg-red-500': '239, 68, 68',
      'bg-red-600': '220, 38, 38',
      'bg-red-700': '185, 28, 28',
      'bg-red-800': '153, 27, 27',
      'bg-red-900': '127, 29, 29',
      // Green colors
      'bg-green-100': '220, 252, 231',
      'bg-green-200': '187, 247, 208',
      'bg-green-300': '134, 239, 172',
      'bg-green-400': '74, 222, 128',
      'bg-green-500': '34, 197, 94',
      'bg-green-600': '22, 163, 74',
      'bg-green-700': '21, 128, 61',
      'bg-green-800': '22, 101, 52',
      'bg-green-900': '20, 83, 45',
      // Gray colors
      'bg-gray-100': '243, 244, 246',
      'bg-gray-200': '229, 231, 235',
      'bg-gray-300': '209, 213, 219',
      'bg-gray-400': '156, 163, 175',
      'bg-gray-500': '107, 114, 128',
      'bg-gray-600': '75, 85, 99',
      'bg-gray-700': '55, 65, 81',
      'bg-gray-800': '31, 41, 55',
      'bg-gray-900': '17, 24, 39',
      // Purple colors
      'bg-purple-100': '237, 233, 254',
      'bg-purple-200': '221, 214, 254',
      'bg-purple-300': '196, 181, 253',
      'bg-purple-400': '167, 139, 250',
      'bg-purple-500': '139, 92, 246',
      'bg-purple-600': '124, 58, 237',
      'bg-purple-700': '109, 40, 217',
      'bg-purple-800': '91, 33, 182',
      'bg-purple-900': '76, 29, 149',
      // Common colors
      'bg-white': '255, 255, 255',
      'bg-black': '0, 0, 0',
    };
    
    return colorMap[colorClass] || null;
  };
  
  // Helper function to convert HEX to RGB
  const hexToRGB = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `${r}, ${g}, ${b}`;
  };
  
  // Standalone blur layer component
  const BlurLayer = () => {
    if (!blur) return null;
    
    const blurClasses = [
      'absolute inset-0 w-full h-full -z-8',
      blurLevel
    ].filter(Boolean).join(' ');
    
    return <div className={blurClasses} />;
  };
  
  // Glassmorphism layer component
  const GlassLayer = () => {
    if (!glassmorphism) return null;
    
    const glassClasses = [
      'absolute inset-0 w-full h-full -z-5',
      blurLevel,
      'bg-white/20 border border-white/30'
    ].filter(Boolean).join(' ');
    
    const glassStyle: React.CSSProperties = {
      backgroundColor: `rgba(255, 255, 255, ${glassOpacity})`
    };
    
    return <div className={glassClasses} style={glassStyle} />;
  };
  
  // Overlay layer component
  const OverlayLayer = () => {
    if (!overlayColor) return null;
    
    const overlayClasses = [
      'absolute inset-0 w-full h-full -z-3'
    ].filter(Boolean).join(' ');
    
    // Handle both Tailwind and HEX colors
    let overlayStyle: React.CSSProperties = {};
    
    if (overlayColor.startsWith('#')) {
      // HEX color - use inline style with opacity
      const hexToRGB = (hex: string): string | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `${r}, ${g}, ${b}`;
      };
      
      const rgbValues = hexToRGB(overlayColor);
      if (rgbValues) {
        overlayStyle.backgroundColor = `rgba(${rgbValues}, ${overlayOpacity})`;
      } else {
        overlayStyle.backgroundColor = overlayColor;
        overlayStyle.opacity = overlayOpacity;
      }
    } else {
      // Tailwind color - try to convert to rgba, fallback to opacity
      const getTailwindColorRGB = (colorClass: string): string | null => {
        const colorMap: { [key: string]: string } = {
          'bg-black': '0, 0, 0',
          'bg-white': '255, 255, 255',
          'bg-red-500': '239, 68, 68',
          'bg-green-500': '34, 197, 94',
          'bg-blue-500': '59, 130, 246',
          'bg-yellow-500': '234, 179, 8',
          'bg-purple-500': '168, 85, 247',
          'bg-pink-500': '236, 72, 153',
          'bg-indigo-500': '99, 102, 241',
          'bg-gray-500': '107, 114, 128',
          'bg-orange-500': '249, 115, 22',
          // Add more colors as needed
        };
        
        return colorMap[colorClass] || null;
      };
      
      const rgbValues = getTailwindColorRGB(overlayColor);
      if (rgbValues) {
        overlayStyle.backgroundColor = `rgba(${rgbValues}, ${overlayOpacity})`;
      } else {
        // Fallback: use Tailwind class with opacity
        overlayStyle.opacity = overlayOpacity;
      }
    }
    
    // Add responsive support to overlay color
    const responsiveOverlayColor = overlayColor && !overlayColor.startsWith('#') 
      ? addResponsiveClasses(overlayColor) 
      : overlayColor;
    
    return (
      <div 
        className={`${overlayClasses} ${!overlayColor.startsWith('#') ? responsiveOverlayColor : ''}`}
        style={overlayStyle}
      />
    );
  };
  
  // Priority: imageUrl > gradient > color (Tailwind) > color (HEX inline style)
  if (imageUrl) {
    // Image background with responsive positioning and coverage
    const imagePositionClass = getImagePositionClasses(imagePosition);
    const responsiveGradient = gradient ? addResponsiveClasses(gradient) : '';
    
    const imageClasses = [
      baseStyles,
      'bg-cover bg-no-repeat object-cover',
      imagePositionClass,
      // Add responsive classes for better mobile handling
      'sm:bg-cover md:bg-cover lg:bg-cover',
      className
  ].filter(Boolean).join(' ');

    // Build inline styles for image with brightness and opacity controls
    const imageStyle: React.CSSProperties = {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: imagePosition === 'center' ? 'center center' : 
                         imagePosition === 'top' ? 'center top' :
                         imagePosition === 'bottom' ? 'center bottom' :
                         imagePosition === 'left' ? 'left center' :
                         imagePosition === 'right' ? 'right center' : imagePosition,
      ...(brightness !== 1 && { filter: `brightness(${brightness})` }),
      ...(opacity !== 1 && { opacity: opacity }),
      ...(zIndexStyle.style && zIndexStyle.style)
    };

  return (
      <>
        <div className={imageClasses} style={imageStyle}>
          {/* Optional responsive gradient overlay */}
          {gradient && (
            <div 
              className={`absolute inset-0 w-full h-full ${responsiveGradient} opacity-75 sm:opacity-75 md:opacity-80 lg:opacity-85`}
            />
          )}
        </div>
        {/* Standalone blur layer */}
        <BlurLayer />
        {/* Glassmorphism layer */}
        <GlassLayer />
        {/* Overlay layer */}
        <OverlayLayer />
        {children}
      </>
    );
  }
  
  // Fallback to gradient or color with opacity support
  let backgroundClasses = '';
  let inlineStyle: React.CSSProperties = {};
  
  if (gradient) {
    // Use responsive gradient - apply opacity if specified
    const responsiveGradient = addResponsiveClasses(gradient);
    if (opacity !== 1) {
      // For gradients with opacity, we need to wrap in a container
      backgroundClasses = responsiveGradient;
      inlineStyle = { opacity: opacity };
    } else {
      backgroundClasses = responsiveGradient;
    }
  } else if (color) {
    // Check if color is a hex code (starts with #)
    const isHexColor = color.startsWith('#');
    
    if (isHexColor) {
      // Convert HEX to rgba with opacity
      const rgbValues = hexToRGB(color);
      if (rgbValues && opacity !== 1) {
        inlineStyle = { backgroundColor: `rgba(${rgbValues}, ${opacity})` };
      } else {
        inlineStyle = { backgroundColor: color };
      }
    } else {
      // Handle Tailwind color classes with responsive support
      const responsiveColor = addResponsiveClasses(color);
      if (opacity !== 1) {
        const rgbValues = getTailwindColorRGB(color);
        if (rgbValues) {
          // Use rgba with custom opacity
          inlineStyle = { backgroundColor: `rgba(${rgbValues}, ${opacity})` };
        } else {
          // Fallback: use Tailwind class with CSS opacity
          backgroundClasses = responsiveColor;
          inlineStyle = { opacity: opacity };
        }
      } else {
        // Use responsive Tailwind class for color (no opacity)
        backgroundClasses = responsiveColor;
      }
    }
  }
  
  // Add zIndex inline style if using custom numeric value
  if (zIndexStyle.style) {
    inlineStyle = { ...inlineStyle, ...zIndexStyle.style };
  }
  
  // Combine all classes
  const combinedClassName = [
    baseStyles,
    backgroundClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <>
      <div 
        className={combinedClassName}
        style={inlineStyle}
      />
      {/* Standalone blur layer */}
      <BlurLayer />
      {/* Glassmorphism layer */}
      <GlassLayer />
      {/* Overlay layer */}
      <OverlayLayer />
      {children}
    </>
  );
} 
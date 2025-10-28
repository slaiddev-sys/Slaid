/**
 * Color utility functions for handling both Tailwind classes and arbitrary HEX colors
 */

/**
 * Check if a string is a valid HEX color code
 */
export function isHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

/**
 * Check if a string is a Tailwind color class
 */
export function isTailwindColor(color: string): boolean {
  // Common Tailwind color patterns
  const tailwindPatterns = [
    /^(red|blue|green|yellow|purple|pink|indigo|gray|grey|black|white|transparent|current)-?(\d{1,3})?$/,
    /^(slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-?(\d{1,3})?$/,
  ];
  
  return tailwindPatterns.some(pattern => pattern.test(color));
}

/**
 * Convert any color (HEX or Tailwind) to a Tailwind class for backgrounds
 */
export function getBgClass(color: string): string {
  if (!color) return '';
  
  if (isHexColor(color)) {
    return `bg-[${color}]`;
  }
  
  if (isTailwindColor(color)) {
    return color.startsWith('bg-') ? color : `bg-${color}`;
  }
  
  // Fallback: assume it's a Tailwind color without prefix
  return `bg-${color}`;
}

/**
 * Convert any color (HEX or Tailwind) to a Tailwind class for text
 */
export function getTextClass(color: string): string {
  if (!color) return '';
  
  if (isHexColor(color)) {
    return `text-[${color}]`;
  }
  
  if (isTailwindColor(color)) {
    return color.startsWith('text-') ? color : `text-${color}`;
  }
  
  // Fallback: assume it's a Tailwind color without prefix
  return `text-${color}`;
}

/**
 * Convert any color (HEX or Tailwind) to a Tailwind class for borders
 */
export function getBorderClass(color: string): string {
  if (!color) return '';
  
  if (isHexColor(color)) {
    return `border-[${color}]`;
  }
  
  if (isTailwindColor(color)) {
    return color.startsWith('border-') ? color : `border-${color}`;
  }
  
  // Fallback: assume it's a Tailwind color without prefix
  return `border-${color}`;
}

/**
 * Convert any color to inline CSS style (for when Tailwind classes won't work)
 */
export function getColorStyle(color: string, property: 'background' | 'color' | 'borderColor'): React.CSSProperties {
  if (!color) return {};
  
  if (isHexColor(color)) {
    return { [property]: color };
  }
  
  // For Tailwind colors, let Tailwind handle it (return empty style)
  return {};
}

/**
 * Validate and normalize a color string
 */
export function normalizeColor(color: string): string {
  if (!color) return '';
  
  // Normalize HEX colors (ensure # prefix)
  if (/^[0-9A-Fa-f]{3,8}$/.test(color)) {
    return `#${color}`;
  }
  
  return color;
}

/**
 * Get gradient classes for Tailwind (supports HEX colors)
 */
export function getGradientClasses(
  direction: string, 
  fromColor: string, 
  toColor: string
): string {
  const directionClass = direction.startsWith('bg-gradient-') ? direction : `bg-gradient-${direction}`;
  
  let fromClass = '';
  let toClass = '';
  
  if (isHexColor(fromColor)) {
    fromClass = `from-[${fromColor}]`;
  } else {
    fromClass = fromColor.startsWith('from-') ? fromColor : `from-${fromColor}`;
  }
  
  if (isHexColor(toColor)) {
    toClass = `to-[${toColor}]`;
  } else {
    toClass = toColor.startsWith('to-') ? toColor : `to-${toColor}`;
  }
  
  return `${directionClass} ${fromClass} ${toClass}`;
}

/**
 * Create a CSS gradient string for inline styles (when Tailwind won't work)
 */
export function getCSSGradient(
  direction: string,
  fromColor: string,
  toColor: string
): string {
  // Convert Tailwind directions to CSS angles
  const directionMap: { [key: string]: string } = {
    'to-r': '90deg',
    'to-l': '270deg',
    'to-t': '0deg',
    'to-b': '180deg',
    'to-tr': '45deg',
    'to-tl': '315deg',
    'to-br': '135deg',
    'to-bl': '225deg',
  };
  
  const cssDirection = directionMap[direction] || '135deg';
  
  // Normalize colors
  const normalizedFrom = normalizeColor(fromColor);
  const normalizedTo = normalizeColor(toColor);
  
  return `linear-gradient(${cssDirection}, ${normalizedFrom}, ${normalizedTo})`;
}

/**
 * Extended color type that accepts both predefined colors and HEX codes
 */
export type FlexibleColor = 
  | 'primary' | 'secondary' | 'tertiary' | 'accent'
  | 'success' | 'warning' | 'error' | 'info'
  | 'white' | 'black' | 'transparent' | 'current'
  | `#${string}` // HEX colors
  | string; // Any other color string

/**
 * Map predefined color names to actual colors (for consistency)
 */
export const COLOR_MAP: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#6b7280',
  tertiary: '#9ca3af',
  accent: '#a855f7',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  current: 'currentColor',
};

/**
 * Resolve a flexible color to its actual value
 */
export function resolveColor(color: FlexibleColor): string {
  if (!color) return '';
  
  // Check if it's a predefined color
  if (COLOR_MAP[color]) {
    return COLOR_MAP[color];
  }
  
  // Return as-is (HEX codes, Tailwind classes, etc.)
  return color;
} 
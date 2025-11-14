/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        // Essential Google Fonts loaded via CSS
        'instrument-serif': ['"Instrument Serif"', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'playfair-display': ['"Playfair Display"', 'serif'],
        'lora': ['Lora', 'serif'],
        // Popular fonts
        'open-sans': ['"Open Sans"', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'source-serif-pro': ['"Source Serif Pro"', 'serif'],
        'oswald': ['Oswald', 'sans-serif'],
        // System fonts
        'helvetica-neue': ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        'helvetica': ['Helvetica', 'Arial', 'sans-serif'],
        // User requested 10 fonts
        'georgia': ['Georgia', 'serif'],
        'merriweather': ['Merriweather', 'serif'],
        'times-new-roman': ['"Times New Roman"', 'Times', 'serif'],
        'lato': ['Lato', 'sans-serif'],
        'segoe-ui': ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        'bebas-neue': ['"Bebas Neue"', 'cursive'],
        'raleway': ['Raleway', 'sans-serif'],
        'dm-serif-display': ['"DM Serif Display"', 'serif'],
        'cabin': ['Cabin', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        // Semantic shadow presets for natural language use
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 12px rgba(0, 0, 0, 0.08)', 
        'medium': '0 6px 16px rgba(0, 0, 0, 0.12)',
        'sharp': '0 10px 20px rgba(0, 0, 0, 0.2)',
        'intense': '0 14px 28px rgba(0, 0, 0, 0.3)',
        
        // Depth-focused shadows for natural language depth control
        'shallow': '0 3px 10px rgba(0, 0, 0, 0.08)',     // Minimal depth
        'deep': '0 12px 25px rgba(0, 0, 0, 0.15)',       // Significant depth
        'deeper': '0 20px 40px rgba(0, 0, 0, 0.2)',      // Maximum depth
        
        // Combined intensity + depth presets (popular combinations)
        'soft-deep': '0 8px 20px rgba(0, 0, 0, 0.08)',   // Soft but with depth
        'medium-deep': '0 10px 24px rgba(0, 0, 0, 0.12)', // Medium with depth
        'sharp-deep': '0 15px 30px rgba(0, 0, 0, 0.2)',  // Sharp with significant depth
      },
    },
  },
  safelist: [
    // Text colors
    'text-red-500', 'text-red-600', 'text-red-700',
    'text-green-500', 'text-green-600', 'text-green-700',
    'text-blue-500', 'text-blue-600', 'text-blue-700',
    'text-yellow-500', 'text-yellow-600', 'text-yellow-700',
    'text-purple-500', 'text-purple-600', 'text-purple-700',
    'text-pink-500', 'text-pink-600', 'text-pink-700',
    'text-indigo-500', 'text-indigo-600', 'text-indigo-700',
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-white', 'text-black',
    
    // Dynamic pixel sizing pattern
    { pattern: /^text-\[\d+px\]$/ },
    
    // Common pixel sizes
    'text-[12px]', 'text-[14px]', 'text-[16px]', 'text-[18px]', 'text-[20px]',
    'text-[22px]', 'text-[24px]', 'text-[26px]', 'text-[28px]', 'text-[30px]',
    'text-[32px]', 'text-[36px]', 'text-[40px]', 'text-[48px]', 'text-[50px]',
    'text-[60px]', 'text-[72px]',
    
    // Font families
    'font-instrument-serif', 'font-inter', 'font-montserrat', 'font-roboto', 
    'font-playfair-display', 'font-lora', 'font-open-sans', 'font-poppins',
    'font-source-serif-pro', 'font-oswald', 'font-georgia', 'font-merriweather',
    'font-times-new-roman', 'font-lato', 'font-segoe-ui', 'font-noto-sans',
    'font-bebas-neue', 'font-raleway', 'font-dm-serif-display', 'font-cabin',
    'font-helvetica-neue', 'font-helvetica',
    
    // Font weights
    'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold',
    'font-thin', 'font-extralight', 'font-extrabold', 'font-black',
    
    // Text alignment (including justify)
    'text-left', 'text-center', 'text-right', 'text-justify',
    
    // Z-index utilities for layering (comprehensive set)
    '-z-50', '-z-40', '-z-30', '-z-20', '-z-10', '-z-5', '-z-3', '-z-1',
    'z-0', 'z-1', 'z-5', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    
    // Background image utilities
    'bg-cover', 'bg-center', 'bg-no-repeat', 'bg-repeat', 'bg-contain',
    'opacity-75', 'opacity-50', 'opacity-25', 'opacity-90',
    
    // Glassmorphism utilities
    'backdrop-blur-sm', 'backdrop-blur-md', 'backdrop-blur-lg', 'backdrop-blur-xl', 'backdrop-blur-2xl',
    'bg-white/10', 'bg-white/20', 'bg-white/30', 'bg-white/40', 'bg-white/50',
    'border-white/10', 'border-white/20', 'border-white/30', 'border-white/40',
    '-z-8', // Special z-index for blur layer
    
    // Background colors (comprehensive list)
    'bg-white', 'bg-black', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 
    'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900', 'bg-red-100', 'bg-red-200', 'bg-red-300',
    'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900', 'bg-blue-100',
    'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800',
    'bg-blue-900', 'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500',
    'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900', 'bg-yellow-100', 'bg-yellow-200',
    'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800',
    'bg-yellow-900', 'bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500',
    'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900', 'bg-pink-100', 'bg-pink-200',
    'bg-pink-300', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900',
    'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600',
    'bg-indigo-700', 'bg-indigo-800', 'bg-indigo-900',
    
    // Gradient classes (comprehensive list)
    'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b',
    'bg-gradient-to-tr', 'bg-gradient-to-tl', 'bg-gradient-to-br', 'bg-gradient-to-bl',
    // From colors
    'from-white', 'from-black', 'from-gray-100', 'from-gray-200', 'from-gray-300', 'from-gray-400', 'from-gray-500',
    'from-gray-600', 'from-gray-700', 'from-gray-800', 'from-gray-900', 'from-red-100', 'from-red-200', 'from-red-300',
    'from-red-400', 'from-red-500', 'from-red-600', 'from-red-700', 'from-red-800', 'from-red-900',
    'from-blue-100', 'from-blue-200', 'from-blue-300', 'from-blue-400', 'from-blue-500', 'from-blue-600',
    'from-blue-700', 'from-blue-800', 'from-blue-900', 'from-green-100', 'from-green-200', 'from-green-300',
    'from-green-400', 'from-green-500', 'from-green-600', 'from-green-700', 'from-green-800', 'from-green-900',
    'from-yellow-100', 'from-yellow-200', 'from-yellow-300', 'from-yellow-400', 'from-yellow-500', 'from-yellow-600',
    'from-yellow-700', 'from-yellow-800', 'from-yellow-900', 'from-purple-100', 'from-purple-200', 'from-purple-300',
    'from-purple-400', 'from-purple-500', 'from-purple-600', 'from-purple-700', 'from-purple-800', 'from-purple-900',
    'from-pink-100', 'from-pink-200', 'from-pink-300', 'from-pink-400', 'from-pink-500', 'from-pink-600',
    'from-pink-700', 'from-pink-800', 'from-pink-900', 'from-indigo-100', 'from-indigo-200', 'from-indigo-300',
    'from-indigo-400', 'from-indigo-500', 'from-indigo-600', 'from-indigo-700', 'from-indigo-800', 'from-indigo-900',
    // To colors
    'to-white', 'to-black', 'to-gray-100', 'to-gray-200', 'to-gray-300', 'to-gray-400', 'to-gray-500',
    'to-gray-600', 'to-gray-700', 'to-gray-800', 'to-gray-900', 'to-red-100', 'to-red-200', 'to-red-300',
    'to-red-400', 'to-red-500', 'to-red-600', 'to-red-700', 'to-red-800', 'to-red-900',
    'to-blue-100', 'to-blue-200', 'to-blue-300', 'to-blue-400', 'to-blue-500', 'to-blue-600',
    'to-blue-700', 'to-blue-800', 'to-blue-900', 'to-green-100', 'to-green-200', 'to-green-300',
    'to-green-400', 'to-green-500', 'to-green-600', 'to-green-700', 'to-green-800', 'to-green-900',
    'to-yellow-100', 'to-yellow-200', 'to-yellow-300', 'to-yellow-400', 'to-yellow-500', 'to-yellow-600',
    'to-yellow-700', 'to-yellow-800', 'to-yellow-900', 'to-purple-100', 'to-purple-200', 'to-purple-300',
    'to-purple-400', 'to-purple-500', 'to-purple-600', 'to-purple-700', 'to-purple-800', 'to-purple-900',
    'to-pink-100', 'to-pink-200', 'to-pink-300', 'to-pink-400', 'to-pink-500', 'to-pink-600',
    'to-pink-700', 'to-pink-800', 'to-pink-900', 'to-indigo-100', 'to-indigo-200', 'to-indigo-300',
    'to-indigo-400', 'to-indigo-500', 'to-indigo-600', 'to-indigo-700', 'to-indigo-800', 'to-indigo-900',
    // Via colors (for 3-color gradients)
    'via-white', 'via-black', 'via-gray-100', 'via-gray-200', 'via-gray-300', 'via-gray-400', 'via-gray-500',
    'via-gray-600', 'via-gray-700', 'via-gray-800', 'via-gray-900', 'via-red-500', 'via-blue-500', 'via-green-500',
    'via-yellow-500', 'via-purple-500', 'via-pink-500', 'via-indigo-500',
    
    // Responsive Background Positioning
    'bg-center', 'bg-top', 'bg-bottom', 'bg-left', 'bg-right',
    'bg-left-top', 'bg-right-top', 'bg-left-bottom', 'bg-right-bottom',
    'sm:bg-center', 'md:bg-center', 'lg:bg-center', 'xl:bg-center',
    'sm:bg-top', 'md:bg-top', 'lg:bg-top', 'xl:bg-top',
    'sm:bg-bottom', 'md:bg-bottom', 'lg:bg-bottom', 'xl:bg-bottom',
    
    // Responsive Container Sizing
    'w-screen', 'h-screen', 'min-h-screen', 'object-cover',
    'sm:w-full', 'md:w-full', 'lg:w-full', 'xl:w-full',
    'sm:h-full', 'md:h-full', 'lg:h-full', 'xl:h-full',
    'sm:bg-cover', 'md:bg-cover', 'lg:bg-cover', 'xl:bg-cover',
    
    // Responsive Opacity
    'opacity-75', 'opacity-80', 'opacity-85', 'opacity-90', 'opacity-95',
    'sm:opacity-75', 'md:opacity-80', 'lg:opacity-85', 'xl:opacity-90',
    
    // Dark Mode Support
    'dark:bg-gray-800', 'dark:bg-gray-900', 'dark:bg-black',
    'dark:bg-red-500', 'dark:bg-blue-500', 'dark:bg-green-500',
    'dark:bg-yellow-500', 'dark:bg-purple-500', 'dark:bg-pink-500',
    'dark:bg-indigo-500', 'dark:bg-orange-500',
    
    // Responsive background patterns
    { pattern: /^(sm:|md:|lg:|xl:)bg-/ },
    { pattern: /^dark:bg-/ },
    { pattern: /^(sm:|md:|lg:|xl:)opacity-/ },
    { pattern: /^(sm:|md:|lg:|xl:)bg-gradient-/ },
    
    // ImageBlock Component Classes
    // Shadow utilities
    'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
    'hover:shadow-lg', 'hover:shadow-xl',
    
    // Semantic shadow presets (NEW - natural language shadows)
    'shadow-subtle', 'shadow-soft', 'shadow-medium', 'shadow-sharp', 'shadow-intense',
    'hover:shadow-subtle', 'hover:shadow-soft', 'hover:shadow-medium', 'hover:shadow-sharp', 'hover:shadow-intense',
    
    // Depth-focused shadows (NEW - natural language depth control)
    'shadow-shallow', 'shadow-deep', 'shadow-deeper',
    'hover:shadow-shallow', 'hover:shadow-deep', 'hover:shadow-deeper',
    
    // Combined intensity + depth shadows (NEW - popular combinations)
    'shadow-soft-deep', 'shadow-medium-deep', 'shadow-sharp-deep',
    'hover:shadow-soft-deep', 'hover:shadow-medium-deep', 'hover:shadow-sharp-deep',
    
    // Border radius
    'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full',
    
    // Object fitting and positioning
    'object-cover', 'object-contain', 'object-center',
    
    // Hover and transition effects
    'hover:scale-105', 'transition-transform', 'transition-shadow',
    'duration-300', 'duration-500',
    
    // Max width constraints
    'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg',
    
    // Specific sizing for image variants
    'h-64', 'h-80', 'h-96', 'w-24', 'h-24', 'w-32', 'h-32',
    'h-16', 'h-20', 'w-8', 'h-8', 'w-10', 'h-10',
    'md:h-80', 'lg:h-96', 'md:w-32', 'md:h-32', 'md:h-20', 'md:w-10', 'md:h-10',
    
    // Border styles
    'border-4', 'border-white',
    
    // Accessibility
    'sr-only',
    
    // Gradient overlays
    'bg-gradient-to-t', 'from-black/70', 'to-transparent',
    
    // Layout utilities
    'inline-block', 'mx-auto', 'justify-items-center',
    
    // ImageBlock utilities (simplified system)
    // Size utilities
    'max-w-24', 'max-w-40', 'max-w-64', 'max-w-80', 'max-w-96', 'w-full',
    
    // Circle utilities (square dimensions for perfect circles)
    'w-24', 'h-24', 'w-40', 'h-40', 'w-64', 'h-64', 'w-80', 'h-80', 'w-96', 'h-96',
    'aspect-square', 'h-full',
    
    // Object fit utilities  
    'object-cover', 'object-contain', 'object-fill', 'object-scale-down',
    
    // Alignment utilities
    'mx-auto', 'mr-auto', 'ml-auto',
    
    // Style utilities
    'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full', 'shadow-md',
    
    // Layout-specific classes for CoverImageLeftTextRight
    'min-h-screen', 'h-64', 'lg:h-full', 'w-1/2', 'lg:w-1/2', 'max-w-2xl',
    'flex-col', 'lg:flex-row', 'justify-center', 'items-center',
    'mb-4', 'mb-6', 'mb-8', 'mb-12', 'lg:mb-6', 'lg:mb-8', 'lg:mb-12',
    'p-8', 'p-10', 'p-12', 'p-16', 'lg:p-12', 'lg:p-16', 'lg:p-20', 'lg:p-24', 'xl:p-24', 'xl:p-32',
    'max-h-8', 'max-h-10', 'lg:max-h-10',
    'uppercase', 'tracking-wide', 'leading-tight', 'leading-relaxed',
    'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'lg:text-4xl', 'lg:text-5xl', 'lg:text-6xl', 'xl:text-5xl', 'xl:text-6xl',
    'text-base', 'text-lg', 'text-xl', 'lg:text-lg', 'lg:text-xl', 'lg:text-base',
    'text-sm', 'lg:text-base',
    
    // Additional responsive utility classes
    'mx-auto', 'lg:mx-0', 'sm:flex-row',
    
    // Cover_LeftImageTextRight layout classes
    'cover-left-image-text-right-layout',
    'left-column',
    'right-column',
    'content-stack',
    'logo-container',
    'title-container', 
    'paragraph-container',
    'space-y-6',
    'space-y-4',
    'space-y-3',
    'lg:space-y-6',
    'lg:space-y-4',
    'text-4xl',
    'text-2xl',
    'text-3xl',
    'lg:text-3xl',
    'xl:text-4xl',
    'text-sm',
    'text-base',
    'lg:text-base',
    'xl:text-lg',
    'leading-tight',
    'leading-relaxed',
    'text-gray-900',
    'text-gray-600',
    'mb-2',
    'mb-1',
    'w-24',
    'h-12',
    'w-16',
    'h-8',
    'w-20',
    'h-10',
    'lg:w-24',
    'lg:h-12',
    'lg:w-20',
    'lg:h-10',
    'bg-gray-200',
    'bg-gray-300',
    'object-cover',
    'object-contain',
    'max-w-full',
    'max-h-full',
    'w-1/2',
    'h-full',
    'min-h-[400px]',
    'px-8',
    'px-12',
    'px-16',
    'px-4',
    'px-6',
    'lg:px-12',
    'lg:px-6',
    'xl:px-16',
    'xl:px-8',
    
    // Line clamp utilities for text truncation
    'line-clamp-1', 'line-clamp-2', 'line-clamp-3', 'line-clamp-4', 'line-clamp-5', 'line-clamp-6',
  ],
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar'),
  ],
}; 
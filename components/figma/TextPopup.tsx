import React, { useEffect, useRef, useState } from 'react';

interface TextPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeSize?: (fontSize: number) => void;
  onChangeFont?: (fontFamily: string) => void;
  onChangeColor?: (color: string) => void;
  onChangeAlignment?: (alignment: 'left' | 'center' | 'right') => void;
  onDeleteText: () => void;
  position: { x: number; y: number };
  currentFontSize?: number;
  currentFontFamily?: string;
  currentColor?: string;
  currentAlignment?: 'left' | 'center' | 'right';
}

export default function TextPopup({ 
  isOpen, 
  onClose, 
  onChangeSize, 
  onChangeFont, 
  onChangeColor,
  onChangeAlignment,
  onDeleteText, 
  position,
  currentFontSize = 16,
  currentFontFamily = 'font-helvetica-neue',
  currentColor = '#000000',
  currentAlignment = 'left'
}: TextPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(currentFontSize);
  
  const [showFontSizeInput, setShowFontSizeInput] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [showAlignmentDropdown, setShowAlignmentDropdown] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 50, y: 50 });
  const [huePosition, setHuePosition] = useState(0);

  // Available fonts matching the system
  const availableFonts = [
    { value: 'font-helvetica-neue', label: 'Helvetica Neue' },
    { value: 'font-inter', label: 'Inter' },
    { value: 'font-montserrat', label: 'Montserrat' },
    { value: 'font-roboto', label: 'Roboto' },
    { value: 'font-playfair-display', label: 'Playfair Display' },
    { value: 'font-lora', label: 'Lora' },
    { value: 'font-open-sans', label: 'Open Sans' },
    { value: 'font-poppins', label: 'Poppins' },
    { value: 'font-source-serif-pro', label: 'Source Serif Pro' },
    { value: 'font-oswald', label: 'Oswald' },
    { value: 'font-georgia', label: 'Georgia' },
    { value: 'font-merriweather', label: 'Merriweather' },
    { value: 'font-times-new-roman', label: 'Times New Roman' },
    { value: 'font-instrument-serif', label: 'Instrument Serif' },
    { value: 'font-lato', label: 'Lato' },
    { value: 'font-bebas-neue', label: 'Bebas Neue' },
    { value: 'font-raleway', label: 'Raleway' },
    { value: 'font-dm-serif-display', label: 'DM Serif Display' },
    { value: 'font-cabin', label: 'Cabin' },
    { value: 'font-segoe-ui', label: 'Segoe UI' },
    { value: 'font-noto-sans', label: 'Noto Sans' }
  ];

  // Predefined colors like in the image
  const predefinedColors = [
    '#FFFFFF', // White
    '#9CA3AF', // Gray
    '#3B82F6', // Blue
    '#10B981', // Green
    '#6B7280', // Dark Gray
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    'multicolor' // Special multicolor option
  ];

  useEffect(() => {
    setFontSize(currentFontSize);
  }, [currentFontSize]);

  // Reset all popup states when popup closes
  useEffect(() => {
    if (!isOpen) {
      setShowFontDropdown(false);
      setShowColorPicker(false);
      setShowCustomColorPicker(false);
      setShowAlignmentDropdown(false);
      setIsDragging(false);
      setIsDraggingHue(false);
    }
  }, [isOpen]);

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Find the color area element and update position
        const colorArea = document.querySelector('[data-color-area]') as HTMLElement;
        if (colorArea) {
          const rect = colorArea.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
          
          setPickerPosition({ x, y });
          
          const saturation = x / 100;
          const value = 1 - (y / 100);
          const hue = (huePosition / 100) * 360;
          
          const hex = hsvToHex(hue, saturation, value);
          handleCustomColorChange(hex);
        }
      }
      
      if (isDraggingHue) {
        // Find the hue slider element and update position
        const hueSlider = document.querySelector('[data-hue-slider]') as HTMLElement;
        if (hueSlider) {
          const rect = hueSlider.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          
          setHuePosition(x);
          
          const hue = (x / 100) * 360;
          const saturation = pickerPosition.x / 100;
          const value = 1 - (pickerPosition.y / 100);
          
          const hex = hsvToHex(hue, saturation, value);
          handleCustomColorChange(hex);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsDraggingHue(false);
    };

    if (isDragging || isDraggingHue) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isDraggingHue, huePosition, pickerPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        console.log('📝 TextPopup: Click outside detected, closing popup');
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Add a small delay to prevent the opening click from immediately closing the popup
      const timeoutId = setTimeout(() => {
        console.log('📝 TextPopup: Adding click outside listener');
        document.addEventListener('mousedown', handleClickOutside);
      }, 100); // 100ms delay
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    onChangeSize?.(newSize);
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onChangeFont?.(fontFamily);
    setShowFontDropdown(false);
  };

  const handleColorChange = (color: string) => {
    onChangeColor?.(color);
    setShowColorPicker(false);
    setShowCustomColorPicker(false);
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onChangeAlignment?.(alignment);
    setShowAlignmentDropdown(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChangeColor?.(color);
  };

  const handleColorAreaMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateColorFromPosition(e);
  };

  const handleColorAreaMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateColorFromPosition(e);
    }
  };

  const handleColorAreaMouseUp = () => {
    setIsDragging(false);
  };

  const updateColorFromPosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    setPickerPosition({ x, y });
    
    // Convert position to HSV and then to hex
    const saturation = x / 100;
    const value = 1 - (y / 100);
    const hue = (huePosition / 100) * 360;
    
    const hex = hsvToHex(hue, saturation, value);
    handleCustomColorChange(hex);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingHue(true);
    updateHueFromPosition(e);
  };

  const updateHueFromPosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    
    setHuePosition(x);
    
    // Update the color based on new hue
    const hue = (x / 100) * 360;
    const saturation = pickerPosition.x / 100;
    const value = 1 - (pickerPosition.y / 100);
    
    const hex = hsvToHex(hue, saturation, value);
    handleCustomColorChange(hex);
  };

  // HSV to Hex conversion
  const hsvToHex = (h: number, s: number, v: number): string => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  if (!isOpen) {
    console.log('📝 TextPopup: NOT OPEN, returning null');
    return null;
  }

  console.log('📝 TextPopup: RENDERING with position:', position);
  console.log('📝 TextPopup: Using FIXED positioning with z-index 2147483647');
  
  // Smart positioning with bounds checking to prevent breaking the page layout
  const popupWidth = 400; // Approximate popup width
  const popupHeight = 60; // Approximate popup height
  const margin = 10; // Margin from viewport edges
  
  const smartPosition = {
    x: Math.max(margin, Math.min(position.x, window.innerWidth - popupWidth - margin)),
    y: Math.max(margin, Math.min(position.y, window.innerHeight - popupHeight - margin))
  };

  return (
    <>
      {/* Popup */}
      <div
        ref={popupRef}
        data-text-popup
        className="fixed z-[2147483647] bg-gray-800 rounded-lg shadow-2xl border border-gray-600 flex items-center overflow-visible animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          left: `${smartPosition.x}px`,
          top: `${smartPosition.y}px`,
          // No transform - positioning is handled in FigmaText with clamping
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Font Size Control */}
        <div className="relative px-3 py-2 text-xs text-gray-200 hover:!text-white hover:!bg-gray-700 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap group">
          <div className="w-6 h-6 flex items-center justify-center mt-0.5">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform duration-200"
            >
              <path d="M3.5 13 5 7l1.5 6"/>
              <path d="M4 11h2"/>
              <path d="M12 6l3-3 3 3"/>
              <path d="M15 3v9"/>
            </svg>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value) || 16;
                setFontSize(newSize);
              }}
              onBlur={(e) => {
                const newSize = parseInt(e.target.value) || 16;
                handleFontSizeChange(Math.max(8, Math.min(72, newSize)));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newSize = parseInt(e.currentTarget.value) || 16;
                  handleFontSizeChange(Math.max(8, Math.min(72, newSize)));
                  e.currentTarget.blur();
                }
              }}
               className="w-12 px-1 py-0.5 text-xs bg-gray-700 border border-gray-600 rounded-l text-white text-center focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="8"
              max="72"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-col">
              {/* Up Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newSize = Math.min(72, fontSize + 1);
                  setFontSize(newSize);
                  handleFontSizeChange(newSize);
                }}
                className="w-4 h-3 bg-gray-700 border border-l-0 border-gray-600 rounded-tr hover:bg-gray-600 flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                  <polyline points="18,15 12,9 6,15"></polyline>
                </svg>
              </button>
              {/* Down Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newSize = Math.max(8, fontSize - 1);
                  setFontSize(newSize);
                  handleFontSizeChange(newSize);
                }}
                className="w-4 h-3 bg-gray-700 border border-l-0 border-t-0 border-gray-600 rounded-br hover:bg-gray-600 flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <span className="font-medium text-xs">px</span>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-600 h-6" />

        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFontDropdown(!showFontDropdown);
            }}
            className="px-3 py-2 text-xs text-gray-200 hover:!text-white hover:!bg-gray-700 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap group"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform duration-200"
              >
                <path d="M4 7V4h16v3"/>
                <path d="M9 20h6"/>
                <path d="M12 4v16"/>
              </svg>
            </div>
            <span className="font-medium">Font</span>
            <svg 
              width="8" 
              height="8" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${showFontDropdown ? 'rotate-180' : ''}`}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          
          {/* Font Dropdown */}
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-[2147483647] max-h-48 overflow-y-auto">
              {availableFonts.map((font) => (
                <button
                  key={font.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFontFamilyChange(font.value);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                    currentFontFamily === font.value ? 'bg-gray-700 text-white' : ''
                  }`}
                  style={{ fontFamily: font.label }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-600 h-6" />

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="px-3 py-2 text-xs text-gray-200 hover:!text-white hover:!bg-gray-700 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap group"
          >
            <div className="w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: currentColor }}>
            </div>
            <svg 
              width="8" 
              height="8" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${showColorPicker ? 'rotate-180' : ''}`}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          
          {/* Color Palette Dropdown */}
          {showColorPicker && (
            <div 
              className="absolute top-full right-0 mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-[2147483647]" 
              data-text-popup
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 mb-2">
                {predefinedColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (color === 'multicolor') {
                        setShowCustomColorPicker(true);
                      } else {
                        handleColorChange(color);
                      }
                    }}
                    className="w-3.5 h-3.5 rounded-full border border-gray-500 hover:scale-110 transition-transform duration-200"
                    style={{
                      background: color === 'multicolor' 
                        ? 'conic-gradient(from 0deg, #ff0000 0%, #ff8000 12.5%, #ffff00 25%, #80ff00 37.5%, #00ff00 50%, #00ff80 62.5%, #00ffff 75%, #8000ff 87.5%, #ff0000 100%)'
                        : color
                    }}
                  />
                ))}
              </div>
              
              {/* Custom Color Picker */}
              {showCustomColorPicker && (
                <div 
                  className="border-t border-gray-600 pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Main Color Area */}
                  <div 
                    data-color-area
                    className="relative w-52 h-28 mb-3 rounded-lg overflow-hidden border border-gray-500 cursor-crosshair"
                    style={{
                      background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${(huePosition / 100) * 360}, 100%, 50%))`
                    }}
                    onMouseDown={handleColorAreaMouseDown}
                    onMouseMove={handleColorAreaMouseMove}
                    onMouseUp={handleColorAreaMouseUp}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div 
                      className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
                      style={{
                        left: `${pickerPosition.x}%`,
                        top: `${pickerPosition.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  
                  {/* Hue Slider */}
                  <div className="relative w-52 mb-3">
                    <div 
                      data-hue-slider
                      className="w-full h-3 rounded-full border border-gray-500 cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%)'
                      }}
                      onMouseDown={handleHueMouseDown}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-lg pointer-events-none"
                      style={{
                        left: `${huePosition}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  
                  {/* Hex Input */}
                  <div className="flex items-center gap-2 w-52">
                    <span className="text-xs text-gray-300 font-medium">HEX</span>
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        handleCustomColorChange(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="#414a2e"
                      className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-600 h-6" />

        {/* Text Alignment */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAlignmentDropdown(!showAlignmentDropdown);
            }}
            className="px-3 py-2 text-xs text-gray-200 hover:!text-white hover:!bg-gray-700 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap group"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              {currentAlignment === 'left' && (
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform duration-200"
                >
                  <line x1="21" x2="3" y1="6" y2="6"/>
                  <line x1="15" x2="3" y1="12" y2="12"/>
                  <line x1="17" x2="3" y1="18" y2="18"/>
                </svg>
              )}
              {currentAlignment === 'center' && (
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform duration-200"
                >
                  <line x1="18" x2="6" y1="6" y2="6"/>
                  <line x1="21" x2="3" y1="12" y2="12"/>
                  <line x1="18" x2="6" y1="18" y2="18"/>
                </svg>
              )}
              {currentAlignment === 'right' && (
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform duration-200"
                >
                  <line x1="21" x2="3" y1="6" y2="6"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                  <line x1="21" x2="7" y1="18" y2="18"/>
                </svg>
              )}
            </div>
          </button>

          {/* Alignment Dropdown */}
          {showAlignmentDropdown && (
            <div 
              className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { value: 'left', label: 'Left', icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="21" x2="3" y1="6" y2="6"/>
                    <line x1="15" x2="3" y1="12" y2="12"/>
                    <line x1="17" x2="3" y1="18" y2="18"/>
                  </svg>
                )},
                { value: 'center', label: 'Center', icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" x2="6" y1="6" y2="6"/>
                    <line x1="21" x2="3" y1="12" y2="12"/>
                    <line x1="18" x2="6" y1="18" y2="18"/>
                  </svg>
                )},
                { value: 'right', label: 'Right', icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="21" x2="3" y1="6" y2="6"/>
                    <line x1="21" x2="9" y1="12" y2="12"/>
                    <line x1="21" x2="7" y1="18" y2="18"/>
                  </svg>
                )}
              ].map((alignment) => (
                <button
                  key={alignment.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlignmentChange(alignment.value as 'left' | 'center' | 'right');
                  }}
                  className={`w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center gap-2 ${
                    currentAlignment === alignment.value ? 'bg-gray-700 text-white' : ''
                  }`}
                >
                  <div className="w-3 h-3 flex items-center justify-center">
                    {alignment.icon}
                  </div>
                  {alignment.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-600 h-6" />

        {/* Delete Text Option */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteText();
            onClose();
          }}
          className="px-3 py-2 text-xs text-red-200 hover:!text-red-100 hover:!bg-red-600/20 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap group"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform duration-200"
            >
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </div>
          <span className="font-medium">Delete</span>
        </button>
      </div>
    </>
  );
}

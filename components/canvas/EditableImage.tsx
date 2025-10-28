import React, { useRef, useState } from 'react';
import { useCanvas } from './CanvasProvider';

interface EditableImageProps {
  id: string;
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fit?: 'contain' | 'cover' | 'fill';
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: boolean;
  shadowColor?: string;
  align?: 'left' | 'center' | 'right';
  caption?: string;
  className?: string;
  onUpdate?: (newSrc: string) => void;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  id,
  src,
  alt,
  size = 'md',
  fit = 'cover',
  rounded = false,
  shadow = false,
  shadowColor,
  align = 'center',
  caption,
  className = '',
  onUpdate
}) => {
  const { selectedElement, setSelectedElement } = useCanvas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const isSelected = selectedElement === id;

  // Size styles
  const sizeStyles = {
    xs: 'w-16 h-16',
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
    full: 'w-full h-auto'
  };

  // Fit styles
  const fitStyles = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill'
  };

  // Rounded styles
  const getRoundedClass = () => {
    if (rounded === true) return 'rounded-lg';
    if (rounded === false) return '';
    return `rounded-${rounded}`;
  };

  // Alignment styles
  const alignStyles = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto mr-0'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(id);
    
    // If already selected, open file picker
    if (isSelected) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const newSrc = result.url;
      
      setCurrentSrc(newSrc);
      onUpdate?.(newSrc);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const shadowStyle = shadow && shadowColor 
    ? { boxShadow: `0 10px 25px ${shadowColor}33` }
    : shadow 
    ? { boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }
    : {};

  return (
    <div className={`relative group ${alignStyles[align]} ${className}`}>
      <div
        className={`
          relative
          ${sizeStyles[size]}
          ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          transition-all duration-200
          cursor-pointer
          ${isUploading ? 'opacity-50' : ''}
        `}
        onClick={handleClick}
        style={shadowStyle}
      >
        <img
          src={currentSrc}
          alt={alt}
          className={`
            w-full h-full
            ${fitStyles[fit]}
            ${getRoundedClass()}
            transition-all duration-200
          `}
        />
        
        {/* Upload overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              {isUploading ? 'Uploading...' : 'Click to replace'}
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-sm text-gray-600 mt-2 text-center">{caption}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';

interface ImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeImage: () => void;
  onDeleteImage: () => void;
  position: { x: number; y: number };
}

export default function ImagePopup({ isOpen, onClose, onChangeImage, onDeleteImage, position }: ImagePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  // Use canvas-relative positioning (no additional offset needed)
  const smartPosition = { x: position.x, y: position.y };

  return (
    <>
      {/* Popup */}
      <div
        ref={popupRef}
        className="absolute z-[99999999] bg-gray-800 rounded-lg shadow-2xl border border-gray-600 flex items-center overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          left: `${smartPosition.x}px`,
          top: `${smartPosition.y}px`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Change Image Option */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChangeImage();
            onClose();
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
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
          <span className="font-medium">Change image</span>
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-600 h-6" />

        {/* Delete Image Option */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteImage();
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
          <span className="font-medium">Delete image</span>
        </button>
      </div>
    </>
  );
}

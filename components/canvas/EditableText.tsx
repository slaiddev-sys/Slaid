import React, { useState, useRef, useEffect } from 'react';
import { useCanvas } from './CanvasProvider';

interface EditableTextProps {
  id: string;
  children: string;
  variant?: 'title' | 'heading' | 'body' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  className?: string;
  onUpdate?: (newText: string) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  id,
  children,
  variant = 'body',
  color = 'text-gray-900',
  align = 'left',
  fontFamily = 'font-helvetica-neue',
  className = '',
  onUpdate
}) => {
  const { 
    selectedElement, 
    setSelectedElement, 
    editingElement, 
    setEditingElement,
    isEditing,
    setIsEditing 
  } = useCanvas();
  
  const [text, setText] = useState(children);
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedElement === id;
  const isCurrentlyEditing = editingElement === id && isEditing;

  // Variant styles
  const variantStyles = {
    title: 'text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight break-words',
    heading: 'text-xl lg:text-2xl xl:text-3xl font-semibold leading-tight break-words',
    body: 'text-base lg:text-lg leading-relaxed break-words',
    caption: 'text-sm lg:text-base leading-normal break-words'
  };

  // Alignment styles
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const baseClasses = `
    ${variantStyles[variant]}
    ${alignStyles[align]}
    ${color}
    ${fontFamily}
    ${className}
    transition-all duration-200
    cursor-text
    relative
    ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
    ${isCurrentlyEditing ? 'bg-blue-50' : ''}
  `.trim();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingElement(id);
    setIsEditing(true);
    setIsLocalEditing(true);
    
    // Focus textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setIsLocalEditing(false);
    setIsEditing(false);
    setEditingElement(null);
    
    if (text !== children) {
      onUpdate?.(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setText(children); // Reset to original text
      handleBlur();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isCurrentlyEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text, isCurrentlyEditing]);

  return (
    <div
      ref={elementRef}
      className={`relative group ${isSelected ? 'z-10' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isCurrentlyEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            ${baseClasses}
            bg-transparent
            border-none
            outline-none
            resize-none
            overflow-hidden
            w-full
            min-h-[1.5em]
          `}
          style={{ 
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontWeight: 'inherit'
          }}
        />
      ) : (
        <div className={baseClasses}>
          {text}
          {isSelected && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Double-click to edit
            </div>
          )}
        </div>
      )}
    </div>
  );
};

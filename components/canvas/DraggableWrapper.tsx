import React, { useRef, useState, useCallback } from 'react';
import { useCanvas } from './CanvasProvider';

interface DraggableWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onPositionChange?: (x: number, y: number) => void;
}

export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  id,
  children,
  className = '',
  onPositionChange
}) => {
  const { 
    selectedElement, 
    setSelectedElement, 
    draggedElement, 
    setDraggedElement 
  } = useCanvas();
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const isSelected = selectedElement === id;
  const isDraggedElement = draggedElement === id;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start drag if clicking on editable content
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    e.preventDefault();
    setSelectedElement(id);
    setDraggedElement(id);
    setIsDragging(true);
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [id, setSelectedElement, setDraggedElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !isDraggedElement) return;

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setPosition(newPosition);
    onPositionChange?.(newPosition.x, newPosition.y);
  }, [isDragging, isDraggedElement, dragStart, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedElement(null);
  }, [setDraggedElement]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      className={`
        relative
        ${className}
        ${isSelected ? 'z-20' : 'z-10'}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-30' : ''}
        transition-all duration-200
        group
      `}
      style={{
        transform: isDragging ? `translate(${position.x}px, ${position.y}px)` : undefined
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Selection handles */}
      {isSelected && !isDragging && (
        <>
          {/* Corner handles for resizing (future feature) */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-nw-resize"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-ne-resize"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-sw-resize"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-se-resize"></div>
          
          {/* Move indicator */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Drag to move
          </div>
        </>
      )}
      
      {/* Drag ghost effect */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-200 bg-opacity-30 rounded pointer-events-none"></div>
      )}
    </div>
  );
};

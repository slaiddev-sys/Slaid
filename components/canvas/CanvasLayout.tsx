import React from 'react';
import { CanvasProvider, useCanvas } from './CanvasProvider';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { DraggableWrapper } from './DraggableWrapper';

interface CanvasLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Canvas container that handles global canvas interactions
const CanvasContainer: React.FC<CanvasLayoutProps> = ({ children, className = '' }) => {
  const { setSelectedElement, setEditingElement, setIsEditing } = useCanvas();

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas background, not on child elements
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setEditingElement(null);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`
        relative
        min-h-screen
        bg-gray-50
        overflow-hidden
        ${className}
      `}
      onClick={handleCanvasClick}
    >
      {/* Canvas grid (optional visual aid) */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Canvas content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Canvas toolbar (future feature) */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center space-x-4 z-50">
        <span className="text-sm text-gray-600">Canvas Mode</span>
        <div className="w-px h-4 bg-gray-300"></div>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Select
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-800">
          Text
        </button>
        <button className="text-sm text-gray-600 hover:text-gray-800">
          Image
        </button>
      </div>
    </div>
  );
};

// Main Canvas Layout wrapper
export const CanvasLayout: React.FC<CanvasLayoutProps> = ({ children, className }) => {
  return (
    <CanvasProvider>
      <CanvasContainer className={className}>
        {children}
      </CanvasContainer>
    </CanvasProvider>
  );
};

// Enhanced components that work within the canvas
export const CanvasText: React.FC<React.ComponentProps<typeof EditableText>> = (props) => {
  return (
    <DraggableWrapper id={props.id}>
      <EditableText {...props} />
    </DraggableWrapper>
  );
};

export const CanvasImage: React.FC<React.ComponentProps<typeof EditableImage>> = (props) => {
  return (
    <DraggableWrapper id={props.id}>
      <EditableImage {...props} />
    </DraggableWrapper>
  );
};

// Utility function to wrap any component in canvas functionality
export const withCanvas = <P extends object>(
  Component: React.ComponentType<P>,
  id: string
) => {
  return (props: P) => (
    <DraggableWrapper id={id}>
      <Component {...props} />
    </DraggableWrapper>
  );
};

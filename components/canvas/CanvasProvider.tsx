import React, { createContext, useContext, useState, useCallback } from 'react';

interface CanvasContextType {
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  editingElement: string | null;
  setEditingElement: (id: string | null) => void;
  draggedElement: string | null;
  setDraggedElement: (id: string | null) => void;
  updateElement: (id: string, updates: any) => void;
  elements: Record<string, any>;
  setElements: (elements: Record<string, any>) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: React.ReactNode;
  initialElements?: Record<string, any>;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ 
  children, 
  initialElements = {} 
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<Record<string, any>>(initialElements);

  const updateElement = useCallback((id: string, updates: any) => {
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  const value: CanvasContextType = {
    selectedElement,
    setSelectedElement,
    isEditing,
    setIsEditing,
    editingElement,
    setEditingElement,
    draggedElement,
    setDraggedElement,
    updateElement,
    elements,
    setElements
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};

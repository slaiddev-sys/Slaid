import { useState, useRef } from 'react';

export interface FigmaTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  scale: number;
}

export interface FigmaImageState {
  // Current URL
  currentUrl: string;
  
  // States
  isHovered: boolean;
  isIconHovered: boolean;
  isSelected: boolean;
  isDragging: boolean;
  dragHandle: string | null;
  transform: FigmaTransform;
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface FigmaImageHandlers {
  handleUpload: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClick: (e: React.MouseEvent) => void;
  handleDragStart: (e: React.MouseEvent) => void;
  handleResizeStart: (e: React.MouseEvent, handle: string) => void;
  handleImageDelete: () => void;
  setIsHovered: (hovered: boolean) => void;
  setIsIconHovered: (hovered: boolean) => void;
}

export interface FigmaMultiSelectionState {
  // Logo state (separate from images)
  currentLogoUrl: string;
  isLogoHovered: boolean;
  isLogoIconHovered: boolean;
  isLogoSelected: boolean;
  isLogoDragging: boolean;
  logoDragHandle: string | null;
  logoTransform: FigmaTransform;
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  logoContainerRef: React.RefObject<HTMLDivElement | null>;
  
  // Images state (multiple images with single selection)
  images: Record<string, FigmaImageState>;
  selectedImageId: string | null;
}

export interface FigmaMultiSelectionHandlers {
  // Logo handlers
  handleLogoUpload: () => void;
  handleLogoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoClick: (e: React.MouseEvent) => void;
  handleLogoDragStart: (e: React.MouseEvent) => void;
  handleLogoResizeStart: (e: React.MouseEvent, handle: string) => void;
  setIsLogoHovered: (hovered: boolean) => void;
  setIsLogoIconHovered: (hovered: boolean) => void;
  
  // Image handlers (per image ID)
  getImageHandlers: (imageId: string) => FigmaImageHandlers;
  
  // Global handlers
  handleClickOutside: () => void;
}

export interface UseFigmaMultiSelectionProps {
  imageIds: string[];
  initialLogoUrl?: string;
  initialImageUrls?: Record<string, string>;
  initialImageTransforms?: Record<string, { x: number; y: number; scaleX?: number; scaleY?: number; scale?: number }>;
  onUpdate?: (updates: any) => void;
}

export function useFigmaMultiSelection({
  imageIds,
  initialLogoUrl = '',
  initialImageUrls = {},
  initialImageTransforms = {},
  onUpdate
}: UseFigmaMultiSelectionProps): [FigmaMultiSelectionState, FigmaMultiSelectionHandlers] {
  
  // Logo states (unchanged from original)
  const [currentLogoUrl, setCurrentLogoUrl] = useState(initialLogoUrl);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLogoIconHovered, setIsLogoIconHovered] = useState(false);
  const [isLogoSelected, setIsLogoSelected] = useState(false);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [logoDragHandle, setLogoDragHandle] = useState<string | null>(null);
  const [logoTransform, setLogoTransform] = useState<FigmaTransform>({
    x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1
  });
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  
  // Create refs for each image outside of state - initialize immediately to avoid hydration issues
  const imageFileInputRefs = useRef<Record<string, React.RefObject<HTMLInputElement>>>({});
  const imageContainerRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  
  // Initialize refs for each image ID immediately (avoid conditional initialization for hydration)
  imageIds.forEach(id => {
    if (!imageFileInputRefs.current[id]) {
      imageFileInputRefs.current[id] = { current: null };
    }
    if (!imageContainerRefs.current[id]) {
      imageContainerRefs.current[id] = { current: null };
    }
  });

  // Images states
  const [images, setImages] = useState<Record<string, FigmaImageState>>(() => {
    const initialImages: Record<string, FigmaImageState> = {};
    imageIds.forEach(id => {
      const savedTransform = initialImageTransforms[id] || { x: 0, y: 0 };
      initialImages[id] = {
        currentUrl: initialImageUrls[id] || '',
        isHovered: false,
        isIconHovered: false,
        isSelected: false,
        isDragging: false,
        dragHandle: null,
        transform: { 
          x: savedTransform.x, 
          y: savedTransform.y, 
          scaleX: savedTransform.scaleX || 1, 
          scaleY: savedTransform.scaleY || 1, 
          scale: savedTransform.scale || 1 
        },
        fileInputRef: imageFileInputRefs.current[id],
        containerRef: imageContainerRefs.current[id]
      };
    });
    return initialImages;
  });
  
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Helper to update specific image state
  const updateImageState = (imageId: string, updates: Partial<FigmaImageState>) => {
    setImages(prev => ({
      ...prev,
      [imageId]: { ...prev[imageId], ...updates }
    }));
  };

  // Logo handlers (unchanged from original)
  const handleLogoUpload = () => {
    logoFileInputRef.current?.click();
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogoUrl = e.target?.result as string;
        setCurrentLogoUrl(newLogoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLogoSelected(!isLogoSelected);
    // Deselect all images when selecting logo
    setSelectedImageId(null);
    imageIds.forEach(id => {
      updateImageState(id, { isSelected: false });
    });
  };

  const handleLogoDragStart = (e: React.MouseEvent) => {
    if (!isLogoSelected) return;
    
    const target = e.target as HTMLElement;
    if (target.dataset.resizeHandle) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsLogoDragging(true);
    setLogoDragHandle('move');
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...logoTransform };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setLogoTransform({
        ...startTransform,
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      });
    };
    
    const handleMouseUp = () => {
      setIsLogoDragging(false);
      setLogoDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleLogoResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLogoDragging(true);
    setLogoDragHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...logoTransform };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newTransform = { ...startTransform };
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const direction = (handle === 'nw' || handle === 'sw' || handle === 'w' || handle === 'n') ? 
        (deltaX < 0 || deltaY < 0 ? 1 : -1) : (deltaX > 0 || deltaY > 0 ? 1 : -1);
      const scaleFactor = 1 + (distance * direction * 0.003);
      newTransform.scale = Math.max(0.2, Math.min(3, startTransform.scale * scaleFactor));
      
      setLogoTransform(newTransform);
    };
    
    const handleMouseUp = () => {
      setIsLogoDragging(false);
      setLogoDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Image handlers factory
  const getImageHandlers = (imageId: string): FigmaImageHandlers => {
    const imageState = images[imageId];
    
    return {
      handleUpload: () => {
        imageState.fileInputRef.current?.click();
      },

      handleFileChange: async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          try {
            // Upload file to server
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const result = await response.json();
              const newImageUrl = result.url;
              updateImageState(imageId, { currentUrl: newImageUrl });
              
              // 🔧 CRITICAL: Call onUpdate to save the new image URL
              if (onUpdate) {
                onUpdate({ imageUrl: newImageUrl, imageId: imageId });
              }
            } else {
              // Get detailed error message from server
              let errorMessage = response.statusText;
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch (e) {
                // If we can't parse JSON, use statusText
              }
              
          console.error('Failed to upload image:', errorMessage);
          // Show user-friendly notification instead of alert
          if (typeof window !== 'undefined') {
            // Create a temporary notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #ef4444;
              color: white;
              padding: 12px 16px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 10000;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 14px;
              max-width: 400px;
              word-wrap: break-word;
            `;
            notification.textContent = `Upload failed: ${errorMessage}`;
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
          }
              
              // Fallback to local preview
              const reader = new FileReader();
              reader.onload = (e) => {
                const newImageUrl = e.target?.result as string;
                updateImageState(imageId, { currentUrl: newImageUrl });
              };
              reader.readAsDataURL(file);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            // Fallback to local preview
            const reader = new FileReader();
            reader.onload = (e) => {
              const newImageUrl = e.target?.result as string;
              updateImageState(imageId, { currentUrl: newImageUrl });
            };
            reader.readAsDataURL(file);
          }
        }
      },

      handleClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Single selection logic: deselect all other images
        if (selectedImageId !== imageId) {
          // Deselect previously selected image
          if (selectedImageId) {
            updateImageState(selectedImageId, { isSelected: false });
          }
          // Deselect logo
          setIsLogoSelected(false);
          // Select this image
          updateImageState(imageId, { isSelected: true });
          setSelectedImageId(imageId);
        } else {
          // Toggle current selection
          const newSelected = !imageState.isSelected;
          updateImageState(imageId, { isSelected: newSelected });
          setSelectedImageId(newSelected ? imageId : null);
        }
      },

      handleDragStart: (e: React.MouseEvent) => {
        if (!imageState.isSelected) return;
        
        const target = e.target as HTMLElement;
        if (target.dataset.resizeHandle) return;
        
        e.preventDefault();
        e.stopPropagation();
        updateImageState(imageId, { isDragging: true, dragHandle: 'move' });
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startTransform = { ...imageState.transform };
        
        let currentTransform = { ...startTransform };
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          
          const newTransform = {
            ...startTransform,
            x: startTransform.x + deltaX,
            y: startTransform.y + deltaY
          };
          
          currentTransform = newTransform;
          updateImageState(imageId, {
            transform: newTransform
          });
        };
        
        const handleMouseUp = () => {
          updateImageState(imageId, { isDragging: false, dragHandle: null });
          
          // 🔧 AUTO-UPDATE: Call onUpdate for image drag position changes (only on mouse up)
          if (onUpdate) {
            onUpdate({ 
              imageTransform: { x: currentTransform.x, y: currentTransform.y },
              imageId: imageId 
            });
          }
          
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },

      handleResizeStart: (e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        updateImageState(imageId, { isDragging: true, dragHandle: handle });
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startTransform = { ...imageState.transform };
        let currentTransform = { ...startTransform };
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          
          let newTransform = { ...startTransform };
          
          switch (handle) {
            case 'nw':
            case 'ne':
            case 'sw':
            case 'se':
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              const direction = (handle === 'nw' || handle === 'sw') ? 
                (deltaX < 0 ? 1 : -1) : (deltaX > 0 ? 1 : -1);
              const scaleFactor = 1 + (distance * direction * 0.003);
              newTransform.scale = Math.max(0.2, Math.min(3, startTransform.scale * scaleFactor));
              break;
              
            case 'n':
              const scaleYFactorN = 1 + (deltaY * -0.002);
              newTransform.scaleY = Math.max(0.2, Math.min(3, startTransform.scaleY * scaleYFactorN));
              newTransform.y = startTransform.y + deltaY * 0.25;
              break;
            case 's':
              const scaleYFactorS = 1 + (deltaY * 0.002);
              newTransform.scaleY = Math.max(0.2, Math.min(3, startTransform.scaleY * scaleYFactorS));
              break;
              
            case 'w':
              const scaleXFactorW = 1 + (deltaX * -0.002);
              newTransform.scaleX = Math.max(0.2, Math.min(3, startTransform.scaleX * scaleXFactorW));
              newTransform.x = startTransform.x + deltaX * 0.25;
              break;
            case 'e':
              const scaleXFactorE = 1 + (deltaX * 0.002);
              newTransform.scaleX = Math.max(0.2, Math.min(3, startTransform.scaleX * scaleXFactorE));
              break;
          }
          
          currentTransform = newTransform;
          updateImageState(imageId, { transform: newTransform });
        };
        
        const handleMouseUp = () => {
          updateImageState(imageId, { isDragging: false, dragHandle: null });
          
          // 🔧 AUTO-UPDATE: Call onUpdate for image resize changes (only on mouse up)
          if (onUpdate) {
            onUpdate({ 
              imageTransform: currentTransform,
              imageId: imageId 
            });
          }
          
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },

      handleImageDelete: () => {
        // Simple solution: hide the image by setting display to none
        const imageState = images[imageId];
        if (imageState?.containerRef?.current) {
          imageState.containerRef.current.style.display = 'none';
        }
      },

      setIsHovered: (hovered: boolean) => {
        updateImageState(imageId, { isHovered: hovered });
      },

      setIsIconHovered: (hovered: boolean) => {
        updateImageState(imageId, { isIconHovered: hovered });
      }
    };
  };

  // Global handlers
  const handleClickOutside = () => {
    setIsLogoSelected(false);
    setSelectedImageId(null);
    imageIds.forEach(id => {
      updateImageState(id, { isSelected: false });
    });
  };

  // State object
  const state: FigmaMultiSelectionState = {
    currentLogoUrl,
    isLogoHovered,
    isLogoIconHovered,
    isLogoSelected,
    isLogoDragging,
    logoDragHandle,
    logoTransform,
    logoFileInputRef,
    logoContainerRef,
    images,
    selectedImageId
  };

  // Handlers object
  const handlers: FigmaMultiSelectionHandlers = {
    handleLogoUpload,
    handleLogoFileChange,
    handleLogoClick,
    handleLogoDragStart,
    handleLogoResizeStart,
    setIsLogoHovered,
    setIsLogoIconHovered,
    getImageHandlers,
    handleClickOutside
  };

  return [state, handlers];
}

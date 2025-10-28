import { useState, useRef } from 'react';

export interface FigmaTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  scale: number;
}

export interface FigmaSelectionState {
  // Current URLs
  currentImageUrl: string;
  currentLogoUrl: string;
  
  // Image states
  isImageHovered: boolean;
  isImageIconHovered: boolean;
  isImageSelected: boolean;
  isImageDragging: boolean;
  imageDragHandle: string | null;
  imageTransform: FigmaTransform;
  
  // Logo states
  isLogoHovered: boolean;
  isLogoIconHovered: boolean;
  isLogoSelected: boolean;
  isLogoDragging: boolean;
  logoDragHandle: string | null;
  logoTransform: FigmaTransform;
  
  // Text states
  isTitleSelected: boolean;
  isTitleDragging: boolean;
  titleDragHandle: string | null;
  titleTransform: FigmaTransform & { width?: number; height?: number };
  
  isDescriptionSelected: boolean;
  isDescriptionDragging: boolean;
  descriptionDragHandle: string | null;
  descriptionTransform: FigmaTransform & { width?: number; height?: number };
  
  // Refs
  imageFileInputRef: React.RefObject<HTMLInputElement | null>;
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  imageContainerRef: React.RefObject<HTMLDivElement | null>;
  logoContainerRef: React.RefObject<HTMLDivElement | null>;
}

export interface FigmaSelectionHandlers {
  // Image handlers
  handleImageUpload: () => void;
  handleImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageClick: (e: React.MouseEvent) => void;
  handleImageDragStart: (e: React.MouseEvent) => void;
  handleImageResizeStart: (e: React.MouseEvent, handle: string) => void;
  handleImageDelete: () => void;
  setIsImageHovered: (hovered: boolean) => void;
  setIsImageIconHovered: (hovered: boolean) => void;
  
  // Logo handlers
  handleLogoUpload: () => void;
  handleLogoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoClick: (e: React.MouseEvent) => void;
  handleLogoDragStart: (e: React.MouseEvent) => void;
  handleLogoResizeStart: (e: React.MouseEvent, handle: string) => void;
  handleLogoDelete: () => void;
  setIsLogoHovered: (hovered: boolean) => void;
  setIsLogoIconHovered: (hovered: boolean) => void;
  
  // Text handlers
  handleTitleClick: (e?: React.MouseEvent, shouldSelect?: boolean) => void;
  handleTitleDragStart: (e: React.MouseEvent, element: HTMLElement) => void;
  handleTitleResizeStart: (e: React.MouseEvent, handle: string, element: HTMLElement) => void;
  handleTitleTextChange: (newText: string) => void;
  handleTitleChangeSize: (fontSize: number) => void;
  handleTitleChangeFont: (fontFamily: string) => void;
  handleTitleSizeChange: (newTransform: { x?: number; y?: number; width?: number; height?: number }) => void;
  handleTitleDelete: () => void;
  
  handleDescriptionClick: (e?: React.MouseEvent, shouldSelect?: boolean) => void;
  handleDescriptionDragStart: (e: React.MouseEvent, element: HTMLElement) => void;
  handleDescriptionResizeStart: (e: React.MouseEvent, handle: string, element: HTMLElement) => void;
  handleDescriptionTextChange: (newText: string) => void;
  handleDescriptionChangeSize: (fontSize: number) => void;
  handleDescriptionChangeFont: (fontFamily: string) => void;
  handleDescriptionSizeChange: (newTransform: { x?: number; y?: number; width?: number; height?: number }) => void;
  handleDescriptionDelete: () => void;
  
  // Global handlers
  handleClickOutside: () => void;
}

export interface UseFigmaSelectionProps {
  initialImageUrl?: string;
  initialLogoUrl?: string;
  initialImageTransform?: { x: number; y: number; scaleX?: number; scaleY?: number; scale?: number };
  initialTitleTransform?: { x: number; y: number };
  initialDescriptionTransform?: { x: number; y: number };
  initialLogoTransform?: { x: number; y: number };
  onUpdate?: (updates: any) => void;
}

export function useFigmaSelection({
  initialImageUrl = '',
  initialLogoUrl = '',
  initialImageTransform = { x: 0, y: 0 },
  initialTitleTransform = { x: 0, y: 0 },
  initialDescriptionTransform = { x: 0, y: 0 },
  initialLogoTransform = { x: 0, y: 0 },
  onUpdate
}: UseFigmaSelectionProps = {}): [FigmaSelectionState, FigmaSelectionHandlers] {
  
  // Image states
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isImageIconHovered, setIsImageIconHovered] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [imageDragHandle, setImageDragHandle] = useState<string | null>(null);
  const [imageTransform, setImageTransform] = useState<FigmaTransform>({
    x: initialImageTransform.x,
    y: initialImageTransform.y,
    scaleX: initialImageTransform.scaleX || 1,
    scaleY: initialImageTransform.scaleY || 1,
    scale: initialImageTransform.scale || 1
  });
  
  // Logo states
  const [currentLogoUrl, setCurrentLogoUrl] = useState(initialLogoUrl);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isLogoIconHovered, setIsLogoIconHovered] = useState(false);
  const [isLogoSelected, setIsLogoSelected] = useState(false);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [logoDragHandle, setLogoDragHandle] = useState<string | null>(null);
  const [logoTransform, setLogoTransform] = useState<FigmaTransform>({
    x: initialLogoTransform.x,
    y: initialLogoTransform.y,
    scaleX: 1,
    scaleY: 1,
    scale: 1
  });
  
  // Text states
  const [isTitleSelected, setIsTitleSelected] = useState(false);
  const [isTitleDragging, setIsTitleDragging] = useState(false);
  const [titleDragHandle, setTitleDragHandle] = useState<string | null>(null);
  const [titleTransform, setTitleTransform] = useState<FigmaTransform & { width?: number; height?: number }>({
    x: initialTitleTransform.x,
    y: initialTitleTransform.y,
    scaleX: 1,
    scaleY: 1,
    scale: 1
    // Width will be set by initial content measurement
  });
  
  const [isDescriptionSelected, setIsDescriptionSelected] = useState(false);
  const [isDescriptionDragging, setIsDescriptionDragging] = useState(false);
  const [descriptionDragHandle, setDescriptionDragHandle] = useState<string | null>(null);
  const [descriptionTransform, setDescriptionTransform] = useState<FigmaTransform & { width?: number; height?: number }>({
    x: initialDescriptionTransform.x,
    y: initialDescriptionTransform.y,
    scaleX: 1,
    scaleY: 1,
    scale: 1
    // Width will be set by initial content measurement
  });
  
  // Refs
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  // Image handlers
  const handleImageUpload = () => {
    imageFileInputRef.current?.click();
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          setCurrentImageUrl(newImageUrl);
          
          // 🔧 CRITICAL: Call onUpdate to save the new image URL
          if (onUpdate) {
            onUpdate({ imageUrl: newImageUrl });
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
            setCurrentImageUrl(newImageUrl);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // Fallback to local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImageUrl = e.target?.result as string;
          setCurrentImageUrl(newImageUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageSelected(!isImageSelected);
    // Deselect logo when selecting image
    setIsLogoSelected(false);
  };

  const handleImageDragStart = (e: React.MouseEvent) => {
    // Only allow dragging if image is selected and not clicking on resize handles
    if (!isImageSelected) return;
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target && target.dataset && target.dataset.resizeHandle) {
      return; // Don't start drag if clicking on a handle
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragging(true);
    setImageDragHandle('move');
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...imageTransform };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newTransform = {
        ...startTransform,
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      };
      setImageTransform(newTransform);
      
      // 🔧 AUTO-UPDATE: Call onUpdate for image drag position changes
      if (onUpdate) {
        onUpdate({ imageTransform: { x: newTransform.x, y: newTransform.y } });
      }
    };
    
    const handleMouseUp = () => {
      setIsImageDragging(false);
      setImageDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleImageResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragging(true);
    setImageDragHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...imageTransform };
    let currentTransform = { ...startTransform };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newTransform = { ...startTransform };
      
      // Calculate new dimensions based on handle type
      switch (handle) {
        // Corner handles: Scale proportionally (maintain aspect ratio)
        case 'nw':
        case 'ne':
        case 'sw':
        case 'se':
          // Use distance from corner for more responsive scaling
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const direction = (handle === 'nw' || handle === 'sw') ? 
            (deltaX < 0 ? 1 : -1) : (deltaX > 0 ? 1 : -1);
          const scaleFactor = 1 + (distance * direction * 0.003);
          newTransform.scale = Math.max(0.2, Math.min(3, startTransform.scale * scaleFactor));
          break;
          
        // Top/Bottom handles: Adjust height only
        case 'n':
          const scaleYFactorN = 1 + (deltaY * -0.002);
          newTransform.scaleY = Math.max(0.2, Math.min(3, startTransform.scaleY * scaleYFactorN));
          newTransform.y = startTransform.y + deltaY * 0.25;
          break;
        case 's':
          const scaleYFactorS = 1 + (deltaY * 0.002);
          newTransform.scaleY = Math.max(0.2, Math.min(3, startTransform.scaleY * scaleYFactorS));
          break;
          
        // Side handles: Adjust width only
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
      setImageTransform(newTransform);
    };
    
    const handleMouseUp = () => {
      setIsImageDragging(false);
      setImageDragHandle(null);
      
      // 🔧 AUTO-UPDATE: Call onUpdate for image resize changes (only on mouse up)
      if (onUpdate) {
        onUpdate({ imageTransform: currentTransform });
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Logo handlers
  const handleLogoUpload = () => {
    logoFileInputRef.current?.click();
  };

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          const newLogoUrl = result.url;
          setCurrentLogoUrl(newLogoUrl);
          
          // 🔧 CRITICAL: Call onUpdate to save the new logo URL
          if (onUpdate) {
            onUpdate({ logoUrl: newLogoUrl });
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
          
          console.error('Failed to upload logo:', errorMessage);
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
            notification.textContent = `Logo upload failed: ${errorMessage}`;
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
            const newLogoUrl = e.target?.result as string;
            setCurrentLogoUrl(newLogoUrl);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        // Fallback to local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const newLogoUrl = e.target?.result as string;
          setCurrentLogoUrl(newLogoUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLogoSelected(!isLogoSelected);
    // Deselect image when selecting logo
    setIsImageSelected(false);
  };

  const handleLogoDragStart = (e: React.MouseEvent) => {
    // Only allow dragging if logo is selected and not clicking on resize handles
    if (!isLogoSelected) return;
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target && target.dataset && target.dataset.resizeHandle) {
      return; // Don't start drag if clicking on a handle
    }
    
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
      
      const newTransform = {
        ...startTransform,
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      };
      setLogoTransform(newTransform);
      
      // 🔧 AUTO-UPDATE: Call onUpdate for drag position changes
      if (onUpdate) {
        onUpdate({ logoTransform: { x: newTransform.x, y: newTransform.y } });
      }
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
      
      // All handles scale proportionally for logos (maintain aspect ratio)
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

  // Text handlers
  const handleTitleClick = (e?: React.MouseEvent, shouldSelect: boolean = !isTitleSelected) => {
    e?.stopPropagation();

    if (shouldSelect) {
      setIsTitleSelected(true);
      setIsDescriptionSelected(false);
      setIsImageSelected(false);
      setIsLogoSelected(false);
    } else {
      setIsTitleSelected(false);
    }
  };

  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    // Only allow dragging if title is selected and not clicking on resize handles
    if (!isTitleSelected) return;
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target && target.dataset && target.dataset.resizeHandle) {
      return; // Don't start drag if clicking on a handle
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsTitleDragging(true);
    setTitleDragHandle('move');
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...titleTransform };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newTransform = {
        ...startTransform,
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      };
      setTitleTransform(newTransform);
      
      // 🔧 AUTO-UPDATE: Call onUpdate for drag position changes
      if (onUpdate) {
        onUpdate({ titleTransform: { x: newTransform.x, y: newTransform.y } });
      }
    };
    
    const handleMouseUp = () => {
      setIsTitleDragging(false);
      setTitleDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTitleResizeStart = (e: React.MouseEvent, handle: string, element: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTitleDragging(true);
    setTitleDragHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...titleTransform };
    
    if (!element) {
      console.warn('Element is undefined in handleTitleResizeStart');
      return;
    }
    
    const rect = element.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newTransform = { ...startTransform };
      
      // Handle text resizing - mainly width for text wrapping
      switch (handle) {
        case 'e': // Right handle - adjust width
        case 'w': // Left handle - adjust width
          const newWidth = Math.max(100, (startTransform.width || rect.width) + (handle === 'e' ? deltaX : -deltaX));
          newTransform.width = newWidth;
          break;
        case 's': // Bottom handle - adjust height (for fixed-height text boxes)
        case 'n': // Top handle - adjust height
          const newHeight = Math.max(50, (startTransform.height || rect.height) + (handle === 's' ? deltaY : -deltaY));
          newTransform.height = newHeight;
          break;
        case 'se': // Southeast corner - adjust both
        case 'sw': // Southwest corner
        case 'ne': // Northeast corner
        case 'nw': // Northwest corner
          const newWidthCorner = Math.max(100, (startTransform.width || rect.width) + (handle.includes('e') ? deltaX : -deltaX));
          const newHeightCorner = Math.max(50, (startTransform.height || rect.height) + (handle.includes('s') ? deltaY : -deltaY));
          newTransform.width = newWidthCorner;
          newTransform.height = newHeightCorner;
          break;
      }
      
      setTitleTransform(newTransform);
    };
    
    const handleMouseUp = () => {
      setIsTitleDragging(false);
      setTitleDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTitleTextChange = (newText: string) => {
    // This will be handled by the parent component
    console.log('Title text changed:', newText);
  };

  const handleTitleChangeSize = (fontSize: number) => {
    console.log('Title change size requested:', fontSize);
    // This will be handled by the parent component that manages the actual text styling
  };

  const handleTitleChangeFont = (fontFamily: string) => {
    console.log('Title change font requested:', fontFamily);
    // This will be handled by the parent component that manages the actual text styling
  };

  const handleTitleSizeChange = (newTransform: { x?: number; y?: number; width?: number; height?: number }) => {
    console.log('Title size change requested:', newTransform);
    // Allow width changes (both initial measurement and manual resizing)
    setTitleTransform(prev => ({
      ...prev,
      ...newTransform
    }));
  };

  const handleTitleDelete = () => {
    console.log('Title delete requested');
    // Note: Text deletion should be handled by the parent component
    // For now, just deselect the title
    setIsTitleSelected(false);
  };

  const handleDescriptionClick = (e?: React.MouseEvent, shouldSelect: boolean = !isDescriptionSelected) => {
    e?.stopPropagation();

    if (shouldSelect) {
      setIsDescriptionSelected(true);
      setIsTitleSelected(false);
      setIsImageSelected(false);
      setIsLogoSelected(false);
    } else {
      setIsDescriptionSelected(false);
    }
  };

  const handleDescriptionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    // Only allow dragging if description is selected and not clicking on resize handles
    if (!isDescriptionSelected) return;
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target && target.dataset && target.dataset.resizeHandle) {
      return; // Don't start drag if clicking on a handle
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsDescriptionDragging(true);
    setDescriptionDragHandle('move');
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...descriptionTransform };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newTransform = {
        ...startTransform,
        x: startTransform.x + deltaX,
        y: startTransform.y + deltaY
      };
      setDescriptionTransform(newTransform);
      
      // 🔧 AUTO-UPDATE: Call onUpdate for drag position changes
      if (onUpdate) {
        onUpdate({ descriptionTransform: { x: newTransform.x, y: newTransform.y } });
      }
    };
    
    const handleMouseUp = () => {
      setIsDescriptionDragging(false);
      setDescriptionDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDescriptionResizeStart = (e: React.MouseEvent, handle: string, element: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDescriptionDragging(true);
    setDescriptionDragHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...descriptionTransform };
    
    if (!element) {
      console.warn('Element is undefined in handleDescriptionResizeStart');
      return;
    }
    
    const rect = element.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newTransform = { ...startTransform };
      
      // Handle text resizing - mainly width for text wrapping
      switch (handle) {
        case 'e': // Right handle - adjust width
        case 'w': // Left handle - adjust width
          const newWidth = Math.max(100, (startTransform.width || rect.width) + (handle === 'e' ? deltaX : -deltaX));
          newTransform.width = newWidth;
          break;
        case 's': // Bottom handle - adjust height (for fixed-height text boxes)
        case 'n': // Top handle - adjust height
          const newHeight = Math.max(50, (startTransform.height || rect.height) + (handle === 's' ? deltaY : -deltaY));
          newTransform.height = newHeight;
          break;
        case 'se': // Southeast corner - adjust both
        case 'sw': // Southwest corner
        case 'ne': // Northeast corner
        case 'nw': // Northwest corner
          const newWidthCorner = Math.max(100, (startTransform.width || rect.width) + (handle.includes('e') ? deltaX : -deltaX));
          const newHeightCorner = Math.max(50, (startTransform.height || rect.height) + (handle.includes('s') ? deltaY : -deltaY));
          newTransform.width = newWidthCorner;
          newTransform.height = newHeightCorner;
          break;
      }
      
      setDescriptionTransform(newTransform);
    };
    
    const handleMouseUp = () => {
      setIsDescriptionDragging(false);
      setDescriptionDragHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDescriptionTextChange = (newText: string) => {
    // This will be handled by the parent component
    console.log('Description text changed:', newText);
  };

  const handleDescriptionChangeSize = (fontSize: number) => {
    console.log('Description change size requested:', fontSize);
    // This will be handled by the parent component that manages the actual text styling
  };

  const handleDescriptionChangeFont = (fontFamily: string) => {
    console.log('Description change font requested:', fontFamily);
    // This will be handled by the parent component that manages the actual text styling
  };

  const handleDescriptionSizeChange = (newTransform: { x?: number; y?: number; width?: number; height?: number }) => {
    console.log('Description size change requested:', newTransform);
    // Allow width changes (both initial measurement and manual resizing)
    setDescriptionTransform(prev => ({
      ...prev,
      ...newTransform
    }));
  };

  const handleDescriptionDelete = () => {
    console.log('Description delete requested');
    // Note: Text deletion should be handled by the parent component
    // For now, just deselect the description
    setIsDescriptionSelected(false);
  };

  // Delete handlers
  const handleImageDelete = () => {
    setCurrentImageUrl('');
    setIsImageSelected(false);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleLogoDelete = () => {
    setCurrentLogoUrl('');
    setIsLogoSelected(false);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  // Global handlers
  const handleClickOutside = () => {
    setIsImageSelected(false);
    setIsLogoSelected(false);
    setIsTitleSelected(false);
    setIsDescriptionSelected(false);
  };

  // State object
  const state: FigmaSelectionState = {
    currentImageUrl,
    currentLogoUrl,
    isImageHovered,
    isImageIconHovered,
    isImageSelected,
    isImageDragging,
    imageDragHandle,
    imageTransform,
    isLogoHovered,
    isLogoIconHovered,
    isLogoSelected,
    isLogoDragging,
    logoDragHandle,
    logoTransform,
    isTitleSelected,
    isTitleDragging,
    titleDragHandle,
    titleTransform,
    isDescriptionSelected,
    isDescriptionDragging,
    descriptionDragHandle,
    descriptionTransform,
    imageFileInputRef,
    logoFileInputRef,
    imageContainerRef,
    logoContainerRef
  };

  // Handlers object
  const handlers: FigmaSelectionHandlers = {
    handleImageUpload,
    handleImageFileChange,
    handleImageClick,
    handleImageDragStart,
    handleImageResizeStart,
    handleImageDelete,
    setIsImageHovered,
    setIsImageIconHovered,
    handleLogoUpload,
    handleLogoFileChange,
    handleLogoClick,
    handleLogoDragStart,
    handleLogoResizeStart,
    handleLogoDelete,
    setIsLogoHovered,
    setIsLogoIconHovered,
    handleTitleClick,
    handleTitleDragStart,
    handleTitleResizeStart,
    handleTitleTextChange,
    handleTitleChangeSize,
    handleTitleChangeFont,
    handleTitleSizeChange,
    handleTitleDelete,
    handleDescriptionClick,
    handleDescriptionDragStart,
    handleDescriptionResizeStart,
    handleDescriptionTextChange,
    handleDescriptionChangeSize,
    handleDescriptionChangeFont,
    handleDescriptionSizeChange,
    handleDescriptionDelete,
    handleClickOutside
  };

  return [state, handlers];
}

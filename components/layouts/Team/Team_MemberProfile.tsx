import React, { useState, useEffect, useRef } from 'react';
import ImageBlock from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface TeamMemberProfileProps {
  /**
   * Portrait image URL for the left column
   */
  imageUrl?: string;
  
  /**
   * Alt text for the portrait image
   */
  imageAlt?: string;
  
  /**
   * Member's role/title (e.g., "CEO & Founder")
   */
  role?: string;
  
  /**
   * Member's name for the heading
   */
  name?: string;
  
  /**
   * Multi-line description about the member
   */
  description?: string;
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Role text color
   */
  roleColor?: string;
  
  /**
   * Name heading color
   */
  nameColor?: string;
  
  /**
   * Description text color
   */
  descriptionColor?: string;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
  
  /**
   * Use fixed dimensions for exact sizing
   */
  useFixedDimensions?: boolean;
  
  /**
   * Canvas width when using fixed dimensions
   */
  canvasWidth?: number;
  
  /**
   * Canvas height when using fixed dimensions
   */
  canvasHeight?: number;

  /**
   * Styling props for persistence
   */
  roleFontSize?: number;
  roleFontFamily?: string;
  roleAlignment?: 'left' | 'center' | 'right';
  nameFontSize?: number;
  nameFontFamily?: string;
  nameAlignment?: 'left' | 'center' | 'right';
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved image transform for position persistence
   */
  imageTransform?: { x: number; y: number; scaleX?: number; scaleY?: number; scale?: number };

  /**
   * Role transform for positioning
   */
  roleTransform?: { x: number; y: number };

  /**
   * Name transform for positioning
   */
  nameTransform?: { x: number; y: number };

  /**
   * Description transform for positioning
   */
  descriptionTransform?: { x: number; y: number };
}

/**
 * Team Member Profile Layout
 * 
 * A layout for showcasing individual team members with portrait image and detailed information.
 * Based on Cover_LeftImageTextRight but adapted for team member profiles.
 */
export default function Team_MemberProfile({
  imageUrl = '/profile-photo-1.jpg',
  imageAlt = 'Team member portrait',
  role = 'CEO & Founder',
  name = 'John Smith',
  description = 'With over 10 years of experience in technology and business development, John leads our company with a vision for innovation and growth. He is passionate about building products that make a real difference in people\'s lives.',
  fontFamily = 'font-helvetica-neue',
  roleColor = 'text-gray-500',
  nameColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  roleFontSize = 14,
  roleFontFamily = 'font-helvetica-neue',
  roleAlignment = 'left',
  nameFontSize = 32,
  nameFontFamily = 'font-helvetica-neue',
  nameAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  onUpdate,
  imageTransform: savedImageTransform,
  roleTransform: savedRoleTransform,
  nameTransform: savedNameTransform,
  descriptionTransform: savedDescriptionTransform
}: TeamMemberProfileProps) {

  // Text content state
  const [currentName, setCurrentName] = useState(name);
  const [currentRole, setCurrentRole] = useState(role);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Text styling state
  const [nameFontSizeState, setNameFontSize] = useState(nameFontSize);
  const [nameFontFamilyState, setNameFontFamily] = useState(nameFontFamily);
  const [currentNameColor, setCurrentNameColor] = useState(nameColor);
  const [currentNameAlignment, setCurrentNameAlignment] = useState<'left' | 'center' | 'right'>(nameAlignment);
  const [nameWidth, setNameWidth] = useState<number | undefined>(undefined);

  const [roleFontSizeState, setRoleFontSize] = useState(roleFontSize);
  const [roleFontFamilyState, setRoleFontFamily] = useState(roleFontFamily);
  const [currentRoleColor, setCurrentRoleColor] = useState(roleColor);
  const [currentRoleAlignment, setCurrentRoleAlignment] = useState<'left' | 'center' | 'right'>(roleAlignment);
  const [roleWidth, setRoleWidth] = useState<number | undefined>(undefined);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);
  const [descriptionWidth, setDescriptionWidth] = useState<number | undefined>(300);

  // 🔧 SYNC PROPS TO STATE - Update state when props change (for persistence)
  useEffect(() => {
    setNameFontSize(nameFontSize);
  }, [nameFontSize]);

  useEffect(() => {
    setNameFontFamily(nameFontFamily);
  }, [nameFontFamily]);

  useEffect(() => {
    setCurrentNameColor(nameColor);
  }, [nameColor]);

  useEffect(() => {
    setCurrentNameAlignment(nameAlignment);
  }, [nameAlignment]);

  useEffect(() => {
    setRoleFontSize(roleFontSize);
  }, [roleFontSize]);

  useEffect(() => {
    setRoleFontFamily(roleFontFamily);
  }, [roleFontFamily]);

  useEffect(() => {
    setCurrentRoleColor(roleColor);
  }, [roleColor]);

  useEffect(() => {
    setCurrentRoleAlignment(roleAlignment);
  }, [roleAlignment]);

  useEffect(() => {
    setDescriptionFontSize(descriptionFontSize);
  }, [descriptionFontSize]);

  useEffect(() => {
    setDescriptionFontFamily(descriptionFontFamily);
  }, [descriptionFontFamily]);

  useEffect(() => {
    setCurrentDescriptionColor(descriptionColor);
  }, [descriptionColor]);

  useEffect(() => {
    setCurrentDescriptionAlignment(descriptionAlignment);
  }, [descriptionAlignment]);

  // Text selection handlers - separate for each text element with initial transforms and onUpdate
  const [nameSelectionState, nameSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedNameTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [roleSelectionState, roleSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedRoleTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [descriptionSelectionState, descriptionSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });

  // Global click outside handler to deselect all text elements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside all text elements AND outside the TextPopup
      const isClickOnText = target.closest('[data-figma-text]') !== null;
      const isClickOnPopup = target.closest('[data-text-popup]') !== null;
      const isClickOnColorArea = target.closest('[data-color-area]') !== null;
      const isClickOnHueSlider = target.closest('[data-hue-slider]') !== null;
      
      if (!isClickOnText && !isClickOnPopup && !isClickOnColorArea && !isClickOnHueSlider) {
        // Deselect all text elements
        if (nameSelectionHandlers.handleClickOutside) nameSelectionHandlers.handleClickOutside();
        if (roleSelectionHandlers.handleClickOutside) roleSelectionHandlers.handleClickOutside();
        if (descriptionSelectionHandlers.handleClickOutside) descriptionSelectionHandlers.handleClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nameSelectionHandlers, roleSelectionHandlers, descriptionSelectionHandlers]);

  // Track previous dragging states
  const prevDraggingRef = useRef({
    isNameDragging: false,
    isRoleDragging: false,
    isDescriptionDragging: false
  });

  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'name' | 'role' | 'description' | null,
    lastTargetElement: null as 'name' | 'role' | 'description' | null
  });

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      let transform, isDragging, wasDragging;
      
      if (activeTarget === 'name') {
        transform = nameSelectionState.titleTransform;
        isDragging = nameSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isNameDragging;
      } else if (activeTarget === 'role') {
        transform = roleSelectionState.titleTransform;
        isDragging = roleSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isRoleDragging;
      } else if (activeTarget === 'description') {
        transform = descriptionSelectionState.titleTransform;
        isDragging = descriptionSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isDescriptionDragging;
      }
      
      if (transform) {
        setTextPopupState(prev => {
          const newPosition = {
            x: prev.originalPosition.x + (transform.x || 0),
            y: prev.originalPosition.y + (transform.y || 0)
          };

          const shouldUpdateOriginal = !isDragging && wasDragging;
          
          return {
            ...prev,
            position: newPosition,
            originalPosition: shouldUpdateOriginal ? newPosition : prev.originalPosition
          };
        });
      }
    }

    // Update previous dragging states
    prevDraggingRef.current = {
      isNameDragging: nameSelectionState.isTitleDragging,
      isRoleDragging: roleSelectionState.isTitleDragging,
      isDescriptionDragging: descriptionSelectionState.isTitleDragging
    };
  }, [textPopupState.isOpen, textPopupState.targetElement, textPopupState.lastTargetElement, 
      nameSelectionState.titleTransform, nameSelectionState.isTitleDragging,
      roleSelectionState.titleTransform, roleSelectionState.isTitleDragging,
      descriptionSelectionState.titleTransform, descriptionSelectionState.isTitleDragging]);

  // Use Figma selection hook for the portrait image
  const [figmaState, figmaHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Text change handlers with OnUpdate support
  const handleNameChangeSize = (fontSize: number) => {
    setNameFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ nameFontSize: fontSize });
    }
  };
  const handleNameChangeFont = (fontFamily: string) => {
    setNameFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ nameFontFamily: fontFamily });
    }
  };
  const handleNameChangeColor = (color: string) => {
    setCurrentNameColor(color);
    if (onUpdate) {
      onUpdate({ nameColor: color });
    }
  };
  const handleNameChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentNameAlignment(alignment);
    if (onUpdate) {
      onUpdate({ nameAlignment: alignment });
    }
  };
  const handleNameTextChange = (newText: string) => {
    setCurrentName(newText);
    if (onUpdate) {
      onUpdate({ name: newText });
    }
  };
  const handleNameDelete = () => {
    setCurrentName('');
    if (onUpdate) {
      onUpdate({ name: '' });
    }
  };

  const handleRoleChangeSize = (fontSize: number) => {
    setRoleFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ roleFontSize: fontSize });
    }
  };
  const handleRoleChangeFont = (fontFamily: string) => {
    setRoleFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ roleFontFamily: fontFamily });
    }
  };
  const handleRoleChangeColor = (color: string) => {
    setCurrentRoleColor(color);
    if (onUpdate) {
      onUpdate({ roleColor: color });
    }
  };
  const handleRoleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentRoleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ roleAlignment: alignment });
    }
  };
  const handleRoleTextChange = (newText: string) => {
    setCurrentRole(newText);
    if (onUpdate) {
      onUpdate({ role: newText });
    }
  };
  const handleRoleDelete = () => {
    setCurrentRole('');
    if (onUpdate) {
      onUpdate({ role: '' });
    }
  };

  const handleDescriptionChangeSize = (fontSize: number) => {
    setDescriptionFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ descriptionFontSize: fontSize });
    }
  };
  const handleDescriptionChangeFont = (fontFamily: string) => {
    setDescriptionFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ descriptionFontFamily: fontFamily });
    }
  };
  const handleDescriptionChangeColor = (color: string) => {
    setCurrentDescriptionColor(color);
    if (onUpdate) {
      onUpdate({ descriptionColor: color });
    }
  };
  const handleDescriptionChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentDescriptionAlignment(alignment);
    if (onUpdate) {
      onUpdate({ descriptionAlignment: alignment });
    }
  };
  const handleDescriptionTextChange = (newText: string) => {
    setCurrentDescription(newText);
    if (onUpdate) {
      onUpdate({ description: newText });
    }
  };
  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) {
      onUpdate({ description: '' });
    }
  };

  // Drag handlers
  const handleNameDragStart = (e: React.MouseEvent) => {
    if (nameSelectionHandlers.handleTitleDragStart) {
      nameSelectionHandlers.handleTitleDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  const handleRoleDragStart = (e: React.MouseEvent) => {
    if (roleSelectionHandlers.handleTitleDragStart) {
      roleSelectionHandlers.handleTitleDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  const handleDescriptionDragStart = (e: React.MouseEvent) => {
    if (descriptionSelectionHandlers.handleTitleDragStart) {
      descriptionSelectionHandlers.handleTitleDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  // Custom click handlers that ensure only one element is selected at a time
  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Deselect other elements first
    if (roleSelectionHandlers.handleClickOutside) roleSelectionHandlers.handleClickOutside();
    if (descriptionSelectionHandlers.handleClickOutside) descriptionSelectionHandlers.handleClickOutside();
    
    // Then select this element
    if (nameSelectionHandlers.handleTitleClick) {
      nameSelectionHandlers.handleTitleClick(e);
    }
  };

  const handleRoleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Deselect other elements first
    if (nameSelectionHandlers.handleClickOutside) nameSelectionHandlers.handleClickOutside();
    if (descriptionSelectionHandlers.handleClickOutside) descriptionSelectionHandlers.handleClickOutside();
    
    // Then select this element
    if (roleSelectionHandlers.handleTitleClick) {
      roleSelectionHandlers.handleTitleClick(e);
    }
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Deselect other elements first
    if (nameSelectionHandlers.handleClickOutside) nameSelectionHandlers.handleClickOutside();
    if (roleSelectionHandlers.handleClickOutside) roleSelectionHandlers.handleClickOutside();
    
    // Then select this element
    if (descriptionSelectionHandlers.handleTitleClick) {
      descriptionSelectionHandlers.handleTitleClick(e);
    }
  };

  // Custom resize handlers for proper text wrapping
  const handleNameResize = (e: React.MouseEvent, direction: string, element: HTMLElement) => {
    const startX = e.clientX;
    const startWidth = element.offsetWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX); // Only minimum width constraint
      setNameWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRoleResize = (e: React.MouseEvent, direction: string, element: HTMLElement) => {
    const startX = e.clientX;
    const startWidth = element.offsetWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX); // Only minimum width constraint
      setRoleWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDescriptionResize = (e: React.MouseEvent, direction: string, element: HTMLElement) => {
    const startX = e.clientX;
    const startWidth = element.offsetWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX); // Only minimum width constraint
      setDescriptionWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    // CRITICAL: Allow infinite expansion beyond canvas
    overflow: 'visible',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
    position: 'relative' as const,
    top: 0,
    left: 0,
    transform: 'none',
    userSelect: 'none',
    pointerEvents: 'auto',
  } : {
    // Responsive mode constraints
    overflow: 'visible',
    contain: 'layout style',
    width: '100%',
    height: '100%',
    minHeight: '400px',
    position: 'relative' as const,
    userSelect: 'none',
  };

  // Base classes for responsive layout with white background
  const containerClasses = useFixedDimensions 
    ? `team-member-profile-layout flex items-stretch justify-start gap-x-6 lg:gap-x-8 overflow-visible relative bg-white select-none ${className}`
    : `team-member-profile-layout flex items-stretch justify-start gap-x-6 lg:gap-x-8 w-full overflow-visible relative bg-white select-none ${className}`;

  // Additional drag prevention styles
  const dragPreventionStyles = {
    WebkitUserDrag: 'none',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    KhtmlUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    touchAction: 'none',
  } as any;

  const content = (
    <div 
      className={containerClasses}
      style={{
        ...containerStyle,
        ...dragPreventionStyles,
      }}
      data-layout-locked="true"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      onDragEnd={(e) => e.preventDefault()}
      onMouseDown={(e) => {
        // Prevent layout dragging but allow text interactions
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onClick={figmaHandlers.handleClickOutside}
    >
      {/* Image Column - Left side with Figma-style Selection */}
      <div
        className="image-column relative h-full order-1 flex-none"
        style={{
          width: '48%',
          flexBasis: '48%',
          flexShrink: 0, // Prevent shrinking
          zIndex: 10, // Ensure image stays above text
        }}
        >
        <FigmaImage
          src={imageUrl}
          alt={imageAlt}
          size="full"
          fit="cover"
          align="center"
          rounded={false}
          fill
          className="w-full h-full"
          containerClassName="w-full h-full"
          state={figmaState}
          handlers={figmaHandlers}
        />
      </div>

      {/* Content Column - Right side */}
      <div className={`content-column relative flex flex-col justify-center items-start h-full flex-1 min-w-0 order-2 ${fontFamily} pointer-events-none`} style={{ maxWidth: '50%', overflow: 'visible', zIndex: 5, flexShrink: 0 }}>
        <div className="content-stack flex flex-col w-full pointer-events-auto" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible', zIndex: 5 }}>
          
          {/* Name Heading */}
          {currentName && (
            <div className="absolute pointer-events-auto" style={{ 
              top: '35%', 
              left: '0px',
              zIndex: 100, 
              width: nameWidth ? `${nameWidth}px` : 'auto',
              // Critical: Allow infinite expansion beyond canvas
              overflow: 'visible',
              contain: 'none',
              // Ensure no layout influence on parent
              position: 'absolute'
            }} data-figma-text>
              <FigmaText
                variant="title"
                color={currentNameColor}
                align={currentNameAlignment}
                fontFamily={nameFontFamilyState}
                className="font-normal" // Ensure consistent font weight
                style={{
                  fontSize: `${nameFontSizeState}px`,
                  color: currentNameColor,
                  textAlign: currentNameAlignment,
                  letterSpacing: '-0.05em',
                  lineHeight: '1.0',
                  fontWeight: '400 !important', // Force normal font weight in all states
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  pointerEvents: 'auto' // Enable interactions on text
                }}
                isSelected={nameSelectionState.isTitleSelected}
                transform={nameSelectionState.titleTransform}
                onClick={handleNameClick}
                onTextChange={handleNameTextChange}
                onSizeChange={(newTransform) => nameSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                onChangeSize={handleNameChangeSize}
                onChangeFont={handleNameChangeFont}
                onChangeColor={handleNameChangeColor}
                onChangeAlignment={handleNameChangeAlignment}
                onDeleteText={handleNameDelete}
                onDragStart={nameSelectionHandlers.handleTitleDragStart}
                onResizeStart={nameSelectionHandlers.handleTitleResizeStart}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const nameElements = document.querySelectorAll('.team-member-profile-layout [data-figma-text]');
                  const nameElement = nameElements[0]; // First element is name
                  if (nameElement) {
                    const nameRect = nameElement.getBoundingClientRect();
                    const canvasContainer = nameElement.closest('.team-member-profile-layout') as HTMLElement;
                    if (canvasContainer) {
                      const canvasRect = canvasContainer.getBoundingClientRect();
                      const relativeX = (nameRect.left - canvasRect.left) - 10;
                      const relativeY = (nameRect.top - canvasRect.top) - 50;
                      
                      setTextPopupState({
                        isOpen: true,
                        position: { x: relativeX, y: relativeY },
                        originalPosition: { x: relativeX, y: relativeY },
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily,
                        targetElement: 'name',
                        lastTargetElement: 'name'
                      });
                    }
                  }
                }}>
                {currentName}
              </FigmaText>
            </div>
          )}

          {/* Role/Title */}
          {currentRole && (
            <div className="absolute pointer-events-auto" style={{ 
              top: '45%', 
              left: '0px',
              zIndex: 100, 
              width: roleWidth ? `${roleWidth}px` : 'auto',
              // Critical: Allow infinite expansion beyond canvas
              overflow: 'visible',
              contain: 'none',
              // Ensure no layout influence on parent
              position: 'absolute'
            }} data-figma-text>
              <FigmaText
          variant="body"
                color={currentRoleColor}
                align={currentRoleAlignment}
                fontFamily={roleFontFamilyState}
                className="font-normal" // Ensure consistent font weight
                style={{
                  fontSize: `${roleFontSizeState}px`,
                  color: currentRoleColor,
                  textAlign: currentRoleAlignment,
                  lineHeight: '1.2',
                  fontWeight: '400 !important', // Force normal font weight in all states
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  pointerEvents: 'auto' // Enable interactions on text
                }}
                isSelected={roleSelectionState.isTitleSelected}
                transform={roleSelectionState.titleTransform}
                onClick={handleRoleClick}
                onTextChange={handleRoleTextChange}
                onSizeChange={(newTransform) => roleSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                onChangeSize={handleRoleChangeSize}
                onChangeFont={handleRoleChangeFont}
                onChangeColor={handleRoleChangeColor}
                onChangeAlignment={handleRoleChangeAlignment}
                onDeleteText={handleRoleDelete}
                onDragStart={roleSelectionHandlers.handleTitleDragStart}
                onResizeStart={roleSelectionHandlers.handleTitleResizeStart}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const roleElements = document.querySelectorAll('.team-member-profile-layout [data-figma-text]');
                  const roleElement = roleElements[1]; // Second element is role
                  if (roleElement) {
                    const roleRect = roleElement.getBoundingClientRect();
                    const canvasContainer = roleElement.closest('.team-member-profile-layout') as HTMLElement;
                    if (canvasContainer) {
                      const canvasRect = canvasContainer.getBoundingClientRect();
                      const relativeX = (roleRect.left - canvasRect.left) - 10;
                      const relativeY = (roleRect.top - canvasRect.top) - 50;
                      
                      setTextPopupState({
                        isOpen: true,
                        position: { x: relativeX, y: relativeY },
                        originalPosition: { x: relativeX, y: relativeY },
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily,
                        targetElement: 'role',
                        lastTargetElement: 'role'
                      });
                    }
                  }
                }}>
                {currentRole}
        </FigmaText>
            </div>
          )}

          {/* Description */}
          {currentDescription && (
            <div className="absolute pointer-events-auto" style={{ 
              top: '50%', 
              left: '0px',
              width: descriptionWidth ? `${descriptionWidth}px` : 'auto', 
              zIndex: 100,
              // Critical: Allow infinite expansion beyond canvas
              overflow: 'visible',
              contain: 'none',
              // Ensure no layout influence on parent
              position: 'absolute'
            }} data-figma-text>
              <FigmaText
          variant="body"
                color={currentDescriptionColor}
                align={currentDescriptionAlignment}
                fontFamily={descriptionFontFamilyState}
                className="font-normal" // Ensure consistent font weight
                style={{
                  fontSize: `${descriptionFontSizeState}px`,
                  color: currentDescriptionColor,
                  textAlign: currentDescriptionAlignment,
                  lineHeight: '1.4',
                  fontWeight: '400 !important', // Force normal font weight in all states
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  pointerEvents: 'auto' // Enable interactions on text
                }}
                isSelected={descriptionSelectionState.isTitleSelected}
                transform={descriptionSelectionState.titleTransform}
                onClick={handleDescriptionClick}
                onTextChange={handleDescriptionTextChange}
                onSizeChange={(newTransform) => descriptionSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                onChangeColor={handleDescriptionChangeColor}
                onChangeAlignment={handleDescriptionChangeAlignment}
                onDeleteText={handleDescriptionDelete}
                onDragStart={descriptionSelectionHandlers.handleTitleDragStart}
                onResizeStart={descriptionSelectionHandlers.handleTitleResizeStart}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const descriptionElements = document.querySelectorAll('.team-member-profile-layout [data-figma-text]');
                  const descriptionElement = descriptionElements[2]; // Third element is description
                  if (descriptionElement) {
                    const descriptionRect = descriptionElement.getBoundingClientRect();
                    const canvasContainer = descriptionElement.closest('.team-member-profile-layout') as HTMLElement;
                    if (canvasContainer) {
                      const canvasRect = canvasContainer.getBoundingClientRect();
                      const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                      const relativeY = (descriptionRect.top - canvasRect.top) - 50;
                      
                      setTextPopupState({
                        isOpen: true,
                        position: { x: relativeX, y: relativeY },
                        originalPosition: { x: relativeX, y: relativeY },
                        currentFontSize: fontSize,
                        currentFontFamily: fontFamily,
                        targetElement: 'description',
                        lastTargetElement: 'description'
                      });
                    }
                  }
                }}>
                {currentDescription}
        </FigmaText>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  // Conditionally wrap with CanvasOverlay for fixed dimensions
  return useFixedDimensions ? (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeSize(fontSize);
            else if (target === 'role') handleRoleChangeSize(fontSize);
            else if (target === 'description') handleDescriptionChangeSize(fontSize);
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeFont(fontFamily);
            else if (target === 'role') handleRoleChangeFont(fontFamily);
            else if (target === 'description') handleDescriptionChangeFont(fontFamily);
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeColor(color);
            else if (target === 'role') handleRoleChangeColor(color);
            else if (target === 'description') handleDescriptionChangeColor(color);
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeAlignment(alignment);
            else if (target === 'role') handleRoleChangeAlignment(alignment);
            else if (target === 'description') handleDescriptionChangeAlignment(alignment);
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'name' ? currentNameColor : 
                        (textPopupState.targetElement || textPopupState.lastTargetElement) === 'role' ? currentRoleColor : 
                        currentDescriptionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'name' ? currentNameAlignment : 
                           (textPopupState.targetElement || textPopupState.lastTargetElement) === 'role' ? currentRoleAlignment : 
                           currentDescriptionAlignment}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameDelete();
            else if (target === 'role') handleRoleDelete();
            else if (target === 'description') handleDescriptionDelete();
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  ) : (
    <>
      {content}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeSize(fontSize);
            else if (target === 'role') handleRoleChangeSize(fontSize);
            else if (target === 'description') handleDescriptionChangeSize(fontSize);
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeFont(fontFamily);
            else if (target === 'role') handleRoleChangeFont(fontFamily);
            else if (target === 'description') handleDescriptionChangeFont(fontFamily);
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeColor(color);
            else if (target === 'role') handleRoleChangeColor(color);
            else if (target === 'description') handleDescriptionChangeColor(color);
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameChangeAlignment(alignment);
            else if (target === 'role') handleRoleChangeAlignment(alignment);
            else if (target === 'description') handleDescriptionChangeAlignment(alignment);
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'name' ? currentNameColor : 
                        (textPopupState.targetElement || textPopupState.lastTargetElement) === 'role' ? currentRoleColor : 
                        currentDescriptionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'name' ? currentNameAlignment : 
                           (textPopupState.targetElement || textPopupState.lastTargetElement) === 'role' ? currentRoleAlignment : 
                           currentDescriptionAlignment}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'name') handleNameDelete();
            else if (target === 'role') handleRoleDelete();
            else if (target === 'description') handleDescriptionDelete();
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}
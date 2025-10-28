import React, { useState, useEffect, useRef, useMemo } from 'react';
import ImageBlock from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
}

export interface TeamAdaptiveGridProps {
  /**
   * Section heading text
   */
  title?: string;
  
  /**
   * Section description text
   */
  description?: string;
  
  /**
   * Array of team members (minimum 2, maximum 8 will be rendered)
   */
  teamMembers?: TeamMember[];
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Title text color
   */
  titleColor?: string;
  
  /**
   * Member name text color
   */
  nameColor?: string;
  
  /**
   * Member role text color
   */
  roleColor?: string;
  
  /**
   * Description text color
   */
  descriptionColor?: string;
  
  /**
   * Title className for additional styling
   */
  titleClassName?: string;
  
  /**
   * Whether to use fixed canvas dimensions (default: false for responsive)
   */
  useFixedDimensions?: boolean;
  
  /**
   * Canvas width in pixels (only used when useFixedDimensions is true)
   */
  canvasWidth?: number;
  
  /**
   * Canvas height in pixels (only used when useFixedDimensions is true)
   */
  canvasHeight?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Styling props for persistence
   */
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  memberTextStyles?: {
    [key: string]: {
      fontSize: number;
      fontFamily: string;
      color: string;
      alignment: 'left' | 'center' | 'right';
    };
  };

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved member image transforms for position persistence (up to 8 members)
   */
  memberImageTransforms?: { x: number; y: number }[];

  /**
   * Title transform for positioning
   */
  titleTransform?: { x: number; y: number };

  /**
   * Description transform for positioning
   */
  descriptionTransform?: { x: number; y: number };

  /**
   * Member name transforms for positioning (up to 8 members)
   */
  memberNameTransforms?: { x: number; y: number }[];

  /**
   * Member role transforms for positioning (up to 8 members)
   */
  memberRoleTransforms?: { x: number; y: number }[];
}

/**
 * Team Members Component
 * 
 * A responsive grid layout for displaying team members.
 * Renders 2-8 team members with adaptive column layout.
 */
export default function Team_AdaptiveGrid({
  title = 'Team Members',
  description = 'Meet the talented individuals who drive our innovation and success. Each team member brings unique expertise and passion to deliver exceptional results.',
  teamMembers = [
    { name: 'Alex Rodriguez', role: 'Senior Developer', imageUrl: 'profile-photo-1.jpg' },
    { name: 'Sarah Chen', role: 'Frontend Engineer', imageUrl: 'profile-photo-2.jpg' },
    { name: 'Michael Johnson', role: 'Backend Engineer', imageUrl: 'profile-photo-3.jpg' },
    { name: 'Emma Wilson', role: 'DevOps Engineer', imageUrl: 'profile-photo-4.jpg' }
  ],
  fontFamily = 'font-helvetica-neue',
  nameColor = 'text-gray-900',
  roleColor = 'text-gray-600',
  titleClassName = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  className = '',
  titleFontSize = 32,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  titleColor = 'text-gray-900',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  descriptionColor = 'text-gray-600',
  memberTextStyles = {},
  onUpdate,
  memberImageTransforms: savedMemberImageTransforms,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  memberNameTransforms: savedMemberNameTransforms,
  memberRoleTransforms: savedMemberRoleTransforms
}: TeamAdaptiveGridProps) {

  // Memoize validMembers to prevent unnecessary re-renders
  const validMembers = useMemo(() => {
    return teamMembers?.slice(0, 8) || [];
  }, [teamMembers]);

  // Custom onUpdate handlers for each team member
  const createMemberImageUpdateHandler = (memberIndex: number) => (updates: any) => {
    if (onUpdate) {
      // Handle image URL changes
      if (updates.imageUrl) {
        const updatedTeamMembers = [...validMembers];
        if (updatedTeamMembers[memberIndex]) {
          updatedTeamMembers[memberIndex] = {
            ...updatedTeamMembers[memberIndex],
            imageUrl: updates.imageUrl
          };
          onUpdate({ teamMembers: updatedTeamMembers });
        }
      }
      
      // Handle image transform changes
      if (updates.imageTransform) {
        const updatedTransforms = [...(savedMemberImageTransforms || [])];
        updatedTransforms[memberIndex] = updates.imageTransform;
        onUpdate({ memberImageTransforms: updatedTransforms });
      }
    }
  };

  // Create fixed number of Figma selection hooks (max 8 members)
  const member1State = useFigmaSelection({ 
    initialImageUrl: validMembers[0]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[0] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(0)
  });
  const member2State = useFigmaSelection({ 
    initialImageUrl: validMembers[1]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[1] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(1)
  });
  const member3State = useFigmaSelection({ 
    initialImageUrl: validMembers[2]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[2] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(2)
  });
  const member4State = useFigmaSelection({ 
    initialImageUrl: validMembers[3]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[3] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(3)
  });
  const member5State = useFigmaSelection({ 
    initialImageUrl: validMembers[4]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[4] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(4)
  });
  const member6State = useFigmaSelection({ 
    initialImageUrl: validMembers[5]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[5] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(5)
  });
  const member7State = useFigmaSelection({ 
    initialImageUrl: validMembers[6]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[6] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(6)
  });
  const member8State = useFigmaSelection({ 
    initialImageUrl: validMembers[7]?.imageUrl || '',
    initialImageTransform: savedMemberImageTransforms?.[7] || { x: 0, y: 0 },
    onUpdate: createMemberImageUpdateHandler(7)
  });

  // Array of all member states for easy access
  const memberFigmaStates = [
    member1State, member2State, member3State, member4State,
    member5State, member6State, member7State, member8State
  ];

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  
  // Individual member text content state
  const [memberTexts, setMemberTexts] = useState(() => 
    validMembers.reduce((acc, member, index) => {
      acc[index] = { name: member.name, role: member.role };
      return acc;
    }, {} as Record<number, { name: string; role: string }>)
  );

  // Sync props with state when they change (CRITICAL for secondary text editing)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  // Update memberTexts when validMembers changes
  useEffect(() => {
    const newMemberTexts = validMembers.reduce((acc, member, index) => {
      acc[index] = { name: member.name, role: member.role };
      return acc;
    }, {} as Record<number, { name: string; role: string }>);
    
    // Only update if the content has actually changed
    setMemberTexts(prevMemberTexts => {
      if (JSON.stringify(prevMemberTexts) !== JSON.stringify(newMemberTexts)) {
        return newMemberTexts;
      }
      return prevMemberTexts;
    });
  }, [validMembers]);

  // Individual member selection states
  const [selectedMemberText, setSelectedMemberText] = useState<{
    memberIndex: number;
    textType: 'name' | 'role';
  } | null>(null);
  
  // Member text update handlers
  const createMemberNameUpdateHandler = (memberIndex: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      const newTransforms = [...(savedMemberNameTransforms || [])];
      newTransforms[memberIndex] = updates.titleTransform;
      onUpdate({ memberNameTransforms: newTransforms });
    }
  };

  const createMemberRoleUpdateHandler = (memberIndex: number) => (updates: any) => {
    if (onUpdate && updates.titleTransform) {
      const newTransforms = [...(savedMemberRoleTransforms || [])];
      newTransforms[memberIndex] = updates.titleTransform;
      onUpdate({ memberRoleTransforms: newTransforms });
    }
  };

  // Individual member text selection states - create selection hooks for each member text with persistence
  const memberTextSelectionStates = validMembers.reduce((acc, _, index) => {
    acc[`${index}-name`] = useFigmaSelection({
      initialTitleTransform: savedMemberNameTransforms?.[index] || { x: 0, y: 0 },
      onUpdate: createMemberNameUpdateHandler(index)
    });
    acc[`${index}-role`] = useFigmaSelection({
      initialTitleTransform: savedMemberRoleTransforms?.[index] || { x: 0, y: 0 },
      onUpdate: createMemberRoleUpdateHandler(index)
    });
    return acc;
  }, {} as Record<string, [any, any]>);

  // Text styling state for title and description
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);
  const [titleWidth, setTitleWidth] = useState<number | undefined>(undefined);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);
  const [descriptionWidth, setDescriptionWidth] = useState<number | undefined>(400);

  // 🔧 SYNC PROPS TO STATE - Update state when props change (for persistence)
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setCurrentTitleColor(titleColor);
  }, [titleColor]);

  useEffect(() => {
    setCurrentTitleAlignment(titleAlignment);
  }, [titleAlignment]);

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

  // Individual member text styling state
  const [memberTextStylesState, setMemberTextStylesState] = useState<Record<string, {
    fontSize: number;
    fontFamily: string;
    color: string;
    alignment: 'left' | 'center' | 'right';
  }>>(memberTextStyles || {});

  useEffect(() => {
    if (memberTextStyles && Object.keys(memberTextStyles).length > 0) {
      setMemberTextStylesState(memberTextStyles);
    }
  }, []);

  // Text selection handlers with initial transforms and onUpdate
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
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
        // Deselect main title and description
        if (textSelectionHandlers.handleClickOutside) textSelectionHandlers.handleClickOutside();
        
        // Deselect all member texts
        Object.values(memberTextSelectionStates).forEach(([, handlers]) => {
          if (handlers.handleClickOutside) handlers.handleClickOutside();
        });
        
        // Clear selected member text state
        setSelectedMemberText(null);
        
        // Close the popup when clicking outside
        setTextPopupState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textSelectionHandlers, memberTextSelectionStates]);

  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'description' | string | null,
    lastTargetElement: null as 'title' | 'description' | string | null
  });

  // Ref to track previous dragging states for popup following
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false,
    memberTextDragging: {} as Record<string, boolean> // Track dragging state for each member text
  });

  // Update popup position when title/description text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      let transform: any, isDragging: boolean = false, wasDragging: boolean = false;
      
      if (activeTarget === 'title') {
        transform = textSelectionState.titleTransform;
        isDragging = textSelectionState.isTitleDragging;
        wasDragging = prevDraggingRef.current.isTitleDragging;
      } else if (activeTarget === 'description') {
        transform = textSelectionState.descriptionTransform;
        isDragging = textSelectionState.isDescriptionDragging;
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

    // Update previous dragging states for title and description
    prevDraggingRef.current.isTitleDragging = textSelectionState.isTitleDragging;
    prevDraggingRef.current.isDescriptionDragging = textSelectionState.isDescriptionDragging;
  }, [
    textSelectionState.titleTransform, 
    textSelectionState.descriptionTransform, 
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    textPopupState.isOpen, 
    textPopupState.targetElement,
    textPopupState.lastTargetElement
  ]);

  // Separate useEffect for member text popup following
  useEffect(() => {
    const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
    
    if (textPopupState.isOpen && activeTarget && activeTarget.startsWith('member-')) {
      const [, memberIndex, textType] = activeTarget.split('-');
      const memberTextKey = `${memberIndex}-${textType}`;
      
      // We'll use a timer to check for member state changes since we can't include it in dependencies
      const checkMemberState = () => {
        const memberState = getMemberTextSelectionState(parseInt(memberIndex), textType as 'name' | 'role');
        
        if (memberState) {
          const transform = memberState.titleTransform;
          const isDragging = memberState.isTitleDragging;
          const wasDragging = prevDraggingRef.current.memberTextDragging[memberTextKey] || false;
          
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
          
          // Update previous dragging state for this member text
          prevDraggingRef.current.memberTextDragging[memberTextKey] = isDragging;
        }
      };

      // Check immediately
      checkMemberState();
      
      // Set up interval to check for changes during dragging
      const interval = setInterval(checkMemberState, 16); // ~60fps
      
      return () => clearInterval(interval);
    }
  }, [
    textPopupState.isOpen, 
    textPopupState.targetElement, 
    textPopupState.lastTargetElement
  ]);

  // Helper function for Member Profile style popup positioning
  const createMemberPopupHandler = (memberIndex: number, textType: 'name' | 'role') => {
    return (position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
      // Use DOM querying like Quote_LeftTextRightImage layout
      const memberElements = document.querySelectorAll('.team-adaptive-grid-layout [data-figma-text]');
      let targetElement: Element | null = null;
      
      // Find the specific member text element
      memberElements.forEach((element, index) => {
        const elementText = element.textContent?.trim();
        const member = validMembers[memberIndex];
        if (member && (
          (textType === 'name' && elementText === (memberTexts[memberIndex]?.name !== undefined ? memberTexts[memberIndex]?.name : member.name)) ||
          (textType === 'role' && elementText === (memberTexts[memberIndex]?.role !== undefined ? memberTexts[memberIndex]?.role : member.role))
        )) {
          if (!targetElement) { // Take the first match
            targetElement = element;
          }
        }
      });
      
      if (targetElement) {
        const textRect = (targetElement as HTMLElement).getBoundingClientRect();
        const canvasContainer = (targetElement as HTMLElement).closest('.team-adaptive-grid-layout') as HTMLElement;
        if (canvasContainer) {
          const canvasRect = canvasContainer.getBoundingClientRect();
          // Convert to viewport coordinates for position: fixed TextPopup
          const viewportX = textRect.left - 10;
          const viewportY = textRect.top - 50;
          
          setTextPopupState({
            isOpen: true,
            position: { x: viewportX, y: viewportY },
            originalPosition: { x: viewportX, y: viewportY },
            currentFontSize: fontSize,
            currentFontFamily: fontFamily,
            targetElement: `member-${memberIndex}-${textType}`,
            lastTargetElement: `member-${memberIndex}-${textType}`
          });
        }
      }
    };
  };

  // Text change handlers
  const handleTitleChangeSize = (fontSize: number) => {
    setTitleFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ titleFontSize: fontSize });
    }
  };
  const handleTitleChangeFont = (fontFamily: string) => {
    setTitleFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ titleFontFamily: fontFamily });
    }
  };
  const handleTitleChangeColor = (color: string) => {
    setCurrentTitleColor(color);
    if (onUpdate) {
      onUpdate({ titleColor: color });
    }
  };
  const handleTitleChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentTitleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ titleAlignment: alignment });
    }
  };
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
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

  // Individual member text handlers
  const handleMemberNameChange = (memberIndex: number, newName: string) => {
    setMemberTexts(prev => ({
      ...prev,
      [memberIndex]: { ...prev[memberIndex], name: newName }
    }));
    if (onUpdate) {
      // Update the teamMembers array structure properly
      const updatedTeamMembers = validMembers.map((member, i) => 
        i === memberIndex ? { ...member, name: newName } : member
      );
      onUpdate({ teamMembers: updatedTeamMembers });
    }
  };

  const handleMemberRoleChange = (memberIndex: number, newRole: string) => {
    setMemberTexts(prev => ({
      ...prev,
      [memberIndex]: { ...prev[memberIndex], role: newRole }
    }));
    if (onUpdate) {
      // Update the teamMembers array structure properly
      const updatedTeamMembers = validMembers.map((member, i) => 
        i === memberIndex ? { ...member, role: newRole } : member
      );
      onUpdate({ teamMembers: updatedTeamMembers });
    }
  };

  const handleMemberTextClick = (memberIndex: number, textType: 'name' | 'role') => {
    setSelectedMemberText({ memberIndex, textType });
  };

  const handleMemberTextClickOutside = () => {
    setSelectedMemberText(null);
  };

  // Individual member text drag handlers
  const handleMemberTextDragStart = (memberIndex: number, textType: 'name' | 'role') => (e: React.MouseEvent) => {
    const textKey = `${memberIndex}-${textType}`;
    const [, handlers] = memberTextSelectionStates[textKey] || [null, {}];
    
    if (handlers.handleTitleDragStart) {
      handlers.handleTitleDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  // Helper function to get member text selection state
  const getMemberTextSelectionState = (memberIndex: number, textType: 'name' | 'role') => {
    const textKey = `${memberIndex}-${textType}`;
    const [state] = memberTextSelectionStates[textKey] || [null, {}];
    return state;
  };

  // Helper function to get member text handlers
  const getMemberTextHandlers = (memberIndex: number, textType: 'name' | 'role') => {
    const textKey = `${memberIndex}-${textType}`;
    const [, handlers] = memberTextSelectionStates[textKey] || [null, {}];
    return handlers;
  };

  // Helper functions to get and set member text styles
  const getMemberTextStyle = (memberIndex: number, textType: 'name' | 'role', property: 'fontSize' | 'fontFamily' | 'color' | 'alignment') => {
    const key = `${memberIndex}-${textType}`;
    const defaultStyles = {
      fontSize: textType === 'name' ? 12 : 10,
      fontFamily: fontFamily,
      color: 'black',
      alignment: 'left' as const
    };
    return memberTextStylesState[key]?.[property] ?? defaultStyles[property];
  };

  const setMemberTextStyle = (memberIndex: number, textType: 'name' | 'role', property: 'fontSize' | 'fontFamily' | 'color' | 'alignment', value: any) => {
    const key = `${memberIndex}-${textType}`;
    const defaultStyles = {
      fontSize: textType === 'name' ? 12 : 10,
      fontFamily: fontFamily,
      color: 'black',
      alignment: 'left' as const
    };
    setMemberTextStylesState(prev => {
      const newStyles = {
        ...prev,
        [key]: {
          ...defaultStyles,
          ...prev[key],
          [property]: value
        }
      };
      if (onUpdate) {
        onUpdate({ memberTextStyles: newStyles });
      }
      return newStyles;
    });
  };

  // Drag handlers
  const handleTitleDragStart = (e: React.MouseEvent) => {
    if (textSelectionHandlers.handleTitleDragStart) {
      textSelectionHandlers.handleTitleDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  const handleDescriptionDragStart = (e: React.MouseEvent) => {
    if (textSelectionHandlers.handleDescriptionDragStart) {
      textSelectionHandlers.handleDescriptionDragStart(e, e.currentTarget as HTMLElement);
    }
  };

  // Custom resize handlers for proper text wrapping
  const handleTitleResize = (e: React.MouseEvent, direction: string, element: HTMLElement) => {
    const startX = e.clientX;
    const startWidth = element.offsetWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX);
      setTitleWidth(newWidth);
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
      const newWidth = Math.max(150, startWidth + deltaX);
      setDescriptionWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Custom click handlers that ensure only one element is selected at a time
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Deselect description and all member texts
    if (textSelectionHandlers.handleClickOutside) textSelectionHandlers.handleClickOutside();
    Object.values(memberTextSelectionStates).forEach(([, handlers]) => {
      if (handlers.handleClickOutside) handlers.handleClickOutside();
    });
    setSelectedMemberText(null);
    
    // Then select title
    if (textSelectionHandlers.handleTitleClick) {
      textSelectionHandlers.handleTitleClick(e);
    }
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Deselect title and all member texts
    if (textSelectionHandlers.handleClickOutside) textSelectionHandlers.handleClickOutside();
    Object.values(memberTextSelectionStates).forEach(([, handlers]) => {
      if (handlers.handleClickOutside) handlers.handleClickOutside();
    });
    setSelectedMemberText(null);
    
    // Then select description
    if (textSelectionHandlers.handleDescriptionClick) {
      textSelectionHandlers.handleDescriptionClick(e);
    }
  };

  const handleMemberTextClickCustom = (memberIndex: number, textType: 'name' | 'role') => (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Deselect main title and description
    if (textSelectionHandlers.handleClickOutside) textSelectionHandlers.handleClickOutside();
    
    // Deselect all other member texts
    Object.entries(memberTextSelectionStates).forEach(([key, [, handlers]]) => {
      const [index, type] = key.split('-');
      if (parseInt(index) !== memberIndex || type !== textType) {
        if (handlers.handleClickOutside) handlers.handleClickOutside();
      }
    });
    
    // Select this member text
    const textKey = `${memberIndex}-${textType}`;
    const [, handlers] = memberTextSelectionStates[textKey] || [null, {}];
    if (handlers.handleTitleClick) {
      handlers.handleTitleClick(e);
    }
    
    // Update selected member text state
    setSelectedMemberText({ memberIndex, textType });
  };

  // Global click outside handler to deselect all member images and text
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't handle if click is on TextPopup or its elements
    const isClickOnPopup = target.closest('[data-text-popup]') !== null;
    const isClickOnColorArea = target.closest('[data-color-area]') !== null;
    const isClickOnHueSlider = target.closest('[data-hue-slider]') !== null;
    
    if (isClickOnPopup || isClickOnColorArea || isClickOnHueSlider) {
      return;
    }
    
    memberFigmaStates.forEach(([, handlers]) => {
      if (handlers.handleClickOutside) {
      handlers.handleClickOutside();
      }
    });
    handleMemberTextClickOutside();
  };

  // Custom click handlers that ensure only one member is selected at a time
  const createMemberClickHandler = (selectedIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    // Deselect all other members first
    memberFigmaStates.forEach(([, handlers], index) => {
      if (index !== selectedIndex) {
        handlers.handleClickOutside();
      }
    });
    // Then handle this member's selection
    memberFigmaStates[selectedIndex][1].handleImageClick(e);
  };
  
  // Don't render if we have fewer than 2 members
  if (validMembers.length < 2) {
    return null;
  }

  // Check if this is a compact layout that should be vertically centered (2-5 members)
  const isSingleRow = validMembers.length >= 2 && validMembers.length <= 5;

  // Dynamic grid classes and wrapper based on number of members
  const getGridConfig = () => {
    const memberCount = validMembers.length;
    
    if (memberCount === 3) {
      // 3 members: single row, slightly increased gap spacing
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-14 xl:gap-x-18 gap-y-2 lg:gap-y-3 max-w-6xl mx-auto justify-items-center"
      };
    } else if (memberCount === 4) {
      // 4 members: single row, centered with larger spacing
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 lg:gap-x-12 xl:gap-x-16 gap-y-2 lg:gap-y-3 max-w-5xl mx-auto justify-items-center"
      };
    } else if (memberCount === 5) {
      // 5 members: single row like 4 members but smaller spacing to fit
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-4 lg:gap-x-6 xl:gap-x-8 gap-y-2 lg:gap-y-3 max-w-6xl mx-auto justify-items-center"
      };
    } else if (memberCount === 6) {
      // 6 members: 3 in each row (2 rows of 3)
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 lg:gap-x-6 gap-y-10 lg:gap-y-12 max-w-4xl"
      };
    } else if (memberCount === 7) {
      // 7 members: 4 in first row, 3 in second row (bottom row centered under top row)
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 lg:gap-x-5 gap-y-10 lg:gap-y-12 max-w-5xl justify-items-center"
      };
    } else if (memberCount === 8) {
      // 8 members: 4 in each row (2 rows of 4)
      return {
        wrapperClass: "w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 lg:gap-x-5 gap-y-1 lg:gap-y-2"
      };
    } else if (memberCount === 2) {
      // 2 members: single row, centered with REDUCED gap but LARGER images (bigger than 3 and 4)
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-8 xl:gap-x-10 gap-y-2 lg:gap-y-3 max-w-4xl"
      };
    } else if (memberCount === 1) {
      // 1 member: single centered item
      return {
        wrapperClass: "flex justify-center w-full",
        gridClass: "grid grid-cols-1 gap-y-2 lg:gap-y-3 max-w-sm"
      };
    } else {
      // Default fallback for other counts
      return {
        wrapperClass: "w-full",
        gridClass: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-2 lg:gap-y-3"
      };
    }
  };

  const gridConfig = getGridConfig();
  
  // Dynamic image size based on member count - wider aspect ratios for fewer members to fill space
  const getImageSize = () => {
    const memberCount = validMembers.length;
    if (memberCount === 2) {
      // EXTRA LARGE and TALLER images for 2-person layout
      return "w-72 lg:w-80 xl:w-96 aspect-[4/3]";
    } else if (memberCount === 3) {
      // LARGE images for 3-person layout - balanced height for good text visibility
      return "w-56 lg:w-64 xl:w-72 aspect-square";
    } else if (memberCount === 4) {
      // MEDIUM-LARGE and TALLER images for 4-person layout
      return "w-44 lg:w-48 xl:w-52 aspect-[3/4]";
    } else if (memberCount === 5) {
      // SMALLER but TALLER images for 5-person single row layout
      return "w-32 lg:w-36 xl:w-40 aspect-[2/3]";
    } else if (memberCount === 6) {
      // LARGER images for 6-person layout - bigger overall, slightly taller
      return "w-40 lg:w-44 xl:w-48 aspect-[4/3]";
    } else {
      // EVEN BIGGER images for 7+ person layouts - increased width and height more
      return "w-32 lg:w-36 xl:w-40 aspect-[6/5]";
    }
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
    // Layout constraints to prevent movement
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
    // Layout constraints for responsive mode
    position: 'relative' as const,
    userSelect: 'none',
  };

  // Base classes for responsive layout with white background
  const containerClasses = useFixedDimensions 
    ? `team-adaptive-grid-layout flex flex-col items-start justify-start overflow-visible relative bg-white select-none ${className}`
    : `team-adaptive-grid-layout flex flex-col items-start justify-start w-full h-full min-h-[400px] overflow-visible relative bg-white select-none ${className}`;

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
      onClick={handleGlobalClickOutside}
    >
      {/* Main Content Container */}
      <div className={`content-container flex flex-col ${isSingleRow ? 'justify-center' : 'justify-start'} items-start w-full h-full px-8 lg:px-12 ${isSingleRow ? 'py-8 lg:py-12' : 'pt-8 lg:pt-12 pb-6 lg:pb-8'}`}>
        
        {/* Top Section - Title Left, Description Right */}
        <div className={`flex flex-col lg:flex-row lg:items-start ${validMembers.length === 2 ? 'mb-6 lg:mb-8' : validMembers.length === 3 ? 'mb-8 lg:mb-10' : validMembers.length === 4 ? 'mb-6 lg:mb-8' : validMembers.length === 5 ? 'mb-10 lg:mb-12' : 'mb-4 lg:mb-6'}`}>
          {/* Title Section - Left */}
          <div className="w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-0">
            {currentTitle && (
              <div className="absolute pointer-events-auto" style={{ top: '10%', left: '32px', zIndex: 1000, width: titleWidth ? `${titleWidth}px` : 'auto' }} data-figma-text>
                <FigmaText
                  variant="title"
                  color={currentTitleColor}
                  align={currentTitleAlignment}
                  fontFamily={titleFontFamilyState}
                  className={`font-normal text-2xl lg:text-3xl xl:text-4xl leading-none tracking-tighter ${titleClassName}`}
                  style={{
                    fontSize: `${titleFontSizeState}px`,
                    textAlign: currentTitleAlignment,
                    lineHeight: '0.9',
                    letterSpacing: '-0.05em',
                    width: titleWidth ? `${titleWidth}px` : 'auto',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={textSelectionState.isTitleSelected}
                  transform={textSelectionState.titleTransform}
                  onClick={handleTitleClick}
                  onTextChange={handleTitleTextChange}
                  onDeleteText={handleTitleDelete}
                  onDragStart={handleTitleDragStart}
                  onResizeStart={handleTitleResize}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    // Use DOM querying like Quote_LeftTextRightImage layout
                    const titleElements = document.querySelectorAll('.team-adaptive-grid-layout [data-figma-text]');
                    const titleElement = titleElements[0]; // First element is title
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.team-adaptive-grid-layout') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (titleRect.left - canvasRect.left) - 10;
                        const relativeY = (titleRect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily,
                          targetElement: 'title',
                          lastTargetElement: 'title'
                        });
                      }
                    }
                  }}>
                  {currentTitle}
                </FigmaText>
              </div>
            )}
          </div>

          {/* Description Section - Right */}
          <div className="w-full lg:w-1/2 lg:pl-8">
            {currentDescription && (
              <div className="absolute pointer-events-auto" style={{ top: '10%', right: '32px', width: descriptionWidth ? `${descriptionWidth}px` : '400px', zIndex: 1000 }} data-figma-text>
                <FigmaText
                  variant="body"
                  color={currentDescriptionColor}
                  align={currentDescriptionAlignment}
                  fontFamily={descriptionFontFamilyState}
                  className={`leading-relaxed`}
                  style={{
                    fontSize: `${descriptionFontSizeState}px`,
                    textAlign: currentDescriptionAlignment,
                    width: descriptionWidth ? `${descriptionWidth}px` : '400px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={textSelectionState.isDescriptionSelected}
                  transform={textSelectionState.descriptionTransform}
                  onClick={handleDescriptionClick}
                  onTextChange={handleDescriptionTextChange}
                  onDeleteText={handleDescriptionDelete}
                  onDragStart={handleDescriptionDragStart}
                  onResizeStart={handleDescriptionResize}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    // Use DOM querying like Quote_LeftTextRightImage layout
                    const descriptionElements = document.querySelectorAll('.team-adaptive-grid-layout [data-figma-text]');
                    const descriptionElement = descriptionElements[1]; // Second element is description
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.team-adaptive-grid-layout') as HTMLElement;
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

        {/* Team Members Section - Below */}
        <div className="flex-1 min-h-0">
          <div className={`content-stack flex flex-col items-center w-full max-w-6xl mx-auto ${validMembers.length === 6 ? 'mt-2 lg:mt-4' : 'mt-8 lg:mt-12'} ${validMembers.length > 4 ? 'space-y-2 lg:space-y-4' : 'space-y-8 lg:space-y-16'}`}>
            
            {/* Team Members Grid */}
          <div className="team-grid w-full">
            {(validMembers.length === 7 || validMembers.length === 8) ? (
              // Custom staggered layout for 7 and 8 members
              <div className={gridConfig.wrapperClass}>
                {validMembers.length === 7 ? (
                  // 7 members: 4 top, 3 bottom (left-aligned)
                  <div className="flex flex-col gap-y-10 lg:gap-y-12 max-w-5xl mx-auto">
                    {/* Top Row - 4 members */}
                    <div className="flex justify-center gap-x-4 lg:gap-x-6">
                      {validMembers.slice(0, 4).map((member, index) => (
                        <div key={index} className="team-member-card flex flex-col items-start text-left" style={{ flexShrink: 0 }}>
                          <FigmaImage 
                            src={member.imageUrl} 
                            alt={member.name} 
                            size="full" 
                            fit="cover" 
                            align="right" 
                            rounded={false} 
                            fill 
                            containerClassName={`${getImageSize()} overflow-hidden`}
                            state={memberFigmaStates[index]?.[0]}
                            handlers={{...memberFigmaStates[index]?.[1], handleImageClick: createMemberClickHandler(index)}}
                          />
                          <div className="member-info relative w-full" style={{ contain: 'none', overflow: 'visible' }}>
                            <div className="absolute pointer-events-auto" style={{ top: '0px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-900"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '12px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(index, 'name')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(index, 'name')?.titleTransform}
                                onClick={handleMemberTextClickCustom(index, 'name')}
                                onTextChange={(newText) => handleMemberNameChange(index, newText)}
                                onDragStart={handleMemberTextDragStart(index, 'name')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(index, 'name');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(index, 'name')}>
                                {memberTexts[index]?.name !== undefined ? memberTexts[index]?.name : member.name}
                              </FigmaText>
                            </div>
                            <div className="absolute pointer-events-auto" style={{ top: '20px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-600"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '10px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(index, 'role')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(index, 'role')?.titleTransform}
                                onClick={handleMemberTextClickCustom(index, 'role')}
                                onTextChange={(newText) => handleMemberRoleChange(index, newText)}
                                onDragStart={handleMemberTextDragStart(index, 'role')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(index, 'role');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(index, 'role')}>
                                {memberTexts[index]?.role !== undefined ? memberTexts[index]?.role : member.role}
                              </FigmaText>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Bottom Row - 3 members aligned left */}
                    <div className="flex justify-start gap-x-4 lg:gap-x-6">
                      {validMembers.slice(4, 7).map((member, index) => {
                        const memberIndex = index + 4;
                        return (
                        <div key={memberIndex} className="team-member-card flex flex-col items-start text-left" style={{ flexShrink: 0 }}>
                          <FigmaImage 
                            src={member.imageUrl} 
                            alt={member.name} 
                            size="full" 
                            fit="cover" 
                            align="right" 
                            rounded={false} 
                            fill 
                            containerClassName={`${getImageSize()} overflow-hidden`}
                            state={memberFigmaStates[memberIndex]?.[0]}
                            handlers={{...memberFigmaStates[memberIndex]?.[1], handleImageClick: createMemberClickHandler(memberIndex)}}
                          />
                          <div className="member-info relative w-full" style={{ contain: 'none', overflow: 'visible' }}>
                            <div className="absolute pointer-events-auto" style={{ top: '0px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-900"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '12px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(memberIndex, 'name')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(memberIndex, 'name')?.titleTransform}
                                onClick={handleMemberTextClickCustom(memberIndex, 'name')}
                                onTextChange={(newText) => handleMemberNameChange(memberIndex, newText)}
                                onDragStart={handleMemberTextDragStart(memberIndex, 'name')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(memberIndex, 'name');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(memberIndex, 'name')}>
                                {memberTexts[memberIndex]?.name !== undefined ? memberTexts[memberIndex]?.name : member.name}
                              </FigmaText>
                            </div>
                            <div className="absolute pointer-events-auto" style={{ top: '20px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-600"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '10px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(memberIndex, 'role')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(memberIndex, 'role')?.titleTransform}
                                onClick={handleMemberTextClickCustom(memberIndex, 'role')}
                                onTextChange={(newText) => handleMemberRoleChange(memberIndex, newText)}
                                onDragStart={handleMemberTextDragStart(memberIndex, 'role')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(memberIndex, 'role');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(memberIndex, 'role')}>
                                {memberTexts[memberIndex]?.role !== undefined ? memberTexts[memberIndex]?.role : member.role}
                              </FigmaText>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // 8 members: 4 top, 4 bottom (same structure as 7 but with 4th member in bottom row)
                  <div className="flex flex-col gap-y-10 lg:gap-y-12 max-w-5xl mx-auto">
                    {/* Top Row - 4 members */}
                    <div className="flex justify-center gap-x-4 lg:gap-x-6">
                      {validMembers.slice(0, 4).map((member, index) => (
                        <div key={index} className="team-member-card flex flex-col items-start text-left" style={{ flexShrink: 0 }}>
                          <FigmaImage 
                            src={member.imageUrl} 
                            alt={member.name} 
                            size="full" 
                            fit="cover" 
                            align="right" 
                            rounded={false} 
                            fill 
                            containerClassName={`${getImageSize()} overflow-hidden`}
                            state={memberFigmaStates[index]?.[0]}
                            handlers={{...memberFigmaStates[index]?.[1], handleImageClick: createMemberClickHandler(index)}}
                          />
                          <div className="member-info relative w-full" style={{ contain: 'none', overflow: 'visible' }}>
                            <div className="absolute pointer-events-auto" style={{ top: '0px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-900"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '12px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(index, 'name')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(index, 'name')?.titleTransform}
                                onClick={handleMemberTextClickCustom(index, 'name')}
                                onTextChange={(newText) => handleMemberNameChange(index, newText)}
                                onDragStart={handleMemberTextDragStart(index, 'name')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(index, 'name');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(index, 'name')}>
                                {memberTexts[index]?.name !== undefined ? memberTexts[index]?.name : member.name}
                              </FigmaText>
                            </div>
                            <div className="absolute pointer-events-auto" style={{ top: '20px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-600"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '10px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(index, 'role')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(index, 'role')?.titleTransform}
                                onClick={handleMemberTextClickCustom(index, 'role')}
                                onTextChange={(newText) => handleMemberRoleChange(index, newText)}
                                onDragStart={handleMemberTextDragStart(index, 'role')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(index, 'role');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(index, 'role')}>
                                {memberTexts[index]?.role !== undefined ? memberTexts[index]?.role : member.role}
                              </FigmaText>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Bottom Row - 4 members centered */}
                    <div className="flex justify-center gap-x-4 lg:gap-x-6">
                      {validMembers.slice(4, 8).map((member, index) => {
                        const memberIndex = index + 4;
                        return (
                        <div key={memberIndex} className="team-member-card flex flex-col items-start text-left" style={{ flexShrink: 0 }}>
                          <FigmaImage 
                            src={member.imageUrl} 
                            alt={member.name} 
                            size="full" 
                            fit="cover" 
                            align="right" 
                            rounded={false} 
                            fill 
                            containerClassName={`${getImageSize()} overflow-hidden`}
                            state={memberFigmaStates[memberIndex]?.[0]}
                            handlers={{...memberFigmaStates[memberIndex]?.[1], handleImageClick: createMemberClickHandler(memberIndex)}}
                          />
                          <div className="member-info relative w-full" style={{ contain: 'none', overflow: 'visible' }}>
                            <div className="absolute pointer-events-auto" style={{ top: '0px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-900"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '12px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(memberIndex, 'name')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(memberIndex, 'name')?.titleTransform}
                                onClick={handleMemberTextClickCustom(memberIndex, 'name')}
                                onTextChange={(newText) => handleMemberNameChange(memberIndex, newText)}
                                onDragStart={handleMemberTextDragStart(memberIndex, 'name')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(memberIndex, 'name');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(memberIndex, 'name')}>
                                {memberTexts[memberIndex]?.name !== undefined ? memberTexts[memberIndex]?.name : member.name}
                              </FigmaText>
                            </div>
                            <div className="absolute pointer-events-auto" style={{ top: '20px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                              <FigmaText
                                variant="body"
                                color="text-gray-600"
                                align="left"
                                fontFamily={fontFamily}
                                style={{ fontSize: '10px', textAlign: 'left', color: 'black', wordWrap: 'break-word', whiteSpace: 'normal', width: '100%' }}
                                isSelected={getMemberTextSelectionState(memberIndex, 'role')?.isTitleSelected || false}
                                transform={getMemberTextSelectionState(memberIndex, 'role')?.titleTransform}
                                onClick={handleMemberTextClickCustom(memberIndex, 'role')}
                                onTextChange={(newText) => handleMemberRoleChange(memberIndex, newText)}
                                onDragStart={handleMemberTextDragStart(memberIndex, 'role')}
                                onResizeStart={(e) => {
                                  const handlers = getMemberTextHandlers(memberIndex, 'role');
                                  if (handlers.handleTitleResizeStart) {
                                    handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                                  }
                                }}
                                onShowPopup={createMemberPopupHandler(memberIndex, 'role')}>
                                {memberTexts[memberIndex]?.role !== undefined ? memberTexts[memberIndex]?.role : member.role}
                              </FigmaText>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Regular grid layout for other member counts
              <div className={gridConfig.wrapperClass}>
                <div className={gridConfig.gridClass}>
                {validMembers.map((member, index) => (
                  <div key={index} className="team-member-card flex flex-col items-start text-left space-y-2" style={{ flexShrink: 0 }}>
                    {/* Member Image */}
                    <FigmaImage
                      src={member.imageUrl}
                      alt={member.name}
                      size="full"
                      fit="cover"
                      align="left"
                      rounded={false}
                      fill
                      containerClassName={`${getImageSize()} overflow-hidden`}
                      state={memberFigmaStates[index]?.[0]}
                      handlers={{...memberFigmaStates[index]?.[1], handleImageClick: createMemberClickHandler(index)}}
                    />
                    
                    {/* Member Info */}
                    <div className="member-info relative w-full" style={{ contain: 'none', overflow: 'visible' }}>
                      {/* Member Name */}
                      <div className="absolute pointer-events-auto" style={{ top: '0px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                        <FigmaText
                                variant="body"
                          color="text-gray-900"
                          align={getMemberTextStyle(index, 'name', 'alignment') as 'left' | 'center' | 'right'}
                                fontFamily={getMemberTextStyle(index, 'name', 'fontFamily') as string}
                          style={{ 
                            fontSize: `${getMemberTextStyle(index, 'name', 'fontSize')}px`, 
                            textAlign: getMemberTextStyle(index, 'name', 'alignment') as 'left' | 'center' | 'right', 
                            color: getMemberTextStyle(index, 'name', 'color') as string,
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            width: '100%'
                          }}
                          isSelected={getMemberTextSelectionState(index, 'name')?.isTitleSelected || false}
                          transform={getMemberTextSelectionState(index, 'name')?.titleTransform}
                          onClick={handleMemberTextClickCustom(index, 'name')}
                          onTextChange={(newText) => handleMemberNameChange(index, newText)}
                          onDragStart={handleMemberTextDragStart(index, 'name')}
                          onResizeStart={(e) => {
                            const handlers = getMemberTextHandlers(index, 'name');
                            if (handlers.handleTitleResizeStart) {
                              handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                            }
                          }}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            // Use DOM querying like Quote_LeftTextRightImage layout
                            const memberElements = document.querySelectorAll('.team-adaptive-grid-layout [data-figma-text]');
                            let targetElement: Element | null = null;
                            
                            // Find the specific member name element
                            memberElements.forEach((element) => {
                              const elementText = element.textContent?.trim();
                              const member = validMembers[index];
                              if (member && elementText === (memberTexts[index]?.name !== undefined ? memberTexts[index]?.name : member.name)) {
                                if (!targetElement) { // Take the first match
                                  targetElement = element;
                                }
                              }
                            });
                            
                            if (targetElement) {
                              const textRect = (targetElement as HTMLElement).getBoundingClientRect();
                              const canvasContainer = (targetElement as HTMLElement).closest('.team-adaptive-grid-layout') as HTMLElement;
                              if (canvasContainer) {
                                const canvasRect = canvasContainer.getBoundingClientRect();
                                const relativeX = (textRect.left - canvasRect.left) - 10;
                                const relativeY = (textRect.top - canvasRect.top) - 50;
                                
                                setTextPopupState({
                                  isOpen: true,
                                  position: { x: relativeX, y: relativeY },
                                  originalPosition: { x: relativeX, y: relativeY },
                                  currentFontSize: fontSize,
                                  currentFontFamily: fontFamily,
                                  targetElement: `member-${index}-name`,
                                  lastTargetElement: `member-${index}-name`
                                });
                              }
                            }
                          }}>
          {memberTexts[index]?.name !== undefined ? memberTexts[index]?.name : member.name}
                        </FigmaText>
                      </div>
                      
                      {/* Member Role */}
                      <div className="absolute pointer-events-auto" style={{ top: '20px', left: '0px', zIndex: 1000, width: '150px', maxWidth: '150px' }} data-figma-text>
                        <FigmaText
                                variant="body"
                          color="text-gray-600"
                          align={getMemberTextStyle(index, 'role', 'alignment') as 'left' | 'center' | 'right'}
                                fontFamily={getMemberTextStyle(index, 'role', 'fontFamily') as string}
                          style={{ 
                            fontSize: `${getMemberTextStyle(index, 'role', 'fontSize')}px`, 
                            textAlign: getMemberTextStyle(index, 'role', 'alignment') as 'left' | 'center' | 'right', 
                            color: getMemberTextStyle(index, 'role', 'color') as string,
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            width: '100%'
                          }}
                          isSelected={getMemberTextSelectionState(index, 'role')?.isTitleSelected || false}
                          transform={getMemberTextSelectionState(index, 'role')?.titleTransform}
                          onClick={handleMemberTextClickCustom(index, 'role')}
                          onTextChange={(newText) => handleMemberRoleChange(index, newText)}
                          onDragStart={handleMemberTextDragStart(index, 'role')}
                          onResizeStart={(e) => {
                            const handlers = getMemberTextHandlers(index, 'role');
                            if (handlers.handleTitleResizeStart) {
                              handlers.handleTitleResizeStart(e, 'se', e.currentTarget as HTMLElement);
                            }
                          }}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            // Use DOM querying like Quote_LeftTextRightImage layout
                            const memberElements = document.querySelectorAll('.team-adaptive-grid-layout [data-figma-text]');
                            let targetElement: Element | null = null;
                            
                            // Find the specific member role element
                            memberElements.forEach((element) => {
                              const elementText = element.textContent?.trim();
                              const member = validMembers[index];
                              if (member && elementText === (memberTexts[index]?.role || member.role)) {
                                if (!targetElement) { // Take the first match
                                  targetElement = element;
                                }
                              }
                            });
                            
                            if (targetElement) {
                              const textRect = (targetElement as HTMLElement).getBoundingClientRect();
                              const canvasContainer = (targetElement as HTMLElement).closest('.team-adaptive-grid-layout') as HTMLElement;
                              if (canvasContainer) {
                                const canvasRect = canvasContainer.getBoundingClientRect();
                                const relativeX = (textRect.left - canvasRect.left) - 10;
                                const relativeY = (textRect.top - canvasRect.top) - 50;
                                
                                setTextPopupState({
                                  isOpen: true,
                                  position: { x: relativeX, y: relativeY },
                                  originalPosition: { x: relativeX, y: relativeY },
                                  currentFontSize: fontSize,
                                  currentFontFamily: fontFamily,
                                  targetElement: `member-${index}-role`,
                                  lastTargetElement: `member-${index}-role`
                                });
                              }
                            }
                          }}>
          {memberTexts[index]?.role !== undefined ? memberTexts[index]?.role : member.role}
                        </FigmaText>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Conditionally wrap with CanvasOverlay for fixed dimensions
  return useFixedDimensions ? (
    <CanvasOverlayProvider canvasWidth={canvasWidth} canvasHeight={canvasHeight}>
      {content}
      {/* Text Popup */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleDescriptionChangeSize(fontSize);
            } else if (target && target.startsWith('member-')) {
              // Handle member text font size changes
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'alignment', alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleColor;
            if (target === 'description') return currentDescriptionColor;
            if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              return getMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'color') as string;
            }
            return 'black'; // Default for member texts
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              return getMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'alignment') as 'left' | 'center' | 'right';
            }
            return 'left'; // Default for member texts
          })()}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              const index = parseInt(memberIndex);
              if (textType === 'name') {
                handleMemberNameChange(index, '');
              } else if (textType === 'role') {
                handleMemberRoleChange(index, '');
              }
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  ) : (
    <>
      {content}
      {/* Text Popup */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleDescriptionChangeSize(fontSize);
            } else if (target && target.startsWith('member-')) {
              // Handle member text font size changes
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              setMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'alignment', alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleColor;
            if (target === 'description') return currentDescriptionColor;
            if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              return getMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'color') as string;
            }
            return 'black'; // Default for member texts
          })()}
          currentAlignment={(() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') return currentTitleAlignment;
            if (target === 'description') return currentDescriptionAlignment;
            if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              return getMemberTextStyle(parseInt(memberIndex), textType as 'name' | 'role', 'alignment') as 'left' | 'center' | 'right';
            }
            return 'left'; // Default for member texts
          })()}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target && target.startsWith('member-')) {
              const [, memberIndex, textType] = target.split('-');
              const index = parseInt(memberIndex);
              if (textType === 'name') {
                handleMemberNameChange(index, '');
              } else if (textType === 'role') {
                handleMemberRoleChange(index, '');
              }
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}

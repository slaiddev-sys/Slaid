import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import ImageBlock from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaLogo, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface BackCoverThankYouWithImageProps {
  /**
   * Main thank you message
   */
  title?: string;
  
  /**
   * Company logo URL
   */
  logoUrl?: string;
  
  /**
   * Logo alt text
   */
  logoAlt?: string;
  
  /**
   * Right column image URL
   */
  imageUrl?: string;
  
  /**
   * Right column image alt text
   */
  imageAlt?: string;
  
  /**
   * Contact information
   */
  contact?: {
    email?: string;
    social?: string;
    phone?: string;
    phone2?: string;
    location?: {
      city?: string;
      country?: string;
    };
    website?: string;
  };
  
  /**
   * Layout configuration
   */
  layout?: {
    showTitle?: boolean;
    showLogo?: boolean;
    showContact?: boolean;
    showImage?: boolean;
  };
  
  /**
   * Font family for text elements
   */
  fontFamily?: string;
  
  /**
   * Title text color
   */
  titleColor?: string;
  
  /**
   * Contact text color
   */
  contactColor?: string;
  
  /**
   * Additional CSS classes
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
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Title transform for positioning
   */
  titleTransform?: { x: number; y: number };

  /**
   * Email transform for positioning
   */
  emailTransform?: { x: number; y: number };

  /**
   * Social transform for positioning
   */
  socialTransform?: { x: number; y: number };

  /**
   * Phone transform for positioning
   */
  phoneTransform?: { x: number; y: number };

  /**
   * Phone2 transform for positioning
   */
  phone2Transform?: { x: number; y: number };

  /**
   * Location transform for positioning
   */
  locationTransform?: { x: number; y: number };

  /**
   * Website transform for positioning
   */
  websiteTransform?: { x: number; y: number };

  /**
   * Logo transform for positioning
   */
  logoTransform?: { x: number; y: number };

  // Styling props
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: string;
  titleColor?: string;
  contactFontSize?: number;
  contactFontFamily?: string;
  contactAlignment?: string;
  contactColor?: string;

  /**
   * Saved image transform for position persistence
   */
  imageTransform?: { x: number; y: number };
}

/**
 * Back Cover Thank You With Image Layout
 * 
 * A clean, minimalist back cover layout with thank you message,
 * company logo, contact information, and a right column image.
 */
export default function BackCover_ThankYouWithImage({
  title = 'Thank you',
  logoUrl = '/logo-placeholder.png',
  logoAlt = 'Company logo',
  imageUrl = '/Default-Image-1.png',
  imageAlt = 'Thank you image',
  contact = {
    email: 'hello@creatable.co.nz',
    social: '@creatable.co.nz',
    phone: '+64221638003',
    phone2: '+64221638004',
    location: {
      city: 'Auckland Central',
      country: 'New Zealand'
    },
    website: 'creatable.co.nz'
  },
  layout = {
    showTitle: true,
    showLogo: true,
    showContact: true,
    showImage: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  contactColor = 'text-gray-700',
  titleFontSize = 60,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  contactFontSize = 12,
  contactFontFamily = 'font-helvetica-neue',
  contactAlignment = 'left',
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1920,
  canvasHeight = 1080,
  onUpdate,
  imageTransform: savedImageTransform,
  titleTransform: savedTitleTransform,
  emailTransform: savedEmailTransform,
  socialTransform: savedSocialTransform,
  phoneTransform: savedPhoneTransform,
  phone2Transform: savedPhone2Transform,
  locationTransform: savedLocationTransform,
  websiteTransform: savedWebsiteTransform,
  logoTransform: savedLogoTransform
}: BackCoverThankYouWithImageProps) {

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentEmail, setCurrentEmail] = useState(contact?.email || '');
  const [currentSocial, setCurrentSocial] = useState(contact?.social || '');
  const [currentPhone, setCurrentPhone] = useState(contact?.phone || '');
  const [currentPhone2, setCurrentPhone2] = useState(contact?.phone2 || '');
  const [currentCity, setCurrentCity] = useState(contact?.location?.city || '');
  const [currentCountry, setCurrentCountry] = useState(contact?.location?.country || '');
  const [currentWebsite, setCurrentWebsite] = useState(contact?.website || '');

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentEmail(contact?.email || '');
    setCurrentSocial(contact?.social || '');
    setCurrentPhone(contact?.phone || '');
    setCurrentPhone2(contact?.phone2 || '');
    setCurrentCity(contact?.location?.city || '');
    setCurrentCountry(contact?.location?.country || '');
    setCurrentWebsite(contact?.website || '');
  }, [contact]);

  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [titleAlignmentState, setTitleAlignment] = useState(titleAlignment);

  const [contactFontSizeState, setContactFontSize] = useState(contactFontSize);
  const [contactFontFamilyState, setContactFontFamily] = useState(contactFontFamily);
  const [currentContactColor, setCurrentContactColor] = useState(contactColor);
  const [contactAlignmentState, setContactAlignment] = useState(contactAlignment);

  // Sync styling props with state
  useEffect(() => {
    setTitleFontSize(titleFontSize);
  }, [titleFontSize]);

  useEffect(() => {
    setTitleFontFamily(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    setTitleAlignment(titleAlignment);
  }, [titleAlignment]);

  useEffect(() => {
    setContactFontSize(contactFontSize);
  }, [contactFontSize]);

  useEffect(() => {
    setContactFontFamily(contactFontFamily);
  }, [contactFontFamily]);

  useEffect(() => {
    setContactAlignment(contactAlignment);
  }, [contactAlignment]);

  // Sync props with state when they change (CRITICAL for secondary text editing)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentEmail(contact?.email || '');
    setCurrentSocial(contact?.social || '');
    setCurrentPhone(contact?.phone || '');
    setCurrentPhone2(contact?.phone2 || '');
    setCurrentCity(contact?.location?.city || '');
    setCurrentCountry(contact?.location?.country || '');
    setCurrentWebsite(contact?.website || '');
  }, [contact]);

  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'email' | 'social' | 'phone' | 'phone2' | 'city' | 'country' | 'website' | null,
    lastTargetElement: null as 'title' | 'email' | 'social' | 'phone' | 'phone2' | 'city' | 'country' | 'website' | null
  });

  // Use Figma selection hooks for logo and main image
  const [logoState, logoHandlers] = useFigmaSelection({
    initialLogoUrl: logoUrl,
    initialLogoTransform: savedLogoTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  const [imageState, imageHandlers] = useFigmaSelection({
    initialImageUrl: imageUrl,
    initialImageTransform: savedImageTransform || { x: 0, y: 0 },
    onUpdate: onUpdate // 🔧 AUTO-UPDATE: Pass onUpdate for automatic saving
  });

  // Text selection handlers - separate for each element with initial transforms and onUpdate
  const [titleSelectionState, titleSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [emailSelectionState, emailSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedEmailTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [socialSelectionState, socialSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedSocialTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [phoneSelectionState, phoneSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedPhoneTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [phone2SelectionState, phone2SelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedPhone2Transform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [locationSelectionState, locationSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedLocationTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  const [websiteSelectionState, websiteSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedWebsiteTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });

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
    setTitleAlignment(alignment);
    if (onUpdate) {
      onUpdate({ titleAlignment: alignment });
    }
  };

  const handleContactChangeSize = (fontSize: number) => {
    setContactFontSize(fontSize);
    if (onUpdate) {
      onUpdate({ contactFontSize: fontSize });
    }
  };

  const handleContactChangeFont = (fontFamily: string) => {
    setContactFontFamily(fontFamily);
    if (onUpdate) {
      onUpdate({ contactFontFamily: fontFamily });
    }
  };

  const handleContactChangeColor = (color: string) => {
    setCurrentContactColor(color);
    if (onUpdate) {
      onUpdate({ contactColor: color });
    }
  };

  const handleContactChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setContactAlignment(alignment);
    if (onUpdate) {
      onUpdate({ contactAlignment: alignment });
    }
  };



  // Text content change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleEmailTextChange = (newText: string) => {
    setCurrentEmail(newText);
    if (onUpdate) {
      onUpdate({ contactEmail: newText });
    }
  };

  const handleSocialTextChange = (newText: string) => {
    setCurrentSocial(newText);
    if (onUpdate) {
      onUpdate({ contactSocial: newText });
    }
  };

  const handlePhoneTextChange = (newText: string) => {
    setCurrentPhone(newText);
    if (onUpdate) {
      onUpdate({ contactPhone: newText });
    }
  };

  const handlePhone2TextChange = (newText: string) => {
    setCurrentPhone2(newText);
    if (onUpdate) {
      onUpdate({ contactPhone2: newText });
    }
  };

  const handleCityTextChange = (newText: string) => {
    setCurrentCity(newText);
    if (onUpdate) {
      onUpdate({ contactCity: newText });
    }
  };

  const handleCountryTextChange = (newText: string) => {
    setCurrentCountry(newText);
    if (onUpdate) {
      onUpdate({ contactCountry: newText });
    }
  };

  const handleWebsiteTextChange = (newText: string) => {
    setCurrentWebsite(newText);
    if (onUpdate) {
      onUpdate({ contactWebsite: newText });
    }
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
    if (titleSelectionHandlers.handleTitleDelete) {
      titleSelectionHandlers.handleTitleDelete();
    }
  };

  const handleTitleSizeChange = (newTransform: any) => {
    titleSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  // Custom drag handlers
  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (titleSelectionHandlers.handleTitleDragStart) {
      titleSelectionHandlers.handleTitleDragStart(e, element);
    }
  };

  // Track previous dragging states
  const prevDraggingRef = useRef({
    isTitleDragging: false
  });

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      const transform = activeTarget === 'title' 
        ? titleSelectionState.titleTransform 
        : null;
      
      const isDragging = activeTarget === 'title'
        ? titleSelectionState.isTitleDragging
        : false;

      const wasDragging = activeTarget === 'title'
        ? prevDraggingRef.current.isTitleDragging
        : false;
      
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
      isTitleDragging: titleSelectionState.isTitleDragging
    };
  }, [
    titleSelectionState.titleTransform, 
    titleSelectionState.isTitleDragging,
    textPopupState.isOpen, 
    textPopupState.targetElement,
    textPopupState.lastTargetElement
  ]);

  // Global click outside handler to deselect all
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.logo-layer') ||
                          target.closest('.email-layer') ||
                          target.closest('.social-layer') ||
                          target.closest('.phone-layer') ||
                          target.closest('.phone2-layer') ||
                          target.closest('.location-layer') ||
                          target.closest('.website-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      return;
    }
    
    logoHandlers.handleClickOutside();
    imageHandlers.handleClickOutside();
    titleSelectionHandlers.handleClickOutside();
    emailSelectionHandlers.handleClickOutside();
    socialSelectionHandlers.handleClickOutside();
    phoneSelectionHandlers.handleClickOutside();
    phone2SelectionHandlers.handleClickOutside();
    locationSelectionHandlers.handleClickOutside();
    websiteSelectionHandlers.handleClickOutside();
    setTextPopupState(prev => ({ 
      ...prev, 
      targetElement: null
    }));
  };

  // Function to deselect all other text elements when one is selected
  const deselectAllOtherElements = (exceptElement: 'title' | 'email' | 'social' | 'phone' | 'phone2' | 'city' | 'website') => {
    if (exceptElement !== 'title') titleSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'email') emailSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'social') socialSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'phone') phoneSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'phone2') phone2SelectionHandlers.handleClickOutside();
    if (exceptElement !== 'city') locationSelectionHandlers.handleClickOutside();
    if (exceptElement !== 'website') websiteSelectionHandlers.handleClickOutside();
  };

  // Fixed canvas dimensions - no responsive behavior to prevent layout shifts
  const containerStyle = {
    // Fixed canvas size - never changes regardless of content
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    // CRITICAL: Allow internal overflow but let parent clip
    overflow: 'visible',
    contain: 'layout style',
    // Prevent any size calculations from affecting ancestors
    flexShrink: 0,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    position: 'relative'
  };

  // Base classes for back cover layout with fixed constraints
  const containerClasses = `back-cover-thank-you-with-image relative ${className}`;

  // Generate unique ID for accessibility
  const headingId = `back-cover-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  const content = (
    <div 
      className={containerClasses}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={(e) => handleGlobalClickOutside(e)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Logo Layer - Independent overlay */}
              {layout.showLogo && (
        <div 
          className="logo-layer absolute pointer-events-auto"
          style={{
            left: '48px',
            top: '47%',
            zIndex: 10,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute'
          }}
        >
                  <FigmaLogo
                    src={logoUrl}
                    alt={logoAlt}
                    size="custom"
                    fit="contain"
                    align="left"
                    className="w-24 h-6 object-contain"
                    containerClassName="w-24 h-6"
                    state={logoState}
                    handlers={logoHandlers}
                  />
                </div>
              )}

      {/* Title Layer - Independent overlay */}
              {layout.showTitle && (
        <div 
          className="title-layer absolute pointer-events-auto"
          style={{
            left: titleAlignmentState === 'center' 
              ? '25%' 
              : titleAlignmentState === 'right'
              ? 'calc(50% - 48px)' 
              : '48px',
            top: layout.showLogo ? '55%' : '52%',
            transform: titleAlignmentState === 'center' ? 'translateX(-50%)' : titleAlignmentState === 'right' ? 'translateX(-100%)' : 'none',
            width: 'auto',
            zIndex: 10,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute'
          }}
                >
                  <FigmaText
                    variant="title"
                    color={currentTitleColor}
                    align={titleAlignmentState}
                    fontFamily={titleFontFamilyState}
                    className={`text-4xl lg:text-5xl xl:text-6xl font-normal leading-none tracking-tight font-helvetica-neue ${titleAlignmentState === 'left' ? 'text-left' : titleAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                    isSelected={titleSelectionState.isTitleSelected}
                    transform={titleSelectionState.titleTransform}
                    onDragStart={titleSelectionHandlers.handleTitleDragStart}
                    onResizeStart={titleSelectionHandlers.handleTitleResizeStart}
                    onClick={titleSelectionHandlers.handleTitleClick}
                    style={{
                      fontSize: `${titleFontSizeState}px`,
                      color: currentTitleColor,
                      textAlign: titleAlignmentState as 'left' | 'center' | 'right',
                      lineHeight: '0.9',
                      letterSpacing: '-0.05em',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    isSelected={titleSelectionState.isTitleSelected}
                    transform={titleSelectionState.titleTransform}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements('title');
                      titleSelectionHandlers.handleTitleClick(e);
                    }}
                    onTextChange={handleTitleTextChange}
                    onSizeChange={handleTitleSizeChange}
                    onChangeSize={handleTitleChangeSize}
                    onChangeFont={handleTitleChangeFont}
                    onDragStart={handleTitleDragStart}
                    onResizeStart={titleSelectionHandlers.handleTitleResizeStart}
                    onDeleteText={handleTitleDelete}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      const titleElement = document.querySelector('.back-cover-thank-you-with-image .title-layer');
                      if (titleElement) {
                        const titleRect = titleElement.getBoundingClientRect();
                        const canvasContainer = titleElement.closest('.back-cover-thank-you-with-image') as HTMLElement;
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
      
      {/* Contact Information Layer - Independent overlay */}
      {layout.showContact && (
        <div 
          className="contact-section absolute pointer-events-auto"
          style={{
            left: '48px',
            width: 'calc(50% - 96px)',
            bottom: '48px',
            zIndex: 10,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute'
          }}
        >
            <div className="flex flex-wrap justify-between lg:justify-start gap-4 lg:gap-5">
              {/* Email & Social */}
              {(currentEmail || currentSocial) && (
                <div className="space-y-2 w-auto lg:w-auto">
                  {currentEmail && (
                    <div className="email-layer pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
                      <FigmaText
                        variant="body"
                        color={currentContactColor}
                        align={contactAlignmentState}
                        fontFamily={contactFontFamilyState}
                        className={`text-xs font-normal font-helvetica-neue leading-relaxed ${contactAlignmentState === 'left' ? 'text-left' : contactAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                        style={{
                          fontSize: `${contactFontSizeState}px`,
                          color: currentContactColor,
                          textAlign: contactAlignmentState,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        isSelected={emailSelectionState.isTitleSelected}
                        transform={emailSelectionState.titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('email');
                          emailSelectionHandlers.handleTitleClick(e);
                        }}
                        onSizeChange={(newTransform: any) => emailSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          if (emailSelectionHandlers.handleTitleDragStart) {
                            emailSelectionHandlers.handleTitleDragStart(e, element);
                          }
                        }}
                        onResizeStart={emailSelectionHandlers.handleTitleResizeStart}
                        onDeleteText={() => {
                          setCurrentEmail('');
                          if (onUpdate) {
                            onUpdate({ contactEmail: '' });
                          }
                          if (emailSelectionHandlers.handleTitleDelete) {
                            emailSelectionHandlers.handleTitleDelete();
                          }
                        }}
                        onTextChange={handleEmailTextChange}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const emailElement = document.querySelector('.back-cover-thank-you-with-image .email-layer');
                          if (emailElement) {
                            const emailRect = emailElement.getBoundingClientRect();
                            const canvasContainer = emailElement.closest('.back-cover-thank-you-with-image') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (emailRect.left - canvasRect.left) - 10;
                              const relativeY = (emailRect.top - canvasRect.top) - 60; // Position above the text
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: 'email',
                                lastTargetElement: 'email'
                              });
                            }
                          } else {
                            setTextPopupState({
                              isOpen: true,
                              position: { x: position.x, y: position.y - 60 },
                              originalPosition: { x: position.x, y: position.y - 60 },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'email',
                              lastTargetElement: 'email'
                            });
                          }
                        }}>
                        {currentEmail}
                      </FigmaText>
                    </div>
                  )}
                  {currentSocial && (
                    <div className="social-layer pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
                      <FigmaText
                        variant="body"
                        color={currentContactColor}
                        align={contactAlignmentState}
                        fontFamily={contactFontFamilyState}
                        className={`text-xs font-normal font-helvetica-neue leading-relaxed ${contactAlignmentState === 'left' ? 'text-left' : contactAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                        style={{
                          fontSize: `${contactFontSizeState}px`,
                          color: currentContactColor,
                          textAlign: contactAlignmentState,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        isSelected={socialSelectionState.isTitleSelected}
                        transform={socialSelectionState.titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('social');
                          socialSelectionHandlers.handleTitleClick(e);
                        }}
                        onSizeChange={(newTransform: any) => socialSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          if (socialSelectionHandlers.handleTitleDragStart) {
                            socialSelectionHandlers.handleTitleDragStart(e, element);
                          }
                        }}
                        onResizeStart={socialSelectionHandlers.handleTitleResizeStart}
                        onDeleteText={() => {
                          setCurrentSocial('');
                          if (onUpdate) {
                            onUpdate({ contactSocial: '' });
                          }
                          if (socialSelectionHandlers.handleTitleDelete) {
                            socialSelectionHandlers.handleTitleDelete();
                          }
                        }}
                        onTextChange={handleSocialTextChange}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const socialElement = document.querySelector('.back-cover-thank-you-with-image .social-layer');
                          if (socialElement) {
                            const socialRect = socialElement.getBoundingClientRect();
                            const canvasContainer = socialElement.closest('.back-cover-thank-you-with-image') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (socialRect.left - canvasRect.left) - 10;
                              const relativeY = (socialRect.top - canvasRect.top) - 60; // Position above the text
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: 'social',
                                lastTargetElement: 'social'
                              });
                            }
                          } else {
                            setTextPopupState({
                              isOpen: true,
                              position: { x: position.x, y: position.y - 60 },
                              originalPosition: { x: position.x, y: position.y - 60 },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'social',
                              lastTargetElement: 'social'
                            });
                          }
                        }}>
                        {currentSocial}
                      </FigmaText>
                    </div>
                  )}
                </div>
              )}

              {/* Phone */}
              {(currentPhone || currentPhone2) && (
                <div className="w-auto lg:w-auto">
                  {currentPhone && (
                    <div className="phone-layer pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
                      <FigmaText
                        variant="body"
                        color={currentContactColor}
                        align={contactAlignmentState}
                        fontFamily={contactFontFamilyState}
                        className={`text-xs font-normal font-helvetica-neue leading-relaxed ${contactAlignmentState === 'left' ? 'text-left' : contactAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                        style={{
                          fontSize: `${contactFontSizeState}px`,
                          color: currentContactColor,
                          textAlign: contactAlignmentState,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        isSelected={phoneSelectionState.isTitleSelected}
                        transform={phoneSelectionState.titleTransform}
                        onClick={(e: React.MouseEvent) => {
                          deselectAllOtherElements('phone');
                          phoneSelectionHandlers.handleTitleClick(e);
                        }}
                        onSizeChange={(newTransform: any) => phoneSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                        onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                          if (phoneSelectionHandlers.handleTitleDragStart) {
                            phoneSelectionHandlers.handleTitleDragStart(e, element);
                          }
                        }}
                        onResizeStart={phoneSelectionHandlers.handleTitleResizeStart}
                        onDeleteText={() => {
                          setCurrentPhone('');
                          if (onUpdate) {
                            onUpdate({ contactPhone: '' });
                          }
                          if (phoneSelectionHandlers.handleTitleDelete) {
                            phoneSelectionHandlers.handleTitleDelete();
                          }
                        }}
                        onTextChange={handlePhoneTextChange}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const phoneElement = document.querySelector('.back-cover-thank-you-with-image .phone-layer');
                          if (phoneElement) {
                            const phoneRect = phoneElement.getBoundingClientRect();
                            const canvasContainer = phoneElement.closest('.back-cover-thank-you-with-image') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (phoneRect.left - canvasRect.left) - 10;
                              const relativeY = (phoneRect.top - canvasRect.top) - 60; // Position above the text
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: 'phone',
                                lastTargetElement: 'phone'
                              });
                            }
                          } else {
                            setTextPopupState({
                              isOpen: true,
                              position: { x: position.x, y: position.y - 60 },
                              originalPosition: { x: position.x, y: position.y - 60 },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: 'phone',
                              lastTargetElement: 'phone'
                            });
                          }
                        }}>
                        {currentPhone}
                      </FigmaText>
                    </div>
                  )}
                   {currentPhone2 && (
                     <div className="phone2-layer pointer-events-auto" style={{ position: 'relative', zIndex: 10, marginTop: '8px' }}>
                       <FigmaText
                         variant="body"
                         color={currentContactColor}
                         align={contactAlignmentState}
                         fontFamily={contactFontFamilyState}
                         className={`text-xs font-normal font-helvetica-neue leading-relaxed ${contactAlignmentState === 'left' ? 'text-left' : contactAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                         style={{
                           fontSize: `${contactFontSizeState}px`,
                           color: currentContactColor,
                           textAlign: contactAlignmentState,
                           wordWrap: 'break-word',
                           overflowWrap: 'break-word',
                           whiteSpace: 'normal'
                         }}
                         isSelected={phone2SelectionState.isTitleSelected}
                         transform={phone2SelectionState.titleTransform}
                         onClick={(e: React.MouseEvent) => {
                           deselectAllOtherElements('phone2');
                           phone2SelectionHandlers.handleTitleClick(e);
                         }}
                         onSizeChange={(newTransform: any) => phone2SelectionHandlers.handleTitleSizeChange?.(newTransform)}
                         onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                           if (phone2SelectionHandlers.handleTitleDragStart) {
                             phone2SelectionHandlers.handleTitleDragStart(e, element);
                           }
                         }}
                         onResizeStart={phone2SelectionHandlers.handleTitleResizeStart}
                         onDeleteText={() => {
                           setCurrentPhone2('');
                           if (onUpdate) {
                             onUpdate({ contactPhone2: '' });
                           }
                           if (phone2SelectionHandlers.handleTitleDelete) {
                             phone2SelectionHandlers.handleTitleDelete();
                           }
                         }}
                         onTextChange={handlePhone2TextChange}
                         onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                           const phone2Element = document.querySelector('.back-cover-thank-you-with-image .phone2-layer');
                           if (phone2Element) {
                             const phone2Rect = phone2Element.getBoundingClientRect();
                             const canvasContainer = phone2Element.closest('.back-cover-thank-you-with-image') as HTMLElement;
                             if (canvasContainer) {
                               const canvasRect = canvasContainer.getBoundingClientRect();
                               const relativeX = (phone2Rect.left - canvasRect.left) - 10;
                               const relativeY = (phone2Rect.top - canvasRect.top) - 60; // Position above the text
                               
                               setTextPopupState({
                                 isOpen: true,
                                 position: { x: relativeX, y: relativeY },
                                 originalPosition: { x: relativeX, y: relativeY },
                                 currentFontSize: fontSize,
                                 currentFontFamily: fontFamily,
                                 targetElement: 'phone2',
                                 lastTargetElement: 'phone2'
                               });
                             }
                           } else {
                             setTextPopupState({
                               isOpen: true,
                               position: { x: position.x, y: position.y - 60 },
                               originalPosition: { x: position.x, y: position.y - 60 },
                               currentFontSize: fontSize,
                               currentFontFamily: fontFamily,
                               targetElement: 'phone2',
                               lastTargetElement: 'phone2'
                             });
                           }
                         }}>
                         {currentPhone2}
                       </FigmaText>
                     </div>
                   )}
                </div>
              )}

               {/* Location */}
               {(currentCity || currentCountry || currentWebsite) && (
                 <div className="space-y-2 w-auto lg:w-auto -mt-1">
                   {(currentCity || currentCountry) && (
                     <div className="location-layer pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
                       <FigmaText
                         variant="body"
                         color={currentContactColor}
                         align={contactAlignmentState}
                         fontFamily={contactFontFamilyState}
                         className={`text-xs font-normal font-helvetica-neue leading-relaxed ${contactAlignmentState === 'left' ? 'text-left' : contactAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                         style={{
                           fontSize: `${contactFontSizeState}px`,
                           color: currentContactColor,
                           textAlign: contactAlignmentState,
                           wordWrap: 'break-word',
                           overflowWrap: 'break-word',
                           whiteSpace: 'normal'
                         }}
                         isSelected={locationSelectionState.isTitleSelected}
                         transform={locationSelectionState.titleTransform}
                         onClick={(e: React.MouseEvent) => {
                           deselectAllOtherElements('city');
                           locationSelectionHandlers.handleTitleClick(e);
                         }}
                         onSizeChange={(newTransform: any) => locationSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                         onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                           if (locationSelectionHandlers.handleTitleDragStart) {
                             locationSelectionHandlers.handleTitleDragStart(e, element);
                           }
                         }}
                         onResizeStart={locationSelectionHandlers.handleTitleResizeStart}
                         onDeleteText={() => {
                           setCurrentCity('');
                           setCurrentCountry('');
                           if (onUpdate) {
                             onUpdate({ contactCity: '', contactCountry: '' });
                           }
                           if (locationSelectionHandlers.handleTitleDelete) {
                             locationSelectionHandlers.handleTitleDelete();
                           }
                         }}
                         onTextChange={(newText: string) => {
                           // Split the text by comma to handle city and country
                           const parts = newText.split(',');
                           if (parts.length >= 2) {
                             setCurrentCity(parts[0].trim());
                             setCurrentCountry(parts[1].trim());
                             if (onUpdate) {
                               onUpdate({ 
                                 contactCity: parts[0].trim(),
                                 contactCountry: parts[1].trim()
                               });
                             }
                           } else {
                             setCurrentCity(newText);
                             if (onUpdate) {
                               onUpdate({ contactCity: newText });
                             }
                           }
                         }}
                         onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                           const locationElement = document.querySelector('.back-cover-thank-you-with-image .location-layer');
                           if (locationElement) {
                             const locationRect = locationElement.getBoundingClientRect();
                             const canvasContainer = locationElement.closest('.back-cover-thank-you-with-image') as HTMLElement;
                             if (canvasContainer) {
                               const canvasRect = canvasContainer.getBoundingClientRect();
                               const relativeX = (locationRect.left - canvasRect.left) - 10;
                               const relativeY = (locationRect.top - canvasRect.top) - 60; // Position above the text
                               
                               setTextPopupState({
                                 isOpen: true,
                                 position: { x: relativeX, y: relativeY },
                                 originalPosition: { x: relativeX, y: relativeY },
                                 currentFontSize: fontSize,
                                 currentFontFamily: fontFamily,
                                 targetElement: 'city',
                                 lastTargetElement: 'city'
                               });
                             }
                           } else {
                             setTextPopupState({
                               isOpen: true,
                               position: { x: position.x, y: position.y - 60 },
                               originalPosition: { x: position.x, y: position.y - 60 },
                               currentFontSize: fontSize,
                               currentFontFamily: fontFamily,
                               targetElement: 'city',
                               lastTargetElement: 'city'
                             });
                           }
                         }}>
                         {currentCity}{currentCity && currentCountry ? ', ' : ''}{currentCountry}
                       </FigmaText>
                     </div>
                   )}
                   {currentWebsite && (
                     <div className="website-layer pointer-events-auto" style={{ position: 'relative', zIndex: 10 }}>
                       <FigmaText
                         variant="body"
                         color={currentContactColor}
                         align={contactAlignmentState}
                         fontFamily={contactFontFamilyState}
                         className={`text-xs font-normal font-helvetica-neue leading-relaxed ${contactAlignmentState === 'left' ? 'text-left' : contactAlignmentState === 'center' ? 'text-center' : 'text-right'} break-words`}
                         style={{
                           fontSize: `${contactFontSizeState}px`,
                           color: currentContactColor,
                           textAlign: contactAlignmentState,
                           wordWrap: 'break-word',
                           overflowWrap: 'break-word',
                           whiteSpace: 'normal'
                         }}
                         isSelected={websiteSelectionState.isTitleSelected}
                         transform={websiteSelectionState.titleTransform}
                         onClick={(e: React.MouseEvent) => {
                           deselectAllOtherElements('website');
                           websiteSelectionHandlers.handleTitleClick(e);
                         }}
                         onSizeChange={(newTransform: any) => websiteSelectionHandlers.handleTitleSizeChange?.(newTransform)}
                         onDragStart={(e: React.MouseEvent, element: HTMLElement) => {
                           if (websiteSelectionHandlers.handleTitleDragStart) {
                             websiteSelectionHandlers.handleTitleDragStart(e, element);
                           }
                         }}
                         onResizeStart={websiteSelectionHandlers.handleTitleResizeStart}
                         onDeleteText={() => {
                           setCurrentWebsite('');
                           if (onUpdate) {
                             onUpdate({ contactWebsite: '' });
                           }
                           if (websiteSelectionHandlers.handleTitleDelete) {
                             websiteSelectionHandlers.handleTitleDelete();
                           }
                         }}
                         onTextChange={handleWebsiteTextChange}
                         onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                           const websiteElement = document.querySelector('.back-cover-thank-you-with-image .website-layer');
                           if (websiteElement) {
                             const websiteRect = websiteElement.getBoundingClientRect();
                             const canvasContainer = websiteElement.closest('.back-cover-thank-you-with-image') as HTMLElement;
                             if (canvasContainer) {
                               const canvasRect = canvasContainer.getBoundingClientRect();
                               const relativeX = (websiteRect.left - canvasRect.left) - 10;
                               const relativeY = (websiteRect.top - canvasRect.top) - 60; // Position above the text
                               
                               setTextPopupState({
                                 isOpen: true,
                                 position: { x: relativeX, y: relativeY },
                                 originalPosition: { x: relativeX, y: relativeY },
                                 currentFontSize: fontSize,
                                 currentFontFamily: fontFamily,
                                 targetElement: 'website',
                                 lastTargetElement: 'website'
                               });
                             }
                           } else {
                             setTextPopupState({
                               isOpen: true,
                               position: { x: position.x, y: position.y - 60 },
                               originalPosition: { x: position.x, y: position.y - 60 },
                               currentFontSize: fontSize,
                               currentFontFamily: fontFamily,
                               targetElement: 'website',
                               lastTargetElement: 'website'
                             });
                           }
                         }}>
                         {currentWebsite}
                       </FigmaText>
                 </div>
               )}
            </div>
            )}
          </div>
        </div>
      )}

      {/* Image Layer - Independent overlay */}
        {layout.showImage && (
        <div 
          className="image-layer absolute pointer-events-auto"
          style={{
            top: '0', 
            right: '0', 
            width: '50%',
            height: '100%',
            zIndex: 5,
            overflow: 'visible',
            contain: 'none',
            position: 'absolute'
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
              className="absolute inset-0 w-full h-full object-cover shadow-none rounded-none"
              containerClassName="absolute inset-0 w-full h-full"
              state={imageState}
              handlers={imageHandlers}
            />
          </div>
        )}
      </div>
  );

  // Always use fixed dimensions with CanvasOverlay for layout constraints
  return (
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
            } else {
              handleContactChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else {
              handleContactChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else {
              handleContactChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else {
              handleContactChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentContactColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? titleAlignmentState as 'left' | 'center' | 'right' : contactAlignmentState as 'left' | 'center' | 'right'}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'email') {
              setCurrentEmail('');
              if (onUpdate) {
                onUpdate({ contactEmail: '' });
              }
              if (emailSelectionHandlers.handleTitleDelete) {
                emailSelectionHandlers.handleTitleDelete();
              }
            } else if (target === 'social') {
              setCurrentSocial('');
              if (onUpdate) {
                onUpdate({ contactSocial: '' });
              }
              if (socialSelectionHandlers.handleTitleDelete) {
                socialSelectionHandlers.handleTitleDelete();
              }
            } else if (target === 'phone') {
              setCurrentPhone('');
              if (onUpdate) {
                onUpdate({ contactPhone: '' });
              }
              if (phoneSelectionHandlers.handleTitleDelete) {
                phoneSelectionHandlers.handleTitleDelete();
              }
            } else if (target === 'phone2') {
              setCurrentPhone2('');
              if (onUpdate) {
                onUpdate({ contactPhone2: '' });
              }
              if (phone2SelectionHandlers.handleTitleDelete) {
                phone2SelectionHandlers.handleTitleDelete();
              }
            } else if (target === 'city') {
              setCurrentCity('');
              setCurrentCountry('');
              if (onUpdate) {
                onUpdate({ contactCity: '', contactCountry: '' });
              }
              if (locationSelectionHandlers.handleTitleDelete) {
                locationSelectionHandlers.handleTitleDelete();
              }
            } else if (target === 'website') {
              setCurrentWebsite('');
              if (onUpdate) {
                onUpdate({ contactWebsite: '' });
              }
              if (websiteSelectionHandlers.handleTitleDelete) {
                websiteSelectionHandlers.handleTitleDelete();
              }
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  );
}

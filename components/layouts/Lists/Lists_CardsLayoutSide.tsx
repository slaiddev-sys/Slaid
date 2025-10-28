import React, { useState, useEffect, useRef } from 'react';
import { FigmaText, FigmaLogo, TextPopup, useFigmaSelection } from '../../figma';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';
import IconBlock from '../../blocks/IconBlock';
import type { ImageBlockProps } from '../../blocks/ImageBlock';

export interface ListsCardsLayoutSideProps {
  /**
   * Main title for the section (appears on the left)
   */
  title?: string;
  
  /**
   * Description text that appears on the left below title
   */
  description?: string;
  
  /**
   * Array of cards to display on the right (2-4 cards)
   */
  cards?: {
    icon: string;
    title: string;
    description: string;
  }[];
  
  /**
   * Layout configuration
   */
  layout?: {
    /**
     * Show/hide title section
     */
    showTitle?: boolean;
    /**
     * Show/hide description
     */
    showDescription?: boolean;
    /**
     * Show/hide cards
     */
    showCards?: boolean;
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
   * Description text color
   */
  descriptionColor?: string;
  
  /**
   * Card title text color
   */
  cardTitleColor?: string;
  
  /**
   * Card description text color
   */
  cardDescriptionColor?: string;
  
  /**
   * Background color for the entire layout
   */
  backgroundColor?: string;
  
  /**
   * Canvas dimensions for fixed layouts
   */
  canvasWidth?: number;
  canvasHeight?: number;
  useFixedDimensions?: boolean;
  
  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Title font size
   */
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  
  /**
   * Description font styling
   */
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  
  /**
   * Transform props for positioning
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  
  /**
   * Saved font styling props
   */
  savedTitleFontSize?: number;
  savedTitleFontFamily?: string;
  savedTitleAlignment?: 'left' | 'center' | 'right';
  savedDescriptionFontSize?: number;
  savedDescriptionFontFamily?: string;
  savedDescriptionAlignment?: 'left' | 'center' | 'right';

  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function Lists_CardsLayoutSide({
  title = 'How Savium works',
  description = 'Comprehensive suite of features designed to streamline your workflow and boost productivity.',
  cards = [
    {
      icon: 'Target',
      title: 'Goal-based planning',
      description: 'Set, track and achieve personal and business financial goals with ease.'
    },
    {
      icon: 'TrendingUp',
      title: 'Predictive analytics',
      description: 'Use data-driven insights to forecast cash flow and anticipate financial trends.'
    },
    {
      icon: 'DollarSign',
      title: 'Smart budgeting',
      description: 'Automatically organize income and expenses, giving every dollar a purpose.'
    },
    {
      icon: 'Shield',
      title: 'Secure management',
      description: 'Bank-level encryption and privacy standards ensure complete user trust.'
    }
  ],
  layout = {
    showTitle: true,
    showDescription: true,
    showCards: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  cardTitleColor = 'text-gray-900',
  cardDescriptionColor = 'text-gray-600',
  backgroundColor = 'bg-white',
  canvasWidth = 1280,
  canvasHeight = 720,
  useFixedDimensions = false,
  className = '',
  titleFontSize = 48,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  savedTitleFontSize,
  savedTitleFontFamily,
  savedTitleAlignment,
  savedDescriptionFontSize,
  savedDescriptionFontFamily,
  savedDescriptionAlignment
}: ListsCardsLayoutSideProps) {

  // State management for text content and styling
  const [currentTitle, setCurrentTitle] = useState(title || '');
  const [currentDescription, setCurrentDescription] = useState(description || '');
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor || 'text-gray-900');
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor || 'text-gray-600');
  
  // Font styling states
  const [titleFontSizeState, setTitleFontSizeState] = useState(savedTitleFontSize || titleFontSize || 48);
  const [titleFontFamilyState, setTitleFontFamilyState] = useState(savedTitleFontFamily || titleFontFamily || 'font-helvetica-neue');
  const [titleAlignmentState, setTitleAlignmentState] = useState(savedTitleAlignment || titleAlignment || 'left');
  const [descriptionFontSizeState, setDescriptionFontSizeState] = useState(savedDescriptionFontSize || descriptionFontSize || 10);
  const [descriptionFontFamilyState, setDescriptionFontFamilyState] = useState(savedDescriptionFontFamily || descriptionFontFamily || 'font-helvetica-neue');
  const [descriptionAlignmentState, setDescriptionAlignmentState] = useState(savedDescriptionAlignment || descriptionAlignment || 'left');

  // Use Figma selection hook for text elements
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });

  // Text change handlers
  const handleTitleTextChange = (newText: string) => {
    setCurrentTitle(newText);
    if (onUpdate) {
      onUpdate({ title: newText });
    }
  };

  const handleDescriptionTextChange = (newText: string) => {
    setCurrentDescription(newText);
    if (onUpdate) {
      onUpdate({ description: newText });
    }
  };

  // Font styling change handlers
  const handleTitleChangeSize = (fontSize: number) => {
    setTitleFontSizeState(fontSize);
    if (onUpdate) {
      onUpdate({ titleFontSize: fontSize });
    }
  };

  const handleTitleChangeFont = (fontFamily: string) => {
    setTitleFontFamilyState(fontFamily);
    if (onUpdate) {
      onUpdate({ titleFontFamily: fontFamily });
    }
  };

  const handleDescriptionChangeSize = (fontSize: number) => {
    setDescriptionFontSizeState(fontSize);
    if (onUpdate) {
      onUpdate({ descriptionFontSize: fontSize });
    }
  };

  const handleDescriptionChangeFont = (fontFamily: string) => {
    setDescriptionFontFamilyState(fontFamily);
    if (onUpdate) {
      onUpdate({ descriptionFontFamily: fontFamily });
    }
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (onUpdate) {
      onUpdate({ title: '' });
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (onUpdate) {
      onUpdate({ description: '' });
    }
  };

  const containerClasses = useFixedDimensions
    ? `lists-cards-layout-side px-6 lg:px-12 pt-8 lg:pt-10 pb-6 lg:pb-8 ${backgroundColor} ${className}`
    : `lists-cards-layout-side px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 ${backgroundColor} w-full h-full min-h-[400px] ${className}`;

  const containerStyle = useFixedDimensions
    ? {
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        maxWidth: `${canvasWidth}px`,
        maxHeight: `${canvasHeight}px`,
        minWidth: `${canvasWidth}px`,
        minHeight: `${canvasHeight}px`,
      }
    : {};

  const content = (
    <div 
      className={containerClasses}
      style={containerStyle}
    >
      <div className="flex flex-col lg:flex-row lg:items-start h-full">
        
        {/* Left Column - Title and Description */}
        <div className="flex-1 lg:pr-12 flex items-end pb-8">
          <div className="w-full">
          {/* Title */}
          {layout.showTitle && currentTitle && (
            <div className="mb-4 lg:mb-6">
              <FigmaText
                variant="title"
                color={currentTitleColor}
                fontFamily={titleFontFamilyState}
                style={{ 
                  fontSize: `${titleFontSizeState}px`, 
                  textAlign: titleAlignmentState,
                  color: currentTitleColor
                }}
                isSelected={textSelectionState.isTitleSelected}
                transform={textSelectionState.titleTransform}
                onClick={textSelectionHandlers.handleTitleClick}
                onTextChange={handleTitleTextChange}
                onChangeSize={handleTitleChangeSize}
                onChangeFont={handleTitleChangeFont}
                onDragStart={textSelectionHandlers.handleTitleDragStart}
                onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                onDeleteText={handleTitleDelete}
              >
                {currentTitle}
              </FigmaText>
            </div>
          )}

          {/* Description */}
          {layout.showDescription && currentDescription && (
            <div className="mb-8 lg:mb-0">
              <FigmaText
                variant="body"
                color={currentDescriptionColor}
                fontFamily={descriptionFontFamilyState}
                style={{ 
                  fontSize: `${descriptionFontSizeState}px`, 
                  textAlign: descriptionAlignmentState,
                  color: currentDescriptionColor,
                  lineHeight: '1.5',
                  maxWidth: '320px'
                }}
                className="leading-relaxed break-words"
                isSelected={textSelectionState.isDescriptionSelected}
                transform={textSelectionState.descriptionTransform}
                onClick={textSelectionHandlers.handleDescriptionClick}
                onTextChange={handleDescriptionTextChange}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                onDragStart={textSelectionHandlers.handleDescriptionDragStart}
                onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                onDeleteText={handleDescriptionDelete}
              >
                {currentDescription}
              </FigmaText>
            </div>
          )}
          </div>
        </div>

        {/* Right Column - Cards */}
        {layout.showCards && cards && cards.length > 0 && (() => {
          const cardCount = Math.min(Math.max(cards.length, 2), 4); // Clamp between 2-4
          const validCards = cards.slice(0, 4); // Take only first 4 cards
          
          // Dynamic grid layout based on card count
          const getGridLayout = (count: number) => {
            switch (count) {
              case 2: return 'grid-cols-1 grid-rows-2';
              case 3: return 'grid-cols-1 grid-rows-3';
              case 4: return 'grid-cols-2 grid-rows-2';
              default: return 'grid-cols-2 grid-rows-2';
            }
          };
          
          // Dynamic sizing based on card count
          const getSizing = (count: number) => {
            switch (count) {
              case 2: return {
                padding: 'p-6 lg:p-8',
                gap: 'gap-4 lg:gap-6',
                iconSize: 'lg',
                titleSize: '16px',
                descriptionSize: '10px',
                spacing: 'space-y-3'
              };
              case 3: return {
                padding: 'p-5 lg:p-6',
                gap: 'gap-3 lg:gap-4',
                iconSize: 'md',
                titleSize: '14px',
                descriptionSize: '10px',
                spacing: 'space-y-2'
              };
              case 4: return {
                padding: 'p-4 lg:p-5',
                gap: 'gap-3 lg:gap-4',
                iconSize: 'sm',
                titleSize: '12px',
                descriptionSize: '10px',
                spacing: 'space-y-2'
              };
              default: return {
                padding: 'p-4 lg:p-5',
                gap: 'gap-3 lg:gap-4',
                iconSize: 'sm',
                titleSize: '12px',
                descriptionSize: '10px',
                spacing: 'space-y-2'
              };
            }
          };

          const gridLayout = getGridLayout(cardCount);
          const sizing = getSizing(cardCount);

          return (
            <div className="flex-1 lg:max-w-md">
              <div className={`grid ${gridLayout} ${sizing.gap}`}>
                {validCards.map((card, index) => (
                  <div
                    key={index}
                    className={`rounded-xl ${sizing.padding}`}
                    style={{ backgroundColor: '#f3f4f6' }}>
          {/* Icon */}
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <IconBlock
                          iconName={card.icon as any}
                          size={sizing.iconSize as any}
                          color="#374151"
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className={sizing.spacing}>
                      {/* Title */}
                      <h3 className="font-medium text-gray-900 font-helvetica-neue leading-tight" style={{ fontSize: sizing.titleSize }}>
          {card.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 font-helvetica-neue leading-relaxed" style={{ fontSize: sizing.descriptionSize }}>
          {card.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );

  return (
    <CanvasOverlayProvider>
      {content}
    </CanvasOverlayProvider>
  );
}

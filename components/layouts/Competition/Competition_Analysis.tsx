import React, { useState, useEffect, useRef } from 'react';
import TextBlock from '../../blocks/TextBlock';
import ImageBlock from '../../blocks/ImageBlock';
import { useFigmaSelection, FigmaImage, FigmaText } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface CompetitionAnalysisProps {
  /**
   * Main title for the competition analysis
   */
  title?: string;
  
  /**
   * Description text that appears on the right side
   */
  description?: string;
  
  /**
   * Competition analysis data
   */
  competitionData?: {
    headerText?: string;
    features: string[];
    ourProduct: {
      name: string;
      values: string[];
    };
    competitors: {
      name: string;
      values: string[];
    }[];
  };
  
  /**
   * Layout configuration
   */
  layout?: {
    /**
     * Column proportions [left, right] - must add up to 12
     */
    columnSizes?: [number, number];
    /**
     * Show/hide title section
     */
    showTitle?: boolean;
    /**
     * Show/hide description
     */
    showDescription?: boolean;
    /**
     * Show/hide competition table
     */
    showTable?: boolean;
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
   * Our logo URL
   */
  ourLogoUrl?: string;
  
  /**
   * Competitor logo URLs
   */
  competitor1LogoUrl?: string;
  competitor2LogoUrl?: string;
  competitor3LogoUrl?: string;
  competitor4LogoUrl?: string;
  competitor5LogoUrl?: string;

  /**
   * Styling props for persistence
   */
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  tableTextStyles?: {[key: string]: any};

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;

  /**
   * Saved text transforms for position persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };
  
  /**
   * Saved logo transforms for position persistence
   */
  ourLogoTransform?: { x: number; y: number };
  competitor1LogoTransform?: { x: number; y: number };
  competitor2LogoTransform?: { x: number; y: number };
  competitor3LogoTransform?: { x: number; y: number };
  competitor4LogoTransform?: { x: number; y: number };
  competitor5LogoTransform?: { x: number; y: number };
}

/**
 * Competition Analysis Layout
 * 
 * A two-column layout for competitive analysis with comparison table.
 * Left side shows title and competitive analysis table, right side shows description.
 */
export default function Competition_Analysis({
  title = 'Competitive Edge',
  description = 'Our CleanTech solution stands out from legacy systems and simple retrofits by excelling in cost, speed, and sustainability. Thanks to our unique AI optimization and modular design, we provide a competitive advantage that is both technically sound and commercially viable.',
  competitionData = {
    features: ['Upfront Cost', 'Implementation Speed', 'Sustainability Rating', 'ROI Timeline'],
    ourProduct: {
      name: 'Our Solution',
      values: ['Low', 'Fast', 'High', '6 months']
    },
    competitors: [
      {
        name: 'Competitor A',
        values: ['Medium', 'Medium', 'Medium', '12 months']
      },
      {
        name: 'Competitor B', 
        values: ['High', 'Slow', 'Low', '18 months']
      }
    ]
  },
  layout = {
    columnSizes: [6, 6],
    showTitle: true,
    showDescription: true,
    showTable: true
  },
  fontFamily = 'font-helvetica-neue',
  titleColor = 'text-gray-900',
  descriptionColor = 'text-gray-600',
  titleFontSize = 32,
  titleFontFamily = 'font-helvetica-neue',
  titleAlignment = 'left',
  descriptionFontSize = 10,
  descriptionFontFamily = 'font-helvetica-neue',
  descriptionAlignment = 'left',
  tableTextStyles = {},
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  ourLogoUrl = '/logo-holder.png',
  competitor1LogoUrl = '/logo-holder.png',
  competitor2LogoUrl = '/logo-holder.png',
  competitor3LogoUrl = '/logo-holder.png',
  competitor4LogoUrl = '/logo-holder.png',
  competitor5LogoUrl = '/logo-holder.png',
  onUpdate,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  ourLogoTransform: savedOurLogoTransform,
  competitor1LogoTransform: savedCompetitor1LogoTransform,
  competitor2LogoTransform: savedCompetitor2LogoTransform,
  competitor3LogoTransform: savedCompetitor3LogoTransform,
  competitor4LogoTransform: savedCompetitor4LogoTransform,
  competitor5LogoTransform: savedCompetitor5LogoTransform
}: CompetitionAnalysisProps) {

  // Detect export mode from URL parameters
  const isExportMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('export') === 'true';

  // Simplified rendering for export mode
  if (isExportMode) {
    console.log('📄 Competition_Analysis: Rendering in export mode');
    
    const containerStyle = useFixedDimensions ? {
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`,
    } : {};

    return (
      <div 
        style={{
          ...containerStyle,
          backgroundColor: 'white',
          width: '100%',
          height: '100%'
        }}
      >
        <div style={{ display: 'flex', height: '100%', minHeight: '495px' }}>
          {/* Left Column - Title and Competition Table */}
          <div style={{ 
            width: '75%', 
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            {/* Title */}
            {layout.showTitle && title && (
              <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#111827',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '40px',
                margin: '0 0 40px 0',
                lineHeight: '1.1'
              }}>
                {title}
              </h1>
            )}
            
            {/* Competition Table */}
            {layout.showTable && competitionData && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  fontFamily: 'Arial, sans-serif',
                  margin: '0'
                }}>
                  <thead>
                    <tr style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb'
                    }}>
                      <th style={{
                        textAlign: 'left',
                        padding: '20px 16px',
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '14px',
                        fontFamily: 'Arial, sans-serif',
                        width: '30%'
                      }}>Feature / Value Driver</th>
                      <th style={{
                        textAlign: 'center',
                        padding: '16px 8px',
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '14px',
                        fontFamily: 'Arial, sans-serif',
                        width: '23.33%',
                        borderLeft: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            color: '#374151'
                          }}>⭐</div>
                          <span>Place Logo</span>
                        </div>
                      </th>
                      {competitionData.competitors.map((competitor, index) => (
                        <th key={index} style={{
                          textAlign: 'center',
                          padding: '16px 8px',
                          fontWeight: '600',
                          color: '#374151',
                          fontSize: '14px',
                          fontFamily: 'Arial, sans-serif',
                          width: '23.33%',
                          borderLeft: '1px solid #e5e7eb'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              color: '#374151'
                            }}>⭐</div>
                            <span>Place Logo</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {competitionData.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} style={{ 
                        borderBottom: featureIndex === competitionData.features.length - 1 ? 'none' : '1px solid #e5e7eb'
                      }}>
                        <td style={{
                          padding: '16px 12px',
                          color: '#374151',
                          fontSize: '16px',
                          fontFamily: 'Arial, sans-serif',
                          fontWeight: '400',
                          backgroundColor: 'white'
                        }}>{feature}</td>
                        <td style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          fontWeight: '700',
                          color: '#111827',
                          fontSize: '16px',
                          fontFamily: 'Arial, sans-serif',
                          backgroundColor: 'white',
                          borderLeft: '1px solid #e5e7eb'
                        }}>
                          {competitionData.ourProduct.values[featureIndex]}
                        </td>
                        {competitionData.competitors.map((competitor, compIndex) => (
                          <td key={compIndex} style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: '16px',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: '400',
                            backgroundColor: 'white',
                            borderLeft: '1px solid #e5e7eb'
                          }}>
                            {competitor.values[featureIndex]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Right Column - Description */}
          <div style={{
            width: '25%',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end'
          }}>
            {layout.showDescription && description && (
              <div style={{
                textAlign: 'right',
                maxWidth: '100%'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#6b7280',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>Our Unique Positioning</h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Text content state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);

  // Sync props with state when they change
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

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

  useEffect(() => {
    setTableTextStyles(tableTextStyles);
  }, [JSON.stringify(tableTextStyles)]);

  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);

  // Text selection handlers (defined later with transforms)
  
  // Text popup state
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as 'title' | 'description' | null,
    lastTargetElement: null as 'title' | 'description' | null
  });

  // Table text state management (completely independent from title/description)
  const [tableTextState, setTableTextState] = useState({
    headerText: competitionData?.headerText || 'Feature / Value Driver',
    features: competitionData?.features || ['Upfront Cost', 'Implementation Speed', 'Sustainability Rating', 'ROI Timeline'],
    ourProductValues: competitionData?.ourProduct?.values || ['Low', 'Fast', 'High', '6 months'],
    competitorValues: competitionData?.competitors?.map(comp => comp.values) || [
      ['Medium', 'Medium', 'Medium', '12 months'],
      ['High', 'Slow', 'Low', '18 months']
    ]
  });

  // Table text styling state (independent from title/description styling)
  const [tableTextStylesState, setTableTextStyles] = useState<{[key: string]: any}>(tableTextStyles);
  const [tableTextTransforms, setTableTextTransforms] = useState<{[key: string]: any}>({});

  // Table text popup state (separate from main text popup)
  const [tableTextPopupState, setTableTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 12,
    currentFontFamily: 'font-helvetica-neue',
    targetElement: null as string | null,
    lastTargetElement: null as string | null
  });

  // Table text selection handlers (separate from main text selection)
  const [tableTextSelectionState, tableTextSelectionHandlers] = useFigmaSelection();

  // Sync table text state with props changes
  useEffect(() => {
    if (competitionData) {
      const newState = {
        headerText: competitionData.headerText || 'Feature / Value Driver',
        features: competitionData.features || ['Upfront Cost', 'Implementation Speed', 'Sustainability Rating', 'ROI Timeline'],
        ourProductValues: competitionData.ourProduct?.values || ['Low', 'Fast', 'High', '6 months'],
        competitorValues: competitionData.competitors?.map(comp => comp.values) || [
          ['Medium', 'Medium', 'Medium', '12 months'],
          ['High', 'Slow', 'Low', '18 months']
        ]
      };
      
      // Only update if the state has actually changed
      setTableTextState(prevState => {
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          return newState;
        }
        return prevState;
      });
    }
  }, [competitionData]);

  // Custom update handler for our logo
  const handleOurLogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.imageUrl || updates.logoUrl) {
        updateData.ourLogoUrl = updates.imageUrl || updates.logoUrl;
      }
      if (updates.imageTransform) {
        updateData.ourLogoTransform = updates.imageTransform;
      }
      onUpdate(updateData);
    }
  };

  // Use Figma selection hooks for logo placeholders
  const [ourLogoState, ourLogoHandlers] = useFigmaSelection({
    initialImageUrl: ourLogoUrl,
    initialImageTransform: savedOurLogoTransform || { x: 0, y: 0 },
    onUpdate: handleOurLogoUpdate // 🔧 AUTO-UPDATE: Our logo uploads
  });

  // Custom update handlers for competitor logos
  const handleCompetitor1LogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.imageUrl || updates.logoUrl) {
        updateData.competitor1LogoUrl = updates.imageUrl || updates.logoUrl;
      }
      if (updates.imageTransform) {
        updateData.competitor1LogoTransform = updates.imageTransform;
      }
      onUpdate(updateData);
    }
  };

  const handleCompetitor2LogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.imageUrl || updates.logoUrl) {
        updateData.competitor2LogoUrl = updates.imageUrl || updates.logoUrl;
      }
      if (updates.imageTransform) {
        updateData.competitor2LogoTransform = updates.imageTransform;
      }
      onUpdate(updateData);
    }
  };

  const handleCompetitor3LogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.imageUrl || updates.logoUrl) {
        updateData.competitor3LogoUrl = updates.imageUrl || updates.logoUrl;
      }
      if (updates.imageTransform) {
        updateData.competitor3LogoTransform = updates.imageTransform;
      }
      onUpdate(updateData);
    }
  };

  const handleCompetitor4LogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.imageUrl || updates.logoUrl) {
        updateData.competitor4LogoUrl = updates.imageUrl || updates.logoUrl;
      }
      if (updates.imageTransform) {
        updateData.competitor4LogoTransform = updates.imageTransform;
      }
      onUpdate(updateData);
    }
  };

  const handleCompetitor5LogoUpdate = (updates: any) => {
    if (onUpdate) {
      const updateData: any = {};
      if (updates.imageUrl || updates.logoUrl) {
        updateData.competitor5LogoUrl = updates.imageUrl || updates.logoUrl;
      }
      if (updates.imageTransform) {
        updateData.competitor5LogoTransform = updates.imageTransform;
      }
      onUpdate(updateData);
    }
  };

  // Create Figma selection hooks for competitor logos (fixed number to avoid hook violations)
  const [competitorLogo1State, competitorLogo1Handlers] = useFigmaSelection({
      initialImageUrl: competitor1LogoUrl,
      initialImageTransform: savedCompetitor1LogoTransform || { x: 0, y: 0 },
      onUpdate: handleCompetitor1LogoUpdate // 🔧 AUTO-UPDATE: Competitor 1 logo
  });
  const [competitorLogo2State, competitorLogo2Handlers] = useFigmaSelection({
    initialImageUrl: competitor2LogoUrl,
    initialImageTransform: savedCompetitor2LogoTransform || { x: 0, y: 0 },
    onUpdate: handleCompetitor2LogoUpdate // 🔧 AUTO-UPDATE: Competitor 2 logo
  });
  const [competitorLogo3State, competitorLogo3Handlers] = useFigmaSelection({
    initialImageUrl: competitor3LogoUrl,
    initialImageTransform: savedCompetitor3LogoTransform || { x: 0, y: 0 },
    onUpdate: handleCompetitor3LogoUpdate // 🔧 AUTO-UPDATE: Competitor 3 logo
  });
  const [competitorLogo4State, competitorLogo4Handlers] = useFigmaSelection({
    initialImageUrl: competitor4LogoUrl,
    initialImageTransform: savedCompetitor4LogoTransform || { x: 0, y: 0 },
    onUpdate: handleCompetitor4LogoUpdate // 🔧 AUTO-UPDATE: Competitor 4 logo
  });
  const [competitorLogo5State, competitorLogo5Handlers] = useFigmaSelection({
    initialImageUrl: competitor5LogoUrl,
    initialImageTransform: savedCompetitor5LogoTransform || { x: 0, y: 0 },
    onUpdate: handleCompetitor5LogoUpdate // 🔧 AUTO-UPDATE: Competitor 5 logo
  });
  
  // Text selection handlers with saved transforms
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: 0, y: 0 },
    initialDescriptionTransform: savedDescriptionTransform || { x: 0, y: 0 },
    onUpdate: onUpdate
  });
  
  // Create array of competitor logo states for easier iteration
  const competitorLogoStates = [
    [competitorLogo1State, competitorLogo1Handlers],
    [competitorLogo2State, competitorLogo2Handlers],
    [competitorLogo3State, competitorLogo3Handlers],
    [competitorLogo4State, competitorLogo4Handlers],
    [competitorLogo5State, competitorLogo5Handlers]
  ];

  // Helper function to deselect all logos except the specified one
  const deselectAllExcept = (keepSelected: 'our' | number | null) => {
    if (keepSelected !== 'our') {
      ourLogoHandlers.handleClickOutside();
    }
    // Deselect competitor logos individually
    if (keepSelected !== 0) {
      competitorLogo1Handlers.handleClickOutside();
    }
    if (keepSelected !== 1) {
      competitorLogo2Handlers.handleClickOutside();
    }
    if (keepSelected !== 2) {
      competitorLogo3Handlers.handleClickOutside();
    }
    if (keepSelected !== 3) {
      competitorLogo4Handlers.handleClickOutside();
    }
    if (keepSelected !== 4) {
      competitorLogo5Handlers.handleClickOutside();
    }
  };

  // Unified function to deselect ALL elements (logos, main text, table text)
  const deselectAllElements = () => {
    // Deselect all logos
    deselectAllExcept(null);
    
    // Deselect main text elements (title/description)
    textSelectionHandlers.handleClickOutside();
    setTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
    
    // Deselect table text elements
    tableTextSelectionHandlers.handleClickOutside();
    setTableTextPopupState(prev => ({ 
      ...prev, 
      isOpen: false,
      targetElement: null,
      lastTargetElement: null
    }));
  };

  // Global click outside handler to deselect all logos and text
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('.table-text-layer') ||
                          target.closest('.image-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      return;
    }
    
    deselectAllElements();
  };

  // Enhanced text click handlers that ensure single selection
  const enhancedTextHandlers = {
    handleTitleClick: (e: React.MouseEvent) => {
      // Deselect everything except this title
      deselectAllExcept(null); // Deselect logos
      tableTextSelectionHandlers.handleClickOutside(); // Deselect table text
      setTableTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
      // Don't deselect description here - let the original handler manage title/description selection
      textSelectionHandlers.handleTitleClick(e);
    },
    handleDescriptionClick: (e: React.MouseEvent) => {
      // Deselect everything except this description
      deselectAllExcept(null); // Deselect logos
      tableTextSelectionHandlers.handleClickOutside(); // Deselect table text
      setTableTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
      // Don't deselect title here - let the original handler manage title/description selection
      textSelectionHandlers.handleDescriptionClick(e);
    }
  };

  // Enhanced table text click handlers that ensure single selection
  const enhancedTableTextHandlers = {
    handleTitleClick: (e: React.MouseEvent) => {
      // Deselect everything else first
      deselectAllExcept(null); // Deselect logos
      textSelectionHandlers.handleClickOutside(); // Deselect main text
      setTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
      // Now select this table text element (header)
      tableTextSelectionHandlers.handleTitleClick(e);
      setTableTextPopupState(prev => ({ ...prev, targetElement: 'header' }));
    },
    // Generic handler for any table text element
    handleTableTextClick: (e: React.MouseEvent, elementId: string) => {
      // Deselect everything else first
      deselectAllExcept(null); // Deselect logos
      textSelectionHandlers.handleClickOutside(); // Deselect main text
      setTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
      // Now select this table text element
      tableTextSelectionHandlers.handleTitleClick(e);
      setTableTextPopupState(prev => ({ ...prev, targetElement: elementId }));
    }
  };

  // Create enhanced handlers for single selection behavior
  const ourLogoEnhancedHandlers = {
    ...ourLogoHandlers,
    handleImageClick: (e: React.MouseEvent) => {
      // Deselect all text elements when selecting a logo
      textSelectionHandlers.handleClickOutside();
      setTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
      tableTextSelectionHandlers.handleClickOutside();
      setTableTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
      
      deselectAllExcept('our');
      ourLogoHandlers.handleImageClick(e);
    }
  };

  const competitorLogoEnhancedHandlers = [
    // Enhanced handlers for competitor logo 1
    {
      ...competitorLogo1Handlers,
    handleImageClick: (e: React.MouseEvent) => {
        // Deselect all text elements when selecting a logo
        textSelectionHandlers.handleClickOutside();
        setTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        tableTextSelectionHandlers.handleClickOutside();
        setTableTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        
        deselectAllExcept(0);
        competitorLogo1Handlers.handleImageClick(e);
      }
    },
    // Enhanced handlers for competitor logo 2
    {
      ...competitorLogo2Handlers,
      handleImageClick: (e: React.MouseEvent) => {
        // Deselect all text elements when selecting a logo
        textSelectionHandlers.handleClickOutside();
        setTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        tableTextSelectionHandlers.handleClickOutside();
        setTableTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        
        deselectAllExcept(1);
        competitorLogo2Handlers.handleImageClick(e);
      }
    },
    // Enhanced handlers for competitor logo 3
    {
      ...competitorLogo3Handlers,
      handleImageClick: (e: React.MouseEvent) => {
        // Deselect all text elements when selecting a logo
        textSelectionHandlers.handleClickOutside();
        setTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        tableTextSelectionHandlers.handleClickOutside();
        setTableTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        
        deselectAllExcept(2);
        competitorLogo3Handlers.handleImageClick(e);
      }
    },
    // Enhanced handlers for competitor logo 4
    {
      ...competitorLogo4Handlers,
      handleImageClick: (e: React.MouseEvent) => {
        // Deselect all text elements when selecting a logo
        textSelectionHandlers.handleClickOutside();
        setTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        tableTextSelectionHandlers.handleClickOutside();
        setTableTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        
        deselectAllExcept(3);
        competitorLogo4Handlers.handleImageClick(e);
      }
    },
    // Enhanced handlers for competitor logo 5
    {
      ...competitorLogo5Handlers,
      handleImageClick: (e: React.MouseEvent) => {
        // Deselect all text elements when selecting a logo
        textSelectionHandlers.handleClickOutside();
        setTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        tableTextSelectionHandlers.handleClickOutside();
        setTableTextPopupState(prev => ({ 
          ...prev, 
          isOpen: false,
          targetElement: null,
          lastTargetElement: null
        }));
        
        deselectAllExcept(4);
        competitorLogo5Handlers.handleImageClick(e);
      }
    }
  ];

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

  // Style change handlers
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

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
    if (textSelectionHandlers.handleTitleDelete) {
      textSelectionHandlers.handleTitleDelete();
    }
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
    if (textSelectionHandlers.handleDescriptionDelete) {
      textSelectionHandlers.handleDescriptionDelete();
    }
  };

  const handleTitleSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Custom drag handlers
  const handleTitleDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (textSelectionHandlers.handleTitleDragStart) {
      textSelectionHandlers.handleTitleDragStart(e, element);
    }
  };

  const handleDescriptionDragStart = (e: React.MouseEvent, element: HTMLElement) => {
    if (textSelectionHandlers.handleDescriptionDragStart) {
      textSelectionHandlers.handleDescriptionDragStart(e, element);
    }
  };

  // Track previous dragging states
  const prevDraggingRef = useRef({
    isTitleDragging: false,
    isDescriptionDragging: false
  });

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      const transform = activeTarget === 'title' 
        ? textSelectionState.titleTransform 
        : textSelectionState.descriptionTransform;
      
      const isDragging = activeTarget === 'title'
        ? textSelectionState.isTitleDragging
        : textSelectionState.isDescriptionDragging;

      const wasDragging = activeTarget === 'title'
        ? prevDraggingRef.current.isTitleDragging
        : prevDraggingRef.current.isDescriptionDragging;
      
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
      isTitleDragging: textSelectionState.isTitleDragging,
      isDescriptionDragging: textSelectionState.isDescriptionDragging
    };
  }, [
    textSelectionState.titleTransform, 
    textSelectionState.descriptionTransform, 
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    textPopupState.isOpen, 
    textPopupState.targetElement,
    textPopupState.lastTargetElement
  ]);

  // Table text change handlers (completely independent from title/description)
  const handleTableTextChange = (elementId: string, newText: string) => {
    if (elementId === 'header') {
      setTableTextState(prev => ({ ...prev, headerText: newText }));
    } else if (elementId.startsWith('feature-')) {
      const featureIndex = parseInt(elementId.split('-')[1]);
      setTableTextState(prev => ({
        ...prev,
        features: prev.features.map((feature, index) => 
          index === featureIndex ? newText : feature
        )
      }));
    } else if (elementId.startsWith('our-value-')) {
      const valueIndex = parseInt(elementId.split('-')[2]);
      setTableTextState(prev => ({
        ...prev,
        ourProductValues: prev.ourProductValues.map((value, index) => 
          index === valueIndex ? newText : value
        )
      }));
    } else if (elementId.startsWith('comp-value-')) {
      const [, , compIndex, valueIndex] = elementId.split('-').map(Number);
      setTableTextState(prev => ({
        ...prev,
        competitorValues: prev.competitorValues.map((compValues, cIndex) => 
          cIndex === compIndex 
            ? compValues.map((value, vIndex) => vIndex === valueIndex ? newText : value)
            : compValues
        )
      }));
    }
    
    // Call onUpdate with the proper competitionData structure
    if (onUpdate) {
      const updatedCompetitionData = { ...competitionData };
      
      if (elementId === 'header') {
        // Save header text in competitionData structure
        const updatedCompetitionData = { 
          ...competitionData,
          headerText: newText 
        };
        onUpdate({ competitionData: updatedCompetitionData });
      } else if (elementId.startsWith('feature-')) {
        const featureIndex = parseInt(elementId.split('-')[1]);
        updatedCompetitionData.features = updatedCompetitionData.features.map((feature, index) => 
          index === featureIndex ? newText : feature
        );
        onUpdate({ competitionData: updatedCompetitionData });
      } else if (elementId.startsWith('our-value-')) {
        const valueIndex = parseInt(elementId.split('-')[2]);
        updatedCompetitionData.ourProduct.values = updatedCompetitionData.ourProduct.values.map((value, index) => 
          index === valueIndex ? newText : value
        );
        onUpdate({ competitionData: updatedCompetitionData });
      } else if (elementId.startsWith('comp-value-')) {
        const [, , compIndex, valueIndex] = elementId.split('-').map(Number);
        updatedCompetitionData.competitors[compIndex].values = updatedCompetitionData.competitors[compIndex].values.map((value, vIndex) => 
          vIndex === valueIndex ? newText : value
        );
        onUpdate({ competitionData: updatedCompetitionData });
      }
    }
  };

  const handleTableTextStyleChange = (elementId: string, property: string, value: any) => {
    setTableTextStyles(prev => {
      const newStyles = {
        ...prev,
        [elementId]: {
          ...prev[elementId],
          [property]: value
        }
      };
      
      // Call onUpdate to save the changes
      if (onUpdate) {
        onUpdate({ tableTextStyles: newStyles });
      }
      
      return newStyles;
    });
  };

  const handleTableTextDelete = (elementId: string) => {
    handleTableTextChange(elementId, '');
    if (tableTextSelectionHandlers.handleTitleDelete) {
      tableTextSelectionHandlers.handleTitleDelete();
    }
  };

  const getTableTextStyle = (elementId: string) => {
    const defaults = { fontSize: 12, fontFamily: 'font-helvetica-neue', color: '#374151', alignment: 'left' as const };
    return { ...defaults, ...tableTextStylesState[elementId] };
  };

  const getTableTextTransform = (elementId: string) => {
    const defaults = { x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1 };
    return { ...defaults, ...tableTextTransforms[elementId] };
  };

  const updateTableTextTransform = (elementId: string, transform: any) => {
    setTableTextTransforms(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], ...transform }
    }));
  };

  // Table text popup position tracking
  const prevTableDraggingRef = useRef({
    isDragging: false
  });

  // Update table text popup position when text is dragged
  useEffect(() => {
    if (tableTextPopupState.isOpen && (tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement)) {
      const activeTarget = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
      
      const transform = tableTextSelectionState.titleTransform; // Use title transform for table text
      const isDragging = tableTextSelectionState.isTitleDragging;
      const wasDragging = prevTableDraggingRef.current.isDragging;
      
      if (transform) {
        setTableTextPopupState(prev => {
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

    // Update previous dragging state
    prevTableDraggingRef.current = {
      isDragging: tableTextSelectionState.isTitleDragging
    };
  }, [
    tableTextSelectionState.titleTransform, 
    tableTextSelectionState.isTitleDragging,
    tableTextPopupState.isOpen, 
    tableTextPopupState.targetElement,
    tableTextPopupState.lastTargetElement
  ]);

  // Calculate total columns (1 feature column + 1 our product + competitors)
  const totalColumns = 1 + 1 + (competitionData?.competitors?.length || 2);
  
  // Helper function to get grid column class based on total columns
  const getGridColsClass = () => {
    switch (totalColumns) {
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      case 7: return 'grid-cols-7';
      default: return 'grid-cols-4'; // fallback
    }
  };

  // Helper function to get responsive padding based on number of columns
  const getCellPadding = () => {
    if (totalColumns >= 6) return 'p-2'; // Smaller padding for 5+ companies
    if (totalColumns >= 5) return 'p-2.5'; // Medium padding for 4 companies
    return 'p-3'; // Default padding for 2-3 companies
  };

  // Helper function to render value with icon if it's a yes/no answer
  const renderValue = (value: string) => {
    const lowerValue = value?.toLowerCase();
    
    if (lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '✓' || lowerValue === 'check') {
      return (
        <ImageBlock
          src="/check-icon.png"
          alt="Yes"
          size="xs"
          fit="contain"
          align="center"
                        rounded={false}
          shadow={false}
          className="h-3 w-3 mx-auto"
        />
      );
    }
    
    if (lowerValue === 'no' || lowerValue === 'false' || lowerValue === '✗' || lowerValue === 'cross') {
      return (
        <ImageBlock
          src="/wrong-icon.png"
          alt="No"
          size="xs"
          fit="contain"
          align="center"
                        rounded={false}
          shadow={false}
          className="h-3 w-3 mx-auto"
        />
      );
    }
    
    // Return text for non-yes/no values
    return value || '-';
  };

  // Use responsive styling by default, fixed dimensions only when explicitly requested
  const containerStyle = useFixedDimensions ? {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    maxWidth: `${canvasWidth}px`,
    maxHeight: `${canvasHeight}px`,
    minWidth: `${canvasWidth}px`,
    minHeight: `${canvasHeight}px`,
  } : {};

  // Base classes for competition layout
  const containerClasses = useFixedDimensions 
    ? `competition-analysis px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white ${className}`
    : `competition-analysis px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 bg-white w-full h-full min-h-[400px] ${className}`;

  // Generate unique ID for accessibility
  const headingId = `competition-heading-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  // Calculate column classes
  const [leftCols, rightCols] = layout.columnSizes || [6, 6];
  const leftColClass = `w-full lg:w-${leftCols}/12`;
  const rightColClass = `w-full lg:w-${rightCols}/12`;

  const content = (
    <section 
      className={`${containerClasses} flex flex-col`}
      style={containerStyle}
      aria-labelledby={headingId}
      onClick={handleGlobalClickOutside}
    >
      {/* Title and Description Section */}
      <div className="flex mb-8 relative">
        {/* Title */}
        {layout.showTitle && (
          <div className="w-1/2 pr-8 relative">
            <div 
              className="title-layer absolute pointer-events-auto"
              style={{
                left: '0px',
                top: '0px',
                width: 'auto',
                zIndex: 10,
                // Critical: Allow infinite expansion beyond canvas
                overflow: 'visible',
                contain: 'none',
                // Ensure no layout influence on parent
                position: 'absolute'
              }}
            >
              <FigmaText
                variant="title"
                color={currentTitleColor}
                align={currentTitleAlignment}
                fontFamily={titleFontFamilyState}
                className={`text-2xl lg:text-3xl xl:text-4xl font-normal font-helvetica-neue leading-none tracking-tighter text-left break-words`}
                style={{
                  fontSize: `${titleFontSizeState}px`,
                  color: currentTitleColor,
                  textAlign: currentTitleAlignment,
                  lineHeight: '0.9',
                  letterSpacing: '-0.05em',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}
                isSelected={textSelectionState.isTitleSelected}
                transform={textSelectionState.titleTransform}
                onClick={enhancedTextHandlers.handleTitleClick}
                onTextChange={handleTitleTextChange}
                onSizeChange={handleTitleSizeChange}
                onChangeSize={handleTitleChangeSize}
                onChangeFont={handleTitleChangeFont}
                onDragStart={handleTitleDragStart}
                onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                onDeleteText={handleTitleDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const titleElement = document.querySelector('.competition-analysis .title-layer');
                  if (titleElement) {
                    const titleRect = titleElement.getBoundingClientRect();
                    const canvasContainer = titleElement.closest('.competition-analysis') as HTMLElement;
                    if (canvasContainer) {
                      const canvasRect = canvasContainer.getBoundingClientRect();
                      const relativeX = (titleRect.left - canvasRect.left) - 10;
                      const relativeY = (titleRect.top - canvasRect.top) - 80;
                      
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
          </div>
        )}

        {/* Description */}
        {layout.showDescription && currentDescription && (
          <div className="w-1/2 pl-8 relative">
            <div 
              className="description-layer absolute pointer-events-auto"
              style={{
                left: '0px',
                top: '0px',
                width: 'auto',
                zIndex: 10,
                // Critical: Allow infinite expansion beyond canvas
                overflow: 'visible',
                contain: 'none',
                // Ensure no layout influence on parent
                position: 'absolute'
              }}
            >
              <FigmaText
                variant="body"
                color={currentDescriptionColor}
                align={currentDescriptionAlignment}
                fontFamily={descriptionFontFamilyState}
                className={`text-gray-600 font-helvetica-neue leading-relaxed text-left break-words`}
                style={{
                  fontSize: `${descriptionFontSizeState}px`,
                  color: currentDescriptionColor,
                  textAlign: currentDescriptionAlignment,
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }}
                isSelected={textSelectionState.isDescriptionSelected}
                transform={textSelectionState.descriptionTransform}
                onClick={enhancedTextHandlers.handleDescriptionClick}
                onTextChange={handleDescriptionTextChange}
                onSizeChange={handleDescriptionSizeChange}
                onChangeSize={handleDescriptionChangeSize}
                onChangeFont={handleDescriptionChangeFont}
                onDragStart={handleDescriptionDragStart}
                onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                onDeleteText={handleDescriptionDelete}
                onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                  const descriptionElement = document.querySelector('.competition-analysis .description-layer');
                  if (descriptionElement) {
                    const descriptionRect = descriptionElement.getBoundingClientRect();
                    const canvasContainer = descriptionElement.closest('.competition-analysis') as HTMLElement;
                    if (canvasContainer) {
                      const canvasRect = canvasContainer.getBoundingClientRect();
                      const relativeX = (descriptionRect.left - canvasRect.left) - 10;
                      const relativeY = (descriptionRect.top - canvasRect.top) - 80;
                      
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
          </div>
        )}
      </div>

      {/* Full Width Competition Table */}
      {layout.showTable && (
        <div className="w-full mt-12">
          <div className="bg-white overflow-hidden">
                {/* Table Header */}
                <div className={`grid ${getGridColsClass()} border-b border-gray-100`} style={{ backgroundColor: '#FCFCFC' }}>
                  <div className={`${getCellPadding()} border-r border-gray-100 flex items-center min-h-8 relative`}>
                    <div 
                      className="table-text-layer absolute pointer-events-auto"
                      style={{
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 'auto',
                        zIndex: 10,
                        overflow: 'visible',
                        contain: 'none',
                        position: 'absolute'
                      }}
                    >
                      <FigmaText
                        variant="body"
                        color={getTableTextStyle('header').color}
                        align={getTableTextStyle('header').alignment}
                        fontFamily={getTableTextStyle('header').fontFamily}
                        className="text-xs font-semibold text-gray-700 break-words"
                        style={{
                          fontSize: `${getTableTextStyle('header').fontSize}px`,
                          color: getTableTextStyle('header').color,
                          textAlign: getTableTextStyle('header').alignment,
                          lineHeight: '1.2',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        isSelected={tableTextSelectionState.isTitleSelected && tableTextPopupState.targetElement === 'header'}
                        transform={getTableTextTransform('header')}
                        onClick={enhancedTableTextHandlers.handleTitleClick}
                        onTextChange={(newText) => handleTableTextChange('header', newText)}
                        onSizeChange={(newTransform) => updateTableTextTransform('header', newTransform)}
                        onChangeSize={(fontSize) => handleTableTextStyleChange('header', 'fontSize', fontSize)}
                        onChangeFont={(fontFamily) => handleTableTextStyleChange('header', 'fontFamily', fontFamily)}
                        onDragStart={tableTextSelectionHandlers.handleTitleDragStart}
                        onResizeStart={tableTextSelectionHandlers.handleTitleResizeStart}
                        onDeleteText={() => handleTableTextDelete('header')}
                        onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                          const headerElement = document.querySelector('.competition-analysis .table-text-layer');
                          if (headerElement) {
                            const headerRect = headerElement.getBoundingClientRect();
                            const canvasContainer = headerElement.closest('.competition-analysis') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (headerRect.left - canvasRect.left) - 10;
                              const relativeY = (headerRect.top - canvasRect.top) - 80;
                              
                              setTableTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: 'header',
                                lastTargetElement: 'header'
                              });
                            }
                          }
                        }}>
                        {tableTextState.headerText}
                      </FigmaText>
                    </div>
                  </div>
                  <div className={`${getCellPadding()} border-r border-gray-100 text-center pl-4`}>
                    <div className="flex items-center justify-center h-full min-h-8">
                      <FigmaImage
                        src="/logo-holder.png"
                        alt="Our Solution Logo"
                        size="sm"
                        fit="contain"
                        align="center"
                        rounded={false}
                        className="w-auto max-w-16 object-contain"
                        containerClassName="inline-flex items-center justify-center min-h-8"
                        containerStyle={{ maxWidth: '4rem', minHeight: '2rem' }}
                        state={ourLogoState}
                        handlers={ourLogoEnhancedHandlers}
                      />
                    </div>
                  </div>
                  {(competitionData?.competitors || [
                    { name: 'Competitor A', values: ['Medium', 'Medium', 'Medium', '12 months'] },
                    { name: 'Competitor B', values: ['High', 'Slow', 'Low', '18 months'] }
                  ]).map((competitor, index) => {
                    // Ensure we don't go out of bounds
                    if (index >= competitorLogoStates.length) return null;
                    
                    // Get the appropriate logo state and handlers based on index
                    let logoState, logoHandlers;
                    if (index === 0) {
                      logoState = competitorLogo1State;
                      logoHandlers = competitorLogo1Handlers;
                    } else if (index === 1) {
                      logoState = competitorLogo2State;
                      logoHandlers = competitorLogo2Handlers;
                    } else if (index === 2) {
                      logoState = competitorLogo3State;
                      logoHandlers = competitorLogo3Handlers;
                    } else if (index === 3) {
                      logoState = competitorLogo4State;
                      logoHandlers = competitorLogo4Handlers;
                    } else if (index === 4) {
                      logoState = competitorLogo5State;
                      logoHandlers = competitorLogo5Handlers;
                    } else {
                      return null; // Support up to 5 competitors
                    }
                    return (
                      <div key={index} className={`${getCellPadding()} text-center pl-4 ${index < (competitionData?.competitors?.length || 2) - 1 ? 'border-r border-gray-100' : ''}`}>
                        <div className="flex items-center justify-center h-full min-h-8">
                          <FigmaImage
                            src="/logo-holder.png"
                            alt={`${competitor.name} Logo`}
                            size="sm"
                            fit="contain"
                            align="center"
                            rounded={false}
                            className="w-auto max-w-16 object-contain"
                            containerClassName="inline-flex items-center justify-center min-h-8"
                            containerStyle={{ maxWidth: '4rem', minHeight: '2rem' }}
                            state={logoState}
                            handlers={competitorLogoEnhancedHandlers[index] || logoHandlers}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table Rows */}
                {tableTextState.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className={`grid ${getGridColsClass()} ${featureIndex < tableTextState.features.length - 1 ? 'border-b border-gray-100' : ''} min-h-12`}>
                    {/* Feature Name */}
                    <div className={`${getCellPadding()} border-r border-gray-100 relative flex items-center min-h-12`} style={{ backgroundColor: '#FCFCFC' }}>
                      <div 
                        className="table-text-layer absolute pointer-events-auto"
                        style={{
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 'auto',
                          zIndex: 10,
                          overflow: 'visible',
                          contain: 'none',
                          position: 'absolute'
                        }}
                      >
                        <FigmaText
                          variant="body"
                          color={getTableTextStyle(`feature-${featureIndex}`).color}
                          align={getTableTextStyle(`feature-${featureIndex}`).alignment}
                          fontFamily={getTableTextStyle(`feature-${featureIndex}`).fontFamily}
                          className="text-xs font-medium text-gray-700 break-words"
                          style={{
                            fontSize: `${getTableTextStyle(`feature-${featureIndex}`).fontSize}px`,
                            color: getTableTextStyle(`feature-${featureIndex}`).color,
                            textAlign: getTableTextStyle(`feature-${featureIndex}`).alignment,
                            lineHeight: '1.2',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal'
                          }}
                          isSelected={tableTextSelectionState.isTitleSelected && tableTextPopupState.targetElement === `feature-${featureIndex}`}
                          transform={getTableTextTransform(`feature-${featureIndex}`)}
                          onClick={(e) => enhancedTableTextHandlers.handleTableTextClick(e, `feature-${featureIndex}`)}
                          onTextChange={(newText) => handleTableTextChange(`feature-${featureIndex}`, newText)}
                          onSizeChange={(newTransform) => updateTableTextTransform(`feature-${featureIndex}`, newTransform)}
                          onChangeSize={(fontSize) => handleTableTextStyleChange(`feature-${featureIndex}`, 'fontSize', fontSize)}
                          onChangeFont={(fontFamily) => handleTableTextStyleChange(`feature-${featureIndex}`, 'fontFamily', fontFamily)}
                          onDragStart={tableTextSelectionHandlers.handleTitleDragStart}
                          onResizeStart={tableTextSelectionHandlers.handleTitleResizeStart}
                          onDeleteText={() => handleTableTextDelete(`feature-${featureIndex}`)}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            setTableTextPopupState({
                              isOpen: true,
                              position: { x: position.x, y: position.y - 100 },
                              originalPosition: { x: position.x, y: position.y - 100 },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: `feature-${featureIndex}`,
                              lastTargetElement: `feature-${featureIndex}`
                            });
                          }}>
          {feature}
                        </FigmaText>
                      </div>
                    </div>
                    
                    {/* Our Product Value */}
                    <div className={`${getCellPadding()} border-r border-gray-100 text-center relative flex items-center justify-center min-h-12`} style={{ backgroundColor: '#FCFCFC' }}>
                      <div 
                        className="table-text-layer absolute pointer-events-auto"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 'auto',
                          zIndex: 10,
                          overflow: 'visible',
                          contain: 'none',
                          position: 'absolute'
                        }}
                      >
                        <FigmaText
                          variant="body"
                          color={getTableTextStyle(`our-value-${featureIndex}`).color}
                          align="center"
                          fontFamily={getTableTextStyle(`our-value-${featureIndex}`).fontFamily}
                          className="text-xs text-gray-600 break-words"
                          style={{
                            fontSize: `${getTableTextStyle(`our-value-${featureIndex}`).fontSize}px`,
                            color: getTableTextStyle(`our-value-${featureIndex}`).color,
                            textAlign: 'center',
                            lineHeight: '1.2',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal'
                          }}
                          isSelected={tableTextSelectionState.isTitleSelected && tableTextPopupState.targetElement === `our-value-${featureIndex}`}
                          transform={getTableTextTransform(`our-value-${featureIndex}`)}
                          onClick={(e) => enhancedTableTextHandlers.handleTableTextClick(e, `our-value-${featureIndex}`)}
                          onTextChange={(newText) => handleTableTextChange(`our-value-${featureIndex}`, newText)}
                          onSizeChange={(newTransform) => updateTableTextTransform(`our-value-${featureIndex}`, newTransform)}
                          onChangeSize={(fontSize) => handleTableTextStyleChange(`our-value-${featureIndex}`, 'fontSize', fontSize)}
                          onChangeFont={(fontFamily) => handleTableTextStyleChange(`our-value-${featureIndex}`, 'fontFamily', fontFamily)}
                          onDragStart={tableTextSelectionHandlers.handleTitleDragStart}
                          onResizeStart={tableTextSelectionHandlers.handleTitleResizeStart}
                          onDeleteText={() => handleTableTextDelete(`our-value-${featureIndex}`)}
                          onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                            setTableTextPopupState({
                              isOpen: true,
                              position: { x: position.x, y: position.y - 100 },
                              originalPosition: { x: position.x, y: position.y - 100 },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: `our-value-${featureIndex}`,
                              lastTargetElement: `our-value-${featureIndex}`
                            });
                          }}>
                          {tableTextState.ourProductValues[featureIndex] || ''}
                        </FigmaText>
                      </div>
                    </div>
                    
                    {/* Competitor Values */}
                    {tableTextState.competitorValues.map((compValues, compIndex) => (
                      <div key={compIndex} className={`${getCellPadding()} text-center relative flex items-center justify-center min-h-12 ${compIndex < tableTextState.competitorValues.length - 1 ? 'border-r border-gray-100' : ''}`} style={{ backgroundColor: '#FCFCFC' }}>
                        <div 
                          className="table-text-layer absolute pointer-events-auto"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'auto',
                            zIndex: 10,
                            overflow: 'visible',
                            contain: 'none',
                            position: 'absolute'
                          }}
                        >
                          <FigmaText
                            variant="body"
                            color={getTableTextStyle(`comp-value-${compIndex}-${featureIndex}`).color}
                            align="center"
                            fontFamily={getTableTextStyle(`comp-value-${compIndex}-${featureIndex}`).fontFamily}
                            className="text-xs text-gray-600 break-words"
                            style={{
                              fontSize: `${getTableTextStyle(`comp-value-${compIndex}-${featureIndex}`).fontSize}px`,
                              color: getTableTextStyle(`comp-value-${compIndex}-${featureIndex}`).color,
                              textAlign: 'center',
                              lineHeight: '1.2',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal'
                            }}
                            isSelected={tableTextSelectionState.isTitleSelected && tableTextPopupState.targetElement === `comp-value-${compIndex}-${featureIndex}`}
                            transform={getTableTextTransform(`comp-value-${compIndex}-${featureIndex}`)}
                            onClick={(e) => enhancedTableTextHandlers.handleTableTextClick(e, `comp-value-${compIndex}-${featureIndex}`)}
                            onTextChange={(newText) => handleTableTextChange(`comp-value-${compIndex}-${featureIndex}`, newText)}
                            onSizeChange={(newTransform) => updateTableTextTransform(`comp-value-${compIndex}-${featureIndex}`, newTransform)}
                            onChangeSize={(fontSize) => handleTableTextStyleChange(`comp-value-${compIndex}-${featureIndex}`, 'fontSize', fontSize)}
                            onChangeFont={(fontFamily) => handleTableTextStyleChange(`comp-value-${compIndex}-${featureIndex}`, 'fontFamily', fontFamily)}
                            onDragStart={tableTextSelectionHandlers.handleTitleDragStart}
                            onResizeStart={tableTextSelectionHandlers.handleTitleResizeStart}
                            onDeleteText={() => handleTableTextDelete(`comp-value-${compIndex}-${featureIndex}`)}
                            onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                              setTableTextPopupState({
                                isOpen: true,
                                position: { x: position.x, y: position.y - 100 },
                                originalPosition: { x: position.x, y: position.y - 100 },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: `comp-value-${compIndex}-${featureIndex}`,
                                lastTargetElement: `comp-value-${compIndex}-${featureIndex}`
                              });
                            }}>
                            {compValues[featureIndex] || ''}
                          </FigmaText>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
          </div>
        </div>
      )}
    </section>
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
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentDescriptionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentDescriptionAlignment}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
      {/* Table Text Popup (completely independent from main text popup) */}
      {tableTextPopupState.isOpen && (
        <TextPopup
          isOpen={tableTextPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'alignment', alignment);
            }
          }}
          onClose={() => setTableTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={tableTextPopupState.position}
          currentFontSize={tableTextPopupState.currentFontSize}
          currentFontFamily={tableTextPopupState.currentFontFamily}
          currentColor={getTableTextStyle(tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement || '').color}
          currentAlignment={getTableTextStyle(tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement || '').alignment}
          onDeleteText={() => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextDelete(target);
            }
            setTableTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </CanvasOverlayProvider>
  ) : (
    <>
      {content}
      {/* Text Popup for responsive mode */}
      {textPopupState.isOpen && (
        <TextPopup
          isOpen={textPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeSize(fontSize);
            } else if (target === 'description') {
              handleDescriptionChangeSize(fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor : currentDescriptionColor}
          currentAlignment={(textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment : currentDescriptionAlignment}
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
      {/* Table Text Popup for responsive mode (completely independent from main text popup) */}
      {tableTextPopupState.isOpen && (
        <TextPopup
          isOpen={tableTextPopupState.isOpen}
          onChangeSize={(fontSize) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'fontSize', fontSize);
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'fontFamily', fontFamily);
            }
          }}
          onChangeColor={(color) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'color', color);
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextStyleChange(target, 'alignment', alignment);
            }
          }}
          onClose={() => setTableTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={tableTextPopupState.position}
          currentFontSize={tableTextPopupState.currentFontSize}
          currentFontFamily={tableTextPopupState.currentFontFamily}
          currentColor={getTableTextStyle(tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement || '').color}
          currentAlignment={getTableTextStyle(tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement || '').alignment}
          onDeleteText={() => {
            const target = tableTextPopupState.targetElement || tableTextPopupState.lastTargetElement;
            if (target) {
              handleTableTextDelete(target);
            }
            setTableTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}

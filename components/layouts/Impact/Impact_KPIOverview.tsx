import React, { useState, useEffect, useRef, useMemo } from 'react';
import IconBlock from '../../blocks/IconBlock';
import ChartBlock from '../../blocks/ChartBlock';
import type { ChartBlockProps } from '../../blocks/ChartBlock';
import { FigmaText, useFigmaSelection } from '../../figma';
import TextPopup from '../../figma/TextPopup';
import { CanvasOverlayProvider } from '../../figma/CanvasOverlay';

export interface ImpactKPIOverviewProps {
  title?: string;
  description?: string;
  kpiCards?: Array<{
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon: string;
    hasChart?: boolean;
    chartType?: 'area' | 'bar';
  }>;
  chart?: ChartBlockProps;
  layout?: {
    showTitle?: boolean;
    showDescription?: boolean;
    showKpiCards?: boolean;
    showChart?: boolean;
    showSummary?: boolean;
  };
  fontFamily?: string;
  titleColor?: string;
  descriptionColor?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionAlignment?: 'left' | 'center' | 'right';
  
  // KPI styling arrays for persistence
  kpiTitleFontSizes?: number[];
  kpiTitleFontFamilies?: string[];
  kpiTitleColors?: string[];
  kpiTitleAlignments?: ('left' | 'center' | 'right')[];
  kpiValueFontSizes?: number[];
  kpiValueFontFamilies?: string[];
  kpiValueColors?: string[];
  kpiValueAlignments?: ('left' | 'center' | 'right')[];
  kpiSubtitleFontSizes?: number[];
  kpiSubtitleFontFamilies?: string[];
  kpiSubtitleColors?: string[];
  kpiSubtitleAlignments?: ('left' | 'center' | 'right')[];
  
  kpiStyles?: {
    [key: string]: {
      titleFontSize?: number;
      titleFontFamily?: string;
      titleColor?: string;
      titleAlignment?: 'left' | 'center' | 'right';
      valueFontSize?: number;
      valueFontFamily?: string;
      valueColor?: string;
      valueAlignment?: 'left' | 'center' | 'right';
      subtitleFontSize?: number;
      subtitleFontFamily?: string;
      subtitleColor?: string;
      subtitleAlignment?: 'left' | 'center' | 'right';
    };
  };
  className?: string;
  useFixedDimensions?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;

  /**
   * Transform props for positional persistence
   */
  titleTransform?: { x: number; y: number };
  descriptionTransform?: { x: number; y: number };

  /**
   * Canvas editing callback
   */
  onUpdate?: (updates: any) => void;
}

export default function Impact_KPIOverview({
  title = '',
  description = 'Product performance serves as the fundamental backbone of sustainable business growth and long-term success. By systematically evaluating how web features and digital touchpoints resonate with users and measuring their direct impact on engagement metrics, conversion rates, and customer satisfaction, we unlock valuable opportunities to scale effectively while maintaining quality standards. Our comprehensive analysis includes user behavior patterns, feature adoption rates, performance benchmarks, and competitive positioning to ensure that every product decision is data-driven and aligned with strategic business objectives. This holistic approach enables organizations to optimize resource allocation, prioritize development efforts, and achieve measurable improvements in key performance indicators that directly contribute to revenue growth and market expansion.',
  kpiCards,
  chart = {
    type: 'area' as const,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { id: 'Active Users', data: [28.5, 31.2, 29.8, 33.1, 34.2, 35.0], color: '#3b82f6' },
      { id: 'Revenue Growth', data: [18.5, 20.5, 19.2, 22.8, 23.1, 24.5], color: '#8b5cf6' },
      { id: 'NPS Score', data: [42, 43, 44, 44, 45, 45], color: '#10b981' }
    ],
    showLegend: true,
    showGrid: true,
    animate: false, // Disable animations for export mode
    stacked: false,
    legendPosition: 'bottom',
    legendSize: 'small'
  },
  layout = {
    showTitle: true,
    showDescription: true,
    showKpiCards: true,
    showChart: true,
    showSummary: false
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
  
  // KPI styling arrays for persistence
  kpiTitleFontSizes = [],
  kpiTitleFontFamilies = [],
  kpiTitleColors = [],
  kpiTitleAlignments = [],
  kpiValueFontSizes = [],
  kpiValueFontFamilies = [],
  kpiValueColors = [],
  kpiValueAlignments = [],
  kpiSubtitleFontSizes = [],
  kpiSubtitleFontFamilies = [],
  kpiSubtitleColors = [],
  kpiSubtitleAlignments = [],
  
  kpiStyles = {},
  className = '',
  useFixedDimensions = false,
  canvasWidth = 1280,
  canvasHeight = 720,
  titleTransform: savedTitleTransform,
  descriptionTransform: savedDescriptionTransform,
  onUpdate
}: ImpactKPIOverviewProps) {

  // Detect export mode from URL parameters
  const isExportMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('export') === 'true';

  // Simplified rendering for export mode
  if (isExportMode) {
    console.log('📄 Impact_KPIOverview: Rendering in export mode');
    
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
        <div style={{ padding: '48px', height: '100%' }}>
          {/* Title */}
          {layout.showTitle && title && (
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#111827',
              fontFamily: 'Arial, sans-serif',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              {title}
            </h1>
          )}
          
          {/* Description */}
          {layout.showDescription && description && (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              fontFamily: 'Arial, sans-serif',
              marginBottom: '32px',
              margin: '0 0 32px 0',
              lineHeight: '1.5'
            }}>
              {description}
            </p>
          )}
          
          {/* KPI Cards Grid */}
          {layout.showKpiCards && kpiCards && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* First Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
                {kpiCards.slice(0, Math.ceil(kpiCards.length / 2)).map((card, index) => {
                  const hasChart = card.hasChart === true || card.hasChart === 'true';
                  return (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: hasChart ? '24px' : '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      height: hasChart ? 'auto' : '80px',
                      flexShrink: hasChart ? 'initial' : '0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ color: '#2563eb', fontSize: '14px' }}>📊</span>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{card.title}</span>
                        </div>
                        {card.trend && (
                          <span style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '9999px',
                            backgroundColor: card.trend === 'up' ? '#dcfce7' : card.trend === 'down' ? '#fee2e2' : '#f3f4f6',
                            color: card.trend === 'up' ? '#166534' : card.trend === 'down' ? '#991b1b' : '#374151'
                          }}>
                            {card.trendValue || ''}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{card.value}</span>
                        {card.subtitle && <span style={{ fontSize: '14px', color: '#6b7280' }}>{card.subtitle}</span>}
                      </div>
                      {hasChart && (
                        <div style={{
                          marginTop: '16px',
                          height: '80px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Chart</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Second Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
                {kpiCards.slice(Math.ceil(kpiCards.length / 2)).map((card, index) => {
                  const hasChart = card.hasChart === true || card.hasChart === 'true';
                  return (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: hasChart ? '24px' : '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      height: hasChart ? 'auto' : '80px',
                      flexShrink: hasChart ? 'initial' : '0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ color: '#2563eb', fontSize: '14px' }}>📊</span>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{card.title}</span>
                        </div>
                        {card.trend && (
                          <span style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '9999px',
                            backgroundColor: card.trend === 'up' ? '#dcfce7' : card.trend === 'down' ? '#fee2e2' : '#f3f4f6',
                            color: card.trend === 'up' ? '#166534' : card.trend === 'down' ? '#991b1b' : '#374151'
                          }}>
                            {card.trendValue || ''}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{card.value}</span>
                        {card.subtitle && <span style={{ fontSize: '14px', color: '#6b7280' }}>{card.subtitle}</span>}
                      </div>
                      {hasChart && (
                        <div style={{
                          marginTop: '16px',
                          height: '80px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Chart</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generate adaptive KPI cards based on language
  const getAdaptiveKPICards = () => {
    // Detect language from title and description
    const isSpanish = /[áéíóúñü]|indicadores|clave|métricas|rendimiento|ventas|ingresos|clientes|crecimiento|análisis|datos|información/i.test((title || '') + ' ' + (description || ''));

    if (isSpanish) {
      return [
        {
          title: 'Usuarios Activos',
          value: '35,000',
          subtitle: '+5.2% comparado con el mes pasado',
          trend: 'up' as const,
          trendValue: '+5.2%',
          icon: 'Users',
          hasChart: true,
          chartType: 'area' as const
        },
        {
          title: 'Tasa de Conversión',
          value: '20%',
          subtitle: 'De prueba a pago, por encima del 18%',
          trend: 'up' as const,
          trendValue: '',
          icon: 'TrendingUp',
          hasChart: false
        },
        {
          title: 'Puntuación NPS',
          value: '45',
          subtitle: 'Categoría: Bueno, Objetivo: 50+',
          trend: 'neutral' as const,
          icon: 'Star',
          hasChart: false
        },
        {
          title: 'Tasa de Retención',
          value: '88%',
          subtitle: 'Mensual: Estable, pero necesita mejora',
          trend: 'neutral' as const,
          icon: 'Users',
          hasChart: true,
          chartType: 'bar' as const
        },
        {
          title: 'Tasa de Abandono Mensual',
          value: '4.5%',
          subtitle: 'Necesita atención, por debajo del objetivo < 3%',
          trend: 'down' as const,
          trendValue: 'Objetivo de Abandono',
          icon: 'AlertTriangle',
          hasChart: true,
          chartType: 'area' as const
        }
      ];
    } else {
      return [
        {
          title: 'Active Users',
          value: '35,000',
          subtitle: '+3.2% compared to previous',
          trend: 'up' as const,
          trendValue: '+3.2%',
          icon: 'Users',
          hasChart: true,
          chartType: 'area' as const
        },
        {
          title: 'Retention Rate',
          value: '88%',
          subtitle: 'Monthly stable, but needs improvement',
          trend: 'neutral' as const,
          icon: 'Users',
          hasChart: true,
          chartType: 'bar' as const
        },
        {
          title: 'Revenue Growth',
          value: '24.5%',
          subtitle: 'Year over year growth',
          trend: 'up' as const,
          trendValue: '+5.2%',
          icon: 'DollarSign',
          hasChart: true,
          chartType: 'area' as const
        },
        {
          title: 'NPS Score',
          value: '45',
          subtitle: 'Company Goal Target: 50+',
          trend: 'neutral' as const,
          icon: 'Star',
          hasChart: false
        },
        {
          title: 'Monthly Churn Rate',
          value: '4.5%',
          subtitle: 'Down from last year\'s 8%',
          trend: 'down' as const,
          trendValue: '-3.5%',
          icon: 'AlertTriangle',
          hasChart: false
        }
      ];
    }
  };

  // Use provided KPI cards or generate adaptive ones
  const adaptiveKPICards = getAdaptiveKPICards(); // Always use generated cards with charts

  // Generate adaptive description if not provided
  const getAdaptiveDescription = () => {
    if (description && description.trim() !== '') {
      return description;
    }

    // Detect language from title
    const isSpanish = /[áéíóúñü]|indicadores|clave|métricas|rendimiento|ventas|ingresos|clientes|crecimiento|análisis|datos|información/i.test(title || '');

    if (isSpanish) {
      return 'El rendimiento del producto es la base del crecimiento. Al evaluar cómo las características web resuenan con los usuarios y su impacto en la participación, desbloqueamos oportunidades para escalar efectivamente.';
    } else {
      return 'Product performance is the backbone of growth. By evaluating how web features resonate with users and their impact on engagement, we unlock opportunities to scale effectively.';
    }
  };

  const adaptiveDescription = getAdaptiveDescription();

  // Interactive text state
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(adaptiveDescription);
  // Generate adaptive summary text based on actual KPI card data
  const getAdaptiveSummaryText = () => {
    // Detect language from title and description
    const isSpanish = /[áéíóúñü]|indicadores|clave|métricas|rendimiento|ventas|ingresos|clientes|crecimiento|análisis|datos|información|financiero|negocios|servicios/i.test((title || '') + ' ' + (description || ''));

    // Get the first KPI card as the primary metric for the summary
    const primaryKPI = adaptiveKPICards[0];
    const secondaryKPI = adaptiveKPICards[1];
    const tertiaryKPI = adaptiveKPICards[2];

    if (!primaryKPI) {
      // Fallback if no KPI cards are available
      if (isSpanish) {
        return {
          summaryNumber: '35K',
          summaryLabel: 'usuarios activos,',
          summaryText: 'métricas de rendimiento sólidas con indicadores clave positivos y tendencias de crecimiento estables.'
        };
      } else {
        return {
          summaryNumber: '35K',
          summaryLabel: 'active users,',
          summaryText: 'solid performance metrics with positive key indicators and stable growth trends.'
        };
      }
    }

    // Extract values from actual KPI cards
    const primaryValue = primaryKPI.value;
    const primaryTitle = primaryKPI.title.toLowerCase();
    const secondaryValue = secondaryKPI?.value || '';
    const secondaryTitle = secondaryKPI?.title.toLowerCase() || '';
    const tertiaryValue = tertiaryKPI?.value || '';
    const tertiaryTitle = tertiaryKPI?.title.toLowerCase() || '';

    if (isSpanish) {
      // Generate Spanish summary with actual values
      let summaryText = '';
      
      if (secondaryKPI && tertiaryKPI) {
        summaryText = `con ${secondaryTitle} de ${secondaryValue} y ${tertiaryTitle} de ${tertiaryValue}. `;
      } else if (secondaryKPI) {
        summaryText = `con ${secondaryTitle} de ${secondaryValue}. `;
      }
      
      // Add context based on the number of KPI cards
      if (adaptiveKPICards.length > 3) {
        summaryText += `El análisis de ${adaptiveKPICards.length} indicadores muestra un rendimiento sólido con tendencias positivas en todas las métricas clave.`;
      } else {
        summaryText += `Los indicadores principales muestran un rendimiento estable con oportunidades de crecimiento.`;
      }

      return {
        summaryNumber: primaryValue,
        summaryLabel: `${primaryTitle},`,
        summaryText: summaryText
      };
    } else {
      // Generate English summary with actual values
      let summaryText = '';
      
      if (secondaryKPI && tertiaryKPI) {
        summaryText = `with ${secondaryTitle} of ${secondaryValue} and ${tertiaryTitle} of ${tertiaryValue}. `;
      } else if (secondaryKPI) {
        summaryText = `with ${secondaryTitle} of ${secondaryValue}. `;
      }
      
      // Add context based on the number of KPI cards
      if (adaptiveKPICards.length > 3) {
        summaryText += `Analysis of ${adaptiveKPICards.length} indicators shows solid performance with positive trends across all key metrics.`;
      } else {
        summaryText += `Primary indicators show stable performance with growth opportunities.`;
      }

      return {
        summaryNumber: primaryValue,
        summaryLabel: `${primaryTitle},`,
        summaryText: summaryText
      };
    }
  };

  const adaptiveSummary = getAdaptiveSummaryText();

  const [currentSummaryNumber, setCurrentSummaryNumber] = useState(adaptiveSummary.summaryNumber);
  const [currentSummaryLabel, setCurrentSummaryLabel] = useState(adaptiveSummary.summaryLabel);
  const [currentSummaryText, setCurrentSummaryText] = useState(adaptiveSummary.summaryText);

  // Update summary text when KPI cards change
  useEffect(() => {
    const newSummary = getAdaptiveSummaryText();
    setCurrentSummaryNumber(newSummary.summaryNumber);
    setCurrentSummaryLabel(newSummary.summaryLabel);
    setCurrentSummaryText(newSummary.summaryText);
  }, [adaptiveKPICards, title]); // Re-run when KPI cards or title changes

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

  // Text styling state
  const [titleFontSizeState, setTitleFontSize] = useState(titleFontSize);
  const [titleFontFamilyState, setTitleFontFamily] = useState(titleFontFamily);
  const [currentTitleColor, setCurrentTitleColor] = useState(titleColor);
  const [currentTitleAlignment, setCurrentTitleAlignment] = useState<'left' | 'center' | 'right'>(titleAlignment);
  const [titleWidth, setTitleWidth] = useState(400);

  const [descriptionFontSizeState, setDescriptionFontSize] = useState(descriptionFontSize);
  const [descriptionFontFamilyState, setDescriptionFontFamily] = useState(descriptionFontFamily);
  const [currentDescriptionColor, setCurrentDescriptionColor] = useState(descriptionColor);
  const [currentDescriptionAlignment, setCurrentDescriptionAlignment] = useState<'left' | 'center' | 'right'>(descriptionAlignment);

  const [summaryNumberFontSize, setSummaryNumberFontSize] = useState(18);
  const [summaryNumberFontFamily, setSummaryNumberFontFamily] = useState('font-helvetica-neue');
  const [currentSummaryNumberColor, setCurrentSummaryNumberColor] = useState('#1f2937');
  const [currentSummaryNumberAlignment, setCurrentSummaryNumberAlignment] = useState<'left' | 'center' | 'right'>('left');

  const [summaryLabelFontSize, setSummaryLabelFontSize] = useState(10);
  const [summaryLabelFontFamily, setSummaryLabelFontFamily] = useState('font-helvetica-neue');
  const [currentSummaryLabelColor, setCurrentSummaryLabelColor] = useState('#6b7280');
  const [currentSummaryLabelAlignment, setCurrentSummaryLabelAlignment] = useState<'left' | 'center' | 'right'>('left');

  const [summaryTextFontSize, setSummaryTextFontSize] = useState(10);
  const [summaryTextFontFamily, setSummaryTextFontFamily] = useState('font-helvetica-neue');
  const [currentSummaryTextColor, setCurrentSummaryTextColor] = useState('#6b7280');
  const [currentSummaryTextAlignment, setCurrentSummaryTextAlignment] = useState<'left' | 'center' | 'right'>('left');

  // KPI Card text states - for each card's title, value, and subtitle
  const [kpiCardTexts, setKpiCardTexts] = useState({
    titles: adaptiveKPICards.map(card => card.title),
    values: adaptiveKPICards.map(card => card.value),
    subtitles: adaptiveKPICards.map(card => card.subtitle || '')
  });
  
  // KPI Card text styling states - use props if available, otherwise defaults
  const [kpiTitleFontSizesState, setKpiTitleFontSizes] = useState(
    kpiTitleFontSizes.length > 0 ? kpiTitleFontSizes : adaptiveKPICards.map(() => 10)
  );
  const [kpiTitleFontFamiliesState, setKpiTitleFontFamilies] = useState(
    kpiTitleFontFamilies.length > 0 ? kpiTitleFontFamilies : adaptiveKPICards.map(() => 'font-helvetica-neue')
  );
  const [kpiTitleColorsState, setKpiTitleColors] = useState(
    kpiTitleColors.length > 0 ? kpiTitleColors : adaptiveKPICards.map(() => '#6B7280')
  );
  const [kpiTitleAlignmentsState, setKpiTitleAlignments] = useState<('left' | 'center' | 'right')[]>(
    kpiTitleAlignments.length > 0 ? kpiTitleAlignments : adaptiveKPICards.map(() => 'left')
  );
  
  const [kpiValueFontSizesState, setKpiValueFontSizes] = useState(
    kpiValueFontSizes.length > 0 ? kpiValueFontSizes : adaptiveKPICards.map(() => 24)
  );
  const [kpiValueFontFamiliesState, setKpiValueFontFamilies] = useState(
    kpiValueFontFamilies.length > 0 ? kpiValueFontFamilies : adaptiveKPICards.map(() => 'font-helvetica-neue')
  );
  const [kpiValueColorsState, setKpiValueColors] = useState(
    kpiValueColors.length > 0 ? kpiValueColors : adaptiveKPICards.map((card, index) => 
      (card.title === 'Active Users' || card.title === 'Revenue Growth' || card.title === 'Usuarios Activos' || card.title === 'Crecimiento de Ingresos') ? '#10b981' : 
      (card.title === 'Retention Rate' || card.title === 'Tasa de Retención') ? '#10b981' : '#111827'
    )
  );
  const [kpiValueAlignmentsState, setKpiValueAlignments] = useState<('left' | 'center' | 'right')[]>(
    kpiValueAlignments.length > 0 ? kpiValueAlignments : adaptiveKPICards.map(() => 'left')
  );
  
  const [kpiSubtitleFontSizesState, setKpiSubtitleFontSizes] = useState(
    kpiSubtitleFontSizes.length > 0 ? kpiSubtitleFontSizes : adaptiveKPICards.map(() => 9)
  );
  const [kpiSubtitleFontFamiliesState, setKpiSubtitleFontFamilies] = useState(
    kpiSubtitleFontFamilies.length > 0 ? kpiSubtitleFontFamilies : adaptiveKPICards.map(() => 'font-helvetica-neue')
  );
  const [kpiSubtitleColorsState, setKpiSubtitleColors] = useState(
    kpiSubtitleColors.length > 0 ? kpiSubtitleColors : adaptiveKPICards.map(() => '#6B7280')
  );
  const [kpiSubtitleAlignmentsState, setKpiSubtitleAlignments] = useState<('left' | 'center' | 'right')[]>(
    kpiSubtitleAlignments.length > 0 ? kpiSubtitleAlignments : adaptiveKPICards.map(() => 'left')
  );

  // Sync props with state when they change (CRITICAL for secondary text editing)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  // KPI styling prop synchronization
  useEffect(() => {
    if (kpiTitleFontSizes.length > 0) {
      setKpiTitleFontSizes(kpiTitleFontSizes);
    }
  }, [JSON.stringify(kpiTitleFontSizes)]);

  useEffect(() => {
    if (kpiTitleFontFamilies.length > 0) {
      setKpiTitleFontFamilies(kpiTitleFontFamilies);
    }
  }, [JSON.stringify(kpiTitleFontFamilies)]);

  useEffect(() => {
    if (kpiTitleColors.length > 0) {
      setKpiTitleColors(kpiTitleColors);
    }
  }, [JSON.stringify(kpiTitleColors)]);

  useEffect(() => {
    if (kpiTitleAlignments.length > 0) {
      setKpiTitleAlignments(kpiTitleAlignments);
    }
  }, [JSON.stringify(kpiTitleAlignments)]);

  useEffect(() => {
    if (kpiValueFontSizes.length > 0) {
      setKpiValueFontSizes(kpiValueFontSizes);
    }
  }, [JSON.stringify(kpiValueFontSizes)]);

  useEffect(() => {
    if (kpiValueFontFamilies.length > 0) {
      setKpiValueFontFamilies(kpiValueFontFamilies);
    }
  }, [JSON.stringify(kpiValueFontFamilies)]);

  useEffect(() => {
    if (kpiValueColors.length > 0) {
      setKpiValueColors(kpiValueColors);
    }
  }, [JSON.stringify(kpiValueColors)]);

  useEffect(() => {
    if (kpiValueAlignments.length > 0) {
      setKpiValueAlignments(kpiValueAlignments);
    }
  }, [JSON.stringify(kpiValueAlignments)]);

  useEffect(() => {
    if (kpiSubtitleFontSizes.length > 0) {
      setKpiSubtitleFontSizes(kpiSubtitleFontSizes);
    }
  }, [JSON.stringify(kpiSubtitleFontSizes)]);

  useEffect(() => {
    if (kpiSubtitleFontFamilies.length > 0) {
      setKpiSubtitleFontFamilies(kpiSubtitleFontFamilies);
    }
  }, [JSON.stringify(kpiSubtitleFontFamilies)]);

  useEffect(() => {
    if (kpiSubtitleColors.length > 0) {
      setKpiSubtitleColors(kpiSubtitleColors);
    }
  }, [JSON.stringify(kpiSubtitleColors)]);

  useEffect(() => {
    if (kpiSubtitleAlignments.length > 0) {
      setKpiSubtitleAlignments(kpiSubtitleAlignments);
    }
  }, [JSON.stringify(kpiSubtitleAlignments)]);


  useEffect(() => {
    if (kpiCards && Array.isArray(kpiCards)) {
      setKpiCardTexts({
        titles: kpiCards.map(card => card.title),
        values: kpiCards.map(card => card.value),
        subtitles: kpiCards.map(card => card.subtitle || '')
      });
    }
  }, [kpiCards]);

  // Text selection handlers with initial transforms and onUpdate
  // Persistent position states for each text element (absolute positions on canvas)
  const [titlePosition, setTitlePosition] = useState({ x: 48, y: 52 }); // Start at left padding position
  const [descriptionPosition, setDescriptionPosition] = useState({ x: 48, y: 85 }); // Moved higher: 52 + 33

  // Text selection hooks with positional persistence
  // Adjust initial transforms to account for base positions so cursor follows properly
  const [textSelectionState, textSelectionHandlers] = useFigmaSelection({
    initialTitleTransform: savedTitleTransform || { x: -48, y: -52 },
    initialDescriptionTransform: savedDescriptionTransform || { x: -48, y: -85 },
    onUpdate: onUpdate
  });
  
  // Individual selection states for each text element
  const [selectedTextElement, setSelectedTextElement] = useState<'title' | 'description' | 'summaryNumber' | 'summaryLabel' | 'summaryText' | string | null>(null);
  const [summaryNumberPosition, setSummaryNumberPosition] = useState({ x: 48, y: 182 }); // 32 + 150
  const [summaryLabelPosition, setSummaryLabelPosition] = useState({ x: 48, y: 207 }); // 32 + 175
  const [summaryTextPosition, setSummaryTextPosition] = useState({ x: 48, y: 227 }); // 32 + 195
  
  // Text popup state - expanded to include KPI element types
  const [textPopupState, setTextPopupState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    originalPosition: { x: 0, y: 0 },
    currentFontSize: 16,
    currentFontFamily: 'Helvetica Neue',
    targetElement: null as 'title' | 'description' | 'summaryNumber' | 'summaryLabel' | 'summaryText' | string | null,
    lastTargetElement: null as 'title' | 'description' | 'summaryNumber' | 'summaryLabel' | 'summaryText' | string | null
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

  // 🔧 PROP-STATE SYNCHRONIZATION: Update local state when props change (from autosave)
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  useEffect(() => {
    // Only sync when kpiCards prop actually exists and changes (from database load)
    if (kpiCards && kpiCards.length > 0) {
      setKpiCardTexts({
        titles: kpiCards.map(card => card.title || ''),
        values: kpiCards.map(card => card.value || ''),
        subtitles: kpiCards.map(card => card.subtitle || '')
      });
    }
  }, [kpiCards]);

  const handleSummaryNumberTextChange = (newText: string) => {
    setCurrentSummaryNumber(newText);
    if (onUpdate) {
      onUpdate({ summaryNumber: newText });
    }
  };

  const handleSummaryLabelTextChange = (newText: string) => {
    setCurrentSummaryLabel(newText);
    if (onUpdate) {
      onUpdate({ summaryLabel: newText });
    }
  };

  const handleSummaryTextTextChange = (newText: string) => {
    setCurrentSummaryText(newText);
    if (onUpdate) {
      onUpdate({ summaryText: newText });
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

  // Summary Number style handlers
  const handleSummaryNumberChangeSize = (fontSize: number) => {
    setSummaryNumberFontSize(fontSize);
  };

  const handleSummaryNumberChangeFont = (fontFamily: string) => {
    setSummaryNumberFontFamily(fontFamily);
  };

  const handleSummaryNumberChangeColor = (color: string) => {
    setCurrentSummaryNumberColor(color);
  };

  const handleSummaryNumberChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentSummaryNumberAlignment(alignment);
  };

  // Summary Label style handlers
  const handleSummaryLabelChangeSize = (fontSize: number) => {
    setSummaryLabelFontSize(fontSize);
  };

  const handleSummaryLabelChangeFont = (fontFamily: string) => {
    setSummaryLabelFontFamily(fontFamily);
  };

  const handleSummaryLabelChangeColor = (color: string) => {
    setCurrentSummaryLabelColor(color);
  };

  const handleSummaryLabelChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentSummaryLabelAlignment(alignment);
  };

  // Summary Text style handlers
  const handleSummaryTextChangeSize = (fontSize: number) => {
    setSummaryTextFontSize(fontSize);
  };

  const handleSummaryTextChangeFont = (fontFamily: string) => {
    setSummaryTextFontFamily(fontFamily);
  };

  const handleSummaryTextChangeColor = (color: string) => {
    setCurrentSummaryTextColor(color);
  };

  const handleSummaryTextChangeAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentSummaryTextAlignment(alignment);
  };

  // Delete handlers
  const handleTitleDelete = () => {
    setCurrentTitle('');
  };

  const handleDescriptionDelete = () => {
    setCurrentDescription('');
  };

  const handleSummaryNumberDelete = () => {
    setCurrentSummaryNumber('');
  };

  const handleSummaryLabelDelete = () => {
    setCurrentSummaryLabel('');
  };

  const handleSummaryTextDelete = () => {
    setCurrentSummaryText('');
  };

  // KPI Card text change handlers
  const handleKpiTitleChange = (cardIndex: number, newText: string) => {
    setKpiCardTexts(prev => ({
      ...prev,
      titles: prev.titles.map((title, i) => i === cardIndex ? newText : title)
    }));
    if (onUpdate) {
      // Update the kpiCards array structure properly - use adaptiveKPICards which is the actual data being used
      const updatedKpiCards = adaptiveKPICards.map((card, i) => 
        i === cardIndex ? { ...card, title: newText } : card
      );
      onUpdate({ kpiCards: updatedKpiCards });
    }
  };

  const handleKpiValueChange = (cardIndex: number, newText: string) => {
    setKpiCardTexts(prev => ({
      ...prev,
      values: prev.values.map((value, i) => i === cardIndex ? newText : value)
    }));
    if (onUpdate) {
      // Update the kpiCards array structure properly - use adaptiveKPICards which is the actual data being used
      const updatedKpiCards = adaptiveKPICards.map((card, i) => 
        i === cardIndex ? { ...card, value: newText } : card
      );
      onUpdate({ kpiCards: updatedKpiCards });
    }
  };

  const handleKpiSubtitleChange = (cardIndex: number, newText: string) => {
    setKpiCardTexts(prev => ({
      ...prev,
      subtitles: prev.subtitles.map((subtitle, i) => i === cardIndex ? newText : subtitle)
    }));
    if (onUpdate) {
      // Update the kpiCards array structure properly - use adaptiveKPICards which is the actual data being used
      const updatedKpiCards = adaptiveKPICards.map((card, i) => 
        i === cardIndex ? { ...card, subtitle: newText } : card
      );
      onUpdate({ kpiCards: updatedKpiCards });
    }
  };

  // KPI Card text delete handlers
  const handleKpiTitleDelete = (cardIndex: number) => {
    handleKpiTitleChange(cardIndex, '');
  };

  const handleKpiValueDelete = (cardIndex: number) => {
    handleKpiValueChange(cardIndex, '');
  };

  const handleKpiSubtitleDelete = (cardIndex: number) => {
    handleKpiSubtitleChange(cardIndex, '');
  };

  // Function to deselect all other text elements when a new one is selected
  const deselectAllOtherElements = (newSelectedElement: string | null) => {
    // Reset transforms for all text selection handlers to prevent position jumping
    if (textSelectionHandlers.handleTitleSizeChange) {
      textSelectionHandlers.handleTitleSizeChange({ x: 0, y: 0 });
    }
    if (textSelectionHandlers.handleDescriptionSizeChange) {
      textSelectionHandlers.handleDescriptionSizeChange({ x: 0, y: 0 });
    }
    
    // Set the new selected element (or null to deselect all)
    setSelectedTextElement(newSelectedElement);
    
    // If deselecting all, also close popup
    if (newSelectedElement === null) {
      textSelectionHandlers.handleClickOutside();
      setTextPopupState(prev => ({ 
        ...prev, 
        isOpen: false,
        targetElement: null,
        lastTargetElement: null
      }));
    }
  };

  // Size change handlers
  const handleTitleSizeChange = (newTransform: any) => {
    // Update title width when resize handles are used
    if (newTransform && newTransform.width) {
      setTitleWidth(newTransform.width);
    }
    textSelectionHandlers.handleTitleSizeChange?.(newTransform);
  };

  const handleDescriptionSizeChange = (newTransform: any) => {
    textSelectionHandlers.handleDescriptionSizeChange?.(newTransform);
  };

  // Custom click handlers for single selection
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deselectAllOtherElements('title');
    textSelectionHandlers.handleTitleClick(e);
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deselectAllOtherElements('description');
    textSelectionHandlers.handleDescriptionClick(e);
  };

  const handleSummaryNumberClick = (e: React.MouseEvent) => {
    deselectAllOtherElements('summaryNumber');
    textSelectionHandlers.handleTitleClick(e); // Use title handlers for summary number
  };

  const handleSummaryLabelClick = (e: React.MouseEvent) => {
    deselectAllOtherElements('summaryLabel');
    textSelectionHandlers.handleDescriptionClick(e); // Use description handlers for summary label
  };

  const handleSummaryTextClick = (e: React.MouseEvent) => {
    deselectAllOtherElements('summaryText');
    textSelectionHandlers.handleDescriptionClick(e); // Use description handlers for summary text
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

  // Simplified position tracking - commit transforms to base positions when dragging ends
  useEffect(() => {
    // Handle title dragging end
    if (prevDraggingRef.current.isTitleDragging && !textSelectionState.isTitleDragging) {
      if (textSelectionState.titleTransform) {
        if (selectedTextElement === 'title') {
          setTitlePosition(prev => ({
            x: prev.x + (textSelectionState.titleTransform?.x || 0),
            y: prev.y + (textSelectionState.titleTransform?.y || 0)
          }));
        } else if (selectedTextElement === 'summaryNumber') {
          setSummaryNumberPosition(prev => ({
            x: prev.x + (textSelectionState.titleTransform?.x || 0),
            y: prev.y + (textSelectionState.titleTransform?.y || 0)
          }));
        }
        // Reset transform after committing position to prevent jumping
        if (textSelectionHandlers.handleTitleSizeChange) {
          textSelectionHandlers.handleTitleSizeChange({ x: 0, y: 0 });
        }
      }
    }

    // Handle description dragging end
    if (prevDraggingRef.current.isDescriptionDragging && !textSelectionState.isDescriptionDragging) {
      if (textSelectionState.descriptionTransform) {
        if (selectedTextElement === 'description') {
          setDescriptionPosition(prev => ({
            x: prev.x + (textSelectionState.descriptionTransform?.x || 0),
            y: prev.y + (textSelectionState.descriptionTransform?.y || 0)
          }));
        } else if (selectedTextElement === 'summaryLabel') {
          setSummaryLabelPosition(prev => ({
            x: prev.x + (textSelectionState.descriptionTransform?.x || 0),
            y: prev.y + (textSelectionState.descriptionTransform?.y || 0)
          }));
        } else if (selectedTextElement === 'summaryText') {
          setSummaryTextPosition(prev => ({
            x: prev.x + (textSelectionState.descriptionTransform?.x || 0),
            y: prev.y + (textSelectionState.descriptionTransform?.y || 0)
          }));
        }
        // Reset transform after committing position to prevent jumping
        if (textSelectionHandlers.handleDescriptionSizeChange) {
          textSelectionHandlers.handleDescriptionSizeChange({ x: 0, y: 0 });
        }
      }
    }

    // Update tracking
    prevDraggingRef.current = {
      isTitleDragging: textSelectionState.isTitleDragging,
      isDescriptionDragging: textSelectionState.isDescriptionDragging
    };
  }, [textSelectionState.isTitleDragging, textSelectionState.isDescriptionDragging, selectedTextElement]);

  // Update popup position when text is dragged
  useEffect(() => {
    if (textPopupState.isOpen && (textPopupState.targetElement || textPopupState.lastTargetElement)) {
      const activeTarget = textPopupState.targetElement || textPopupState.lastTargetElement;
      
      const transform = activeTarget === 'title' || activeTarget === 'summaryNumber'
        ? textSelectionState.titleTransform 
        : textSelectionState.descriptionTransform;
      
      const isDragging = activeTarget === 'title' || activeTarget === 'summaryNumber'
        ? textSelectionState.isTitleDragging
        : textSelectionState.isDescriptionDragging;

      const wasDragging = activeTarget === 'title' || activeTarget === 'summaryNumber'
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
  }, [
    textSelectionState.titleTransform, 
    textSelectionState.descriptionTransform, 
    textSelectionState.isTitleDragging,
    textSelectionState.isDescriptionDragging,
    textPopupState.isOpen, 
    textPopupState.targetElement,
    textPopupState.lastTargetElement
  ]);

  // Global click outside handler
  const handleGlobalClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isFigmaElement = target.closest('[class*="figma-"]') || 
                          target.closest('[data-figma-element]') ||
                          target.closest('.title-layer') ||
                          target.closest('.description-layer') ||
                          target.closest('.summary-number-layer') ||
                          target.closest('.summary-label-layer') ||
                          target.closest('.summary-text-layer') ||
                          target.closest('[data-text-popup]') ||
                          target.closest('[data-color-area]') ||
                          target.closest('[data-hue-slider]');
    
    if (isFigmaElement) {
      return;
    }
    
    // Use the centralized deselection function
    deselectAllOtherElements(null);
  };

  const containerStyle = useFixedDimensions ? {
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
    position: 'relative' as const
  } : {
    overflow: 'visible',
    contain: 'layout style',
    position: 'relative' as const
  };

  const containerClasses = useFixedDimensions
    ? `impact-kpi-overview bg-white ${className}`
    : `impact-kpi-overview bg-white w-full h-full min-h-[400px] ${className}`;

  // Memoized position calculations for better performance
  const titleStyle = useMemo(() => ({
    left: `${titlePosition.x + (savedTitleTransform?.x || 0)}px`,
    top: `${titlePosition.y + (savedTitleTransform?.y || 0)}px`,
    width: 'auto',
    zIndex: textSelectionState.isTitleSelected ? 30 : 1,
    // Critical: Allow infinite expansion beyond canvas
    overflow: 'visible',
    contain: 'none',
    // Ensure no layout influence on parent
    position: 'absolute' as const
  }), [titlePosition, savedTitleTransform, textSelectionState.isTitleSelected]);

  const descriptionStyle = useMemo(() => ({
    left: `${descriptionPosition.x + (savedDescriptionTransform?.x || 0)}px`,
    top: `${descriptionPosition.y + (savedDescriptionTransform?.y || 0)}px`,
    width: 'auto',
    zIndex: textSelectionState.isDescriptionSelected ? 30 : 1,
    // Critical: Allow infinite expansion beyond canvas
    overflow: 'visible',
    contain: 'none',
    // Ensure no layout influence on parent
    position: 'absolute' as const
  }), [descriptionPosition, savedDescriptionTransform, textSelectionState.isDescriptionSelected]);

  const summaryNumberStyle = useMemo(() => ({
    left: `${summaryNumberPosition.x + (selectedTextElement === 'summaryNumber' && textSelectionState.titleTransform ? textSelectionState.titleTransform.x || 0 : 0)}px`,
    top: `${summaryNumberPosition.y + (selectedTextElement === 'summaryNumber' && textSelectionState.titleTransform ? textSelectionState.titleTransform.y || 0 : 0)}px`,
    width: 'auto',
    zIndex: selectedTextElement === 'summaryNumber' ? 30 : 1,
    overflow: 'visible',
    contain: 'none',
    position: 'absolute' as const
  }), [summaryNumberPosition, selectedTextElement, textSelectionState.titleTransform]);

  const summaryLabelStyle = useMemo(() => ({
    left: `${summaryLabelPosition.x + (selectedTextElement === 'summaryLabel' && textSelectionState.descriptionTransform ? textSelectionState.descriptionTransform.x || 0 : 0)}px`,
    top: `${summaryLabelPosition.y + (selectedTextElement === 'summaryLabel' && textSelectionState.descriptionTransform ? textSelectionState.descriptionTransform.y || 0 : 0)}px`,
    width: 'auto',
    zIndex: selectedTextElement === 'summaryLabel' ? 30 : 1,
    overflow: 'visible',
    contain: 'none',
    position: 'absolute' as const
  }), [summaryLabelPosition, selectedTextElement, textSelectionState.descriptionTransform]);

  const summaryTextStyle = useMemo(() => ({
    left: `${summaryTextPosition.x + (selectedTextElement === 'summaryText' && textSelectionState.descriptionTransform ? textSelectionState.descriptionTransform.x || 0 : 0)}px`,
    top: `${summaryTextPosition.y + (selectedTextElement === 'summaryText' && textSelectionState.descriptionTransform ? textSelectionState.descriptionTransform.y || 0 : 0)}px`,
    width: 'auto',
    zIndex: selectedTextElement === 'summaryText' ? 30 : 1,
    overflow: 'visible',
    contain: 'none',
    position: 'absolute' as const
  }), [summaryTextPosition, selectedTextElement, textSelectionState.descriptionTransform]);

  const content = (
    <section
      className={containerClasses}
      style={containerStyle}
      onClick={handleGlobalClickOutside}
    >
        {/* Layout matching the image: Title and description on left, KPI cards on right */}
        <div className="relative h-full">
          
          {/* All Text Elements - Completely Independent, Can Move Anywhere */}
            {layout.showTitle && (
              <div 
                className="title-layer absolute pointer-events-auto"
                style={titleStyle}
              >
                <FigmaText
                  variant="title"
                  color={currentTitleColor}
                  align={currentTitleAlignment}
                  fontFamily={titleFontFamilyState}
                  className={`font-normal text-3xl lg:text-4xl xl:text-5xl leading-none tracking-tighter break-words`}
                  style={{
                    fontSize: `${titleFontSizeState}px`,
                    color: currentTitleColor,
                    textAlign: currentTitleAlignment,
                    lineHeight: '1',
                    letterSpacing: '-0.025em',
                    fontWeight: '400',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: `${titleWidth}px`
                  }}
                  isSelected={textSelectionState.isTitleSelected}
                  transform={undefined}
                  onClick={(e: React.MouseEvent) => handleTitleClick(e)}
                  onTextChange={handleTitleTextChange}
                  onSizeChange={handleTitleSizeChange}
                  onChangeSize={handleTitleChangeSize}
                  onChangeFont={handleTitleChangeFont}
                  onDragStart={handleTitleDragStart}
                  useFixedWidth={true}
                  onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                  onDeleteText={handleTitleDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const titleElement = document.querySelector('.impact-kpi-overview .title-layer');
                    if (titleElement) {
                      const titleRect = titleElement.getBoundingClientRect();
                      const canvasContainer = titleElement.closest('.impact-kpi-overview') as HTMLElement;
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

            {layout.showDescription && currentDescription && (
              <div 
                className="description-layer absolute pointer-events-auto"
                style={descriptionStyle}
              >
                <FigmaText
                  variant="body"
                  color={currentDescriptionColor}
                  align={currentDescriptionAlignment}
                  fontFamily={descriptionFontFamilyState}
                  className={`text-xs leading-relaxed break-words max-w-56`}
                  style={{
                    fontSize: `${descriptionFontSizeState}px`,
                    color: currentDescriptionColor,
                    textAlign: currentDescriptionAlignment,
                    lineHeight: '1.4',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={textSelectionState.isDescriptionSelected}
                  transform={undefined}
                  onClick={(e: React.MouseEvent) => handleDescriptionClick(e)}
                  onTextChange={handleDescriptionTextChange}
                  onSizeChange={handleDescriptionSizeChange}
                  onChangeSize={handleDescriptionChangeSize}
                  onChangeFont={handleDescriptionChangeFont}
                  onDragStart={handleDescriptionDragStart}
                  onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                  onDeleteText={handleDescriptionDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const descriptionElement = document.querySelector('.impact-kpi-overview .description-layer');
                    if (descriptionElement) {
                      const descriptionRect = descriptionElement.getBoundingClientRect();
                      const canvasContainer = descriptionElement.closest('.impact-kpi-overview') as HTMLElement;
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

            {/* Summary metrics text - Interactive */}
            {layout.showSummary && (
              <>
                {/* Summary Number */}
                <div 
                  className="summary-number-layer absolute pointer-events-auto"
                  style={summaryNumberStyle}
                >
                <FigmaText
                  variant="title"
                  color={currentSummaryNumberColor}
                  align={currentSummaryNumberAlignment}
                  fontFamily={summaryNumberFontFamily}
                  className="text-lg font-bold break-words"
                  style={{
                    fontSize: `${summaryNumberFontSize}px`,
                    color: currentSummaryNumberColor,
                    textAlign: currentSummaryNumberAlignment,
                    fontWeight: 'bold',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={selectedTextElement === 'summaryNumber'}
                  transform={selectedTextElement === 'summaryNumber' && textSelectionState.isTitleSelected ? textSelectionState.titleTransform : undefined}
                  onClick={(e: React.MouseEvent) => handleSummaryNumberClick(e)}
                  onTextChange={handleSummaryNumberTextChange}
                  onSizeChange={handleTitleSizeChange}
                  onChangeSize={handleSummaryNumberChangeSize}
                  onChangeFont={handleSummaryNumberChangeFont}
                  onDragStart={handleTitleDragStart}
                  onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                  onDeleteText={handleSummaryNumberDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const summaryNumberElement = document.querySelector('.impact-kpi-overview .summary-number-layer');
                    if (summaryNumberElement) {
                      const rect = summaryNumberElement.getBoundingClientRect();
                      const canvasContainer = summaryNumberElement.closest('.impact-kpi-overview') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (rect.left - canvasRect.left) - 10;
                        const relativeY = (rect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily,
                          targetElement: 'summaryNumber',
                          lastTargetElement: 'summaryNumber'
                        });
                      }
                    }
                  }}>
                  {currentSummaryNumber}
                </FigmaText>
              </div>

              {/* Summary Label */}
              <div 
                className="summary-label-layer absolute pointer-events-auto"
                style={summaryLabelStyle}
              >
                <FigmaText
                  variant="body"
                  color={currentSummaryLabelColor}
                  align={currentSummaryLabelAlignment}
                  fontFamily={summaryLabelFontFamily}
                  className="text-xs break-words"
                  style={{
                    fontSize: `${summaryLabelFontSize}px`,
                    color: currentSummaryLabelColor,
                    textAlign: currentSummaryLabelAlignment,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={selectedTextElement === 'summaryLabel'}
                  transform={selectedTextElement === 'summaryLabel' && textSelectionState.isDescriptionSelected ? textSelectionState.descriptionTransform : undefined}
                  onClick={(e: React.MouseEvent) => handleSummaryLabelClick(e)}
                  onTextChange={handleSummaryLabelTextChange}
                  onSizeChange={handleDescriptionSizeChange}
                  onChangeSize={handleSummaryLabelChangeSize}
                  onChangeFont={handleSummaryLabelChangeFont}
                  onDragStart={handleDescriptionDragStart}
                  onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                  onDeleteText={handleSummaryLabelDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const summaryLabelElement = document.querySelector('.impact-kpi-overview .summary-label-layer');
                    if (summaryLabelElement) {
                      const rect = summaryLabelElement.getBoundingClientRect();
                      const canvasContainer = summaryLabelElement.closest('.impact-kpi-overview') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (rect.left - canvasRect.left) - 10;
                        const relativeY = (rect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily,
                          targetElement: 'summaryLabel',
                          lastTargetElement: 'summaryLabel'
                        });
                      }
                    }
                  }}>
                  {currentSummaryLabel}
                </FigmaText>
            </div>

              {/* Summary Text */}
              <div 
                className="summary-text-layer absolute pointer-events-auto"
                style={{
                  left: `${summaryTextPosition.x + (selectedTextElement === 'summaryText' && textSelectionState.descriptionTransform ? textSelectionState.descriptionTransform.x || 0 : 0)}px`,
                  top: `${summaryTextPosition.y + (selectedTextElement === 'summaryText' && textSelectionState.descriptionTransform ? textSelectionState.descriptionTransform.y || 0 : 0)}px`,
                  width: 'auto',
                  zIndex: selectedTextElement === 'summaryText' ? 30 : 1,
                  // Critical: Allow infinite expansion beyond canvas
                  overflow: 'visible',
                  contain: 'none',
                  // Ensure no layout influence on parent
                  position: 'absolute' as const
                }}
              >
                <FigmaText
                  variant="body"
                  color={currentSummaryTextColor}
                  align={currentSummaryTextAlignment}
                  fontFamily={summaryTextFontFamily}
                  className="text-xs leading-relaxed break-words max-w-56"
                  style={{
                    fontSize: `${summaryTextFontSize}px`,
                    color: currentSummaryTextColor,
                    textAlign: currentSummaryTextAlignment,
                    lineHeight: '1.4',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  isSelected={selectedTextElement === 'summaryText'}
                  transform={selectedTextElement === 'summaryText' && textSelectionState.isDescriptionSelected ? textSelectionState.descriptionTransform : undefined}
                  onClick={(e: React.MouseEvent) => handleSummaryTextClick(e)}
                  onTextChange={handleSummaryTextTextChange}
                  onSizeChange={handleDescriptionSizeChange}
                  onChangeSize={handleSummaryTextChangeSize}
                  onChangeFont={handleSummaryTextChangeFont}
                  onDragStart={handleDescriptionDragStart}
                  onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                  onDeleteText={handleSummaryTextDelete}
                  onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                    const summaryTextElement = document.querySelector('.impact-kpi-overview .summary-text-layer');
                    if (summaryTextElement) {
                      const rect = summaryTextElement.getBoundingClientRect();
                      const canvasContainer = summaryTextElement.closest('.impact-kpi-overview') as HTMLElement;
                      if (canvasContainer) {
                        const canvasRect = canvasContainer.getBoundingClientRect();
                        const relativeX = (rect.left - canvasRect.left) - 10;
                        const relativeY = (rect.top - canvasRect.top) - 50;
                        
                        setTextPopupState({
                          isOpen: true,
                          position: { x: relativeX, y: relativeY },
                          originalPosition: { x: relativeX, y: relativeY },
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily,
                          targetElement: 'summaryText',
                          lastTargetElement: 'summaryText'
                        });
                      }
                    }
                  }}>
                  {currentSummaryText}
                </FigmaText>
                </div>
              </>
            )}

          {/* Right Section - KPI Cards Grid - Fixed position, no layout influence */}
          {layout.showKpiCards && (
            <div 
              className="absolute flex gap-4 kpi-cards-container"
              style={{
                left: '368px', // 320px + 48px padding
                top: '32px', // pt-8 = 32px
                right: '48px', // pr-12 = 48px
                bottom: '32px', // pb-8 = 32px
                zIndex: 10,
                // Prevent layout influence
                contain: 'layout style',
                overflow: 'visible'
              }}
            >
              {/* First Column */}
              <div className="flex-1 space-y-2">
                {adaptiveKPICards.slice(0, 2).map((card, sliceIndex) => {
                  const index = sliceIndex; // First column uses indices 0, 1
                  const hasChart = card.hasChart === true || card.title === 'Retention Rate'; // Force Retention Rate to have chart
                  if (card.title === 'Retention Rate') {
                    console.log('Retention Rate card debug:', {
                      title: card.title,
                      hasChart: card.hasChart,
                      chartType: card.chartType,
                      calculatedHasChart: hasChart,
                      index: index
                    });
                  }
                  return (
                <div key={index} className={`bg-white border border-gray-200 rounded-lg ${hasChart ? 'p-6' : 'p-4'} ${hasChart ? 'flex flex-col' : ''} relative z-20`} style={!hasChart ? { height: '80px', flexShrink: 0 } : {}}>
                  {/* Header with icon and title */}
                  <div className={`flex items-center ${hasChart ? 'mb-1' : 'mb-0'}`}>
                    <IconBlock 
                      iconName={card.icon as any} 
                      size={12} 
                      color="#6B7280" 
                      className="mr-2" 
                    />
                    <FigmaText
                      variant="body"
                      color={kpiTitleColorsState[index]}
                      align={kpiTitleAlignmentsState[index]}
                      fontFamily={kpiTitleFontFamiliesState[index]}
                      className="text-gray-600 font-medium"
                      style={{
                        fontSize: `${kpiTitleFontSizesState[index]}px`,
                        color: kpiTitleColorsState[index],
                        textAlign: kpiTitleAlignmentsState[index]
                      }}
                      isSelected={selectedTextElement === `kpi-title-${index}`}
                      transform={selectedTextElement === `kpi-title-${index}` && textSelectionState.isTitleSelected ? textSelectionState.titleTransform : undefined}
                      onClick={(e: React.MouseEvent) => {
                        deselectAllOtherElements(`kpi-title-${index}`);
                        textSelectionHandlers.handleTitleClick(e);
                      }}
                      onTextChange={(newText: string) => handleKpiTitleChange(index, newText)}
                      onSizeChange={handleTitleSizeChange}
                      onChangeSize={(fontSize: number) => {
                        setKpiTitleFontSizes(prev => {
                          const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                          if (onUpdate) {
                            onUpdate({ kpiTitleFontSizes: newSizes });
                          }
                          return newSizes;
                        });
                      }}
                      onDragStart={handleTitleDragStart}
                      useFixedWidth={false}
                      onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                      onDeleteText={() => handleKpiTitleDelete(index)}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        if (textPopupState.isOpen && (textPopupState.targetElement === `kpi-title-${index}` || textPopupState.lastTargetElement === `kpi-title-${index}`)) {
                          setTextPopupState(prev => ({
                            ...prev,
                            targetElement: `kpi-title-${index}`,
                            lastTargetElement: `kpi-title-${index}`,
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily
                          }));
                        } else {
                          const kpiContainer = document.querySelector('.impact-kpi-overview .kpi-cards-container');
                          if (kpiContainer) {
                            const kpiRect = kpiContainer.getBoundingClientRect();
                            const canvasContainer = kpiContainer.closest('.impact-kpi-overview') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (kpiRect.left - canvasRect.left) - 10;
                              const relativeY = (kpiRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: `kpi-title-${index}`,
                                lastTargetElement: `kpi-title-${index}`
                              });
                            }
                          }
                        }
                      }}
                    >
                      {kpiCardTexts.titles[index]}
                    </FigmaText>
                  </div>
                  
                  {/* Value */}
                  <div className={`${hasChart ? 'mb-0' : '-mt-1'}`}>
                    <FigmaText
                      variant="body"
                      color={kpiValueColorsState[index]}
                      align={kpiValueAlignmentsState[index]}
                      fontFamily={kpiValueFontFamiliesState[index]}
                      className="text-3xl font-medium"
                      style={{
                        fontSize: `${kpiValueFontSizesState[index]}px`,
                        color: kpiValueColorsState[index],
                        textAlign: kpiValueAlignmentsState[index],
                        letterSpacing: '-0.02em'
                      }}
                      isSelected={selectedTextElement === `kpi-value-${index}`}
                      transform={selectedTextElement === `kpi-value-${index}` && textSelectionState.isTitleSelected ? textSelectionState.titleTransform : undefined}
                      onClick={(e: React.MouseEvent) => {
                        deselectAllOtherElements(`kpi-value-${index}`);
                        textSelectionHandlers.handleTitleClick(e);
                      }}
                      onTextChange={(newText: string) => handleKpiValueChange(index, newText)}
                      onSizeChange={handleTitleSizeChange}
                      onChangeSize={(fontSize: number) => {
                        setKpiValueFontSizes(prev => {
                          const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                          if (onUpdate) {
                            onUpdate({ kpiValueFontSizes: newSizes });
                          }
                          return newSizes;
                        });
                      }}
                      onDragStart={handleTitleDragStart}
                      useFixedWidth={false}
                      onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                      onDeleteText={() => handleKpiValueDelete(index)}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        if (textPopupState.isOpen && (textPopupState.targetElement === `kpi-value-${index}` || textPopupState.lastTargetElement === `kpi-value-${index}`)) {
                          setTextPopupState(prev => ({
                            ...prev,
                            targetElement: `kpi-value-${index}`,
                            lastTargetElement: `kpi-value-${index}`,
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily
                          }));
                        } else {
                          const kpiContainer = document.querySelector('.impact-kpi-overview .kpi-cards-container');
                          if (kpiContainer) {
                            const kpiRect = kpiContainer.getBoundingClientRect();
                            const canvasContainer = kpiContainer.closest('.impact-kpi-overview') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (kpiRect.left - canvasRect.left) - 10;
                              const relativeY = (kpiRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: `kpi-value-${index}`,
                                lastTargetElement: `kpi-value-${index}`
                              });
                            }
                          }
                        }
                      }}
                    >
                      {kpiCardTexts.values[index]}
                    </FigmaText>
                  </div>
                  
                  {/* Subtitle */}
                  <FigmaText
                    variant="body"
                    color={kpiSubtitleColorsState[index]}
                    align={kpiSubtitleAlignmentsState[index]}
                    fontFamily={kpiSubtitleFontFamiliesState[index]}
                    className={`text-gray-500 ${hasChart ? 'mb-1' : 'mb-0'}`}
                    style={{
                      fontSize: `${kpiSubtitleFontSizesState[index]}px`,
                      color: kpiSubtitleColorsState[index],
                      textAlign: kpiSubtitleAlignmentsState[index]
                    }}
                    isSelected={selectedTextElement === `kpi-subtitle-${index}`}
                    transform={selectedTextElement === `kpi-subtitle-${index}` && textSelectionState.isDescriptionSelected ? textSelectionState.descriptionTransform : undefined}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements(`kpi-subtitle-${index}`);
                      textSelectionHandlers.handleDescriptionClick(e);
                    }}
                    onTextChange={(newText: string) => handleKpiSubtitleChange(index, newText)}
                    onSizeChange={handleDescriptionSizeChange}
                    onChangeSize={(fontSize: number) => {
                      setKpiSubtitleFontSizes(prev => {
                        const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                        if (onUpdate) {
                          onUpdate({ kpiSubtitleFontSizes: newSizes });
                        }
                        return newSizes;
                      });
                    }}
                    onDragStart={handleDescriptionDragStart}
                    useFixedWidth={false}
                    onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                    onDeleteText={() => handleKpiSubtitleDelete(index)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      if (textPopupState.isOpen && (textPopupState.targetElement === `kpi-subtitle-${index}` || textPopupState.lastTargetElement === `kpi-subtitle-${index}`)) {
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: `kpi-subtitle-${index}`,
                          lastTargetElement: `kpi-subtitle-${index}`,
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        const kpiContainer = document.querySelector('.impact-kpi-overview .kpi-cards-container');
                        if (kpiContainer) {
                          const kpiRect = kpiContainer.getBoundingClientRect();
                          const canvasContainer = kpiContainer.closest('.impact-kpi-overview') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (kpiRect.left - canvasRect.left) - 10;
                            const relativeY = (kpiRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: `kpi-subtitle-${index}`,
                              lastTargetElement: `kpi-subtitle-${index}`
                            });
                          }
                        }
                      }
                    }}
                  >
                    {kpiCardTexts.subtitles[index]}
                  </FigmaText>
                  
                  {/* Chart area */}
                  {hasChart && (
                    <div className="flex-1 min-h-[80px] -mx-6 -mb-6 mt-2 flex flex-col justify-end">
                      {(card.chartType === 'bar' || card.title === 'Retention Rate') && (
                        <div className="flex items-end space-x-1 h-full w-full px-0 pb-0 pt-2">
                          {card.title === 'Retention Rate' ? 
                            // Retention Rate specific chart - showing monthly progress
                            [0.75, 0.82, 0.78, 0.85, 0.88, 0.86, 0.90, 0.88].map((height, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                  className="w-full"
                                  style={{ 
                                    height: `${height * 60}px`,
                                    backgroundColor: i === 6 ? '#10b981' : '#d1d5db',
                                    borderTopLeftRadius: '3px',
                                    borderTopRightRadius: '3px',
                                    minHeight: '20px'
                                  }}
                                />
                              </div>
                            )) :
                            // Default bar chart for other cards
                            [0.4, 0.6, 0.5, 0.7, 0.8, 0.6, 0.9, 0.7].map((height, i) => (
                              <div
                                key={i}
                                className="flex-1"
                                style={{ 
                                  height: `${height * 100}%`,
                                  backgroundColor: i === 6 ? '#10b981' : '#86efac',
                                  borderTopLeftRadius: '2px',
                                  borderTopRightRadius: '2px'
                                }}
                              />
                            ))
                          }
                        </div>
                      )}
                      {card.chartType === 'area' && (
                        <div className="w-full h-full relative">
                          <svg viewBox="0 0 100 50" className="w-full h-full" style={{ width: '100%', height: '100%' }}>
                            {card.title === 'Revenue Growth' ? (
                              // Revenue Growth - Line chart with dots
                              <>
                                {/* Straight line segments */}
                                <polyline
                                  points="0,35 16,30 32,25 48,20 64,25 80,15 100,20"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="1"
                                />
                                {/* Dots at each point - smaller and directly on the line */}
                                {[
                                  { x: 0, y: 35 },
                                  { x: 16, y: 30 },
                                  { x: 32, y: 25 },
                                  { x: 48, y: 20 },
                                  { x: 64, y: 25 },
                                  { x: 80, y: 15 },
                                  { x: 100, y: 20 }
                                ].map((point, i) => (
                                  <circle
                                    key={i}
                                    cx={point.x}
                                    cy={point.y}
                                    r="1.5"
                                    fill="#10b981"
                                  />
                                ))}
                              </>
                            ) : (
                              // Other charts - keep original area chart
                              <>
                                <defs>
                                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.4"/>
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                                  </linearGradient>
                                </defs>
                                <path
                                  d={card.title === 'Retention Rate' ? 
                                    "M0,15 Q15,18 25,22 Q35,25 45,28 Q55,32 65,35 Q75,38 85,40 L100,42 L100,50 L0,50 Z" :
                                    "M0,35 Q15,30 25,25 Q35,20 45,18 Q55,16 65,14 Q75,12 85,10 L100,8 L100,50 L0,50 Z"
                                  }
                                  fill={`url(#gradient-${index})`}
                                  stroke="none"
                                />
                                <path
                                  d={card.title === 'Retention Rate' ? 
                                    "M0,15 Q15,18 25,22 Q35,25 45,28 Q55,32 65,35 Q75,38 85,40 L100,42" :
                                    "M0,35 Q15,30 25,25 Q35,20 45,18 Q55,16 65,14 Q75,12 85,10 L100,8"
                                  }
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2"
                                />
                              </>
                            )}
                          </svg>
                        </div>
                      )}
                      {card.chartType === 'bar' && (
                        <div className="flex items-end space-x-1 h-full w-full px-2">
                          {[0.4, 0.6, 0.5, 0.7, 0.8, 0.6, 0.9, 0.7].map((height, i) => (
                            <div
                              key={i}
                              className="flex-1"
                              style={{ 
                                height: `${height * 100}%`,
                                backgroundColor: i === 6 ? '#10b981' : '#86efac',
                                borderTopLeftRadius: '2px',
                                borderTopRightRadius: '2px'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
              </div>
              
              {/* Second Column */}
              <div className="flex-1 space-y-2">
                {adaptiveKPICards.slice(2).map((card, sliceIndex) => {
                  const index = sliceIndex + 2; // Second column uses indices 2, 3, 4
                  const hasChart = card.hasChart === true; // Only true if explicitly true
                  return (
                <div key={index} className={`bg-white border border-gray-200 rounded-lg ${hasChart ? 'p-6' : 'p-4'} ${hasChart ? 'flex flex-col' : ''}`} style={!hasChart ? { height: '80px', flexShrink: 0 } : {}}>
                  {/* Header with icon and title */}
                  <div className={`flex items-center ${hasChart ? 'mb-1' : 'mb-0'}`}>
                    <IconBlock 
                      iconName={card.icon as any} 
                      size={12} 
                      color="#6B7280" 
                      className="mr-2" 
                    />
                    <FigmaText
                      variant="body"
                      color={kpiTitleColorsState[index]}
                      align={kpiTitleAlignmentsState[index]}
                      fontFamily={kpiTitleFontFamiliesState[index]}
                      className="text-gray-600 font-medium"
                      style={{
                        fontSize: `${kpiTitleFontSizesState[index]}px`,
                        color: kpiTitleColorsState[index],
                        textAlign: kpiTitleAlignmentsState[index]
                      }}
                      isSelected={selectedTextElement === `kpi-title-${index}`}
                      transform={selectedTextElement === `kpi-title-${index}` && textSelectionState.isTitleSelected ? textSelectionState.titleTransform : undefined}
                      onClick={(e: React.MouseEvent) => {
                        deselectAllOtherElements(`kpi-title-${index}`);
                        textSelectionHandlers.handleTitleClick(e);
                      }}
                      onTextChange={(newText: string) => handleKpiTitleChange(index, newText)}
                      onSizeChange={handleTitleSizeChange}
                      onChangeSize={(fontSize: number) => {
                        setKpiTitleFontSizes(prev => {
                          const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                          if (onUpdate) {
                            onUpdate({ kpiTitleFontSizes: newSizes });
                          }
                          return newSizes;
                        });
                      }}
                      onDragStart={handleTitleDragStart}
                      useFixedWidth={false}
                      onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                      onDeleteText={() => handleKpiTitleDelete(index)}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        if (textPopupState.isOpen && (textPopupState.targetElement === `kpi-title-${index}` || textPopupState.lastTargetElement === `kpi-title-${index}`)) {
                          setTextPopupState(prev => ({
                            ...prev,
                            targetElement: `kpi-title-${index}`,
                            lastTargetElement: `kpi-title-${index}`,
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily
                          }));
                        } else {
                          const kpiContainer = document.querySelector('.impact-kpi-overview .kpi-cards-container');
                          if (kpiContainer) {
                            const kpiRect = kpiContainer.getBoundingClientRect();
                            const canvasContainer = kpiContainer.closest('.impact-kpi-overview') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (kpiRect.left - canvasRect.left) - 10;
                              const relativeY = (kpiRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: `kpi-title-${index}`,
                                lastTargetElement: `kpi-title-${index}`
                              });
                            }
                          }
                        }
                      }}
                    >
                      {kpiCardTexts.titles[index]}
                    </FigmaText>
                  </div>
                  
                  {/* Value */}
                  <div className={`${hasChart ? 'mb-0' : '-mt-1'}`}>
                    <FigmaText
                      variant="body"
                      color={kpiValueColorsState[index]}
                      align={kpiValueAlignmentsState[index]}
                      fontFamily={kpiValueFontFamiliesState[index]}
                      className="text-3xl font-medium"
                      style={{
                        fontSize: `${kpiValueFontSizesState[index]}px`,
                        color: kpiValueColorsState[index],
                        textAlign: kpiValueAlignmentsState[index],
                        letterSpacing: '-0.02em'
                      }}
                      isSelected={selectedTextElement === `kpi-value-${index}`}
                      transform={selectedTextElement === `kpi-value-${index}` && textSelectionState.isTitleSelected ? textSelectionState.titleTransform : undefined}
                      onClick={(e: React.MouseEvent) => {
                        deselectAllOtherElements(`kpi-value-${index}`);
                        textSelectionHandlers.handleTitleClick(e);
                      }}
                      onTextChange={(newText: string) => handleKpiValueChange(index, newText)}
                      onSizeChange={handleTitleSizeChange}
                      onChangeSize={(fontSize: number) => {
                        setKpiValueFontSizes(prev => {
                          const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                          if (onUpdate) {
                            onUpdate({ kpiValueFontSizes: newSizes });
                          }
                          return newSizes;
                        });
                      }}
                      onDragStart={handleTitleDragStart}
                      useFixedWidth={false}
                      onResizeStart={textSelectionHandlers.handleTitleResizeStart}
                      onDeleteText={() => handleKpiValueDelete(index)}
                      onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                        if (textPopupState.isOpen && (textPopupState.targetElement === `kpi-value-${index}` || textPopupState.lastTargetElement === `kpi-value-${index}`)) {
                          setTextPopupState(prev => ({
                            ...prev,
                            targetElement: `kpi-value-${index}`,
                            lastTargetElement: `kpi-value-${index}`,
                            currentFontSize: fontSize,
                            currentFontFamily: fontFamily
                          }));
                        } else {
                          const kpiContainer = document.querySelector('.impact-kpi-overview .kpi-cards-container');
                          if (kpiContainer) {
                            const kpiRect = kpiContainer.getBoundingClientRect();
                            const canvasContainer = kpiContainer.closest('.impact-kpi-overview') as HTMLElement;
                            if (canvasContainer) {
                              const canvasRect = canvasContainer.getBoundingClientRect();
                              const relativeX = (kpiRect.left - canvasRect.left) - 10;
                              const relativeY = (kpiRect.top - canvasRect.top) - 50;
                              
                              setTextPopupState({
                                isOpen: true,
                                position: { x: relativeX, y: relativeY },
                                originalPosition: { x: relativeX, y: relativeY },
                                currentFontSize: fontSize,
                                currentFontFamily: fontFamily,
                                targetElement: `kpi-value-${index}`,
                                lastTargetElement: `kpi-value-${index}`
                              });
                            }
                          }
                        }
                      }}
                    >
                      {kpiCardTexts.values[index]}
                    </FigmaText>
                  </div>
                  
                  {/* Subtitle */}
                  <FigmaText
                    variant="body"
                    color={kpiSubtitleColorsState[index]}
                    align={kpiSubtitleAlignmentsState[index]}
                    fontFamily={kpiSubtitleFontFamiliesState[index]}
                    className={`text-gray-500 ${hasChart ? 'mb-1' : 'mb-0'}`}
                    style={{
                      fontSize: `${kpiSubtitleFontSizesState[index]}px`,
                      color: kpiSubtitleColorsState[index],
                      textAlign: kpiSubtitleAlignmentsState[index]
                    }}
                    isSelected={selectedTextElement === `kpi-subtitle-${index}`}
                    transform={selectedTextElement === `kpi-subtitle-${index}` && textSelectionState.isDescriptionSelected ? textSelectionState.descriptionTransform : undefined}
                    onClick={(e: React.MouseEvent) => {
                      deselectAllOtherElements(`kpi-subtitle-${index}`);
                      textSelectionHandlers.handleDescriptionClick(e);
                    }}
                    onTextChange={(newText: string) => handleKpiSubtitleChange(index, newText)}
                    onSizeChange={handleDescriptionSizeChange}
                    onChangeSize={(fontSize: number) => {
                      setKpiSubtitleFontSizes(prev => {
                        const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                        if (onUpdate) {
                          onUpdate({ kpiSubtitleFontSizes: newSizes });
                        }
                        return newSizes;
                      });
                    }}
                    onDragStart={handleDescriptionDragStart}
                    useFixedWidth={false}
                    onResizeStart={textSelectionHandlers.handleDescriptionResizeStart}
                    onDeleteText={() => handleKpiSubtitleDelete(index)}
                    onShowPopup={(position: { x: number; y: number }, fontSize: number, fontFamily: string) => {
                      if (textPopupState.isOpen && (textPopupState.targetElement === `kpi-subtitle-${index}` || textPopupState.lastTargetElement === `kpi-subtitle-${index}`)) {
                        setTextPopupState(prev => ({
                          ...prev,
                          targetElement: `kpi-subtitle-${index}`,
                          lastTargetElement: `kpi-subtitle-${index}`,
                          currentFontSize: fontSize,
                          currentFontFamily: fontFamily
                        }));
                      } else {
                        const kpiContainer = document.querySelector('.impact-kpi-overview .kpi-cards-container');
                        if (kpiContainer) {
                          const kpiRect = kpiContainer.getBoundingClientRect();
                          const canvasContainer = kpiContainer.closest('.impact-kpi-overview') as HTMLElement;
                          if (canvasContainer) {
                            const canvasRect = canvasContainer.getBoundingClientRect();
                            const relativeX = (kpiRect.left - canvasRect.left) - 10;
                            const relativeY = (kpiRect.top - canvasRect.top) - 50;
                            
                            setTextPopupState({
                              isOpen: true,
                              position: { x: relativeX, y: relativeY },
                              originalPosition: { x: relativeX, y: relativeY },
                              currentFontSize: fontSize,
                              currentFontFamily: fontFamily,
                              targetElement: `kpi-subtitle-${index}`,
                              lastTargetElement: `kpi-subtitle-${index}`
                            });
                          }
                        }
                      }
                    }}
                  >
                    {kpiCardTexts.subtitles[index]}
                  </FigmaText>
                  
                  {/* Chart area */}
                  {hasChart && (
                    <div className="flex-1 min-h-[80px] -mx-6 -mb-6 mt-2 flex flex-col justify-end">
                      {card.chartType === 'area' && (
                        <div className="w-full h-full relative">
                          <svg viewBox="0 0 100 50" className="w-full h-full" style={{ width: '100%', height: '100%' }}>
                            {card.title === 'Revenue Growth' ? (
                              // Revenue Growth - Line chart with dots
                              <>
                                {/* Straight line segments */}
                                <polyline
                                  points="0,35 16,30 32,25 48,20 64,25 80,15 100,20"
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="1"
                                />
                                {/* Dots at each point - smaller and directly on the line */}
                                {[
                                  { x: 0, y: 35 },
                                  { x: 16, y: 30 },
                                  { x: 32, y: 25 },
                                  { x: 48, y: 20 },
                                  { x: 64, y: 25 },
                                  { x: 80, y: 15 },
                                  { x: 100, y: 20 }
                                ].map((point, i) => (
                                  <circle
                                    key={i}
                                    cx={point.x}
                                    cy={point.y}
                                    r="1.5"
                                    fill="#10b981"
                                  />
                                ))}
                              </>
                            ) : (
                              // Other charts - keep original area chart
                              <>
                                <defs>
                                  <linearGradient id={`gradient-${index + 2}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.4"/>
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                                  </linearGradient>
                                </defs>
                                <path
                                  d={card.title === 'Retention Rate' ? 
                                    "M0,15 Q15,18 25,22 Q35,25 45,28 Q55,32 65,35 Q75,38 85,40 L100,42 L100,50 L0,50 Z" :
                                    "M0,35 Q15,30 25,25 Q35,20 45,18 Q55,16 65,14 Q75,12 85,10 L100,8 L100,50 L0,50 Z"
                                  }
                                  fill={`url(#gradient-${index + 2})`}
                                  stroke="none"
                                />
                                <path
                                  d={card.title === 'Retention Rate' ? 
                                    "M0,15 Q15,18 25,22 Q35,25 45,28 Q55,32 65,35 Q75,38 85,40 L100,42" :
                                    "M0,35 Q15,30 25,25 Q35,20 45,18 Q55,16 65,14 Q75,12 85,10 L100,8"
                                  }
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2"
                                />
                              </>
                            )}
                          </svg>
                        </div>
                      )}
                      {(card.chartType === 'bar' || card.title === 'Retention Rate') && (
                        <div className="flex items-end space-x-1 h-full w-full px-0 pb-0 pt-2">
                          {card.title === 'Retention Rate' ? 
                            // Retention Rate specific chart - showing monthly progress
                            [0.75, 0.82, 0.78, 0.85, 0.88, 0.86, 0.90, 0.88].map((height, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                  className="w-full"
                                  style={{ 
                                    height: `${height * 60}px`,
                                    backgroundColor: i === 6 ? '#10b981' : '#d1d5db',
                                    borderTopLeftRadius: '3px',
                                    borderTopRightRadius: '3px',
                                    minHeight: '20px'
                                  }}
                                />
                              </div>
                            )) :
                            // Default bar chart for other cards
                            [0.4, 0.6, 0.5, 0.7, 0.8, 0.6, 0.9, 0.7].map((height, i) => (
                              <div
                                key={i}
                                className="flex-1"
                                style={{ 
                                  height: `${height * 100}%`,
                                  backgroundColor: i === 6 ? '#10b981' : '#86efac',
                                  borderTopLeftRadius: '2px',
                                  borderTopRightRadius: '2px'
                                }}
                              />
                            ))
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
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
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeSize(fontSize);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeSize(fontSize);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeSize(fontSize);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ kpiTitleFontSizes: newSizes });
                }
                return newSizes;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ kpiValueFontSizes: newSizes });
                }
                return newSizes;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleFontSizes: newSizes });
                }
                return newSizes;
              });
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeFont(fontFamily);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeFont(fontFamily);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeFont(fontFamily);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ kpiTitleFontFamilies: newFonts });
                }
                return newFonts;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ kpiValueFontFamilies: newFonts });
                }
                return newFonts;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleFontFamilies: newFonts });
                }
                return newFonts;
              });
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeColor(color);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeColor(color);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeColor(color);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ kpiTitleColors: newColors });
                }
                return newColors;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ kpiValueColors: newColors });
                }
                return newColors;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleColors: newColors });
                }
                return newColors;
              });
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeAlignment(alignment);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeAlignment(alignment);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeAlignment(alignment);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ kpiTitleAlignments: newAlignments });
                }
                return newAlignments;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ kpiValueAlignments: newAlignments });
                }
                return newAlignments;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleAlignments: newAlignments });
                }
                return newAlignments;
              });
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'description' ? currentDescriptionColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryNumber' ? currentSummaryNumberColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryLabel' ? currentSummaryLabelColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryText' ? currentSummaryTextColor :
            currentDescriptionColor
          }
          currentAlignment={
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'description' ? currentDescriptionAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryNumber' ? currentSummaryNumberAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryLabel' ? currentSummaryLabelAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryText' ? currentSummaryTextAlignment :
            currentDescriptionAlignment
          }
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target === 'summaryNumber') {
              handleSummaryNumberDelete();
            } else if (target === 'summaryLabel') {
              handleSummaryLabelDelete();
            } else if (target === 'summaryText') {
              handleSummaryTextDelete();
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              handleKpiTitleDelete(index);
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              handleKpiValueDelete(index);
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              handleKpiSubtitleDelete(index);
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
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
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeSize(fontSize);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeSize(fontSize);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeSize(fontSize);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ kpiTitleFontSizes: newSizes });
                }
                return newSizes;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ kpiValueFontSizes: newSizes });
                }
                return newSizes;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleFontSizes(prev => {
                const newSizes = prev.map((size, i) => i === index ? fontSize : size);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleFontSizes: newSizes });
                }
                return newSizes;
              });
            }
          }}
          onChangeFont={(fontFamily) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeFont(fontFamily);
            } else if (target === 'description') {
              handleDescriptionChangeFont(fontFamily);
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeFont(fontFamily);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeFont(fontFamily);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeFont(fontFamily);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ kpiTitleFontFamilies: newFonts });
                }
                return newFonts;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ kpiValueFontFamilies: newFonts });
                }
                return newFonts;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleFontFamilies(prev => {
                const newFonts = prev.map((font, i) => i === index ? fontFamily : font);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleFontFamilies: newFonts });
                }
                return newFonts;
              });
            }
          }}
          onChangeColor={(color) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeColor(color);
            } else if (target === 'description') {
              handleDescriptionChangeColor(color);
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeColor(color);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeColor(color);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeColor(color);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ kpiTitleColors: newColors });
                }
                return newColors;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ kpiValueColors: newColors });
                }
                return newColors;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleColors(prev => {
                const newColors = prev.map((c, i) => i === index ? color : c);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleColors: newColors });
                }
                return newColors;
              });
            }
          }}
          onChangeAlignment={(alignment) => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleChangeAlignment(alignment);
            } else if (target === 'description') {
              handleDescriptionChangeAlignment(alignment);
            } else if (target === 'summaryNumber') {
              handleSummaryNumberChangeAlignment(alignment);
            } else if (target === 'summaryLabel') {
              handleSummaryLabelChangeAlignment(alignment);
            } else if (target === 'summaryText') {
              handleSummaryTextChangeAlignment(alignment);
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiTitleAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ kpiTitleAlignments: newAlignments });
                }
                return newAlignments;
              });
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiValueAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ kpiValueAlignments: newAlignments });
                }
                return newAlignments;
              });
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              setKpiSubtitleAlignments(prev => {
                const newAlignments = prev.map((a, i) => i === index ? alignment : a);
                if (onUpdate) {
                  onUpdate({ kpiSubtitleAlignments: newAlignments });
                }
                return newAlignments;
              });
            }
          }}
          onClose={() => setTextPopupState(prev => ({ ...prev, isOpen: false }))}
          position={textPopupState.position}
          currentFontSize={textPopupState.currentFontSize}
          currentFontFamily={textPopupState.currentFontFamily}
          currentColor={
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'description' ? currentDescriptionColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryNumber' ? currentSummaryNumberColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryLabel' ? currentSummaryLabelColor :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryText' ? currentSummaryTextColor :
            currentDescriptionColor
          }
          currentAlignment={
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'title' ? currentTitleAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'description' ? currentDescriptionAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryNumber' ? currentSummaryNumberAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryLabel' ? currentSummaryLabelAlignment :
            (textPopupState.targetElement || textPopupState.lastTargetElement) === 'summaryText' ? currentSummaryTextAlignment :
            currentDescriptionAlignment
          }
          onDeleteText={() => {
            const target = textPopupState.targetElement || textPopupState.lastTargetElement;
            if (target === 'title') {
              handleTitleDelete();
            } else if (target === 'description') {
              handleDescriptionDelete();
            } else if (target === 'summaryNumber') {
              handleSummaryNumberDelete();
            } else if (target === 'summaryLabel') {
              handleSummaryLabelDelete();
            } else if (target === 'summaryText') {
              handleSummaryTextDelete();
            } else if (target?.startsWith('kpi-title-')) {
              const index = parseInt(target.split('-')[2]);
              handleKpiTitleDelete(index);
            } else if (target?.startsWith('kpi-value-')) {
              const index = parseInt(target.split('-')[2]);
              handleKpiValueDelete(index);
            } else if (target?.startsWith('kpi-subtitle-')) {
              const index = parseInt(target.split('-')[2]);
              handleKpiSubtitleDelete(index);
            }
            setTextPopupState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </>
  );
}
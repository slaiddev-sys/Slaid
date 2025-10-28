// All Layout Slide Types
export * from './Cover';
export * from './Index';
export * from './Quote';
export * from './Impact';
export * from './Team';
export * from './Metrics';
export * from './Lists';
export * from './Market';
export * from './Product';
export * from './Competition';
export * from './Roadmap';
export * from './Pricing';
export * from './BackCover';
export * from './Content';

// System-wide mapping
import * as CoverLayouts from './Cover';
import * as IndexLayouts from './Index';
import * as QuoteLayouts from './Quote';
import * as ImpactLayouts from './Impact';
import * as TeamLayouts from './Team';
import * as MetricsLayouts from './Metrics';
import * as ListsLayouts from './Lists';
import * as MarketLayouts from './Market';
import * as ProductLayouts from './Product';
import * as CompetitionLayouts from './Competition';
import * as RoadmapLayouts from './Roadmap';
import * as PricingLayouts from './Pricing';
import * as BackCoverLayouts from './BackCover';
import * as ContentLayouts from './Content';

// Combined layout map
export const AllLayoutsMap = {
  // Cover layouts
  Cover_LeftImageTextRight: CoverLayouts.Cover_LeftImageTextRight,
  McBook_RightSide: CoverLayouts.McBook_RightSide,
  Cover_TextCenter: CoverLayouts.Cover_TextCenter,
  Cover_LeftTitleRightBodyUnderlined: CoverLayouts.Cover_LeftTitleRightBodyUnderlined,
  
  // Index layouts
  Index_LeftAgendaRightImage: IndexLayouts.Index_LeftAgendaRightImage,
  Index_LeftAgendaRightText: IndexLayouts.Index_LeftAgendaRightText,
  
  // Quote layouts
  Quote_MissionStatement: QuoteLayouts.Quote_MissionStatement,
  Quote_LeftTextRightImage: QuoteLayouts.Quote_LeftTextRightImage,
  
  // Impact layouts
  Impact_KPIOverview: ImpactLayouts.Impact_KPIOverview,
  Impact_SustainabilityMetrics: ImpactLayouts.Impact_SustainabilityMetrics,
  Impact_ImageMetrics: ImpactLayouts.Impact_ImageMetrics,
  
  // Team layouts
  Team_AdaptiveGrid: TeamLayouts.Team_AdaptiveGrid,
  Team_MemberProfile: TeamLayouts.Team_MemberProfile,
  
  // Metrics layouts
  Metrics_FinancialsSplit: MetricsLayouts.Metrics_FinancialsSplit,
  Metrics_FullWidthChart: MetricsLayouts.Metrics_FullWidthChart,
  
  // Lists layouts
  Lists_LeftTextRightImage: ListsLayouts.Lists_LeftTextRightImage,
  Lists_GridLayout: ListsLayouts.Lists_GridLayout,
  Lists_LeftTextRightImageDescription: ListsLayouts.Lists_LeftTextRightImageDescription,
  Lists_CardsLayout: ListsLayouts.Lists_CardsLayout,
  
  // Market layouts
  Market_SizeAnalysis: MarketLayouts.Market_SizeAnalysis,
  
  // Product layouts
  Product_iPhoneShowcase: ProductLayouts.Product_iPhoneShowcase,
  Product_iPhoneStandalone: ProductLayouts.Product_iPhoneStandalone,
  Product_MacBookCentered: ProductLayouts.Product_MacBookCentered,
  Product_iPhoneCentered: ProductLayouts.Product_iPhoneCentered,
  Product_PhysicalProduct: ProductLayouts.Product_PhysicalProduct,
  McBook_Feature: ProductLayouts.McBook_Feature,
  iPhone_HandFeature: ProductLayouts.iPhone_HandFeature,
  
  // Competition layouts
  Competition_Analysis: CompetitionLayouts.Competition_Analysis,
  
  // Roadmap layouts
  // Roadmap_Timeline: RoadmapLayouts.Roadmap_Timeline, // Temporarily disabled for testing
  
  // Pricing layouts
  Pricing_Plans: PricingLayouts.Pricing_Plans,
  
  // BackCover layouts
  BackCover_ThankYou: BackCoverLayouts.BackCover_ThankYou,
  BackCover_ThankYouWithImage: BackCoverLayouts.BackCover_ThankYouWithImage,
  
  // Content layouts
  Content_TextImageDescription: ContentLayouts.Content_TextImageDescription,
} as const;

export type AllLayoutVariant = keyof typeof AllLayoutsMap;
export type SlideType = 'Cover' | 'Index' | 'Quote' | 'Impact' | 'Metrics' | 'Lists' | 'Market' | 'Product' | 'Competition' | 'Roadmap' | 'Pricing' | 'BackCover' | 'Content';

// Slide type configuration
export const SlideTypeConfig = {
  Cover: {
    variants: ['Cover_LeftImageTextRight', 'McBook_RightSide', 'Cover_TextCenter', 'Cover_LeftTitleRightBodyUnderlined'],
    description: 'Cover slide layouts for presentations'
  },
  Index: {
    variants: ['Index_LeftAgendaRightImage', 'Index_LeftAgendaRightText'],
    description: 'Index and agenda slide layouts'
  },
  Quote: {
    variants: ['Quote_MissionStatement', 'Quote_LeftTextRightImage'],
    description: 'Quote and statement slide layouts'
  },
  Impact: {
    variants: ['Impact_KPIOverview', 'Impact_SustainabilityMetrics', 'Impact_ImageMetrics'],
    description: 'Impact and statistics slide layouts'
  },
  Metrics: {
    variants: ['Metrics_FinancialsSplit', 'Metrics_FullWidthChart'],
    description: 'Metrics and data visualization slide layouts'
  },
  Lists: {
    variants: ['Lists_LeftTextRightImage', 'Lists_GridLayout'],
    description: 'Lists and structured content slide layouts'
  },
  Market: {
    variants: ['Market_SizeAnalysis'],
    description: 'Market analysis and business strategy slide layouts'
  },
  Product: {
    variants: ['Product_iPhoneShowcase', 'Product_iPhoneStandalone', 'Product_MacBookCentered', 'Product_iPhoneCentered', 'Product_PhysicalProduct', 'McBook_Feature', 'iPhone_HandFeature'],
    description: 'Product showcase and demonstration slide layouts'
  },
  // Competition: {
  //   variants: ['Competition_Analysis'],
  //   description: 'Competitive analysis and comparison slide layouts'
  // }, // Temporarily disabled
  // Roadmap: {
  //   variants: ['Roadmap_Timeline'],
  //   description: 'Project roadmaps and timeline slide layouts'
  // }, // Temporarily disabled
  Pricing: {
    variants: ['Pricing_Plans'],
    description: 'Pricing tables and subscription plan layouts'
  },
  BackCover: {
    variants: ['BackCover_ThankYou', 'BackCover_ThankYouWithImage'],
    description: 'Back cover and closing slide layouts'
  },
  Content: {
    variants: ['Content_TextImageDescription'],
    description: 'Content and informational slide layouts'
  }
} as const;

// Helper functions
export function getLayoutComponent(layoutName: AllLayoutVariant) {
  return AllLayoutsMap[layoutName];
}

export function getSlideTypeFromLayout(layoutName: string): SlideType | null {
  if (layoutName.startsWith('Cover_')) return 'Cover';
  if (layoutName.startsWith('Index_')) return 'Index';
  if (layoutName.startsWith('Quote_')) return 'Quote';
  if (layoutName.startsWith('Impact_')) return 'Impact';
  if (layoutName.startsWith('Metrics_')) return 'Metrics';
  if (layoutName.startsWith('Lists_')) return 'Lists';
  if (layoutName.startsWith('Market_')) return 'Market';
  if (layoutName.startsWith('Product_')) return 'Product';
  if (layoutName.startsWith('Competition_')) return 'Competition';
  if (layoutName.startsWith('Roadmap_')) return 'Roadmap';
  if (layoutName.startsWith('Pricing_')) return 'Pricing';
  if (layoutName.startsWith('BackCover_')) return 'BackCover';
  if (layoutName.startsWith('Content_')) return 'Content';
  return null;
}

export function isValidLayoutVariant(variant: string): variant is AllLayoutVariant {
  return variant in AllLayoutsMap;
}

// Get all variants for a slide type
export function getVariantsForSlideType(slideType: SlideType): string[] {
  return SlideTypeConfig[slideType]?.variants || [];
}

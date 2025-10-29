import { ParsedExcelData } from './documentParser';

export interface ExcelAnalysis {
  dataCategory: 'financial' | 'operational' | 'sales' | 'hr' | 'inventory' | 'marketing' | 'mixed' | 'unknown';
  confidence: number; // 0-1 confidence score
  insights: {
    keyMetrics: Array<{
      name: string;
      value: string | number;
      type: 'currency' | 'percentage' | 'count' | 'ratio' | 'date';
      trend?: 'up' | 'down' | 'stable';
      significance: 'high' | 'medium' | 'low';
    }>;
    patterns: Array<{
      type: 'trend' | 'seasonal' | 'anomaly' | 'correlation';
      description: string;
      sheets: string[];
      confidence: number;
    }>;
    relationships: Array<{
      type: 'formula_dependency' | 'data_reference' | 'summary_detail';
      source: string;
      target: string;
      description: string;
    }>;
    recommendations: Array<{
      type: 'visualization' | 'analysis' | 'data_quality';
      priority: 'high' | 'medium' | 'low';
      description: string;
      suggestedCharts?: string[];
    }>;
  };
  structure: {
    hasTimeSeries: boolean;
    hasCategories: boolean;
    hasHierarchy: boolean;
    hasCalculations: boolean;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    completeness: number; // 0-1 percentage of filled cells
  };
}

export class ExcelAnalyzer {
  
  static analyzeExcelData(data: ParsedExcelData): ExcelAnalysis {
    console.log('ExcelAnalyzer: Starting comprehensive Excel analysis...');
    
    try {
      const analysis: ExcelAnalysis = {
        dataCategory: 'unknown',
        confidence: 0,
        insights: {
          keyMetrics: [],
          patterns: [],
          relationships: [],
          recommendations: []
        },
        structure: {
          hasTimeSeries: false,
          hasCategories: false,
          hasHierarchy: false,
          hasCalculations: data?.summary?.hasFormulas || false,
          dataQuality: 'fair',
          completeness: 0
        }
      };

      // Safe check for sheets data
      if (!data || !data.sheets || typeof data.sheets !== 'object') {
        console.warn('ExcelAnalyzer: Invalid or missing sheets data');
        return analysis;
      }

      // Analyze each sheet for patterns and data types
      const sheetAnalyses = Object.entries(data.sheets).map(([sheetName, sheet]) => {
        try {
          return this.analyzeSheet(sheetName, sheet, data);
        } catch (sheetError) {
          console.warn(`ExcelAnalyzer: Error analyzing sheet "${sheetName}":`, sheetError);
          return {
            sheetName,
            patterns: {
              hasFinancialTerms: false,
              hasDateColumns: false,
              hasNumericData: false,
              hasCurrencyData: false,
              hasPercentages: false,
              hasCategories: false,
              hasFormulas: false
            },
            businessDomain: 'general',
            dataQuality: { score: 0, issues: ['Analysis failed'] },
            headers: [],
            rowCount: 0,
            formulaCount: 0,
            sampleData: []
          };
        }
      });

    // Determine overall data category
    analysis.dataCategory = this.determineDataCategory(sheetAnalyses, data);
    analysis.confidence = this.calculateConfidence(sheetAnalyses);

    // Extract key insights
    analysis.insights = this.extractInsights(sheetAnalyses, data);
    
    // Analyze structure
    analysis.structure = this.analyzeStructure(sheetAnalyses, data);

      console.log(`ExcelAnalyzer: Analysis complete - Category: ${analysis.dataCategory} (${Math.round(analysis.confidence * 100)}% confidence)`);
      
      return analysis;
      
    } catch (error) {
      console.error('ExcelAnalyzer: Critical error during analysis:', error);
      
      // Return minimal analysis on error
      return {
        dataCategory: 'unknown',
        confidence: 0,
        insights: {
          keyMetrics: [],
          patterns: [],
          relationships: [],
          recommendations: [{
            type: 'analysis',
            priority: 'high',
            description: 'Analysis failed - please check Excel file format'
          }]
        },
        structure: {
          hasTimeSeries: false,
          hasCategories: false,
          hasHierarchy: false,
          hasCalculations: false,
          dataQuality: 'poor',
          completeness: 0
        }
      };
    }
  }

  private static analyzeSheet(sheetName: string, sheet: any, data: ParsedExcelData) {
    console.log(`ExcelAnalyzer: Analyzing sheet "${sheetName}"...`);
    
    // Safe access to sheet data
    const headers = (sheet?.raw && Array.isArray(sheet.raw) && sheet.raw[0]) ? sheet.raw[0] : [];
    const dataRows = (sheet?.objects && Array.isArray(sheet.objects)) ? sheet.objects : [];
    
    // Detect data patterns
    const patterns = {
      hasFinancialTerms: this.detectFinancialTerms(headers, dataRows),
      hasDateColumns: this.detectDateColumns(headers, dataRows),
      hasNumericData: this.detectNumericData(headers, dataRows),
      hasCurrencyData: this.detectCurrencyData(headers, dataRows),
      hasPercentages: this.detectPercentages(headers, dataRows),
      hasCategories: this.detectCategories(headers, dataRows),
      hasFormulas: Object.keys(sheet.formulas || {}).length > 0
    };

    // Detect specific business domains
    const businessDomain = this.detectBusinessDomain(headers, sheetName);
    
    // Calculate data quality metrics
    const dataQuality = this.assessDataQuality(sheet);

    return {
      sheetName,
      patterns,
      businessDomain,
      dataQuality,
      headers,
      rowCount: sheet.rowCount,
      formulaCount: Object.keys(sheet.formulas || {}).length,
      sampleData: dataRows.slice(0, 5) // First 5 rows for analysis
    };
  }

  private static detectFinancialTerms(headers: string[], dataRows: any[]): boolean {
    const financialKeywords = [
      'revenue', 'income', 'profit', 'loss', 'expense', 'cost', 'budget', 'forecast',
      'sales', 'margin', 'ebitda', 'cash', 'flow', 'balance', 'assets', 'liabilities',
      'equity', 'roi', 'roa', 'roe', 'capex', 'opex', 'gross', 'net', 'tax'
    ];
    
    const headerText = headers.join(' ').toLowerCase();
    return financialKeywords.some(keyword => headerText.includes(keyword));
  }

  private static detectDateColumns(headers: string[], dataRows: any[]): boolean {
    const dateKeywords = ['date', 'month', 'year', 'quarter', 'week', 'day', 'time', 'period'];
    const headerText = headers.join(' ').toLowerCase();
    
    // Check headers for date keywords
    const hasDateHeaders = dateKeywords.some(keyword => headerText.includes(keyword));
    
    // Check data for date patterns
    const hasDateData = dataRows.some(row => 
      Object.values(row).some(value => 
        value instanceof Date || 
        (typeof value === 'string' && /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(value))
      )
    );
    
    return hasDateHeaders || hasDateData;
  }

  private static detectNumericData(headers: string[], dataRows: any[]): boolean {
    if (dataRows.length === 0) return false;
    
    const numericColumns = headers.filter(header => {
      return dataRows.some(row => typeof row[header] === 'number');
    });
    
    return numericColumns.length > 0;
  }

  private static detectCurrencyData(headers: string[], dataRows: any[]): boolean {
    const currencyKeywords = ['price', 'cost', 'amount', 'value', 'dollar', 'usd', 'eur', 'gbp'];
    const headerText = headers.join(' ').toLowerCase();
    
    // Check headers
    const hasCurrencyHeaders = currencyKeywords.some(keyword => headerText.includes(keyword));
    
    // Check data for currency symbols or large numbers
    const hasCurrencyData = dataRows.some(row =>
      Object.values(row).some(value =>
        typeof value === 'string' && /[$€£¥]/.test(value) ||
        typeof value === 'number' && value > 1000
      )
    );
    
    return hasCurrencyHeaders || hasCurrencyData;
  }

  private static detectPercentages(headers: string[], dataRows: any[]): boolean {
    const percentageKeywords = ['rate', 'percent', 'percentage', 'ratio', 'margin', 'growth'];
    const headerText = headers.join(' ').toLowerCase();
    
    const hasPercentageHeaders = percentageKeywords.some(keyword => headerText.includes(keyword));
    
    const hasPercentageData = dataRows.some(row =>
      Object.values(row).some(value =>
        typeof value === 'string' && value.includes('%') ||
        typeof value === 'number' && value > 0 && value <= 1
      )
    );
    
    return hasPercentageHeaders || hasPercentageData;
  }

  private static detectCategories(headers: string[], dataRows: any[]): boolean {
    if (dataRows.length === 0) return false;
    
    // Look for columns with repeated string values (categories)
    const categoricalColumns = headers.filter(header => {
      const values = dataRows.map(row => row[header]).filter(v => v != null);
      const uniqueValues = new Set(values);
      
      // If unique values are less than 50% of total values, it's likely categorical
      return uniqueValues.size < values.length * 0.5 && uniqueValues.size > 1;
    });
    
    return categoricalColumns.length > 0;
  }

  private static detectBusinessDomain(headers: string[], sheetName: string): string {
    const allText = (headers.join(' ') + ' ' + sheetName).toLowerCase();
    
    const domains = {
      financial: ['revenue', 'profit', 'expense', 'budget', 'financial', 'accounting', 'balance', 'income'],
      sales: ['sales', 'customer', 'lead', 'conversion', 'pipeline', 'deal', 'quota', 'territory'],
      hr: ['employee', 'salary', 'payroll', 'benefits', 'performance', 'hiring', 'staff', 'workforce'],
      marketing: ['campaign', 'marketing', 'leads', 'conversion', 'ctr', 'impressions', 'clicks', 'roi'],
      operational: ['production', 'inventory', 'supply', 'logistics', 'operations', 'efficiency', 'capacity'],
      inventory: ['stock', 'inventory', 'warehouse', 'sku', 'product', 'quantity', 'reorder', 'supplier']
    };
    
    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }

  private static assessDataQuality(sheet: any): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;
    
    try {
      // Safe access to sheet properties
      const rowCount = sheet?.rowCount || 0;
      const columnCount = sheet?.columnCount || 0;
      const objects = sheet?.objects || [];
      
      const totalCells = rowCount * columnCount;
      const filledCells = objects.reduce((count: number, row: any) => {
        if (!row || typeof row !== 'object') return count;
        return count + Object.values(row).filter(value => value != null && value !== '').length;
      }, 0);
      
      const completeness = totalCells > 0 ? filledCells / totalCells : 0;
    
    if (completeness < 0.7) {
      issues.push('High number of empty cells');
      score -= 20;
    }
    
    if (sheet.rowCount < 5) {
      issues.push('Very few data rows');
      score -= 15;
    }
    
      const formulaCount = Object.keys(sheet?.formulas || {}).length;
      if (formulaCount === 0 && rowCount > 10) {
        issues.push('No calculations detected in data-heavy sheet');
        score -= 10;
      }
      
      return { score: Math.max(0, score), issues };
      
    } catch (error) {
      console.warn('Error assessing data quality:', error);
      return { score: 50, issues: ['Could not assess data quality'] };
    }
  }

  private static determineDataCategory(sheetAnalyses: any[], data: ParsedExcelData): ExcelAnalysis['dataCategory'] {
    const domainCounts: Record<string, number> = {};
    
    sheetAnalyses.forEach(analysis => {
      domainCounts[analysis.businessDomain] = (domainCounts[analysis.businessDomain] || 0) + 1;
    });
    
    const primaryDomain = Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    switch (primaryDomain) {
      case 'financial': return 'financial';
      case 'sales': return 'sales';
      case 'hr': return 'hr';
      case 'marketing': return 'marketing';
      case 'operational': return 'operational';
      case 'inventory': return 'inventory';
      default: return Object.keys(domainCounts).length > 2 ? 'mixed' : 'unknown';
    }
  }

  private static calculateConfidence(sheetAnalyses: any[]): number {
    if (sheetAnalyses.length === 0) return 0;
    
    const avgDataQuality = sheetAnalyses.reduce((sum, analysis) => sum + analysis.dataQuality.score, 0) / sheetAnalyses.length;
    const hasConsistentDomain = sheetAnalyses.every(analysis => analysis.businessDomain === sheetAnalyses[0].businessDomain);
    const hasGoodStructure = sheetAnalyses.some(analysis => analysis.formulaCount > 0 || analysis.rowCount > 10);
    
    let confidence = avgDataQuality / 100;
    if (hasConsistentDomain) confidence += 0.2;
    if (hasGoodStructure) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  private static extractInsights(sheetAnalyses: any[], data: ParsedExcelData): ExcelAnalysis['insights'] {
    const insights: ExcelAnalysis['insights'] = {
      keyMetrics: [],
      patterns: [],
      relationships: [],
      recommendations: []
    };

    // Extract key metrics from each sheet
    sheetAnalyses.forEach(analysis => {
      if (analysis.patterns.hasNumericData) {
        // Find potential KPIs
        const numericHeaders = analysis.headers.filter((header: string) => 
          analysis.sampleData.some((row: any) => typeof row[header] === 'number')
        );
        
        numericHeaders.slice(0, 3).forEach((header: string) => {
          const values = analysis.sampleData
            .map((row: any) => row[header])
            .filter((val: any) => typeof val === 'number');
          
          if (values.length > 0) {
            const avgValue = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
            
            insights.keyMetrics.push({
              name: header,
              value: analysis.patterns.hasCurrencyData ? `$${avgValue.toLocaleString()}` : avgValue.toFixed(2),
              type: analysis.patterns.hasCurrencyData ? 'currency' : 
                    analysis.patterns.hasPercentages ? 'percentage' : 'count',
              significance: 'medium'
            });
          }
        });
      }
    });

    // Detect patterns
    if (sheetAnalyses.some(analysis => analysis.patterns.hasDateColumns)) {
      insights.patterns.push({
        type: 'trend',
        description: 'Time-series data detected - suitable for trend analysis',
        sheets: sheetAnalyses.filter(a => a.patterns.hasDateColumns).map(a => a.sheetName),
        confidence: 0.8
      });
    }

    // Generate recommendations
    const hasFinancialData = sheetAnalyses.some(analysis => analysis.patterns.hasFinancialTerms);
    const hasTimeData = sheetAnalyses.some(analysis => analysis.patterns.hasDateColumns);
    const hasCategories = sheetAnalyses.some(analysis => analysis.patterns.hasCategories);

    if (hasFinancialData && hasTimeData) {
      insights.recommendations.push({
        type: 'visualization',
        priority: 'high',
        description: 'Create financial trend charts showing performance over time',
        suggestedCharts: ['line', 'area', 'bar']
      });
    }

    if (hasCategories && sheetAnalyses.some(analysis => analysis.patterns.hasNumericData)) {
      insights.recommendations.push({
        type: 'visualization',
        priority: 'high',
        description: 'Create categorical comparisons using bar or pie charts',
        suggestedCharts: ['bar', 'pie', 'column']
      });
    }

    if (data.summary.hasFormulas) {
      insights.recommendations.push({
        type: 'analysis',
        priority: 'medium',
        description: 'Formulas detected - consider showing calculated metrics and KPIs',
        suggestedCharts: ['kpi', 'gauge', 'metric']
      });
    }

    return insights;
  }

  private static analyzeStructure(sheetAnalyses: any[], data: ParsedExcelData): ExcelAnalysis['structure'] {
    const hasTimeSeries = sheetAnalyses.some(analysis => analysis.patterns.hasDateColumns);
    const hasCategories = sheetAnalyses.some(analysis => analysis.patterns.hasCategories);
    const hasHierarchy = sheetAnalyses.some(analysis => analysis.sheetName.toLowerCase().includes('summary') || analysis.sheetName.toLowerCase().includes('total'));
    const hasCalculations = data.summary.hasFormulas;
    
    const avgDataQuality = sheetAnalyses.reduce((sum, analysis) => sum + analysis.dataQuality.score, 0) / sheetAnalyses.length;
    const dataQuality = avgDataQuality >= 80 ? 'excellent' : avgDataQuality >= 60 ? 'good' : avgDataQuality >= 40 ? 'fair' : 'poor';
    
    const totalCells = Object.values(data.sheets).reduce((sum: number, sheet: any) => sum + (sheet.rowCount * sheet.columnCount), 0);
    const filledCells = Object.values(data.sheets).reduce((sum: number, sheet: any) => {
      return sum + sheet.objects.reduce((count: number, row: any) => {
        return count + Object.values(row).filter(value => value != null && value !== '').length;
      }, 0);
    }, 0);
    
    const completeness = totalCells > 0 ? filledCells / totalCells : 0;

    return {
      hasTimeSeries,
      hasCategories,
      hasHierarchy,
      hasCalculations,
      dataQuality,
      completeness
    };
  }
}

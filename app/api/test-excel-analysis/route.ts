import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ExcelAnalyzer } from '../../../utils/excelAnalyzer';
import { ParsedExcelData } from '../../../utils/documentParser';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to generate ASCII line chart
function generateASCIILineChart(labels: string[], data: number[], title: string): string {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  const height = 8;
  
  let chart = `   ${title} Trend:\n`;
  chart += `   ${maxValue} |`;
  
  // Generate the chart
  for (let i = height; i >= 0; i--) {
    const threshold = minValue + (range * i / height);
    let line = `${threshold.toFixed(0).padStart(6)} |`;
    
    for (let j = 0; j < Math.min(data.length, 12); j++) {
      if (data[j] >= threshold) {
        line += '██';
      } else {
        line += '  ';
      }
    }
    chart += line + '\n';
  }
  
  // Add labels
  chart += '       |';
  for (let i = 0; i < Math.min(labels.length, 12); i++) {
    chart += labels[i].substring(0, 2);
  }
  
  return chart;
}

// Helper function to generate ASCII bar chart
function generateASCIIBarChart(labels: string[], actual: number[], goal: number[]): string {
  const maxValue = Math.max(...actual, ...goal);
  let chart = `   Actual vs Goal Revenue:\n`;
  
  for (let i = 0; i < Math.min(labels.length, 6); i++) {
    const actualBar = '█'.repeat(Math.round((actual[i] / maxValue) * 20));
    const goalBar = '░'.repeat(Math.round((goal[i] / maxValue) * 20));
    
    chart += `   ${labels[i].substring(0, 3)}: ${actualBar.padEnd(20)} $${actual[i]}\n`;
    chart += `        ${goalBar.padEnd(20)} $${goal[i]} (goal)\n`;
  }
  
  chart += `   Legend: █ Actual Revenue  ░ Goal Revenue`;
  
  return chart;
}

// Helper function to generate comprehensive analysis report
function generateComprehensiveReport(excelData: ParsedExcelData, analysis: any): string {
  // Safe access to summary data
  const summary = excelData?.summary || {
    totalSheets: 0,
    sheetNames: [],
    totalCells: 0,
    totalFormulas: 0,
    fileMetadata: {
      author: 'Unknown',
      created: 'Unknown',
      modified: 'Unknown',
      title: 'Untitled'
    }
  };

  const analysisData = analysis || {
    dataCategory: 'unknown',
    confidence: 0,
    structure: {
      dataQuality: 'unknown',
      completeness: 0
    }
  };

  let report = `
🔍 COMPREHENSIVE EXCEL ANALYSIS REPORT
=====================================

📊 FILE OVERVIEW:
• Total Sheets: ${summary.totalSheets}
• Sheet Names: ${summary.sheetNames.join(', ')}
• Total Cells: ${summary.totalCells}
• Formulas Found: ${summary.totalFormulas}
• Data Category: ${analysisData.dataCategory.toUpperCase()} (${Math.round(analysisData.confidence * 100)}% confidence)
• Data Quality: ${analysisData.structure.dataQuality.toUpperCase()}
• Completeness: ${Math.round(analysisData.structure.completeness * 100)}%

📈 FILE METADATA:
• Author: ${summary.fileMetadata.author || 'Unknown'}
• Created: ${summary.fileMetadata.created || 'Unknown'}
• Modified: ${summary.fileMetadata.modified || 'Unknown'}
• Title: ${summary.fileMetadata.title || 'Untitled'}

🔍 DETAILED SHEET ANALYSIS:
`;

  // Safe access to sheets data
  const sheets = excelData?.sheets || {};
  Object.entries(sheets).forEach(([sheetName, sheet]) => {
    const safeSheet = sheet || {
      rowCount: 0,
      columnCount: 0,
      range: 'A1:A1',
      formulas: {},
      mergedCells: [],
      comments: {},
      raw: [],
      objects: []
    };

    report += `
📋 SHEET: "${sheetName}"
• Dimensions: ${safeSheet.rowCount} rows × ${safeSheet.columnCount} columns
• Range: ${safeSheet.range}
• Formulas: ${Object.keys(safeSheet.formulas || {}).length}
• Merged Cells: ${safeSheet.mergedCells?.length || 0}
• Comments: ${Object.keys(safeSheet.comments || {}).length}

Headers: ${safeSheet.raw[0]?.join(', ') || 'No headers detected'}

Sample Data (first 3 rows):`;
    
    const objects = safeSheet.objects || [];
    objects.slice(0, 3).forEach((row: any, index: number) => {
      if (row && typeof row === 'object') {
        report += `\nRow ${index + 1}: ${JSON.stringify(row)}`;
      }
    });

    if (Object.keys(safeSheet.formulas || {}).length > 0) {
      report += `\n\nFormulas Found:`;
      Object.entries(safeSheet.formulas || {}).slice(0, 5).forEach(([cell, formula]) => {
        report += `\n• ${cell}: ${formula}`;
      });
    }

    report += '\n';
  });

  report += `
💡 KEY INSIGHTS:
`;

  analysis.insights.keyMetrics.forEach((metric: any, index: number) => {
    report += `\n${index + 1}. ${metric.name}: ${metric.value} (${metric.type})`;
  });

  if (analysis.insights.patterns.length > 0) {
    report += `\n\n🔍 PATTERNS DETECTED:`;
    analysis.insights.patterns.forEach((pattern: any, index: number) => {
      report += `\n${index + 1}. ${pattern.description} (${Math.round(pattern.confidence * 100)}% confidence)`;
    });
  }

  if (analysis.insights.recommendations.length > 0) {
    report += `\n\n📊 VISUALIZATION RECOMMENDATIONS:`;
    analysis.insights.recommendations.forEach((rec: any, index: number) => {
      report += `\n${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`;
      if (rec.suggestedCharts) {
        report += `\n   Suggested Charts: ${rec.suggestedCharts.join(', ')}`;
      }
    });
  }

  report += `\n\n🏗️ STRUCTURE ANALYSIS:
• Time Series Data: ${analysis.structure.hasTimeSeries ? 'YES' : 'NO'}
• Categorical Data: ${analysis.structure.hasCategories ? 'YES' : 'NO'}
• Hierarchical Data: ${analysis.structure.hasHierarchy ? 'YES' : 'NO'}
• Calculations Present: ${analysis.structure.hasCalculations ? 'YES' : 'NO'}
`;

  return report;
}

// Helper function to create contextual AI prompt
function createContextualPrompt(excelData: ParsedExcelData, analysis: any, originalPrompt: string): string {
  // Safe access to analysis data
  const safeAnalysis = analysis || {
    dataCategory: 'unknown',
    confidence: 0,
    structure: {
      dataQuality: 'unknown',
      hasTimeSeries: false,
      hasCategories: false,
      hasCalculations: false
    },
    insights: {
      keyMetrics: [],
      patterns: []
    }
  };

  const keyMetrics = Array.isArray(safeAnalysis.insights?.keyMetrics) 
    ? safeAnalysis.insights.keyMetrics.map((m: any) => `• ${m?.name || 'Unknown'}: ${m?.value || 'N/A'}`).join('\n')
    : '• No key metrics detected';

  const patterns = Array.isArray(safeAnalysis.insights?.patterns)
    ? safeAnalysis.insights.patterns.map((p: any) => `• ${p?.description || 'Unknown pattern'}`).join('\n')
    : '• No patterns detected';

  return `You are analyzing a ${safeAnalysis.dataCategory.toUpperCase()} Excel file with ${Math.round(safeAnalysis.confidence * 100)}% confidence.

CONTEXT:
• Data Category: ${safeAnalysis.dataCategory}
• Quality: ${safeAnalysis.structure.dataQuality}
• Has Time Series: ${safeAnalysis.structure.hasTimeSeries}
• Has Categories: ${safeAnalysis.structure.hasCategories}
• Has Formulas: ${safeAnalysis.structure.hasCalculations}

KEY METRICS DETECTED:
${keyMetrics}

PATTERNS FOUND:
${patterns}

ACTUAL EXCEL DATA:
${JSON.stringify(excelData || {}, null, 2)}

Based on this comprehensive analysis, please provide:
1. BUSINESS INSIGHTS: What story does this data tell?
2. KEY FINDINGS: Most important numbers and trends
3. ANOMALIES: Any unusual patterns or outliers
4. ACTIONABLE RECOMMENDATIONS: What should be done based on this data?
5. PRESENTATION STRATEGY: How should this data be presented to executives?

Original request: ${originalPrompt}

Focus on being specific and actionable. Use the actual numbers from the data.`;
}

// Helper function to generate enhanced chart data and recommendations
function generateEnhancedChartData(excelData: ParsedExcelData, analysis: any) {
  const chartConfigs: any[] = [];
  let recommendations = '';

  // Generate chart configurations based on analysis
  analysis.insights.recommendations.forEach((rec: any, index: number) => {
    if (rec.type === 'visualization' && rec.suggestedCharts) {
      recommendations += `\n${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`;
      recommendations += `\n   Recommended Charts: ${rec.suggestedCharts.join(', ')}`;
      
      // Generate actual chart configurations
      rec.suggestedCharts.forEach((chartType: string) => {
        const chartConfig = generateChartConfig(excelData, chartType, analysis);
        if (chartConfig) {
          chartConfigs.push(chartConfig);
        }
      });
    }
  });

  if (recommendations === '') {
    recommendations = `
Based on the data analysis, here are the recommended visualizations:
• Line Charts: For time-series data and trends
• Bar Charts: For categorical comparisons
• Pie Charts: For proportional data
• KPI Cards: For key metrics display`;
  }

  return {
    recommendations,
    chartConfigs
  };
}

// Helper function to generate specific chart configurations
function generateChartConfig(excelData: ParsedExcelData, chartType: string, analysis: any) {
  // Get the first sheet with data
  const firstSheet = Object.values(excelData.sheets)[0];
  if (!firstSheet || !firstSheet.objects || firstSheet.objects.length === 0) {
    return null;
  }

  const headers = firstSheet.raw[0] || [];
  const data = firstSheet.objects.slice(0, 10); // First 10 rows for chart

  // Find numeric columns
  const numericColumns = headers.filter(header => 
    data.some(row => typeof row[header] === 'number')
  );

  if (numericColumns.length === 0) return null;

  const labels = data.map((row, index) => `Row ${index + 1}`);
  const series = numericColumns.slice(0, 3).map((column, index) => ({
    id: column,
    data: data.map(row => row[column] || 0),
    color: ['#4A3AFF', '#C893FD', '#8B5CF6'][index]
  }));

  return {
    type: chartType,
    labels,
    series,
    showLegend: true,
    showGrid: true,
    animate: true,
    title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart - ${analysis.dataCategory} Data`,
    className: 'w-full h-80 bg-white p-4'
  };
}

export async function POST(request: NextRequest) {
  try {
    const { fileData, prompt } = await request.json();

    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    console.log('🔍 ENHANCED EXCEL ANALYSIS - Starting comprehensive analysis...');
    console.log('File data keys:', Object.keys(fileData));

    // PHASE 1: COMPREHENSIVE DATA EXTRACTION
    console.log('📊 Phase 1: Extracting enhanced Excel data...');
    const excelData: ParsedExcelData = fileData;
    
    // PHASE 2: INTELLIGENT ANALYSIS
    console.log('🧠 Phase 2: Running intelligent Excel analysis...');
    const smartAnalysis = ExcelAnalyzer.analyzeExcelData(excelData);
    
    console.log(`📈 Analysis Results: ${smartAnalysis.dataCategory} (${Math.round(smartAnalysis.confidence * 100)}% confidence)`);
    console.log(`📋 Key Metrics Found: ${smartAnalysis.insights.keyMetrics.length}`);
    console.log(`🔍 Patterns Detected: ${smartAnalysis.insights.patterns.length}`);
    console.log(`💡 Recommendations: ${smartAnalysis.insights.recommendations.length}`);

    // PHASE 3: GENERATE COMPREHENSIVE ANALYSIS REPORT
    const analysisReport = generateComprehensiveReport(excelData, smartAnalysis);
    
    // PHASE 4: ENHANCED AI ANALYSIS WITH CONTEXT
    console.log('🤖 Phase 4: Generating contextual AI insights...');
    const contextualPrompt = createContextualPrompt(excelData, smartAnalysis, prompt);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000, // Increased for comprehensive analysis
      messages: [
        {
          role: 'user',
          content: contextualPrompt
        }
      ]
    });

    const aiInsights = response.content[0].type === 'text' ? response.content[0].text : 'No AI insights generated';

    console.log('✅ ENHANCED Excel Analysis completed successfully');

    // PHASE 5: GENERATE ENHANCED CHART RECOMMENDATIONS
    const enhancedChartData = generateEnhancedChartData(excelData, smartAnalysis);
    
    // PHASE 6: COMPILE FINAL COMPREHENSIVE RESPONSE
    const finalAnalysis = `${analysisReport}

🤖 AI INSIGHTS & RECOMMENDATIONS:
${aiInsights}

📊 ENHANCED CHART RECOMMENDATIONS:
${enhancedChartData.recommendations}
`;

    return NextResponse.json({ 
      success: true,
      analysis: finalAnalysis,
      smartAnalysis: smartAnalysis,
      chartData: enhancedChartData.chartConfigs,
      metadata: {
        dataCategory: smartAnalysis.dataCategory,
        confidence: smartAnalysis.confidence,
        keyMetrics: smartAnalysis.insights.keyMetrics,
        recommendations: smartAnalysis.insights.recommendations,
        dataQuality: smartAnalysis.structure.dataQuality,
        completeness: smartAnalysis.structure.completeness
      },
      fileDataReceived: excelData,
      promptLength: contextualPrompt.length
    });

  } catch (error) {
    console.error('❌ Test Excel Analysis Error:', error);
    return NextResponse.json(
      { error: 'Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test Excel Analysis API ready' });
}

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
  let report = `
🔍 COMPREHENSIVE EXCEL ANALYSIS REPORT
=====================================

📊 FILE OVERVIEW:
• Total Sheets: ${excelData.summary.totalSheets}
• Sheet Names: ${excelData.summary.sheetNames.join(', ')}
• Total Cells: ${excelData.summary.totalCells}
• Formulas Found: ${excelData.summary.totalFormulas}
• Data Category: ${analysis.dataCategory.toUpperCase()} (${Math.round(analysis.confidence * 100)}% confidence)
• Data Quality: ${analysis.structure.dataQuality.toUpperCase()}
• Completeness: ${Math.round(analysis.structure.completeness * 100)}%

📈 FILE METADATA:
• Author: ${excelData.summary.fileMetadata.author || 'Unknown'}
• Created: ${excelData.summary.fileMetadata.created || 'Unknown'}
• Modified: ${excelData.summary.fileMetadata.modified || 'Unknown'}
• Title: ${excelData.summary.fileMetadata.title || 'Untitled'}

🔍 DETAILED SHEET ANALYSIS:
`;

  Object.entries(excelData.sheets).forEach(([sheetName, sheet]) => {
    report += `
📋 SHEET: "${sheetName}"
• Dimensions: ${sheet.rowCount} rows × ${sheet.columnCount} columns
• Range: ${sheet.range}
• Formulas: ${Object.keys(sheet.formulas || {}).length}
• Merged Cells: ${sheet.mergedCells?.length || 0}
• Comments: ${Object.keys(sheet.comments || {}).length}

Headers: ${sheet.raw[0]?.join(', ') || 'No headers detected'}

Sample Data (first 3 rows):`;
    
    sheet.objects.slice(0, 3).forEach((row: any, index: number) => {
      report += `\nRow ${index + 1}: ${JSON.stringify(row)}`;
    });

    if (Object.keys(sheet.formulas || {}).length > 0) {
      report += `\n\nFormulas Found:`;
      Object.entries(sheet.formulas || {}).slice(0, 5).forEach(([cell, formula]) => {
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
  return `You are analyzing a ${analysis.dataCategory.toUpperCase()} Excel file with ${Math.round(analysis.confidence * 100)}% confidence.

CONTEXT:
• Data Category: ${analysis.dataCategory}
• Quality: ${analysis.structure.dataQuality}
• Has Time Series: ${analysis.structure.hasTimeSeries}
• Has Categories: ${analysis.structure.hasCategories}
• Has Formulas: ${analysis.structure.hasCalculations}

KEY METRICS DETECTED:
${analysis.insights.keyMetrics.map((m: any) => `• ${m.name}: ${m.value}`).join('\n')}

PATTERNS FOUND:
${analysis.insights.patterns.map((p: any) => `• ${p.description}`).join('\n')}

ACTUAL EXCEL DATA:
${JSON.stringify(excelData, null, 2)}

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

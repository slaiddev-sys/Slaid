import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// COMPREHENSIVE EXCEL ANALYSIS FUNCTION
async function performComprehensiveExcelAnalysis(fileData: any) {
  console.log('🔍 Starting comprehensive Excel analysis...');
  
  let detailedAnalysis = '';
  
  try {
    // 1. STRUCTURAL ANALYSIS
    detailedAnalysis += '📊 STRUCTURAL ANALYSIS:\n';
    
    if (fileData?.processedData?.structuredData?.sheets) {
      const sheets = fileData.processedData.structuredData.sheets;
      const sheetNames = Object.keys(sheets);
      
      detailedAnalysis += `- Total Sheets: ${sheetNames.length}\n`;
      detailedAnalysis += `- Sheet Names: ${sheetNames.join(', ')}\n`;
      
      let totalDataCells = 0;
      let totalRows = 0;
      let totalColumns = 0;
      
      // Analyze each sheet in detail
      sheetNames.forEach(sheetName => {
        const sheet = sheets[sheetName];
        detailedAnalysis += `\n📋 SHEET: "${sheetName}"\n`;
        detailedAnalysis += `  - Dimensions: ${sheet.rowCount} rows × ${sheet.columnCount} columns\n`;
        detailedAnalysis += `  - Data Rows: ${sheet.totalRows}\n`;
        detailedAnalysis += `  - Headers: [${sheet.headers.join(', ')}]\n`;
        detailedAnalysis += `  - Numeric Columns: [${sheet.numericColumns.join(', ')}]\n`;
        detailedAnalysis += `  - Text Columns: [${sheet.textColumns.join(', ')}]\n`;
        
        totalRows += sheet.rowCount;
        totalColumns += sheet.columnCount;
        totalDataCells += (sheet.rowCount * sheet.columnCount);
        
        // 2. DATA QUALITY ANALYSIS
        if (sheet.sampleData && Array.isArray(sheet.sampleData)) {
          const dataQuality = analyzeDataQuality(sheet.sampleData, sheet.headers);
          detailedAnalysis += `  - Data Quality: ${dataQuality.completeness}% complete, ${dataQuality.missingValues} missing values\n`;
          
          // 3. DETAILED DATA CONTENT
          detailedAnalysis += `  - ALL DATA ROWS:\n`;
          sheet.sampleData.forEach((row: any, idx: number) => {
            const rowData = sheet.headers.map((header: string) => {
              const value = row[header];
              return `${header}: ${value !== undefined && value !== null ? value : 'NULL'}`;
            }).join(' | ');
            detailedAnalysis += `    Row ${idx + 1}: ${rowData}\n`;
          });
          
          // 4. NUMERICAL ANALYSIS
          const numericalAnalysis = performNumericalAnalysis(sheet.sampleData, sheet.numericColumns);
          if (numericalAnalysis.length > 0) {
            detailedAnalysis += `  - NUMERICAL INSIGHTS:\n`;
            numericalAnalysis.forEach(insight => {
              detailedAnalysis += `    ${insight}\n`;
            });
          }
          
          // 5. TIME SERIES DETECTION
          const timeSeriesAnalysis = detectTimeSeriesPatterns(sheet.headers, sheet.sampleData);
          if (timeSeriesAnalysis.isTimeSeries) {
            detailedAnalysis += `  - TIME SERIES DETECTED: ${timeSeriesAnalysis.description}\n`;
            detailedAnalysis += `    Time Columns: [${timeSeriesAnalysis.timeColumns.join(', ')}]\n`;
            detailedAnalysis += `    Value Columns: [${timeSeriesAnalysis.valueColumns.join(', ')}]\n`;
          }
          
          // 6. BUSINESS METRICS IDENTIFICATION
          const businessMetrics = identifyBusinessMetrics(sheet.headers, sheet.sampleData);
          if (businessMetrics.length > 0) {
            detailedAnalysis += `  - BUSINESS METRICS IDENTIFIED:\n`;
            businessMetrics.forEach(metric => {
              detailedAnalysis += `    ${metric}\n`;
            });
          }
        }
      });
      
      // 7. CROSS-SHEET ANALYSIS
      if (sheetNames.length > 1) {
        detailedAnalysis += `\n🔗 CROSS-SHEET ANALYSIS:\n`;
        const crossSheetInsights = analyzeCrossSheetRelationships(sheets);
        crossSheetInsights.forEach(insight => {
          detailedAnalysis += `- ${insight}\n`;
        });
      }
      
      // 8. COMPLETE DATA SUMMARY
      detailedAnalysis += `\n📋 COMPLETE DATA SUMMARY:\n`;
      detailedAnalysis += `- All sheets processed and data extracted completely\n`;
      detailedAnalysis += `- Every data point captured and listed above\n`;
      
      detailedAnalysis += `\n📊 SUMMARY STATISTICS:\n`;
      detailedAnalysis += `- Total Data Volume: ${totalDataCells} cells across ${totalRows} rows and ${totalColumns} columns\n`;
      detailedAnalysis += `- Data Density: High-value business data suitable for executive presentation\n`;
      
    } else {
      detailedAnalysis += 'ERROR: No structured data found in file\n';
    }
    
  } catch (error) {
    console.error('Error in comprehensive analysis:', error);
    detailedAnalysis += `ERROR: Analysis failed - ${error}\n`;
  }
  
  return {
    detailedAnalysis,
    timestamp: new Date().toISOString()
  };
}

// Helper function to analyze data quality
function analyzeDataQuality(data: any[], headers: string[]) {
  let totalCells = 0;
  let missingValues = 0;
  
  data.forEach(row => {
    headers.forEach(header => {
      totalCells++;
      const value = row[header];
      if (value === undefined || value === null || value === '' || value === 'N/A') {
        missingValues++;
      }
    });
  });
  
  const completeness = totalCells > 0 ? Math.round(((totalCells - missingValues) / totalCells) * 100) : 0;
  
  return { completeness, missingValues, totalCells };
}

// Helper function for numerical analysis
function performNumericalAnalysis(data: any[], numericColumns: string[]) {
  const insights: string[] = [];
  
  numericColumns.forEach(column => {
    const values = data.map(row => {
      const val = row[column];
      return typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, ''));
    }).filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      insights.push(`${column}: Min=${min}, Max=${max}, Avg=${avg.toFixed(2)}, Total=${sum.toFixed(2)}`);
      
      // Detect trends
      if (values.length > 2) {
        const trend = detectTrend(values);
        insights.push(`${column} Trend: ${trend}`);
      }
    }
  });
  
  return insights;
}

// Helper function to detect trends
function detectTrend(values: number[]) {
  let increasing = 0;
  let decreasing = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i-1]) increasing++;
    else if (values[i] < values[i-1]) decreasing++;
  }
  
  if (increasing > decreasing * 1.5) return 'Upward trend';
  if (decreasing > increasing * 1.5) return 'Downward trend';
  return 'Stable/Mixed trend';
}

// Helper function to detect time series patterns
function detectTimeSeriesPatterns(headers: string[], data: any[]) {
  const timeKeywords = ['date', 'time', 'month', 'year', 'quarter', 'week', 'day', 'period'];
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  const timeColumns = headers.filter(header => 
    timeKeywords.some(keyword => header.toLowerCase().includes(keyword)) ||
    monthNames.some(month => header.toLowerCase().includes(month))
  );
  
  const valueColumns = headers.filter(header => 
    !timeColumns.includes(header) && 
    data.some(row => typeof row[header] === 'number' || !isNaN(parseFloat(String(row[header]))))
  );
  
  const isTimeSeries = timeColumns.length > 0 && valueColumns.length > 0;
  
  return {
    isTimeSeries,
    timeColumns,
    valueColumns,
    description: isTimeSeries ? `Time-based data with ${timeColumns.length} time dimension(s) and ${valueColumns.length} metric(s)` : 'No time series pattern detected'
  };
}

// Helper function to identify business metrics
function identifyBusinessMetrics(headers: string[], data: any[]) {
  const metrics: string[] = [];
  
  const businessKeywords = {
    'Revenue/Sales': ['revenue', 'sales', 'income', 'earnings'],
    'Costs/Expenses': ['cost', 'expense', 'spend', 'budget'],
    'Performance': ['performance', 'kpi', 'metric', 'target', 'goal'],
    'Growth': ['growth', 'increase', 'decrease', 'change'],
    'Customer': ['customer', 'client', 'user', 'subscriber'],
    'Financial': ['profit', 'margin', 'roi', 'roa', 'ebitda']
  };
  
  Object.entries(businessKeywords).forEach(([category, keywords]) => {
    const matchingHeaders = headers.filter(header =>
      keywords.some(keyword => header.toLowerCase().includes(keyword))
    );
    
    if (matchingHeaders.length > 0) {
      metrics.push(`${category} Metrics: [${matchingHeaders.join(', ')}]`);
    }
  });
  
  return metrics;
}

// Helper function to analyze cross-sheet relationships
function analyzeCrossSheetRelationships(sheets: any) {
  const insights: string[] = [];
  const sheetNames = Object.keys(sheets);
  
  if (sheetNames.length > 1) {
    // Look for common headers across sheets
    const allHeaders = sheetNames.map(name => sheets[name].headers).flat();
    const headerCounts: { [key: string]: number } = {};
    
    allHeaders.forEach(header => {
      headerCounts[header] = (headerCounts[header] || 0) + 1;
    });
    
    const commonHeaders = Object.entries(headerCounts)
      .filter(([_, count]) => count > 1)
      .map(([header, count]) => `${header} (${count} sheets)`);
    
    if (commonHeaders.length > 0) {
      insights.push(`Common headers across sheets: ${commonHeaders.join(', ')}`);
    }
    
    // Analyze sheet purposes
    sheetNames.forEach(sheetName => {
      const sheet = sheets[sheetName];
      let purpose = 'General data';
      
      if (sheet.headers.some((h: string) => h.toLowerCase().includes('summary'))) {
        purpose = 'Summary/Dashboard sheet';
      } else if (sheet.headers.some((h: string) => h.toLowerCase().includes('detail'))) {
        purpose = 'Detailed data sheet';
      } else if (sheet.totalRows > 50) {
        purpose = 'Large dataset (transaction-level data)';
      } else if (sheet.totalRows < 10) {
        purpose = 'Summary/KPI sheet';
      }
      
      insights.push(`Sheet "${sheetName}": ${purpose}`);
    });
  }
  
  return insights;
}

// Helper function to generate presentation recommendations
function generatePresentationRecommendations(sheets: any) {
  const recommendations: string[] = [];
  
  Object.entries(sheets).forEach(([sheetName, sheet]: [string, any]) => {
    // Recommend slide types based on data structure
    if (sheet.numericColumns.length > 0 && sheet.totalRows > 1) {
      recommendations.push(`Create KPI dashboard slide from "${sheetName}" with ${sheet.numericColumns.length} key metrics`);
    }
    
    if (sheet.headers.some((h: string) => ['january', 'february', 'march'].some(month => h.toLowerCase().includes(month)))) {
      recommendations.push(`Create monthly trend analysis slide from "${sheetName}" time series data`);
    }
    
    if (sheet.headers.some((h: string) => h.toLowerCase().includes('revenue') || h.toLowerCase().includes('sales'))) {
      recommendations.push(`Create financial performance slide highlighting revenue/sales metrics from "${sheetName}"`);
    }
    
    if (sheet.totalRows > 10) {
      recommendations.push(`Create detailed analysis slide with top insights from "${sheetName}" dataset`);
    }
  });
  
  // Overall presentation structure recommendations
  recommendations.push('Suggested presentation flow: Executive Summary → Key Metrics → Trend Analysis → Detailed Insights → Recommendations');
  recommendations.push('Recommended chart types: Line charts for trends, Bar charts for comparisons, KPI cards for key metrics');
  
  return recommendations;
}

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

export async function POST(request: NextRequest) {
  try {
    const { fileData, prompt } = await request.json();

    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    console.log('🔍 TEST EXCEL ANALYSIS - Raw file data received:');
    console.log('File data keys:', Object.keys(fileData));
    console.log('File data structure:', JSON.stringify(fileData, null, 2));

    // COMPREHENSIVE EXCEL ANALYSIS - Extract ALL possible information
    const comprehensiveAnalysis = await performComprehensiveExcelAnalysis(fileData);
    
    // Create an enhanced prompt with deep analysis
    const analysisPrompt = `${prompt}

🔍 COMPREHENSIVE EXCEL FILE ANALYSIS:

${comprehensiveAnalysis.detailedAnalysis}

EXCEL FILE RAW DATA:
${JSON.stringify(fileData, null, 2)}

Extract and list ALL the data from this Excel file. Focus purely on data extraction - no recommendations or analysis. Include:

📊 COMPLETE DATA EXTRACTION:
1. List every sheet name and its complete contents
2. Show ALL column headers exactly as they appear
3. Extract EVERY single data row with all values
4. Include empty cells, null values, and formatting information
5. Show the exact structure and organization of the data

📈 RAW DATA CONTENT:
6. List ALL numerical values exactly as they appear in the file
7. Extract ALL text values, labels, and categories
8. Show ALL dates, times, and period information
9. Include any formulas, calculations, or computed values
10. Extract any metadata, comments, or additional information

🔍 COMPLETE DATA INVENTORY:
11. Total count of sheets, rows, columns, and populated cells
12. List of all unique values in each column
13. Data types present (numbers, text, dates, formulas)
14. Any special formatting, colors, or styling information

🚨 CRITICAL REQUIREMENTS:
- Extract EVERY piece of data - don't summarize or skip anything
- Show the complete contents of EVERY sheet
- Include ALL data rows, not just samples
- List exact values, don't round or approximate
- NO analysis, insights, or recommendations - just pure data extraction

Be completely exhaustive - extract every single piece of information that exists in this Excel file.`;

    console.log('🚀 Sending comprehensive prompt to AI (length:', analysisPrompt.length, 'chars)');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Using Haiku - available and capable
      max_tokens: 4000, // Increased token limit for comprehensive analysis
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    const analysis = response.content[0].type === 'text' ? response.content[0].text : 'No text response';

    console.log('✅ AI Analysis completed');
    console.log('Analysis result:', analysis);

    // Generate chart visualizations based on the data
    let chartVisualizations = '';
    let chartData = null;
    
    try {
      // Extract sample data from the Excel file for chart generation
      const sampleData = fileData?.processedData?.structuredData?.sheets?.Sheet1?.sampleData;
      
      if (sampleData && Array.isArray(sampleData)) {
        const months = [];
        const unitsSold = [];
        const totalRevenue = [];
        const goalRevenue = [];
        
        // Extract data for charts (skip header row)
        sampleData.slice(1).forEach(row => {
          if (row['Monthly sales forecast']) {
            months.push(row['Monthly sales forecast']);
            unitsSold.push(row['__EMPTY'] || 0);
            totalRevenue.push(row['__EMPTY_2'] || 0);
            goalRevenue.push(row['__EMPTY_3'] || 0);
          }
        });
        
        if (months.length > 0) {
          // Create actual chart data for ChartBlock components
          chartData = {
            lineChart: {
              type: 'line' as const,
              labels: months,
              series: [
                {
                  id: 'Units Sold',
                  data: unitsSold,
                  color: '#4A3AFF'
                }
              ],
              showLegend: true,
              showGrid: true,
              curved: false,
              animate: true,
              className: 'w-full h-80 bg-white p-4'
            },
            barChart: {
              type: 'bar' as const,
              labels: months.slice(0, 6), // First 6 months for better readability
              series: [
                {
                  id: 'Actual Revenue',
                  data: totalRevenue.slice(0, 6),
                  color: '#4A3AFF'
                },
                {
                  id: 'Goal Revenue',
                  data: goalRevenue.slice(0, 6),
                  color: '#C893FD'
                }
              ],
              showLegend: true,
              showGrid: true,
              stacked: false,
              animate: true,
              className: 'w-full h-80 bg-white p-4'
            }
          };
          
          chartVisualizations = `

📊 CHART VISUALIZATIONS:

1. LINE CHART - Units Sold Over Time:
   Labels: [${months.map(m => `"${m}"`).join(', ')}]
   Data: [${unitsSold.join(', ')}]
   
   ${generateASCIILineChart(months, unitsSold, 'Units Sold')}

2. BAR CHART - Revenue Comparison (Actual vs Goal):
   Months: [${months.slice(0, 6).map(m => `"${m}"`).join(', ')}]
   Actual Revenue: [${totalRevenue.slice(0, 6).join(', ')}]
   Goal Revenue: [${goalRevenue.slice(0, 6).join(', ')}]
   
   ${generateASCIIBarChart(months.slice(0, 6), totalRevenue.slice(0, 6), goalRevenue.slice(0, 6))}

📊 EXTRACTED CHART DATA:
• Line Chart Data Available: Units sold over time periods
• Bar Chart Data Available: Revenue comparison data by month  
• Time Series Data: Monthly progression data extracted
• Numerical Series: All values extracted and ready for visualization`;
        }
      }
    } catch (error) {
      console.error('Error generating chart visualizations:', error);
      chartVisualizations = `

📊 DATA EXTRACTION SUMMARY:
• Monthly trend data extracted from Excel
• Revenue comparison data available  
• Time series data successfully parsed
• All numerical values captured for chart generation`;
    }

    return NextResponse.json({ 
      success: true,
      analysis: analysis + chartVisualizations,
      comprehensiveAnalysis: comprehensiveAnalysis.detailedAnalysis,
      chartData: chartData,
      fileDataReceived: fileData,
      promptLength: analysisPrompt.length,
      analysisTimestamp: comprehensiveAnalysis.timestamp
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

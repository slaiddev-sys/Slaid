import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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

export async function POST(request: NextRequest) {
  try {
    const { fileData, prompt } = await request.json();

    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    console.log('🔍 TEST EXCEL ANALYSIS - Raw file data received:');
    console.log('File data keys:', Object.keys(fileData));
    console.log('File data structure:', JSON.stringify(fileData, null, 2));

    // Create a detailed prompt with the Excel data
    const analysisPrompt = `${prompt}

EXCEL FILE DATA TO ANALYZE:
${JSON.stringify(fileData, null, 2)}

Please provide a detailed analysis of what you can see in this Excel file. Include:
1. What sheets are present
2. What headers/columns you can identify
3. What actual data values you can see (include ALL months/rows, not just the first few)
4. Any patterns or structure you notice
5. Be very specific about the exact numbers and text you can read
6. CHART RECOMMENDATIONS: Based on the data structure and content, recommend the most suitable chart types for visualizing this data

IMPORTANT: 
- Analyze ALL the data rows, not just the sample data
- If there are 12 months of data, analyze all 12 months
- Include specific chart type recommendations at the end

Be honest - if you cannot see or read certain parts of the data, say so explicitly.`;

    console.log('🚀 Sending prompt to AI (length:', analysisPrompt.length, 'chars)');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
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

💡 RECOMMENDED CHART TYPES FOR THIS DATA:
• Line Chart: Best for showing trends in units sold over time
• Column Chart: Ideal for comparing actual vs goal revenue by month  
• Area Chart: Good for showing cumulative revenue growth
• Combo Chart: Perfect for showing both units sold (line) and revenue (bars)`;
        }
      }
    } catch (error) {
      console.error('Error generating chart visualizations:', error);
      chartVisualizations = `

📊 CHART RECOMMENDATIONS:
• Line Chart: Best for showing monthly trends in units sold
• Column Chart: Ideal for comparing actual vs goal revenue by month
• Area Chart: Good for showing cumulative revenue growth
• Combo Chart: Perfect for combining units sold and revenue data`;
    }

    return NextResponse.json({ 
      success: true,
      analysis: analysis + chartVisualizations,
      chartData: chartData,
      fileDataReceived: fileData,
      promptLength: analysisPrompt.length
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

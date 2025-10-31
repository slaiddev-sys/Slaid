import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

export async function POST(request: NextRequest) {
  try {
    const { layoutName, layoutData } = await request.json();

    // Create a new PowerPoint presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'Slaid';
    pptx.company = 'Slaid';
    pptx.title = layoutName;
    pptx.subject = `Excel Layout: ${layoutName}`;

    // Add a slide based on the layout type
    const slide = pptx.addSlide();

    // Configure slide layout based on layoutName
    switch (layoutName) {
      case 'Data Table':
        await createDataTableSlide(slide, layoutData);
        break;
      case 'KPI Dashboard':
        await createKPIDashboardSlide(slide, layoutData);
        break;
      case 'Trend Chart':
        await createTrendChartSlide(slide, layoutData);
        break;
      case 'Comparison View':
        await createComparisonSlide(slide, layoutData);
        break;
      case 'Executive Summary':
        await createExecutiveSummarySlide(slide, layoutData);
        break;
      default:
        await createDefaultSlide(slide, layoutName);
    }

    // Generate the PowerPoint file
    const fileName = `${layoutName.replace(/\s+/g, '_')}_Export.pptx`;
    
    // Generate the file as base64
    const pptxData = await pptx.write('base64');

    return NextResponse.json({
      success: true,
      message: `Successfully exported "${layoutName}" to PowerPoint`,
      fileName: fileName,
      layoutName,
      fileData: pptxData,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });

  } catch (error) {
    console.error('PowerPoint export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export to PowerPoint',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions to create different slide types
async function createDataTableSlide(slide: any, layoutData: any) {
  // Add title
  slide.addText('Data Overview', { 
    x: 0.5, y: 0.5, w: 9, h: 1, 
    fontSize: 24, bold: true, color: '000000' 
  });

  // Add table data
  const tableData = [
    ['Metric', 'Value', 'Change'],
    ['Total Revenue', '$648,000', '+18.2%'],
    ['Average Monthly', '$54,000', '+12.5%'],
    ['Peak Month', '$68,000', 'December'],
    ['Units Sold', '16,200', '+15.3%'],
    ['Target Achievement', '94.2%', '-5.8%']
  ];

  slide.addTable(tableData, { 
    x: 1, y: 2, w: 8, h: 4,
    fontSize: 12,
    border: { pt: 1, color: 'CCCCCC' },
    fill: { color: 'F8F9FA' }
  });
}

async function createKPIDashboardSlide(slide: any, layoutData: any) {
  // Add title
  slide.addText('Key Performance Indicators', { 
    x: 0.5, y: 0.5, w: 9, h: 1, 
    fontSize: 24, bold: true, color: '000000' 
  });

  // Add KPI boxes
  const kpis = [
    { title: 'Total Revenue', value: '$648K', change: '+18.2%', x: 1, y: 2 },
    { title: 'Units Sold', value: '16.2K', change: '+15.3%', x: 5.5, y: 2 },
    { title: 'Avg Order Value', value: '$40', change: '+2.5%', x: 1, y: 4 },
    { title: 'Target Achievement', value: '94.2%', change: '-5.8%', x: 5.5, y: 4 }
  ];

  kpis.forEach(kpi => {
    slide.addShape('rect', { 
      x: kpi.x, y: kpi.y, w: 3.5, h: 1.5,
      fill: { color: 'E3F2FD' },
      line: { color: '2196F3', width: 2 }
    });
    
    slide.addText(kpi.value, { 
      x: kpi.x + 0.2, y: kpi.y + 0.1, w: 3.1, h: 0.5, 
      fontSize: 20, bold: true, color: '1976D2' 
    });
    
    slide.addText(kpi.title, { 
      x: kpi.x + 0.2, y: kpi.y + 0.6, w: 3.1, h: 0.3, 
      fontSize: 12, color: '424242' 
    });
    
    slide.addText(kpi.change, { 
      x: kpi.x + 0.2, y: kpi.y + 0.9, w: 3.1, h: 0.3, 
      fontSize: 10, bold: true, color: kpi.change.startsWith('+') ? '4CAF50' : 'F44336' 
    });
  });
}

async function createTrendChartSlide(slide: any, layoutData: any) {
  // Add title
  slide.addText('Revenue Performance by Quarter', { 
    x: 0.5, y: 0.5, w: 9, h: 1, 
    fontSize: 24, bold: true, color: '000000' 
  });

  // Add chart data
  const chartData = [
    { name: 'Q1 2023', values: [52.2] },
    { name: 'Q2 2023', values: [58.6] },
    { name: 'Q3 2023', values: [43.8] },
    { name: 'Q4 2023', values: [47.8] }
  ];

  slide.addChart('bar', chartData, { 
    x: 1, y: 2, w: 6, h: 4,
    showTitle: false,
    showLegend: false,
    barDir: 'col',
    chartColors: ['4F46E5']
  });

  // Add insights panel
  slide.addText('Overall Performance: -8.4%', { 
    x: 7.5, y: 2, w: 2, h: 0.5, 
    fontSize: 14, bold: true, color: 'F44336' 
  });

  const insights = [
    'Q2 shows strongest performance',
    'Q3 performance dip suggests challenges',
    'Consistent variability across quarters',
    'Recovery trend in Q4'
  ];

  insights.forEach((insight, idx) => {
    slide.addText(`• ${insight}`, { 
      x: 7.5, y: 2.8 + (idx * 0.4), w: 2, h: 0.3, 
      fontSize: 10, color: '424242' 
    });
  });
}

async function createComparisonSlide(slide: any, layoutData: any) {
  // Add title
  slide.addText('Performance Comparison', { 
    x: 0.5, y: 0.5, w: 9, h: 1, 
    fontSize: 24, bold: true, color: '000000' 
  });

  // Add comparison chart
  const chartData = [
    { name: 'Q1', values: [156, 165] },
    { name: 'Q2', values: [168, 170] },
    { name: 'Q3', values: [162, 175] },
    { name: 'Q4', values: [162, 180] }
  ];

  slide.addChart('bar', chartData, { 
    x: 1, y: 2, w: 5, h: 4,
    showTitle: false,
    showLegend: true,
    barDir: 'col',
    chartColors: ['4CAF50', '2196F3']
  });

  // Add data tables
  slide.addText('Actual vs Target Performance', { 
    x: 6.5, y: 2, w: 3, h: 0.5, 
    fontSize: 12, bold: true, color: '000000' 
  });
}

async function createExecutiveSummarySlide(slide: any, layoutData: any) {
  // Add title
  slide.addText('Executive Summary', { 
    x: 0.5, y: 0.5, w: 9, h: 1, 
    fontSize: 24, bold: true, color: '000000' 
  });

  // Add bullet points
  const summaryPoints = [
    'Strong Performance: Achieved $648K total revenue with 94.2% target achievement',
    'Growth Trend: 18.2% overall growth with Q2 showing strongest performance',
    'Seasonal Patterns: December peak ($68K) and January low ($42K)',
    'Opportunity: $42K revenue gap represents 6.5% improvement potential',
    'Recommendation: Focus on Q3/Q4 optimization to capture seasonal upside'
  ];

  summaryPoints.forEach((point, idx) => {
    slide.addText(`• ${point}`, { 
      x: 1, y: 2 + (idx * 0.8), w: 8, h: 0.6, 
      fontSize: 14, color: '424242' 
    });
  });
}

async function createDefaultSlide(slide: any, layoutName: string) {
  slide.addText(layoutName, { 
    x: 1, y: 2, w: 8, h: 2, 
    fontSize: 32, bold: true, color: '000000', align: 'center' 
  });
  
  slide.addText('Excel Layout Export', { 
    x: 1, y: 4, w: 8, h: 1, 
    fontSize: 18, color: '666666', align: 'center' 
  });
}

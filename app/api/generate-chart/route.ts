import { NextRequest, NextResponse } from 'next/server';

// Simple SVG chart generator - no canvas dependencies needed!
function generateBarChartSVG(chartData: any, width: number, height: number) {
  const { labels, values } = chartData;
  const maxValue = Math.max(...values);
  const padding = 60;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const barWidth = chartWidth / labels.length * 0.6;
  const barSpacing = chartWidth / labels.length;
  
  const colors = [
    '#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#a855f7', '#ec4899'
  ];

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="white"/>`;

  // Draw bars
  labels.forEach((label: string, index: number) => {
    const value = values[index];
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding + (index * barSpacing) + (barSpacing - barWidth) / 2;
    const y = height - padding - barHeight;
    const color = colors[index % colors.length];

    // Bar
    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
            fill="${color}" rx="8" ry="8"/>`;
    
    // Value label on top of bar
    svg += `<text x="${x + barWidth/2}" y="${y - 10}" text-anchor="middle" 
            font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#374151">
            ${value}</text>`;
    
    // X-axis label
    svg += `<text x="${x + barWidth/2}" y="${height - padding + 20}" text-anchor="middle" 
            font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#374151">
            ${label}</text>`;
  });

  // Y-axis grid lines and labels
  for (let i = 0; i <= 5; i++) {
    const gridValue = (maxValue / 5) * i;
    const gridY = height - padding - (i * chartHeight / 5);
    
    // Grid line
    svg += `<line x1="${padding}" y1="${gridY}" x2="${width - padding}" y2="${gridY}" 
            stroke="rgba(0,0,0,0.1)" stroke-width="1"/>`;
    
    // Y-axis label
    svg += `<text x="${padding - 10}" y="${gridY + 4}" text-anchor="end" 
            font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#374151">
            ${Math.round(gridValue)}</text>`;
  }

  svg += '</svg>';
  return svg;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Server-side SVG chart generation started');
    
    const body = await request.json();
    const { chartData, width = 600, height = 400, type = 'bar' } = body;
    
    console.log('📊 Chart data received:', { 
      type, 
      width, 
      height, 
      labels: chartData?.labels?.length || 0,
      values: chartData?.values?.length || 0 
    });

    // Validate input
    if (!chartData || !chartData.labels || !chartData.values) {
      return NextResponse.json(
        { error: 'Missing chart data (labels and values required)' },
        { status: 400 }
      );
    }

    console.log('🖼️ Generating SVG chart...');
    
    // Generate SVG chart
    const svgChart = generateBarChartSVG(chartData, width, height);
    
    console.log('✅ SVG chart generated successfully, length:', svgChart.length);
    
    // Convert SVG to base64 data URL
    const base64Image = `data:image/svg+xml;base64,${Buffer.from(svgChart).toString('base64')}`;
    
    console.log('🎯 Base64 conversion complete, length:', base64Image.length);

    return NextResponse.json({
      success: true,
      image: base64Image,
      width,
      height,
      type: 'svg'
    });

  } catch (error) {
    console.error('❌ Chart generation error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate chart',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

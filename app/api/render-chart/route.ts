import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Simple canvas-based chart generator as fallback
function generateSimpleChart(chartData: any, width: number, height: number): string {
  // Create a simple SVG chart as base64
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  
  <!-- Title -->
  <text x="40" y="30" font-family="Helvetica" font-size="18" fill="black">Performance Chart</text>
  
  <!-- Chart Area -->
  <rect x="40" y="50" width="${width - 80}" height="${height - 100}" fill="#f8f9fa" stroke="#e9ecef"/>
  
  <!-- Sample Data Bars -->
  <rect x="60" y="70" width="40" height="80" fill="#6366f1" opacity="0.8"/>
  <rect x="120" y="60" width="40" height="90" fill="#6366f1" opacity="0.8"/>
  <rect x="180" y="50" width="40" height="100" fill="#6366f1" opacity="0.8"/>
  <rect x="240" y="40" width="40" height="110" fill="#6366f1" opacity="0.8"/>
  
  <!-- Labels -->
  <text x="80" y="${height - 20}" font-family="Helvetica" font-size="12" text-anchor="middle" fill="#666">Jan</text>
  <text x="140" y="${height - 20}" font-family="Helvetica" font-size="12" text-anchor="middle" fill="#666">Feb</text>
  <text x="200" y="${height - 20}" font-family="Helvetica" font-size="12" text-anchor="middle" fill="#666">Mar</text>
  <text x="260" y="${height - 20}" font-family="Helvetica" font-size="12" text-anchor="middle" fill="#666">Apr</text>
  
  <!-- Legend -->
  <circle cx="40" cy="${height - 10}" r="4" fill="#6366f1"/>
  <text x="50" y="${height - 6}" font-family="Helvetica" font-size="10" fill="#666">Revenue</text>
</svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const { chartData, width = 800, height = 400 } = await request.json();

    console.log('=== Chart Rendering Debug ===');
    console.log('Chart data received:', JSON.stringify(chartData, null, 2));
    console.log('Dimensions:', { width, height });

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: width + 100, height: height + 100 });

    // Create HTML page with ChartBlock component
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Chart Renderer</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Helvetica, Arial, sans-serif;
            background: white;
        }
        .chart-container {
            width: ${width}px;
            height: ${height}px;
            position: relative;
        }
        canvas {
            max-width: 100%;
            max-height: 100%;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <canvas id="chartCanvas"></canvas>
    </div>
    
    <script>
        const chartData = ${JSON.stringify(chartData)};
        const ctx = document.getElementById('chartCanvas').getContext('2d');
        
        // Convert our ChartBlock format to Chart.js format
        let chartConfig = {
            type: chartData.type || 'line',
            data: {
                labels: chartData.labels || [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: chartData.showLegend !== false,
                        position: chartData.legendPosition || 'top'
                    }
                },
                scales: {
                    y: {
                        display: chartData.showGrid !== false,
                        grid: {
                            display: chartData.showGrid !== false
                        }
                    },
                    x: {
                        display: chartData.showGrid !== false,
                        grid: {
                            display: chartData.showGrid !== false
                        }
                    }
                }
            }
        };

        // Handle different data formats
        if (chartData.series && Array.isArray(chartData.series)) {
            // Multi-series format (like Full Width Chart)
            chartData.series.forEach((series, index) => {
                const colors = [
                    'rgba(99, 102, 241, 0.8)',  // Blue
                    'rgba(168, 85, 247, 0.8)',  // Purple
                    'rgba(34, 197, 94, 0.8)',   // Green
                    'rgba(239, 68, 68, 0.8)',   // Red
                    'rgba(245, 158, 11, 0.8)'   // Orange
                ];
                
                chartConfig.data.datasets.push({
                    label: series.name || series.id,
                    data: series.data,
                    backgroundColor: colors[index % colors.length],
                    borderColor: colors[index % colors.length].replace('0.8', '1'),
                    borderWidth: 2,
                    fill: chartData.type === 'area',
                    tension: chartData.curved ? 0.4 : 0,
                    pointRadius: chartData.showDots ? 4 : 0
                });
            });
        } else if (chartData.data && Array.isArray(chartData.data)) {
            // Single series format
            chartConfig.data.datasets.push({
                label: chartData.label || 'Data',
                data: chartData.data,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                fill: chartData.type === 'area',
                tension: chartData.curved ? 0.4 : 0,
                pointRadius: chartData.showDots ? 4 : 0
            });
        }

        // Create the chart
        try {
            console.log('Creating chart with config:', chartConfig);
            new Chart(ctx, chartConfig);
            console.log('Chart created successfully');
            
            // Signal that chart is ready
            window.chartReady = true;
        } catch (error) {
            console.error('Chart creation failed:', error);
            window.chartError = error.message;
        }
    </script>
</body>
</html>`;

    // Set page content
    await page.setContent(html);

    // Wait for chart to be rendered
    await page.waitForFunction(() => window.chartReady === true, { timeout: 5000 });
    
    // Wait a bit more for animations to complete
    await page.waitForTimeout(500);

    // Take screenshot of the chart container
    const chartElement = await page.$('.chart-container');
    if (!chartElement) {
      throw new Error('Chart container not found');
    }

    const screenshot = await chartElement.screenshot({
      type: 'png',
      omitBackground: false
    });

    await browser.close();

    console.log('Chart rendered successfully, image size:', screenshot.length);

    // Return base64 encoded image
    const base64Image = screenshot.toString('base64');
    
    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
      size: screenshot.length
    });

  } catch (error) {
    console.error('Puppeteer chart rendering failed, using fallback:', error);
    
    // Use simple SVG fallback
    try {
      const fallbackImage = generateSimpleChart(chartData, width, height);
      
      console.log('Fallback chart generated successfully');
      
      return NextResponse.json({
        success: true,
        image: fallbackImage,
        fallback: true,
        size: fallbackImage.length
      });
    } catch (fallbackError) {
      console.error('Fallback chart generation also failed:', fallbackError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to render chart',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
}

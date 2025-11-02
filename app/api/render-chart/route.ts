import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { chartData, width = 800, height = 400 } = await request.json();

    console.log('=== Chart Rendering Debug ===');
    console.log('Chart data received:', JSON.stringify(chartData, null, 2));
    console.log('Dimensions:', { width, height });

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
        new Chart(ctx, chartConfig);
        
        // Signal that chart is ready
        window.chartReady = true;
    </script>
</body>
</html>`;

    // Set page content
    await page.setContent(html);

    // Wait for chart to be rendered
    await page.waitForFunction(() => window.chartReady === true, { timeout: 10000 });
    
    // Wait a bit more for animations to complete
    await page.waitForTimeout(1000);

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
    console.error('Chart rendering error:', error);
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

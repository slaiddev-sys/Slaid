import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { chartData, width = 800, height = 400 } = await request.json();
    
    console.log('=== Chart Capture Debug ===');
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
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: width + 100, height: height + 100 });

    // Create HTML page with ChartBlock component
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/recharts@2.8.0/umd/Recharts.js"></script>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: white;
            }
            .chart-container {
              width: ${width}px;
              height: ${height}px;
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div id="chart-root" class="chart-container"></div>
          
          <script>
            const { useState, useEffect, useMemo } = React;
            const { 
              ResponsiveContainer, 
              AreaChart, 
              Area, 
              XAxis, 
              YAxis, 
              CartesianGrid, 
              Legend 
            } = Recharts;

            const chartData = ${JSON.stringify(chartData)};
            
            function ChartComponent() {
              const data = useMemo(() => {
                if (!chartData.labels || !chartData.series) return [];
                
                return chartData.labels.map((label, index) => {
                  const point = { name: label };
                  chartData.series.forEach(series => {
                    point[series.id || series.name] = series.data[index];
                  });
                  return point;
                });
              }, []);

              const colors = ['#4A3AFF', '#C893FD', '#1e40af', '#2563eb'];

              useEffect(() => {
                // Signal that chart is ready
                setTimeout(() => {
                  window.chartReady = true;
                }, 1000);
              }, []);

              return React.createElement(ResponsiveContainer, {
                width: '100%',
                height: '100%'
              }, React.createElement(AreaChart, {
                data: data,
                margin: { top: 20, right: 30, left: 20, bottom: 20 }
              }, [
                React.createElement(CartesianGrid, { 
                  key: 'grid',
                  strokeDasharray: '3 3',
                  stroke: '#e0e0e0'
                }),
                React.createElement(XAxis, {
                  key: 'xaxis',
                  dataKey: 'name',
                  axisLine: false,
                  tickLine: false,
                  tick: { fontSize: 12, fill: '#666' }
                }),
                React.createElement(YAxis, {
                  key: 'yaxis',
                  axisLine: false,
                  tickLine: false,
                  tick: { fontSize: 12, fill: '#666' }
                }),
                ...chartData.series.map((series, index) => 
                  React.createElement(Area, {
                    key: series.id || series.name,
                    type: 'monotone',
                    dataKey: series.id || series.name,
                    stackId: chartData.stacked ? '1' : undefined,
                    stroke: colors[index % colors.length],
                    fill: colors[index % colors.length],
                    fillOpacity: 0.6,
                    strokeWidth: 2
                  })
                ),
                chartData.showLegend && React.createElement(Legend, {
                  key: 'legend',
                  verticalAlign: 'bottom',
                  height: 36
                })
              ]));
            }

            // Render the chart
            const root = ReactDOM.createRoot(document.getElementById('chart-root'));
            root.render(React.createElement(ChartComponent));
          </script>
        </body>
      </html>
    `;

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

    const imageBuffer = await chartElement.screenshot({
      type: 'png',
      omitBackground: false
    });

    await browser.close();

    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    
    console.log('Chart captured successfully, image size:', imageBuffer.length, 'bytes');

    return NextResponse.json({
      success: true,
      image: base64Image,
      mimeType: 'image/png'
    });

  } catch (error) {
    console.error('Chart capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture chart', details: error.message },
      { status: 500 }
    );
  }
}

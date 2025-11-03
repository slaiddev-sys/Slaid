// Dynamic import for puppeteer to avoid bundling issues

// Direct chart capture function using Puppeteer (same logic as copy/paste)
export async function captureChartImage(chartData: any, width: number = 800, height: number = 400): Promise<string | null> {
  let browser;
  try {
    console.log('📊 Direct Chart Capture: Starting capture for chart data:', { 
      type: chartData.type, 
      seriesCount: chartData.series?.length,
      width, 
      height 
    });

    // Launch Puppeteer (dynamic import)
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-running-insecure-content']
    });

    const page = await browser.newPage();
    
    // Set viewport to desired chart size with high DPI for quality
    await page.setViewport({ 
      width: width * 2, // 2x for high quality
      height: height * 2,
      deviceScaleFactor: 2
    });

    // Create HTML content with the chart (same as copy/paste logic)
    const chartHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Chart Capture</title>
      <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/recharts@2.8.0/umd/Recharts.js"></script>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: white;
          width: ${width}px;
          height: ${height}px;
          overflow: hidden;
        }
        .chart-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .legend {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 8px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-text {
          font-size: 10px;
          color: #6b7280;
          font-weight: normal;
        }
        /* Force specific colors to avoid oklch issues */
        * {
          color-scheme: light;
        }
      </style>
    </head>
    <body>
      <div id="chart-root" class="chart-container"></div>
      
      <script>
        const { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } = Recharts;
        const chartData = ${JSON.stringify(chartData)};
        
        // Prepare data for Recharts
        const data = chartData.labels.map((label, index) => {
          const point = { name: label };
          chartData.series.forEach(series => {
            point[series.id] = series.data[index];
          });
          return point;
        });
        
        // Colors for the chart (same as copy/paste)
        const colors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
        
        function Chart() {
          return React.createElement('div', { style: { width: '100%', height: '100%' } }, [
            React.createElement(ResponsiveContainer, { 
              key: 'chart',
              width: '100%', 
              height: '85%' 
            }, 
              React.createElement(AreaChart, {
                data: data,
                margin: { top: 20, right: 30, left: 20, bottom: 5 }
              }, [
                React.createElement(CartesianGrid, { 
                  key: 'grid',
                  strokeDasharray: '3 3',
                  stroke: '#e5e7eb'
                }),
                React.createElement(XAxis, { 
                  key: 'xaxis',
                  dataKey: 'name',
                  tick: { fontSize: 12, fill: '#6b7280' },
                  axisLine: { stroke: '#e5e7eb' },
                  tickLine: { stroke: '#e5e7eb' }
                }),
                React.createElement(YAxis, { 
                  key: 'yaxis',
                  tick: { fontSize: 12, fill: '#6b7280' },
                  axisLine: { stroke: '#e5e7eb' },
                  tickLine: { stroke: '#e5e7eb' }
                }),
                ...chartData.series.map((series, index) => 
                  React.createElement(Area, {
                    key: series.id,
                    type: 'monotone',
                    dataKey: series.id,
                    stackId: chartData.stacked ? '1' : undefined,
                    stroke: colors[index % colors.length],
                    fill: colors[index % colors.length],
                    fillOpacity: 0.6
                  })
                )
              ])
            ),
            chartData.showLegend ? React.createElement('div', { 
              key: 'legend',
              className: 'legend' 
            }, 
              chartData.series.map((series, index) => 
                React.createElement('div', { 
                  key: series.id,
                  className: 'legend-item' 
                }, [
                  React.createElement('div', { 
                    key: 'dot',
                    className: 'legend-dot',
                    style: { backgroundColor: colors[index % colors.length] }
                  }),
                  React.createElement('span', { 
                    key: 'text',
                    className: 'legend-text' 
                  }, series.id)
                ])
              )
            ) : null
          ]);
        }
        
        // Render the chart
        const root = ReactDOM.createRoot(document.getElementById('chart-root'));
        root.render(React.createElement(Chart));
        
        // Signal that rendering is complete
        window.chartReady = true;
      </script>
    </body>
    </html>
    `;

    // Set the HTML content
    await page.setContent(chartHtml);
    
    // Wait for the chart to be rendered
    await page.waitForFunction(() => window.chartReady, { timeout: 30000 });
    
    // Wait a bit more for any animations (same as copy/paste)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take screenshot of the chart
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      clip: {
        x: 0,
        y: 0,
        width: width * 2, // Account for 2x scale
        height: height * 2
      }
    });

    console.log('✅ Direct Chart Capture: Successfully captured chart image');
    return screenshot;

  } catch (error) {
    console.error('❌ Direct Chart Capture: Failed to capture chart:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Dynamic import for puppeteer to avoid bundling issues

// Direct chart capture function using Puppeteer to capture actual rendered chart
export async function captureChartImage(chartData: any, width: number = 1200, height: number = 600, customMargins?: { top: number, right: number, left: number, bottom: number }): Promise<string | null> {
  let browser;
  try {
    console.log('📊 Chart Capture: Starting capture for chart data:', { 
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
      width: width,
      height: height,
      deviceScaleFactor: 2
    });

    // Navigate to the actual chart component in the app
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000';
    const chartUrl = `${baseUrl}/chart-preview?data=${encodeURIComponent(JSON.stringify(chartData))}&width=${width}&height=${height}`;
    
    console.log('📊 Chart Capture: Navigating to chart preview:', chartUrl);
    
    try {
      await page.goto(chartUrl, { 
        waitUntil: 'networkidle0',
        timeout: 15000
      });
      
      // Wait for chart to be rendered
      await page.waitForSelector('.chart-block', { timeout: 10000 });
      
      // Take screenshot of just the chart
      const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'base64',
        fullPage: false
      });

      console.log('✅ Chart Capture: Successfully captured actual rendered chart');
      return screenshot;
      
    } catch (navigationError) {
      console.warn('⚠️ Chart Capture: Could not navigate to chart preview, falling back to SVG generation');
      // Fall back to the original SVG generation method
      return await generateSVGChart(chartData, width, height, customMargins);
    }

  } catch (error) {
    console.error('❌ Chart Capture: Failed to capture chart:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Fallback SVG generation method
async function generateSVGChart(chartData: any, width: number, height: number, customMargins?: { top: number, right: number, left: number, bottom: number }): Promise<string | null> {
  let browser;
  try {
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

    // Create HTML content with pure SVG chart (no React dependencies)
    const chartHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Chart Capture</title>
      <style>
        body {
          margin: 0;
          padding: 0;
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
        svg {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="chart-root" class="chart-container"></div>
      
      <script>
        const chartData = ${JSON.stringify(chartData)};
        const customMargins = ${JSON.stringify(customMargins)};
        
        console.log('📊 Chart HTML: Creating SVG chart with data:', chartData);
        
        function createAreaChart() {
          const container = document.getElementById('chart-root');
          const svgWidth = ${width};
          const svgHeight = ${height};
          // Use the exact same margins as Metrics_FullWidthChart component
          const margin = customMargins || { top: 20, right: 80, left: -10, bottom: 5 };
          const chartWidth = svgWidth - margin.left - margin.right;
          const chartHeight = svgHeight - margin.top - margin.bottom;
          
          // Create SVG
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', svgWidth);
          svg.setAttribute('height', svgHeight);
          svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
          svg.style.background = 'white';
          
          // Calculate scales
          const allValues = chartData.series.flatMap(s => s.data);
          const maxValue = Math.max(...allValues);
          const minValue = Math.min(...allValues);
          const valueRange = maxValue - minValue;
          const padding = valueRange * 0.1;
          const adjustedMax = maxValue + padding;
          const adjustedMin = Math.max(0, minValue - padding); // Don't go below 0
          
          const xStep = chartWidth / (chartData.labels.length - 1);
          const yScale = chartHeight / (adjustedMax - adjustedMin);
          
          // Colors matching ChartBlock component exactly
          const colors = ['#4A3AFF', '#C893FD', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
          
          // Create defs for gradients (matching ChartBlock)
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          
          // Create gradients for each series (matching ChartBlock exactly)
          chartData.series.forEach((series, index) => {
            const color = colors[index % colors.length];
            
            // Convert hex to RGB for opacity manipulation (same as ChartBlock)
            const hexToRgb = (hex) => {
              const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
              return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
              } : { r: 74, g: 58, b: 255 }; // fallback to primary color
            };
            const rgb = hexToRgb(color);
            
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'areaGradient-' + series.name);
            gradient.setAttribute('x1', '0');
            gradient.setAttribute('y1', '0');
            gradient.setAttribute('x2', '0');
            gradient.setAttribute('y2', '1');
            
            // Create gradient stops (matching ChartBlock exactly)
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', color);
            stop1.setAttribute('stop-opacity', '0.8');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '50%');
            stop2.setAttribute('stop-color', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.4)');
            
            const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop3.setAttribute('offset', '100%');
            stop3.setAttribute('stop-color', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.1)');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            defs.appendChild(gradient);
          });
          
          svg.appendChild(defs);
          
          // Create chart group
          const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          chartGroup.setAttribute('transform', 'translate(' + margin.left + ',' + margin.top + ')');
          
          // Draw background
          const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          background.setAttribute('width', chartWidth);
          background.setAttribute('height', chartHeight);
          background.setAttribute('fill', 'white');
          chartGroup.appendChild(background);
          
          // Draw grid lines (matching ChartBlock: strokeDasharray="1 1" stroke="#e2e8f0" opacity={0.5})
          for (let i = 0; i <= 5; i++) {
            const y = (chartHeight / 5) * i;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', chartWidth);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e2e8f0');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '1 1');
            line.setAttribute('opacity', '0.5');
            chartGroup.appendChild(line);
          }
          
          // Draw vertical grid lines (matching ChartBlock)
          chartData.labels.forEach((label, index) => {
            const x = index * xStep;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', chartHeight);
            line.setAttribute('stroke', '#e2e8f0');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '1 1');
            line.setAttribute('opacity', '0.5');
            chartGroup.appendChild(line);
          });
          
          // Draw areas and lines for each series
          chartData.series.forEach((series, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            
            // Create area path
            let areaPath = 'M ';
            let linePath = 'M ';
            
            series.data.forEach((value, index) => {
              const x = index * xStep;
              const y = chartHeight - ((value - adjustedMin) * yScale);
              
              if (index === 0) {
                areaPath += x + ' ' + chartHeight + ' L ' + x + ' ' + y;
                linePath += x + ' ' + y;
              } else {
                areaPath += ' L ' + x + ' ' + y;
                linePath += ' L ' + x + ' ' + y;
              }
            });
            
            // Close area path
            const lastX = (series.data.length - 1) * xStep;
            areaPath += ' L ' + lastX + ' ' + chartHeight + ' Z';
            
            // Create area element with gradient fill (matching ChartBlock)
            const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            area.setAttribute('d', areaPath);
            area.setAttribute('fill', 'url(#areaGradient-' + series.name + ')');
            chartGroup.appendChild(area);
            
            // Create line element
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute('d', linePath);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '3');
            line.setAttribute('fill', 'none');
            chartGroup.appendChild(line);
            
            // Add data points
            series.data.forEach((value, index) => {
              const x = index * xStep;
              const y = chartHeight - ((value - adjustedMin) * yScale);
              
              const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              circle.setAttribute('cx', x);
              circle.setAttribute('cy', y);
              circle.setAttribute('r', '4');
              circle.setAttribute('fill', color);
              circle.setAttribute('stroke', 'white');
              circle.setAttribute('stroke-width', '2');
              chartGroup.appendChild(circle);
            });
          });
          
          // Draw X-axis labels (matching ChartBlock: stroke="#64748b" fontSize={10})
          chartData.labels.forEach((label, index) => {
            const x = index * xStep;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', chartHeight + 25);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#64748b');
            text.textContent = label;
            chartGroup.appendChild(text);
          });
          
          // Draw Y-axis labels (matching ChartBlock: stroke="#64748b" fontSize={10})
          for (let i = 0; i <= 5; i++) {
            const value = adjustedMax - ((adjustedMax - adjustedMin) / 5 * i);
            const y = (chartHeight / 5) * i;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', -15);
            text.setAttribute('y', y + 5);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#64748b');
            text.textContent = Math.round(value).toLocaleString();
            chartGroup.appendChild(text);
          }
          
          // Add inline legend if requested (like in your layout)
          if (chartData.showLegend && chartData.series.length > 0) {
            const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            legendGroup.setAttribute('transform', 'translate(' + (margin.left + 20) + ', ' + (svgHeight - 40) + ')');
            
            chartData.series.forEach((series, index) => {
              const color = colors[index % colors.length];
              const legendX = index * 100;
              
              // Legend dot (circle like in your layout)
              const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              circle.setAttribute('cx', legendX + 6);
              circle.setAttribute('cy', 0);
              circle.setAttribute('r', '6');
              circle.setAttribute('fill', color);
              legendGroup.appendChild(circle);
              
              // Legend text
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', legendX + 18);
              text.setAttribute('y', 5);
              text.setAttribute('font-size', '16');
              text.setAttribute('font-weight', '500');
              text.setAttribute('fill', '#374151');
              text.textContent = series.name || 'Series ' + (index + 1);
              legendGroup.appendChild(text);
            });
            
            svg.appendChild(legendGroup);
          }
          
          svg.appendChild(chartGroup);
          container.appendChild(svg);
          
          console.log('📊 Chart Render: SVG chart created successfully');
          console.log('📊 Chart Elements: SVG count:', document.querySelectorAll('svg').length, 'Path count:', document.querySelectorAll('path').length);
          window.chartReady = true;
        }
        
        // Create the chart immediately
        try {
          console.log('📊 Chart Creation: Starting...');
          createAreaChart();
          console.log('📊 Chart Creation: Completed successfully');
        } catch (error) {
          console.error('📊 Chart Creation: Error:', error);
        window.chartReady = true;
        }
      </script>
    </body>
    </html>
    `;

    // Set the HTML content
    await page.setContent(chartHtml, { waitUntil: 'networkidle0' });
    
    // Add console and error logging
    page.on('console', msg => {
      console.log('📊 Browser Console:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('📊 Page Error:', error.message);
    });
    
    // Wait for the chart to be rendered
    try {
      await page.waitForFunction(() => window.chartReady, { timeout: 10000 });
      console.log('📊 Direct Chart Capture: Chart ready signal received');
      
      // Wait extra time for final rendering
      console.log('📊 Direct Chart Capture: Waiting for final rendering...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (timeoutError) {
      console.warn('📊 Direct Chart Capture: Timeout waiting for chart ready, using fallback timing');
      // Fallback: wait and hope for the best
      console.log('📊 Direct Chart Capture: Using fallback 3-second wait...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Final check - log what's actually on the page before screenshot
    const pageContent = await page.evaluate(() => {
      const chartRoot = document.getElementById('chart-root');
      return {
        hasChartRoot: !!chartRoot,
        chartRootHTML: chartRoot ? chartRoot.innerHTML.substring(0, 200) : 'No chart root',
        bodyHTML: document.body.innerHTML.substring(0, 300),
        svgCount: document.querySelectorAll('svg').length,
        pathCount: document.querySelectorAll('path').length,
        circleCount: document.querySelectorAll('circle').length
      };
    });
    console.log('📊 Final Page Content Check:', pageContent);
    
    // Take screenshot of the chart
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: width * 2,
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
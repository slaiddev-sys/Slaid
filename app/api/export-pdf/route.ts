import { NextRequest, NextResponse } from 'next/server';
import PDFMerger from 'pdf-merger-js';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function POST(request: NextRequest) {
  try {
    const { presentationId, workspace, slides, title } = await request.json();
    
    console.log('📄 PDF Export: Starting export for presentation:', { presentationId, title, slidesCount: slides?.length });

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    // Get the host from the request headers to use the same port
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    console.log('📄 Using base URL:', baseUrl);

    // Launch Puppeteer with Vercel-compatible Chrome
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set viewport to standard presentation size (16:9 aspect ratio)
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 1
    });
    
    // Set user agent to ensure consistent rendering
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const pdfPages: Buffer[] = [];

    // Render each slide by navigating to the actual editor with slide context
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`📄 Rendering slide ${i + 1}/${slides.length}: ${slide.id}`, 'Type:', slide.type, 'Layout:', slide.layout, 'Blocks:', slide.blocks?.length);

      // Navigate to the editor with specific slide for rendering
      // Use page.evaluate to inject slide data directly to avoid URL length limits
      try {
        const slideDataString = JSON.stringify(slide);
        console.log(`📄 Slide ${i + 1} data size:`, slideDataString.length, 'bytes');
        
        // First navigate to editor with export mode
        const editorUrl = `${baseUrl}/editor?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${i}&export=true`;
        
        console.log(`📄 Navigating to: ${editorUrl}`);
        await page.goto(editorUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        
        // Inject slide data directly into the page before React hydrates
        await page.evaluateOnNewDocument((slideData) => {
          (window as any).__EXPORT_SLIDE_DATA__ = slideData;
          console.log('📄 Injected slide data into window.__EXPORT_SLIDE_DATA__');
        }, slide);
        
        // Reload to apply the injected data
        await page.reload({ 
          waitUntil: 'networkidle0',
          timeout: 15000
        });
        
        // Wait for fonts to load before capturing
        await page.evaluateHandle('document.fonts.ready');
        
        // Debug: Check what fonts are actually loaded
        const loadedFonts = await page.evaluate(() => {
          const fonts: string[] = [];
          document.fonts.forEach((font: any) => {
            fonts.push(`${font.family} (${font.style})`);
          });
          return fonts;
        });
        console.log(`📄 Fonts loaded for slide ${i + 1}:`, loadedFonts);
        
        // Debug: Check what font is actually being used
        const actualFont = await page.evaluate(() => {
          const element = document.querySelector('.slide-content') || document.body;
          return window.getComputedStyle(element).fontFamily;
        });
        console.log(`📄 Actual font being used on slide ${i + 1}:`, actualFont);
        
        // Wait for the slide to be fully rendered
        console.log(`📄 Waiting for .slide-content selector for slide ${i + 1}`);
        
        // Try to wait for .slide-content, but also check for Excel layouts (data-chart-container)
        const hasSlideContent = await page.waitForSelector('.slide-content', { timeout: 5000 }).then(() => true).catch(() => false);
        const hasExcelLayout = await page.waitForSelector('[data-chart-container]', { timeout: 5000 }).then(() => true).catch(() => false);
        
        if (!hasSlideContent && !hasExcelLayout) {
          console.warn(`⚠️ Slide ${i + 1} has neither .slide-content nor [data-chart-container] - may fail to render`);
        }
        
        console.log(`📄 Slide ${i + 1} - hasSlideContent: ${hasSlideContent}, hasExcelLayout: ${hasExcelLayout}`);
        
        // Wait for content to be loaded and rendered (flexible for both standard and Excel layouts)
        await page.waitForFunction(() => {
          const slideContent = document.querySelector('.slide-content');
          const excelLayout = document.querySelector('[data-chart-container]');
          
          if (slideContent && slideContent.children.length > 0) return true;
          if (excelLayout && excelLayout.children.length > 0) return true;
          
          return false;
        }, { timeout: 10000 }).catch(() => {
          console.warn(`⚠️ Timeout waiting for slide content on slide ${i + 1}`);
        });
        
        // Check if the slide content actually has content
        const hasContent = await page.evaluate(() => {
          const slideContent = document.querySelector('.slide-content');
          const contentCount = slideContent ? slideContent.children.length : 0;
          console.log('Slide content children count:', contentCount);
          return slideContent && contentCount > 0;
        });
        
        console.log(`📄 Slide ${i + 1} has content: ${hasContent}`);
        
        // Enhanced chart rendering wait - specifically handles Excel layouts with multiple charts
        await page.waitForFunction(() => {
          // Check if there are any charts (SVG elements from Recharts)
          const svgElements = document.querySelectorAll('svg.recharts-surface');
          if (svgElements.length === 0) {
            // No Recharts SVGs, but check if there are other SVG elements
            const allSvgs = document.querySelectorAll('svg');
            return allSvgs.length === 0; // Return true if no SVGs at all
          }
          
          console.log(`Found ${svgElements.length} Recharts SVG elements`);
          
          // Check if all Recharts SVG elements have proper content and dimensions
          let allChartsReady = true;
          svgElements.forEach((svg, index) => {
            const children = svg.children;
            const width = (svg as SVGElement).getBBox().width;
            const height = (svg as SVGElement).getBBox().height;
            
            // Chart must have children and non-zero dimensions
            if (children.length === 0 || width === 0 || height === 0) {
              console.log(`Chart ${index + 1} not ready: children=${children.length}, width=${width}, height=${height}`);
              allChartsReady = false;
            }
          });
          
          return allChartsReady;
        }, { timeout: 15000 }).catch(() => {
          console.log(`⚠️ Timeout waiting for charts on slide ${i + 1}, proceeding anyway`);
        });
        
        // Wait for tables to be fully rendered
        await page.waitForFunction(() => {
          const tables = document.querySelectorAll('table');
          if (tables.length === 0) return true; // No tables, ready to proceed
          
          // Check if all tables have rows
          let allTablesHaveContent = true;
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            if (rows.length === 0) {
              allTablesHaveContent = false;
            }
          });
          
          return allTablesHaveContent;
        }, { timeout: 5000 }).catch(() => {
          console.log(`⚠️ Timeout waiting for tables on slide ${i + 1}, proceeding anyway`);
        });
        
        // Wait for ResponsiveContainer to calculate dimensions
        await page.waitForFunction(() => {
          const responsiveContainers = document.querySelectorAll('.recharts-responsive-container');
          if (responsiveContainers.length === 0) return true; // No responsive containers
          
          console.log(`Found ${responsiveContainers.length} Recharts responsive containers`);
          
          // Check if all responsive containers have calculated dimensions
          let allHaveDimensions = true;
          responsiveContainers.forEach((container, index) => {
            const width = (container as HTMLElement).offsetWidth;
            const height = (container as HTMLElement).offsetHeight;
            if (width === 0 || height === 0) {
              console.log(`Container ${index + 1} has zero dimensions: width=${width}, height=${height}`);
              allHaveDimensions = false;
            }
          });
          
          return allHaveDimensions;
        }, { timeout: 8000 }).catch(() => {
          console.log(`⚠️ Timeout waiting for ResponsiveContainer dimensions on slide ${i + 1}, proceeding anyway`);
        });
        
        // Detect if this is an Excel layout with multiple charts (e.g., KPI Dashboard)
        const layoutInfo = await page.evaluate(() => {
          const excelLayout = document.querySelector('[data-chart-container]');
          const chartCount = document.querySelectorAll('svg.recharts-surface').length;
          const isKPIDashboard = excelLayout?.getAttribute('data-chart-container') === 'kpi-dashboard';
          const isComparisonLayout = excelLayout?.getAttribute('data-chart-container') === 'comparison-chart';
          
          return {
            isExcelLayout: !!excelLayout,
            layoutType: excelLayout?.getAttribute('data-chart-container'),
            chartCount,
            isComplexLayout: isKPIDashboard || isComparisonLayout || chartCount > 1
          };
        });
        
        console.log(`📄 Slide ${i + 1} layout info:`, layoutInfo);
        
        // Wait additional time based on layout complexity
        // Complex layouts (multiple charts, calculations) need more time
        const waitTime = layoutInfo.isComplexLayout ? 3500 : 2000;
        console.log(`📄 Waiting ${waitTime}ms for animations and final rendering on slide ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // Hide UI elements that shouldn't be in PDF and ensure full size rendering
        await page.addStyleTag({
          content: `
            .sidebar, .toolbar, .controls, .ui-overlay, .figma-selection-box, .resize-handle, .text-popup, .slide-nav { 
              display: none !important; 
            }
            body { 
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 1920px !important;
              height: 1080px !important;
              background: white !important;
              zoom: 1 !important;
            }
            .slide-content {
              width: 1920px !important;
              height: 1080px !important;
              transform: scale(2.18) !important;
              transform-origin: top left !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              background: white !important;
              overflow: visible !important;
            }
            /* Excel layouts with data-chart-container need special handling */
            [data-chart-container] {
              width: 1920px !important;
              height: 1080px !important;
              transform: scale(2.18) !important;
              transform-origin: top left !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              background: white !important;
              overflow: visible !important;
            }
            /* Ensure all content is visible and properly sized */
            .slide-content *, [data-chart-container] * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Scale the inner content properly */
            .slide-content > div {
              width: 881px !important;
              height: 495px !important;
              position: relative !important;
              transform: none !important;
            }
            /* Excel layouts maintain their native dimensions */
            [data-chart-container] > div {
              position: relative !important;
              transform: none !important;
            }
            /* Ensure consistent font rendering */
            * {
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
            /* Fix table rendering for PDF - respect component inline styles */
            table {
              border-collapse: collapse !important;
            }
            th, td {
              vertical-align: middle !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            /* Ensure proper text rendering in tables */
            table * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Ensure SVG charts render properly */
            svg {
              overflow: visible !important;
              display: block !important;
            }
            /* Ensure Recharts container renders properly */
            .recharts-wrapper, .recharts-surface {
              overflow: visible !important;
            }
            /* Force chart containers to have proper dimensions */
            .chart-container {
              width: 100% !important;
              height: auto !important;
              min-height: 280px !important;
              overflow: visible !important;
            }
            /* Ensure responsive containers work in PDF */
            .recharts-responsive-container {
              position: relative !important;
              width: 100% !important;
              height: 100% !important;
            }
          `
        });

        // Debug: Take a screenshot to see what's being rendered
        const screenshot = await page.screenshot({ 
          fullPage: true,
          type: 'png'
        });
        console.log(`📄 Screenshot taken for slide ${i + 1}, size: ${screenshot.length} bytes`);
        
        // Debug: Get the actual HTML content and dimensions being rendered
        const debugInfo = await page.evaluate(() => {
          const slideContent = document.querySelector('.slide-content');
          const excelLayout = document.querySelector('[data-chart-container]');
          const body = document.body;
          const chartCount = document.querySelectorAll('svg.recharts-surface').length;
          
          return {
            hasSlideContent: !!slideContent,
            hasExcelLayout: !!excelLayout,
            excelLayoutType: excelLayout?.getAttribute('data-chart-container'),
            chartCount: chartCount,
            slideContentDimensions: slideContent ? {
              width: slideContent.offsetWidth,
              height: slideContent.offsetHeight,
              scrollWidth: slideContent.scrollWidth,
              scrollHeight: slideContent.scrollHeight,
              computedStyle: window.getComputedStyle(slideContent).transform
            } : null,
            excelLayoutDimensions: excelLayout ? {
              width: (excelLayout as HTMLElement).offsetWidth,
              height: (excelLayout as HTMLElement).offsetHeight,
              scrollWidth: (excelLayout as HTMLElement).scrollWidth,
              scrollHeight: (excelLayout as HTMLElement).scrollHeight
            } : null,
            bodyDimensions: {
              width: body.offsetWidth,
              height: body.offsetHeight,
              scrollWidth: body.scrollWidth,
              scrollHeight: body.scrollHeight
            },
            htmlPreview: (slideContent || excelLayout)?.innerHTML.substring(0, 200) + '...' || 'No content found'
          };
        });
        console.log(`📄 Slide ${i + 1} debug info:`, JSON.stringify(debugInfo, null, 2));

        // Generate PDF for this slide
        const pdfBuffer = await page.pdf({
          width: '1920px',
          height: '1080px',
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          preferCSSPageSize: false,
          format: undefined // Use width/height instead of format
        });

        pdfPages.push(pdfBuffer);
        
      } catch (error) {
        console.error(`❌ Error rendering slide ${i + 1}:`, error);
        
        // Create a fallback page with error message instead of skipping
        try {
          await page.goto('data:text/html,<html><body style="margin:0;padding:0;width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;background:white;font-family:Arial,sans-serif;"><div style="text-align:center;"><h1 style="color:#666;margin-bottom:20px;">Slide ' + (i + 1) + '</h1><p style="color:#999;">Error rendering this slide</p><p style="color:#ccc;font-size:12px;">Slide ID: ' + slide.id + '</p></div></body></html>', { 
            waitUntil: 'domcontentloaded',
            timeout: 5000
          });
          
          const fallbackPdfBuffer = await page.pdf({
            width: '1920px',
            height: '1080px',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
          });
          
          pdfPages.push(fallbackPdfBuffer);
          console.log(`📄 Added fallback page for slide ${i + 1}`);
          
        } catch (fallbackError) {
          console.error(`❌ Failed to create fallback page for slide ${i + 1}:`, fallbackError);
        }
      }
    }

    await browser.close();

    if (pdfPages.length === 0) {
      throw new Error('No slides were successfully rendered');
    }

    // Merge all PDFs into one
    let finalPdf: Buffer;
    
    if (pdfPages.length === 1) {
      finalPdf = pdfPages[0];
    } else {
      const merger = new PDFMerger();
      
      for (const pdfBuffer of pdfPages) {
        await merger.add(pdfBuffer);
      }
      
      const mergedPdfBuffer = await merger.saveAsBuffer();
      finalPdf = Buffer.from(mergedPdfBuffer);
    }
    
    console.log(`✅ PDF Export: Successfully generated PDF with ${pdfPages.length} slides`);

    return new NextResponse(finalPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title || 'presentation'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ PDF Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
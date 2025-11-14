import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function POST(request: NextRequest) {
  try {
    const { presentationId, workspace, slides, title } = await request.json();
    
    console.log('📊 PowerPoint Export: Starting export for presentation:', { presentationId, title, slidesCount: slides?.length });

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    // Get the host from the request headers
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    console.log('📊 Using base URL:', baseUrl);

    // Launch Puppeteer to capture slide images
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set viewport to match slide dimensions (16:9 ratio, high resolution)
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 2
    });

    // Array to store slide images
    const slideImages: string[] = [];

    // Render each slide (using same logic as PDF export)
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`📸 Capturing slide ${i + 1}/${slides.length}: ${slide.id}`);
      
      try {
        // Navigate to editor with export mode
        const editorUrl = `${baseUrl}/editor?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${i}&export=true`;
        
        console.log(`📸 Navigating to: ${editorUrl}`);
        await page.goto(editorUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        
        // Inject slide data directly
        await page.evaluateOnNewDocument((slideData) => {
          (window as any).__EXPORT_SLIDE_DATA__ = slideData;
        }, slide);
        
        // Reload to apply injected data
        await page.reload({ 
          waitUntil: 'networkidle0',
          timeout: 15000
        });
        
        // Wait for fonts
        await page.evaluateHandle('document.fonts.ready');
        
        // Wait for slide content or Excel layout
        const hasSlideContent = await page.waitForSelector('.slide-content', { timeout: 5000 }).then(() => true).catch(() => false);
        const hasExcelLayout = await page.waitForSelector('[data-chart-container]', { timeout: 5000 }).then(() => true).catch(() => false);
        
        console.log(`📸 Slide ${i + 1} - hasSlideContent: ${hasSlideContent}, hasExcelLayout: ${hasExcelLayout}`);
        
        // Wait for content to be loaded
        await page.waitForFunction(() => {
          const slideContent = document.querySelector('.slide-content');
          const excelLayout = document.querySelector('[data-chart-container]');
          
          if (slideContent && slideContent.children.length > 0) return true;
          if (excelLayout && excelLayout.children.length > 0) return true;
          
          return false;
        }, { timeout: 10000 }).catch(() => {
          console.warn(`⚠️ Timeout waiting for slide content on slide ${i + 1}`);
        });
        
        // Wait for charts to render
        await page.waitForFunction(() => {
          const svgElements = document.querySelectorAll('svg.recharts-surface');
          if (svgElements.length === 0) {
            const allSvgs = document.querySelectorAll('svg');
            return allSvgs.length === 0;
          }
          
          let allChartsReady = true;
          svgElements.forEach((svg) => {
            const children = svg.children;
            const width = (svg as SVGElement).getBBox().width;
            const height = (svg as SVGElement).getBBox().height;
            
            if (children.length === 0 || width === 0 || height === 0) {
              allChartsReady = false;
            }
          });
          
          return allChartsReady;
        }, { timeout: 15000 }).catch(() => {
          console.log(`⚠️ Timeout waiting for charts on slide ${i + 1}, proceeding anyway`);
        });
        
        // Wait for ResponsiveContainer dimensions
        await page.waitForFunction(() => {
          const responsiveContainers = document.querySelectorAll('.recharts-responsive-container');
          if (responsiveContainers.length === 0) return true;
          
          let allHaveDimensions = true;
          responsiveContainers.forEach((container) => {
            const width = (container as HTMLElement).offsetWidth;
            const height = (container as HTMLElement).offsetHeight;
            if (width === 0 || height === 0) {
              allHaveDimensions = false;
            }
          });
          
          return allHaveDimensions;
        }, { timeout: 8000 }).catch(() => {
          console.log(`⚠️ Timeout waiting for ResponsiveContainer on slide ${i + 1}`);
        });
        
        // Additional wait for complex layouts
        const layoutInfo = await page.evaluate(() => {
          const chartCount = document.querySelectorAll('svg.recharts-surface').length;
          return { chartCount, isComplexLayout: chartCount > 1 };
        });
        
        const waitTime = layoutInfo.isComplexLayout ? 3500 : 2000;
        console.log(`📸 Waiting ${waitTime}ms for final rendering on slide ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // Hide UI elements and ensure full-size rendering
        await page.addStyleTag({
          content: `
            /* Hide all UI elements */
            .sidebar, .toolbar, .controls, .ui-overlay, .figma-selection-box, 
            .resize-handle, .text-popup, .slide-nav, nav, header, footer,
            button, .edit-button {
              display: none !important; 
              visibility: hidden !important;
            }
            
            /* Full viewport size */
            html, body { 
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 1920px !important;
              height: 1080px !important;
              background: white !important;
            }
            
            /* Scale slide content to fill viewport */
            .slide-content {
              width: 1920px !important;
              height: 1080px !important;
              transform: scale(2.18) !important;
              transform-origin: top left !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              overflow: visible !important;
            }
            
            /* Excel layouts (charts) need to fill the full viewport */
            [data-chart-container] {
              width: 1920px !important;
              height: 1080px !important;
              transform: none !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              overflow: visible !important;
              display: flex !important;
              flex-direction: column !important;
            }
            
            /* Inner content of Excel layouts */
            [data-chart-container] > * {
              width: 100% !important;
              height: 100% !important;
              flex: 1 !important;
            }
            
            /* Ensure charts fill their containers */
            .recharts-responsive-container {
              position: relative !important;
              width: 100% !important;
              height: 100% !important;
              min-height: 400px !important;
            }
            
            /* Chart quality */
            svg {
              shape-rendering: geometricPrecision !important;
              text-rendering: geometricPrecision !important;
            }
            
            /* Color accuracy */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              -webkit-font-smoothing: antialiased !important;
            }
          `
        });

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false,
          omitBackground: false,
          encoding: 'base64'
        });

        slideImages.push(`data:image/png;base64,${screenshot}`);
        console.log(`✅ Captured slide ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error capturing slide ${i + 1}:`, error);
        // Add a blank slide on error
        slideImages.push('');
      }
    }

    await browser.close();

    // Create PowerPoint presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'Slaid AI';
    pptx.company = 'Slaid';
    pptx.title = title || 'Presentation';
    pptx.subject = 'Generated Presentation';
    
    // Set slide dimensions (16:9 aspect ratio)
    pptx.layout = 'LAYOUT_16x9';
    pptx.defineLayout({ name: 'SLAID_LAYOUT', width: 10, height: 5.625 });
    pptx.layout = 'SLAID_LAYOUT';

    // Add each captured slide as an image
    for (let i = 0; i < slideImages.length; i++) {
      const slide = pptx.addSlide();
      
      if (slideImages[i]) {
        // Add the full slide image
        slide.addImage({
          data: slideImages[i],
          x: 0,
          y: 0,
          w: '100%',
          h: '100%'
        });
      } else {
        // Fallback: add slide title if image capture failed
        const slideData = slides[i];
        slide.addText('Slide ' + (i + 1) + (slideData.title ? ': ' + slideData.title : ''), {
          x: 0.5,
          y: 2.5,
          w: 9,
          h: 1,
          fontSize: 24,
          color: '333333',
          align: 'center',
        });
      }
    }

    // Generate the PPTX file
    console.log('📊 Generating PPTX file...');
    const pptxData = await pptx.write({ outputType: 'base64' });
    
    // Convert base64 to buffer
    const buffer = Buffer.from(pptxData as string, 'base64');
    
    console.log('✅ PowerPoint export completed successfully');
    
    // Return the file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${title || 'presentation'}.pptx"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('❌ PowerPoint export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PowerPoint presentation', details: (error as Error).message },
      { status: 500 }
    );
  }
}

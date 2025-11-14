import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Check if slide has charts
function hasCharts(slideData: any): boolean {
  if (!slideData.blocks) return false;
  return slideData.blocks.some((block: any) => {
    const type = block.type;
    return type?.includes('Chart') || type?.includes('KPI') || type?.includes('Dashboard');
  });
}

// Helper function to add all content as editable (text) or images (charts only)
function addSlideContent(slide: any, slideData: any, chartImage: string | null) {
  if (!slideData.blocks) return;
  
  // Process each block
  slideData.blocks.forEach((block: any) => {
    const blockType = block.type;
    const props = block.props || {};
    
    // Check if this is a chart block
    const isChartBlock = blockType?.includes('Chart') || blockType?.includes('KPI') || blockType?.includes('Dashboard');
    
    if (isChartBlock && chartImage) {
      // Add chart as image
      slide.addImage({
        data: chartImage,
        x: 0.6,
        y: 1.2,
        w: 8.8,
        h: 3.8
      });
      
      // Add title as editable text
      if (props.title) {
        slide.addText(props.title, {
          x: 0.6,
          y: 0.5,
          w: 5,
          h: 0.5,
          fontSize: 20,
          bold: false,
          color: '1a1a1a',
          align: 'left',
          fontFace: 'Helvetica'
        });
      }
      
      // Add description as editable text
      if (props.description || props.subtitle) {
        slide.addText(props.description || props.subtitle, {
          x: 5.2,
          y: 0.5,
          w: 4,
          h: 0.6,
          fontSize: 9,
          color: '666666',
          align: 'left',
          fontFace: 'Helvetica'
        });
      }
    } else {
      // Non-chart blocks - add as editable text
      switch (blockType) {
        case 'BackgroundBlock':
          // Set background color
          if (props.color) {
            const colorMap: any = {
              'bg-white': 'FFFFFF',
              'bg-gray-50': 'F9FAFB',
              'bg-gray-100': 'F3F4F6'
            };
            slide.background = { color: colorMap[props.color] || 'FFFFFF' };
          }
          break;
          
        case 'Cover_TextCenter':
        case 'Cover_ProductLayout':
        case 'Cover_LeftImageTextRight':
        case 'ExcelCenteredCover_Responsive':
          // Cover slides - title centered
          if (props.title) {
            slide.addText(props.title, {
              x: 0.5,
              y: 2.3,
              w: 9,
              h: 1,
              fontSize: 40,
              bold: true,
              color: '1a1a1a',
              align: 'center',
              fontFace: 'Helvetica'
            });
          }
          if (props.paragraph || props.description) {
            slide.addText(props.paragraph || props.description, {
              x: 1,
              y: 3.3,
              w: 8,
              h: 0.8,
              fontSize: 14,
              color: '666666',
              align: 'center',
              fontFace: 'Helvetica'
            });
          }
          break;
          
        case 'Lists_LeftTextRightImage':
        case 'Lists_CardsLayout':
          // List slides - title at top
          if (props.title) {
            slide.addText(props.title, {
              x: 0.4,
              y: 0.4,
              w: 9,
              h: 0.5,
              fontSize: 24,
              bold: false,
              color: '1a1a1a',
              align: 'left',
              fontFace: 'Helvetica'
            });
          }
          // Add list items
          if (props.items && Array.isArray(props.items)) {
            const bulletText = props.items.map((item: any) => {
              return typeof item === 'string' ? item : (item.title || item.text || item);
            }).join('\n');
            
            slide.addText(bulletText, {
              x: 0.4,
              y: 1.2,
              w: 4.8,
              h: 3.5,
              fontSize: 14,
              color: '333333',
              fontFace: 'Helvetica',
              bullet: true
            });
          }
          break;
          
        case 'BackCover_ThankYouWithImage':
        case 'ExcelBackCover_Responsive':
          slide.addText('Thank You', {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 48,
            bold: true,
            color: '1a1a1a',
            align: 'center',
            fontFace: 'Helvetica'
          });
          break;
      }
    }
  });
}

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

    // Render each slide - only capture chart images for chart slides
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      const slideHasCharts = hasCharts(slideData);
      
      console.log(`📸 Processing slide ${i + 1}/${slides.length}: ${slideData.id} (hasCharts: ${slideHasCharts})`);
      
      // Only capture image if slide has charts
      if (!slideHasCharts) {
        slideImages.push(''); // No image for non-chart slides
        continue;
      }
      
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

        // Hide UI elements and scale properly (EXACT same CSS as PDF export)
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
            /* Chart quality */
            svg {
              shape-rendering: geometricPrecision !important;
              text-rendering: geometricPrecision !important;
            }
            /* Color accuracy and font rendering */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
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

    // Build PowerPoint slides with editable text + chart images
    for (let i = 0; i < slides.length; i++) {
      const slide = pptx.addSlide();
      const slideData = slides[i];
      const chartImage = slideImages[i] || null;
      
      // Add all content (text as editable, charts as images)
      addSlideContent(slide, slideData, chartImage);
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

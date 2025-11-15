import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Add editable text overlays to PowerPoint slides
function addTextOverlays(slide: any, slideData: any) {
  if (!slideData.blocks) return;
  
  slideData.blocks.forEach((block: any) => {
    const type = block.type;
    const props = block.props || {};
    
    switch (type) {
      // Cover slides
      case 'Cover_TextCenter':
      case 'Cover_ProductLayout':
      case 'Cover_LeftImageTextRight':
      case 'ExcelCenteredCover_Responsive':
        if (props.title) {
          slide.addText(props.title, {
            x: 1,
            y: 2.5,
            w: 8,
            h: 0.8,
            fontSize: 36,
            bold: true,
            color: '1a1a1a',
            align: 'center',
            fontFace: 'Helvetica'
          });
        }
        if (props.paragraph || props.description) {
          slide.addText(props.paragraph || props.description, {
            x: 1.5,
            y: 3.5,
            w: 7,
            h: 0.5,
            fontSize: 14,
            color: '666666',
            align: 'center',
            fontFace: 'Helvetica'
          });
        }
        break;
        
      // Chart slides with title and description
      case 'ExcelFullWidthChart_Responsive':
      case 'ExcelFullWidthChartCategorical_Responsive':
      case 'ExcelFullWidthChartWithTable_Responsive':
      case 'ExcelKPIDashboard_Responsive':
      case 'ExcelComparisonLayout_Responsive':
        if (props.title) {
          slide.addText(props.title, {
            x: 0.6,
            y: 0.5,
            w: 5,
            h: 0.4,
            fontSize: 20,
            bold: false,
            color: '1a1a1a',
            fontFace: 'Helvetica'
          });
        }
        if (props.description || props.subtitle) {
          slide.addText(props.description || props.subtitle, {
            x: 5.8,
            y: 0.5,
            w: 3.6,
            h: 0.4,
            fontSize: 9,
            color: '666666',
            fontFace: 'Helvetica',
            valign: 'top'
          });
        }
        break;
        
      // Trend Chart and Pie Chart with insights on the right
      case 'ExcelTrendChart_Responsive':
      case 'ExcelPieChart_Responsive':
        if (props.title) {
          slide.addText(props.title, {
            x: 0.6,
            y: 0.5,
            w: 5.5,
            h: 0.4,
            fontSize: 20,
            bold: false,
            color: '1a1a1a',
            fontFace: 'Helvetica'
          });
        }
        // Add insights as bullet points on the right
        if (props.insights && Array.isArray(props.insights)) {
          const insightsText = props.insights.map((insight: string) => ({
            text: insight,
            options: { bullet: true }
          }));
          
          slide.addText(insightsText, {
            x: 6.3,
            y: 1.5,
            w: 3.1,
            h: 3,
            fontSize: 9,
            color: '333333',
            fontFace: 'Helvetica',
            valign: 'top'
          });
        }
        break;
        
      // How It Works layout (left: title/subtitle, right: 2x2 features grid)
      case 'ExcelHowItWorks_Responsive':
        // Title on LEFT side
        if (props.title) {
          slide.addText(props.title, {
            x: 0.6,
            y: 2,
            w: 3,
            h: 0.6,
            fontSize: 28,
            bold: false,
            color: '1a1a1a',
            fontFace: 'Helvetica',
            valign: 'middle'
          });
        }
        // Subtitle below title on LEFT side
        if (props.subtitle) {
          slide.addText(props.subtitle, {
            x: 0.6,
            y: 2.7,
            w: 3,
            h: 0.8,
            fontSize: 10,
            color: '666666',
            fontFace: 'Helvetica',
            valign: 'top'
          });
        }
        // Features in 2x2 grid on RIGHT side
        if (props.features && Array.isArray(props.features)) {
          props.features.forEach((feature: any, index: number) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            
            // Feature title
            if (feature.title) {
              slide.addText(feature.title, {
                x: 4 + col * 3,
                y: 1.2 + row * 2,
                w: 2.8,
                h: 0.3,
                fontSize: 14,
                bold: true,
                color: '1a1a1a',
                fontFace: 'Helvetica'
              });
            }
            
            // Feature description
            if (feature.description) {
              slide.addText(feature.description, {
                x: 4 + col * 3,
                y: 1.55 + row * 2,
                w: 2.8,
                h: 1,
                fontSize: 10,
                color: '666666',
                fontFace: 'Helvetica',
                valign: 'top'
              });
            }
          });
        }
        break;
        
      // List slides with items
      case 'Lists_LeftTextRightImage':
        if (props.title) {
          slide.addText(props.title, {
            x: 0.4,
            y: 0.4,
            w: 5,
            h: 0.5,
            fontSize: 24,
            bold: false,
            color: '1a1a1a',
            fontFace: 'Helvetica'
          });
        }
        // Add list items as bullet points
        if (props.items && Array.isArray(props.items)) {
          const bulletText = props.items.map((item: any) => ({
            text: typeof item === 'string' ? item : (item.title || item.text || ''),
            options: { bullet: true }
          }));
          
          slide.addText(bulletText, {
            x: 0.4,
            y: 1.2,
            w: 4.8,
            h: 3.5,
            fontSize: 14,
            color: '333333',
            fontFace: 'Helvetica',
            valign: 'top'
          });
        }
        break;
        
      case 'Lists_CardsLayout':
      case 'Lists_CardsLayoutRight':
        if (props.title) {
          slide.addText(props.title, {
            x: 0.4,
            y: 0.4,
            w: 9,
            h: 0.5,
            fontSize: 24,
            bold: false,
            color: '1a1a1a',
            fontFace: 'Helvetica'
          });
        }
        // Add cards
        if (props.cards && Array.isArray(props.cards)) {
          props.cards.forEach((card: any, index: number) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            
            // Card title
            if (card.title) {
              slide.addText(card.title, {
                x: 0.4 + col * 4.8,
                y: 1.5 + row * 1.8,
                w: 4.4,
                h: 0.35,
                fontSize: 16,
                bold: true,
                color: '1a1a1a',
                fontFace: 'Helvetica'
              });
            }
            
            // Card description
            if (card.description) {
              slide.addText(card.description, {
                x: 0.4 + col * 4.8,
                y: 1.9 + row * 1.8,
                w: 4.4,
                h: 0.8,
                fontSize: 11,
                color: '666666',
                fontFace: 'Helvetica',
                valign: 'top'
              });
            }
          });
        }
        break;
        
      // Text-heavy slides
      case 'ExcelExperienceFullText_Responsive':
        if (props.title) {
          slide.addText(props.title, {
            x: 0.6,
            y: 0.6,
            w: 9,
            h: 0.5,
            fontSize: 24,
            bold: false,
            color: '1a1a1a',
            fontFace: 'Helvetica'
          });
        }
        if (props.leftText) {
          slide.addText(props.leftText, {
            x: 0.6,
            y: 1.3,
            w: 4.3,
            h: 3.5,
            fontSize: 11,
            color: '333333',
            fontFace: 'Helvetica',
            valign: 'top'
          });
        }
        if (props.rightText) {
          slide.addText(props.rightText, {
            x: 5.1,
            y: 1.3,
            w: 4.3,
            h: 3.5,
            fontSize: 11,
            color: '333333',
            fontFace: 'Helvetica',
            valign: 'top'
          });
        }
        break;
        
      // Back cover
      case 'BackCover_ThankYouWithImage':
      case 'ExcelBackCover_Responsive':
        slide.addText('Thank You', {
          x: 1,
          y: 2.5,
          w: 8,
          h: 1,
          fontSize: 48,
          bold: true,
          color: '1a1a1a',
          align: 'center',
          fontFace: 'Helvetica'
        });
        break;
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

        // Hide UI elements, ALL TEXT, and scale properly - only capture charts
        await page.addStyleTag({
          content: `
            .sidebar, .toolbar, .controls, .ui-overlay, .figma-selection-box, .resize-handle, .text-popup, .slide-nav {
              display: none !important; 
            }
            
            /* Hide text elements - but keep structure */
            h1, h2, h3, h4, h5, h6, p, a, li, ul, ol {
              visibility: hidden !important;
              opacity: 0 !important;
            }
            
            /* Hide span elements that are NOT part of charts */
            span:not([data-chart-container] *):not(.recharts-wrapper *):not(.recharts-surface *):not(.recharts-legend-wrapper *) {
              visibility: hidden !important;
              opacity: 0 !important;
            }
            
            /* Keep ALL chart-related elements visible (including legends) */
            [data-chart-container], [data-chart-container] *,
            .recharts-responsive-container, .recharts-responsive-container *,
            .recharts-wrapper, .recharts-wrapper *,
            .recharts-surface, .recharts-surface *,
            .recharts-legend-wrapper, .recharts-legend-wrapper *,
            .recharts-legend-item, .recharts-legend-item *,
            svg, svg *, text {
              visibility: visible !important;
              opacity: 1 !important;
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

    // Add each captured slide as an image + editable text overlays
    for (let i = 0; i < slideImages.length; i++) {
      const slide = pptx.addSlide();
      const slideData = slides[i];
      
      if (slideImages[i]) {
        // Add the full slide image (charts only, no text)
        slide.addImage({
          data: slideImages[i],
          x: 0,
          y: 0,
          w: 10,
          h: 5.625
        });
        
        // Add editable text overlays on top
        addTextOverlays(slide, slideData);
      } else {
        // Fallback: add slide title if image capture failed
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

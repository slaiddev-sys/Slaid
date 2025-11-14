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

    // Get baseUrl for chart capture
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Launch browser for slide rendering (for chart slides)
    console.log('📊 Launching Puppeteer for slide rendering...');
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set high-resolution viewport for crisp rendering
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 2 // 2x for high DPI/retina displays
    });
    
    // Set user agent to ensure consistent rendering
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      console.log(`📊 Processing slide ${i + 1}/${slides.length}`);
      console.log(`📊 Slide ${i + 1} blocks:`, slideData.blocks?.map((b: any) => b.type));
      
      try {
        const slide = pptx.addSlide();
        
        // Check if this slide has charts
        const slideHasCharts = hasCharts(slideData);
        
        if (slideHasCharts) {
          // For chart slides: capture entire slide as background image
          console.log(`📊 Chart slide detected - capturing as image`);
          const slideImage = await captureSlideAsImage(page, baseUrl, presentationId, workspace, i);
          
          if (slideImage) {
            // Add full slide as background image
            slide.addImage({
              data: slideImage,
              x: 0,
              y: 0,
              w: '100%',
              h: '100%'
            });
            console.log(`✅ Slide image added as background`);
          }
        }
        
        // Add text content (editable) on top for ALL slides
        if (slideData.blocks && slideData.blocks.length > 0) {
          await addBlocksToSlide(slide, slideData.blocks, page, baseUrl, presentationId, workspace, i, slideHasCharts);
        }
      } catch (slideError) {
        console.error(`❌ Error processing slide ${i + 1}:`, slideError);
        // Continue with next slide
      }
    }

    await browser.close();

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

// Check if slide has charts
function hasCharts(slide: any): boolean {
  if (!slide.blocks) return false;
  
  const chartTypes = [
    'Chart', 'KPI', 'Comparison', 'Dashboard', 
    'ExcelFullWidthChart', 'ExcelTrendChart', 'ExcelPieChart',
    'Metrics_FullWidthChart', 'Metrics_FinancialsSplit',
    'Market_SizeAnalysis', 'Impact_KPIOverview'
  ];
  
  const hasChart = slide.blocks.some((block: any) => {
    const type = block.type;
    return chartTypes.some(chartType => type?.includes(chartType));
  });
  
  if (hasChart) {
    console.log(`📊 Charts detected in slide - will launch Puppeteer`);
  }
  
  return hasChart;
}

// Add blocks to PowerPoint slide
async function addBlocksToSlide(
  slide: any, 
  blocks: any[], 
  page: any, 
  baseUrl: string,
  presentationId: string,
  workspace: string,
  slideIndex: number,
  isChartSlide: boolean = false
) {
  for (const block of blocks) {
    try {
      await addBlockToSlide(slide, block, page, baseUrl, presentationId, workspace, slideIndex, isChartSlide);
    } catch (blockError) {
      console.error(`Error adding block ${block.type}:`, blockError);
      // Continue with next block
    }
  }
}

// Add individual block to slide
async function addBlockToSlide(
  slide: any,
  block: any,
  page: any,
  baseUrl: string,
  presentationId: string,
  workspace: string,
  slideIndex: number,
  isChartSlide: boolean = false
) {
  const blockType = block.type;
  const props = block.props || {};

  console.log(`  Adding block: ${blockType}`);

  // For chart slides, skip adding chart-related blocks (already captured as image)
  // Only add text content
  const isChartBlock = blockType?.includes('Chart') || blockType?.includes('KPI') || blockType?.includes('Dashboard');
  
  if (isChartSlide && isChartBlock) {
    console.log(`  Skipping ${blockType} - already captured in slide image`);
    return;
  }

  switch (blockType) {
    case 'BackgroundBlock':
      // Skip background if we have a slide image
      if (!isChartSlide && props.color) {
        const color = convertTailwindColorToHex(props.color);
        slide.background = { color };
      }
      break;

    case 'TextBlock':
      // Skip TextBlock - it's usually handled by layout components
      break;

    case 'Cover_TextCenter':
    case 'Cover_ProductLayout':
    case 'Cover_LeftImageTextRight':
    case 'ExcelCenteredCover_Responsive':
      // Cover slide
      if (props.title) {
        slide.addText(props.title, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 'auto',
          fontSize: 44,
          bold: true,
          color: '1a1a1a',
          align: 'center',
          fontFace: 'Helvetica',
          valign: 'middle',
        });
      }
      if (props.paragraph || props.subtitle || props.description) {
        slide.addText(props.paragraph || props.subtitle || props.description, {
          x: 1,
          y: 3.5,
          w: 8,
          h: 'auto',
          fontSize: 18,
          color: '666666',
          align: 'center',
          fontFace: 'Helvetica',
          breakLine: true,
        });
      }
      break;

    case 'Lists_LeftTextRightImage':
      // Title at top
      if (props.title) {
        slide.addText(props.title, {
          x: 0.4,
          y: 0.4,
          w: 5,
          h: 0.5,
          fontSize: 24,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Bullet points on left
      if (props.items && Array.isArray(props.items)) {
        const bulletText = props.items.map((item: any) => {
          if (typeof item === 'string') return { text: item, options: { bullet: true, bulletSize: 90 } };
          return { text: item.title || item.text || item, options: { bullet: true, bulletSize: 90 } };
        });
        
        slide.addText(bulletText, {
          x: 0.4,
          y: 1.2,
          w: 4.8,
          h: 3.5,
          fontSize: 14,
          color: '333333',
          fontFace: 'Helvetica',
          valign: 'top',
        });
      }
      break;

    case 'Lists_CardsLayout':
    case 'Lists_CardsLayoutRight':
      // Title
      if (props.title) {
        slide.addText(props.title, {
          x: 0.4,
          y: 0.4,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Description/subtitle
      if (props.description) {
        slide.addText(props.description, {
          x: 0.4,
          y: 0.95,
          w: 5,
          h: 0.4,
          fontSize: 12,
          color: '666666',
          fontFace: 'Helvetica',
        });
      }
      
      // Cards as text boxes
      if (props.cards && Array.isArray(props.cards)) {
        props.cards.forEach((card: any, index: number) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          
          // Card title
          slide.addText(card.title || '', {
            x: 0.4 + col * 4.8,
            y: 1.5 + row * 1.8,
            w: 4.4,
            h: 0.35,
            fontSize: 16,
            bold: true,
            color: '1a1a1a',
            fontFace: 'Helvetica',
          });
          
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
              valign: 'top',
            });
          }
        });
      }
      break;

    // Chart layouts - These are already captured as slide images
    // Only add text if NOT a chart slide (for non-chart content slides)
    case 'ExcelFullWidthChart_Responsive':
    case 'ExcelFullWidthChartCategorical_Responsive':
    case 'ExcelFullWidthChartWithTable_Responsive':
    case 'Metrics_FullWidthChart':
      // This is handled by the full slide capture now
      // No need to add anything here
      break;

    case 'ExcelTrendChart_Responsive':
    case 'ExcelPieChart_Responsive':
    case 'ExcelKPIDashboard_Responsive':
    case 'Impact_KPIOverview':
    case 'ExcelComparisonLayout_Responsive':
    case 'Metrics_FinancialsSplit':
    case 'Market_SizeAnalysis':
      // All chart layouts are handled by full slide capture
      // No need to add anything here
      break;
      
    case 'ExcelExperienceFullText_Responsive':
      // Title
      if (props.title) {
        slide.addText(props.title, {
          x: 0.6,
          y: 0.6,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Left text
      if (props.leftText) {
        slide.addText(props.leftText, {
          x: 0.6,
          y: 1.3,
          w: 4.3,
          h: 3.5,
          fontSize: 11,
          color: '333333',
          fontFace: 'Helvetica',
          valign: 'top',
        });
      }
      
      // Right text
      if (props.rightText) {
        slide.addText(props.rightText, {
          x: 5.1,
          y: 1.3,
          w: 4.3,
          h: 3.5,
          fontSize: 11,
          color: '333333',
          fontFace: 'Helvetica',
          valign: 'top',
        });
      }
      break;

    case 'BackCover_ThankYouWithImage':
    case 'ExcelBackCover_Responsive':
      // Back cover slide
      slide.addText('Thank You', {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1,
        fontSize: 48,
        bold: true,
        color: '1a1a1a',
        align: 'center',
        fontFace: 'Helvetica',
      });
      break;

    default:
      console.log(`  Unsupported block type: ${blockType}`);
  }
}

// Capture entire slide as image (for chart slides)
async function captureSlideAsImage(
  page: any,
  baseUrl: string,
  presentationId: string,
  workspace: string,
  slideIndex: number
): Promise<string | null> {
  try {
    console.log(`📸 Capturing full slide ${slideIndex + 1} as image`);
    const editorUrl = `${baseUrl}/editor?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${slideIndex}&export=true`;
    
    await page.goto(editorUrl, { 
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    // Wait for charts to be fully rendered
    await page.waitForFunction(() => {
      const svgElements = document.querySelectorAll('svg.recharts-surface');
      if (svgElements.length === 0) return true; // No charts, ready
      
      let allChartsReady = true;
      svgElements.forEach((svg) => {
        const bbox = (svg as SVGElement).getBBox();
        const children = svg.children;
        if (children.length === 0 || bbox.width === 0 || bbox.height === 0) {
          allChartsReady = false;
        }
      });
      
      return allChartsReady;
    }, { timeout: 15000 }).catch(() => null);
    
    // Wait for ResponsiveContainer
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
    }, { timeout: 8000 }).catch(() => null);
    
    // Wait additional time for complex charts
    const chartCount = await page.evaluate(() => document.querySelectorAll('svg.recharts-surface').length);
    const waitTime = chartCount > 1 ? 3500 : 2000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Hide UI elements
    await page.addStyleTag({
      content: `
        .sidebar, .toolbar, .controls, .ui-overlay, .figma-selection-box, 
        .resize-handle, .text-popup, .slide-nav, nav, header, footer,
        button, .edit-button { 
          display: none !important; 
        }
        body { 
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 1920px !important;
          height: 1080px !important;
        }
        .slide-content, [data-chart-container] {
          width: 1920px !important;
          height: 1080px !important;
          transform: scale(2.18) !important;
          transform-origin: top left !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
        svg {
          shape-rendering: geometricPrecision !important;
          text-rendering: geometricPrecision !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
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
    
    console.log(`✅ Slide ${slideIndex + 1} captured successfully`);
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.error(`❌ Failed to capture slide ${slideIndex + 1}:`, error);
    return null;
  }
}

// Capture chart as image - mimics PDF export for high quality
async function captureChartImage(
  page: any,
  baseUrl: string,
  presentationId: string,
  workspace: string,
  slideIndex: number
): Promise<string | null> {
  try {
    console.log(`📊 Capturing chart for slide ${slideIndex + 1}`);
    const editorUrl = `${baseUrl}/editor?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${slideIndex}&export=true`;
    
    await page.goto(editorUrl, { 
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    
    console.log(`📊 Page loaded, waiting for content...`);
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    // Wait for charts to be fully rendered with dimensions
    await page.waitForFunction(() => {
      const svgElements = document.querySelectorAll('svg.recharts-surface');
      if (svgElements.length === 0) return false;
      
      let allChartsReady = true;
      svgElements.forEach((svg) => {
        const bbox = (svg as SVGElement).getBBox();
        const children = svg.children;
        if (children.length === 0 || bbox.width === 0 || bbox.height === 0) {
          allChartsReady = false;
        }
      });
      
      return allChartsReady;
    }, { timeout: 15000 }).catch(() => {
      console.log(`⚠️ Timeout waiting for charts on slide ${slideIndex + 1}`);
      return null;
    });
    
    // Wait for ResponsiveContainer to calculate dimensions
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
      console.log(`⚠️ Timeout waiting for ResponsiveContainer on slide ${slideIndex + 1}`);
    });
    
    // Check layout complexity
    const layoutInfo = await page.evaluate(() => {
      const excelLayout = document.querySelector('[data-chart-container]');
      const chartCount = document.querySelectorAll('svg.recharts-surface').length;
      const isKPIDashboard = excelLayout?.getAttribute('data-chart-container') === 'kpi-dashboard';
      const isComparisonLayout = excelLayout?.getAttribute('data-chart-container') === 'comparison-chart';
      
      return {
        isExcelLayout: !!excelLayout,
        chartCount,
        isComplexLayout: isKPIDashboard || isComparisonLayout || chartCount > 1
      };
    });
    
    // Wait additional time based on complexity
    const waitTime = layoutInfo.isComplexLayout ? 3500 : 2000;
    console.log(`📊 Waiting ${waitTime}ms for final rendering (${layoutInfo.chartCount} charts)`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Hide UI elements and apply proper styling for export
    await page.addStyleTag({
      content: `
        /* Hide all UI elements */
        .sidebar, .toolbar, .controls, .ui-overlay, .figma-selection-box, 
        .resize-handle, .text-popup, .slide-nav, nav, header, footer,
        button, .edit-button { 
          display: none !important; 
          visibility: hidden !important;
        }
        
        /* Set proper body dimensions */
        body { 
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 1920px !important;
          height: 1080px !important;
          background: white !important;
        }
        
        /* Scale content properly */
        .slide-content, [data-chart-container] {
          width: 1920px !important;
          height: 1080px !important;
          transform: scale(2.18) !important;
          transform-origin: top left !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          overflow: visible !important;
        }
        
        /* Ensure chart quality */
        svg {
          shape-rendering: geometricPrecision !important;
          text-rendering: geometricPrecision !important;
        }
        
        /* Color accuracy */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        
        /* Ensure responsive containers work */
        .recharts-responsive-container {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
        }
      `
    });
    
    console.log(`📊 Taking high-resolution screenshot...`);
    
    // Take high-resolution screenshot of the entire slide
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false,
      encoding: 'base64'
    });
    
    console.log(`✅ Chart captured successfully (${screenshot.length} bytes)`);
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.error(`❌ Failed to capture chart for slide ${slideIndex + 1}:`, error);
    return null;
  }
}

// Helper functions
function convertTailwindColorToHex(tailwindColor: string): string {
  const colorMap: { [key: string]: string } = {
    'bg-white': 'FFFFFF',
    'bg-black': '000000',
    'bg-gray-50': 'F9FAFB',
    'bg-gray-100': 'F3F4F6',
    'bg-gray-900': '111827',
    'text-white': 'FFFFFF',
    'text-black': '000000',
    'text-gray-900': '111827',
    'text-gray-700': '374151',
    'text-gray-600': '4B5563',
    'text-gray-500': '6B7280',
  };
  return colorMap[tailwindColor] || '000000';
}

function getFontSize(variant?: string): number {
  const sizes: { [key: string]: number } = {
    'title': 44,
    'heading': 32,
    'body': 18,
    'caption': 14,
  };
  return sizes[variant || 'body'] || 18;
}

function getFontFamily(fontFamily?: string): string {
  if (fontFamily?.includes('helvetica')) return 'Helvetica';
  if (fontFamily?.includes('arial')) return 'Arial';
  return 'Helvetica';
}

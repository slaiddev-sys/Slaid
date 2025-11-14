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
    
    // Only launch browser if we need to capture charts
    let browser = null;
    let page = null;
    const needsChartCapture = slides.some((slide: any) => hasCharts(slide));
    
    if (needsChartCapture) {
      console.log('📊 Charts detected, launching Puppeteer for chart capture...');
      
      try {
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });

        page = await browser.newPage();
        await page.setViewport({ 
          width: 1920, 
          height: 1080,
          deviceScaleFactor: 2
        });
      } catch (error) {
        console.error('❌ Failed to launch Puppeteer:', error);
        // Continue without chart images
      }
    }

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      console.log(`📊 Processing slide ${i + 1}/${slides.length}`);
      
      try {
        const slide = pptx.addSlide();
        
        // Add content to slide
        if (slideData.blocks && slideData.blocks.length > 0) {
          await addBlocksToSlide(slide, slideData.blocks, page, baseUrl, presentationId, workspace, i);
        }
      } catch (slideError) {
        console.error(`❌ Error processing slide ${i + 1}:`, slideError);
        // Continue with next slide
      }
    }

    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('❌ Error closing browser:', error);
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

// Check if slide has charts
function hasCharts(slide: any): boolean {
  if (!slide.blocks) return false;
  
  return slide.blocks.some((block: any) => {
    const type = block.type;
    return type?.includes('Chart') || type?.includes('KPI') || type?.includes('Comparison');
  });
}

// Add blocks to PowerPoint slide
async function addBlocksToSlide(
  slide: any, 
  blocks: any[], 
  page: any, 
  baseUrl: string,
  presentationId: string,
  workspace: string,
  slideIndex: number
) {
  for (const block of blocks) {
    try {
      await addBlockToSlide(slide, block, page, baseUrl, presentationId, workspace, slideIndex);
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
  slideIndex: number
) {
  const blockType = block.type;
  const props = block.props || {};

  console.log(`  Adding block: ${blockType}`);

  switch (blockType) {
    case 'BackgroundBlock':
      // Set background color
      if (props.color) {
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

    // Chart layouts - Add text separately, capture charts as images
    case 'ExcelFullWidthChart_Responsive':
    case 'ExcelFullWidthChartCategorical_Responsive':
    case 'ExcelFullWidthChartWithTable_Responsive':
    case 'Metrics_FullWidthChart':
      // Title
      if (props.title) {
        slide.addText(props.title, {
          x: 0.6,
          y: 0.6,
          w: 4.5,
          h: 0.4,
          fontSize: 20,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Description/subtitle
      if (props.description || props.subtitle) {
        slide.addText(props.description || props.subtitle, {
          x: 5.2,
          y: 0.6,
          w: 4,
          h: 0.5,
          fontSize: 9,
          color: '666666',
          fontFace: 'Helvetica',
          valign: 'top',
        });
      }
      
      // Chart as image
      if (page && baseUrl) {
        const chartImage = await captureChartImage(page, baseUrl, presentationId, workspace, slideIndex);
        if (chartImage) {
          slide.addImage({
            data: chartImage,
            x: 0.6,
            y: 1.2,
            w: 8.8,
            h: 3.8,
            sizing: { type: 'contain', w: 8.8, h: 3.8 }
          });
        }
      }
      break;

    case 'ExcelTrendChart_Responsive':
    case 'ExcelPieChart_Responsive':
      // Title
      if (props.title) {
        slide.addText(props.title, {
          x: 0.6,
          y: 0.6,
          w: 5.5,
          h: 0.4,
          fontSize: 20,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Chart (left side) and insights (right side)
      if (page && baseUrl) {
        const chartImage = await captureChartImage(page, baseUrl, presentationId, workspace, slideIndex);
        if (chartImage) {
          slide.addImage({
            data: chartImage,
            x: 0.6,
            y: 1.2,
            w: 5.5,
            h: 3.5,
            sizing: { type: 'contain', w: 5.5, h: 3.5 }
          });
        }
      }
      
      // Insights as text
      if (props.insights && Array.isArray(props.insights)) {
        const insightsText = props.insights.map((insight: string, i: number) => 
          `• ${insight}`
        ).join('\n\n');
        
        slide.addText(insightsText, {
          x: 6.3,
          y: 1.5,
          w: 3.1,
          h: 3,
          fontSize: 9,
          color: '333333',
          fontFace: 'Helvetica',
          valign: 'top',
        });
      }
      break;

    case 'ExcelKPIDashboard_Responsive':
    case 'Impact_KPIOverview':
      // Title and description
      if (props.title) {
        slide.addText(props.title, {
          x: 0.6,
          y: 0.4,
          w: 9,
          h: 0.4,
          fontSize: 24,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      if (props.description) {
        slide.addText(props.description, {
          x: 0.6,
          y: 0.9,
          w: 6,
          h: 0.3,
          fontSize: 11,
          color: '666666',
          fontFace: 'Helvetica',
        });
      }
      
      // KPI cards as text
      if (props.kpiCards && Array.isArray(props.kpiCards)) {
        props.kpiCards.forEach((kpi: any, index: number) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          
          // KPI value
          slide.addText(kpi.value || '', {
            x: 0.6 + col * 3.1,
            y: 1.5 + row * 1.5,
            w: 2.8,
            h: 0.4,
            fontSize: 28,
            bold: true,
            color: '1a1a1a',
            fontFace: 'Helvetica',
          });
          
          // KPI label
          slide.addText(kpi.label || '', {
            x: 0.6 + col * 3.1,
            y: 2 + row * 1.5,
            w: 2.8,
            h: 0.25,
            fontSize: 11,
            color: '666666',
            fontFace: 'Helvetica',
          });
        });
      }
      break;

    case 'ExcelComparisonLayout_Responsive':
    case 'Metrics_FinancialsSplit':
    case 'Market_SizeAnalysis':
      // Title
      if (props.title) {
        slide.addText(props.title, {
          x: 0.6,
          y: 0.5,
          w: 9,
          h: 0.4,
          fontSize: 22,
          bold: false,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Chart as image
      if (page && baseUrl) {
        const chartImage = await captureChartImage(page, baseUrl, presentationId, workspace, slideIndex);
        if (chartImage) {
          slide.addImage({
            data: chartImage,
            x: 0.6,
            y: 1.1,
            w: 8.8,
            h: 4,
            sizing: { type: 'contain', w: 8.8, h: 4 }
          });
        }
      }
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

// Capture chart as image
async function captureChartImage(
  page: any,
  baseUrl: string,
  presentationId: string,
  workspace: string,
  slideIndex: number
): Promise<string | null> {
  try {
    const editorUrl = `${baseUrl}/editor?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${slideIndex}&export=true`;
    
    await page.goto(editorUrl, { 
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    
    // Wait for charts
    await page.waitForFunction(() => {
      const svgElements = document.querySelectorAll('svg.recharts-surface');
      return svgElements.length > 0;
    }, { timeout: 10000 }).catch(() => null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false,
    });
    
    return `data:image/png;base64,${screenshot.toString('base64')}`;
  } catch (error) {
    console.error('Failed to capture chart:', error);
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

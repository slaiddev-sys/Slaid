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
      // Add editable text
      const text = props.children || '';
      const fontSize = getFontSize(props.variant);
      
      slide.addText(text, {
        x: 0.5,
        y: 1,
        w: 9,
        h: 'auto',
        fontSize: fontSize,
        color: convertTailwindColorToHex(props.color || 'text-gray-900'),
        align: props.align || 'left',
        fontFace: getFontFamily(props.fontFamily),
        bold: props.variant === 'title' || props.variant === 'heading',
        breakLine: true,
        wrap: true,
      });
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
    case 'Lists_CardsLayout':
    case 'Lists_CardsLayoutRight':
      // Add title
      if (props.title) {
        slide.addText(props.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.7,
          fontSize: 32,
          bold: true,
          color: '1a1a1a',
          fontFace: 'Helvetica',
        });
      }
      
      // Add bullet points or cards
      if (props.items && Array.isArray(props.items)) {
        const bulletText = props.items.map((item: any) => {
          if (typeof item === 'string') return { text: item, options: { bullet: true } };
          return { text: item.title || item.text || item, options: { bullet: true } };
        });
        
        slide.addText(bulletText, {
          x: 0.5,
          y: 1.5,
          w: 4.5,
          h: 3.5,
          fontSize: 16,
          color: '333333',
          fontFace: 'Helvetica',
        });
      }
      
      // Add cards as text boxes
      if (props.cards && Array.isArray(props.cards)) {
        props.cards.forEach((card: any, index: number) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          
          slide.addText(card.title || '', {
            x: 0.5 + col * 4.75,
            y: 1.5 + row * 1.5,
            w: 4,
            h: 0.4,
            fontSize: 18,
            bold: true,
            color: '1a1a1a',
            fontFace: 'Helvetica',
          });
          
          if (card.description) {
            slide.addText(card.description, {
              x: 0.5 + col * 4.75,
              y: 2 + row * 1.5,
              w: 4,
              h: 0.8,
              fontSize: 12,
              color: '666666',
              fontFace: 'Helvetica',
            });
          }
        });
      }
      break;

    // Chart layouts - capture as images
    case 'ExcelFullWidthChart_Responsive':
    case 'ExcelTrendChart_Responsive':
    case 'ExcelKPIDashboard_Responsive':
    case 'ExcelFullWidthChartCategorical_Responsive':
    case 'ExcelFullWidthChartWithTable_Responsive':
    case 'ExcelPieChart_Responsive':
    case 'ExcelComparisonLayout_Responsive':
    case 'Metrics_FinancialsSplit':
    case 'Metrics_FullWidthChart':
    case 'Market_SizeAnalysis':
      if (page) {
        // Add title as editable text
        if (props.title) {
          slide.addText(props.title, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.6,
            fontSize: 28,
            bold: true,
            color: '1a1a1a',
            fontFace: 'Helvetica',
          });
        }
        
        // Capture chart as image
        const chartImage = await captureChartImage(page, baseUrl, presentationId, workspace, slideIndex);
        if (chartImage) {
          slide.addImage({
            data: chartImage,
            x: 0.5,
            y: 1.2,
            w: 9,
            h: 4,
            sizing: { type: 'contain', w: 9, h: 4 }
          });
        }
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

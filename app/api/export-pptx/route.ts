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

    // Capture each slide as an image
    for (let i = 0; i < slides.length; i++) {
      console.log(`📸 Capturing slide ${i + 1}/${slides.length}`);
      
      const slideUrl = `${baseUrl}/editor?mode=export&presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${i}`;
      
      try {
        await page.goto(slideUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });

        // Wait for slide content to render
        await page.waitForSelector('.slide-content', { timeout: 10000 });
        
        // Additional wait for charts and images to load
        await page.waitForTimeout(2000);

        // Inject CSS to ensure clean export
        await page.addStyleTag({
          content: `
            .sidebar, .toolbar, .controls, .ui-overlay, .figma-selection-box, .resize-handle, .text-popup, .slide-nav { 
              display: none !important; 
            }
            body { 
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          `
        });

        // Take screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false,
          omitBackground: false,
        });

        // Convert to base64
        const base64Image = screenshot.toString('base64');
        slideImages.push(`data:image/png;base64,${base64Image}`);
        
        console.log(`✅ Captured slide ${i + 1}`);
      } catch (error) {
        console.error(`Error capturing slide ${i + 1}:`, error);
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
          h: '100%',
          sizing: { type: 'contain', w: '100%', h: '100%' }
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


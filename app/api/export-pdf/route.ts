import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import PDFMerger from 'pdf-merger-js';

export async function POST(request: NextRequest) {
  try {
    const { presentationId, workspace, slides, title } = await request.json();
    
    console.log('📄 PDF Export: Starting export for presentation:', { presentationId, title, slidesCount: slides?.length });

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-running-insecure-content']
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
      console.log(`📄 Rendering slide ${i + 1}/${slides.length}: ${slide.id}`);

      // Navigate to the editor with specific slide for rendering
      // Pass the slide data directly as URL parameters to avoid database dependency
      const slideData = encodeURIComponent(JSON.stringify(slide));
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000';
      const editorUrl = `${baseUrl}/editor?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}&slideIndex=${i}&export=true&slideData=${slideData}`;
      
      try {
        console.log(`📄 Navigating to: ${editorUrl}`);
        await page.goto(editorUrl, { 
          waitUntil: 'networkidle0',
          timeout: 15000
        });
        
        // Wait for the slide to be fully rendered
        console.log(`📄 Waiting for .slide-content selector for slide ${i + 1}`);
        await page.waitForSelector('.slide-content', { timeout: 15000 });
        
        // Wait for content to be loaded and rendered
        await page.waitForFunction(() => {
          const slideContent = document.querySelector('.slide-content');
          return slideContent && slideContent.children.length > 0;
        }, { timeout: 10000 });
        
        // Check if the slide content actually has content
        const hasContent = await page.evaluate(() => {
          const slideContent = document.querySelector('.slide-content');
          const contentCount = slideContent ? slideContent.children.length : 0;
          console.log('Slide content children count:', contentCount);
          return slideContent && contentCount > 0;
        });
        
        console.log(`📄 Slide ${i + 1} has content: ${hasContent}`);
        
        // Wait longer for any animations, dynamic content, and layout rendering
        await new Promise(resolve => setTimeout(resolve, 3000));

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
            /* Ensure all content is visible and properly sized */
            .slide-content * {
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
            /* Ensure consistent font rendering */
            * {
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
            /* Fix table rendering for PDF */
            table {
              border-collapse: collapse !important;
              width: 100% !important;
              table-layout: fixed !important;
            }
            th, td {
              border: none !important;
              padding: 12px 8px !important;
              vertical-align: middle !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            thead th {
              font-weight: 600 !important;
              border-bottom: 1px solid #e5e7eb !important;
            }
            tbody tr {
              border-bottom: 1px solid #f3f4f6 !important;
            }
            /* Ensure proper text rendering in tables */
            table * {
              font-size: inherit !important;
              color: inherit !important;
              text-align: inherit !important;
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
          const body = document.body;
          return {
            hasSlideContent: !!slideContent,
            slideContentDimensions: slideContent ? {
              width: slideContent.offsetWidth,
              height: slideContent.offsetHeight,
              scrollWidth: slideContent.scrollWidth,
              scrollHeight: slideContent.scrollHeight,
              computedStyle: window.getComputedStyle(slideContent).transform
            } : null,
            bodyDimensions: {
              width: body.offsetWidth,
              height: body.offsetHeight,
              scrollWidth: body.scrollWidth,
              scrollHeight: body.scrollHeight
            },
            htmlPreview: slideContent ? slideContent.innerHTML.substring(0, 200) + '...' : 'No slide content found'
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
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google OAuth2 configuration
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/export-google-slides`
);

// Scopes needed for Google Slides
const SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive.file'
];

export async function POST(request: NextRequest) {
  try {
    console.log('=== Google Slides Export Debug ===');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'Not set');

    const { layoutName, layoutData, action } = await request.json();
    console.log('Request data:', { layoutName, action });

    if (action === 'authenticate') {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('Missing Google OAuth credentials');
        return NextResponse.json({ error: 'Google OAuth credentials not configured' }, { status: 500 });
      }

      // Generate authentication URL
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: JSON.stringify({ layoutName, layoutData })
      });

      console.log('Generated auth URL:', authUrl);
      return NextResponse.json({ authUrl });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Google Slides export error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google Slides export' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('OAuth callback received:', { code: code ? 'Present' : 'Missing', state: state ? 'Present' : 'Missing' });

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 });
    }

    // Parse state to get layout information
    const { layoutName, layoutData } = JSON.parse(state);
    console.log('Creating presentation for:', layoutName);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Create Google Slides presentation
    const slides = google.slides({ version: 'v1', auth: oauth2Client });

    // Create a new presentation
    const presentation = await slides.presentations.create({
      requestBody: {
        title: `${layoutName} - Exported from Slaid`
      }
    });

    const presentationId = presentation.data.presentationId!;
    console.log('Presentation created:', presentationId);

    // Get the first slide ID
    const slideId = presentation.data.slides![0].objectId!;

    // Create requests to populate the slide based on layout type
    const requests = await createSlideRequests(layoutName, layoutData, slideId, slides, presentationId);

    console.log('Adding content requests:', requests.length);

    if (requests.length > 0) {
      // Apply the requests to update the slide
      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests
        }
      });
      console.log('Content added successfully');
    }

    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

    // Redirect to the created presentation
    return NextResponse.redirect(presentationUrl);

  } catch (error) {
    console.error('Google Slides callback error:', error);
    return NextResponse.json(
      { error: 'Failed to create Google Slides presentation' },
      { status: 500 }
    );
  }
}

async function createSlideRequests(layoutName: string, layoutData: any, slideId: string, slides: any, presentationId: string) {
  const requests: any[] = [];

  // Add layout-specific content based on layout type
  switch (layoutName) {
    case 'Trend Chart':
      const trendRequests = await createTrendChartRequests(layoutData, slideId, slides, presentationId);
      requests.push(...trendRequests);
      break;
    case 'KPI Dashboard':
      requests.push(...createKPIDashboardRequests(layoutData, slideId));
      break;
    case 'Data Table':
      requests.push(...createDataTableRequests(layoutData, slideId));
      break;
    case 'Comparison View':
      requests.push(...createComparisonRequests(layoutData, slideId));
      break;
    case 'Executive Summary':
      requests.push(...createExecutiveSummaryRequests(layoutData, slideId));
      break;
  }

  return requests;
}

async function createTrendChartRequests(layoutData: any, slideId: string, slides: any, presentationId: string) {
  const requests: any[] = [];

  // If we have a chart image, upload it and insert it
  if (layoutData.chartImage) {
    console.log('=== GOOGLE DRIVE UPLOAD DEBUG ===');
    console.log('Chart image received, length:', layoutData.chartImage.length);
    console.log('Chart image prefix:', layoutData.chartImage.substring(0, 50));
    
    try {
      // Convert base64 to buffer - handle both PNG and JPEG
      const isJpeg = layoutData.chartImage.startsWith('data:image/jpeg');
      const base64Data = layoutData.chartImage.replace(/^data:image\/(png|jpeg);base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      console.log('Image buffer created, size:', imageBuffer.length, 'bytes');

      // Upload image to Google Drive
      const drive = google.drive({ version: 'v3', auth: slides.auth });
      console.log('Google Drive client created');
      
      const fileExtension = isJpeg ? 'jpg' : 'png';
      const fileName = `slaid_chart_${Date.now()}.${fileExtension}`;
      const fileMetadata = {
        name: fileName,
        parents: [] // This will put it in the root folder
      };

      // Convert buffer to stream for Google Drive API
      const { Readable } = require('stream');
      const imageStream = new Readable();
      imageStream.push(imageBuffer);
      imageStream.push(null); // End the stream

      const media = {
        mimeType: isJpeg ? 'image/jpeg' : 'image/png',
        body: imageStream
      };

      console.log('Uploading file to Google Drive:', fileName);
      const uploadResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink'
      });

      console.log('Upload response:', uploadResponse.data);
      const imageFileId = uploadResponse.data.id;

      if (imageFileId) {
        console.log('File uploaded successfully, ID:', imageFileId);
        
        // Make the file publicly readable
        console.log('Setting file permissions...');
        await drive.permissions.create({
          fileId: imageFileId,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });
        console.log('File permissions set to public');

        // Insert the image into the slide
        const imageId = `image_${Date.now()}`;
        const imageUrl = `https://drive.google.com/uc?id=${imageFileId}`;
        console.log('Creating slide image with URL:', imageUrl);
        
        requests.push({
          createImage: {
            objectId: imageId,
            url: imageUrl,
            elementProperties: {
              pageObjectId: slideId,
              size: {
                height: { magnitude: 400, unit: 'PT' },
                width: { magnitude: 600, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 50,
                unit: 'PT'
              }
            }
          }
        });

        console.log('✅ Chart image uploaded and slide request created');
        return requests;
      } else {
        console.error('❌ No file ID returned from upload');
      }
    } catch (error) {
      console.error('❌ Failed to upload chart image:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      // Fall back to text-based layout if image upload fails
    }
  } else {
    console.log('❌ No chart image provided in layoutData');
  }

  // Fallback: Create simple message if no image or image upload failed
  console.log('Using fallback - no chart image available');
  const messageId = `message_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: messageId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 200, unit: 'PT' },
          width: { magnitude: 600, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 100,
          translateY: 200,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: messageId,
      text: `Chart Export Failed
      
The chart image could not be captured. Please try again or check the browser console for errors.

Layout: ${layoutData.title || 'Unknown Layout'}`
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: messageId,
      fields: 'fontSize,fontFamily',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 16, unit: 'PT' },
        fontFamily: 'Helvetica'
      }
    }
  });


  return requests;
}

function createKPIDashboardRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Add KPI data as text boxes
  const kpis = [
    { title: 'Total Revenue', value: '$648K', change: '+18.2%' },
    { title: 'Units Sold', value: '16.2K', change: '+15.3%' },
    { title: 'Avg Order Value', value: '$40', change: '+2.5%' },
    { title: 'Target Achievement', value: '94.2%', change: '-5.8%' }
  ];

  kpis.forEach((kpi, index) => {
    const x = (index % 2) * 250 + 50;
    const y = Math.floor(index / 2) * 150 + 100;
    const kpiId = `kpi_${index}_${Date.now()}`;

    requests.push({
      createShape: {
        objectId: kpiId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 120, unit: 'PT' },
            width: { magnitude: 200, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: x,
            translateY: y,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: kpiId,
        text: `${kpi.title}\n${kpi.value}\n${kpi.change}`
      }
    });
  });

  return requests;
}

function createDataTableRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create a table
  const tableId = `table_${Date.now()}`;
  
  requests.push({
    createTable: {
      objectId: tableId,
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 200, unit: 'PT' },
          width: { magnitude: 400, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 100,
          unit: 'PT'
        }
      },
      rows: 6,
      columns: 3
    }
  });

  return requests;
}

function createComparisonRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];
  const comparisonId = `comparison_${Date.now()}`;

  requests.push({
    createShape: {
      objectId: comparisonId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 250, unit: 'PT' },
          width: { magnitude: 450, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 100,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: comparisonId,
      text: `Performance Comparison

Actual vs Target:
Q1: $156K vs $165K
Q2: $168K vs $170K
Q3: $162K vs $175K
Q4: $162K vs $180K

Total Actual: $648K
Total Target: $690K
Gap: -$42K (-6.1%)`
    }
  });

  return requests;
}

function createExecutiveSummaryRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];
  const summaryId = `summary_${Date.now()}`;

  requests.push({
    createShape: {
      objectId: summaryId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 350, unit: 'PT' },
          width: { magnitude: 550, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 100,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: summaryId,
      text: `Executive Summary

• Strong Performance: Achieved $648K total revenue with 94.2% target achievement rate

• Growth Trend: 18.2% overall growth with Q2 showing strongest performance

• Seasonal Patterns: December peak and January low indicate clear seasonality

• Opportunity: $42K revenue gap to targets represents 6.5% improvement potential

• Recommendation: Focus on Q3/Q4 optimization to capture seasonal upside`
    }
  });

  return requests;
}

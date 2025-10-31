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

    // Get the first slide ID and make it blank
    const slideId = presentation.data.slides![0].objectId!;

    // First, delete any default placeholder elements and make the slide blank
    const slideInfo = await slides.presentations.get({
      presentationId,
      fields: 'slides'
    });

    const firstSlide = slideInfo.data.slides![0];
    const elementsToDelete = firstSlide.pageElements?.map(element => element.objectId).filter(Boolean) || [];

    if (elementsToDelete.length > 0) {
      console.log('Deleting default placeholder elements:', elementsToDelete);
      await slides.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: elementsToDelete.map(elementId => ({
            deleteObject: {
              objectId: elementId
            }
          }))
        }
      });
    }

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

  console.log('🎯 createTrendChartRequests called');
  console.log('📊 layoutData.chartImage exists:', !!layoutData.chartImage);
  console.log('📋 chartImage length:', layoutData.chartImage ? layoutData.chartImage.length : 0);

  // ONLY use the chart image - no fallback elements
  if (layoutData.chartImage) {
    try {
      // Convert base64 to buffer - handle both PNG and JPEG
      const base64Data = layoutData.chartImage.replace(/^data:image\/(png|jpeg);base64,/, '');
      
      // Determine image type from data URL
      const isJpeg = layoutData.chartImage.startsWith('data:image/jpeg');
      const extension = isJpeg ? 'jpg' : 'png';
      const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

      console.log('Image type detected:', mimeType);
      console.log('Base64 data length:', base64Data.length);

      // Upload image to Google Drive using base64 directly
      const drive = google.drive({ version: 'v3', auth: slides.auth });
      
      const fileMetadata = {
        name: `chart_${Date.now()}.${extension}`,
      };

      // Create a readable stream from base64 data
      const { Readable } = require('stream');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageStream = new Readable();
      imageStream.push(imageBuffer);
      imageStream.push(null);

      const media = {
        mimeType: mimeType,
        body: imageStream
      };

      console.log('Uploading to Google Drive...');
      const uploadResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id'
      });

      const imageFileId = uploadResponse.data.id;
      console.log('Upload response:', uploadResponse.data);

      if (imageFileId) {
        console.log('Image uploaded successfully with ID:', imageFileId);
        // Make the file publicly readable
        await drive.permissions.create({
          fileId: imageFileId,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });

        // Insert the image into the slide as a single image element
        const imageId = `image_${Date.now()}`;
        const imageUrl = `https://drive.google.com/uc?id=${imageFileId}`;
        
        console.log('Creating image element with URL:', imageUrl);
        
        requests.push({
          createImage: {
            objectId: imageId,
            url: imageUrl,
            elementProperties: {
              pageObjectId: slideId,
              size: {
                height: { magnitude: 500, unit: 'PT' }, // Make it larger
                width: { magnitude: 800, unit: 'PT' }
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

               console.log('✅ Chart image uploaded and added to slide as single image!');
               return requests;
             }
           } catch (error) {
             console.error('❌ Failed to upload chart image:', error);
             console.error('Error details:', error.message);
             console.error('Error stack:', error.stack);
           }
         } else {
           console.log('❌ No chart image provided');
         }

         // If we reach here, either no image was provided or upload failed
         // Add title and basic content as fallback
         console.log('⚠️ No chart image available - adding title and basic content');
         
         // Add title
         const titleId = `title_${Date.now()}`;
         requests.push({
           createShape: {
             objectId: titleId,
             shapeType: 'TEXT_BOX',
             elementProperties: {
               pageObjectId: slideId,
               size: {
                 height: { magnitude: 60, unit: 'PT' },
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

         requests.push({
           insertText: {
             objectId: titleId,
             text: layoutData.title || 'Revenue Performance by Quarter'
           }
         });

         requests.push({
           updateTextStyle: {
             objectId: titleId,
             fields: 'fontSize,bold,fontFamily',
             textRange: { type: 'ALL' },
             style: {
               fontSize: { magnitude: 24, unit: 'PT' },
               bold: true,
               fontFamily: 'Helvetica'
             }
           }
         });

         // Add error message
         const errorId = `error_${Date.now()}`;
         requests.push({
           createShape: {
             objectId: errorId,
             shapeType: 'TEXT_BOX',
             elementProperties: {
               pageObjectId: slideId,
               size: {
                 height: { magnitude: 80, unit: 'PT' },
                 width: { magnitude: 600, unit: 'PT' }
               },
               transform: {
                 scaleX: 1,
                 scaleY: 1,
                 translateX: 50,
                 translateY: 150,
                 unit: 'PT'
               }
             }
           }
         });

         requests.push({
           insertText: {
             objectId: errorId,
             text: 'Chart image capture failed. Please check browser console for details and try again.'
           }
         });

         requests.push({
           updateTextStyle: {
             objectId: errorId,
             fields: 'fontSize,fontFamily',
             textRange: { type: 'ALL' },
             style: {
               fontSize: { magnitude: 14, unit: 'PT' },
               fontFamily: 'Helvetica'
             }
           }
         });

         // Add insights if available
         if (layoutData.insights && layoutData.insights.length > 0) {
           const insightsId = `insights_${Date.now()}`;
           requests.push({
             createShape: {
               objectId: insightsId,
               shapeType: 'TEXT_BOX',
               elementProperties: {
                 pageObjectId: slideId,
                 size: {
                   height: { magnitude: 200, unit: 'PT' },
                   width: { magnitude: 300, unit: 'PT' }
                 },
                 transform: {
                   scaleX: 1,
                   scaleY: 1,
                   translateX: 400,
                   translateY: 150,
                   unit: 'PT'
                 }
               }
             }
           });

           const insightsText = layoutData.insights.map((insight: string, index: number) => 
             `• ${insight}`
           ).join('\n\n');

           requests.push({
             insertText: {
               objectId: insightsId,
               text: insightsText
             }
           });

           requests.push({
             updateTextStyle: {
               objectId: insightsId,
               fields: 'fontSize,fontFamily',
               textRange: { type: 'ALL' },
               style: {
                 fontSize: { magnitude: 11, unit: 'PT' },
                 fontFamily: 'Helvetica'
               }
             }
           });
         }

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

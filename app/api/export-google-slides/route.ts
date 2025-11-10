import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { captureChartImage } from '../../../lib/chart-capture';

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

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON request body:', jsonError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { layoutName, layoutData, action } = requestBody;
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

    // First, delete any default placeholder elements to make the slide blank
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
    const requests = await createSlideRequests(layoutName, layoutData, slideId);

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

async function createSlideRequests(layoutName: string, layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Add layout-specific content based on layout type
  switch (layoutName) {
    case 'Trend Chart':
      requests.push(...await createTrendChartRequests(layoutData, slideId));
      break;
    case 'KPI Dashboard':
      requests.push(...await createKPIDashboardRequests(layoutData, slideId));
      break;
    case 'Data Table':
      requests.push(...createDataTableRequests(layoutData, slideId));
      break;
    case 'Comparison View':
      requests.push(...await createComparisonRequests(layoutData, slideId));
      break;
    case 'Executive Summary':
      requests.push(...createExecutiveSummaryRequests(layoutData, slideId));
      break;
    case 'Full Width Chart':
      requests.push(...await createFullWidthChartRequests(layoutData, slideId));
      break;
    case 'Section Dividers':
      requests.push(...createSectionDividersRequests(layoutData, slideId));
      break;
    case 'Foundation AI Models':
      requests.push(...createFoundationAIRequests(layoutData, slideId));
      break;
    case 'Table of Contents':
      requests.push(...createTableOfContentsRequests(layoutData, slideId));
      break;
    case 'Bottom Cover':
      requests.push(...createBottomCoverRequests(layoutData, slideId));
      break;
    case 'Centered Cover':
      requests.push(...createCenteredCoverRequests(layoutData, slideId));
      break;
  }

  return requests;
}

async function createTrendChartRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create title
  const titleId = `title_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: titleId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 50, unit: 'PT' },
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
      text: 'Revenue Performance by Quarter'
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

  // Capture chart as high-quality image
  console.log('Capturing chart as image for Trend Chart...');
  
  try {
    // Prepare chart data for capture
    const chartDataForCapture = {
      type: 'area',
      labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
      series: [
        { id: 'Revenue', data: [52.2, 58.6, 43.8, 47.8] }
      ],
      stacked: false,
      showLegend: true
    };
    
    // Call our direct chart capture function (same logic as copy/paste)
    const image = await captureChartImage(chartDataForCapture, 350, 200);

    if (image) {
      
      // Create image element in Google Slides
      const imageId = `chartImage_${Date.now()}`;
  requests.push({
        createImage: {
          objectId: imageId,
          url: `data:image/png;base64,${image}`,
          elementProperties: {
            pageObjectId: slideId,
            size: {
              height: { magnitude: 200, unit: 'PT' },
              width: { magnitude: 350, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 120,
              unit: 'PT'
            }
      }
    }
  });

      console.log('High-quality chart image added successfully to Google Slides!');
    } else {
      console.log('Chart capture failed, falling back to placeholder');
      // Add a placeholder rectangle if image capture fails
      const placeholderId = `placeholder_${Date.now()}`;
  requests.push({
    createShape: {
          objectId: placeholderId,
          shapeType: 'RECTANGLE',
      elementProperties: {
        pageObjectId: slideId,
        size: {
              height: { magnitude: 200, unit: 'PT' },
              width: { magnitude: 350, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
              translateX: 50,
              translateY: 120,
          unit: 'PT'
        }
      }
    }
  });
    }
  } catch (error) {
    console.error('Failed to capture chart image, falling back to placeholder:', error);
    // Add a placeholder rectangle if image capture fails
    const placeholderId = `placeholder_${Date.now()}`;
  requests.push({
      createShape: {
        objectId: placeholderId,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 200, unit: 'PT' },
            width: { magnitude: 350, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 120,
            unit: 'PT'
        }
      }
    }
  });
  }

  // Create insights panel (right side)
  const insightsId = `insights_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: insightsId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 280, unit: 'PT' },
          width: { magnitude: 280, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 420,
          translateY: 120,
          unit: 'PT'
        }
      }
    }
  });


  const insightsText = `Overall Performance
-8.4% ↓

• Q2 shows strongest performance with 58.6% conversion rate, indicating optimal market conditions and effective strategies.

• Q3 performance dip to 43.8% suggests seasonal challenges or market saturation requiring strategic adjustment.

• Consistent variability across quarters shows execution matters more than timing, with Q2 achieving 34% higher performance than Q3.

• Recovery trend in Q4 (47.8%) indicates successful strategic adjustments and potential for continued improvement.`;

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

  return requests;
}

async function createKPIDashboardRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Add KPI data as text boxes
  const kpis = [
    { title: 'Total Revenue', value: '$648K', change: '+18.2%' },
    { title: 'Units Sold', value: '16.2K', change: '+15.3%' },
    { title: 'Avg Order Value', value: '$40', change: '+2.5%' },
    { title: 'Target Achievement', value: '94.2%', change: '-5.8%' }
  ];

  // Create KPI cards
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

  // Add a small chart below the KPIs
  try {
    const chartDataForCapture = {
      type: 'area',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [
        { id: 'Revenue', data: [6500, 7200, 6800, 7500, 8100, 8500] },
        { id: 'GMV', data: [4200, 4800, 4400, 5100, 5600, 6000] }
      ],
      stacked: false,
      showLegend: true
    };
    
    const image = await captureChartImage(chartDataForCapture, 450, 150);

    if (image) {
      
      const imageId = `kpiChart_${Date.now()}`;
  requests.push({
        createImage: {
          objectId: imageId,
          url: `data:image/png;base64,${image}`,
          elementProperties: {
            pageObjectId: slideId,
            size: {
              height: { magnitude: 150, unit: 'PT' },
              width: { magnitude: 450, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 75,
              translateY: 350,
              unit: 'PT'
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to capture KPI chart:', error);
  }

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

async function createComparisonRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create title
  const titleId = `title_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: titleId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 50, unit: 'PT' },
          width: { magnitude: 400, unit: 'PT' }
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
      text: 'Performance Comparison'
    }
  });

  // Add comparison chart
  try {
    const chartDataForCapture = {
      type: 'area',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [
        { id: 'Actual', data: [156, 168, 162, 162] },
        { id: 'Target', data: [165, 170, 175, 180] }
      ],
      stacked: false,
      showLegend: true
    };
    
    const image = await captureChartImage(chartDataForCapture, 400, 200);

    if (image) {
      
      const imageId = `comparisonChart_${Date.now()}`;
  requests.push({
        createImage: {
          objectId: imageId,
          url: `data:image/png;base64,${image}`,
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
              translateY: 120,
              unit: 'PT'
        }
      }
    }
  });
    }
  } catch (error) {
    console.error('Failed to capture comparison chart:', error);
  }

  // Add summary text on the right
  const summaryId = `summary_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: summaryId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 200, unit: 'PT' },
          width: { magnitude: 250, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 480,
          translateY: 120,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: summaryId,
      text: `Actual vs Target:
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

async function createFullWidthChartRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create title
  const titleId = `title_${Date.now()}`;
    requests.push({
      createShape: {
      objectId: titleId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
          height: { magnitude: 50, unit: 'PT' },
          width: { magnitude: 400, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
          translateX: 80,
          translateY: 80,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
      objectId: titleId,
      text: layoutData.title || 'Performance Overview'
      }
    });

    requests.push({
      updateTextStyle: {
      objectId: titleId,
      fields: 'fontSize,fontFamily,bold',
        textRange: { type: 'ALL' },
        style: {
        fontSize: { magnitude: 24, unit: 'PT' },
          fontFamily: 'Helvetica',
        bold: false
        }
      }
    });

  // Create description text (right side of title)
  const descriptionId = `description_${Date.now()}`;
    requests.push({
      createShape: {
      objectId: descriptionId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
          height: { magnitude: 60, unit: 'PT' },
          width: { magnitude: 300, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
          translateX: 500,
          translateY: 80,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
      objectId: descriptionId,
      text: layoutData.description || 'Comprehensive metrics and key performance indicators showing quarterly growth trends and revenue optimization.'
      }
    });

    requests.push({
      updateTextStyle: {
      objectId: descriptionId,
      fields: 'fontSize,fontFamily',
        textRange: { type: 'ALL' },
        style: {
        fontSize: { magnitude: 10, unit: 'PT' },
        fontFamily: 'Helvetica'
        }
      }
    });

  // Capture chart as high-quality image
  console.log('Capturing chart as image for Full Width Chart...');
  
  try {
    // Prepare chart data for capture
    const chartDataForCapture = {
      type: 'area',
      labels: layoutData.chartData?.labels || ['Q1', 'Q2', 'Q3', 'Q4'],
      series: layoutData.chartData?.series || [
        { id: 'Sales', name: 'Sales', data: [2500, 5200, 8100, 12000] },
        { id: 'Marketing', name: 'Marketing', data: [1800, 3600, 5800, 8500] }
      ],
      stacked: true,
      showLegend: true
    };
    
    // Call our direct chart capture function (same logic as copy/paste)
    const image = await captureChartImage(chartDataForCapture, 600, 300);

    if (image) {
      
      // Create image element in Google Slides
      const imageId = `chartImage_${Date.now()}`;
    requests.push({
        createImage: {
          objectId: imageId,
          url: `data:image/png;base64,${image}`,
          elementProperties: {
            pageObjectId: slideId,
            size: {
              height: { magnitude: 300, unit: 'PT' },
              width: { magnitude: 600, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 100,
              translateY: 150,
              unit: 'PT'
            }
        }
      }
    });

      console.log('High-quality chart image added successfully to Google Slides!');
      return requests;
    } else {
      console.log('Chart capture failed, falling back to placeholder');
    }
  } catch (error) {
    console.error('Failed to capture chart image, falling back to placeholder:', error);
  }

  // Fallback: Create a simple placeholder
  const placeholderId = `placeholder_${Date.now()}`;
    requests.push({
    createShape: {
      objectId: placeholderId,
      shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: {
          height: { magnitude: 250, unit: 'PT' },
          width: { magnitude: 500, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
          translateX: 100,
          translateY: 150,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
    updateShapeProperties: {
      objectId: placeholderId,
      fields: 'shapeBackgroundFill',
      shapeProperties: {
        shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: {
                red: 0.95,
                green: 0.95,
                blue: 0.95
                }
              }
            }
          }
        }
      }
    });

  return requests;
}

function createSectionDividersRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create title at the top
  const titleId = `title_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: titleId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 60, unit: 'PT' },
          width: { magnitude: 624, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 48,
          translateY: 48,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: titleId,
      text: layoutData.title || 'Executive summary'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: titleId,
      fields: 'fontSize,fontFamily,foregroundColor,bold',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 30, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: false,
        foregroundColor: {
          opaqueColor: {
            rgbColor: {
              red: 0.1,
              green: 0.1,
              blue: 0.1
            }
          }
        }
      }
    }
  });

  // Create large section number at bottom left
  const numberY = 277;
  const numberId = `number_${Date.now()}`;
    requests.push({
      createShape: {
      objectId: numberId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
          height: { magnitude: 80, unit: 'PT' },
          width: { magnitude: 120, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
          translateX: 48,
          translateY: numberY,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
      objectId: numberId,
      text: layoutData.sectionNumber || '01'
      }
    });

    requests.push({
      updateTextStyle: {
      objectId: numberId,
        fields: 'fontSize,fontFamily,foregroundColor,bold',
        textRange: { type: 'ALL' },
        style: {
        fontSize: { magnitude: 48, unit: 'PT' },
          fontFamily: 'Helvetica',
        bold: false,
          foregroundColor: {
            opaqueColor: {
              rgbColor: {
              red: 0.1,
                green: 0.1,
                blue: 0.1
              }
            }
          }
        }
      }
    });

  // Create description text at bottom right
  const descriptionId = `description_${Date.now()}`;
    requests.push({
      createShape: {
      objectId: descriptionId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
          height: { magnitude: 80, unit: 'PT' },
          width: { magnitude: 240, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
          translateX: 432,
          translateY: numberY + 16,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
      objectId: descriptionId,
      text: layoutData.content || 'Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap Latest feature releases and roadmap'
      }
    });

    requests.push({
      updateTextStyle: {
      objectId: descriptionId,
      fields: 'fontSize,fontFamily,foregroundColor',
        textRange: { type: 'ALL' },
        style: {
        fontSize: { magnitude: 10.5, unit: 'PT' },
          fontFamily: 'Helvetica',
          foregroundColor: {
            opaqueColor: {
              rgbColor: {
              red: 0.4,
              green: 0.4,
              blue: 0.4
            }
          }
        }
      }
    }
  });

  return requests;
}

function createFoundationAIRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create title (left top)
  const titleId = `title_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: titleId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 60, unit: 'PT' },
          width: { magnitude: 200, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 48,
          translateY: 48,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: titleId,
      text: layoutData.title || 'Foundation AI Models'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: titleId,
      fields: 'fontSize,fontFamily,foregroundColor,bold',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 18, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: false,
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0, green: 0, blue: 0 }
          }
            }
          }
        }
      });
      
  // Create description (left bottom)
  const descriptionId = `description_${Date.now()}`;
      requests.push({
        createShape: {
      objectId: descriptionId,
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
          translateX: 48,
          translateY: 237,
              unit: 'PT'
            }
          }
        }
      });

  requests.push({
    insertText: {
      objectId: descriptionId,
      text: layoutData.content || 'Most of the world\'s top artificial intelligence has been trained on foundation models that can be adapted to a wide range of downstream tasks.'
    }
  });

    requests.push({
    updateTextStyle: {
      objectId: descriptionId,
      fields: 'fontSize,fontFamily,foregroundColor',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 9, unit: 'PT' },
        fontFamily: 'Helvetica',
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0.4, green: 0.4, blue: 0.4 }
          }
        }
      }
    }
  });

  // Create first stat (middle top) - 42%
  const stat1Id = `stat1_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: stat1Id,
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
          translateX: 260,
          translateY: 100,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: stat1Id,
      text: '42%\n\nof organizations say they have deployed and are using one or more AI models.'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: stat1Id,
      fields: 'fontSize,fontFamily,foregroundColor,bold',
      textRange: { startIndex: 0, endIndex: 3 },
      style: {
        fontSize: { magnitude: 48, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: false,
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0, green: 0, blue: 0 }
          }
        }
      }
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: stat1Id,
      fields: 'fontSize,fontFamily,foregroundColor',
      textRange: { startIndex: 5 },
      style: {
        fontSize: { magnitude: 9, unit: 'PT' },
        fontFamily: 'Helvetica',
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0.4, green: 0.4, blue: 0.4 }
          }
        }
      }
    }
  });

  // Create second stat (middle bottom) - 86%
  const stat2Id = `stat2_${Date.now()}`;
    requests.push({
      createShape: {
      objectId: stat2Id,
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
          translateX: 260,
          translateY: 240,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
      objectId: stat2Id,
      text: '86%\n\nof the organizations that have deployed AI models report that they are seeing a positive ROI.'
    }
  });

      requests.push({
    updateTextStyle: {
      objectId: stat2Id,
      fields: 'fontSize,fontFamily,foregroundColor,bold',
      textRange: { startIndex: 0, endIndex: 3 },
      style: {
        fontSize: { magnitude: 48, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: false,
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0, green: 0, blue: 0 }
          }
        }
      }
    }
  });
  
  requests.push({
    updateTextStyle: {
      objectId: stat2Id,
      fields: 'fontSize,fontFamily,foregroundColor',
      textRange: { startIndex: 5 },
      style: {
        fontSize: { magnitude: 9, unit: 'PT' },
        fontFamily: 'Helvetica',
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0.4, green: 0.4, blue: 0.4 }
          }
        }
      }
    }
  });

  // Create chart title (right top)
  const chartTitleId = `chartTitle_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: chartTitleId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 40, unit: 'PT' },
          width: { magnitude: 200, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 472,
          translateY: 80,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: chartTitleId,
      text: 'How often organizations use AI for business operations and processes'
    }
  });

      requests.push({
    updateTextStyle: {
      objectId: chartTitleId,
      fields: 'fontSize,fontFamily,foregroundColor',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 9, unit: 'PT' },
        fontFamily: 'Helvetica',
        foregroundColor: {
          opaqueColor: {
            rgbColor: { red: 0.4, green: 0.4, blue: 0.4 }
          }
        }
      }
    }
  });

  // Create simple bar chart representation
  const chartData = [
    { label: 'Daily', value: 85 },
    { label: 'Weekly', value: 65 },
    { label: 'Monthly', value: 45 },
    { label: 'Quarterly', value: 25 },
    { label: 'Annually', value: 15 }
  ];

  chartData.forEach((item, index) => {
    const barId = `bar_${index}_${Date.now()}`;
    const barWidth = (item.value / 100) * 120;
    
  requests.push({
    createShape: {
        objectId: barId,
        shapeType: 'RECTANGLE',
      elementProperties: {
        pageObjectId: slideId,
        size: {
            height: { magnitude: 12, unit: 'PT' },
            width: { magnitude: barWidth, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
            translateX: 520,
            translateY: 140 + (index * 20),
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
      updateShapeProperties: {
        objectId: barId,
        fields: 'shapeBackgroundFill',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: {
                  red: 0.545,
                  green: 0.361,
                  blue: 0.965
                }
              }
            }
          }
        }
      }
    });

    const labelId = `label_${index}_${Date.now()}`;
  requests.push({
    createShape: {
        objectId: labelId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
            height: { magnitude: 12, unit: 'PT' },
            width: { magnitude: 40, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
            translateX: 472,
            translateY: 140 + (index * 20),
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
        objectId: labelId,
        text: item.label
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: labelId,
        fields: 'fontSize,fontFamily,foregroundColor',
        textRange: { type: 'ALL' },
        style: {
          fontSize: { magnitude: 8, unit: 'PT' },
          fontFamily: 'Helvetica',
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0.4, green: 0.4, blue: 0.4 }
            }
          }
        }
      }
    });
  });

  return requests;
}

function createTableOfContentsRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create title
  const titleId = `title_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: titleId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 60, unit: 'PT' },
          width: { magnitude: 400, unit: 'PT' }
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
      text: layoutData.title || 'Table of Contents'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: titleId,
      fields: 'fontSize,fontFamily,bold',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 28, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: true
      }
    }
  });

  // Create table of contents items
  if (layoutData.items && layoutData.items.length > 0) {
    layoutData.items.forEach((item: any, index: number) => {
      const itemId = `item_${index}_${Date.now()}`;
      const yPosition = 120 + (index * 25);

  requests.push({
    createShape: {
          objectId: itemId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
              height: { magnitude: 20, unit: 'PT' },
              width: { magnitude: 500, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
              translateX: 50,
              translateY: yPosition,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
          objectId: itemId,
          text: `${item.page}. ${item.title}`
    }
  });

  requests.push({
    updateTextStyle: {
          objectId: itemId,
      fields: 'fontSize,fontFamily',
      textRange: { type: 'ALL' },
      style: {
            fontSize: { magnitude: 14, unit: 'PT' },
        fontFamily: 'Helvetica'
      }
    }
  });
    });
  }

  return requests;
}

function createBottomCoverRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create centered title
  const titleId = `title_${Date.now()}`;
        requests.push({
    createShape: {
      objectId: titleId,
      shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: {
          height: { magnitude: 100, unit: 'PT' },
          width: { magnitude: 600, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
          translateX: 60,
          translateY: 150,
                unit: 'PT'
              }
            }
          }
        });
        
  requests.push({
    insertText: {
      objectId: titleId,
      text: layoutData.title || 'Thank You'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: titleId,
      fields: 'fontSize,fontFamily,bold',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 48, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: true
      }
    }
  });

  requests.push({
    updateParagraphStyle: {
      objectId: titleId,
      fields: 'alignment',
      textRange: { type: 'ALL' },
      style: {
        alignment: 'CENTER'
      }
    }
  });

  return requests;
}

function createCenteredCoverRequests(layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Create centered title
  const titleId = `title_${Date.now()}`;
        requests.push({
          createShape: {
      objectId: titleId,
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
          translateX: 60,
          translateY: 120,
                unit: 'PT'
              }
            }
          }
        });
        
        requests.push({
          insertText: {
      objectId: titleId,
      text: layoutData.title || 'Our Solution'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: titleId,
      fields: 'fontSize,fontFamily,bold',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 36, unit: 'PT' },
        fontFamily: 'Helvetica',
        bold: true
      }
    }
  });

  requests.push({
    updateParagraphStyle: {
      objectId: titleId,
      fields: 'alignment',
      textRange: { type: 'ALL' },
      style: {
        alignment: 'CENTER'
      }
    }
  });

  // Create description
  const descId = `desc_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: descId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: 60, unit: 'PT' },
          width: { magnitude: 500, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 110,
          translateY: 220,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    insertText: {
      objectId: descId,
      text: layoutData.description || 'Transforming ideas into results with strategy, craft, and measurable impact.'
    }
  });

  requests.push({
    updateTextStyle: {
      objectId: descId,
      fields: 'fontSize,fontFamily',
      textRange: { type: 'ALL' },
      style: {
        fontSize: { magnitude: 16, unit: 'PT' },
        fontFamily: 'Helvetica'
      }
    }
  });

  requests.push({
    updateParagraphStyle: {
      objectId: descId,
      fields: 'alignment',
      textRange: { type: 'ALL' },
      style: {
        alignment: 'CENTER'
      }
    }
  });

  return requests;
}

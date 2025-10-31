import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Initialize Google Auth with service account
async function getGoogleAuth() {
  // For now, we'll use a simpler approach without service account
  // In production, you'd want to use proper OAuth or service account
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { layoutName, layoutData, accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: 'Please authenticate with Google to export to Slides',
        requiresAuth: true
      }, { status: 401 });
    }

    // Initialize Google Slides API with user's access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const slides = google.slides({ version: 'v1', auth });

    // Create a new presentation
    const presentation = await slides.presentations.create({
      requestBody: {
        title: `${layoutName} - Slaid Export`
      }
    });

    const presentationId = presentation.data.presentationId!;

    // Add content based on layout type
    await addLayoutContent(slides, presentationId, layoutName, layoutData);

    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

    return NextResponse.json({
      success: true,
      message: `Successfully created "${layoutName}" in Google Slides`,
      presentationUrl,
      presentationId,
      layoutName
    });

  } catch (error) {
    console.error('Google Slides export error:', error);
    
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication expired',
        message: 'Please re-authenticate with Google',
        requiresAuth: true
      }, { status: 401 });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create Google Slides presentation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function addLayoutContent(slides: any, presentationId: string, layoutName: string, layoutData: any) {
  const requests: any[] = [];

  // Remove the default slide and add our custom content
  requests.push({
    deleteObject: {
      objectId: 'p' // Default slide ID
    }
  });

  switch (layoutName) {
    case 'Data Table':
      requests.push(...createDataTableSlide());
      break;
    case 'KPI Dashboard':
      requests.push(...createKPIDashboardSlide());
      break;
    case 'Trend Chart':
      requests.push(...createTrendChartSlide());
      break;
    case 'Comparison View':
      requests.push(...createComparisonSlide());
      break;
    case 'Executive Summary':
      requests.push(...createExecutiveSummarySlide());
      break;
    default:
      requests.push(...createDefaultSlide(layoutName));
  }

  // Execute all requests
  if (requests.length > 0) {
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests }
    });
  }
}

function createDataTableSlide() {
  const slideId = 'data_table_slide';
  return [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    },
    {
      createShape: {
        objectId: 'title_shape',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 60, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'title_shape',
        text: 'Data Overview'
      }
    },
    {
      updateTextStyle: {
        objectId: 'title_shape',
        style: { fontSize: { magnitude: 24, unit: 'PT' }, bold: true },
        fields: 'fontSize,bold'
      }
    },
    {
      createTable: {
        objectId: 'data_table',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 200, unit: 'PT' }, width: { magnitude: 500, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 120, unit: 'PT' }
        },
        rows: 6,
        columns: 3
      }
    },
    // Add table content
    ...createTableContent('data_table', [
      ['Metric', 'Value', 'Change'],
      ['Total Revenue', '$648,000', '+18.2%'],
      ['Average Monthly', '$54,000', '+12.5%'],
      ['Peak Month', '$68,000', 'December'],
      ['Units Sold', '16,200', '+15.3%'],
      ['Target Achievement', '94.2%', '-5.8%']
    ])
  ];
}

function createKPIDashboardSlide() {
  const slideId = 'kpi_dashboard_slide';
  return [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    },
    {
      createShape: {
        objectId: 'kpi_title',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 60, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'kpi_title',
        text: 'Key Performance Indicators'
      }
    },
    {
      updateTextStyle: {
        objectId: 'kpi_title',
        style: { fontSize: { magnitude: 24, unit: 'PT' }, bold: true },
        fields: 'fontSize,bold'
      }
    },
    // Add KPI boxes
    ...createKPIBoxes(slideId)
  ];
}

function createTrendChartSlide() {
  const slideId = 'trend_chart_slide';
  return [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    },
    {
      createShape: {
        objectId: 'chart_title',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 60, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'chart_title',
        text: 'Revenue Performance by Quarter'
      }
    },
    {
      updateTextStyle: {
        objectId: 'chart_title',
        style: { fontSize: { magnitude: 24, unit: 'PT' }, bold: true },
        fields: 'fontSize,bold'
      }
    },
    // Add chart placeholder and insights
    ...createChartPlaceholder(slideId)
  ];
}

function createComparisonSlide() {
  const slideId = 'comparison_slide';
  return [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    },
    {
      createShape: {
        objectId: 'comparison_title',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 60, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'comparison_title',
        text: 'Performance Comparison'
      }
    },
    {
      updateTextStyle: {
        objectId: 'comparison_title',
        style: { fontSize: { magnitude: 24, unit: 'PT' }, bold: true },
        fields: 'fontSize,bold'
      }
    }
  ];
}

function createExecutiveSummarySlide() {
  const slideId = 'executive_summary_slide';
  const summaryPoints = [
    'Strong Performance: Achieved $648K total revenue with 94.2% target achievement',
    'Growth Trend: 18.2% overall growth with Q2 showing strongest performance',
    'Seasonal Patterns: December peak ($68K) and January low ($42K)',
    'Opportunity: $42K revenue gap represents 6.5% improvement potential',
    'Recommendation: Focus on Q3/Q4 optimization to capture seasonal upside'
  ];

  const requests = [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    },
    {
      createShape: {
        objectId: 'summary_title',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 60, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'summary_title',
        text: 'Executive Summary'
      }
    },
    {
      updateTextStyle: {
        objectId: 'summary_title',
        style: { fontSize: { magnitude: 24, unit: 'PT' }, bold: true },
        fields: 'fontSize,bold'
      }
    }
  ];

  // Add bullet points
  summaryPoints.forEach((point, index) => {
    const bulletId = `bullet_${index}`;
    requests.push(
      {
        createShape: {
          objectId: bulletId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: { height: { magnitude: 40, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 120 + (index * 50), unit: 'PT' }
          }
        }
      },
      {
        insertText: {
          objectId: bulletId,
          text: `• ${point}`
        }
      },
      {
        updateTextStyle: {
          objectId: bulletId,
          style: { fontSize: { magnitude: 14, unit: 'PT' } },
          fields: 'fontSize'
        }
      }
    );
  });

  return requests;
}

function createDefaultSlide(layoutName: string) {
  const slideId = 'default_slide';
  return [
    {
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    },
    {
      createShape: {
        objectId: 'default_title',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 100, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 150, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'default_title',
        text: layoutName
      }
    },
    {
      updateTextStyle: {
        objectId: 'default_title',
        style: { fontSize: { magnitude: 32, unit: 'PT' }, bold: true },
        fields: 'fontSize,bold'
      }
    }
  ];
}

function createTableContent(tableId: string, data: string[][]) {
  const requests: any[] = [];
  
  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      requests.push({
        insertText: {
          objectId: tableId,
          cellLocation: { rowIndex, columnIndex: colIndex },
          text: cell
        }
      });
    });
  });

  return requests;
}

function createKPIBoxes(slideId: string) {
  const kpis = [
    { title: 'Total Revenue', value: '$648K', change: '+18.2%', x: 50, y: 120 },
    { title: 'Units Sold', value: '16.2K', change: '+15.3%', x: 350, y: 120 },
    { title: 'Avg Order Value', value: '$40', change: '+2.5%', x: 50, y: 220 },
    { title: 'Target Achievement', value: '94.2%', change: '-5.8%', x: 350, y: 220 }
  ];

  const requests: any[] = [];

  kpis.forEach((kpi, index) => {
    const boxId = `kpi_box_${index}`;
    const valueId = `kpi_value_${index}`;
    const titleId = `kpi_title_${index}`;
    const changeId = `kpi_change_${index}`;

    // Create KPI box background
    requests.push(
      {
        createShape: {
          objectId: boxId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageObjectId: slideId,
            size: { height: { magnitude: 80, unit: 'PT' }, width: { magnitude: 250, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: kpi.x, translateY: kpi.y, unit: 'PT' }
          }
        }
      },
      {
        updateShapeProperties: {
          objectId: boxId,
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: { color: { rgbColor: { red: 0.9, green: 0.95, blue: 1.0 } } }
            },
            outline: {
              outlineFill: { solidFill: { color: { rgbColor: { red: 0.13, green: 0.59, blue: 0.95 } } } },
              weight: { magnitude: 2, unit: 'PT' }
            }
          },
          fields: 'shapeBackgroundFill,outline'
        }
      },
      // Add value text
      {
        createShape: {
          objectId: valueId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: { height: { magnitude: 25, unit: 'PT' }, width: { magnitude: 200, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: kpi.x + 10, translateY: kpi.y + 5, unit: 'PT' }
          }
        }
      },
      {
        insertText: {
          objectId: valueId,
          text: kpi.value
        }
      },
      {
        updateTextStyle: {
          objectId: valueId,
          style: { fontSize: { magnitude: 20, unit: 'PT' }, bold: true, foregroundColor: { opaqueColor: { rgbColor: { red: 0.1, green: 0.46, blue: 0.82 } } } },
          fields: 'fontSize,bold,foregroundColor'
        }
      },
      // Add title text
      {
        createShape: {
          objectId: titleId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: { height: { magnitude: 20, unit: 'PT' }, width: { magnitude: 200, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: kpi.x + 10, translateY: kpi.y + 30, unit: 'PT' }
          }
        }
      },
      {
        insertText: {
          objectId: titleId,
          text: kpi.title
        }
      },
      {
        updateTextStyle: {
          objectId: titleId,
          style: { fontSize: { magnitude: 12, unit: 'PT' } },
          fields: 'fontSize'
        }
      },
      // Add change text
      {
        createShape: {
          objectId: changeId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: { height: { magnitude: 15, unit: 'PT' }, width: { magnitude: 200, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: kpi.x + 10, translateY: kpi.y + 55, unit: 'PT' }
          }
        }
      },
      {
        insertText: {
          objectId: changeId,
          text: kpi.change
        }
      },
      {
        updateTextStyle: {
          objectId: changeId,
          style: { 
            fontSize: { magnitude: 10, unit: 'PT' }, 
            bold: true,
            foregroundColor: { 
              opaqueColor: { 
                rgbColor: kpi.change.startsWith('+') 
                  ? { red: 0.3, green: 0.69, blue: 0.31 } 
                  : { red: 0.96, green: 0.26, blue: 0.21 }
              } 
            }
          },
          fields: 'fontSize,bold,foregroundColor'
        }
      }
    );
  });

  return requests;
}

function createChartPlaceholder(slideId: string) {
  return [
    {
      createShape: {
        objectId: 'chart_placeholder',
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 200, unit: 'PT' }, width: { magnitude: 400, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 120, unit: 'PT' }
        }
      }
    },
    {
      updateShapeProperties: {
        objectId: 'chart_placeholder',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: { color: { rgbColor: { red: 0.95, green: 0.95, blue: 0.95 } } }
          },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: { red: 0.7, green: 0.7, blue: 0.7 } } } },
            weight: { magnitude: 1, unit: 'PT' }
          }
        },
        fields: 'shapeBackgroundFill,outline'
      }
    },
    {
      createShape: {
        objectId: 'chart_text',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 50, unit: 'PT' }, width: { magnitude: 300, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 100, translateY: 200, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'chart_text',
        text: 'Chart: Q1: 52.2, Q2: 58.6, Q3: 43.8, Q4: 47.8\nOverall Performance: -8.4%'
      }
    },
    {
      updateTextStyle: {
        objectId: 'chart_text',
        style: { fontSize: { magnitude: 12, unit: 'PT' } },
        fields: 'fontSize'
      }
    },
    // Add insights panel
    {
      createShape: {
        objectId: 'insights_panel',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { height: { magnitude: 200, unit: 'PT' }, width: { magnitude: 200, unit: 'PT' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 480, translateY: 120, unit: 'PT' }
        }
      }
    },
    {
      insertText: {
        objectId: 'insights_panel',
        text: 'Key Insights:\n\n• Q2 shows strongest performance\n• Q3 performance dip suggests challenges\n• Consistent variability across quarters\n• Recovery trend in Q4'
      }
    },
    {
      updateTextStyle: {
        objectId: 'insights_panel',
        style: { fontSize: { magnitude: 10, unit: 'PT' } },
        fields: 'fontSize'
      }
    }
  ];
}

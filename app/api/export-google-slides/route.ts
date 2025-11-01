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
    const requests = createSlideRequests(layoutName, layoutData, slideId);

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

function createSlideRequests(layoutName: string, layoutData: any, slideId: string) {
  const requests: any[] = [];

  // Add layout-specific content based on layout type
  switch (layoutName) {
    case 'Trend Chart':
      requests.push(...createTrendChartRequests(layoutData, slideId));
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
    case 'Full Width Chart':
      requests.push(...createFullWidthChartRequests(layoutData, slideId));
      break;
  }

  return requests;
}

function createTrendChartRequests(layoutData: any, slideId: string) {
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

  // Create chart area (left side) - simulate bars with rectangles
  const chartData = [
    { label: 'Q1 2023', value: 52.2 },
    { label: 'Q2 2023', value: 58.6 },
    { label: 'Q3 2023', value: 43.8 },
    { label: 'Q4 2023', value: 47.8 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const chartStartX = 50;
  const chartStartY = 120;
  const barWidth = 60;
  const barSpacing = 80;
  const maxBarHeight = 200;

  chartData.forEach((data, index) => {
    const barHeight = (data.value / maxValue) * maxBarHeight;
    const barX = chartStartX + (index * barSpacing);
    const barY = chartStartY + (maxBarHeight - barHeight);

     // Create bar rectangle with rounded corners
     const barId = `bar_${index}_${Date.now()}`;
     requests.push({
       createShape: {
         objectId: barId,
         shapeType: 'ROUND_RECTANGLE',
         elementProperties: {
           pageObjectId: slideId,
           size: {
             height: { magnitude: barHeight, unit: 'PT' },
             width: { magnitude: barWidth, unit: 'PT' }
           },
           transform: {
             scaleX: 1,
             scaleY: 1,
             translateX: barX,
             translateY: barY,
             unit: 'PT'
           }
         }
       }
     });

    // Style the bar
    requests.push({
      updateShapeProperties: {
        objectId: barId,
        fields: 'shapeBackgroundFill',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: {
                  red: 0.4,
                  green: 0.3,
                  blue: 0.9
                }
              }
            }
          }
        }
      }
    });

    // Add label below bar
    const labelId = `label_${index}_${Date.now()}`;
    requests.push({
      createShape: {
        objectId: labelId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 30, unit: 'PT' },
            width: { magnitude: barWidth + 20, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: barX - 10,
            translateY: chartStartY + maxBarHeight + 10,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: labelId,
        text: data.label
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: labelId,
        fields: 'fontSize,fontFamily',
        textRange: { type: 'ALL' },
        style: {
          fontSize: { magnitude: 10, unit: 'PT' },
          fontFamily: 'Helvetica'
        }
      }
    });

    // Add value on top of bar
    const valueId = `value_${index}_${Date.now()}`;
    requests.push({
      createShape: {
        objectId: valueId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 20, unit: 'PT' },
            width: { magnitude: barWidth, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: barX,
            translateY: barY - 25,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: valueId,
        text: data.value.toString()
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: valueId,
        fields: 'fontSize,fontFamily,bold',
        textRange: { type: 'ALL' },
        style: {
          fontSize: { magnitude: 12, unit: 'PT' },
          fontFamily: 'Helvetica',
          bold: true
        }
      }
    });
  });

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

function createFullWidthChartRequests(layoutData: any, slideId: string) {
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

  // Create full-width area chart simulation
  const chartData = layoutData.chartData || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Revenue', data: [6500, 8200, 9500, 11200, 15800, 25000] },
      { name: 'GMV', data: [4200, 5800, 6800, 8500, 12200, 19500] }
    ]
  };

  // Create area chart using shapes (simplified representation)
  const chartStartX = 80;
  const chartStartY = 160;
  const chartWidth = 720;
  const chartHeight = 300;
  const dataPoints = chartData.labels.length;

  // Create background rectangle for chart area
  const chartBgId = `chartBg_${Date.now()}`;
  requests.push({
    createShape: {
      objectId: chartBgId,
      shapeType: 'RECTANGLE',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          height: { magnitude: chartHeight, unit: 'PT' },
          width: { magnitude: chartWidth, unit: 'PT' }
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: chartStartX,
          translateY: chartStartY,
          unit: 'PT'
        }
      }
    }
  });

  requests.push({
    updateShapeProperties: {
      objectId: chartBgId,
      fields: 'shapeBackgroundFill,outline',
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: {
              rgbColor: {
                red: 0.98,
                green: 0.98,
                blue: 0.98
              }
            }
          }
        },
        outline: {
          outlineFill: {
            solidFill: {
              color: {
                rgbColor: {
                  red: 0.9,
                  green: 0.9,
                  blue: 0.9
                }
              }
            }
          },
          weight: { magnitude: 1, unit: 'PT' }
        }
      }
    }
  });

  // Create area chart lines (simplified as connected rectangles)
  const revenueData = chartData.series[0]?.data || [6500, 8200, 9500, 11200, 15800, 25000];
  const maxValue = Math.max(...revenueData);
  const stepWidth = chartWidth / (dataPoints - 1);

  revenueData.forEach((value, index) => {
    if (index < revenueData.length - 1) {
      const currentHeight = (value / maxValue) * (chartHeight * 0.8);
      const nextHeight = (revenueData[index + 1] / maxValue) * (chartHeight * 0.8);
      
      // Create area segment
      const segmentId = `segment_${index}_${Date.now()}`;
      requests.push({
        createShape: {
          objectId: segmentId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              height: { magnitude: Math.max(currentHeight, nextHeight), unit: 'PT' },
              width: { magnitude: stepWidth, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: chartStartX + (index * stepWidth),
              translateY: chartStartY + chartHeight - Math.max(currentHeight, nextHeight),
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        updateShapeProperties: {
          objectId: segmentId,
          fields: 'shapeBackgroundFill',
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: {
                color: {
                  rgbColor: {
                    red: 0.4,
                    green: 0.3,
                    blue: 0.9
                  }
                }
              }
            }
          }
        }
      });
    }
  });

  // Add X-axis labels
  chartData.labels.forEach((label, index) => {
    const labelId = `xlabel_${index}_${Date.now()}`;
    requests.push({
      createShape: {
        objectId: labelId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 20, unit: 'PT' },
            width: { magnitude: 60, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: chartStartX + (index * stepWidth) - 20,
            translateY: chartStartY + chartHeight + 10,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: labelId,
        text: label
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: labelId,
        fields: 'fontSize,fontFamily',
        textRange: { type: 'ALL' },
        style: {
          fontSize: { magnitude: 10, unit: 'PT' },
          fontFamily: 'Helvetica'
        }
      }
    });
  });

  // Add legend below chart
  const legendY = chartStartY + chartHeight + 40;
  chartData.series.forEach((series, index) => {
    const legendId = `legend_${index}_${Date.now()}`;
    requests.push({
      createShape: {
        objectId: legendId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 20, unit: 'PT' },
            width: { magnitude: 100, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: chartStartX + (index * 120),
            translateY: legendY,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: legendId,
        text: `● ${series.name}`
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: legendId,
        fields: 'fontSize,fontFamily',
        textRange: { type: 'ALL' },
        style: {
          fontSize: { magnitude: 12, unit: 'PT' },
          fontFamily: 'Helvetica'
        }
      }
    });
  });

  return requests;
}

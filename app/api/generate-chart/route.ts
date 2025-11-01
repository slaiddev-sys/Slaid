import { NextRequest, NextResponse } from 'next/server';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

// Use the NAPI-RS canvas implementation
process.env.CHARTJS_NODE_CANVAS_BACKEND = '@napi-rs/canvas';

// Chart.js plugins and components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Server-side chart generation started');
    
    const body = await request.json();
    const { chartData, width = 800, height = 500, type = 'bar' } = body;
    
    console.log('📊 Chart data received:', { 
      type, 
      width, 
      height, 
      labels: chartData?.labels?.length || 0,
      values: chartData?.values?.length || 0 
    });

    // Validate input
    if (!chartData || !chartData.labels || !chartData.values) {
      return NextResponse.json(
        { error: 'Missing chart data (labels and values required)' },
        { status: 400 }
      );
    }

    // Create Chart.js configuration
    const chartConfig: ChartConfiguration = {
      type: type as any,
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.label || 'Revenue',
          data: chartData.values,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',   // Blue
            'rgba(34, 197, 94, 0.8)',    // Green  
            'rgba(239, 68, 68, 0.8)',    // Red
            'rgba(245, 158, 11, 0.8)',   // Orange
            'rgba(168, 85, 247, 0.8)',   // Purple
            'rgba(236, 72, 153, 0.8)',   // Pink
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(236, 72, 153, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Hide legend for cleaner look
          },
          title: {
            display: false // Title will be added separately in the layout
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            ticks: {
              font: {
                family: 'Helvetica, Arial, sans-serif',
                size: 12
              },
              color: '#374151'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Helvetica, Arial, sans-serif',
                size: 12
              },
              color: '#374151'
            }
          }
        },
        elements: {
          bar: {
            borderRadius: 8
          }
        }
      }
    };

    console.log('⚙️ Creating ChartJSNodeCanvas instance...');
    
    // Create chart renderer
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: 'white',
      chartCallback: (ChartJS) => {
        // Additional Chart.js configuration if needed
        ChartJS.defaults.font.family = 'Helvetica, Arial, sans-serif';
      }
    });

    console.log('🖼️ Rendering chart to buffer...');
    
    // Generate chart image
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    
    console.log('✅ Chart generated successfully, buffer size:', imageBuffer.length);
    
    // Convert to base64
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    
    console.log('🎯 Base64 conversion complete, length:', base64Image.length);

    return NextResponse.json({
      success: true,
      image: base64Image,
      width,
      height,
      type
    });

  } catch (error) {
    console.error('❌ Chart generation error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate chart',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

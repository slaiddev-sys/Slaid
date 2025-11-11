import { NextRequest, NextResponse } from 'next/server'

// Simple test endpoint to verify webhook URL is accessible
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 Test webhook received:', body)
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'Test webhook received successfully',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ error: 'Failed to process test webhook' }, { status: 500 })
  }
}

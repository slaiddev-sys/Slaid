import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to simulate a successful Polar checkout
export async function POST(request: NextRequest) {
  try {
    const { userEmail, productId } = await request.json()

    if (!userEmail || !productId) {
      return NextResponse.json({ error: 'Missing userEmail or productId' }, { status: 400 })
    }

    // Simulate a Polar webhook payload
    const mockWebhookPayload = {
      type: 'checkout.completed',
      data: {
        id: 'test_checkout_' + Date.now(),
        product_id: productId,
        customer_email: userEmail,
        amount: productId === '9acd1a25-9f4b-48fb-861d-6ca663b89fa1' ? 1000 : // $10
                productId === 'ffe50868-199d-4476-b948-ab67c3894522' ? 2000 : // $20
                productId === 'c098b439-a2c3-493d-b0a6-a7d849c0de4d' ? 5000 : // $50
                productId === '92d6ad27-31d8-4a6d-989a-98da344ad7eb' ? 10000 : 1000, // $100
        status: 'completed',
        created_at: new Date().toISOString()
      }
    }

    console.log('🧪 Simulating Polar webhook for testing:', mockWebhookPayload)

    // Call our actual webhook endpoint
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/polar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockWebhookPayload)
    })

    const webhookResult = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Test webhook sent',
      webhookStatus: webhookResponse.status,
      webhookResult,
      mockPayload: mockWebhookPayload
    })

  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

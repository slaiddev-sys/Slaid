import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminConfigured } from '../../../../lib/supabase-admin'

// Product mapping for both credit packs and Pro plans
const PRODUCT_MAPPING: Record<string, { credits: number; description: string; type: 'credit_pack' | 'pro_plan' }> = {
  // Credit Pack Product IDs
  '9acd1a25-9f4b-48fb-861d-6ca663b89fa1': { credits: 200, description: '200 credits purchase ($10)', type: 'credit_pack' },
  'ffe50868-199d-4476-b948-ab67c3894522': { credits: 400, description: '400 credits purchase ($20)', type: 'credit_pack' },
  'c098b439-a2c3-493d-b0a6-a7d849c0de4d': { credits: 1000, description: '1000 credits purchase ($50)', type: 'credit_pack' },
  '92d6ad27-31d8-4a6d-989a-98da344ad7eb': { credits: 2000, description: '2000 credits purchase ($100)', type: 'credit_pack' },
  
  // Pro Plan Product IDs
  '5a954dc6-891d-428a-a948-05409fe765e2': { credits: 500, description: 'Pro Monthly Plan - 500 credits', type: 'pro_plan' },
  '8739ccac-36f9-4e28-8437-8b36bb1e7d71': { credits: 500, description: 'Pro Yearly Plan - 500 credits', type: 'pro_plan' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔔 Polar webhook received:', JSON.stringify(body, null, 2))

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      console.error('❌ Supabase admin client not configured. Service role key required.')
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    // Verify this is a successful checkout event
    if (body.type !== 'checkout.completed') {
      console.log('⏭️ Ignoring non-checkout event:', body.type)
      return NextResponse.json({ received: true })
    }

    const checkout = body.data
    const productId = checkout.product_id
    const customerEmail = checkout.customer_email

    // Get product info (credit pack or Pro plan)
    const product = PRODUCT_MAPPING[productId]
    if (!product) {
      console.error('❌ Unknown product ID:', productId)
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
    }

    console.log('💳 Processing purchase:', {
      productId,
      customerEmail,
      credits: product.credits,
      description: product.description,
      type: product.type
    })

    // Find user by email using admin client
    console.log('🔍 Looking for user with email:', customerEmail)
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Error fetching users:', userError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    const user = users?.find(u => u.email === customerEmail)
    
    if (!user) {
      console.error('❌ User not found for email:', customerEmail)
      console.log('📋 Available users:', users?.map(u => u.email))
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id
    console.log('✅ Found user:', { userId, email: customerEmail })

    // Add credits to user account
    console.log('💳 Adding credits:', { userId, credits: product.credits })
    const transactionType = product.type === 'pro_plan' ? 'subscription' : 'purchase'
    
    const { error: addCreditsError } = await supabaseAdmin
      .rpc('add_credits', {
        p_user_id: userId,
        p_credits_to_add: product.credits,
        p_transaction_type: transactionType,
        p_description: product.description
      })

    if (addCreditsError) {
      console.error('❌ Failed to add credits:', addCreditsError)
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
    }

    console.log('✅ Credits added successfully:', {
      userId,
      credits: product.credits,
      customerEmail,
      type: product.type
    })

    return NextResponse.json({ 
      success: true,
      creditsAdded: product.credits,
      userId,
      productType: product.type
    })

  } catch (error) {
    console.error('❌ Polar webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

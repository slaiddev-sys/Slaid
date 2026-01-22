import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminConfigured } from '../../../../lib/supabase-admin'

// Helper to find user by email (paginates through all users)
async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) throw error;
    if (!users || users.length === 0) break;

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;

    if (users.length < perPage) break;
    page++;
  }

  return null;
}

// Product mapping for credit packs and subscription plans
const PRODUCT_MAPPING: Record<string, { credits: number; description: string; type: 'credit_pack' | 'basic_plan' | 'pro_plan' | 'ultra_plan'; planType: string }> = {
  // Credit Pack Product IDs
  '9acd1a25-9f4b-48fb-861d-6ca663b89fa1': { credits: 200, description: '200 credits purchase ($10)', type: 'credit_pack', planType: 'free' },
  'ffe50868-199d-4476-b948-ab67c3894522': { credits: 400, description: '400 credits purchase ($20)', type: 'credit_pack', planType: 'free' },
  'c098b439-a2c3-493d-b0a6-a7d849c0de4d': { credits: 1000, description: '1000 credits purchase ($50)', type: 'credit_pack', planType: 'free' },
  '92d6ad27-31d8-4a6d-989a-98da344ad7eb': { credits: 2000, description: '2000 credits purchase ($100)', type: 'credit_pack', planType: 'free' },

  // Basic Plan Product IDs (Updated for Monthly and Annual)
  '481ff240-aadc-44c9-a58e-2fee7ab26b90': { credits: 500, description: 'Monthly Plan - 500 credits', type: 'basic_plan', planType: 'monthly' },
  '3f8500aa-7847-40dc-bcde-844bbef74742': { credits: 2500, description: 'Annual Plan - 2,500 credits', type: 'basic_plan', planType: 'annual' },

  // Weekly Plan (Using previously labeled Pro Monthly ID)
  '5a954dc6-891d-428a-a948-05409fe765e2': { credits: 200, description: 'Weekly Plan - 200 credits', type: 'pro_plan', planType: 'weekly' },

  // Legacy / Other IDs (Keep to avoid breaking, but update if necessary)
  '8739ccac-36f9-4e28-8437-8b36bb1e7d71': { credits: 2500, description: 'Annual Plan (Pro) - 2,500 credits', type: 'pro_plan', planType: 'annual' },
  '71bf9c78-f930-437a-b076-62a0c1946d14': { credits: 5000, description: 'Ultra Plan - 5,000 credits', type: 'ultra_plan', planType: 'ultra' },
  'df5e66f6-2e9f-4f32-a347-ed4e46f37b0f': { credits: 30000, description: 'Ultra Annual Plan - 30,000 credits', type: 'ultra_plan', planType: 'ultra' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔔 Polar webhook received:', JSON.stringify(body, null, 2))
    console.log('🔔 Full request headers:', Object.fromEntries(request.headers.entries()))

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      console.error('❌ Supabase admin client not configured. Service role key required.')
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    // Extract event ID for idempotency
    // Polar sends the subscription/order ID in data.id, not at root level
    const eventId = body.data?.id || body.id
    if (!eventId) {
      console.error('❌ No event ID in webhook payload')
      return NextResponse.json({ error: 'No event ID' }, { status: 400 })
    }

    // Handle different event types
    const eventType = body.type
    console.log('📬 Event type:', eventType, 'Event ID:', eventId)

    // We support checkout.created, order.created, order.paid, subscription.created, subscription.active, and subscription.canceled
    const supportedEvents = ['checkout.created', 'checkout.completed', 'order.created', 'order.paid', 'subscription.created', 'subscription.active', 'subscription.canceled']
    if (!supportedEvents.includes(eventType)) {
      console.log('⏭️ Ignoring unsupported event:', eventType)
      return NextResponse.json({ received: true })
    }

    // Extract event data FIRST - before using it!
    const eventData = body.data

    // Handle subscription cancellation
    if (eventType === 'subscription.canceled') {
      const subscriptionId = eventData.id
      const customerEmail = eventData.customer?.email || eventData.user?.email

      if (!customerEmail) {
        console.error('❌ No customer email found in subscription.canceled event')
        return NextResponse.json({ error: 'No customer email' }, { status: 400 })
      }

      console.log('🚫 Processing subscription cancellation:', { subscriptionId, customerEmail })

      // Find user by email using paginated search
      const user = await findUserByEmail(customerEmail)
      if (!user) {
        console.error('❌ User not found for email:', customerEmail)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Update subscription status to cancelled
      const { error: updateError } = await supabaseAdmin
        .from('user_credits')
        .update({
          subscription_status: 'cancelled'
        })
        .eq('user_id', user.id)
        .eq('subscription_id', subscriptionId)

      if (updateError) {
        console.error('❌ Failed to update subscription status:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }

      console.log('✅ Subscription cancelled successfully for user:', user.id)

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled',
        userId: user.id
      })
    }

    // Continue with other event types
    let productId: string
    let customerEmail: string

    if (eventType === 'checkout.created' || eventType === 'checkout.completed') {
      productId = eventData.product_id
      customerEmail = eventData.customer_email || eventData.customer?.email
    } else if (eventType === 'order.created' || eventType === 'order.paid') {
      productId = eventData.product_id
      customerEmail = eventData.customer?.email || eventData.customer_email
    } else if (eventType === 'subscription.created' || eventType === 'subscription.active') {
      productId = eventData.product_id
      customerEmail = eventData.customer?.email || eventData.user?.email
    } else if (eventType === 'subscription.canceled') {
      // This case is already handled above
      return NextResponse.json({ received: true })
    } else {
      console.error('❌ Unexpected event type:', eventType)
      return NextResponse.json({ error: 'Unexpected event type' }, { status: 400 })
    }

    if (!customerEmail) {
      console.error('❌ No customer email found in webhook data')
      return NextResponse.json({ error: 'No customer email' }, { status: 400 })
    }

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

    // Find user by email using admin client (paginated search)
    console.log('🔍 Looking for user with email:', customerEmail)
    let user = await findUserByEmail(customerEmail)

    // If user doesn't exist, create them automatically
    if (!user) {
      console.log('⚠️ User not found, creating automatically for email:', customerEmail)

      try {
        // Create user with admin client
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            created_via: 'polar_webhook',
            created_at: new Date().toISOString()
          }
        })

        if (createError) {
          console.error('❌ Error creating user:', createError)
          return NextResponse.json({ error: 'Failed to create user', details: createError }, { status: 500 })
        }

        user = newUser.user
        console.log('✅ User created successfully:', { userId: user.id, email: customerEmail })

        // Wait a bit for triggers to create profile and workspace
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (createErr) {
        console.error('❌ Exception creating user:', createErr)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
    }

    const userId = user.id
    console.log('✅ Using user:', { userId, email: customerEmail })

    // Ensure user_credits record exists (in case trigger didn't fire)
    console.log('🔍 Ensuring user_credits record exists for user:', userId)
    const { data: existingCredits, error: creditsCheckError } = await supabaseAdmin
      .from('user_credits')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (creditsCheckError || !existingCredits) {
      console.log('⚠️ No user_credits record found, creating one...')
      const { error: initError } = await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: userId,
          total_credits: 0,
          plan_type: 'none',
          created_at: new Date().toISOString()
        })

      if (initError) {
        console.error('❌ Error initializing user_credits:', initError)
        // Continue anyway - the add_credits function might handle it
      } else {
        console.log('✅ user_credits record initialized')
      }
    }

    // Check if this event was already processed (idempotency check)
    console.log('🔍 Checking if event was already processed:', eventId)
    const { data: existingTransaction, error: checkError } = await supabaseAdmin
      .from('credit_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('description', product.description)
      .eq('credits_amount', product.credits)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Check last 5 minutes
      .limit(1)

    if (checkError) {
      console.error('⚠️ Error checking for duplicate transaction:', checkError)
      // Continue anyway - better to add credits twice than not at all
    } else if (existingTransaction && existingTransaction.length > 0) {
      console.log('✅ Event already processed (duplicate detected), returning success:', eventId)
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: 'Event already processed',
        eventId
      })
    }

    // Add credits to user account
    console.log('💳 Adding credits:', { userId, credits: product.credits })
    const transactionType = (product.type === 'basic_plan' || product.type === 'pro_plan' || product.type === 'ultra_plan') ? 'subscription' : 'purchase'

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

    // If this is a subscription plan purchase (Basic, Pro, or Ultra), upgrade the user's plan_type
    if (product.type === 'basic_plan' || product.type === 'pro_plan' || product.type === 'ultra_plan') {
      console.log(`🚀 Upgrading user to ${product.planType} plan:`, userId)

      // Extract subscription ID from the event data
      const subscriptionId = eventData.id || eventData.subscription_id
      console.log('📋 Subscription ID:', subscriptionId)

      const { error: updatePlanError } = await supabaseAdmin
        .from('user_credits')
        .update({
          plan_type: product.planType,
          subscription_status: 'active',
          subscription_id: subscriptionId,
          last_renewal_date: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updatePlanError) {
        console.error('❌ Failed to upgrade user plan:', updatePlanError)
        // Don't fail the webhook - credits were added successfully
      } else {
        console.log(`✅ User plan upgraded to ${product.planType} with subscription ID:`, subscriptionId)
      }
    }

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

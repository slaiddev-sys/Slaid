import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Credit balance API called')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing auth header')
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('🔍 Getting user with token...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id, user.email)

    // Get user credit information - USE ADMIN CLIENT to bypass RLS
    console.log('🔍 Fetching credits from user_credits table for user:', user.id)
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from('user_credits')
      .select('total_credits, used_credits, plan_type, last_renewal_date, subscription_status')
      .eq('user_id', user.id)
      .single()

    // If no credit record exists, create one
    if (creditError || !creditData) {
      console.log('🆕 No credit record found, creating for user:', user.id)
      
      const { data: newCreditData, error: initError } = await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: user.id,
          total_credits: 0,
          used_credits: 0,
          plan_type: 'none',
          last_renewal_date: new Date().toISOString()
        })
        .select()
        .single()

      if (initError) {
        console.error('❌ Failed to initialize user credits:', initError)
        return NextResponse.json({ 
          credits: {
            total_credits: 0,
            used_credits: 0,
            remaining_credits: 0,
            plan_type: 'none',
            last_renewal_date: new Date().toISOString()
          },
          fallback: true 
        })
      }

      const remaining = (newCreditData.total_credits || 0) - (newCreditData.used_credits || 0)
      return NextResponse.json({ 
        credits: {
          ...newCreditData,
          remaining_credits: remaining
        },
        initialized: true 
      })
    }

    // Calculate remaining credits
    const remaining_credits = (creditData.total_credits || 0) - (creditData.used_credits || 0)
    
    console.log('✅ Returning existing credit data:', {
      user_id: user.id,
      plan_type: creditData.plan_type,
      remaining_credits,
      total_credits: creditData.total_credits
    })
    
    return NextResponse.json({ 
      credits: {
        ...creditData,
        remaining_credits
      },
      initialized: false 
    })

  } catch (error) {
    console.error('❌ Error fetching credit balance:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

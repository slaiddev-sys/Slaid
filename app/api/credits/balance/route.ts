import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

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

    // Get user credit information
    console.log('🔍 Calling get_user_credits function for user:', user.id)
    const { data: creditData, error: creditError } = await supabase
      .rpc('get_user_credits', { p_user_id: user.id })

    if (creditError) {
      console.error('❌ Failed to fetch user credits:', creditError)
      console.error('❌ Credit error details:', {
        message: creditError.message,
        details: creditError.details,
        hint: creditError.hint,
        code: creditError.code
      })
      
      // If database functions don't exist yet, return fallback credits
      if (creditError.message?.includes('get_user_credits') || creditError.message?.includes('function')) {
        console.warn('⚠️ Database functions not created yet, returning fallback credits')
        return NextResponse.json({ 
          credits: {
            total_credits: 0,
            used_credits: 0,
            remaining_credits: 0,
            plan_type: 'free',
            last_renewal_date: new Date().toISOString()
          },
          fallback: true 
        })
      }
      
      return NextResponse.json({ error: creditError.message }, { status: 500 })
    }

    // If no credit record exists, initialize with free plan
    if (!creditData || creditData.length === 0) {
      console.log('🆕 No credit record found, initializing for user:', user.id)
      
      const { error: initError } = await supabase
        .rpc('initialize_user_credits', { 
          p_user_id: user.id
        })

      if (initError) {
        console.error('❌ Failed to initialize user credits:', initError)
        return NextResponse.json({ error: 'Failed to initialize credits' }, { status: 500 })
      }

      // Fetch the newly created credit data
      const { data: newCreditData, error: newCreditError } = await supabase
        .rpc('get_user_credits', { p_user_id: user.id })

      if (newCreditError || !newCreditData || newCreditData.length === 0) {
        console.error('❌ Failed to fetch newly created credits:', newCreditError)
        return NextResponse.json({ error: 'Failed to fetch credits after initialization' }, { status: 500 })
      }

      return NextResponse.json({ 
        credits: newCreditData[0],
        initialized: true 
      })
    }

    return NextResponse.json({ 
      credits: creditData[0],
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

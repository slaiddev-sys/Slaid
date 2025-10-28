import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()

    if (!planType || !['free', 'pro'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Initialize user credits with new plan
    const { error: upgradeError } = await supabase
      .rpc('initialize_user_credits', {
        p_user_id: user.id,
        p_plan_type: planType
      })

    if (upgradeError) {
      console.error('❌ Failed to upgrade plan:', upgradeError)
      return NextResponse.json({ error: upgradeError.message }, { status: 500 })
    }

    // Get updated credit information
    const { data: updatedCredits, error: balanceError } = await supabase
      .rpc('get_user_credits', { p_user_id: user.id })

    if (balanceError) {
      console.error('❌ Failed to fetch updated balance:', balanceError)
      return NextResponse.json({ error: 'Failed to fetch updated balance' }, { status: 500 })
    }

    console.log('✅ Plan upgraded successfully:', {
      userId: user.id,
      newPlan: planType,
      credits: updatedCredits[0]
    })

    return NextResponse.json({ 
      success: true,
      newPlan: planType,
      credits: updatedCredits[0]
    })

  } catch (error) {
    console.error('❌ Error upgrading plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

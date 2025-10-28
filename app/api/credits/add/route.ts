import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { creditsToAdd, description } = await request.json()

    if (!creditsToAdd || creditsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 })
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

    // Add credits
    const { error: addError } = await supabase
      .rpc('add_credits', {
        p_user_id: user.id,
        p_credits_to_add: creditsToAdd,
        p_description: description || 'Credit purchase'
      })

    if (addError) {
      console.error('❌ Failed to add credits:', addError)
      return NextResponse.json({ error: addError.message }, { status: 500 })
    }

    // Get updated balance
    const { data: updatedCredits, error: balanceError } = await supabase
      .rpc('get_user_credits', { p_user_id: user.id })

    if (balanceError) {
      console.error('❌ Failed to fetch updated balance:', balanceError)
      return NextResponse.json({ error: 'Failed to fetch updated balance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      creditsAdded: creditsToAdd,
      remainingCredits: updatedCredits[0]?.remaining_credits || 0,
      totalCredits: updatedCredits[0]?.total_credits || 0,
      usedCredits: updatedCredits[0]?.used_credits || 0
    })

  } catch (error) {
    console.error('❌ Error adding credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

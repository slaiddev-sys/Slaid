import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      creditsToDeduct, 
      anthropicCostCents, 
      presentationId, 
      workspace, 
      description 
    } = await request.json()

    if (!creditsToDeduct || creditsToDeduct <= 0) {
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

    // Attempt to deduct credits
    const { data: deductionResult, error: deductError } = await supabase
      .rpc('deduct_credits', {
        p_user_id: user.id,
        p_credits_to_deduct: creditsToDeduct,
        p_anthropic_cost_cents: anthropicCostCents || creditsToDeduct, // Default to credits if not provided
        p_presentation_id: presentationId || null,
        p_workspace: workspace || null,
        p_description: description || 'API usage'
      })

    if (deductError) {
      console.error('❌ Failed to deduct credits:', deductError)
      return NextResponse.json({ error: deductError.message }, { status: 500 })
    }

    // Check if deduction was successful
    if (!deductionResult) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        success: false 
      }, { status: 402 }) // Payment Required
    }

    // Get updated balance
    const { data: updatedCredits, error: balanceError } = await supabase
      .rpc('get_user_credits', { p_user_id: user.id })

    if (balanceError) {
      console.error('❌ Failed to fetch updated balance:', balanceError)
      // Still return success since deduction worked
      return NextResponse.json({ 
        success: true,
        creditsDeducted: creditsToDeduct,
        remainingCredits: null
      })
    }

    return NextResponse.json({ 
      success: true,
      creditsDeducted: creditsToDeduct,
      remainingCredits: updatedCredits[0]?.remaining_credits || 0,
      totalCredits: updatedCredits[0]?.total_credits || 0,
      usedCredits: updatedCredits[0]?.used_credits || 0
    })

  } catch (error) {
    console.error('❌ Error deducting credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

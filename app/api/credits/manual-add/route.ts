import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminConfigured } from '../../../../lib/supabase-admin'

// TEMPORARY: Manual credit addition for testing
export async function POST(request: NextRequest) {
  try {
    const { userEmail, credits, description } = await request.json()

    if (!userEmail || !credits || credits <= 0) {
      return NextResponse.json({ error: 'Missing userEmail or invalid credits amount' }, { status: 400 })
    }

    console.log('🔧 Manual credit addition:', { userEmail, credits, description })

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      console.error('❌ Supabase admin client not configured. Service role key required.')
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    // Find user by email using admin client
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    const user = users?.find(u => u.email === userEmail)
    
    if (!user) {
      console.error('❌ User not found for email:', userEmail, userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id

    // Add credits to user account
    const { error: addCreditsError } = await supabaseAdmin
      .rpc('add_credits', {
        p_user_id: userId,
        p_credits_to_add: credits,
        p_transaction_type: 'purchase',
        p_description: description || 'Manual credit addition'
      })

    if (addCreditsError) {
      console.error('❌ Failed to add credits:', addCreditsError)
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
    }

    // Get updated balance
    const { data: updatedCredits, error: balanceError } = await supabaseAdmin
      .rpc('get_user_credits', { p_user_id: userId })

    if (balanceError) {
      console.error('❌ Failed to fetch updated balance:', balanceError)
    }

    console.log('✅ Credits added manually:', {
      userId,
      credits,
      userEmail,
      newBalance: updatedCredits?.[0]?.remaining_credits
    })

    return NextResponse.json({ 
      success: true,
      creditsAdded: credits,
      userId,
      userEmail,
      newBalance: updatedCredits?.[0]?.remaining_credits || 'unknown'
    })

  } catch (error) {
    console.error('❌ Manual credit addition error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

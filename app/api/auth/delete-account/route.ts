import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  try {
    // Get user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token or user not found' }, { status: 401 })
    }

    console.log('🗑️ Deleting account for user:', user.email)

    // Delete user data in order (respecting foreign key constraints)
    
    // 1. Get all user presentations first
    const { data: userPresentations } = await supabase
      .from('presentations')
      .select('id')
      .eq('user_id', user.id)

    if (userPresentations && userPresentations.length > 0) {
      const presentationIds = userPresentations.map(p => p.id)
      
      // 2. Get all slides for these presentations
      const { data: slides } = await supabase
        .from('slides')
        .select('id')
        .in('presentation_id', presentationIds)

      // 3. Delete blocks first (they reference slides)
      if (slides && slides.length > 0) {
        const slideIds = slides.map(s => s.id)
        const { error: blocksError } = await supabase
          .from('blocks')
          .delete()
          .in('slide_id', slideIds)

        if (blocksError) {
          console.warn('⚠️ Failed to delete some blocks:', blocksError)
        } else {
          console.log('✅ Deleted blocks for user')
        }
      }

      // 4. Delete slides (they reference presentations)
      const { error: slidesError } = await supabase
        .from('slides')
        .delete()
        .in('presentation_id', presentationIds)

      if (slidesError) {
        console.warn('⚠️ Failed to delete some slides:', slidesError)
      } else {
        console.log('✅ Deleted slides for user')
      }

      // 5. Delete messages (they reference presentations)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('presentation_id', presentationIds)

      if (messagesError) {
        console.warn('⚠️ Failed to delete some messages:', messagesError)
      } else {
        console.log('✅ Deleted messages for user')
      }
    }

    // 6. Delete presentations
    const { error: presentationsError } = await supabase
      .from('presentations')
      .delete()
      .eq('user_id', user.id)

    if (presentationsError) {
      console.warn('⚠️ Failed to delete some presentations:', presentationsError)
    } else {
      console.log('✅ Deleted presentations for user')
    }

    // 7. Delete workspaces (if the table exists)
    try {
      const { error: workspacesError } = await supabase
        .from('workspaces')
        .delete()
        .eq('user_id', user.id)

      if (workspacesError) {
        console.warn('⚠️ Failed to delete workspaces (table may not exist):', workspacesError)
      } else {
        console.log('✅ Deleted workspaces for user')
      }
    } catch (workspaceError) {
      console.warn('⚠️ Workspaces table may not exist, skipping:', workspaceError)
    }

    // 8. Delete user profile (if it exists)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        console.warn('⚠️ Failed to delete profile (table may not exist):', profileError)
      } else {
        console.log('✅ Deleted profile for user')
      }
    } catch (profileError) {
      console.warn('⚠️ Profiles table may not exist, skipping:', profileError)
    }

    // 9. Cancel any active Polar subscriptions
    console.log('🚫 Checking for active subscriptions to cancel...')
    try {
      const { data: userCredits } = await supabaseAdmin
        .from('user_credits')
        .select('plan_type, subscription_id, subscription_status')
        .eq('user_id', user.id)
        .single()

      if (userCredits && userCredits.plan_type !== 'free' && userCredits.subscription_status === 'active') {
        console.log('📋 Found active subscription:', {
          plan_type: userCredits.plan_type,
          subscription_id: userCredits.subscription_id
        })

        // Mark subscription as cancelled in database
        await supabaseAdmin
          .from('user_credits')
          .update({
            subscription_status: 'cancelled'
          })
          .eq('user_id', user.id)

        // Log the cancellation
        await supabaseAdmin
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            credits_amount: 0,
            transaction_type: 'refund',
            description: `Subscription cancelled due to account deletion - ${userCredits.plan_type} plan`
          })

        console.log('✅ Subscription marked as cancelled in database')
        console.log('⚠️ Note: You must manually cancel the subscription in Polar dashboard to stop future billing')
      } else {
        console.log('ℹ️ No active subscription found')
      }
    } catch (subscriptionError) {
      console.warn('⚠️ Failed to cancel subscription (continuing with deletion):', subscriptionError)
    }

    // 10. Finally, delete the user account from Supabase Auth
    console.log('🗑️ Deleting user from Supabase Auth...')
    
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (deleteUserError) {
      console.error('❌ Failed to delete user from auth:', deleteUserError)
      return NextResponse.json({ 
        error: 'Failed to completely delete account, but user data has been removed',
        details: deleteUserError.message 
      }, { status: 500 })
    }

    console.log('✅ Successfully deleted user completely (data + auth) for:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Account data deleted successfully. You have been signed out.'
    })

  } catch (error) {
    console.error('❌ Error deleting account:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

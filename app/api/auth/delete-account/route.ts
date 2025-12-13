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
    const polarAccessToken = process.env.POLAR_SH_ACCESS_TOKEN;
    
    try {
      const { data: userCredits } = await supabaseAdmin
        .from('user_credits')
        .select('plan_type, subscription_id, subscription_status')
        .eq('user_id', user.id)
        .single()

      if (userCredits && userCredits.plan_type !== 'free' && userCredits.plan_type !== 'none') {
        console.log('📋 Found subscription to cancel:', {
          plan_type: userCredits.plan_type,
          subscription_id: userCredits.subscription_id
        })

        // Cancel in Polar if we have subscription_id
        if (userCredits.subscription_id && polarAccessToken) {
          try {
            await fetch(`https://api.polar.sh/v1/subscriptions/${userCredits.subscription_id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${polarAccessToken}` }
            });
            console.log('✅ Subscription cancelled in Polar');
          } catch (polarError) {
            console.warn('⚠️ Failed to cancel in Polar:', polarError);
          }
        } else if (polarAccessToken && user.email) {
          // Search by email if no subscription_id
          try {
            const customersResponse = await fetch(`https://api.polar.sh/v1/customers?email=${encodeURIComponent(user.email)}`, {
              headers: { 'Authorization': `Bearer ${polarAccessToken}` }
            });
            if (customersResponse.ok) {
              const customersData = await customersResponse.json();
              if (customersData.items?.[0]?.id) {
                const subsResponse = await fetch(`https://api.polar.sh/v1/subscriptions?customer_id=${customersData.items[0].id}&active=true`, {
                  headers: { 'Authorization': `Bearer ${polarAccessToken}` }
                });
                if (subsResponse.ok) {
                  const subsData = await subsResponse.json();
                  if (subsData.items?.[0]?.id) {
                    await fetch(`https://api.polar.sh/v1/subscriptions/${subsData.items[0].id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${polarAccessToken}` }
                    });
                    console.log('✅ Subscription found by email and cancelled in Polar');
                  }
                }
              }
            }
          } catch (searchError) {
            console.warn('⚠️ Failed to search/cancel subscription in Polar:', searchError);
          }
        }
      }
    } catch (subscriptionError) {
      console.warn('⚠️ Failed to check subscription (continuing with deletion):', subscriptionError)
    }

    // 10. Delete credit_transactions
    try {
      const { error: txError } = await supabaseAdmin
        .from('credit_transactions')
        .delete()
        .eq('user_id', user.id)
      
      if (txError) {
        console.warn('⚠️ Failed to delete credit_transactions:', txError)
      } else {
        console.log('✅ Deleted credit_transactions for user')
      }
    } catch (e) {
      console.warn('⚠️ credit_transactions delete error:', e)
    }

    // 11. Delete user_credits
    try {
      const { error: creditsError } = await supabaseAdmin
        .from('user_credits')
        .delete()
        .eq('user_id', user.id)
      
      if (creditsError) {
        console.warn('⚠️ Failed to delete user_credits:', creditsError)
      } else {
        console.log('✅ Deleted user_credits for user')
      }
    } catch (e) {
      console.warn('⚠️ user_credits delete error:', e)
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

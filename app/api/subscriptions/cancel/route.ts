import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚫 Cancel subscription request for user:', user.id, user.email);

    // Get user's current subscription info
    const { data: userCredits, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('plan_type, subscription_id, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !userCredits) {
      console.error('❌ Error fetching user credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch subscription info' }, { status: 500 });
    }

    // Check if user has an active paid subscription
    if (userCredits.plan_type === 'free' || userCredits.plan_type === 'none') {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 });
    }

    console.log('📋 Current subscription:', {
      plan_type: userCredits.plan_type,
      subscription_id: userCredits.subscription_id,
      subscription_status: userCredits.subscription_status
    });

    // Cancel subscription in Polar if we have a subscription_id
    if (userCredits.subscription_id) {
      try {
        console.log('🔄 Cancelling subscription in Polar:', userCredits.subscription_id);
        
        const polarAccessToken = process.env.POLAR_SH_ACCESS_TOKEN;
        
        if (polarAccessToken) {
          // Call Polar API to cancel subscription IMMEDIATELY
          // Using DELETE method for immediate cancellation
          const polarResponse = await fetch(`https://api.polar.sh/v1/subscriptions/${userCredits.subscription_id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${polarAccessToken}`,
              'Content-Type': 'application/json',
            }
          });

          if (!polarResponse.ok) {
            const errorText = await polarResponse.text();
            console.error('❌ Polar API error:', {
              status: polarResponse.status,
              statusText: polarResponse.statusText,
              response: errorText
            });
            // If DELETE doesn't work, try PATCH with cancel_at_period_end
            const patchResponse = await fetch(`https://api.polar.sh/v1/subscriptions/${userCredits.subscription_id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${polarAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cancel_at_period_end: true
              })
            });
            
            if (patchResponse.ok) {
              console.log('✅ Subscription marked to cancel at period end in Polar');
            }
          } else {
            console.log('✅ Subscription cancelled immediately in Polar');
          }
        } else {
          console.log('⚠️ No Polar access token - skipping Polar cancellation');
        }
      } catch (polarError: any) {
        console.error('❌ Error cancelling with Polar:', polarError);
        // Continue to update database even if Polar call fails
      }
    } else {
      console.log('⚠️ No subscription_id - skipping Polar cancellation (manual plan assignment)');
    }

    // Store old plan for logging
    const oldPlanType = userCredits.plan_type;

    // Update the database - REVOKE ACCESS IMMEDIATELY
    // Change plan_type to 'none' so user loses editor access
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        plan_type: 'none',
        subscription_status: 'cancelled',
        subscription_id: null
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Error updating subscription status:', updateError);
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    // Log the cancellation (don't fail if this errors)
    try {
      await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          credits_amount: 0,
          transaction_type: 'cancellation',
          description: `Subscription cancelled - ${oldPlanType} plan revoked`
        });
      console.log('✅ Cancellation logged in credit_transactions');
    } catch (logError) {
      console.error('⚠️ Failed to log cancellation (non-critical):', logError);
      // Don't fail the cancellation just because logging failed
    }

    console.log('✅ Subscription cancelled and access revoked for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. Your access has been revoked.',
      accessRevoked: true
    });

  } catch (error: any) {
    console.error('❌ Unexpected error cancelling subscription:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}



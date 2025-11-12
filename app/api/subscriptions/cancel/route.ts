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
    if (userCredits.plan_type === 'free') {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 });
    }

    console.log('📋 Current subscription:', {
      plan_type: userCredits.plan_type,
      subscription_id: userCredits.subscription_id,
      subscription_status: userCredits.subscription_status
    });

    // In a real implementation, you would call Polar's API to cancel the subscription
    // For now, we'll update the database to mark the subscription as cancelled
    // The user will retain access until their current billing period ends

    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        subscription_status: 'cancelled'
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Error updating subscription status:', updateError);
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    // Log the cancellation
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        credits_changed: 0,
        credits_amount: 0,
        transaction_type: 'refund',
        description: `Subscription cancelled - ${userCredits.plan_type} plan`
      });

    console.log('✅ Subscription cancelled successfully for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. You will retain access until the end of your billing period.'
    });

  } catch (error: any) {
    console.error('❌ Unexpected error cancelling subscription:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}


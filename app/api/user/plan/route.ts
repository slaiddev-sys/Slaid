import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Fetching plan for user:', user.id);

    // Get user's subscription plan from user_credits table
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('plan_type, total_credits, remaining_credits, last_renewal_date')
      .eq('user_id', user.id)
      .single();

    if (creditError) {
      console.error('❌ Error fetching user plan:', creditError);
      // If no record exists, user must select a plan
      return NextResponse.json({
        plan_type: 'none',
        total_credits: 0,
        remaining_credits: 0,
        last_renewal_date: new Date().toISOString()
      });
    }

    console.log('✅ User plan fetched:', creditData.plan_type);

    return NextResponse.json({
      plan_type: creditData.plan_type || 'none',
      total_credits: creditData.total_credits,
      remaining_credits: creditData.remaining_credits,
      last_renewal_date: creditData.last_renewal_date
    });

  } catch (error) {
    console.error('❌ Unexpected error in plan API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      plan_type: 'none' // User must select a plan
    }, { status: 500 });
  }
}


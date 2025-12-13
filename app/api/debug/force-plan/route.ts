import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

// Helper to find user by email (paginates through all users)
async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 1000;
  
  while (true) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage
    });
    
    if (error) throw error;
    if (!users || users.length === 0) break;
    
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    
    if (users.length < perPage) break;
    page++;
  }
  
  return null;
}

// GET for easy browser access
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const plan_type = searchParams.get('plan_type');
  
  if (!email || !plan_type) {
    return NextResponse.json({ 
      error: 'Email and plan_type query params required',
      example: '/api/debug/force-plan?email=user@example.com&plan_type=basic'
    }, { status: 400 })
  }
  
  return updatePlan(email, plan_type);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, plan_type } = body

    if (!email || !plan_type) {
      return NextResponse.json({ 
        error: 'Email and plan_type required',
        example: { email: 'user@example.com', plan_type: 'basic' }
      }, { status: 400 })
    }
    
    return updatePlan(email, plan_type);
  } catch (error) {
    console.error('❌ Force plan update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Credits per plan type (monthly)
const PLAN_CREDITS: Record<string, number> = {
  'basic': 500,
  'pro': 1000,
  'ultra': 2000,
  'none': 0,
  'free': 0
};

async function updatePlan(email: string, plan_type: string) {
  try {
    // Validate plan_type
    const validPlans = ['none', 'free', 'basic', 'pro', 'ultra']
    if (!validPlans.includes(plan_type.toLowerCase())) {
      return NextResponse.json({ 
        error: 'Invalid plan_type',
        valid_plans: validPlans
      }, { status: 400 })
    }

    const normalizedPlan = plan_type.toLowerCase();
    const creditsToAdd = PLAN_CREDITS[normalizedPlan] || 0;

    console.log('🔧 FORCE PLAN UPDATE:', { email, plan_type: normalizedPlan, creditsToAdd })

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found', email }, { status: 404 })
    }

    console.log('✅ User found:', user.id)

    // Get current credits
    const { data: currentCredits } = await supabaseAdmin
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single();
    
    const currentTotal = currentCredits?.total_credits || 0;
    const usedCredits = currentCredits?.used_credits || 0;

    // Update plan_type AND add credits
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({ 
        plan_type: normalizedPlan,
        subscription_status: normalizedPlan !== 'none' && normalizedPlan !== 'free' ? 'active' : 'inactive',
        last_renewal_date: new Date().toISOString(),
        total_credits: currentTotal + creditsToAdd,
        used_credits: usedCredits // Reset if needed
      })
      .eq('user_id', user.id)
      .select()

    if (updateError) {
      console.error('❌ Error updating plan:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update plan',
        details: updateError
      }, { status: 500 })
    }

    // Also record transaction if credits were added
    if (creditsToAdd > 0) {
      await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          credits_amount: creditsToAdd,
          transaction_type: 'manual_fix',
          description: `Manual plan fix: ${normalizedPlan} plan - ${creditsToAdd} credits added`
        });
    }

    console.log('✅ Plan updated successfully:', updateData)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      updated_to: normalizedPlan,
      credits_added: creditsToAdd,
      new_total_credits: currentTotal + creditsToAdd,
      data: updateData
    })

  } catch (error) {
    console.error('❌ Force plan update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


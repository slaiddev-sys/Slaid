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

    console.log('🔧 FORCE PLAN UPDATE:', { email, plan_type })

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found', email }, { status: 404 })
    }

    console.log('✅ User found:', user.id)

    // Update plan_type
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({ 
        plan_type: plan_type.toLowerCase(),
        subscription_status: plan_type !== 'none' && plan_type !== 'free' ? 'active' : null,
        last_renewal_date: new Date().toISOString()
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

    console.log('✅ Plan updated successfully:', updateData)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      updated_to: plan_type.toLowerCase(),
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


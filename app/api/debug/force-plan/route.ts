import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

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
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Error fetching users:', userError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    const user = users?.find(u => u.email === email)
    
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


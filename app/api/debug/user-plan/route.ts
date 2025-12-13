import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    console.log('🔍 DEBUG: Checking plan for email:', email)

    // Find user by email - paginate through all users
    let user = null;
    let page = 1;
    let totalSearched = 0;
    const perPage = 1000;
    
    while (!user) {
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (userError) {
        console.error('❌ Error fetching users:', userError)
        return NextResponse.json({ error: 'Failed to fetch users', details: userError }, { status: 500 })
      }
      
      if (!users || users.length === 0) {
        break; // No more users
      }
      
      totalSearched += users.length;
      user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (users.length < perPage) {
        break; // Last page
      }
      
      page++;
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        email,
        searched_users: totalSearched,
        note: 'User does not exist in Supabase Auth. They may need to register first.'
      }, { status: 404 })
    }

    console.log('✅ User found:', user.id, 'after searching', totalSearched, 'users')

    // Get user credits info
    const { data: creditsData, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (creditsError) {
      console.error('❌ Error fetching credits:', creditsError)
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        credits_error: creditsError,
        has_credits_record: false
      })
    }

    // Check if has paid plan
    const hasPaidPlan = creditsData?.plan_type && 
      ['basic', 'pro', 'ultra'].includes(creditsData.plan_type.toLowerCase())

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      credits: creditsData,
      verification: {
        has_paid_plan: hasPaidPlan,
        plan_type: creditsData?.plan_type,
        is_basic_pro_or_ultra: ['basic', 'pro', 'ultra'].includes(creditsData?.plan_type?.toLowerCase() || ''),
        should_access_editor: hasPaidPlan
      }
    })

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


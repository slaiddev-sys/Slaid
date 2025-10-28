import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// This endpoint can be called by a cron job to renew Pro user credits monthly
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (you might want to add API key validation)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting monthly credit renewal process...')

    // Call the renewal function
    const { data: renewalCount, error: renewalError } = await supabase
      .rpc('renew_monthly_credits')

    if (renewalError) {
      console.error('❌ Failed to renew credits:', renewalError)
      return NextResponse.json({ error: renewalError.message }, { status: 500 })
    }

    console.log('✅ Monthly credit renewal completed:', renewalCount, 'users renewed')

    return NextResponse.json({ 
      success: true,
      usersRenewed: renewalCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in credit renewal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also allow GET for manual testing
export async function GET(request: NextRequest) {
  try {
    // Get user counts for monitoring
    const { data: totalUsers, error: totalError } = await supabase
      .from('user_credits')
      .select('plan_type')

    if (totalError) {
      return NextResponse.json({ error: totalError.message }, { status: 500 })
    }

    const stats = {
      totalUsers: totalUsers?.length || 0,
      freeUsers: totalUsers?.filter(u => u.plan_type === 'free').length || 0,
      proUsers: totalUsers?.filter(u => u.plan_type === 'pro').length || 0,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ Error getting credit stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's workspaces
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('id, name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch workspaces:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Fetched workspaces for user:', user.id, 'Count:', workspaces?.length || 0)
    
    return NextResponse.json({ 
      workspaces: workspaces || [],
      userId: user.id
    })
  } catch (error) {
    console.error('❌ Error fetching workspaces:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

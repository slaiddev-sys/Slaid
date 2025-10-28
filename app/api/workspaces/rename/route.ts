import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json()
    
    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing oldName or newName' }, { status: 400 })
    }

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

    console.log('🔧 API: Renaming workspace from:', oldName, 'to:', newName, 'for user:', user.id)

    // Update the workspace name in workspaces table
    const { error: workspaceError } = await supabase
      .from('workspaces')
      .update({ name: newName })
      .eq('name', oldName)
      .eq('user_id', user.id)

    if (workspaceError) {
      console.error('❌ Failed to rename workspace:', workspaceError)
      return NextResponse.json({ error: workspaceError.message }, { status: 500 })
    }

    // Update all presentations that belong to the old workspace for this user
    const { data, error } = await supabase
      .from('presentations')
      .update({ workspace: newName })
      .eq('workspace', oldName)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('❌ Failed to rename workspace in presentations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Workspace renamed in database. Updated presentations:', data?.length || 0)
    
    return NextResponse.json({ 
      success: true, 
      updatedPresentations: data?.length || 0 
    })
  } catch (error) {
    console.error('❌ Error renaming workspace:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

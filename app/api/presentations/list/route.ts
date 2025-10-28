import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspace = searchParams.get('workspace') || ''

    // Get user authentication
    let userId: string | undefined
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    console.log('📡 API: Listing presentations from Supabase:', {
      workspace,
      userId,
      workspaceLength: workspace?.length,
      workspaceType: typeof workspace
    })

    if (!workspace || workspace.trim() === '') {
      console.error('❌ API: Invalid workspace parameter:', { workspace, type: typeof workspace })
      return NextResponse.json(
        { error: 'Missing or empty workspace parameter' },
        { status: 400 }
      )
    }

    // Build query based on authentication
    let query = supabase
      .from('presentations')
      .select('id, title, workspace, updated_at')
      .eq('workspace', workspace)
      .order('updated_at', { ascending: false })

    // If user is authenticated, only show their presentations
    // If not authenticated, return empty array (no backward compatibility for anonymous users)
    if (userId) {
      // Only include presentations with this user_id (no more shared presentations)
      query = query.eq('user_id', userId)
    } else {
      // For unauthenticated users, return empty array
      console.log('⚠️ Unauthenticated user - returning empty presentations list')
      return NextResponse.json({
        success: true,
        presentations: [],
        message: 'Authentication required to view presentations'
      })
    }

    const { data: presentations, error } = await query

    if (error) {
      console.error('❌ Failed to list presentations:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ API: Listed presentations successfully:', presentations?.length || 0)
    console.log('📋 API: Presentation details:', presentations?.map(p => ({
      id: p.id,
      title: p.title,
      user_id: p.user_id || 'NULL',
      workspace: p.workspace
    })))

    return NextResponse.json({
      success: true,
      presentations: presentations || [],
      message: 'Presentations listed successfully'
    })

  } catch (error) {
    console.error('❌ API: Failed to list presentations:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to list presentations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

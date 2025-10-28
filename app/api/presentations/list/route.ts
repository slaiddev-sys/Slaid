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

    // If user is authenticated, only show their presentations
    // If not authenticated, return empty array (no backward compatibility for anonymous users)
    if (userId) {
      // First, get the workspace_id for this user and workspace name
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', userId)
        .eq('name', workspace)
        .single();

      if (workspaceError || !workspaceData) {
        console.log('⚠️ Workspace not found for user:', userId, 'workspace:', workspace);
        return NextResponse.json({
          success: true,
          presentations: [],
          message: 'Workspace not found'
        });
      }

      // PRIMARY FILTER: Include presentations with this user_id OR orphaned presentations in this workspace
      // SECONDARY FILTER: Within that user's presentations, filter by workspace_id (UUID)
      const query = supabase
        .from('presentations')
        .select('id, title, workspace, updated_at, user_id')
        .or(`user_id.eq.${userId},and(user_id.is.null,workspace.eq.${workspace})`)  // USER'S PRESENTATIONS OR ORPHANED IN THIS WORKSPACE
        .order('updated_at', { ascending: false })
        
      // Also auto-reclaim orphaned presentations for this user
      const reclaimQuery = supabase
        .from('presentations')
        .update({ 
          user_id: userId,
          workspace_id: workspaceData.id 
        })
        .eq('workspace', workspace)
        .is('user_id', null)
        
      // Execute reclaim in parallel (don't wait for it)
      reclaimQuery.then(({ error: reclaimError, count }) => {
        if (reclaimError) {
          console.warn('⚠️ Failed to reclaim orphaned presentations:', reclaimError)
        } else if (count && count > 0) {
          console.log('✅ Auto-reclaimed', count, 'orphaned presentations for user:', userId)
        }
      })
        
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
    } else {
      // For unauthenticated users, return empty array
      console.log('⚠️ Unauthenticated user - returning empty presentations list')
      return NextResponse.json({
        success: true,
        presentations: [],
        message: 'Authentication required to view presentations'
      })
    }

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

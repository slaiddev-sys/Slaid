import { NextRequest, NextResponse } from 'next/server'
import { loadWorkspacePresentations, getOrCreateDefaultWorkspace } from '../../../../lib/database-new'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user authentication (REQUIRED)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('🚨 BLOCKING: No authentication provided')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('🚨 BLOCKING: Invalid authentication')
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }
    
    const userId = user.id

    // Get user's default workspace
    const workspace = await getOrCreateDefaultWorkspace(userId)
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'Failed to get workspace' },
        { status: 500 }
      )
    }

    console.log('📡 API: Listing presentations from Supabase:', {
      userId,
      workspaceId: workspace.id,
      workspaceName: workspace.name
    })

    // Load presentations for this workspace
    const presentations = await loadWorkspacePresentations(workspace.id, userId)

    console.log('✅ API: Listed presentations successfully:', presentations?.length || 0)

    return NextResponse.json({
      success: true,
      presentations: presentations || [],
      workspace: {
        id: workspace.id,
        name: workspace.name
      },
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

import { NextRequest, NextResponse } from 'next/server'
import { savePresentation, getOrCreateDefaultWorkspace } from '../../../../lib/database-new'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('📡 API: Raw request body:', requestBody)
    
    let presentationId, state
    
    // Handle both old and new request formats
    if (requestBody.state) {
      // New format: { presentationId, state }
      ({ presentationId, state } = requestBody)
    } else {
      // Old format: { presentationId, slides, messages, title, activeSlide }
      presentationId = requestBody.presentationId
      state = {
        slides: requestBody.slides,
        messages: requestBody.messages,
        title: requestBody.title,
        activeSlide: requestBody.activeSlide
      }
    }

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
    console.log('✅ User authenticated for save:', user.email, 'ID:', userId)

    // Get or create user's default workspace
    const workspace = await getOrCreateDefaultWorkspace(userId)
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'Failed to get workspace' },
        { status: 500 }
      )
    }

    console.log('📡 API: Saving presentation to Supabase:', {
      presentationId,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      userId,
      slidesCount: state?.slides?.length,
      messagesCount: state?.messages?.length,
      title: state?.title
    })

    if (!presentationId || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: presentationId, state' },
        { status: 400 }
      )
    }

    // Save to Supabase with UUID-based system
    const result = await savePresentation(
      presentationId, // Now a UUID string
      workspace.id,   // Workspace UUID
      state.title || `Untitled Presentation`,
      state.slides || [],
      state.messages || [],
      userId          // Required user ID
    )

    console.log('✅ API: Presentation saved successfully')

    return NextResponse.json({
      success: true,
      presentation: result,
      message: 'Presentation saved successfully'
    })

  } catch (error) {
    console.error('❌ API: Failed to save presentation:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to save presentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
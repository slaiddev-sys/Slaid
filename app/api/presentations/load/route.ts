import { NextRequest, NextResponse } from 'next/server'
import { loadPresentation } from '../../../../lib/database'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const presentationId = parseInt(searchParams.get('presentationId') || '0')
    const workspace = searchParams.get('workspace') || ''

    // Get user authentication (optional for backward compatibility)
    let userId: string | undefined
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    console.log('📡 API: Loading presentation from Supabase:', {
      presentationId,
      workspace,
      userId
    })

    if (!presentationId || !workspace) {
      return NextResponse.json(
        { error: 'Missing required parameters: presentationId, workspace' },
        { status: 400 }
      )
    }

    // Load from Supabase
    const presentation = await loadPresentation(presentationId, workspace, userId)
    
    console.log('📡 API: Load result:', {
      found: !!presentation,
      presentationTitle: presentation?.title,
      hasUserId: !!presentation?.user_id
    })

    if (!presentation) {
      console.log('📡 API: No presentation found')
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    console.log('✅ API: Presentation loaded successfully')

    return NextResponse.json({
      success: true,
      state: presentation,
      message: 'Presentation loaded successfully'
    })

  } catch (error) {
    console.error('❌ API: Failed to load presentation:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to load presentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
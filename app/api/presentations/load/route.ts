import { NextRequest, NextResponse } from 'next/server'
import { loadPresentation } from '../../../../lib/database-new'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const presentationId = searchParams.get('presentationId') || ''

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

    console.log('📡 API: Loading presentation from Supabase:', {
      presentationId,
      userId
    })

    if (!presentationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: presentationId' },
        { status: 400 }
      )
    }

    // Load from Supabase with UUID-based system
    const presentation = await loadPresentation(presentationId, userId)
    
    console.log('📡 API: Load result:', {
      found: !!presentation,
      presentationTitle: presentation?.title
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

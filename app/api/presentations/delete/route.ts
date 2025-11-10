import { NextRequest, NextResponse } from 'next/server'
import { deletePresentation } from '../../../../lib/database-new'
import { supabase } from '../../../../lib/supabase'

export async function DELETE(request: NextRequest) {
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

    console.log('📡 API: Deleting presentation from Supabase:', {
      presentationId,
      userId
    })

    if (!presentationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: presentationId' },
        { status: 400 }
      )
    }

    // Delete presentation (CASCADE will handle slides, blocks, messages)
    await deletePresentation(presentationId, userId)

    console.log('✅ API: Presentation deleted successfully from database')

    return NextResponse.json({
      success: true,
      message: 'Presentation deleted successfully'
    })

  } catch (error) {
    console.error('❌ API: Failed to delete presentation:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete presentation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

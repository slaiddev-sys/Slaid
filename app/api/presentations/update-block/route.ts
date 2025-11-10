import { NextRequest, NextResponse } from 'next/server'
import { updateBlockContent } from '../../../../lib/database-new'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { presentationId, slideIndex, blockIndex, props } = await request.json()

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

    console.log('📡 API: Updating block content:', {
      presentationId,
      slideIndex,
      blockIndex,
      propsKeys: Object.keys(props || {}),
      userId
    })

    if (!presentationId || typeof slideIndex !== 'number' || typeof blockIndex !== 'number' || !props) {
      return NextResponse.json(
        { error: 'Missing required fields: presentationId, slideIndex, blockIndex, props' },
        { status: 400 }
      )
    }

    // Update block in Supabase
    await updateBlockContent(presentationId, slideIndex, blockIndex, props, userId)

    console.log('✅ API: Block content updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Block updated successfully'
    })

  } catch (error) {
    console.error('❌ API: Failed to update block:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update block',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

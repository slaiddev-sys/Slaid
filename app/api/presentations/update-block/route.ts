import { NextRequest, NextResponse } from 'next/server'
import { updateBlockContent } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { presentationId, slideIndex, blockIndex, props } = await request.json()

    console.log('📡 API: Updating block content:', {
      presentationId,
      slideIndex,
      blockIndex,
      propsKeys: Object.keys(props || {})
    })

    if (typeof presentationId !== 'number' || typeof slideIndex !== 'number' || typeof blockIndex !== 'number' || !props) {
      return NextResponse.json(
        { error: 'Missing required fields: presentationId, slideIndex, blockIndex, props' },
        { status: 400 }
      )
    }

    // Update block in Supabase
    await updateBlockContent(presentationId, slideIndex, blockIndex, props)

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

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const presentationId = parseInt(searchParams.get('presentationId') || '0')
    const workspace = searchParams.get('workspace') || ''

    console.log('📡 API: Deleting presentation from Supabase:', {
      presentationId,
      workspace
    })

    if (!presentationId || !workspace) {
      return NextResponse.json(
        { error: 'Missing required parameters: presentationId, workspace' },
        { status: 400 }
      )
    }

    // First, get all slides for this presentation to delete their blocks
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('id')
      .eq('presentation_id', presentationId)

    if (slidesError) {
      console.error('❌ Failed to fetch slides for deletion:', slidesError)
      throw slidesError
    }

    // Delete blocks first (foreign key constraint)
    if (slides && slides.length > 0) {
      const slideIds = slides.map(s => s.id)
      const { error: blocksError } = await supabase
        .from('blocks')
        .delete()
        .in('slide_id', slideIds)

      if (blocksError) {
        console.error('❌ Failed to delete blocks:', blocksError)
        throw blocksError
      }
      console.log('✅ Deleted blocks for presentation')
    }

    // Delete slides
    const { error: slidesDeleteError } = await supabase
      .from('slides')
      .delete()
      .eq('presentation_id', presentationId)

    if (slidesDeleteError) {
      console.error('❌ Failed to delete slides:', slidesDeleteError)
      throw slidesDeleteError
    }
    console.log('✅ Deleted slides for presentation')

    // Delete messages
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('presentation_id', presentationId)

    if (messagesError) {
      console.error('❌ Failed to delete messages:', messagesError)
      throw messagesError
    }
    console.log('✅ Deleted messages for presentation')

    // Finally, delete the presentation itself
    const { error: presentationError } = await supabase
      .from('presentations')
      .delete()
      .eq('id', presentationId)
      .eq('workspace', workspace)

    if (presentationError) {
      console.error('❌ Failed to delete presentation:', presentationError)
      throw presentationError
    }

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

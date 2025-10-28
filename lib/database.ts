import { supabase } from './supabase'

// Save a complete presentation to the database
export async function savePresentation(
  presentationId: number,
  workspace: string,
  title: string,
  slides: any[],
  messages: any[],
  userId?: string
) {
  console.log('💾 Saving presentation to Supabase:', { 
    presentationId, 
    workspace, 
    title, 
    slidesCount: slides.length,
    userId: userId || 'NO_USER_ID',
    hasUserId: !!userId
  })

  try {
    // 1. Check if this presentation exists and needs user_id claiming
    let shouldClaimPresentation = false
    if (userId) {
      const { data: existingPresentation } = await supabase
        .from('presentations')
        .select('user_id')
        .eq('id', presentationId)
        .eq('workspace', workspace)
        .single()
      
      // If presentation exists but has no user_id, we should claim it
      if (existingPresentation && !existingPresentation.user_id) {
        shouldClaimPresentation = true
        console.log('🔄 Claiming existing presentation for user:', userId)
      }
    }

    // 2. Get workspace_id if user is authenticated
    let workspaceId: string | undefined
    if (userId) {
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', userId)
        .eq('name', workspace)
        .single()
      
      if (workspaceData) {
        workspaceId = workspaceData.id
        console.log('✅ Found workspace_id for user:', workspaceId)
      } else {
        console.log('⚠️ No workspace found for user:', userId, 'workspace:', workspace)
      }
    }

    // 3. Upsert presentation metadata
    const presentationData: any = {
      id: presentationId,
      title,
      workspace,
      updated_at: new Date().toISOString()
    }
    
    // Add user_id and workspace_id if available
    if (userId) {
      presentationData.user_id = userId
    }
    if (workspaceId) {
      presentationData.workspace_id = workspaceId
    }

    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .upsert(presentationData)
      .select()
      .single()

    if (presentationError) {
      console.error('❌ Failed to save presentation:', presentationError)
      throw presentationError
    }

    console.log('✅ Presentation metadata saved')

    // 2. Save messages
    if (messages && messages.length > 0) {
      // Delete existing messages for this presentation
      await supabase
        .from('messages')
        .delete()
        .eq('presentation_id', presentationId)

      // Insert new messages
      const messageInserts = messages.map((msg, index) => ({
        presentation_id: presentationId,
        role: msg.role || 'user',
        content: msg.text || msg.content || '',
        presentation_data: msg.presentationData ? {
          ...msg.presentationData,
          // Store version info in presentation_data for assistant messages
          ...(msg.role === 'assistant' && msg.version && { _version: msg.version }),
          ...(msg.role === 'assistant' && msg.userMessage && { _userMessage: msg.userMessage })
        } : null,
        created_at: new Date(Date.now() + index).toISOString() // Ensure order
      }))

      const { error: messagesError } = await supabase
        .from('messages')
        .insert(messageInserts)

      if (messagesError) {
        console.error('❌ Failed to save messages:', messagesError)
        throw messagesError
      }

      console.log('✅ Messages saved:', messages.length)
    }

    // 3. Save slides and blocks
    if (slides && slides.length > 0) {
      // Delete existing slides and blocks for this presentation
      const { data: existingSlides } = await supabase
        .from('slides')
        .select('id')
        .eq('presentation_id', presentationId)

      if (existingSlides && existingSlides.length > 0) {
        const slideIds = existingSlides.map(s => s.id)
        
        // Delete blocks first (foreign key constraint)
        await supabase
          .from('blocks')
          .delete()
          .in('slide_id', slideIds)

        // Then delete slides
        await supabase
          .from('slides')
          .delete()
          .eq('presentation_id', presentationId)
      }

      // Insert new slides
      const slideInserts = slides.map((slide, index) => ({
        presentation_id: presentationId,
        slide_index: index,
        slide_id: slide.id || `slide-${index + 1}`,
      }))

      const { data: savedSlides, error: slidesError } = await supabase
        .from('slides')
        .insert(slideInserts)
        .select()

      if (slidesError) {
        console.error('❌ Failed to save slides:', slidesError)
        throw slidesError
      }

      console.log('✅ Slides saved:', savedSlides.length)

      // Insert blocks for each slide
      const blockInserts: any[] = []
      
      slides.forEach((slide, slideIndex) => {
        const savedSlide = savedSlides[slideIndex]
        
        if (slide.blocks && savedSlide) {
          slide.blocks.forEach((block: any, blockIndex: number) => {
            blockInserts.push({
              slide_id: savedSlide.id,
              block_index: blockIndex,
              block_type: block.type || 'UnknownBlock',
              props: block.props || {}
            })
          })
        }
      })

      if (blockInserts.length > 0) {
        const { error: blocksError } = await supabase
          .from('blocks')
          .insert(blockInserts)

        if (blocksError) {
          console.error('❌ Failed to save blocks:', blocksError)
          throw blocksError
        }

        console.log('✅ Blocks saved:', blockInserts.length)
      }
    }

    console.log('🎉 Presentation saved successfully to Supabase')
    return presentation

  } catch (error) {
    console.error('❌ Failed to save presentation:', error)
    throw error
  }
}

// Load a complete presentation from the database
export async function loadPresentation(presentationId: number, workspace: string, userId?: string) {
  console.log('📥 Loading presentation from Supabase:', { presentationId, workspace })

  try {
    // 1. Load presentation metadata - try with user filter first, then without
    let presentation = null
    let presentationError = null

    if (userId) {
      // First try with user filter
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', presentationId)
        .eq('workspace', workspace)
        .eq('user_id', userId)
        .single()
      
      if (!error) {
        presentation = data
      } else if (error.code !== 'PGRST116') {
        // If it's not a "not found" error, throw it
        throw error
      }
    }

    // If no presentation found with user filter, try without user filter (backward compatibility)
    if (!presentation) {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', presentationId)
        .eq('workspace', workspace)
        .single()
      
      presentation = data
      presentationError = error
    }

    if (presentationError) {
      if (presentationError.code === 'PGRST116') {
        console.log('📥 No presentation found')
        return null
      }
      throw presentationError
    }

    if (!presentation) {
      console.log('📥 No presentation found')
      return null
    }

    console.log('✅ Presentation metadata loaded:', presentation.title)

    // 2. Load messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('presentation_id', presentationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Failed to load messages:', messagesError)
      throw messagesError
    }

    console.log('✅ Messages loaded:', messages?.length || 0)

    // 3. Load slides with blocks
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select(`
        *,
        blocks (*)
      `)
      .eq('presentation_id', presentationId)
      .order('slide_index', { ascending: true })

    if (slidesError) {
      console.error('❌ Failed to load slides:', slidesError)
      throw slidesError
    }

    console.log('✅ Slides loaded:', slides?.length || 0)

    // Transform slides to match the expected format
    const transformedSlides = slides?.map(slide => ({
      id: slide.slide_id,
      blocks: slide.blocks
        ?.sort((a: any, b: any) => a.block_index - b.block_index)
        .map((block: any) => ({
          type: block.block_type,
          props: block.props
        })) || []
    })) || []

    // Transform messages to match the expected format
    const transformedMessages = messages?.map(msg => ({
      role: msg.role,
      text: msg.content,
      content: msg.content,
      presentationData: msg.presentation_data ? {
        // Extract core presentation data
        title: msg.presentation_data.title,
        slides: msg.presentation_data.slides,
        // Remove internal version fields from presentationData
        ...Object.fromEntries(
          Object.entries(msg.presentation_data).filter(([key]) => 
            !key.startsWith('_') && key !== 'title' && key !== 'slides'
          )
        )
      } : undefined,
      // Extract version information from presentation_data
      ...(msg.presentation_data?._version && { version: msg.presentation_data._version }),
      ...(msg.presentation_data?._userMessage && { userMessage: msg.presentation_data._userMessage })
    })) || []

    const result = {
      id: presentation.id,
      title: presentation.title,
      workspace: presentation.workspace,
      slides: transformedSlides,
      messages: transformedMessages,
      lastModified: presentation.updated_at
    }

    console.log('🎉 Presentation loaded successfully from Supabase')
    return result

  } catch (error) {
    console.error('❌ Failed to load presentation:', error)
    throw error
  }
}

// Update a specific block's content (for real-time autosave)
export async function updateBlockContent(
  presentationId: number,
  slideIndex: number,
  blockIndex: number,
  newProps: Record<string, any>
) {
  console.log('🔄 Updating block content:', { presentationId, slideIndex, blockIndex, newProps })

  try {
    // Find the slide
    const { data: slide, error: slideError } = await supabase
      .from('slides')
      .select('id')
      .eq('presentation_id', presentationId)
      .eq('slide_index', slideIndex)
      .single()

    if (slideError) {
      console.error('❌ Failed to find slide:', slideError)
      throw slideError
    }

    // Update the block
    const { error: blockError } = await supabase
      .from('blocks')
      .update({
        props: newProps,
        updated_at: new Date().toISOString()
      })
      .eq('slide_id', slide.id)
      .eq('block_index', blockIndex)

    if (blockError) {
      console.error('❌ Failed to update block:', blockError)
      throw blockError
    }

    // Update presentation timestamp
    await supabase
      .from('presentations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', presentationId)

    console.log('✅ Block content updated successfully')

  } catch (error) {
    console.error('❌ Failed to update block content:', error)
    throw error
  }
}

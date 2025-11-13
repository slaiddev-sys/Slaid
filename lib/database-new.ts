import { supabase } from './supabase'

// ============================================
// SAVE PRESENTATION
// ============================================
export async function savePresentation(
  presentationId: string, // Now UUID string instead of number
  workspaceId: string, // Workspace UUID
  title: string,
  slides: any[],
  messages: any[],
  userId: string // Required - user must be authenticated
) {
  console.log('💾 Saving presentation to Supabase:', { 
    presentationId, 
    workspaceId, 
    title, 
    slidesCount: slides.length,
    messagesCount: messages.length,
    userId
  })

  try {
    // 1. Upsert presentation metadata
    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .upsert({
        id: presentationId,
        title,
        workspace_id: workspaceId,
        user_id: userId,
        updated_at: new Date().toISOString()
      })
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
      // Delete existing slides (blocks will cascade delete)
      await supabase
        .from('slides')
        .delete()
        .eq('presentation_id', presentationId)

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

// ============================================
// LOAD PRESENTATION
// ============================================
export async function loadPresentation(
  presentationId: string, // UUID string
  userId: string // Required - user must be authenticated
) {
  console.log('📥 Loading presentation from Supabase:', { presentationId, userId })

  try {
    // 1. Load presentation metadata
    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', presentationId)
      .eq('user_id', userId)
      .single()

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
        title: msg.presentation_data.title,
        slides: msg.presentation_data.slides,
        ...Object.fromEntries(
          Object.entries(msg.presentation_data).filter(([key]) => 
            !key.startsWith('_') && key !== 'title' && key !== 'slides'
          )
        )
      } : undefined,
      ...(msg.presentation_data?._version && { version: msg.presentation_data._version }),
      ...(msg.presentation_data?._userMessage && { userMessage: msg.presentation_data._userMessage })
    })) || []

    const result = {
      id: presentation.id,
      title: presentation.title,
      workspaceId: presentation.workspace_id,
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

// ============================================
// LOAD ALL PRESENTATIONS FOR A WORKSPACE
// ============================================
export async function loadWorkspacePresentations(
  workspaceId: string,
  userId: string
) {
  console.log('📥 Loading workspace presentations:', { workspaceId, userId })

  try {
    const { data: presentations, error } = await supabase
      .from('presentations')
      .select('id, title, created_at, updated_at')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to load presentations:', error)
      throw error
    }

    console.log('✅ Loaded presentations:', presentations?.length || 0)
    return presentations || []

  } catch (error) {
    console.error('❌ Failed to load workspace presentations:', error)
    throw error
  }
}

// ============================================
// DELETE PRESENTATION
// ============================================
export async function deletePresentation(
  presentationId: string,
  userId: string
) {
  console.log('🗑️ Deleting presentation:', { presentationId, userId })

  try {
    // Cascading delete will handle slides, blocks, and messages automatically
    const { error } = await supabase
      .from('presentations')
      .delete()
      .eq('id', presentationId)
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Failed to delete presentation:', error)
      throw error
    }

    console.log('✅ Presentation deleted successfully')

  } catch (error) {
    console.error('❌ Failed to delete presentation:', error)
    throw error
  }
}

// ============================================
// UPDATE BLOCK CONTENT (for real-time autosave)
// ============================================
export async function updateBlockContent(
  presentationId: string,
  slideIndex: number,
  blockIndex: number,
  newProps: Record<string, any>,
  userId: string
) {
  console.log('🔄 Updating block content:', { presentationId, slideIndex, blockIndex })

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
      .eq('user_id', userId)

    console.log('✅ Block content updated successfully')

  } catch (error) {
    console.error('❌ Failed to update block content:', error)
    throw error
  }
}

// ============================================
// GET OR CREATE DEFAULT WORKSPACE
// ============================================
export async function getOrCreateDefaultWorkspace(userId: string) {
  console.log('📁 Getting or creating default workspace for user:', userId)

  try {
    // Try to get user's first workspace
    const { data: workspaces, error: fetchError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)

    if (fetchError) {
      console.error('❌ Failed to fetch workspaces:', fetchError)
      throw fetchError
    }

    if (workspaces && workspaces.length > 0) {
      console.log('✅ Found existing workspace:', workspaces[0].name)
      return workspaces[0]
    }

    // Create default workspace if none exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const workspaceName = profile?.full_name 
      ? `${profile.full_name}'s Workspace` 
      : 'My Workspace'

    const { data: newWorkspace, error: createError } = await supabase
      .from('workspaces')
      .insert({
        name: workspaceName,
        user_id: userId
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create workspace:', createError)
      throw createError
    }

    console.log('✅ Created new workspace:', newWorkspace.name)
    return newWorkspace

  } catch (error) {
    console.error('❌ Failed to get or create workspace:', error)
    throw error
  }
}



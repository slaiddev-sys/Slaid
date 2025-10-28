import { NextRequest, NextResponse } from 'next/server'
import { savePresentation } from '../../../../lib/database'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('📡 API: Raw request body:', requestBody)
    
    let presentationId, workspace, state
    
    // Handle both old and new request formats
    if (requestBody.state) {
      // New format: { presentationId, workspace, state }
      ({ presentationId, workspace, state } = requestBody)
    } else {
      // Old format: { presentationId, workspace, slides, messages, title, activeSlide }
      presentationId = requestBody.presentationId
      workspace = requestBody.workspace
      state = {
        slides: requestBody.slides,
        messages: requestBody.messages,
        title: requestBody.title,
        activeSlide: requestBody.activeSlide
      }
    }

    // Get user authentication (REQUIRED for new presentations)
    let userId: string | undefined
    const authHeader = request.headers.get('authorization')
    
    console.log('🔐 AUTH CHECK: Processing save request', {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer format' : 'Invalid format') : 'None',
      authHeaderLength: authHeader?.length || 0
    })
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          userId = user.id
          console.log('✅ User authenticated for save:', user.email, 'ID:', userId)
        } else {
          console.log('⚠️ Auth header present but user not found:', authError?.message)
        }
      } catch (error) {
        console.log('⚠️ Error verifying auth token:', error)
      }
    } else {
      console.log('⚠️ No valid auth header found')
      
      // 🚨 CRITICAL: For new presentations, require authentication
      // Only allow saving without auth for existing presentations (backward compatibility)
      const { data: existingPresentation } = await supabase
        .from('presentations')
        .select('id')
        .eq('id', presentationId)
        .single()
      
      if (!existingPresentation) {
        console.error('🚨 BLOCKING: New presentation creation without authentication')
        return NextResponse.json(
          { error: 'Authentication required for new presentations' },
          { status: 401 }
        )
      } else {
        console.log('⚠️ Allowing save for existing presentation without auth (backward compatibility)')
      }
    }

    console.log('📡 API: Saving presentation to Supabase:', {
      presentationId,
      workspace,
      userId,
      slidesCount: state?.slides?.length,
      messagesCount: state?.messages?.length,
      hasAuth: !!userId,
      title: state?.title,
      authHeaderPresent: !!authHeader,
      authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer format' : 'Invalid format') : 'None'
    })

    // 🚨 CRITICAL DEBUG: Log when presentations are saved without user_id
    if (!userId) {
      console.error('🚨 CRITICAL: Presentation being saved WITHOUT user_id!', {
        presentationId,
        workspace,
        title: state?.title,
        authHeaderPresent: !!authHeader,
        authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer format' : 'Invalid format') : 'None'
      })
      
      // 🔧 TEMPORARY FIX: For now, allow saving without user_id but log it
      console.log('⚠️ ALLOWING save without user_id for backward compatibility')
    } else {
      console.log('✅ Presentation being saved WITH user_id:', userId)
    }

    if (!presentationId || !workspace || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: presentationId, workspace, state' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const result = await savePresentation(
      presentationId,
      workspace,
      state.title || `Presentation ${presentationId}`,
      state.slides || [],
      state.messages || [],
      userId
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
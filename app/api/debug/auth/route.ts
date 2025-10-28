import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking authentication status')

    // Get user authentication
    let userId: string | undefined
    let authError: string | undefined
    const authHeader = request.headers.get('authorization')
    
    console.log('🔍 DEBUG: Auth header present:', !!authHeader)
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      console.log('🔍 DEBUG: Token length:', token.length)
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (!error && user) {
          userId = user.id
          console.log('✅ DEBUG: User authenticated:', user.email)
        } else {
          authError = error?.message || 'User not found'
          console.log('⚠️ DEBUG: Auth failed:', authError)
        }
      } catch (error) {
        authError = error instanceof Error ? error.message : 'Unknown auth error'
        console.log('⚠️ DEBUG: Auth exception:', authError)
      }
    } else {
      authError = 'No auth header provided'
      console.log('⚠️ DEBUG: No auth header')
    }

    return NextResponse.json({
      success: true,
      authenticated: !!userId,
      userId: userId || null,
      authError: authError || null,
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer format' : 'Invalid format') : 'None'
    })

  } catch (error) {
    console.error('❌ DEBUG: Error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

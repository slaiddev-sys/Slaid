import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking session from client')

    // This endpoint will be called from the client side to check session
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'No valid auth header',
        hasAuthHeader: !!authHeader,
        authHeaderFormat: authHeader ? 'Invalid format' : 'None'
      })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: error?.message || 'User not found',
        tokenLength: token.length
      })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId: user.id,
      userEmail: user.email,
      tokenLength: token.length,
      userCreatedAt: user.created_at
    })

  } catch (error) {
    console.error('❌ DEBUG: Session check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Session check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

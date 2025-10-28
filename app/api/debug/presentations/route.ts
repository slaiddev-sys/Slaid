import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking all presentations in database')

    // Get all presentations (no filters)
    const { data: allPresentations, error } = await supabase
      .from('presentations')
      .select('id, title, workspace, user_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20) // Limit to recent 20

    if (error) {
      console.error('❌ DEBUG: Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('🔍 DEBUG: Found presentations:', allPresentations?.length || 0)
    
    // Group by workspace and user_id
    const grouped = allPresentations?.reduce((acc: any, p) => {
      const key = `${p.workspace}|${p.user_id || 'NULL'}`
      if (!acc[key]) acc[key] = []
      acc[key].push({
        id: p.id,
        title: p.title,
        updated_at: p.updated_at
      })
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      total: allPresentations?.length || 0,
      presentations: allPresentations || [],
      groupedByWorkspaceAndUser: grouped,
      message: 'Debug data retrieved'
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

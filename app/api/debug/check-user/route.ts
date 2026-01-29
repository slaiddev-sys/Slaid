import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: credits, error: creditError } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const { data: transactions, error: transError } = await supabaseAdmin
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    return NextResponse.json({ user, credits, transactions })
}

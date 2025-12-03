import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }
    
    console.log('🔍 Admin: Checking user:', email);
    
    // Get auth header for service role access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Query profiles table to find user by email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();
    
    if (profileError) {
      console.error('❌ Error finding profile:', profileError);
      return NextResponse.json({ 
        error: 'User not found',
        details: profileError 
      }, { status: 404 });
    }
    
    console.log('✅ Profile found:', profileData);
    
    // Get credits data
    const { data: creditsData, error: creditsError } = await supabase
      .rpc('get_user_credits', { p_user_id: profileData.id });
    
    if (creditsError) {
      console.error('❌ Error fetching credits:', creditsError);
      
      // Try direct query
      const { data: directData, error: directError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', profileData.id)
        .single();
      
      return NextResponse.json({
        user: profileData,
        credits: directData || null,
        error: creditsError.message,
        directQueryError: directError?.message
      });
    }
    
    return NextResponse.json({
      user: profileData,
      credits: creditsData && creditsData.length > 0 ? creditsData[0] : null
    });
    
  } catch (error) {
    console.error('❌ Error in admin check:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}


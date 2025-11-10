import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminConfigured } from '../../../../lib/supabase-admin';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// to renew credits for all users on a monthly basis
// 
// For security, you should add an authorization header with a secret token
// Example: Authorization: Bearer YOUR_SECRET_TOKEN

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-token-here';
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting monthly credit renewal process...');

    // Check if admin client is configured
    if (!isAdminConfigured()) {
      console.error('❌ Supabase admin client not configured');
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    // Call the database function to renew credits
    const { data, error } = await supabaseAdmin
      .rpc('check_and_renew_credits');

    if (error) {
      console.error('❌ Failed to renew credits:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Credit renewal completed:', data);

    return NextResponse.json({
      success: true,
      renewed_count: data.renewed_count,
      timestamp: data.timestamp
    });

  } catch (error) {
    console.error('❌ Credit renewal cron error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Also support GET for easier testing (remove in production)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'GET not allowed in production' }, { status: 403 });
  }

  return POST(request);
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client only if keys are available
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, return error
    if (!supabase) {
      console.error('❌ SUPABASE NOT CONFIGURED! Missing environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        email: email
      });
      return NextResponse.json(
        { error: 'Database not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered for waitlist' },
        { status: 409 }
      );
    }

    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: email.toLowerCase() }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    console.log('✅ WAITLIST SIGNUP SUCCESSFUL - SAVED TO DATABASE:', {
      email: email,
      supabaseConfigured: true,
      insertedData: data
    });

    return NextResponse.json(
      { 
        message: 'Successfully joined waitlist!',
        email: email.toLowerCase()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

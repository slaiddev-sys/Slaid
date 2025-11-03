import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: 'Welcome to Slaid Waitlist! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #002903; text-align: center;">Welcome to Slaid!</h1>
            <p>Hi there!</p>
            <p>Thanks for joining our waitlist! You're now part of an exclusive group who will be the first to experience Slaid when we launch on <strong>November 9th, 2025</strong>.</p>
            <p>🚀 <strong>What's coming:</strong></p>
            <ul>
              <li>Convert Excel files to professional presentations</li>
              <li>AI-powered storytelling and design</li>
              <li>Beautiful, ready-to-present slides in seconds</li>
            </ul>
            <p>We'll keep you updated on our progress and let you know as soon as we're ready to launch!</p>
            <p>Best regards,<br>The Slaid Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              You're receiving this because you signed up for the Slaid waitlist at slaidapp.com
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails, user is still added to waitlist
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: 'New Waitlist Signup - Slaid',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Waitlist Signup</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Signed up at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total signups:</strong> Check your Supabase dashboard for current count</p>
          </div>
        `,
      });
    } catch (adminEmailError) {
      console.error('Admin email error:', adminEmailError);
    }

    return NextResponse.json(
      { 
        message: 'Successfully joined waitlist!',
        email: data.email 
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

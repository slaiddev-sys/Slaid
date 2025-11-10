import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan_type: 'free' | 'pro'
  credits: number
  created_at: string
  updated_at: string
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      throw new Error('Supabase is not configured. Please set up your Supabase project first.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        }
      }
    })

    if (error) throw error
    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      throw new Error('Supabase is not configured. Please set up your Supabase project first.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      throw new Error('Supabase is not configured. Please set up your Supabase project first.')
    }

    console.log('🔐 Starting Google OAuth flow...');
    console.log('🔐 Current origin:', window.location.origin);
    
    // Use localhost for development, otherwise use the current origin
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectOrigin = isLocalhost ? 'http://localhost:3000' : window.location.origin;
    const redirectUrl = `${redirectOrigin}/auth/callback`;
    
    console.log('🔐 Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    }
    
    console.log('✅ Google OAuth initiated successfully');
    return { error: null }
  } catch (error: any) {
    console.error('❌ Google OAuth failed:', error);
    return { error: error.message }
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { profile: data, error: null }
  } catch (error: any) {
    return { profile: null, error: error.message }
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

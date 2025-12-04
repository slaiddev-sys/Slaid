"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { signOut as authSignOut } from '../lib/auth';

// Simple profile interface that works with auth metadata
interface Profile {
  full_name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setProfile(null);
      } else if (session) {
        setUser(session.user);
        // Create profile from user metadata
        setProfile({
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          email: session.user.email || ''
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        
        if (session) {
          setUser(session.user);
          // Create profile from user metadata
          setProfile({
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            email: session.user.email || ''
          });
        } else {
          console.log('🔐 No session - clearing user state');
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

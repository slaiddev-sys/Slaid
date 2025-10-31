"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface GoogleAuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  user: any;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  }
  return context;
};

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        initializeGoogleAuth();
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleAuth = () => {
    if (!window.google) return;

    // Initialize Google OAuth
    window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      scope: 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive.file',
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setIsAuthenticated(true);
          
          // Get user info
          fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
            .then(res => res.json())
            .then(userInfo => {
              setUser(userInfo);
            })
            .catch(console.error);
        }
      },
    });
  };

  const signIn = async () => {
    if (!window.google) {
      throw new Error('Google Identity Services not loaded');
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.access_token) {
              setAccessToken(response.access_token);
              setIsAuthenticated(true);
              
              // Get user info
              fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
                .then(res => res.json())
                .then(userInfo => {
                  setUser(userInfo);
                  resolve();
                })
                .catch(reject);
            } else {
              reject(new Error('Failed to get access token'));
            }
          },
          error_callback: (error: any) => {
            reject(new Error(error.message || 'Authentication failed'));
          }
        });

        client.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  };

  const signOut = () => {
    if (accessToken && window.google) {
      window.google.accounts.oauth2.revoke(accessToken);
    }
    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
  };

  const value: GoogleAuthContextType = {
    isAuthenticated,
    accessToken,
    signIn,
    signOut,
    user
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

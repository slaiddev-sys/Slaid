"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "../../lib/auth";
import SupabaseSetupNotice from "../../components/SupabaseSetupNotice";

const imgLogo41 = "/slaid logo verde.png";
const imgBackground = "http://localhost:3845/assets/c8cea87b5bbb736c60e6d80d56ee2ee70dd81613.png";

function TypewriterPlaceholder() {
  const phrases = [
    "Build a forecast presentation with this spreadsheet.",
    "Create a data room from this financial data.",
    "Make a performance review for the marketing team.",
    "Turn this into a client report with insights.",
    "Summarize this sales report in 5 slides.",
  ];
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    const phrase = phrases[index];
    if (typing) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => {
          setDisplayed(phrase.slice(0, displayed.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setTyping(false), 1500);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(phrase.slice(0, displayed.length - 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          setIndex((index + 1) % phrases.length);
          setTyping(true);
        }, 200);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, index]);

  return displayed;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  // Check for error messages from URL params
  useEffect(() => {
    if (!searchParams) return;
    
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    const retryOAuth = searchParams.get('retry_oauth');
    
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please check your Supabase configuration and try again.');
    } else if (errorParam === 'unexpected') {
      setError('An unexpected error occurred during authentication. Please try again.');
    } else if (errorParam === 'auth_timeout') {
      setError('Authentication timed out. This may happen with new accounts. Please try again.');
    } else if (messageParam === 'account_deleted') {
      setSuccess('Your account data has been successfully deleted and you have been signed out.');
    }
    
    // Handle OAuth retry after database trigger bypass (legacy - should not be needed anymore)
    if (retryOAuth === 'true') {
      console.log('🔄 OAuth retry detected (legacy), but database trigger is now fixed');
      setSuccess('Database issue resolved. Please try signing in again.');
      // Don't auto-trigger - let user manually retry
    }
    
    // Clear URL parameters after showing the message
    if (errorParam || messageParam || retryOAuth) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await signInWithGoogle();
    
    if (error) {
      setError(error);
      setLoading(false);
    }
    // If successful, user will be redirected by OAuth flow
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left column: Login form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 py-8 lg:pb-12 min-h-screen">
        <div className="mx-auto w-full max-w-sm">
          {/* Slaid Logo */}
          <div className="mb-8 lg:mb-10 flex items-center gap-2">
            <button 
              onClick={() => window.location.href = '/'}
              className="hover:opacity-80 transition-opacity"
            >
              <img src={imgLogo41} alt="Slaid logo" className="h-10 sm:h-12 w-auto" />
            </button>
          </div>
          {/* Heading */}
          <h1 className="text-lg sm:text-xl font-medium font-sans mb-6" style={{ color: '#002903' }}>Log in to your account</h1>
          
          {/* Supabase Setup Notice */}
          {!isSupabaseConfigured && <SupabaseSetupNotice />}
          
          {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}
          
          {/* Google button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border text-sm sm:text-base font-medium font-sans rounded-md py-3 sm:py-3.5 bg-transparent hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{ borderColor: '#002903', color: '#002903' }}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18"><g><path fill="#4285F4" d="M17.64 9.2045c0-.638-.057-1.252-.163-1.84H9v3.481h4.844a4.137 4.137 0 0 1-1.797 2.717v2.26h2.908c1.703-1.57 2.685-3.885 2.685-6.618z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.805 5.96-2.18l-2.908-2.26c-.807.54-1.84.86-3.052.86-2.348 0-4.337-1.587-5.05-3.724H.96v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.95 10.856A5.41 5.41 0 0 1 3.5 9c0-.644.11-1.272.304-1.856V4.812H.96A8.997 8.997 0 0 0 0 9c0 1.418.34 2.76.96 3.944l2.99-2.088z"/><path fill="#EA4335" d="M9 3.579c1.32 0 2.5.454 3.43 1.346l2.572-2.572C13.47.805 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.812l2.99 2.332C4.663 5.166 6.652 3.579 9 3.579z"/></g></svg>
            </span>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
        {/* Sign up link */}
        <div className="text-center text-sm font-sans mt-6 lg:mt-8" style={{ color: '#002903' }}>
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold underline" style={{ color: '#002903' }}>Sign up</Link>
        </div>
      </div>
      {/* Right column: Visual representation - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 relative min-h-screen items-center justify-center overflow-hidden">
        {/* Figma background image below gradient */}
        <div className="absolute inset-0 [background-size:2006.59px_1200px] bg-repeat bg-top-left mix-blend-overlay opacity-60" style={{ backgroundImage: `url('${imgBackground}')` }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#002903] via-[#004505] to-[#001a02]" />
        {/* Blurred green circles */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#005406' }} />
        <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full blur-3xl opacity-25" style={{ backgroundColor: '#005406' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#005406' }} />
        {/* Centered input box visual */}
        <div className="relative z-10 flex items-center justify-center w-full h-full px-8">
          <div className="bg-white rounded-lg shadow-lg px-6 py-3 flex items-center min-w-[220px] w-full max-w-md">
            <input
              className="flex-1 bg-transparent outline-none border-none text-black placeholder-black text-sm font-sans"
              placeholder={TypewriterPlaceholder()}
              disabled
            />
            <button className="ml-2 rounded-full w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#002903' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
} 
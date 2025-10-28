"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔐 ProtectedRoute: Auth state check', { 
      loading, 
      hasUser: !!user, 
      userEmail: user?.email,
      userId: user?.id 
    });
    
    if (!loading && !user) {
      console.log('🔐 ProtectedRoute: Redirecting to login - no user found');
      router.push(redirectTo);
    } else if (!loading && user) {
      console.log('🔐 ProtectedRoute: User authenticated, allowing access', user.email);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

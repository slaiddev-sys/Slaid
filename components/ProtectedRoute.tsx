"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useCredits } from './hooks/useCredits';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requirePaidPlan?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  requirePaidPlan = true
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth to load
      if (authLoading) {
        console.log('🔐 ProtectedRoute: Waiting for auth...');
        return;
      }

      // Check if user is authenticated
      if (!user) {
        console.log('🔐 ProtectedRoute: No user - redirecting to', redirectTo);
        router.push(redirectTo);
        return;
      }

      // If paid plan is required, check for it
      if (requirePaidPlan) {
        // Wait for credits to load
        if (creditsLoading) {
          console.log('🔐 ProtectedRoute: Waiting for credits...');
          return;
        }

        // EXPLICIT check: only basic, pro, ultra are paid plans
        const hasPaidPlan = credits?.plan_type && 
          ['basic', 'pro', 'ultra'].includes(credits.plan_type.toLowerCase());

        console.log('🔐 ProtectedRoute: Plan check', {
          plan_type: credits?.plan_type,
          hasPaidPlan,
          requirePaidPlan
        });

        if (!hasPaidPlan) {
          console.log('🔐 ProtectedRoute: No paid plan - redirecting to /pricing');
          router.push('/pricing');
          return;
        }
      }

      // All checks passed
      console.log('🔐 ProtectedRoute: Access granted');
      setIsChecking(false);
    };

    checkAccess();
  }, [user, authLoading, credits, creditsLoading, requirePaidPlan, router, redirectTo]);

  // Show loading state while checking
  if (isChecking || authLoading || (requirePaidPlan && creditsLoading)) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

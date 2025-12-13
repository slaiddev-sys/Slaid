"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useCredits } from './hooks/useCredits';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requirePaidPlan?: boolean;
}

// Check if user just purchased (within last 5 minutes)
const hasRecentPurchase = (): boolean => {
  if (typeof window === 'undefined') return false;
  const purchaseTime = localStorage.getItem('slaid_just_purchased');
  if (!purchaseTime) return false;
  
  const timeSincePurchase = Date.now() - parseInt(purchaseTime);
  const fiveMinutes = 5 * 60 * 1000;
  
  console.log('🛒 ProtectedRoute: Checking recent purchase', {
    purchaseTime: new Date(parseInt(purchaseTime)).toISOString(),
    timeSincePurchase: Math.round(timeSincePurchase / 1000) + 's',
    isRecent: timeSincePurchase < fiveMinutes
  });
  
  return timeSincePurchase < fiveMinutes;
};

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
      // FIRST: Check for recent purchase - bypasses ALL other checks
      if (hasRecentPurchase()) {
        console.log('🛒 ProtectedRoute: Recent purchase detected - GRANTING ACCESS');
        setIsChecking(false);
        return; // Grant access immediately
      }

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

        // Check plan from credits hook first
        let hasPaidPlan = false;
        if (credits?.plan_type) {
          const planType = credits.plan_type.toLowerCase().trim();
          hasPaidPlan = ['basic', 'pro', 'ultra'].includes(planType);
          
          console.log('🔐 ProtectedRoute: Plan check from credits hook', {
            raw_plan_type: credits.plan_type,
            normalized_plan_type: planType,
            hasPaidPlan,
            isBasic: planType === 'basic',
            isPro: planType === 'pro',
            isUltra: planType === 'ultra'
          });
        }

        // If credits hook doesn't have plan, check directly from database
        if (!hasPaidPlan && user) {
          console.log('🔐 ProtectedRoute: Credits hook has no plan, checking database directly...');
          try {
            const { data: dbCredits, error: dbError } = await supabase
              .from('user_credits')
              .select('plan_type')
              .eq('user_id', user.id)
              .single();
            
            if (!dbError && dbCredits?.plan_type) {
              const dbPlanType = dbCredits.plan_type.toLowerCase().trim();
              hasPaidPlan = ['basic', 'pro', 'ultra'].includes(dbPlanType);
              
              console.log('🔐 ProtectedRoute: Database plan check', {
                raw_plan_type: dbCredits.plan_type,
                normalized_plan_type: dbPlanType,
                hasPaidPlan,
                isBasic: dbPlanType === 'basic',
                isPro: dbPlanType === 'pro',
                isUltra: dbPlanType === 'ultra'
              });
            } else {
              console.log('🔐 ProtectedRoute: Database check result', {
                error: dbError?.message,
                hasData: !!dbCredits,
                plan_type: dbCredits?.plan_type
              });
            }
          } catch (dbErr) {
            console.error('🔐 ProtectedRoute: Error checking database', dbErr);
          }
        }

        if (!hasPaidPlan) {
          console.log('🔐 ProtectedRoute: No paid plan found - redirecting to /pricing');
          router.push('/pricing');
          return;
        }
        
        console.log('🔐 ProtectedRoute: Paid plan confirmed - access granted');
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

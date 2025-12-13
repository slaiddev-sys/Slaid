"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCredits } from "../../components/hooks/useCredits";
import { useAuth } from "../../components/AuthProvider";
import { supabase } from "../../lib/supabase";

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [attempts, setAttempts] = useState(0);
  const [sessionChecked, setSessionChecked] = useState(false);

  // First effect: Try to restore session when returning from Polar
  useEffect(() => {
    const restoreSession = async () => {
      console.log('🔐 Attempting to restore session after Polar checkout...');
      
      try {
        // Try to get existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ Session found:', session.user.email);
        } else {
          console.log('⚠️ No session found, trying to refresh...');
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshData.session) {
            console.log('✅ Session refreshed:', refreshData.session.user.email);
          } else {
            console.log('❌ Could not refresh session:', refreshError?.message);
          }
        }
      } catch (err) {
        console.error('❌ Error restoring session:', err);
      }
      
      setSessionChecked(true);
    };
    
    restoreSession();
  }, []);

  useEffect(() => {
    // Wait for session check to complete
    if (!sessionChecked) {
      console.log('⏳ Waiting for session check...');
      return;
    }

    // CRITICAL: Mark that user just purchased - this gives temporary access
    console.log('🛒 Purchase success page loaded - marking purchase in localStorage');
    localStorage.setItem('slaid_just_purchased', Date.now().toString());
    localStorage.setItem('slaid_purchase_pending', 'true');

    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }

    // If no user after everything, redirect to login with a flag
    // After login, they'll be redirected to editor with temp access
    if (!user) {
      console.log('⚠️ No user found after session restore. User needs to login.');
      console.log('🛒 Purchase flag saved - user will get access after login');
      setStatus('success');
      setTimeout(() => {
        // Redirect to login - after login, the purchase flag in localStorage will grant access
        router.push('/login?from_purchase=true');
      }, 2000);
      return;
    }
    
    console.log('✅ User found:', user.email);

    let currentAttempt = 0;
    let timeoutId: NodeJS.Timeout | undefined;
    
    const checkPlanUpdated = async () => {
      try {
        currentAttempt++;
        console.log(`🔍 Attempt ${currentAttempt}/20: Checking if plan was updated...`);
        setAttempts(currentAttempt);
        setStatus('loading');
        
        // Directly check the database for plan_type
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('plan_type, total_credits')
          .eq('user_id', user.id)
          .single();

        if (creditsError) {
          console.error('❌ Error fetching credits:', creditsError);
          throw creditsError;
        }

        console.log('📊 Current plan status:', {
          plan_type: creditsData?.plan_type,
          total_credits: creditsData?.total_credits,
          hasPaidPlan: creditsData?.plan_type && ['basic', 'pro', 'ultra'].includes(creditsData.plan_type.toLowerCase()),
          attempt: currentAttempt
        });

        const hasPaidPlan = creditsData?.plan_type && 
          ['basic', 'pro', 'ultra'].includes(creditsData.plan_type.toLowerCase());

        if (hasPaidPlan) {
          // Plan updated successfully!
          console.log('✅ Paid plan detected! Clearing pending flag and redirecting...');
          localStorage.removeItem('slaid_purchase_pending');
          setStatus('success');
          
          // Refresh credits hook to sync state
          await refreshCredits();
          
          // Redirect to editor after 1 second
          setTimeout(() => {
            console.log('🚀 Redirecting to editor');
            router.push('/editor?from_purchase=true');
          }, 1000);
          return; // Stop checking
        } else {
          // Plan not updated yet, retry
          console.log(`⏳ Plan not updated yet (current: ${creditsData?.plan_type}). Retrying in 2s...`);
          
          if (currentAttempt < 20) {
            // Retry up to 20 times (40 seconds total)
            timeoutId = setTimeout(checkPlanUpdated, 2000);
          } else {
            console.log('⏳ Max attempts reached - redirecting to editor anyway (purchase pending)');
            setStatus('success');
            // Keep purchase_pending flag - editor will check later
            setTimeout(() => {
              router.push('/editor?from_purchase=true');
            }, 1000);
          }
        }
        
      } catch (error) {
        console.error('❌ Error checking plan:', error);
        
        // Retry if we haven't exceeded attempts
        if (currentAttempt < 20) {
          timeoutId = setTimeout(checkPlanUpdated, 2000);
        } else {
          setStatus('success');
          // Redirect to editor - purchase is pending
          setTimeout(() => {
            router.push('/editor?from_purchase=true');
          }, 1000);
        }
      }
    };

    // Start checking after 2 second delay (give webhook time to process)
    timeoutId = setTimeout(checkPlanUpdated, 2000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user?.id, router, refreshCredits, sessionChecked, authLoading]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-6" style={{ borderColor: '#002903' }}></div>
            <h1 className="text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
              Processing Your Purchase
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase! We're updating your account...
            </p>
            <p className="text-sm text-gray-500">
              This usually takes just a few seconds
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
              Purchase Successful!
            </h1>
            <p className="text-gray-600 mb-4">
              Your credits and plan have been updated successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to editor...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-3" style={{ color: '#002903' }}>
              Purchase Received
            </h1>
            <p className="text-gray-600 mb-4">
              Your purchase was successful, but it's taking a bit longer to process. Your credits will be available shortly.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to editor...
            </p>
          </>
        )}
      </div>
    </div>
  );
}


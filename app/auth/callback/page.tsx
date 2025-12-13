"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

// Function to ensure user has profile and workspace
async function ensureUserProfileAndWorkspace(user: any) {
  try {
    console.log('🔧 Ensuring profile and workspace for user:', user.email);
    console.log('🔧 User object:', JSON.stringify(user, null, 2));
    
    // Wait a bit for database triggers to complete (if they exist)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if profile exists
    console.log('🔍 Checking if profile exists...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single();
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileCheckError);
      console.error('Profile check error details:', JSON.stringify(profileCheckError, null, 2));
    }
    
    // Create profile if it doesn't exist
    if (!existingProfile) {
      console.log('📝 Creating profile for user:', user.email);
      
      // Start with minimal required data
      const baseProfileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      };
      
      console.log('📝 Base profile data:', JSON.stringify(baseProfileData, null, 2));
      
      // Try to create profile with minimal data first
      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .insert(baseProfileData)
        .select();
      
      if (profileError) {
        console.error('❌ Error creating profile with minimal data:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        
        // Try upsert with minimal data
        console.log('🔄 Trying upsert approach with minimal data...');
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(baseProfileData, { onConflict: 'id' });
        
        if (upsertError) {
          console.error('❌ Upsert also failed:', upsertError);
          console.log('⚠️  Profile creation failed, but user can still use the app');
        } else {
          console.log('✅ Profile created via upsert with minimal data');
        }
      } else {
        console.log('✅ Profile created successfully:', insertedProfile);
        
        // Profile created - no initial credits assigned (user must select a plan)
        console.log('✅ Profile created - user must select a plan to get credits');
      }
    } else {
      console.log('✅ Profile already exists:', existingProfile);
      console.log('✅ Existing user will be redirected to editor');
    }
    
    // Check if workspace exists
    console.log('🔍 Checking if workspace exists...');
    const { data: existingWorkspace, error: workspaceCheckError } = await supabase
      .from('workspaces')
      .select('id, name')
      .eq('user_id', user.id)
      .single();
    
    if (workspaceCheckError && workspaceCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking workspace:', workspaceCheckError);
      console.error('Workspace check error details:', JSON.stringify(workspaceCheckError, null, 2));
    }
    
    // Create workspace if it doesn't exist
    if (!existingWorkspace) {
      console.log('🏢 Creating workspace for user:', user.email);
      const workspaceName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'My') + "'s Workspace";
      const workspaceData = {
        name: workspaceName,
        user_id: user.id
      };
      console.log('🏢 Workspace data to insert:', JSON.stringify(workspaceData, null, 2));
      
      const { data: insertedWorkspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert(workspaceData)
        .select();
      
      if (workspaceError) {
        console.error('❌ Error creating workspace:', workspaceError);
        console.error('Workspace error details:', JSON.stringify(workspaceError, null, 2));
        
        // Try alternative approach using upsert
        console.log('🔄 Trying upsert approach for workspace...');
        const { error: upsertError } = await supabase
          .from('workspaces')
          .upsert(workspaceData, { onConflict: 'user_id,name' });
        
        if (upsertError) {
          console.error('❌ Workspace upsert also failed:', upsertError);
        } else {
          console.log('✅ Workspace created via upsert');
        }
      } else {
        console.log('✅ Workspace created successfully:', insertedWorkspace);
      }
    } else {
      console.log('✅ Workspace already exists:', existingWorkspace);
    }
    
    console.log('✅ User profile and workspace setup complete');
  } catch (error) {
    console.error('❌ Error in ensureUserProfileAndWorkspace:', error);
    console.error('❌ Full error details:', JSON.stringify(error, null, 2));
    // Don't throw - allow user to proceed even if profile/workspace creation fails
  }
}

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Auth callback started');
        console.log('🔐 Current URL:', window.location.href);
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const error_param = urlParams.get('error');
        const error_description = urlParams.get('error_description');
        
        if (error_param) {
          console.error('❌ OAuth error in URL:', error_param, error_description);
          
          // Check if it's the database error we've been fighting
          if (error_param === 'server_error' && error_description?.includes('Database error saving new user')) {
            console.log('🔥 STILL getting database error! The trigger is STILL not disabled properly!');
            setStatus('Database trigger still causing issues. Attempting workaround...');
            
            // Show user a clear message and redirect to a manual signup
            setTimeout(() => {
              alert('There is a database configuration issue. Please contact support or try again later.');
              router.push('/login?error=database_config');
            }, 2000);
            return;
          }
          
          setStatus(`Authentication failed: ${error_param}`);
          setTimeout(() => {
            router.push('/login?error=auth_failed');
          }, 3000);
          return;
        }

        setStatus('Completing authentication...');
        
        // Use Supabase's built-in session handling
        // Wait for the auth state change event
        let sessionFound = false;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!sessionFound && attempts < maxAttempts) {
          attempts++;
          console.log(`🔐 Checking for session (attempt ${attempts}/${maxAttempts})`);
          setStatus(`Verifying authentication... (${attempts}/${maxAttempts})`);
          
          // Check current session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Session error:', sessionError);
          } else if (sessionData.session && sessionData.session.user) {
            console.log('✅ Session found:', sessionData.session.user.email);
            sessionFound = true;
            setStatus('Setting up your account...');
            
            // Ensure profile and workspace exist (handles both new and existing users)
            await ensureUserProfileAndWorkspace(sessionData.session.user);
            
            // Check if user has a paid plan - redirect to pricing if not
            console.log('🔍 Checking user plan status...');
            
            try {
              // Check plan_type from user_credits table (where Polar webhook updates it)
              const { data: creditsData, error: creditsError } = await supabase
                .from('user_credits')
                .select('plan_type')
                .eq('user_id', sessionData.session.user.id)
                .single();
              
              console.log('🔍 Auth callback plan check:', {
                userId: sessionData.session.user.id,
                email: sessionData.session.user.email,
                creditsData,
                creditsError,
                errorCode: creditsError?.code,
                errorMessage: creditsError?.message
              });
              
              // Handle case where user_credits record doesn't exist yet
              if (creditsError && creditsError.code === 'PGRST116') {
                console.log('⚠️ No user_credits record found - user needs to select plan');
                setStatus('Authentication successful! Redirecting...');
                setTimeout(() => {
                  router.push('/pricing');
                }, 1000);
                return;
              }
              
              if (creditsError) {
                console.error('❌ Error fetching plan:', creditsError);
                // On error, redirect to editor - let editor handle it
                setStatus('Authentication successful! Redirecting...');
                setTimeout(() => {
                  router.push('/editor');
                }, 1000);
                return;
              }
              
              // EXPLICIT check: only basic, pro, ultra are paid plans
              const planType = creditsData?.plan_type?.toLowerCase()?.trim();
              const hasPaidPlan = planType && ['basic', 'pro', 'ultra'].includes(planType);
              
              console.log('🔍 Plan check result:', {
                plan_type: creditsData?.plan_type,
                plan_type_lowercase: planType,
                hasPaidPlan,
                isBasic: planType === 'basic',
                isPro: planType === 'pro',
                isUltra: planType === 'ultra'
              });
              
              setStatus('Authentication successful! Redirecting...');
              setTimeout(() => {
                // Check for recent purchase in localStorage
                const purchaseTime = localStorage.getItem('slaid_just_purchased');
                const hasRecentPurchase = purchaseTime && (Date.now() - parseInt(purchaseTime)) < 5 * 60 * 1000;
                
                if (hasRecentPurchase) {
                  console.log('🛒 Recent purchase detected - redirecting to editor with temp access');
                  router.push('/editor?from_purchase=true');
                } else if (!hasPaidPlan) {
                  console.log('💳 No paid plan - redirecting to pricing');
                  router.push('/pricing');
                } else {
                  console.log('✅ Paid plan detected - redirecting to editor');
                  router.push('/editor');
                }
              }, 1000);
            } catch (error) {
              console.error('❌ Error checking plan:', error);
              // On error, redirect to EDITOR to avoid blocking paid users
              // The editor will do its own verification and handle correctly
              console.log('⚠️ Error checking plan - redirecting to editor (will verify there)');
              setTimeout(() => {
                router.push('/editor');
              }, 1000);
            }
            return;
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // If no session found, try to refresh
        console.log('🔐 No session found, trying to refresh...');
        setStatus('Refreshing session...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Refresh error:', refreshError);
        } else if (refreshData.session && refreshData.session.user) {
          console.log('✅ Session refreshed:', refreshData.session.user.email);
          setStatus('Setting up your account...');
          
          // Ensure profile and workspace exist (handles both new and existing users)
          await ensureUserProfileAndWorkspace(refreshData.session.user);
          
          // Check if user has a paid plan - redirect to pricing if not
          console.log('🔍 Checking user plan status (refresh)...');
          
          try {
            // Check plan_type from user_credits table (where Polar webhook updates it)
            const { data: creditsData, error: creditsError } = await supabase
              .from('user_credits')
              .select('plan_type')
              .eq('user_id', refreshData.session.user.id)
              .single();
            
            console.log('🔍 Auth callback plan check (refresh):', {
              userId: refreshData.session.user.id,
              email: refreshData.session.user.email,
              creditsData,
              creditsError,
              errorCode: creditsError?.code,
              errorMessage: creditsError?.message
            });
            
            // Handle case where user_credits record doesn't exist yet
            if (creditsError && creditsError.code === 'PGRST116') {
              console.log('⚠️ No user_credits record found (refresh) - user needs to select plan');
              setStatus('Authentication successful! Redirecting...');
              setTimeout(() => {
                router.push('/pricing');
              }, 1000);
              return;
            }
            
            if (creditsError) {
              console.error('❌ Error fetching plan (refresh):', creditsError);
              // On error, redirect to editor - let editor handle it
              setStatus('Authentication successful! Redirecting...');
              setTimeout(() => {
                router.push('/editor');
              }, 1000);
              return;
            }
            
            // EXPLICIT check: only basic, pro, ultra are paid plans
            const planType = creditsData?.plan_type?.toLowerCase()?.trim();
            const hasPaidPlan = planType && ['basic', 'pro', 'ultra'].includes(planType);
            
            console.log('🔍 Plan check result (refresh):', {
              plan_type: creditsData?.plan_type,
              plan_type_lowercase: planType,
              hasPaidPlan,
              isBasic: planType === 'basic',
              isPro: planType === 'pro',
              isUltra: planType === 'ultra'
            });
            
            setStatus('Authentication successful! Redirecting...');
            setTimeout(() => {
              // Check for recent purchase in localStorage
              const purchaseTime = localStorage.getItem('slaid_just_purchased');
              const hasRecentPurchase = purchaseTime && (Date.now() - parseInt(purchaseTime)) < 5 * 60 * 1000;
              
              if (hasRecentPurchase) {
                console.log('🛒 Recent purchase detected - redirecting to editor with temp access');
                router.push('/editor?from_purchase=true');
              } else if (!hasPaidPlan) {
                console.log('💳 No paid plan - redirecting to pricing');
                router.push('/pricing');
              } else {
                console.log('✅ Paid plan detected - redirecting to editor');
                router.push('/editor');
              }
            }, 1000);
          } catch (error) {
            console.error('❌ Error checking plan (refresh):', error);
            // On error, redirect to EDITOR to avoid blocking paid users
            // The editor will do its own verification and handle correctly
            console.log('⚠️ Error checking plan - redirecting to editor (will verify there)');
            setTimeout(() => {
              router.push('/editor');
            }, 1000);
          }
          return;
        }

        // Final fallback - redirect to login
        console.log('❌ Authentication failed - no session found');
        setStatus('Authentication failed - redirecting to login');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
      } catch (error) {
        console.error('❌ Unexpected error in auth callback:', error);
        setStatus('Unexpected error occurred');
        setTimeout(() => {
          router.push('/login?error=unexpected');
        }, 2000);
      }
    };

    // Add a small delay to ensure URL is fully loaded
    const timer = setTimeout(handleAuthCallback, 500);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>{status}</p>
        <p className="text-sm text-gray-400 mt-2">
          If this takes too long, please try refreshing the page
        </p>
      </div>
    </div>
  );
}
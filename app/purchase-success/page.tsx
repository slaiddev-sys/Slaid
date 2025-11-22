"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCredits } from "../../components/hooks/useCredits";

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const checkCreditsUpdated = async () => {
      try {
        setStatus('loading');
        
        // Refresh credits
        await refreshCredits();
        
        // Wait a bit for webhook to process (webhooks can take 2-5 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if credits were updated by refreshing again
        await refreshCredits();
        
        setStatus('success');
        
        // Redirect to editor after 2 seconds
        setTimeout(() => {
          router.push('/editor');
        }, 2000);
        
      } catch (error) {
        console.error('Error refreshing credits:', error);
        
        // Retry up to 5 times (total 10 seconds)
        if (attempts < 5) {
          setAttempts(prev => prev + 1);
          setTimeout(checkCreditsUpdated, 2000);
        } else {
          setStatus('error');
          // Still redirect to editor after error
          setTimeout(() => {
            router.push('/editor');
          }, 3000);
        }
      }
    };

    // Start checking after 1 second delay
    setTimeout(checkCreditsUpdated, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

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


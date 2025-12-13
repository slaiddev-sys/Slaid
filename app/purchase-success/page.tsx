"use client";

import { useEffect, useState } from "react";

export default function PurchaseSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success'>('loading');

  useEffect(() => {
    // SUPER SIMPLE: Set flags and redirect to editor. Nothing else.
    console.log('🛒 PURCHASE SUCCESS PAGE LOADED');
    
    // 1. Set localStorage flags IMMEDIATELY
    localStorage.setItem('slaid_just_purchased', Date.now().toString());
    localStorage.setItem('slaid_purchase_pending', 'true');
    
    console.log('✅ Purchase flags saved to localStorage');
    
    // 2. Show success message after 2 seconds
    const successTimeout = setTimeout(() => {
      setStatus('success');
    }, 2000);
    
    // 3. Redirect to editor after 4 seconds
    const redirectTimeout = setTimeout(() => {
      console.log('🚀 Redirecting to editor NOW...');
      // Use window.location.href to force a full page reload
      // This ensures the editor loads fresh and reads the localStorage
      window.location.href = '/editor?from_purchase=true';
    }, 4000);
    
    return () => {
      clearTimeout(successTimeout);
      clearTimeout(redirectTimeout);
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
              Thank you for your purchase! We're setting up your account...
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
              Your account is ready. Redirecting to editor...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Automatically redirect to editor after successful payment
    const timer = setTimeout(() => {
      window.location.href = '/editor';
    }, 2000); // Wait 2 seconds to show success message briefly

    return () => clearTimeout(timer);
  }, [checkoutId]);

  // Show brief success message then redirect
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-[#002903] text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-[#002903] opacity-70 mb-4">Redirecting you to the editor...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002903] mx-auto"></div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#002903] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002903] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

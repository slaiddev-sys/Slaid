"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          // Fetch updated credit balance
          const response = await fetch('/api/credits/balance', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCredits(data.remaining_credits);
          }
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, []);

  const handleContinue = () => {
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-[#002903] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#002903' }}>
          Payment Successful!
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {isLoading ? (
            "Processing your purchase..."
          ) : (
            credits !== null ? (
              <>
                Your credits have been added successfully!<br />
                <span className="font-semibold text-gray-900">Current balance: {credits} credits</span>
              </>
            ) : (
              "Your purchase has been completed."
            )
          )}
        </p>

        {/* Loading Spinner or Continue Button */}
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002903]"></div>
          </div>
        ) : (
          <button
            onClick={handleContinue}
            className="w-full text-white px-6 py-3 rounded-full font-medium transition-colors"
            style={{ backgroundColor: '#002903' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001a02'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002903'}
          >
            Continue to Editor
          </button>
        )}

        {/* Additional Info */}
        <p className="mt-6 text-sm text-gray-500">
          You can check your credit balance anytime in the editor.
        </p>
      </div>
    </div>
  );
}

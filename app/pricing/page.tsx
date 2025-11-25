"use client";

import React, { useState } from "react";
import Link from "next/link";
import PolarCheckout from "../../components/PolarCheckout";
import { getProductId } from "../../lib/polar-config";
import { useAuth } from "../../components/AuthProvider";
import { useCredits } from "../../components/hooks/useCredits";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const { user, profile, signOut, credits } = useAuth();
  const { refreshCredits } = useCredits();

  // Auto-refresh credits when window regains focus (e.g., returning from Polar checkout)
  React.useEffect(() => {
    const handleWindowFocus = () => {
      console.log('🔄 Window focused - refreshing credits...');
      refreshCredits();
    };

    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [refreshCredits]);

  // Get the Basic plan product ID based on billing cycle
  const productId = getProductId('Basic', billingCycle === 'yearly');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-white">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <img src="/slaid logo verde.png" alt="Slaid" className="h-12 w-auto object-contain" />
        </div>

        {/* Tagline */}
        <p className="text-gray-700 text-lg mb-12 max-w-md mx-auto">
          Unlock the potential of your Excel data with our AI-powered storytelling and presentation generator.
        </p>

        {/* Pricing Cards */}
        <div className="space-y-3 mb-8">
          {/* Yearly Plan - Highlighted */}
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`w-full p-6 rounded-2xl transition-all ${
              billingCycle === 'yearly'
                ? 'bg-[#f5f5f5] border-2 border-[#002903] shadow-lg'
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">Yearly – $129.99</span>
                  <span className="text-lg text-gray-500 line-through">$260.00</span>
                  <span className="px-2 py-1 bg-[#002903] text-white text-xs font-bold rounded">
                    BLACK FRIDAY 50% OFF
                  </span>
                </div>
                <p className="text-gray-600 text-sm">$10.83 / month</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                billingCycle === 'yearly' ? 'border-[#002903] bg-[#002903]' : 'border-gray-300'
              }`}>
                {billingCycle === 'yearly' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Monthly Plan */}
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`w-full p-6 rounded-2xl transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#f5f5f5] border-2 border-[#002903] shadow-lg'
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">Monthly – $14.99</span>
                  <span className="text-lg text-gray-500 line-through">$29.99</span>
                  <span className="px-2 py-1 bg-[#002903] text-white text-xs font-bold rounded">
                    BLACK FRIDAY 50% OFF
                  </span>
                </div>
                <p className="text-gray-600 text-sm">$14.99 / month</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                billingCycle === 'monthly' ? 'border-[#002903] bg-[#002903]' : 'border-gray-300'
              }`}>
                {billingCycle === 'monthly' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* CTA Button */}
        {productId ? (
          <PolarCheckout
            productId={productId}
            planName="Basic"
            isAnnual={billingCycle === 'yearly'}
            className="w-full py-6 px-6 bg-[#002903] hover:bg-[#001a02] text-white font-bold text-xl leading-tight rounded-2xl transition shadow-md hover:shadow-lg"
            buttonText="Start my free trial"
          />
        ) : (
          <button className="w-full py-6 px-6 bg-[#002903] hover:bg-[#001a02] text-white font-bold text-xl leading-tight rounded-2xl transition shadow-md hover:shadow-lg">
            Start my free trial
          </button>
        )}

        {/* Trial Info */}
        <p className="text-gray-500 text-sm mt-3 font-medium">
          3 days trial • Cancel anytime
        </p>

        {/* Terms and Privacy */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/terms" className="text-gray-600 text-sm hover:text-gray-900 transition">
            Terms
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/privacy" className="text-gray-600 text-sm hover:text-gray-900 transition">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}

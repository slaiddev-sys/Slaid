"use client";

import { polarConfig } from "../lib/polar-config";

interface PolarCheckoutProps {
  productId: string;
  planName: string;
  isAnnual?: boolean;
  className?: string;
}

export default function PolarCheckout({ 
  productId, 
  planName, 
  isAnnual = false,
  className = "" 
}: PolarCheckoutProps) {

  // If Polar is not configured, show a regular button
  if (!polarConfig.publicAccessToken || !productId) {
    return (
      <button 
        className={`w-full h-[31.5px] rounded-[6.75px] border border-[#4a5565] flex items-center justify-center text-[11.34px] leading-[17.5px] font-normal transition ${className}`}
        onClick={() => alert('Payment system is being configured. Please try again later.')}
      >
        Get Started
      </button>
    );
  }

  return (
    <button 
      className={`w-full h-[31.5px] rounded-[6.75px] border border-[#4a5565] flex items-center justify-center text-[11.34px] leading-[17.5px] font-normal transition ${className}`}
      onClick={async () => {
        try {
          // Create a checkout session using Polar API
          const response = await fetch('https://api.polar.sh/v1/checkouts/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${polarConfig.publicAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: productId,
              success_url: polarConfig.successUrl,
              cancel_url: polarConfig.cancelUrl,
            }),
          });

          if (response.ok) {
            const checkout = await response.json();
            window.open(checkout.url, '_blank');
          } else {
            console.error('Failed to create checkout session:', response.statusText);
            alert('Failed to start checkout. Please try again.');
          }
        } catch (error) {
          console.error('Error creating checkout:', error);
          alert('Failed to start checkout. Please try again.');
        }
      }}
    >
      Get Started
    </button>
  );
}

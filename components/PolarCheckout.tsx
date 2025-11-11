"use client";

import { polarConfig } from "../lib/polar-config";
import { useAuth } from "./AuthProvider";

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
  const { user } = useAuth();

  // If Polar is not configured, show a regular button
  if (!polarConfig.publicAccessToken || !productId) {
    return (
      <button 
        className={`w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal transition ${className}`}
        onClick={() => alert('Payment system is being configured. Please try again later.')}
      >
        Get Started
      </button>
    );
  }

  return (
    <button 
      className={`w-full h-[40px] rounded-[6.75px] flex items-center justify-center text-[13px] leading-[17.5px] font-normal transition ${className}`}
      onClick={async () => {
        try {
          // Get user email - CRITICAL for webhook matching
          const userEmail = user?.email;
          if (!userEmail) {
            alert('Please log in to subscribe');
            return;
          }

          // Create a checkout session using Polar API with pre-filled email
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
              customer_email: userEmail, // Pre-fill email to prevent user error
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

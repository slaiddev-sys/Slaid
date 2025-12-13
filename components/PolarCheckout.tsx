"use client";

import { polarConfig } from "../lib/polar-config";
import { useAuth } from "./AuthProvider";

interface PolarCheckoutProps {
  productId: string;
  planName: string;
  isAnnual?: boolean;
  className?: string;
  buttonText?: string;
}

export default function PolarCheckout({ 
  productId, 
  planName, 
  isAnnual = false,
  className = "",
  buttonText = "Get Started"
}: PolarCheckoutProps) {
  const { user } = useAuth();

  // If Polar is not configured, show a regular button
  if (!polarConfig.publicAccessToken || !productId) {
    return (
      <button 
        className={`flex items-center justify-center transition ${className}`}
        onClick={() => alert('Payment system is being configured. Please try again later.')}
      >
        {buttonText}
      </button>
    );
  }

  return (
    <button 
      className={`flex items-center justify-center transition ${className}`}
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
            // Redirect in the SAME tab so user returns to purchase-success after payment
            window.location.href = checkout.url;
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
      {buttonText}
    </button>
  );
}

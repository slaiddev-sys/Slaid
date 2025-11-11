// Polar Configuration
export const polarConfig = {
  // These should be set in your .env.local file
  publicAccessToken: process.env.NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN || '',
  
  // Product IDs for all plans (monthly and annual)
  products: {
    // Basic Plan
    basicMonthly: '481ff240-aadc-44c9-a58e-2fee7ab26b90',   // Basic Monthly Plan
    basicYearly: '3f8500aa-7847-40dc-bcde-844bbef74742',    // Basic Annual Plan
    
    // Pro Plan
    proMonthly: '5a954dc6-891d-428a-a948-05409fe765e2',    // Pro Monthly Plan
    proYearly: '8739ccac-36f9-4e28-8437-8b36bb1e7d71',     // Pro Annual Plan
    
    // Ultra Plan
    ultraMonthly: '71bf9c78-f930-437a-b076-62a0c1946d14',   // Ultra Monthly Plan
    ultraYearly: 'df5e66f6-2e9f-4f32-a347-ed4e46f37b0f',    // Ultra Annual Plan
  },
  
  // Credit Pack Product IDs (hardcoded as they're fixed)
  creditPacks: {
    credits200: '9acd1a25-9f4b-48fb-861d-6ca663b89fa1',   // $10
    credits400: 'ffe50868-199d-4476-b948-ab67c3894522',   // $20
    credits1000: 'c098b439-a2c3-493d-b0a6-a7d849c0de4d',  // $50
    credits2000: '92d6ad27-31d8-4a6d-989a-98da344ad7eb',  // $100
  },
  
  // URLs - use current domain or fallback
  get successUrl() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/success`;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'https://slaidapp.com'}/success`;
  },
  get cancelUrl() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/pricing`;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'https://slaidapp.com'}/pricing`;
  },
};

// Validation function to check if Polar is properly configured
export const isPolarConfigured = () => {
  return !!(
    polarConfig.publicAccessToken &&
    polarConfig.products.basicMonthly &&
    polarConfig.products.proMonthly &&
    polarConfig.products.ultraMonthly
  );
};

// Helper to get product ID based on plan name and billing cycle
export const getProductId = (planName: string, isAnnual: boolean) => {
  const planKey = planName.toLowerCase();
  
  if (planKey === 'basic') {
    return isAnnual ? polarConfig.products.basicYearly : polarConfig.products.basicMonthly;
  } else if (planKey === 'pro') {
    return isAnnual ? polarConfig.products.proYearly : polarConfig.products.proMonthly;
  } else if (planKey === 'ultra') {
    return isAnnual ? polarConfig.products.ultraYearly : polarConfig.products.ultraMonthly;
  }
  
  return null;
};

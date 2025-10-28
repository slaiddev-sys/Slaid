# Polar Integration Setup Guide

This guide will help you complete the Polar checkout integration for Slaid.

## 🎯 What's Already Done

✅ **Polar SDK Installed** - `@polar-sh/nextjs` package added  
✅ **Checkout Components** - PolarCheckout component created  
✅ **Success Page** - Payment success page with features overview  
✅ **Pricing Integration** - Pro plan buttons now use Polar checkout  
✅ **Configuration System** - Centralized config management  

## 🚀 Next Steps

### 1. Create Polar Account & Products

1. **Sign up at [polar.sh](https://polar.sh)**
2. **Create your organization**
3. **Create two products in your Polar dashboard:**
   - **Slaid Pro Monthly** - €20/month recurring
   - **Slaid Pro Yearly** - €200/year recurring (€40 savings)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token_here
NEXT_PUBLIC_POLAR_ACCESS_TOKEN=your_public_polar_token_here

# Product IDs from your Polar dashboard
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID=your_monthly_product_id
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID=your_yearly_product_id

# URLs (update with your domain)
POLAR_SUCCESS_URL=https://yourdomain.com/success?checkout_id={CHECKOUT_ID}
POLAR_CANCEL_URL=https://yourdomain.com/pricing
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Get Your API Keys

1. Go to your Polar dashboard
2. Navigate to **Settings** → **API Keys**
3. Create a **Public API Key** for frontend use
4. Create a **Secret API Key** for backend operations (webhooks)

### 4. Get Product IDs

1. In your Polar dashboard, go to **Products**
2. Click on each product you created
3. Copy the Product ID from the URL or product details
4. Add them to your environment variables

### 5. Set Up Webhooks (Optional but Recommended)

Create a webhook endpoint to handle subscription events:

```typescript
// app/api/webhooks/polar/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Handle different webhook events
  switch (body.type) {
    case 'checkout.completed':
      // Handle successful payment
      console.log('Payment completed:', body.data);
      break;
    case 'subscription.created':
      // Handle new subscription
      console.log('Subscription created:', body.data);
      break;
    case 'subscription.cancelled':
      // Handle subscription cancellation
      console.log('Subscription cancelled:', body.data);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

### 6. Test the Integration

1. **Start your development server**: `npm run dev`
2. **Go to pricing page**: `http://localhost:3000/pricing`
3. **Click "Get Started" on Pro plan**
4. **Test with Polar's test cards**:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`

## 🔧 Configuration Files Created

- **`components/PolarCheckout.tsx`** - Checkout component
- **`lib/polar-config.ts`** - Configuration management
- **`app/success/page.tsx`** - Success page after payment
- **`POLAR_SETUP.md`** - This setup guide

## 🎨 Features

- **Seamless Integration** - Checkout opens in modal/redirect
- **Billing Toggle** - Monthly/yearly pricing switch
- **Success Page** - Beautiful confirmation with feature list
- **Error Handling** - Graceful fallbacks if not configured
- **Responsive Design** - Works on all devices

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Test thoroughly before going live
- Set up proper webhook verification in production

## 📞 Support

- **Polar Documentation**: [docs.polar.sh](https://docs.polar.sh)
- **Polar Discord**: Join their community for support
- **Integration Examples**: Check Polar's GitHub for more examples

---

Once you complete these steps, your Slaid pricing page will have fully functional Polar checkout integration! 🎉

# Slaid Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/slaid)

## Environment Variables Required

When deploying to Vercel, you'll need to set these environment variables:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `ANTHROPIC_API_KEY` - Your Anthropic API key for AI generation

### Optional (for payments)
- `NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN`
- `NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID`
- `NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID`

### Production
- `NEXT_PUBLIC_BASE_URL` - Your production domain (e.g., https://slaid.com)

## Deployment Steps

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Post-Deployment

1. Update Supabase redirect URLs to include your production domain
2. Update Google OAuth redirect URLs
3. Test all functionality on production

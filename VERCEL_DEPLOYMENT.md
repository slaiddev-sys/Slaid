# Vercel Deployment Guide for Slaid

## ✅ GitHub Push Complete
- Repository: `slaiddev-sys/Slaid`
- Branch: `main`
- Latest commit: Pro plan system and UI improvements

---

## 🚀 Deployment Steps

### 1. Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** or select existing project
3. Import from GitHub: `slaiddev-sys/Slaid`
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./` (project root)

### 2. Environment Variables (REQUIRED)

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_key

# Google Slides API
GOOGLE_APPLICATION_CREDENTIALS=your_google_credentials_json

# Polar (Payments)
NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN=polar_oat_mhju5dmZmx0qJ8JMhIMeSwFBhz8dL6QOOGv3A1kT5ys
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID=5a954dc6-891d-428a-a948-05409fe765e2
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID=8739ccac-36f9-4e28-8437-8b36bb1e7d71

# Cron Job
CRON_SECRET=your_secure_random_string
```

**Important:** Copy these values from your local `.env.local` file!

### 3. Supabase Configuration

After deployment, update Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   ```
4. Also add your custom domain if you have one:
   ```
   https://slaidapp.com/auth/callback
   ```

### 4. Polar Webhook Configuration

Update webhook in Polar Dashboard:

1. Go to [Polar Dashboard](https://polar.sh/dashboard)
2. Navigate to: **Settings** → **Webhooks**
3. Update webhook URL to:
   ```
   https://your-vercel-domain.vercel.app/api/webhooks/polar
   ```
4. Events to listen for:
   - `checkout.completed`

### 5. Cron Job (Already Configured)

The `vercel.json` file is already set up for monthly credit renewal:
- **Path**: `/api/cron/renew-credits`
- **Schedule**: `0 0 1 * *` (1st day of every month at midnight UTC)
- **Secret**: Requires `CRON_SECRET` env var

---

## 🧪 Post-Deployment Testing

After deployment, test these critical features:

### Authentication
- [ ] Google OAuth login works
- [ ] Redirects to editor after login
- [ ] User profile is created

### Subscription System
- [ ] Pro plan purchase (monthly)
- [ ] Pro plan purchase (annual)
- [ ] Subscription syncs with database
- [ ] UI shows "Pro plan" after upgrade
- [ ] "Downgrade plan" button appears for Pro users

### Credit System
- [ ] Free users get 20 credits
- [ ] Pro users get 500 credits
- [ ] Credits deduct on presentation generation
- [ ] Credit balance updates in UI

### Feature Restrictions
- [ ] Free users see pricing modal on "Preview" click
- [ ] Free users see pricing modal on "Export PDF" click
- [ ] Pro users can use "Preview"
- [ ] Pro users can use "Export PDF"

### AI Generation
- [ ] Excel file upload works
- [ ] Presentation generation works
- [ ] Charts render correctly
- [ ] Chart colors can be changed via chat

---

## 🔍 Troubleshooting

### Google OAuth Redirect Issue
If Google OAuth redirects to localhost in production:

1. Check `lib/auth.ts` - the `signInWithGoogle` function should detect production URL
2. Current logic:
   ```typescript
   const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
   const redirectOrigin = isLocalhost ? 'http://localhost:3000' : window.location.origin;
   ```
3. This should work correctly in production

### Cron Job Not Running
1. Verify `vercel.json` is deployed
2. Check Vercel Dashboard → Settings → Cron Jobs
3. Ensure `CRON_SECRET` env var is set
4. Check logs in Vercel Dashboard → Logs

### Subscription Not Syncing
1. Check Polar webhook logs
2. Verify webhook URL is correct
3. Check Vercel function logs for `/api/webhooks/polar`
4. Ensure `NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN` is set

---

## 📊 Database Migration (If Needed)

If deploying to a fresh database, run these SQL scripts in order:

1. `REDESIGN_PRESENTATION_SYSTEM.sql` - Schema migration
2. `FIX_RLS_POLICIES_FOR_UUID.sql` - Row Level Security
3. `SETUP_PRO_PLAN_SYSTEM.sql` - Pro plan system

---

## 🎯 Final Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] Supabase redirect URLs updated
- [ ] Polar webhook URL updated
- [ ] Deployment successful
- [ ] Authentication tested
- [ ] Subscription flow tested
- [ ] Credit system tested
- [ ] Feature restrictions tested
- [ ] AI generation tested

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Polar Docs**: https://docs.polar.sh

---

**Deployment Date**: November 10, 2025  
**Version**: Pro Plan System Release


# Pro Plan Feature Restrictions & Monthly Credit Renewal Setup Guide

This guide explains the Pro plan feature restrictions and monthly credit renewal system that has been implemented.

## ✅ What's Been Implemented

### 1. **Feature Restrictions** 
- **Free Plan**: Cannot access Preview and Export PDF features
- **Pro Plan**: Full access to Preview and Export PDF features
- When free users click Preview or Export, they see the pricing modal

### 2. **Plan Management**
- User's plan type is stored in `user_credits.plan_type` ('free' or 'pro')
- Plan info is fetched from the database and cached in the editor
- Plan checking is done before allowing access to premium features

### 3. **Polar Webhook Integration**
- When a user subscribes to Pro Monthly or Pro Yearly, the webhook:
  - Adds 500 credits to their account
  - Upgrades their `plan_type` to 'pro'
  - Sets `last_renewal_date` to current date

### 4. **Monthly Credit Renewal System**
- **Pro users**: Get 500 credits every 30 days
- **Free users**: Get 20 credits every 30 days
- Automatic renewal via cron job endpoint

## 📋 Setup Instructions

### Step 1: Run the Database Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Open the file `SETUP_PRO_PLAN_SYSTEM.sql`
3. Copy and paste the entire contents into the SQL Editor
4. Click "Run" to execute

This will:
- Add `plan_type`, `last_renewal_date`, `subscription_id`, and `subscription_status` columns
- Create the `renew_monthly_credits_for_pro_users()` function
- Create the `check_and_renew_credits()` function
- Update the `initialize_user_credits()` function for Pro users
- Add proper transaction types for renewals

### Step 2: Test the Database Functions

Run this query in Supabase SQL Editor to verify everything works:

```sql
-- Check current credits setup
SELECT user_id, plan_type, total_credits, remaining_credits, last_renewal_date
FROM user_credits
LIMIT 10;

-- Test credit renewal (optional - this will actually renew credits!)
-- SELECT check_and_renew_credits();
```

### Step 3: Set Up Cron Job for Monthly Renewals

You have several options for running the monthly credit renewal:

#### Option A: Vercel Cron (Recommended if using Vercel)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [{
    "path": "/api/cron/renew-credits",
    "schedule": "0 0 * * *"
  }]
}
```

2. Add the CRON_SECRET to your environment variables:
```bash
CRON_SECRET=your-very-secure-random-token-here
```

3. Deploy to Vercel - cron will run automatically daily at midnight

#### Option B: External Cron Service (e.g., cron-job.org, EasyCron)

1. Set up a cron job to POST to: `https://your-domain.com/api/cron/renew-credits`
2. Add header: `Authorization: Bearer your-cron-secret-token`
3. Schedule: Daily at midnight (or your preferred time)
4. Add `CRON_SECRET` to your `.env.local`:
```bash
CRON_SECRET=your-cron-secret-token
```

#### Option C: GitHub Actions (Free for public repos)

Create `.github/workflows/renew-credits.yml`:

```yaml
name: Renew Monthly Credits
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  renew:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Credit Renewal
        run: |
          curl -X POST https://your-domain.com/api/cron/renew-credits \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Step 4: Update Existing Users (Optional)

If you have existing users, run this to set their plan correctly:

```sql
-- Set all existing users to free plan (if not already set)
UPDATE user_credits
SET 
  plan_type = 'free',
  total_credits = 20,
  used_credits = 0,
  last_renewal_date = NOW()
WHERE plan_type IS NULL OR plan_type = '';

-- If you have any Pro users, update them manually:
-- UPDATE user_credits
-- SET 
--   plan_type = 'pro',
--   total_credits = 500,
--   last_renewal_date = NOW()
-- WHERE user_id = 'USER_UUID_HERE';
```

### Step 5: Test the System

1. **Test Free User Restrictions**:
   - Log in as a free user
   - Try to click "Preview" or "Export PDF"
   - Should see the pricing modal

2. **Test Pro User Access**:
   - Upgrade a test user to Pro (via Polar or SQL)
   - Log in and verify Preview/Export work
   - Check that they have 500 credits

3. **Test Credit Renewal**:
   ```bash
   # In development, you can test the endpoint:
   curl -X POST http://localhost:3000/api/cron/renew-credits \
     -H "Authorization: Bearer your-cron-secret"
   ```

## 🔧 How It Works

### Feature Restriction Flow

```mermaid
graph TD
    A[User clicks Preview/Export] --> B{Check plan_type}
    B -->|free| C[Show Pricing Modal]
    B -->|pro| D[Allow Access to Feature]
```

### Subscription Flow

```mermaid
graph TD
    A[User purchases Pro plan] --> B[Polar webhook triggered]
    B --> C[Add 500 credits]
    B --> D[Set plan_type = 'pro']
    B --> E[Set last_renewal_date = NOW]
    E --> F[User has Pro access]
```

### Monthly Renewal Flow

```mermaid
graph TD
    A[Cron job runs daily] --> B[Check all users]
    B --> C{last_renewal_date > 30 days ago?}
    C -->|Yes| D{Check plan_type}
    C -->|No| E[Skip user]
    D -->|pro| F[Reset to 500 credits]
    D -->|free| G[Reset to 20 credits]
    F --> H[Update last_renewal_date]
    G --> H
```

## 📝 Important Notes

1. **Credits are reset, not added**: When renewal happens, users get a fresh allocation (500 for Pro, 20 for Free), not an addition to existing credits.

2. **Polar Integration**: The webhook automatically upgrades users to Pro when they subscribe. No manual intervention needed.

3. **Grace Period**: Consider adding a grace period if a user's subscription expires but payment is pending.

4. **Testing**: Always test the cron job in a staging environment first!

5. **Monitoring**: Check Supabase logs regularly to ensure renewals are happening correctly.

## 🐛 Troubleshooting

### "Preview/Export still works for free users"
- Hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Check that `plan_type` is correctly set in database
- Verify `useCredits` hook is fetching plan info

### "Credits not renewing"
- Check cron job is running (Vercel Dashboard → Deployments → Cron Logs)
- Verify `CRON_SECRET` is set correctly
- Run `SELECT check_and_renew_credits();` manually in SQL Editor
- Check `last_renewal_date` in database

### "Polar webhook not updating plan"
- Check Polar webhook logs in Polar Dashboard
- Verify product IDs match in `/api/webhooks/polar/route.ts`
- Check Supabase logs for webhook errors

## 📊 Database Schema

```sql
-- user_credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_credits INTEGER NOT NULL DEFAULT 20,
  used_credits INTEGER NOT NULL DEFAULT 0,
  remaining_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  plan_type TEXT NOT NULL DEFAULT 'free',  -- 'free' or 'pro'
  last_renewal_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Next Steps

- [ ] Set up the cron job (Vercel/GitHub Actions/External)
- [ ] Add `CRON_SECRET` to environment variables
- [ ] Run the database migration
- [ ] Test with a Pro subscription purchase
- [ ] Monitor the first month's credit renewal
- [ ] Consider adding email notifications for low credits
- [ ] Add subscription management page for users

## 📧 Support

If you encounter any issues, check:
1. Supabase logs for database errors
2. Vercel/deployment logs for API errors
3. Browser console for frontend errors
4. Polar dashboard for webhook delivery status



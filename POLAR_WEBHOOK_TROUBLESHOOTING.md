# Polar Webhook Troubleshooting

## Issue
Pro plan purchases are not updating the `plan_type` in the database. Users are being charged but their account still shows "Free plan".

## Root Cause
The Polar webhook is either:
1. Not configured to point to the production URL
2. Not being sent by Polar
3. Failing silently

## Solution

### 1. Verify Webhook URL in Polar Dashboard

**Go to:** https://polar.sh/dashboard → Settings → Webhooks

**Webhook URL should be:** `https://slaidapp.com/api/webhooks/polar`

**Events to subscribe to:** `checkout.completed`

### 2. Test Webhook Manually

You can test if the webhook endpoint is working by sending a POST request:

```bash
curl -X POST https://slaidapp.com/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.completed",
    "data": {
      "product_id": "5a954dc6-891d-428a-a948-05409fe765e2",
      "customer_email": "test@example.com"
    }
  }'
```

### 3. Check Vercel Logs

**Go to:** Vercel Dashboard → Your Project → Logs

**Filter for:** `/api/webhooks/polar`

**Look for:**
- `🔔 Polar webhook received:` - Webhook was received
- `✅ Credits added successfully:` - Credits were added
- `✅ User plan upgraded to Pro:` - Plan was upgraded
- `❌` - Any errors

### 4. Manual Fix (If Webhook Failed)

If a user paid but the webhook failed, you can manually upgrade them:

```sql
-- Check current status
SELECT user_id, plan_type, total_credits, remaining_credits, last_renewal_date
FROM user_credits
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'USER_EMAIL_HERE');

-- Manually upgrade to Pro
UPDATE user_credits
SET 
  plan_type = 'pro',
  total_credits = 500,
  used_credits = 0,
  last_renewal_date = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'USER_EMAIL_HERE');

-- Add transaction record
INSERT INTO credit_transactions (user_id, credits_changed, transaction_type, description)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'USER_EMAIL_HERE'),
  500,
  'subscription',
  'Pro Monthly Plan - Manual upgrade (webhook failed)'
);
```

### 5. Verify Webhook is Actually Called

Add this to your Polar webhook configuration:
- **URL:** `https://slaidapp.com/api/webhooks/polar`
- **Events:** `checkout.completed`
- **Test:** Send a test webhook from Polar dashboard

### 6. Common Issues

**Issue:** Webhook URL returns 404
**Solution:** Verify the route file exists at `/app/api/webhooks/polar/route.ts` and is deployed

**Issue:** Webhook receives event but user not found
**Solution:** Verify the email in Polar matches the email in Supabase Auth

**Issue:** Credits are added but plan_type doesn't update
**Solution:** Check if `user_credits` table has the user's record

### 7. Debugging Steps

1. **Check if webhook is configured:**
   - Go to Polar Dashboard → Settings → Webhooks
   - Verify URL is correct
   - Verify events are subscribed

2. **Check if webhook is being sent:**
   - Make a test purchase
   - Go to Polar Dashboard → Webhooks → Logs
   - Look for the webhook event

3. **Check if webhook is being received:**
   - Go to Vercel Dashboard → Logs
   - Filter for `/api/webhooks/polar`
   - Look for the webhook log

4. **Check database:**
   ```sql
   SELECT * FROM user_credits 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'USER_EMAIL');
   ```

## Prevention

- Set up webhook monitoring/alerts in Vercel
- Add webhook retry logic
- Send email confirmation when Pro plan is activated
- Display a "Processing..." state after purchase



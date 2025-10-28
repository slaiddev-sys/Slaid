# Polar Webhook Setup for Credit Recharging

## Current Issue
When users purchase credit packs through Polar, the credits are not automatically added to their account because:
1. The webhook endpoint exists but needs admin privileges
2. The service role key is not configured
3. Polar webhook URL might not be configured

## Quick Fix (Immediate)

### 1. Add Service Role Key
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Add to your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Restart Development Server
```bash
npm run dev
```

### 3. Test Manual Credit Addition
```bash
curl -X POST http://localhost:3000/api/credits/manual-add \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "manuel.corestudio@gmail.com",
    "credits": 200,
    "description": "Manual credit addition for stuck checkout"
  }'
```

## Complete Setup (Permanent Fix)

### 1. Configure Polar Webhook URL
1. Go to your Polar dashboard
2. Navigate to **Webhooks** or **Developer Settings**
3. Add webhook URL: `https://your-domain.com/api/webhooks/polar`
4. Select events: `checkout.completed`
5. Save configuration

### 2. Test Webhook
Use the test endpoint:
```bash
curl -X POST http://localhost:3000/api/webhooks/polar/test \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "manuel.corestudio@gmail.com",
    "productId": "9acd1a25-9f4b-48fb-861d-6ca663b89fa1"
  }'
```

## Credit Pack Product IDs
- **$10 → 200 credits**: `9acd1a25-9f4b-48fb-861d-6ca663b89fa1`
- **$20 → 400 credits**: `ffe50868-199d-4476-b948-ab67c3894522`
- **$50 → 1000 credits**: `c098b439-a2c3-493d-b0a6-a7d849c0de4d`
- **$100 → 2000 credits**: `92d6ad27-31d8-4a6d-989a-98da344ad7eb`

## Troubleshooting

### Credits Not Adding
1. Check server logs for webhook calls
2. Verify service role key is set
3. Test manual addition endpoint
4. Check user email matches exactly

### Webhook Not Called
1. Verify webhook URL in Polar dashboard
2. Check webhook events are configured
3. Test with ngrok for local development

### User Not Found
1. Verify user email in Supabase auth users
2. Check user has completed signup process
3. Test with exact email from auth table

## Security Notes
- Service role key has admin privileges - keep it secure
- Never expose service role key in client-side code
- Use environment variables only

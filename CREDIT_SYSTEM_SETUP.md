# Slaid Credit System Setup Guide

## Overview

The Slaid credit system implements a pay-per-use model where users consume credits for AI-powered presentation generation. Credits are directly tied to Anthropic API costs (1 credit = 1 cent).

## System Architecture

### 📊 Credit Economics
- **1 credit = 1 cent** of Anthropic API cost
- **Free Plan**: 10 credits (one-time, no renewal)
- **Pro Plan**: 500 credits (renews monthly)
- **Credit Packs**: 1000, 2500, 7000, 16000 credits via Polar checkout

### 🗄️ Database Schema

The system uses two main tables:

1. **`user_credits`** - Tracks user credit balances
2. **`credit_transactions`** - Logs all credit movements

Run the migration:
```sql
-- Execute the SQL in CREDIT_SYSTEM_MIGRATION.sql
```

### 🔧 API Endpoints

#### Credit Management
- `GET /api/credits/balance` - Get user's current credit balance
- `POST /api/credits/deduct` - Deduct credits (used internally)
- `POST /api/credits/add` - Add credits (used by webhooks)
- `POST /api/credits/upgrade-plan` - Upgrade user plan
- `POST /api/credits/renew` - Monthly renewal (cron job)

#### Webhooks
- `POST /api/webhooks/polar` - Handle Polar payment completions

## Setup Instructions

### 1. Database Setup

Execute the migration script:
```bash
# Run CREDIT_SYSTEM_MIGRATION.sql in your Supabase SQL editor
```

### 2. Environment Variables

Add to your `.env.local`:
```env
# Existing Polar variables
NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN=your_token
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID=your_monthly_id
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID=your_yearly_id

# Credit pack product IDs (already configured)
# 1000 credits ($10): 9acd1a25-9f4b-48fb-861d-6ca663b89fa1
# 2500 credits ($20): ffe50868-199d-4476-b948-ab67c3894522
# 7000 credits ($50): c098b439-a2c3-493d-b0a6-a7d849c0de4d
# 16000 credits ($100): 92d6ad27-31d8-4a6d-989a-98da344ad7eb

# Optional: For cron job authentication
CRON_SECRET_TOKEN=your_secret_token_for_renewals
```

### 3. Polar Webhook Configuration

Configure Polar to send webhooks to:
```
https://yourdomain.com/api/webhooks/polar
```

Events to listen for:
- `checkout.completed`

### 4. Monthly Renewal Setup

Set up a cron job to call the renewal endpoint monthly:
```bash
# Example cron job (runs on 1st of each month at 2 AM)
0 2 1 * * curl -X POST https://yourdomain.com/api/credits/renew \
  -H "Authorization: Bearer YOUR_CRON_SECRET_TOKEN"
```

## How It Works

### 🔄 Credit Flow

1. **User Registration**: Automatically gets 10 credits (Free plan)
2. **API Request**: System checks if user has enough credits
3. **Generation**: Anthropic API processes request
4. **Deduction**: Exact cost deducted from user balance
5. **UI Update**: Real-time balance refresh

### 💳 Credit Validation

Before each API call (minimum check):
```typescript
// Check if user has at least 1 credit (minimum cost)
if (!hasEnoughCredits(1)) {
  setShowCreditsModal(true);
  return;
}
```

After successful API call (exact cost deduction):
```typescript
// Deduct EXACT credits based on Anthropic usage (1 cent = 1 credit)
const inputCostCents = Math.ceil((inputTokens / 1000000) * 25);
const outputCostCents = Math.ceil((outputTokens / 1000000) * 125);
const totalCostCents = inputCostCents + outputCostCents;
const creditsToDeduct = Math.max(1, totalCostCents); // Minimum 1 credit

await deductCredits(creditsToDeduct, anthropicCost, presentationId, workspace);
```

### 🛒 Purchase Flow

1. User clicks credit pack in modal
2. Polar checkout session created
3. User completes payment
4. Webhook receives `checkout.completed`
5. Credits automatically added to account
6. UI refreshes to show new balance

## Pricing Calculation

### Anthropic API Costs (Claude 3.5 Haiku)
- **Input tokens**: $0.25 per 1M tokens (0.025 cents per 1K tokens)
- **Output tokens**: $1.25 per 1M tokens (0.125 cents per 1K tokens)

### Credit Calculation
```typescript
const inputCostCents = Math.ceil((inputTokens / 1000000) * 25);
const outputCostCents = Math.ceil((outputTokens / 1000000) * 125);
const totalCostCents = inputCostCents + outputCostCents;
const creditsToDeduct = Math.max(1, totalCostCents); // Minimum 1 credit
```

## Monitoring & Analytics

### Credit Usage Tracking
All transactions are logged in `credit_transactions` table:
- Transaction type (deduction, purchase, renewal, initial)
- Amount and description
- Anthropic cost correlation
- Presentation and workspace context

### User Statistics
```sql
-- Get user credit stats
SELECT 
  plan_type,
  COUNT(*) as user_count,
  AVG(remaining_credits) as avg_remaining,
  SUM(total_credits) as total_credits_issued
FROM user_credits 
GROUP BY plan_type;
```

## Troubleshooting

### Common Issues

1. **Credits not deducting**: Check if user is authenticated and database functions are working
2. **Webhook not working**: Verify Polar webhook URL and event configuration
3. **UI not updating**: Ensure `refreshCredits()` is called after successful operations

### Debug Endpoints

- `GET /api/credits/renew` - View user statistics
- Check browser console for credit-related logs (prefixed with 💳)

## Security Considerations

- All credit operations require user authentication
- Database functions use Row Level Security (RLS)
- Webhook endpoints should validate request signatures (implement as needed)
- Cron job endpoints require secret token authentication

## Future Enhancements

- Credit usage analytics dashboard
- Bulk credit operations for admin
- Credit expiration policies
- Usage-based plan recommendations
- Detailed transaction history UI

# Update Initial Credits to 50

## Current Status
The SQL script to change initial credits from 100 to 50 is ready at:
`/Users/manuellealbetancor/slaid/CHANGE_INITIAL_CREDITS_TO_50.sql`

## What This Updates
1. **initialize_user_credits** function - Sets initial credits to 50
2. **handle_new_user** trigger function - Gives new users 50 credits on signup

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `CHANGE_INITIAL_CREDITS_TO_50.sql`
4. Paste into the SQL Editor
5. Click **Run**

### Option 2: Via Supabase CLI
```bash
cd /Users/manuellealbetancor/slaid
supabase db push --file CHANGE_INITIAL_CREDITS_TO_50.sql
```

## Verification
After running the script, it will show:
- Status message confirming the update
- Sample of recent users and their credits

## Important Notes
- This only affects **new users** created after running the script
- Existing users keep their current credit balance
- The script updates both the manual initialization function and the automatic trigger
- Free plan users will now receive 50 credits instead of 100

## What Gets Updated
- New user signups will receive 50 credits
- The `initialize_user_credits` RPC function will grant 50 credits
- Credit transaction logs will record "50" for initial grants


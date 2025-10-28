# Complete User Deletion Setup

The current delete account functionality successfully removes all user data from the database but doesn't delete the user from Supabase Auth. This is because deleting auth users requires admin/service role privileges.

## Current Behavior
✅ **What Works:**
- Deletes all user presentations, slides, blocks, messages
- Deletes user workspaces and profiles
- Signs out the user
- Redirects to login with success message

⚠️ **What's Missing:**
- The auth user record remains in Supabase (but with no associated data)
- User could potentially sign back in (but would have no data)

## To Enable Complete User Deletion

### 1. Get Your Service Role Key
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)

### 2. Add Service Role to Environment Variables
Add to your `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Create Service Role Supabase Client
Create a new file `lib/supabase-admin.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

### 4. Update Delete Account API
In `app/api/auth/delete-account/route.ts`, replace the commented section:

```typescript
import { supabaseAdmin } from '../../../../lib/supabase-admin'

// Replace the commented auth deletion section with:
const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

if (deleteUserError) {
  console.error('❌ Failed to delete user from auth:', deleteUserError)
  return NextResponse.json({ 
    error: 'Failed to completely delete account, but user data has been removed',
    details: deleteUserError.message 
  }, { status: 500 })
}
```

## Security Considerations
- **Service role key has admin privileges** - keep it secure
- **Never expose service role key** in client-side code
- **Only use in server-side API routes**
- **Consider rate limiting** the delete endpoint

## Alternative Approach
If you prefer not to use service role keys, you could:
1. **Disable the auth user** instead of deleting
2. **Mark user as deleted** in a custom field
3. **Prevent login** for marked users
4. **Periodically clean up** disabled users via Supabase dashboard

The current implementation is functional and secure - users cannot access any data after "deletion" even if the auth record remains.

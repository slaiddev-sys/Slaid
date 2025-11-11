# Complete Account Deletion System

This system ensures that when a user account is deleted, **ALL** associated data is permanently removed from the database, including:
- Auth user record
- User credits
- Credit transactions
- Workspaces
- Presentations
- Slides
- Blocks
- Messages

## Setup Instructions

### 1. Run the SQL Setup Script

Copy and paste `COMPLETE_ACCOUNT_DELETION.sql` into your Supabase SQL Editor and run it. This will:

- ✅ Add `ON DELETE CASCADE` to all foreign keys
- ✅ Create `delete_user_completely()` function
- ✅ Set up proper permissions
- ✅ Verify CASCADE setup

### 2. Test the System

#### Option A: Via API (Recommended)

```bash
# Delete the current authenticated user's account
curl -X POST https://slaidapp.com/api/user/delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Option B: Via SQL (For Testing/Admin)

```sql
-- Delete a specific user by their UUID
SELECT public.delete_user_completely('USER_UUID_HERE');
```

### 3. Frontend Implementation

Add a "Delete Account" button to your settings page:

```typescript
async function deleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch('/api/user/delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (result.success) {
      // Sign out and redirect to home
      await supabase.auth.signOut()
      window.location.href = '/'
    } else {
      alert('Failed to delete account: ' + result.error)
    }
  } catch (error) {
    console.error('Delete account error:', error)
    alert('Failed to delete account')
  }
}
```

## What Gets Deleted

When a user account is deleted, the following happens automatically (via CASCADE):

1. **auth.users** - User authentication record
2. **user_credits** - User credit balance and plan info
3. **credit_transactions** - All credit transaction history
4. **workspaces** - All user workspaces
5. **presentations** - All presentations (triggers cascade to slides, blocks, messages)
6. **slides** - All slides in those presentations
7. **blocks** - All blocks in those slides
8. **messages** - All chat messages for those presentations

## Security Features

- ✅ Users can only delete their own account (enforced by authentication check)
- ✅ Service role can delete any account (for admin purposes)
- ✅ Deletion is logged with a summary of deleted records
- ✅ Irreversible - no "soft delete", actual deletion from database

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "details": {
    "success": true,
    "user_id": "uuid",
    "email": "user@example.com",
    "deleted": {
      "presentations": 5,
      "slides": 23,
      "blocks": 156,
      "messages": 87,
      "credit_transactions": 12
    },
    "timestamp": "2025-11-11T18:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to delete account",
  "details": "Error message here"
}
```

## Testing

### Test with a dummy account:

1. Create a new account with a test email
2. Add some test data (presentations, slides, etc.)
3. Delete the account via API or SQL
4. Verify all data is removed:

```sql
-- Check if user still exists
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Check if any related data remains
SELECT COUNT(*) FROM user_credits WHERE user_id = 'USER_UUID';
SELECT COUNT(*) FROM presentations WHERE user_id = 'USER_UUID';
SELECT COUNT(*) FROM credit_transactions WHERE user_id = 'USER_UUID';
```

All queries should return 0 results or no rows.

## Important Notes

- **This is permanent** - deleted data cannot be recovered
- **No soft delete** - we're using hard deletion for GDPR compliance
- **Cascade is automatic** - deleting from `auth.users` removes everything else
- **Admin access** - service role can delete any account for moderation

## Verification

After running the setup, verify CASCADE is properly configured:

```sql
SELECT 
  tc.table_name, 
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND rc.delete_rule = 'CASCADE';
```

You should see CASCADE for all tables that reference `auth.users`.


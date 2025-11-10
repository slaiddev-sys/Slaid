# Database Migration Guide: UUID-Based Presentation System

## Overview
This migration redesigns the presentation system to use proper UUID-based associations instead of INTEGER IDs and string-based workspace names.

## New Structure
```
User (auth.users) [UUID]
  └─> Profile (profiles) [UUID]
  └─> Workspace (workspaces) [UUID]
      └─> Presentation (presentations) [UUID]
          ├─> Slides (slides) [UUID]
          │   └─> Blocks (blocks) [UUID]
          └─> Messages (messages) [UUID]
```

## Migration Steps

### Step 1: Backup (Optional but Recommended)
If you want to keep existing presentations, export them first via Supabase dashboard.

### Step 2: Delete All Presentations
Run in Supabase SQL Editor:
```sql
DELETE FROM blocks;
DELETE FROM messages;
DELETE FROM slides;
DELETE FROM presentations;
```

### Step 3: Run Database Redesign
Copy and paste the entire contents of `REDESIGN_PRESENTATION_SYSTEM.sql` into Supabase SQL Editor and run it.

This will:
- Drop old presentation tables
- Create new tables with UUID primary keys
- Set up proper foreign key relationships
- Enable Row Level Security
- Create performance indexes

### Step 4: Update Code to Use New Database Functions

Replace all imports of `database.ts` with `database-new.ts`:

**Before:**
```typescript
import { savePresentation, loadPresentation } from '@/lib/database'
```

**After:**
```typescript
import { savePresentation, loadPresentation } from '@/lib/database-new'
```

### Step 5: Update Function Calls

#### Save Presentation - New Signature:
```typescript
// OLD (database.ts)
await savePresentation(
  1,                    // number
  "My Workspace",       // string workspace name
  "Presentation Title",
  slides,
  messages,
  userId                // optional
)

// NEW (database-new.ts)
await savePresentation(
  "uuid-presentation-id",  // UUID string
  "uuid-workspace-id",     // UUID workspace ID
  "Presentation Title",
  slides,
  messages,
  userId                   // REQUIRED
)
```

#### Load Presentation - New Signature:
```typescript
// OLD (database.ts)
await loadPresentation(
  1,                 // number
  "My Workspace",    // string workspace name
  userId             // optional
)

// NEW (database-new.ts)
await loadPresentation(
  "uuid-presentation-id",  // UUID string
  userId                   // REQUIRED
)
```

### Step 6: Generate UUIDs in Frontend

When creating a new presentation:

```typescript
import { v4 as uuidv4 } from 'uuid'

// Generate new presentation ID
const newPresentationId = uuidv4()

// Get user's workspace
const workspace = await getOrCreateDefaultWorkspace(userId)

// Save presentation
await savePresentation(
  newPresentationId,
  workspace.id,  // workspace UUID
  "New Presentation",
  slides,
  messages,
  userId
)
```

## Key Changes

### 1. Presentation ID
- **Old:** Integer (1, 2, 3...)
- **New:** UUID (`550e8400-e29b-41d4-a716-446655440000`)

### 2. Workspace Reference
- **Old:** String name ("My Workspace")
- **New:** UUID (`workspace_id`)

### 3. Authentication
- **Old:** Optional `userId` (presentations could exist without users)
- **New:** Required `userId` (all presentations must belong to a user)

### 4. Uniqueness
- **Old:** Composite key (id + workspace + user_id)
- **New:** Single UUID primary key

### 5. Loading
- **Old:** Load by (id, workspace name, userId)
- **New:** Load by (presentation UUID, userId)

## Benefits

✅ **True Global Uniqueness:** Each presentation has a globally unique ID

✅ **Cleaner Relationships:** Proper foreign key relationships throughout

✅ **Better Performance:** UUID indexes are efficient, no composite keys needed

✅ **Scalability:** Can easily shard/distribute database by workspace_id

✅ **Security:** RLS policies enforce proper access control at every level

✅ **No Conflicts:** No more presentation ID collisions between users

## Testing Checklist

After migration, test:

- [ ] Create new presentation
- [ ] Save presentation
- [ ] Load presentation
- [ ] Update presentation content
- [ ] Delete presentation
- [ ] Load workspace presentations list
- [ ] User can only see their own presentations
- [ ] Cascade deletes work (delete presentation deletes slides/blocks/messages)

## Rollback Plan

If you need to rollback, restore from your database backup. The old `database.ts` file is preserved for reference.

## Need Help?

Check the following files:
- `REDESIGN_PRESENTATION_SYSTEM.sql` - Database schema
- `lib/database-new.ts` - New database functions
- `lib/database.ts` - Old database functions (reference only)


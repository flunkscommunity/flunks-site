# Gum Button Fix for Locker System

## Issue
The gum button in the locker system was not functioning because it was trying to use a gum source called `'locker_jacket'` that doesn't exist in the database.

## Error Message
- Console shows: "Invalid or inactive gum source"
- The `award_gum` function returns this error when the source doesn't exist

## Root Cause
The database only has these gum sources:
- `floating_button`
- `daily_login` 
- `special_event`

But the locker system in `LockerSystemNew.tsx` tries to use `'locker_jacket'` which was never added.

## Solution

### 1. Database Fix (ADMIN REQUIRED)
Run the SQL script `ADMIN_ADD_LOCKER_GUM_SOURCE.sql` in the Supabase SQL Editor with admin privileges. This will add the missing gum source.

### 2. Schema Updates
The following files have been updated to include the `locker_jacket` source:
- `supabase/gum_system_schema.sql`
- `supabase/gum_system_schema_safe.sql` 
- `supabase/update_gum_sources.sql`

### 3. Temporary Workaround
If you need immediate functionality, you can temporarily change line 80 in `LockerSystemNew.tsx` from:
```typescript
'locker_jacket',
```
to:
```typescript
'floating_button',
```

This will use the existing floating button source until the proper source is added.

## Testing
After adding the `locker_jacket` source to the database:
1. Open the locker system
2. Click the gum button in the letter jacket section
3. Should show gum earnings (3 gum, 5-hour cooldown, max 15 per day)
4. Check console - should no longer show "Invalid or inactive gum source" errors

## Configuration
The `locker_jacket` source is configured as:
- Base reward: 3 gum
- Cooldown: 300 minutes (5 hours)
- Daily limit: 15
- Description: "Gum earned from clicking button in locker jacket section"

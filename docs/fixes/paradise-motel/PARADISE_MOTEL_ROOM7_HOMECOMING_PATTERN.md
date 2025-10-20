# Paradise Motel Room 7 - Homecoming Dance Pattern Implementation

## Summary
Rewired Paradise Motel Room 7 slacker objective to follow the exact same pattern as the Homecoming Dance attendance system.

## Changes Made

### 1. Database Table ✅
**File**: `/create-paradise-motel-room7-table.sql`
- Created `paradise_motel_room7_visits` table (mirrors `homecoming_dance_attendance`)
- Fields: wallet_address (unique), username, gum_amount (50), user_agent, ip_address, visit_timestamp
- Indexes on wallet_address, visit_timestamp, created_at
- Row Level Security enabled
- Test record included

**Run this SQL in Supabase to create the table!**

### 2. Record Visit API ✅
**File**: `/src/pages/api/paradise-motel-room7.ts`
- Completely rewritten to match `record-homecoming-dance-attendance.ts`
- Checks `paradise_motel_room7_visits` table for existing visit
- Records visit with IP, user agent, timestamp
- Awards 50 GUM using `awardGum()` with source `'chapter5_paradise_motel_room7'`
- Returns proper success/alreadyCompleted responses

### 3. Check Visit API ✅
**File**: `/src/pages/api/check-paradise-motel-room7.ts`
- New API endpoint (mirrors `check-homecoming-dance-attendance.ts`)
- GET endpoint to check if wallet has visited Room 7
- Returns `hasVisited` boolean

### 4. Frontend Update ✅
**File**: `/src/windows/Locations/ParadiseMotelMain.tsx`
- Updated API call to send `walletAddress` instead of `wallet`
- Added `username` field to match homecoming pattern
- Changed response handling to check `data.alreadyCompleted` instead of `data.alreadyClaimed`
- Uses `data.gumAwarded` for logging

### 5. Tracking Utility ✅
**File**: `/src/utils/paradiseMotelRoom7Tracking.ts`
- Updated to query `paradise_motel_room7_visits` table instead of `gum_transactions`
- Matches homecoming dance tracking pattern

## Testing Steps

1. **Create the database table**:
   ```bash
   # Run this in Supabase SQL Editor:
   # /create-paradise-motel-room7-table.sql
   ```

2. **Test the slacker objective**:
   - Testing mode is active: `isDay = false` on line 125 of ParadiseMotelMain.tsx
   - Click Paradise Motel → Lobby → Room 7
   - Should see: "🎉 +50 GUM! Slacker Objective Complete!" overlay
   - Console should show: "✅ Room 7 Slacker objective completed! +50 GUM"

3. **Verify in MyLocker**:
   - Open MyLocker
   - Go to Chapter 5
   - Slacker objective should show as completed with checkmark

4. **Check database**:
   ```sql
   SELECT * FROM paradise_motel_room7_visits;
   SELECT * FROM user_gum_balances WHERE wallet_address = 'YOUR_WALLET';
   SELECT * FROM gum_transactions WHERE source = 'chapter5_paradise_motel_room7';
   ```

## How It Works (Homecoming Dance Pattern)

1. **User clicks Room 7 at night** → `openRoom7()` called
2. **Frontend sends POST** to `/api/paradise-motel-room7` with `walletAddress` and `username`
3. **API checks** `paradise_motel_room7_visits` table for existing record
4. **If not found**:
   - Inserts record into `paradise_motel_room7_visits`
   - Calls `awardGum(wallet, 'chapter5_paradise_motel_room7', {...})`
   - Returns success with `gumAwarded: 50`
5. **If already exists**:
   - Returns `alreadyCompleted: true` with existing GUM amount
6. **Frontend** triggers `'gum-balance-updated'` event to refresh objectives
7. **MyLocker** checks completion via `checkParadiseMotelRoom7NightVisit()` which queries `paradise_motel_room7_visits`

## Key Differences from Old Implementation

### Old (gum_transactions only):
- ❌ Used `gum_transactions` table with source `'paradise_motel_room7_night'`
- ❌ No dedicated tracking table
- ❌ No visit metadata (IP, user agent, timestamp)
- ❌ Harder to query for completion status

### New (Homecoming Dance pattern):
- ✅ Dedicated `paradise_motel_room7_visits` table
- ✅ Records visit metadata (IP, user agent, timestamp)
- ✅ Uses proper `awardGum()` API
- ✅ Same pattern as other objectives (Chapter 4 Slacker)
- ✅ Clean separation of concerns

## Files Changed

1. ✅ `/create-paradise-motel-room7-table.sql` - NEW
2. ✅ `/src/pages/api/paradise-motel-room7.ts` - REWRITTEN
3. ✅ `/src/pages/api/check-paradise-motel-room7.ts` - NEW
4. ✅ `/src/windows/Locations/ParadiseMotelMain.tsx` - UPDATED (API call)
5. ✅ `/src/utils/paradiseMotelRoom7Tracking.ts` - UPDATED (query new table)

## Next Steps

1. Run the SQL file in Supabase to create `paradise_motel_room7_visits` table
2. Test the Room 7 night visit
3. Verify GUM award and objective completion
4. When ready for production, change `isDay = false` to `isDay = timeBasedInfo.isDay` (line 125)

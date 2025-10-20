# Zoltar GUM Verification & Fix Guide

## Problem
Users who win at the Zoltar fortune machine should receive 250 GUM, but we need to verify they're actually getting it.

## How Zoltar GUM Works

### The Flow:
1. **Player pays 10 GUM** → `spendGum()` called with source `'zoltar_fortune_machine'`
2. **Game determines outcome** → 1/30 chance to win (3.33%)
3. **If win** → `earnGum('zoltar_fortune_machine_win')` called
4. **Player receives 250 GUM** → Database function `award_gum()` executes

### Code Location:
- **Main game logic**: `/src/windows/ZoltarFortuneApp.tsx` (lines 129-210)
- **Win payout**: Line 184 calls `earnGum('zoltar_fortune_machine_win')`
- **GUM context**: `/src/contexts/GumContext.tsx` (earnGum function)
- **API call**: `/src/utils/gumAPI.ts` (awardGum function)
- **Database function**: `/supabase/gum_system_schema_safe.sql` (award_gum)

## Diagnostic Steps

### Step 1: Run the Diagnostic Script
```bash
cd "/Users/jeremy/top secret project/flunks-site"
node scripts/check-zoltar-winners.js
```

This will show you:
- ✅ If the GUM source exists
- 📊 Total plays vs wins
- 🏆 List of winners
- 💰 If winners received their GUM
- 📈 Win rate (should be ~3.33%)

### Step 2: Verify Database Setup
Run the SQL verification script in Supabase SQL Editor:
```bash
# Copy the file content
cat scripts/verify-zoltar-gum-setup.sql
```

Then paste and run in Supabase dashboard.

This will:
- ✅ Ensure `zoltar_fortune_machine_win` source exists
- ✅ Set correct reward (250 GUM)
- ✅ Set cooldown to 0 (no cooldown)
- ✅ Set daily limit to 999 (essentially unlimited)
- 📊 Show all Zoltar transactions
- 🔍 Find any winners who didn't get paid

## Common Issues & Fixes

### Issue 1: GUM Source Doesn't Exist
**Symptom**: Winners don't receive GUM, console shows "Invalid or inactive gum source"

**Fix**: Run this in Supabase SQL Editor:
```sql
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES (
  'zoltar_fortune_machine_win',
  250, 0, 999,
  'Winnings from Mystical Zoltar fortune machine (1/30 chance)',
  true
)
ON CONFLICT (source_name) 
DO UPDATE SET 
  base_reward = 250,
  cooldown_minutes = 0,
  daily_limit = 999,
  is_active = true;
```

### Issue 2: Source Exists But Is Inactive
**Symptom**: Source exists but `is_active = false`

**Fix**:
```sql
UPDATE gum_sources 
SET is_active = true 
WHERE source_name = 'zoltar_fortune_machine_win';
```

### Issue 3: Wrong Reward Amount
**Symptom**: Source exists but gives wrong amount (not 250)

**Fix**:
```sql
UPDATE gum_sources 
SET base_reward = 250 
WHERE source_name = 'zoltar_fortune_machine_win';
```

### Issue 4: Daily Limit Reached
**Symptom**: Winners don't get GUM after first win of the day

**Fix**:
```sql
UPDATE gum_sources 
SET daily_limit = 999 
WHERE source_name = 'zoltar_fortune_machine_win';
```

### Issue 5: Winners From Past Didn't Get Paid
**Symptom**: Checking transactions shows wins but no corresponding GUM awards

**Fix**: Manually award GUM to those users:
```sql
-- Replace with actual wallet address
SELECT award_gum(
  '0xWALLET_ADDRESS_HERE',
  'zoltar_fortune_machine_win',
  '{"reason": "Retroactive payout for missed win", "admin_correction": true}'::jsonb
);
```

## How to Find Winners Who Didn't Get Paid

Run this query in Supabase:
```sql
-- Find users who have metadata indicating a win but no corresponding GUM transaction
SELECT 
  t.wallet_address,
  t.metadata->>'win_amount' as expected_amount,
  t.created_at as play_time,
  (
    SELECT COUNT(*) 
    FROM user_gum_transactions win 
    WHERE win.wallet_address = t.wallet_address 
    AND win.source = 'zoltar_fortune_machine_win'
    AND win.created_at BETWEEN t.created_at AND (t.created_at + interval '10 seconds')
  ) as gum_awarded
FROM user_gum_transactions t
WHERE t.source = 'zoltar_fortune_machine'
  AND t.metadata->>'win_amount' IS NOT NULL
  AND t.metadata->>'win_amount' = '250'
ORDER BY t.created_at DESC;
```

If `gum_awarded = 0` for any row, that user won but didn't receive their GUM!

## Expected Behavior

### When a Player Wins:
1. ✅ Console log: "🍬 GumProvider: Awarding gum from source: zoltar_fortune_machine_win"
2. ✅ Console log: "🍬 GumProvider: Award result: {success: true, earned: 250, ...}"
3. ✅ Bubble sound plays
4. ✅ Balance updates immediately in UI (+250 GUM)
5. ✅ Transaction recorded in `user_gum_transactions` table
6. ✅ Balance updated in `user_gum_balances` table

### Database Records Created:
1. **Play transaction**: -10 GUM, source: `zoltar_fortune_machine`
2. **Win transaction**: +250 GUM, source: `zoltar_fortune_machine_win`
3. **Net result**: +240 GUM for the player

## Testing

### Test That It's Working:
1. Open browser console
2. Play Zoltar multiple times
3. Watch for these console logs:
   - "🍬 GumProvider: Spending gum: 10"
   - (If win) "🍬 GumProvider: Awarding gum from source: zoltar_fortune_machine_win"
   - (If win) "🍬 GumProvider: Award result: {success: true, earned: 250}"

### Manual Test Win (for debugging):
In browser console:
```javascript
// Force a win for testing
const testWin = async () => {
  const { earnGum } = useGum(); // Get from context
  const result = await earnGum('zoltar_fortune_machine_win', {
    game: 'zoltar',
    win_amount: 250,
    test: true
  });
  console.log('Test win result:', result);
};
```

## Stats to Monitor

Run the diagnostic script regularly to track:
- **Total plays**: Should increase over time
- **Total wins**: Should be ~3.33% of plays
- **Total GUM spent**: plays × 10
- **Total GUM won**: wins × 250
- **Net house edge**: Should be positive (more spent than won)

Expected with 1000 plays:
- Wins: ~33 (could be 20-50 due to variance)
- Spent: 10,000 GUM
- Won: ~8,250 GUM (33 × 250)
- House edge: ~1,750 GUM

## Contact Info for Users

If users report not receiving their winnings:
1. Get their wallet address
2. Run diagnostic script
3. Check `user_gum_transactions` for their wallet
4. If win transaction is missing, manually award:
   ```sql
   SELECT award_gum(
     'THEIR_WALLET_ADDRESS',
     'zoltar_fortune_machine_win',
     '{"reason": "Manual correction", "support_ticket": true}'::jsonb
   );
   ```

## Files to Check

- `/src/windows/ZoltarFortuneApp.tsx` - Game logic
- `/src/contexts/GumContext.tsx` - GUM state management
- `/src/utils/gumAPI.ts` - API calls
- `/supabase/gum_system_schema_safe.sql` - Database functions
- `/scripts/check-zoltar-winners.js` - Diagnostic tool
- `/scripts/verify-zoltar-gum-setup.sql` - Database verification

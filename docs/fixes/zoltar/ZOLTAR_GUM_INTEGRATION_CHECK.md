# 🔮 Zoltar Fortune Machine - Gum Integration Check

## Current Implementation Status

### ✅ Code Implementation (Verified)
The Zoltar Fortune Machine is correctly implemented to award GUM:

**File**: `/src/windows/ZoltarFortuneApp.tsx`

```typescript
// When player wins:
await earnGum('zoltar_fortune_machine_win', {
  game: 'zoltar',
  win_amount: outcome.payout,  // 250 GUM
  timestamp: new Date().toISOString()
});
```

### 🎰 Game Configuration
- **Play Cost**: 10 GUM (deducted via `spendGum`)
- **Win Payout**: 250 GUM (awarded via `earnGum`)
- **Win Chance**: 1/30 (3.33%)
- **Source Name**: `zoltar_fortune_machine_win`

### 🔧 Required Database Setup

**IMPORTANT**: You need to run this SQL script in Supabase to ensure winnings are tracked:

**File**: `/supabase/add-zoltar-gum-source.sql`

This script adds:
1. `zoltar_fortune_machine_win` - Awards 250 GUM (for wins)
2. `zoltar_fortune_machine` - Deducts 10 GUM (for plays)

### 📊 How It Works

1. **Player clicks "Consult Zoltar" button**
2. **System checks balance** (needs ≥10 GUM)
3. **`spendGum(10, 'zoltar_fortune_machine')`** - Deducts play cost
4. **Random outcome generated** (1/30 win chance)
5. **If winner**: `earnGum('zoltar_fortune_machine_win')` - Awards 250 GUM
6. **Balance updated** - User sees new balance immediately

### 🔍 Verification Steps

#### Step 1: Check if Gum Source Exists
Run in Supabase SQL Editor:
```sql
SELECT * FROM gum_sources WHERE source_name LIKE '%zoltar%';
```

**Expected Result**: Should show 2 rows (win + play sources)

If empty → **Run `/supabase/add-zoltar-gum-source.sql`**

#### Step 2: Test the Game
1. Load the arcade location
2. Click on Mystical Zoltar machine
3. Play the game (costs 10 GUM)
4. Check browser console for logs:
   - "🍬 GumProvider: Spending gum: 10"
   - "🍬 GumProvider: Awarding gum from source: zoltar_fortune_machine_win" (if win)

#### Step 3: Check Transaction History
Run in Supabase:
```sql
SELECT 
  wallet_address,
  amount,
  source,
  metadata,
  created_at
FROM user_gum_transactions
WHERE source LIKE '%zoltar%'
ORDER BY created_at DESC
LIMIT 20;
```

**Expected**: 
- Negative transactions (-10) for plays
- Positive transactions (+250) for wins

### ⚠️ Potential Issues

#### Issue 1: Gum Source Not Configured
**Symptom**: User doesn't receive GUM after winning
**Solution**: Run `/supabase/add-zoltar-gum-source.sql`

#### Issue 2: Database Function Missing
**Symptom**: Console error "award_gum function not found"
**Solution**: Ensure `award_gum` RPC function exists in Supabase

#### Issue 3: Supabase Outage
**Symptom**: All GUM transactions fail
**Solution**: Wait for Supabase to resolve (check https://status.supabase.com/)

### 🎯 Testing Checklist

- [ ] Run add-zoltar-gum-source.sql in Supabase
- [ ] Verify gum sources exist in database
- [ ] Test playing Zoltar (costs 10 GUM)
- [ ] Test winning (should award 250 GUM)
- [ ] Check transaction history in Supabase
- [ ] Verify balance updates in UI
- [ ] Check browser console for errors

### 📝 Notes

- Local game stats are tracked in localStorage (totalPlays, totalWins, etc.)
- Database tracks actual GUM transactions for wallet
- Win chance is cryptographically secure (uses crypto.getRandomValues)
- Bubble sound plays when GUM is earned
- Balance updates immediately in UI, then refreshes from database

## Next Steps

1. **Run the SQL script** in Supabase to add gum sources
2. **Test the game** to verify GUM is being awarded
3. **Check transaction history** to confirm database recording

If you're still having issues after running the SQL script, check the browser console for specific error messages.
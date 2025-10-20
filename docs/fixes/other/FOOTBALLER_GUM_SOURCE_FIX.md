# 🏈 FOOTBALLER GUM SOURCE FIX

## Problem
Your claim is failing because the GUM source `"footballer_flunk_bonus"` doesn't exist in your database.

## Quick Fix
Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Add footballer_flunk_bonus gum source
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES ('footballer_flunk_bonus', 100, 0, 1, 'One-time 100 GUM bonus for owning Footballer Flunk NFT (Home or Away)', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the source was added
SELECT * FROM gum_sources WHERE source_name = 'footballer_flunk_bonus';
```

## Steps
1. Go to your Supabase dashboard
2. Click "SQL Editor"
3. Paste the above SQL
4. Click "Run"
5. Try claiming your footballer reward again

## What This Does
- Adds the missing `footballer_flunk_bonus` source
- Sets it to award 100 GUM
- Sets daily limit to 1 (but actual limiting is done by the footballer_gum_claims table)
- Makes it active and available for use

After running this, your claim should work properly! 🎯

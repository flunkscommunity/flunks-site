# 🔧 Daily GUM Sources Fix - Login vs Check-in Separation

## 🎯 Problem Identified
The system was treating the automatic login reward (5 GUM) and the manual daily check-in button (15 GUM) as the same source, causing them to share a cooldown.

**Before:**
- ✅ Login: 5 GUM → uses `daily_login` source
- ❌ Check-in button: 15 GUM → also uses `daily_login` source  
- **Result:** Claiming one blocks the other for 24 hours

## ✅ Solution Implemented

### 1. **Database Changes** 
Added new gum source (run the SQL in `add-daily-checkin-source.sql`):
```sql
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) 
VALUES ('daily_checkin', 15, 1440, 15, 'Manual daily check-in button in locker', true);
```

### 2. **API Update**
- **File:** `/src/pages/api/daily-checkin.ts`
- **Changed:** From `daily_login` → `daily_checkin` source
- **Effect:** Button now uses its own separate cooldown system

### 3. **UI Update** 
- **File:** `/src/windows/LockerSystemNew.tsx` 
- **Changed:** Cooldown timer from `daily_login` → `daily_checkin`
- **Effect:** Button shows correct cooldown status

## 🎉 Expected Result

**After:**
- ✅ Login: 5 GUM → uses `daily_login` source (24h cooldown)
- ✅ Check-in button: 15 GUM → uses `daily_checkin` source (24h cooldown)
- **Result:** Users can claim BOTH rewards daily! 🎯

### Daily GUM Potential:
- **Login bonus:** 5 GUM (automatic)
- **Check-in bonus:** 15 GUM (manual button)
- **Total possible:** 20 GUM per day

## 🔧 Setup Required

1. **Run the SQL command** to add the new `daily_checkin` source to your database
2. **Restart your dev server** to pick up the code changes
3. **Test both systems:**
   - Connect wallet → should get 5 GUM login bonus
   - Click check-in button → should get 15 GUM check-in bonus
   - Both should work independently

## 🧪 Testing Script

Run `setup-daily-checkin-source.js` in the browser console to check if the database source exists.

---

**🎯 This fix ensures users get the full daily GUM rewards they deserve!**

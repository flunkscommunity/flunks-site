# Paradise Motel - Chapter 5 Setup Guide

## 🏨 Overview
Chapter 5 introduces the mysterious Paradise Motel with a hidden objective for players to discover.

## ✅ Implementation Complete

### Objective Details
**The Slacker (50 GUM):**
- Display text: "shhhh, don't tell anyone..."
- Hidden requirement: Visit Room 7 at night (8 PM - 6 AM Central Time)
- Players must discover this on their own!

**The Overachiever (100 GUM):**
- Display text: "???"
- TO BE DEFINED

## 📂 Required Images
Upload these to `/public/images/locations/`:
- ✅ `paradise-motel-day.png` - Main exterior (daytime)
- ✅ `paradise-motel-night.png` - Main exterior (nighttime)
- ✅ `lobby.png` - Lobby interior (main photo when entering)
- ✅ `room-6.png` - Room 6 interior (always accessible)
- ✅ `room-7-day.png` - Room 7 during daytime
- ✅ `room-7.png` - Room 7 at night (triggers reward)
- ✅ `room-7-peep.png` - Peephole view (accessible during day)

## 🎮 User Experience Flow

### 1. Entering Paradise Motel
- Day/night exterior changes automatically based on Central Time
- Click "🏨 Lobby" to enter

### 2. Inside Lobby
Four buttons available:
- **🛏️ Room 1** - Text description room
- **🚪 Room 6** - Always accessible, shows room-6.png
- **🌞/🌙 Room 7** - Dynamic behavior (see below)
- **🔔 Ring Bell** - Interactive bell at front desk

### 3. Room 7 Mechanics

#### DAYTIME (6 AM - 8 PM CT):
1. Shows `room-7-day.png`
2. Bottom button appears: "👁️ Peephole"
3. Click Peephole → shows `room-7-peep.png`
4. No GUM awarded

#### NIGHTTIME (8 PM - 6 AM CT):
1. Shows `room-7.png`
2. **INSTANT +50 GUM REWARD!** 🎉
3. Success message: "🎉 +50 GUM! Slacker Objective Complete!"
4. Only awarded ONCE per wallet
5. Tracked in objectives as completed

## 💾 Database Tracking

### No New Tables Needed!
Uses existing `gum_transactions` table with:
- **Source**: `'paradise_motel_room7_night'`
- **Amount**: 50 GUM
- **Type**: 'earned'
- **Description**: "Chapter 5 Slacker: shhhh, don't tell anyone"

### Query to Check Completions
```sql
SELECT 
  wallet_address,
  amount,
  created_at
FROM gum_transactions
WHERE source = 'paradise_motel_room7_night'
ORDER BY created_at DESC;
```

See `check-room7-completions.sql` for more queries!

## 🔧 Technical Details

### Files Modified:
- `/src/windows/Locations/ParadiseMotelMain.tsx` - Main motel logic
- `/src/components/WeeklyObjectives.tsx` - Chapter 5 display
- `/src/utils/weeklyObjectives.ts` - Chapter 5 objectives
- `/src/utils/paradiseMotelRoom7Tracking.ts` - Tracking logic
- `/src/fixed.ts` - Added Room 6 & Room 7 window IDs

### Time Logic:
- Uses `useTimeBasedImage()` hook
- Central Time Zone (America/Chicago)
- Day: 6 AM - 8 PM
- Night: 8 PM - 6 AM

### GUM Award Process:
1. User clicks Room 7 at night
2. Check if already completed
3. Call `/api/award-gum` endpoint
4. Award 50 GUM with source `paradise_motel_room7_night`
5. Update local state
6. Show success message
7. Objectives auto-refresh and show as complete

## 🧪 Testing Checklist

- [ ] Upload all 7 images to `/public/images/locations/`
- [ ] Refresh browser (Cmd+Shift+R)
- [ ] Open Paradise Motel from map
- [ ] Verify day/night exterior changes
- [ ] Enter Lobby, verify lobby.png shows
- [ ] Click Room 6, verify room-6.png shows
- [ ] **During DAY**: Click Room 7 → See day image → Click Peephole → See peep image
- [ ] **During NIGHT**: Click Room 7 → See night image + GUM reward
- [ ] Check My Locker objectives - Chapter 5 should show completion
- [ ] Verify only awarded once per wallet

## 🎯 Design Philosophy

The objective is intentionally vague ("shhhh, don't tell anyone...") to encourage:
- Exploration
- Community discussion
- Discovery moments
- Time-based gameplay (returning at night)

Players will need to figure out:
1. Go to Paradise Motel
2. Enter the Lobby
3. Try Room 7
4. Come back at night!

## 🔮 Future: Overachiever Objective
Currently set to "???" - you can define this later!
Ideas:
- Find a hidden item in one of the rooms
- Visit all rooms in specific order
- Ring the bell a certain number of times
- Find a secret code somewhere

---

**Status**: ✅ READY TO TEST
**Next Step**: Upload images and test in browser!

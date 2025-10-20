# Paradise Motel - Testing Guide

## 🧪 How to Test During Daytime

### Option 1: Force Night Mode (EASIEST - ALREADY DONE!)
**File**: `/src/windows/Locations/ParadiseMotelMain.tsx`
**Line ~124**

```typescript
// TESTING: Force night mode
const isDay = false; // Set to false = always night mode
```

**When done testing, change back to:**
```typescript
const isDay = timeBasedInfo.isDay; // Normal day/night behavior
```

### Option 2: Change Time Configuration
**File**: `/src/utils/timeBasedImages.ts`

Temporarily modify the day/night hours:
```typescript
export const DEFAULT_TIME_CONFIG: TimeConfig = {
  dayStart: 20,  // Changed from 6 - makes day start at 8 PM
  nightStart: 6, // Changed from 20 - makes night start at 6 AM
  timezone: 'America/Chicago'
};
```

This essentially flips day and night!

### Option 3: Change Your Computer's Time Zone
Set your system time to a timezone where it's currently nighttime (8 PM - 6 AM Central Time).

For example:
- If it's 2 PM Central Time now
- Set timezone to Tokyo (JST) 
- It would be 4 AM next day there = Night time ✅

## 🎮 Testing Checklist

### Day Mode Test (isDay = true):
- [ ] Open Paradise Motel
- [ ] Enter Lobby  
- [ ] Click Room 7
- [ ] Should see room-7-day.png
- [ ] Should see "👁️ Peephole" button at bottom
- [ ] Click Peephole
- [ ] Should see room-7-peep.png
- [ ] Should NOT get GUM reward

### Night Mode Test (isDay = false):
- [ ] Open Paradise Motel
- [ ] Enter Lobby
- [ ] Click Room 7  
- [ ] Should see room-7.png (night version)
- [ ] Should see "🎉 +50 GUM! Slacker Objective Complete!"
- [ ] Check wallet - should have +50 GUM
- [ ] Open My Locker objectives
- [ ] Chapter 5 Slacker should show as ✅ completed
- [ ] Try clicking Room 7 again - should NOT award GUM twice

### Other Lobby Tests:
- [ ] Room 1 - Opens text description
- [ ] Room 6 - Opens room-6.png
- [ ] Ring Bell - Shows bell message

### Visual Tests:
- [ ] Main exterior shows day image during day
- [ ] Main exterior shows night image during night
- [ ] Room 7 button shows 🌞 during day
- [ ] Room 7 button shows 🌙 during night

## 🔧 Current Testing Status

**✅ NIGHT MODE ENABLED FOR TESTING**

The code is currently set to:
```typescript
const isDay = false; // Always treats it as night
```

This means:
- Room 7 will ALWAYS show the night version
- Room 7 will ALWAYS award GUM when clicked
- You can test the completion flow right now!

## ⚠️ Important: Reset After Testing

**Before deploying to production**, change this line back:

```typescript
// In ParadiseMotelMain.tsx, line ~124
const isDay = timeBasedInfo.isDay; // ← Restore normal behavior
```

## 🐛 Troubleshooting

**Issue**: Not getting GUM reward
- Check console for errors
- Verify wallet is connected
- Check `/api/award-gum` endpoint is working
- Verify database connection

**Issue**: Objective not showing as complete
- Refresh the page
- Check browser console for API errors
- Verify GUM transaction was recorded in database

**Issue**: Wrong time of day
- Check system timezone
- Verify Central Time (America/Chicago) calculation
- Check timeBasedInfo.isDay value in console

## 📊 Check Database After Testing

```sql
-- See if your test completion was recorded
SELECT * FROM gum_transactions 
WHERE source = 'paradise_motel_room7_night'
ORDER BY created_at DESC 
LIMIT 5;
```

## 🎯 Quick Test Steps

1. **Right Now** - Night mode is enabled for testing
2. Open browser to localhost:3000
3. Connect wallet
4. Go to Paradise Motel
5. Click "Lobby"
6. Click "Room 7" (should have 🌙 icon)
7. Watch for +50 GUM message!
8. Check My Locker → Chapter 5 objectives

---

**Testing Mode**: 🌙 NIGHT MODE (ACTIVE)  
**Ready to Test**: ✅ YES
**Remember**: Change `isDay = false` back to `isDay = timeBasedInfo.isDay` when done!

# 🎯 GUM REFRESH OPTIMIZATION SUMMARY

## Problem
Your GUM balance was being refreshed too frequently, causing excessive API invocations as seen in the terminal output showing rapid successive calls to `getUserGumBalance`.

## Root Causes Identified
1. **GumProvider**: Auto-refreshed every 30 seconds
2. **GumDisplay**: Also auto-refreshed every 30 seconds  
3. **Multiple event listeners**: Triggering additional refreshes on various events
4. **No throttling**: Rapid successive calls weren't being prevented
5. **Daily login auto-claim**: Triggering immediate additional refreshes

## Optimizations Applied

### 1. Increased Refresh Intervals
- **GumProvider**: 30s → 5 minutes (300s)
- **GumDisplay**: 30s → 2 minutes (120s) 
- Combined effect: Much less frequent automatic refreshing

### 2. Added Throttling
- **GumProvider**: Max 1 refresh per 10 seconds
- **GumDisplay**: Max 1 refresh per 15 seconds
- Prevents rapid successive calls even when triggered by events

### 3. Improved Daily Login Flow
- Increased delay from 1s to 2s after daily login claim
- Removed redundant event dispatch (relies on throttled refresh)

## Expected Results
- **Before**: ~4-6 API calls per minute
- **After**: ~1-2 API calls per minute (60-70% reduction)
- Balance still updates when needed (earning GUM, spending, etc.)
- Maintains responsive UI with optimistic updates

## Monitoring
Use the provided `monitor-gum-refreshes.js` script in browser console to track the improvement:

```javascript
// Copy and paste the monitoring script in browser dev tools
// It will show you exactly how often balance is being fetched
```

## Manual Control
If you need to refresh balance manually, you can still:
1. Use the refresh button in GUM Center
2. Earn/spend GUM (triggers immediate refresh)
3. Use browser console: `window.dispatchEvent(new CustomEvent('gumBalanceUpdated'))`

## Files Modified
1. `src/contexts/GumContext.tsx` - Added throttling, increased intervals
2. `src/components/GumDisplay.tsx` - Added throttling, increased intervals  
3. `src/pages/_app.tsx` - Set conservative 5-minute auto-refresh interval

The changes maintain all functionality while dramatically reducing unnecessary API calls!

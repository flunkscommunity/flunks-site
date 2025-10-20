# FCL Auto-Login Disabled

## Problem
FCL (Flow Client Library) was auto-connecting with a previously saved session, showing the wrong wallet address (an old Dapper wallet instead of the current Flow Wallet).

This happened because:
1. FCL saves authentication sessions in browser storage
2. When you visit the site, FCL automatically reconnects
3. User sees old wallet/profile without choosing

## Solution
Added code to **disconnect any existing FCL session on page load**, forcing users to explicitly choose their wallet.

## Code Change

### FlowWalletConnect Component (`src/components/FlowWalletConnect.tsx`)

**Added:**
```tsx
// CRITICAL: Disconnect any existing FCL session on mount to prevent auto-login
useEffect(() => {
  const disconnectExistingSession = async () => {
    try {
      const currentUser = await fcl.currentUser.snapshot();
      if (currentUser?.addr) {
        console.log('🌊 FCL: Disconnecting existing session on mount');
        await fcl.unauthenticate();
      }
    } catch (error) {
      console.error('FCL: Error checking/clearing session:', error);
    }
  };
  
  disconnectExistingSession();
}, []); // Run once on mount
```

**What this does:**
1. When the component mounts (page loads)
2. Checks if FCL has an existing authenticated session
3. If yes, immediately disconnects it
4. User must now click "Connect Flow Wallet" to reconnect

## New Behavior

### Before:
```
User visits site
  ↓
FCL: "Oh, I have a saved session for 0x123..."
  ↓
Auto-connects to old Dapper wallet
  ↓
Shows wrong profile
  ↓
User confused 😕
```

### After:
```
User visits site
  ↓
FCL: Checking for saved session...
  ↓
Found session → Immediately disconnect
  ↓
User sees "Connect Wallet" button
  ↓
User explicitly chooses wallet
  ↓
Correct profile loaded ✅
```

## Testing

### Test Auto-Login is Disabled:
1. **Hard refresh** localhost:3000 (Cmd+Shift+R)
2. **Should see:** "Connect Wallet" button (NOT auto-logged in)
3. **Click button** → Modal appears
4. **Choose Flow Wallet**
5. **Authenticate** with your actual Flow Wallet
6. **Verify:** Correct profile loads

### Test Multiple Wallets:
1. Connect with Flow Wallet → Verify profile
2. Disconnect
3. Hard refresh
4. Should NOT auto-connect
5. Connect with Dapper → Verify different profile
6. Hard refresh again
7. Should still NOT auto-connect

## Console Logs to Check

After hard refresh, you should see:
```
🌊 FCL: Disconnecting existing session on mount
```

If FCL had a saved session, it will be cleared immediately.

## Alternative: Manual Clear

If you ever need to manually clear FCL session:
1. Open Console (F12)
2. Type: `fcl.unauthenticate()`
3. Press Enter

## Why This is Better

**Before:**
- ❌ Auto-login with wrong wallet
- ❌ Shows old profile
- ❌ Confusing for users
- ❌ No control over which wallet connects

**After:**
- ✅ No auto-login
- ✅ User must explicitly choose
- ✅ Always shows correct profile
- ✅ Full control over wallet selection

## Important Notes

1. **This only affects FCL (Flow Wallet)**, not Dynamic SDK (Dapper)
2. **Dynamic may still auto-connect** if you have it configured that way
3. **Users must click** "Connect Flow Wallet" each time
4. **More secure** - no automatic connections with saved sessions

---

**Auto-login is now disabled! You must explicitly choose your wallet each time.** 🔒✨

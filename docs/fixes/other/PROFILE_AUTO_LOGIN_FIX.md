# User Profile Auto-Login Fix

## Problem
When FCL auto-connected with Flow Wallet, the user profile wasn't loading. Instead of showing "Edit Flunky" (or the username), it showed "Create Profile" button again, even though the profile already existed.

## Root Cause
The `UserProfileContext` was only checking `primaryWallet` from Dynamic SDK, which doesn't populate when users connect via FCL (Flow Wallet extension).

**Flow:**
```
User opens site with Flow Wallet extension installed
  ↓
FCL auto-connects (wallet address available via FCL)
  ↓
UserProfileContext checks: primaryWallet?.address ❌ null
  ↓
Profile fetch doesn't run
  ↓
hasProfile = false
  ↓
Shows "Create Profile" instead of existing username
```

## Solution
Updated `UserProfileContext` to use the unified wallet, just like we did for the other contexts.

## Files Updated

### 1. UserProfileContext (`src/contexts/UserProfileContext.tsx`)
**Changed:**
```tsx
// BEFORE - Only checked Dynamic
const { primaryWallet } = useDynamicContext();
const walletAddress = primaryWallet?.address;

// AFTER - Checks unified wallet first
const { primaryWallet } = useDynamicContext();
const { address: unifiedAddress } = useUnifiedWallet();
const walletAddress = unifiedAddress || primaryWallet?.address;
```

**Impact:** Profile now loads with FCL connections

### 2. StakingContext (`src/contexts/StakingContext.tsx`)
**Changed:**
```tsx
// BEFORE
const { primaryWallet } = useDynamicContext();
const walletAddress = primaryWallet?.address || null;

// AFTER
const { primaryWallet } = useDynamicContext();
const { address: unifiedAddress } = useUnifiedWallet();
const walletAddress = unifiedAddress || primaryWallet?.address || null;
```

**Impact:** Staking info loads with FCL connections

## Fixed Flow

**Now when FCL auto-connects:**
```
User opens site with Flow Wallet extension installed
  ↓
FCL auto-connects (wallet address: 0xe327216d84335771)
  ↓
UnifiedWalletContext: ✅ address = "0xe327216d84335771"
  ↓
UserProfileContext: ✅ walletAddress = "0xe327216d84335771"
  ↓
Profile fetch runs with correct address
  ↓
Profile found in database
  ↓
hasProfile = true ✅
  ↓
Shows "Edit Flunky" (or username) ✅
```

## All Contexts Now Using Unified Wallet

Complete list of updated contexts:
- ✅ `UnifiedWalletContext` - The source of truth
- ✅ `AuthContext` - Authentication state
- ✅ `UserProfileContext` - User profiles ← **Just fixed**
- ✅ `UserPaginatedItems` - NFT fetching
- ✅ `GumContext` - Uses auth.walletAddress (which uses unified)
- ✅ `StakingContext` - Staking info ← **Just fixed**

## Testing Checklist

### Flow Wallet Auto-Connect:
- [ ] Have Flow Wallet extension installed
- [ ] Visit localhost:3000
- [ ] FCL auto-connects
- [ ] Profile loads automatically
- [ ] Shows "Edit Flunky" or your username ✅
- [ ] Does NOT show "Create Profile" if profile exists

### Dapper Connection:
- [ ] Connect with Dapper (regression test)
- [ ] Profile loads correctly
- [ ] Shows existing username
- [ ] No "Create Profile" for existing users

### New User Flow:
- [ ] Connect with Flow Wallet (new wallet, no profile)
- [ ] Should correctly show "Create Profile"
- [ ] Can create profile successfully
- [ ] Profile saves to database

## Key Insight

**Profile loading depends on wallet address being available BEFORE the component renders.**

With auto-connect, this happens instantly:
1. Page loads
2. FCL auto-connects (100ms)
3. UnifiedWalletContext updates (immediately)
4. UserProfileContext fetches (immediately)
5. Profile displayed (before user interaction)

Without unified wallet:
1. Page loads
2. FCL auto-connects (100ms)
3. primaryWallet still null ❌
4. UserProfileContext doesn't fetch ❌
5. No profile shown, asks to create ❌

## Console Logs to Check

After auto-connect, you should see:
```
👤 UserProfile: Fetching profile for wallet: 0xe327216d84335771
👤 UserProfile: Profile found
👤 UserProfile: hasProfile = true
```

If you see:
```
👤 UserProfile: No wallet address, clearing profile
```
Then the unified wallet isn't being detected (shouldn't happen now).

---

**Profile should now load correctly with FCL auto-connect!** 🎉

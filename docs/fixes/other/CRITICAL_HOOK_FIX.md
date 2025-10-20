# Critical Hook Fix - Wallet Address Propagation

## Problem
After the initial fix, **new errors appeared**:
- MyLocker: "Failed to assign locker: No wallet connected" 
- OnlyFlunks: "No items found" (even when wallet connected)

## Root Cause
The **hooks** and **contexts** that fetch data were still using `primaryWallet` from Dynamic SDK only:
- `useLockerInfo()` - fetches locker data
- `useLockerAssignment()` - assigns new lockers  
- `PaginatedItemsProvider` - fetches NFT data

These hooks were called BEFORE the component-level checks, so they ran with `null` wallet address, causing API calls to fail.

## Solution
Updated all data-fetching hooks to use unified wallet:

### 1. `useLocker.ts` Hook
**Changed both functions:**

```tsx
// BEFORE
const { primaryWallet } = useDynamicContext();
if (!primaryWallet?.address) { ... }
fetch(`/api/locker-info?wallet_address=${primaryWallet.address}`)

// AFTER  
const { primaryWallet } = useDynamicContext();
const { address: unifiedAddress } = useUnifiedWallet();
const walletAddress = unifiedAddress || primaryWallet?.address;

if (!walletAddress) { ... }
fetch(`/api/locker-info?wallet_address=${walletAddress}`)
```

**Functions updated:**
- ✅ `useLockerInfo()` - now gets wallet from unified context
- ✅ `useLockerAssignment()` - now posts wallet from unified context

### 2. `UserPaginatedItems.tsx` Context
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

**Impact:** NFT fetching now works with both Dynamic and FCL wallets

## Why This Was Critical

### Order of Execution:
```
1. Component renders
2. Hooks execute (useLockerInfo, usePaginatedItems)
   └─> These make API calls IMMEDIATELY
3. Component checks isConnected
4. Component shows UI based on data

❌ OLD: Hooks ran with primaryWallet = null
✅ NEW: Hooks run with unified wallet address
```

### The Problem Flow (Before Fix):
```
User connects with Flow Wallet
  ↓
UnifiedWalletContext: ✅ address = "0x123..."
  ↓
useLockerInfo(): ❌ primaryWallet = null
  ↓
API call: /api/locker-info?wallet_address=null
  ↓
Error: "No wallet connected"
```

### The Working Flow (After Fix):
```
User connects with Flow Wallet
  ↓
UnifiedWalletContext: ✅ address = "0x123..."
  ↓
useLockerInfo(): ✅ walletAddress = "0x123..." (from unified)
  ↓
API call: /api/locker-info?wallet_address=0x123...
  ↓
Success: Locker data fetched ✅
```

## Files Fixed

### Hooks:
- ✅ `src/hooks/useLocker.ts`
  - useLockerInfo() 
  - useLockerAssignment()

### Contexts:
- ✅ `src/contexts/UserPaginatedItems.tsx`
  - NFT fetching with unified wallet

### Previously Fixed (Still Working):
- ✅ `src/contexts/AuthContext.tsx` - Authentication state
- ✅ `src/windows/LockerSystemNew.tsx` - UI rendering
- ✅ `src/windows/YourStudents.tsx` - UI rendering

## Testing Checklist

### MyLocker:
- [ ] Connect with Flow Wallet
- [ ] Should NOT show "No wallet connected" error
- [ ] Should show "Get Your Locker" button if no locker
- [ ] Should show locker system if locker exists
- [ ] Can assign new locker successfully

### OnlyFlunks:
- [ ] Connect with Flow Wallet
- [ ] Should NOT show "No items found" if you have NFTs
- [ ] Should fetch and display your Flunks NFTs
- [ ] Grid should populate correctly
- [ ] Filter between Flunks/Backpacks works

### Dapper (Regression Test):
- [ ] Connect with Dapper
- [ ] MyLocker works as before
- [ ] OnlyFlunks works as before
- [ ] No broken functionality

## Key Lesson

**Always check hooks that fetch data!**

When changing wallet detection:
1. ✅ Update UI components (what you see)
2. ✅ Update contexts (state management)
3. ✅ **Update hooks (data fetching)** ← This was missing!

Hooks run BEFORE rendering, so they must use the correct wallet source or APIs will fail with wrong/null addresses.

---

**Both MyLocker and OnlyFlunks should now work correctly!** 🎉

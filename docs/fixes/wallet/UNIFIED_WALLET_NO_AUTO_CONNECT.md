# Unified Wallet System (No Auto-Connect)

## Summary
Restored the unified wallet system that provides users with **equal options** to connect with either:
- **Dapper Wallet** (via Dynamic SDK)
- **Flow Wallet/Lilico/Blocto** (via Flow FCL)

**Key Fix:** Disabled FCL's auto-connect behavior to prevent automatic login on page load.

## What Was Changed

### 1. UnifiedWalletContext (NEW - Fixed Version)
**File:** `src/contexts/UnifiedWalletContext.tsx`

**Key Features:**
- Manages both Dynamic SDK and FCL wallet connections
- **Disabled auto-connect:** `fcl.config().put('fcl.eventPollRate', 0)`
- Only connects when user explicitly clicks a button
- Provides unified address and connection state
- Exposes `connectFCL()` method for explicit Flow wallet connection

### 2. WalletConnectionModal (RESTORED)
**File:** `src/components/WalletConnectionModal.tsx`

**Features:**
- Modal UI showing both wallet options as equal choices
- Dapper button (via Dynamic SDK `setShowAuthFlow`)
- Flow Wallet button (via FCL `authenticate()`)
- Error handling and loading states
- Retro Windows 95 styling

### 3. UnifiedConnectButton (RESTORED)
**File:** `src/components/UnifiedConnectButton.tsx`

**Features:**
- Wraps any button/component
- If not connected: Opens WalletConnectionModal
- If connected: Renders children as-is
- Simple, clean API

## How It Works

### User Flow:
1. **User clicks "Connect Wallet"** → Opens modal with 2 equal options
2. **User chooses Dapper** → Opens Dynamic SDK auth flow
3. **User chooses Flow Wallet** → Opens FCL wallet discovery (Flow Wallet, Lilico, Blocto)
4. **Wallet connects** → Modal closes, user is authenticated

### No Auto-Connect:
- FCL is configured with `fcl.eventPollRate: 0`
- FCL `currentUser.subscribe()` only listens for changes
- No automatic `fcl.authenticate()` call on page load
- Connection ONLY happens when user clicks

## Files Modified

### Core System:
- ✅ `src/contexts/UnifiedWalletContext.tsx` - Main wallet orchestrator (includes `disconnect()`)
- ✅ `src/components/WalletConnectionModal.tsx` - Wallet selection modal
- ✅ `src/components/UnifiedConnectButton.tsx` - Button wrapper
- ✅ `src/components/WalletStatusBar.tsx` - NEW: Shows connected wallet and disconnect button

### App Integration:
- ✅ `src/pages/_app.tsx` - Added `<UnifiedWalletProvider>` wrapper
- ✅ `src/pages/index.tsx` - Added `<WalletStatusBar>` in top-right corner

### Contexts (Using unified wallet):
- ✅ `src/contexts/AuthContext.tsx` - Uses `useUnifiedWallet()`
- ✅ `src/contexts/UserProfileContext.tsx` - Uses unified address
- ✅ `src/contexts/UserPaginatedItems.tsx` - Uses unified address
- ✅ `src/contexts/StakingContext.tsx` - Uses unified address

### Hooks:
- ✅ `src/hooks/useLocker.ts` - Both `useLockerInfo` and `useLockerAssignment` use unified address

### Windows/Components:
- ✅ `src/windows/LockerSystemNew.tsx` - Uses `UnifiedConnectButton`, unified address
- ✅ `src/windows/UserProfile.tsx` - Uses `UnifiedConnectButton`
- ✅ `src/windows/YourStudents.tsx` - Uses `UnifiedConnectButton`
- ✅ `src/windows/Onlyflunks.tsx` - Uses `UnifiedConnectButton`
- ✅ `src/windows/GumCenterNew.tsx` - Uses `UnifiedConnectButton`

## Key Code Changes

### Before (Dynamic SDK Only):
```tsx
const { primaryWallet } = useDynamicContext();
const isConnected = !!primaryWallet;

<DynamicConnectButton>
  <button>Connect</button>
</DynamicConnectButton>
```

### After (Unified with Both Wallets):
```tsx
const { primaryWallet } = useDynamicContext();
const { isConnected, address } = useUnifiedWallet();

<UnifiedConnectButton>
  <button>Connect</button>
</UnifiedConnectButton>
```

## Configuration

### Dynamic SDK Config (`_app.tsx`):
```typescript
<DynamicContextProvider
  settings={{
    environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID,
    walletConnectors: [FlowWalletConnectors],
    
    // CRITICAL: Disable auto-reconnect
    initialAuthenticationMode: 'connect-only',
    
    walletsFilter: (wallets) => { ... }
  }}
>
```

### FCL Config (`config/fcl.ts`):
```typescript
fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
  .put("app.detail.title", "Flunks Site")
  .put("app.detail.icon", "https://flunks.wtf/images/flunks-logo.png")
```

### Disabled Auto-Connect (in UnifiedWalletContext):
```typescript
fcl.config().put('fcl.eventPollRate', 0); // Prevents auto-polling
```

## Testing Checklist

- [ ] Click "Connect Wallet" button → Modal appears
- [ ] Modal shows both Dapper and Flow Wallet options equally
- [ ] Click Dapper → Dynamic SDK auth flow opens
- [ ] Click Flow Wallet → FCL discovery opens (Flow Wallet/Lilico/Blocto)
- [ ] **No auto-login on page refresh**
- [ ] Locker objectives/chapters render at bottom after connection
- [ ] Profile loads correctly with either wallet
- [ ] NFT data fetches correctly with either wallet

## Benefits

✅ **User Choice:** Both wallets presented as equal options
✅ **No Auto-Connect:** User must explicitly choose to connect
✅ **Easy Disconnect:** Disconnect button in locker window and top-right of desktop
✅ **Wallet Switching:** Can disconnect and reconnect with different wallet
✅ **Unified API:** Components use one interface regardless of wallet type
✅ **Backward Compatible:** Still supports Dynamic SDK fully
✅ **Better UX:** Clear modal showing wallet options

## Technical Notes

- FCL event polling is disabled to prevent auto-connect
- FCL `currentUser.subscribe()` only reacts to manual authentication
- Dynamic SDK and FCL work independently but share unified state
- Address normalization handled in UnifiedWalletContext
- Disconnect works for both wallet types

---

**Result:** Users now have equal access to Dapper AND Flow wallets without any automatic connection behavior. The locker objectives/chapters should still render correctly since we're still using the same wallet detection logic, just with more options.

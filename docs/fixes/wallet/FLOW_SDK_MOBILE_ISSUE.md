# Flow SDK Mobile Wallet Issue - Root Cause Analysis

**Date:** October 20, 2025  
**Issue:** Flow React SDK doesn't populate on mobile, but works on desktop with browser extension

## Problem Summary

### Works ✅
- **Desktop + Browser Extension (Lilico/Flow Wallet)**
  - Extension injects `window.lilico`, `window.fcl_extensions`
  - FCL detects the extension
  - Dynamic Labs SDK can see the wallet
  - Connection works

### Doesn't Work ❌
- **Mobile Devices**
  - No browser extensions available on mobile
  - Need to use **wallet apps** (Dapper, Blocto)
  - Should work via **Deep Links** or **WalletConnect**
  - Flow SDK/Dynamic Labs not populating wallet options

## Root Causes

### 1. Mobile Wallet Discovery Not Configured
**Location:** `src/config/fcl.ts`

```typescript
// CURRENT - Only lists wallet service IDs
.put("discovery.authn.include", [
  "0x82ec283f88a62e65", // Dapper Wallet
  "0x18eb4ee6b3c026d2", // Blocto
  "0x33f75ff0b830dcec", // Ledger  
  "0x33f75ff0b830dcec", // Flow Wallet (Lilico)
  // ...
]);
```

**Problem:** This assumes wallets will be discovered through the discovery service, but:
- Mobile wallets need **explicit endpoints**
- Need **deep link configuration**
- Requires **WalletConnect integration** for some wallets

### 2. Missing Mobile-Specific Wallet Endpoints
FCL configuration lacks mobile wallet endpoints:

```typescript
// MISSING for mobile:
- Deep link URLs for Dapper app
- Deep link URLs for Blocto app  
- WalletConnect configuration
- Mobile-specific discovery endpoints
```

### 3. Dynamic Labs Mobile Wallet Filter Conflict
**Location:** `src/pages/_app.tsx` (lines 160-189)

```typescript
walletsFilter: (wallets) => {
  if (isMobile) {
    const mobileWallets = wallets.filter(w => 
      w.key?.includes('dapper') || 
      w.key?.includes('blocto')
    );
    return mobileWallets.length > 0 ? mobileWallets : wallets;
  }
  return wallets;
}
```

**Problem:** 
- Filters wallets BEFORE they're properly configured
- Dynamic Labs might not have mobile wallet data if FCL isn't configured for mobile
- Need to ensure wallets are discovered FIRST, then filtered

### 4. FCL Discovery Method
**Location:** `src/config/fcl.ts` (line 17)

```typescript
.put("discovery.wallet.method", "IFRAME/RPC")
```

**Problem:**
- `IFRAME/RPC` works for browser extensions
- Mobile wallets often need `HTTP/POST` or `POP/RPC` for deep links
- May need conditional method based on platform

## Why Desktop Works But Mobile Doesn't

### Desktop Flow:
1. Browser extension (Lilico) injects wallet providers
2. FCL detects `window.fcl_extensions`
3. Dynamic Labs SDK sees the wallet
4. User clicks connect → extension modal appears
5. ✅ Connection successful

### Mobile Flow (BROKEN):
1. No browser extension on mobile
2. FCL configured with discovery service
3. Discovery service returns wallet IDs
4. **BUT**: No mobile endpoints or deep links configured
5. Dynamic Labs SDK can't find usable wallets
6. `walletsFilter` returns empty or filtered list
7. ❌ No wallets shown to user

## The Solution

We need to:

1. **Add Mobile Wallet Endpoints** to FCL config
2. **Configure Deep Links** for Dapper and Blocto
3. **Update Discovery Method** for mobile
4. **Ensure Dynamic Labs** can detect mobile wallets
5. **Test on actual mobile device**

## Technical Details

### Mobile Wallet Connection Methods

#### Dapper Wallet (Mobile App)
- **App URL:** `dapper://`
- **Universal Link:** `https://www.meetdapper.com/...`
- **WalletConnect:** Supported
- **Service ID:** `0x82ec283f88a62e65`

#### Blocto (Mobile App)
- **App URL:** `blocto://`
- **Universal Link:** `https://blocto.app/...`
- **WalletConnect:** Supported  
- **Service ID:** `0x18eb4ee6b3c026d2`

### Required FCL Configuration Changes

```typescript
// Need to add based on platform detection:
if (isMobile) {
  fcl.config()
    .put("discovery.wallet.method", "HTTP/POST") // or "POP/RPC"
    .put("challenge.handshake", "https://fcl-discovery.onflow.org/authn")
    .put("walletconnect.projectId", "YOUR_PROJECT_ID") // If using WalletConnect
    .put("app.detail.url", "https://flunks.net")
    .put("app.detail.mobile.redirect", "flunks://")
}
```

## Next Steps

1. ✅ Document the issue (this file)
2. ⏭️ Create mobile-specific FCL configuration
3. ⏭️ Add WalletConnect support (if needed)
4. ⏭️ Configure deep links for mobile wallets
5. ⏭️ Test on iOS and Android
6. ⏭️ Update Dynamic Labs settings if needed

## Related Files

- `src/config/fcl.ts` - Main FCL configuration
- `src/pages/_app.tsx` - Dynamic Labs setup with mobile filter
- `src/contexts/UnifiedWalletContext.tsx` - Wallet context
- `src/utils/flowWalletDetection.ts` - Extension detection (desktop only)

## References

- [FCL Mobile Wallet Guide](https://developers.flow.com/tools/fcl-js/configure-fcl)
- [Dapper Wallet Integration](https://docs.meetdapper.com/)
- [Blocto SDK Documentation](https://docs.blocto.app/)
- [Dynamic Labs Flow Support](https://docs.dynamic.xyz/chains/flow)

## Console Debugging

On mobile, check:
```javascript
// In mobile browser console:
console.log('FCL Config:', window.fcl?.config)
console.log('Dynamic Wallets:', window.Dynamic)  
console.log('User Agent:', navigator.userAgent)
```

Look for:
- ❌ Missing wallet options in Dynamic modal
- ❌ Empty wallet list
- ❌ Discovery errors in console
- ❌ "No wallets found" messages

---

**Status:** Issue identified, solution pending implementation

# Flow SDK Mobile Detection Issue - CONFIRMED DIAGNOSIS

**Date:** October 20, 2025  
**Status:** 🔴 Issue Identified - Dynamic Labs + FCL Configuration Problem

## TL;DR - The Core Issue

**Your mobile wallet detection is TOO AGGRESSIVE** - it assumes wallets are available on mobile when they're not, which confuses Dynamic Labs SDK.

## What's Happening

### On Desktop ✅
```
User opens site
  → Lilico extension installed
  → window.lilico exists  
  → FCL detects extension
  → Dynamic Labs shows "Flow Wallet" option
  → User clicks → Extension popup → Connected!
```

### On Mobile ❌
```
User opens site on phone
  → No browser extensions on mobile
  → mobileWalletDetection.ts says "assume available on mobile"
  → detectMobileWallets() returns { lilico: true, dapper: true }
  → But these are NOT actually available
  → Dynamic Labs SDK expects wallets but can't find them
  → SDK fails to populate wallet options
  → User sees nothing or broken state
```

## The Smoking Gun

### File: `src/utils/mobileWalletDetection.ts` (Lines 63-87)

```typescript
const wallets = {
  // ❌ WRONG: Assumes Blocto is available just because it's mobile
  blocto: !!(window as any).blocto || !!(window as any).BloctoWallet || isMobile,
  
  // ❌ WRONG: Assumes Dapper is available on all mobile
  dapper: isMobile || !!(window as any).dapper,
  
  // ❌ WRONG: Assumes Lilico is available on all mobile
  lilico: isMobile || checkFlowWalletExtension(),
  
  // ...
};
```

**The Problem:**
- `isMobile` returns `true` on mobile devices
- Code uses `isMobile ||` logic, meaning it ALWAYS returns `true` for mobile
- **But the wallets are NOT actually installed!**
- This gives false positives to Dynamic Labs

## Why This Breaks Dynamic Labs

1. **Dynamic Labs queries available wallets**
2. **Your detection utility says "yes, wallets available"**
3. **Dynamic Labs SDK tries to connect to these wallets**
4. **But they don't actually exist** (window.lilico, window.blocto are undefined)
5. **SDK fails silently** or shows empty state
6. **User can't connect**

## The Actual Mobile Wallet Flow

### How Mobile SHOULD Work:

1. **User on mobile device**
2. **Dynamic Labs shows available options** (Dapper, Blocto)
3. **User clicks wallet button**
4. **Opens deep link** (dapper://, blocto://) OR WalletConnect
5. **If app not installed** → Redirect to app store
6. **If installed** → App opens → User approves → Callback to site

### What's Missing:

#### 1. No Deep Link Configuration in FCL
**File:** `src/config/fcl.ts`

```typescript
// MISSING:
.put("app.detail.url", "https://flunks.net")
.put("app.detail.mobile.redirect", "flunks://") // Or your deep link scheme
```

#### 2. Wallet Detection Returns False Positives
Should check if wallet app is ACTUALLY installed, not just assume:

```typescript
// CURRENT (WRONG):
lilico: isMobile || checkFlowWalletExtension()

// SHOULD BE:
lilico: checkFlowWalletExtension() // Only true if extension/app detected
```

#### 3. No WalletConnect Fallback
Mobile wallets often use WalletConnect for browser connections. Missing configuration:

```typescript
// MISSING in fcl config:
.put("walletconnect.projectId", "YOUR_WALLETCONNECT_PROJECT_ID")
```

## The Fix - Three Options

### Option 1: Fix Wallet Detection (Recommended)
**Change:** Make mobile wallet detection honest

```typescript
// In src/utils/mobileWalletDetection.ts
const wallets = {
  // Only return true if we can actually detect the wallet
  blocto: !!(window as any).blocto || !!(window as any).BloctoWallet,
  dapper: !!(window as any).dapper || !!(window as any).Dapper,
  lilico: checkFlowWalletExtension(), // Remove || isMobile
  fcl: !!(window as any).fcl,
};
```

**Why:** Let Dynamic Labs handle mobile wallet discovery its own way

### Option 2: Configure Proper Mobile Wallet Support
**Add:** Deep links and WalletConnect to FCL config

```typescript
// In src/config/fcl.ts
const isMobile = typeof window !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent);

if (isMobile) {
  config()
    .put("app.detail.url", "https://flunks.net")
    .put("discovery.wallet.method", "HTTP/POST")
    .put("walletconnect.projectId", process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)
}
```

### Option 3: Let Dynamic Labs Handle It All
**Remove:** Custom mobile wallet logic, rely on Dynamic Labs

```typescript
// In src/pages/_app.tsx - Remove walletsFilter for mobile
// Let Dynamic Labs SDK detect what's actually available
settings={{
  environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID,
  walletConnectors: [FlowWalletConnectors],
  initialAuthenticationMode: 'connect-only',
  // Remove walletsFilter - let SDK handle it
}}
```

## Recommended Solution

### Step 1: Fix False Positive Detection
```typescript
// src/utils/mobileWalletDetection.ts
export const detectMobileWallets = () => {
  const wallets = {
    // ONLY return true if actually detectable
    blocto: !!(window as any).blocto || !!(window as any).BloctoWallet,
    dapper: !!(window as any).dapper || !!(window as any).Dapper,  
    lilico: checkFlowWalletExtension(),
    fcl: !!(window as any).fcl,
  };
  
  return wallets;
};
```

### Step 2: Remove Mobile Wallet Filter from Dynamic Labs
```typescript
// src/pages/_app.tsx
<DynamicContextProvider
  settings={{
    environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID,
    walletConnectors: [FlowWalletConnectors],
    initialAuthenticationMode: 'connect-only',
    // Remove walletsFilter entirely - let Dynamic Labs handle mobile
  }}
>
```

### Step 3: Let Dynamic Labs SDK Handle Mobile Wallets
- Dynamic Labs has built-in mobile wallet support for Flow
- It knows how to open deep links for Dapper, Blocto, etc.
- **Stop fighting it with custom logic**

### Step 4: Add Deep Link Config (If Needed)
```typescript
// src/config/fcl.ts
config({
  "accessNode.api": FLOW_ACCESS_NODE,
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Flunks",
  "app.detail.icon": "https://flunks.net/flunks-logo.png",
  "app.detail.url": "https://flunks.net", // Required for mobile callbacks
  "challenge.handshake": "https://fcl-discovery.onflow.org/authn",
});
```

## Testing Plan

### Test on Mobile

1. **iPhone Safari** → Should show Dapper/Blocto options
2. **Android Chrome** → Should show Dapper/Blocto options  
3. **Click Dapper** → Should open Dapper app or app store
4. **Click Blocto** → Should open Blocto app or app store
5. **After install** → Should callback and connect

### Expected Console Logs

```javascript
// BEFORE FIX (Wrong):
📱 Enhanced Mobile Wallet Detection: {
  blocto: true,   // ❌ False positive
  dapper: true,   // ❌ False positive  
  lilico: true,   // ❌ False positive
}

// AFTER FIX (Correct):
📱 Enhanced Mobile Wallet Detection: {
  blocto: false,  // ✅ Honest - not detected
  dapper: false,  // ✅ Honest - not detected
  lilico: false,  // ✅ Honest - not detected
}
// Dynamic Labs SDK takes over with proper mobile wallet handling
```

## Files That Need Changes

1. ✅ **`src/utils/mobileWalletDetection.ts`** - Remove false positives
2. ✅ **`src/pages/_app.tsx`** - Remove walletsFilter
3. ⚠️ **`src/config/fcl.ts`** - Add app.detail.url (nice to have)
4. ⚠️ **`.env.local`** - Add WalletConnect Project ID (if using WC)

## Why Desktop Works

Desktop browser extension detection is HONEST:

```typescript
lilico: !!(window.lilico)  // Only true if extension injected window.lilico
```

Mobile should be equally honest!

## Next Actions

1. Make the three file changes above
2. Test on actual mobile device
3. Check Dynamic Labs docs for Flow mobile wallet support
4. Consider WalletConnect integration for better mobile UX

---

**Bottom Line:** Stop lying to Dynamic Labs about wallet availability on mobile. Let it handle mobile wallet discovery properly.

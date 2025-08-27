## Mobile Wallet Authentication - Reverted to Basic Dynamic Labs

### Changes Made:

**✅ SIMPLIFIED `src/pages/_app.tsx`:**
- Removed complex `walletsFilter` logic that was injecting mobile-specific wallets
- Removed all mobile wallet override components (`EnhancedMobileWalletAuth`, etc.)
- Removed complex Dynamic Labs configuration (`overrides`, `events`, `initialAuthenticationMode`)
- Now using basic Dynamic Labs setup with just:
  - `environmentId`
  - `walletConnectors: [FlowWalletConnectors]` 
  - Simple `walletsFilter` that just logs and returns wallets as-is

**✅ REMOVED COMPLEX MOBILE LOGIC:**
- No more mobile device detection
- No more forced wallet injection
- No more deep linking logic
- No more window property manipulation
- No more Dynamic SDK refresh calls

### What This Means:

**🖥️ Desktop:** Should work exactly the same as before
**📱 Mobile:** Will now show whatever wallets Dynamic Labs naturally detects for mobile Flow blockchain

### Test Instructions:

1. **Desktop:** Open site, try connecting wallet - should work normally
2. **Mobile Safari/Chrome:** 
   - Open site on mobile device
   - Try wallet connection
   - Should see clean Dynamic Labs mobile interface
   - May show different wallet options than before (this is expected and desired)

### Expected Mobile Behavior:
- Dynamic Labs will handle mobile wallet detection automatically
- Should show mobile-appropriate wallet options
- No more complex overrides causing authentication failures
- Clean, standard Dynamic Labs mobile experience

---

**If mobile still has issues:** The problem is likely with the Flow blockchain connector setup itself, not our custom mobile logic (since we removed it all).

**Next debugging step would be:** Check if `FlowWalletConnectors` from `@dynamic-labs/flow` properly supports mobile, or if we need different wallet connectors for mobile vs desktop.

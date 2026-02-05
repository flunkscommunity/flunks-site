# 🚀 Quick Start: Wallet Connection Testing

**For: Developers & QA**  
**Goal: Test wallet connection works first time**

---

## 🧪 Test on Android Device

### 1. Fresh Install Test

```bash
# Clear app data
adb shell pm clear net.flunks.app

# Or manually: Settings → Apps → Flunks → Clear Data
```

**Expected Flow:**
1. Open Flunks
2. Tap "Connect Wallet"
3. Flow Wallet opens automatically
4. Approve connection
5. Return to Flunks → Logged in ✅

**Success Criteria:** <30 seconds, no errors

---

### 2. Run Diagnostics

**In App:**
Navigate to `/wallet-diagnostics`

**Expected:**
- ✅ All "pass" or "info" status
- ❌ No "fail" status
- ⚠️ Warnings are acceptable

**If failures:** Follow "Fix" suggestions in report

---

### 3. Check Configuration

**Quick verify FCL config:**

```javascript
// In browser console (Chrome remote debug)
await fcl.config().get('walletconnect.projectId')
// Should return: "9b70cfa398b2355a5eb9b1cf99f4a981"

await fcl.config().get('discovery.wallet')
// Should return: "https://fcl-discovery.onflow.org/mainnet/authn"

await fcl.config().get('flow.network')
// Should return: "mainnet"
```

---

## 🐛 Common Issues - Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Wallet won't open | Install Flow Wallet from Play Store |
| Stuck connecting | Wait 30s, then try again |
| Not logged in after approval | Close both apps, try again |
| Connection drops | Disable battery optimization for Flunks |
| Deep link fails | Check AndroidManifest has `<queries>` |

---

## 📱 Required Apps

**Test Device Must Have:**
- ✅ Flunks app (latest build)
- ✅ Flow Wallet app (from Play Store)
- ✅ Chrome (for remote debugging)
- ✅ Active internet (WiFi or cellular)

---

## 🔍 Remote Debug Setup

```bash
# Enable USB debugging on Android device
# Settings → Developer Options → USB Debugging

# Connect via USB
adb devices

# Open Chrome on desktop
# Navigate to: chrome://inspect
# Select your device's WebView

# Now you can access console logs
```

---

## 📊 Success Metrics

Track these:

```typescript
// Connection attempt
analytics.track('wallet_connection_attempt');

// Success (measure time)
const startTime = Date.now();
// ... connection happens ...
const duration = Date.now() - startTime;
analytics.track('wallet_connection_success', { duration });

// Failure
analytics.track('wallet_connection_failed', { 
  error: error.message 
});
```

**Targets:**
- Success rate: >90%
- Time to connect: <30s
- Session persistence: >95%

---

## 📋 Pre-Release Checklist

**Code:**
- [ ] FCL config uses `/mainnet/` endpoints
- [ ] Discovery method is `POP/RPC` for mobile
- [ ] WalletConnect Project ID is set
- [ ] AndroidManifest has wallet `<queries>`

**Testing:**
- [ ] Fresh install connects first try
- [ ] Session persists after app restart  
- [ ] Deep linking works (wallet → app)
- [ ] Diagnostics show all green
- [ ] Tested on 2+ different devices

**Documentation:**
- [ ] User guide published
- [ ] Support team briefed
- [ ] Analytics tracking enabled
- [ ] Known issues documented

---

## 🆘 Emergency Rollback

If connection issues spike after deployment:

```bash
# Revert FCL config changes
git revert <commit-hash>

# Quick fix: force WalletConnect
# In src/config/fcl.ts, temporarily:
const DISCOVERY_METHOD = 'WC/RPC'; // Use WC even on mobile

# Redeploy
npm run build && deploy
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ANDROID_WALLET_SETUP_TESTING.md` | Technical testing guide |
| `USER_WALLET_SETUP_GUIDE_ANDROID.md` | User instructions |
| `FLOW_MOBILE_IMPLEMENTATION_SUMMARY.md` | Complete implementation details |
| `wallet-diagnostics.tsx` | In-app diagnostic tool |
| `walletDiagnostics.ts` | Diagnostic utilities |

---

## 🎯 Day of Deployment

### Morning (Pre-Deploy)
1. ☐ Run full diagnostics on test device
2. ☐ Verify all tests pass
3. ☐ Confirm analytics tracking works
4. ☐ Brief support team on new process

### Deploy
5. ☐ Deploy web changes
6. ☐ Build and sign Android APK/AAB
7. ☐ Submit to Play Store (or distribute APK)
8. ☐ Publish user guide to Discord/website

### Evening (Post-Deploy)
9. ☐ Monitor analytics dashboard
10. ☐ Watch support channels for issues
11. ☐ Test production build yourself
12. ☐ Document any new issues found

---

## 💡 Pro Tips

**For Testing:**
- Test on both WiFi and cellular data
- Try different Android versions if possible
- Test with fresh wallet (not your dev wallet)
- Time the connection process (aim for <30s)

**For Support:**
- Always ask for diagnostic report first
- Check if wallet app is actually installed
- Verify internet connection
- Try network switch (WiFi ↔ cellular)

**For Monitoring:**
- Watch first 24h closely for patterns
- Track success rate by device model
- Note which wallets work best
- Gather qualitative feedback

---

## 🔗 Quick Links

**Test Wallet Connection:**
`[Your App URL]/wallet-diagnostics`

**User Guide:**
`docs/USER_WALLET_SETUP_GUIDE_ANDROID.md`

**Flow Docs:**
https://developers.flow.com/blockchain-development-tutorials/cadence/mobile

**Remote Debug:**
`chrome://inspect`

---

**Questions?** Check `FLOW_MOBILE_IMPLEMENTATION_SUMMARY.md` for full details.

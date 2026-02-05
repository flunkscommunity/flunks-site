# Android Wallet Setup & Testing Guide

**Target:** Ensure first-time users can successfully connect their Flow wallet on Android

---

## 🎯 Current Issues

Users are struggling with:
- Wallet connection not working on first try
- Unclear what wallet apps they need installed
- Deep linking between Flunks app and wallet apps
- WalletConnect session not persisting

---

## ✅ Prerequisites (User Must Have)

### Required Apps
1. **Flunks App** (installed from APK or Play Store)
2. **Flow Wallet App** (one of):
   - [Flow Wallet (Lilico)](https://play.google.com/store/apps/details?id=io.outblock.lilico) - **RECOMMENDED**
   - [Blocto](https://play.google.com/store/apps/details?id=com.portto.blocto)
   - [Dapper Wallet](https://www.meetdapper.com/) - Web-based, no app needed

### System Requirements
- Android 8.0+ (API level 26+)
- Active internet connection
- Chrome or system WebView updated

---

## 🔧 Technical Configuration Review

### 1. FCL Configuration (`src/config/fcl.ts`)

Your current setup is mostly correct, but needs optimization:

#### ✅ What's Working
- WalletConnect Project ID is set
- Mainnet configuration
- Mobile deep linking detection
- wcRequestHook for handling WalletConnect URIs

#### ⚠️ Potential Issues

**Issue 1: Discovery URL Path**
```typescript
// Current:
"discovery.wallet": "https://fcl-discovery.onflow.org/authn"

// Flow recommends for mainnet:
"discovery.wallet": "https://fcl-discovery.onflow.org/mainnet/authn"
```

**Issue 2: Mobile Method**
```typescript
// Current:
const DISCOVERY_METHOD = IS_MOBILE_APP ? 'WC/RPC' : 'IFRAME/RPC';

// Better for Android:
const DISCOVERY_METHOD = IS_MOBILE_APP ? 'POP/RPC' : 'IFRAME/RPC';
// POP/RPC opens wallet in new window, better for mobile deep linking
```

**Issue 3: App URL Scheme**
```typescript
// Current:
const APP_URL = typeof window !== 'undefined'
  ? (isMobileApp() ? "flunks://" : window.location.origin)
  : "https://flunks.net";

// Better for Android (use package name):
const APP_URL = typeof window !== 'undefined'
  ? (isMobileApp() ? "net.flunks.app://" : window.location.origin)
  : "https://flunks.net";
```

---

## 📱 Android App Configuration

### AndroidManifest.xml

Your current manifest is good, but verify these critical parts:

```xml
<!-- ✅ CORRECT: Custom scheme for wallet callbacks -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="flunks" />
</intent-filter>

<!-- ✅ CORRECT: Package name scheme -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="net.flunks.app" />
</intent-filter>

<!-- ✅ CORRECT: WalletConnect deep link handler -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="wc" />
</intent-filter>

<!-- ✅ CORRECT: Query for wallet apps -->
<queries>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="frw" />
    </intent>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="lilico" />
    </intent>
</queries>
```

### Additional Queries Needed

Add to `<queries>` section:

```xml
<!-- Add support for more wallet apps -->
<intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="blocto" />
</intent>
<intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="wc" />
</intent>
```

---

## 🧪 Testing Checklist

### Pre-Test Setup

1. **Install Flow Wallet** on test device
2. **Create/Import a Flow wallet** in the app
3. **Fund the wallet** with small amount of FLOW (testnet or mainnet)
4. **Clear Flunks app data** (Settings → Apps → Flunks → Clear Data)

### Test Scenario 1: Fresh Install (First Time User)

**Steps:**
1. Open Flunks app
2. Tap "Connect Wallet"
3. Select "Flow Wallet" option
4. **Expected:** Flow Wallet app opens automatically
5. In Flow Wallet, review connection request
6. Approve connection
7. **Expected:** Return to Flunks app, automatically logged in

**Success Criteria:**
- ✅ Flow Wallet opens without manual app switching
- ✅ Connection request shows "Flunks" with logo
- ✅ After approval, returns to Flunks automatically
- ✅ User sees their wallet address in Flunks
- ✅ NFT collection loads

**Common Failures:**
- ❌ Flow Wallet doesn't open → Deep linking issue
- ❌ Stuck on "Connecting..." → WalletConnect timeout
- ❌ Returns to Flunks but not logged in → Callback handling issue
- ❌ Error "Session expired" → Session storage issue

### Test Scenario 2: Returning User

**Steps:**
1. Close Flunks app completely
2. Reopen Flunks app
3. **Expected:** Automatically reconnects to wallet

**Success Criteria:**
- ✅ No need to connect again
- ✅ Wallet address displayed immediately
- ✅ Collection loads automatically

**Common Failures:**
- ❌ Need to reconnect every time → Session persistence issue
- ❌ "Session expired" error → WalletConnect session not saved

### Test Scenario 3: Deep Link Return

**Steps:**
1. Open Flunks app
2. Trigger wallet connection
3. While in Flow Wallet, switch to another app
4. Open Flunks from recent apps
5. Go back to Flow Wallet and approve
6. **Expected:** Returns to Flunks and connects

**Success Criteria:**
- ✅ Connection still works after app switching
- ✅ Properly handles return from wallet

---

## 🐛 Debugging Tools

### Enable Debug Mode

Add to Flunks app for testing:

```typescript
// Add to src/config/fcl.ts (development only)
if (process.env.NODE_ENV === 'development') {
  // Enable FCL debugging
  localStorage.setItem('fcl:debug', 'true');
  
  // Log all FCL events
  fcl.events.subscribe((event: any) => {
    console.log('🌊 FCL Event:', event);
  });
}
```

### Android Debugging via ADB

```bash
# View app logs in real-time
adb logcat | grep -i "capacitor\|flunks\|flow\|wallet"

# View all WebView console logs
adb logcat | grep -i "console"

# Clear app data for fresh test
adb shell pm clear net.flunks.app
```

### Chrome Remote Debugging

1. Connect Android device via USB
2. Enable USB debugging on device
3. Open Chrome on desktop: `chrome://inspect`
4. Select your WebView
5. Console will show all JavaScript logs

---

## 🔍 Common Issues & Solutions

### Issue 1: "Wallet Not Opening"

**Symptom:** Tap "Connect Wallet" but nothing happens

**Causes:**
- Flow Wallet app not installed
- Deep link not registered properly
- Android intent query not configured

**Solution:**
1. Verify Flow Wallet is installed
2. Check AndroidManifest has `<queries>` section
3. Test deep link manually:
   ```bash
   adb shell am start -a android.intent.action.VIEW \
     -d "frw://wc?uri=test"
   ```

### Issue 2: "Connection Timeout"

**Symptom:** Stuck on "Connecting..." spinner

**Causes:**
- WalletConnect relay server unreachable
- Invalid WalletConnect Project ID
- Network firewall blocking WebSocket

**Solution:**
1. Check WalletConnect Project ID is valid
2. Test on different network (cellular vs WiFi)
3. Check browser console for WebSocket errors
4. Verify `.env` has correct ID:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=9b70cfa398b2355a5eb9b1cf99f4a981
   ```

### Issue 3: "Session Not Persisting"

**Symptom:** User must reconnect every time they open app

**Causes:**
- WalletConnect session not saved to localStorage
- Capacitor storage cleared on app restart
- Session expired on server

**Solution:**
1. Check localStorage after connection:
   ```javascript
   console.log('WC Sessions:', localStorage.getItem('wc@2:client:0.3'));
   ```
2. Ensure Capacitor preferences plugin is used for persistence
3. Add session restore logic on app startup

### Issue 4: "Approved in Wallet but Not Connected in Flunks"

**Symptom:** Approve in Flow Wallet but Flunks shows disconnected

**Causes:**
- Deep link callback not handled
- fcl.currentUser not updated
- App state not refreshing

**Solution:**
1. Check App URL listener in `UnifiedWalletContext.tsx`:
   ```typescript
   App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
     console.log('🔗 App opened with URL:', event.url);
     // Should trigger FCL session restore
   });
   ```
2. Verify FCL currentUser subscription is active
3. Add explicit session check after return

---

## 📋 Deployment Checklist

Before releasing to users:

### Configuration
- [ ] WalletConnect Project ID in `.env.production`
- [ ] Mainnet access node configured
- [ ] Discovery URLs use `/mainnet/` path
- [ ] Mobile detection working correctly
- [ ] Deep link schemes registered in AndroidManifest

### Testing
- [ ] Fresh install connects on first try
- [ ] Session persists after app restart
- [ ] Works with Flow Wallet app
- [ ] Works with Blocto app
- [ ] Deep linking returns to app correctly
- [ ] Error states show helpful messages
- [ ] Connection timeout handled gracefully

### User Experience
- [ ] Clear instructions shown before wallet connection
- [ ] "Install Flow Wallet" link if app not found
- [ ] Loading state shows during connection
- [ ] Success state clearly indicates connection
- [ ] Disconnect button works
- [ ] Reconnect works after manual disconnect

### Documentation
- [ ] User setup guide published
- [ ] Troubleshooting FAQ available
- [ ] Support contact info provided
- [ ] Known issues documented

---

## 📄 User-Facing Setup Guide

Create this as in-app help or separate document:

### "How to Connect Your Wallet (First Time)"

**Step 1: Install Flow Wallet**
1. Open Google Play Store
2. Search for "Flow Wallet" or "Lilico"
3. Install the official Flow Wallet app
4. Open it and create or import your wallet

**Step 2: Connect to Flunks**
1. Open Flunks app
2. Tap "Connect Wallet"
3. Select "Flow Wallet"
4. Flow Wallet will open automatically
5. Review the connection request
6. Tap "Approve"
7. You'll return to Flunks, now connected!

**Troubleshooting:**
- **Wallet won't open?** Make sure Flow Wallet app is installed
- **Stuck connecting?** Check your internet connection
- **Connection timed out?** Try again, it sometimes takes 2 tries
- **Not logged in after approval?** Close and reopen Flunks

**Need Help?**
Contact support with this info:
- Your wallet address
- Android version
- Screenshot of error (if any)

---

## 🔬 Advanced Diagnostics

### Create a Wallet Diagnostics Screen

Add to your app for internal testing:

```typescript
// src/pages/wallet-diagnostics.tsx
export default function WalletDiagnostics() {
  const [results, setResults] = useState<any>({});
  
  const runDiagnostics = async () => {
    const tests = {
      // Check Capacitor
      isCapacitor: !!(window as any).Capacitor,
      platform: (window as any).Capacitor?.getPlatform?.(),
      
      // Check FCL Config
      accessNode: await fcl.config().get('accessNode.api'),
      network: await fcl.config().get('flow.network'),
      wcProjectId: await fcl.config().get('walletconnect.projectId'),
      discoveryWallet: await fcl.config().get('discovery.wallet'),
      
      // Check WalletConnect
      wcSessions: localStorage.getItem('wc@2:client:0.3'),
      fclSessions: localStorage.getItem('FCL:AUTH'),
      
      // Check Wallet Apps
      canOpenFlowWallet: await canOpenUrl('frw://'),
      canOpenLilico: await canOpenUrl('lilico://'),
      canOpenBlocko: await canOpenUrl('blocto://'),
      
      // Check Network
      canReachFlow: await testFlowConnection(),
      canReachWC: await testWalletConnectRelay(),
    };
    
    setResults(tests);
  };
  
  return (
    <div>
      <button onClick={runDiagnostics}>Run Diagnostics</button>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
```

---

## 📊 Success Metrics

Track these to measure improvement:

- **First-Time Connection Success Rate** - % of new users who successfully connect on first try
- **Average Time to Connect** - How long from "Connect Wallet" tap to connected state
- **Session Persistence Rate** - % of returning users who auto-reconnect
- **Connection Error Rate** - % of connection attempts that fail
- **Support Tickets** - Number of wallet-related support requests

**Target Goals:**
- 90%+ first-time connection success
- <30 seconds average connection time
- 95%+ session persistence
- <5% connection errors

---

## 🎯 Next Steps

1. **Implement fixes** from "Potential Issues" section above
2. **Add diagnostics tool** for easier debugging
3. **Test with real users** (beta group)
4. **Gather feedback** and iterate
5. **Document common issues** users encounter
6. **Create video tutorials** showing the process
7. **Set up analytics** to track success rates

---

## 📚 References

- [Flow Mobile Development](https://developers.flow.com/blockchain-development-tutorials/cadence/mobile)
- [FCL Documentation](https://developers.flow.com/tools/clients/fcl-js)
- [WalletConnect v2 Docs](https://docs.walletconnect.com/)
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Android App Links](https://developer.android.com/training/app-links)

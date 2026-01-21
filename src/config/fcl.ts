import { config } from "@onflow/fcl";
import { init as initFclWc } from "@onflow/fcl-wc";
import * as fcl from "@onflow/fcl";

/**
 * Check if running inside Capacitor mobile app
 * Duplicated here to avoid circular import with buildMode.ts
 */
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

// CRITICAL: Clear any cached testnet configuration from localStorage
// FCL caches config in localStorage, and old testnet settings can persist
if (typeof window !== 'undefined') {
  const fclKeys = Object.keys(localStorage).filter(key => key.startsWith('fcl:'));
  if (fclKeys.length > 0) {
    console.log('🧹 Clearing cached FCL config from localStorage:', fclKeys);
    fclKeys.forEach(key => {
      // Only clear if it contains testnet references
      const value = localStorage.getItem(key);
      if (value && (value.includes('testnet') || value.includes('rest-testnet') || value.includes('access-testnet'))) {
        console.log('⚠️ Removing testnet cache:', key);
        localStorage.removeItem(key);
      }
    });
  }
}

// Configure FCL for Flow mainnet
const FLOW_ACCESS_NODE = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-mainnet.onflow.org";
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "9b70cfa398b2355a5eb9b1cf99f4a981";

// WalletConnect metadata URL
// On mobile (Capacitor), prefer the app's URL scheme so wallets can return to the app.
// On web, use the current origin.
const APP_URL = typeof window !== 'undefined'
  ? (isMobileApp() ? "flunks://" : window.location.origin)
  : "https://flunks.net";

console.log('🌊 Configuring FCL with access node:', FLOW_ACCESS_NODE);
console.log('📱 WalletConnect Project ID:', WALLETCONNECT_PROJECT_ID ? 'Set ✅' : 'Missing ❌');
console.log('🌐 App URL:', APP_URL);

// Detect if running in mobile app
const IS_MOBILE_APP = isMobileApp();
console.log('📱 Mobile App Mode:', IS_MOBILE_APP ? 'YES' : 'NO');

// For mobile apps, go directly to Flow Wallet via WalletConnect
// Skip the discovery UI which doesn't work well in mobile WebViews
const DISCOVERY_METHOD = IS_MOBILE_APP ? 'WC/RPC' : 'IFRAME/RPC';
console.log('🔗 Discovery Method:', DISCOVERY_METHOD);

// Flow Wallet's universal link for WalletConnect
const FLOW_WALLET_UNIVERSAL_LINK = "https://frw-link.lilico.app/wc";

// Flow Wallet's WalletConnect service - uid MUST be a valid universal link URL
const FLOW_WALLET_SERVICE = {
  "f_type": "Service",
  "f_vsn": "1.0.0", 
  "type": "authn",
  "uid": FLOW_WALLET_UNIVERSAL_LINK, // Critical: must be universal link for deep linking
  "endpoint": "flow_authn",
  "method": "WC/RPC",
  "provider": {
    "name": "Flow Wallet",
    "icon": "https://lilico.app/logo.png"
  }
};

// WalletConnect request hook to intercept URI and open wallet on mobile
const wcRequestHook = async (data: any) => {
  console.log('🔗 WC Request Hook:', JSON.stringify(data, null, 2));
  
  // Intercept session request and open Flow Wallet directly
  if (IS_MOBILE_APP && data.uri) {
    console.log('📱 WC URI received in hook:', data.uri);
    
    // Construct the Flow Wallet universal link with WC URI
    const flowWalletUrl = `${FLOW_WALLET_UNIVERSAL_LINK}?uri=${encodeURIComponent(data.uri)}`;
    console.log('📱 Opening Flow Wallet via wcRequestHook:', flowWalletUrl);
    
    // Use Capacitor Browser plugin to open in external browser/app
    // This keeps our app in the background and allows proper deep linking back
    try {
      const { Browser } = await import('@capacitor/browser');
      console.log('📱 Using Capacitor Browser plugin to open Flow Wallet');
      await Browser.open({ 
        url: flowWalletUrl,
        windowName: '_system', // Open in system browser/app handler
        presentationStyle: 'fullscreen'
      });
    } catch (error) {
      console.error('⚠️ Browser plugin failed, trying App plugin:', error);
      // Fallback to App plugin for opening URLs
      try {
        const { App } = await import('@capacitor/app');
        // Use Android intent to open the URL
        if ((window as any).Capacitor?.getPlatform?.() === 'android') {
          const { AppLauncher } = await import('@capacitor/app-launcher');
          await AppLauncher.openUrl({ url: flowWalletUrl });
        } else {
          // iOS - just open the URL which should trigger universal links
          window.open(flowWalletUrl, '_system');
        }
      } catch (fallbackError) {
        console.error('⚠️ All methods failed, using window.open:', fallbackError);
        window.open(flowWalletUrl, '_system');
      }
    }
    
    // Return true to indicate we handled this
    return true;
  }
  
  return false;
};

// For mobile apps, configure WalletConnect to open Flow Wallet directly
if (IS_MOBILE_APP) {
  // Add Flow Wallet as a direct service (skips discovery UI)
  config({
    // Enable WalletConnect modal behavior
    "discovery.wallet.method": "WC/RPC",
    
    // Force WalletConnect to show QR/deep-link modal
    "fcl.walletconnect.method": "qr", // or "mobile"
  });
  
  console.log('📱 Mobile: Configured for WalletConnect with Flow Wallet');
}

// Simplified FCL configuration - use standard mainnet endpoints
config({
  "flow.network": "mainnet",
  "accessNode.api": "https://rest-mainnet.onflow.org",
  
  // Always use the discovery endpoint - WalletConnect will handle mobile
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  
  // Discovery method - WC/RPC for mobile enables WalletConnect
  "discovery.wallet.method": DISCOVERY_METHOD,
  
  // App details
  "app.detail.title": "Flunks",
  "app.detail.icon": "https://flunks.net/flunks-logo.png",
  "app.detail.url": APP_URL,
  
  // WalletConnect - required for mobile wallet connections
  "walletconnect.projectId": WALLETCONNECT_PROJECT_ID,
  
  // Contracts
  "0xSemesterZero": "0x807c3d470888cc48",
  "0xFlunks": "0x807c3d470888cc48",
});

// Verify and log the actual configuration that will be used
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    const actualAccessNode = await config().get('accessNode.api');
    const actualNetwork = await config().get('flow.network');
    const actualDiscoveryWallet = await config().get('discovery.wallet');
    const actualDiscoveryAuthn = await config().get('discovery.authn.endpoint');

    console.log('✅ FCL Configuration verified (Mainnet):', {
      accessNode: actualAccessNode,
      network: actualNetwork,
      expectedAccessNode: FLOW_ACCESS_NODE,
      expectedNetwork: 'mainnet',
      walletConnectConfigured: !!WALLETCONNECT_PROJECT_ID,
      discoveryWallet: actualDiscoveryWallet,
      discoveryAuthn: actualDiscoveryAuthn,
      mode: 'MAINNET'
    });

    // Alert if there's a mismatch (testnet detected)
    if (
      (typeof actualAccessNode === 'string' && actualAccessNode.includes('testnet')) || 
      actualNetwork === 'testnet' ||
      (typeof actualDiscoveryWallet === 'string' && actualDiscoveryWallet.includes('testnet')) ||
      (typeof actualDiscoveryAuthn === 'string' && actualDiscoveryAuthn.includes('testnet'))
    ) {
      console.error('❌ TESTNET DETECTED! Configuration override failed. Clearing all FCL cache...');
      Object.keys(localStorage)
        .filter(key => key.startsWith('fcl:'))
        .forEach(key => localStorage.removeItem(key));
      
      // Force reload to apply mainnet config
      alert('Testnet configuration detected. Clearing cache and reloading...');
      window.location.reload();
    }
  }, 100);
}

// Initialize FCL WalletConnect plugin with proper configuration
// This MUST be called after FCL config is set up
if (typeof window !== 'undefined') {
  const initializeWalletConnect = async () => {
    try {
      console.log('🔌 Initializing FCL WalletConnect plugin...');
      
      // For mobile apps, we need to ensure the session can be restored
      // Store session info in localStorage for persistence
      const storagePrefix = 'fcl-wc-';
      
      const { FclWcServicePlugin, client } = await initFclWc({
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'Flunks',
          description: 'Flunks - Your Flow NFT Collection',
          url: APP_URL,
          icons: ['https://flunks.net/flunks-logo.png']
        },
        // Critical: Pass the wcRequestHook for mobile deep linking
        wcRequestHook: IS_MOBILE_APP ? wcRequestHook : undefined,
        // Include base WC wallet listing
        includeBaseWC: true,
        // DISABLE the modal on mobile - we want to go directly to Flow Wallet
        pairingModalConfig: {
          enabled: !IS_MOBILE_APP, // Only show modal on web, not mobile
        },
      });
      
      // Register the plugin with FCL
      fcl.pluginRegistry.add(FclWcServicePlugin);
      
      // On mobile, set up session event listeners
      if (IS_MOBILE_APP && client) {
        console.log('📱 Setting up WalletConnect session listeners for mobile...');
        
        client.on('session_update', (data: any) => {
          console.log('📱 WC session_update:', data);
        });
        
        client.on('session_delete', () => {
          console.log('📱 WC session_delete - user disconnected from wallet');
        });
        
        client.on('session_event', (data: any) => {
          console.log('📱 WC session_event:', data);
        });
      }
      
      console.log('✅ FCL WalletConnect plugin initialized', {
        isMobile: IS_MOBILE_APP,
        hasClient: !!client,
        hasWcRequestHook: IS_MOBILE_APP
      });
    } catch (error) {
      console.error('❌ Failed to initialize FCL WalletConnect plugin:', error);
    }
  };
  
  // Initialize after a short delay to ensure FCL config is ready
  setTimeout(initializeWalletConnect, 200);
}

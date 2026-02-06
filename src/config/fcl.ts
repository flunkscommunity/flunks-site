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

// Global reference to WalletConnect client for session management
let wcClientInstance: any = null;

// Flag to track if WalletConnect is initialized and ready
let wcInitialized = false;
let wcInitPromise: Promise<void> | null = null;

/**
 * Check if WalletConnect is initialized
 */
export const isWcReady = () => wcInitialized;

/**
 * Wait for WalletConnect to be ready (useful before calling authenticate)
 */
export const waitForWcReady = async (timeoutMs: number = 5000): Promise<boolean> => {
  if (wcInitialized) return true;
  if (wcInitPromise) {
    try {
      await Promise.race([
        wcInitPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('WC init timeout')), timeoutMs))
      ]);
      return wcInitialized;
    } catch {
      console.warn('⚠️ WalletConnect init timeout');
      return false;
    }
  }
  return false;
};

/**
 * Get the WalletConnect client instance (for checking/restoring sessions)
 */
export const getWcClient = () => wcClientInstance;

/**
 * Force WalletConnect to check for existing sessions and restore FCL auth
 * Call this when the app resumes from background after wallet auth
 * Returns true if a session was found and restored
 */
export const forceWcSessionRestore = async (): Promise<boolean> => {
  console.log('🔄 Force WC session restore called');
  
  if (!wcClientInstance) {
    console.log('⚠️ No WC client instance available');
    return false;
  }
  
  try {
    // Check if there are any active sessions - handle different WC client APIs
    let sessions: any[] = [];
    if (typeof wcClientInstance.session?.getAll === 'function') {
      sessions = wcClientInstance.session.getAll();
    } else if (wcClientInstance.session?.values) {
      sessions = Array.from(wcClientInstance.session.values());
    } else if (wcClientInstance.getActiveSessions) {
      sessions = Object.values(wcClientInstance.getActiveSessions() || {});
    }
    console.log('📱 WC sessions found:', sessions.length);
    
    if (sessions.length > 0) {
      console.log('📱 Active WC session details:', sessions.map((s: any) => ({
        topic: s.topic,
        namespaces: Object.keys(s.namespaces || {}),
        expiry: s.expiry,
        acknowledged: s.acknowledged
      })));
      
      // Force FCL to re-check its session state
      // First, check if FCL is already aware of the session
      const currentUser = await fcl.currentUser.snapshot();
      
      if (currentUser?.loggedIn && currentUser?.addr) {
        console.log('✅ FCL already has user:', currentUser.addr);
        return true;
      }
      
      // FCL doesn't know about the session - try to trigger re-authentication
      // The fcl-wc plugin should pick up existing sessions
      console.log('📱 FCL not logged in but WC session exists - attempting reauthenticate...');
      
      try {
        // Try reauthenticate first (preserves existing session)
        await fcl.reauthenticate();
        const afterReauth = await fcl.currentUser.snapshot();
        if (afterReauth?.loggedIn && afterReauth?.addr) {
          console.log('✅ FCL session restored via reauthenticate:', afterReauth.addr);
          return true;
        }
      } catch (reauthError) {
        console.log('⚠️ Reauthenticate failed, this is expected if session is new:', reauthError);
      }
      
      // If reauthenticate didn't work, the fcl-wc plugin may need the session to be explicitly processed
      // Try emitting an event or checking if there's a pending proposal
      console.log('📱 Checking WC pairing state...');
      
      try {
        const pairings = wcClientInstance.core?.pairing?.getPairings?.() || [];
        console.log('📱 WC pairings:', pairings.length);
        
        if (pairings.length > 0) {
          const activePairing = pairings.find((p: any) => p.active);
          if (activePairing) {
            console.log('📱 Active pairing found:', activePairing.topic);
          }
        }
      } catch (pairingError) {
        console.log('⚠️ Error checking pairings:', pairingError);
      }
      
      return false;
    }
    
    console.log('📱 No WC sessions found');
    return false;
  } catch (error) {
    console.error('❌ Error in forceWcSessionRestore:', error);
    return false;
  }
};

/**
 * Force the WalletConnect relayer to reconnect
 * Useful after app resumes from background when WebSocket may have disconnected
 */
export const forceWcReconnect = async (): Promise<void> => {
  console.log('🔄 Force WC reconnect called');
  
  if (!wcClientInstance?.core?.relayer) {
    console.log('⚠️ No WC relayer available');
    return;
  }
  
  try {
    // Try to restart the transport (reconnect WebSocket)
    if (typeof wcClientInstance.core.relayer.restartTransport === 'function') {
      console.log('📱 Restarting WC relayer transport...');
      await wcClientInstance.core.relayer.restartTransport();
      console.log('✅ WC relayer transport restarted');
    } else if (typeof wcClientInstance.core.relayer.transportOpen === 'function') {
      console.log('📱 Opening WC relayer transport...');
      await wcClientInstance.core.relayer.transportOpen();
      console.log('✅ WC relayer transport opened');
    }
  } catch (error) {
    console.error('⚠️ Error reconnecting WC relayer:', error);
  }
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
// On mobile (Capacitor), use https URL that matches the WalletConnect metadata
// Using flunks.net for consistency - wallets use this for display, not for deep linking
// The actual deep link return is handled by the wallet via WalletConnect protocol
const APP_URL = typeof window !== 'undefined'
  ? (isMobileApp() ? "https://flunks.net" : window.location.origin)
  : "https://flunks.net";

console.log('🌊 Configuring FCL with access node:', FLOW_ACCESS_NODE);
console.log('📱 WalletConnect Project ID:', WALLETCONNECT_PROJECT_ID ? 'Set ✅' : 'Missing ❌');
console.log('🌐 App URL:', APP_URL);

// Detect if running in mobile app
const IS_MOBILE_APP = isMobileApp();
console.log('📱 Mobile App Mode:', IS_MOBILE_APP ? 'YES' : 'NO');

// For mobile apps, use WC/RPC (WalletConnect) which works with deep linking
// The wcRequestHook will intercept the WC URI and open Flow Wallet directly
// For web, use IFRAME/RPC for the standard discovery UI
const DISCOVERY_METHOD = IS_MOBILE_APP ? 'WC/RPC' : 'IFRAME/RPC';
console.log('🔗 Discovery Method:', DISCOVERY_METHOD);

// Flow Wallet's universal link for WalletConnect
const FLOW_WALLET_UNIVERSAL_LINK = "https://frw-link.lilico.app/wc";

// Flow Wallet app schemes (Android prefers direct app deep links)
const FLOW_WALLET_ANDROID_SCHEME = "frw://wc";
const FLOW_WALLET_ANDROID_ALT_SCHEME = "lilico://wc";

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
  console.log('🔗 WC Request Hook CALLED!');
  console.log('🔗 WC Request Hook data:', JSON.stringify(data, null, 2));
  console.log('🔗 IS_MOBILE_APP:', IS_MOBILE_APP);
  console.log('🔗 data.uri:', data?.uri);

  const setWcDebug = (method: string, url?: string) => {
    if (typeof window === 'undefined') return;
    (window as any).__wcLastOpen = {
      method,
      url,
      timestamp: new Date().toISOString(),
    };
    console.log(`📱 WC Debug: ${method}`, url);
  };
  
  // Intercept session request and open Flow Wallet directly
  if (IS_MOBILE_APP && data.uri) {
    console.log('📱 WC URI received in hook:', data.uri);
    
    // Construct the Flow Wallet universal link with WC URI
    const flowWalletUrl = `${FLOW_WALLET_UNIVERSAL_LINK}?uri=${encodeURIComponent(data.uri)}`;
    console.log('📱 Opening Flow Wallet via wcRequestHook:', flowWalletUrl);

    const openUniversalLink = async (): Promise<boolean> => {
      try {
        const { AppLauncher } = await import('@capacitor/app-launcher');
        console.log('📱 Opening Flow Wallet via universal link:', flowWalletUrl);
        setWcDebug('android-universal-link', flowWalletUrl);
        await AppLauncher.openUrl({ url: flowWalletUrl });
        return true;
      } catch (error) {
        console.error('⚠️ Universal link open failed:', error);
        return false;
      }
    };
    
    // Prefer direct app deep links on Android to avoid the intermediary landing screen
    const platform = (window as any).Capacitor?.getPlatform?.();
    if (platform === 'android') {
      try {
        const { AppLauncher } = await import('@capacitor/app-launcher');
        const deepLink = `${FLOW_WALLET_ANDROID_SCHEME}?uri=${encodeURIComponent(data.uri)}`;
        const altDeepLink = `${FLOW_WALLET_ANDROID_ALT_SCHEME}?uri=${encodeURIComponent(data.uri)}`;

        const canOpenPrimary = await AppLauncher.canOpenUrl({ url: deepLink });
        if (canOpenPrimary?.value) {
          console.log('📱 Opening Flow Wallet via Android deep link:', deepLink);
          setWcDebug('android-deeplink-frw', deepLink);
          await AppLauncher.openUrl({ url: deepLink });
          return true;
        }

        const canOpenAlt = await AppLauncher.canOpenUrl({ url: altDeepLink });
        if (canOpenAlt?.value) {
          console.log('📱 Opening Flow Wallet via Android alt deep link:', altDeepLink);
          setWcDebug('android-deeplink-lilico', altDeepLink);
          await AppLauncher.openUrl({ url: altDeepLink });
          return true;
        }

        const openedUniversal = await openUniversalLink();
        if (openedUniversal) {
          return true;
        }
      } catch (error) {
        console.error('⚠️ Android deep link open failed, falling back to universal link:', error);
        setWcDebug('android-deeplink-failed', flowWalletUrl);
      }
    }

    // Use Capacitor Browser plugin to open in external browser/app
    // This keeps our app in the background and allows proper deep linking back
    try {
      const { Browser } = await import('@capacitor/browser');
      console.log('📱 Using Capacitor Browser plugin to open Flow Wallet');
      setWcDebug('browser-open', flowWalletUrl);
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
        if ((window as any).Capacitor?.getPlatform?.() === 'android') {
          const { AppLauncher } = await import('@capacitor/app-launcher');
          setWcDebug('android-applauncher-universal', flowWalletUrl);
          await AppLauncher.openUrl({ url: flowWalletUrl });
        } else {
          // iOS - just open the URL which should trigger universal links
          setWcDebug('ios-window-open', flowWalletUrl);
          window.open(flowWalletUrl, '_system');
        }
      } catch (fallbackError) {
        console.error('⚠️ All methods failed, using window.open:', fallbackError);
        setWcDebug('window-open-fallback', flowWalletUrl);
        window.open(flowWalletUrl, '_system');
      }
    }
    
    // Return true to indicate we handled this
    return true;
  }
  
  return false;
};

// For mobile apps, log that we're using WalletConnect
if (IS_MOBILE_APP) {
  console.log('📱 Mobile: Using WC/RPC discovery method for WalletConnect with Flow Wallet');
}

// Simplified FCL configuration - use standard mainnet endpoints
// Using /mainnet/ path in discovery URLs for better reliability (Flow best practice)
config({
  "flow.network": "mainnet",
  "accessNode.api": "https://rest-mainnet.onflow.org",
  
  // Discovery endpoints - BOTH are required for FCL to work properly
  "discovery.wallet": "https://fcl-discovery.onflow.org/mainnet/authn",
  "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/mainnet/authn",
  
  // Discovery method - WC/RPC for mobile (WalletConnect), IFRAME/RPC for web
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
      
      // Store the client globally for session management (critical for mobile app resume)
      wcClientInstance = client;
      console.log('📱 WC client stored globally for session management');
      
      // On mobile, set up session event listeners and check for existing sessions
      if (IS_MOBILE_APP && client) {
        console.log('📱 Setting up WalletConnect session listeners for mobile...');
        
        // Check if there's an existing session on startup
        const checkExistingSession = async () => {
          try {
            // WalletConnect v2 client may have different API - try multiple approaches
            let sessions: any[] = [];
            if (typeof client.session?.getAll === 'function') {
              sessions = client.session.getAll();
            } else if (client.session?.values) {
              sessions = Array.from(client.session.values());
            } else if (client.getActiveSessions) {
              sessions = Object.values(client.getActiveSessions() || {});
            }
            
            if (sessions && sessions.length > 0) {
              console.log('📱 Found existing WalletConnect session(s):', sessions.length);
              console.log('📱 Session details:', sessions);
              
              // Try to restore FCL session
              setTimeout(async () => {
                try {
                  const currentUser = await fcl.currentUser.snapshot();
                  if (!currentUser?.loggedIn) {
                    console.log('📱 WC session exists but FCL not logged in, triggering session restore...');
                    // Try to use forceWcSessionRestore
                    const restored = await forceWcSessionRestore();
                    console.log('📱 Session restore result:', restored);
                  }
                } catch (err) {
                  console.warn('⚠️ Error checking FCL session:', err);
                }
              }, 500);
            } else {
              console.log('📱 No existing WalletConnect sessions found');
            }
          } catch (error) {
            console.warn('⚠️ Error checking WalletConnect sessions:', error);
          }
        };
        
        checkExistingSession();
        
        client.on('session_update', (data: any) => {
          console.log('📱 WC session_update:', data);
        });
        
        client.on('session_delete', () => {
          console.log('📱 WC session_delete - user disconnected from wallet');
          // Clear any pending auth state
          if (typeof window !== 'undefined') {
            localStorage.removeItem('flunks_pending_auth');
            localStorage.removeItem('flunks_auth_timestamp');
          }
        });
        
        client.on('session_event', (data: any) => {
          console.log('📱 WC session_event:', data);
        });
        
        // Helper function to restore FCL session after WC events
        const handleWcSessionRestoration = async (eventName: string, data: any) => {
          console.log(`✅ WC ${eventName} received:`, data);
          
          // Retry session restoration with multiple attempts
          const attemptRestore = async (attempt: number = 1, maxAttempts: number = 5): Promise<boolean> => {
            console.log(`📱 [${eventName}] FCL restore attempt ${attempt}/${maxAttempts}`);
            
            try {
              const currentUser = await fcl.currentUser.snapshot();
              if (currentUser?.loggedIn && currentUser?.addr) {
                console.log(`✅ [${eventName}] FCL user authenticated: ${currentUser.addr}`);
                // Dispatch custom event so UnifiedWalletContext can react immediately
                window.dispatchEvent(new CustomEvent('fcl-session-restored', { 
                  detail: { address: currentUser.addr, source: eventName } 
                }));
                return true;
              }
              
              if (attempt < maxAttempts) {
                // Try reauthenticate to pick up the session
                console.log(`📱 [${eventName}] FCL not logged in, trying reauthenticate...`);
                try {
                  await fcl.reauthenticate();
                  const afterReauth = await fcl.currentUser.snapshot();
                  if (afterReauth?.loggedIn && afterReauth?.addr) {
                    console.log(`✅ [${eventName}] FCL restored via reauthenticate: ${afterReauth.addr}`);
                    window.dispatchEvent(new CustomEvent('fcl-session-restored', { 
                      detail: { address: afterReauth.addr, source: eventName } 
                    }));
                    return true;
                  }
                } catch (reauthErr) {
                  console.log(`⚠️ [${eventName}] Reauthenticate failed (attempt ${attempt}):`, reauthErr);
                }
                
                // Wait and retry
                const delay = 500 * attempt;
                console.log(`⏳ [${eventName}] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return attemptRestore(attempt + 1, maxAttempts);
              }
              
              console.log(`⚠️ [${eventName}] Failed to restore FCL session after ${maxAttempts} attempts`);
              return false;
            } catch (err) {
              console.warn(`⚠️ [${eventName}] Error during restore attempt ${attempt}:`, err);
              if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                return attemptRestore(attempt + 1, maxAttempts);
              }
              return false;
            }
          };
          
          // Start restoration after a small delay to let WC finish processing
          setTimeout(() => attemptRestore(1, 5), 300);
        };
        
        // Listen for successful session approval - THIS IS KEY FOR MOBILE
        client.on('session_approve', async (data: any) => {
          await handleWcSessionRestoration('session_approve', data);
        });
        
        // session_settle fires when session is fully established
        client.on('session_settle', async (data: any) => {
          await handleWcSessionRestoration('session_settle', data);
        });
        
        // Also listen for 'connect' which some WC versions use
        if (typeof client.on === 'function') {
          try {
            client.on('connect', async (data: any) => {
              await handleWcSessionRestoration('connect', data);
            });
          } catch (e) {
            // 'connect' event may not be available in all WC versions
          }
        }
      }
      
      // Mark WalletConnect as initialized
      wcInitialized = true;
      console.log('✅ FCL WalletConnect plugin initialized', {
        isMobile: IS_MOBILE_APP,
        hasClient: !!client,
        hasWcRequestHook: IS_MOBILE_APP,
        wcInitialized: true
      });
    } catch (error) {
      console.error('❌ Failed to initialize FCL WalletConnect plugin:', error);
      wcInitialized = false;
    }
  };
  
  // Initialize WalletConnect and store the promise so we can await it
  // Use a shorter delay since we'll wait for it before auth anyway
  wcInitPromise = new Promise((resolve) => {
    setTimeout(async () => {
      await initializeWalletConnect();
      resolve();
    }, 100);
  });
}

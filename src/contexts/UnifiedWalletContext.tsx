import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import * as fcl from '@onflow/fcl';
import { useDemoModeOptional, DEMO_WALLET_ADDRESS } from './DemoModeContext';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

// LocalStorage keys for persisting auth state across app restarts
const STORAGE_KEY_PENDING_AUTH = 'flunks_pending_auth';
const STORAGE_KEY_AUTH_TIMESTAMP = 'flunks_auth_timestamp';
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Persist auth state to localStorage
const setPendingAuth = (pending: boolean) => {
  if (typeof window === 'undefined') return;
  if (pending) {
    localStorage.setItem(STORAGE_KEY_PENDING_AUTH, 'true');
    localStorage.setItem(STORAGE_KEY_AUTH_TIMESTAMP, Date.now().toString());
  } else {
    localStorage.removeItem(STORAGE_KEY_PENDING_AUTH);
    localStorage.removeItem(STORAGE_KEY_AUTH_TIMESTAMP);
  }
};

// Check if there's a pending auth (within timeout)
const hasPendingAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  const pending = localStorage.getItem(STORAGE_KEY_PENDING_AUTH);
  const timestamp = localStorage.getItem(STORAGE_KEY_AUTH_TIMESTAMP);
  
  if (!pending || !timestamp) return false;
  
  const elapsed = Date.now() - parseInt(timestamp, 10);
  if (elapsed > AUTH_TIMEOUT_MS) {
    // Timeout expired, clear stale auth
    setPendingAuth(false);
    return false;
  }
  
  return true;
};

// Normalize Flow address format
const normalizeFlowAddress = (address: string | null | undefined): string | null => {
  if (!address) return null;
  
  let normalized = address.trim().toLowerCase();
  
  // Handle CAIP-10 format (e.g., "flow:mainnet:0x123...")
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    normalized = parts[parts.length - 1];
  }
  
  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = '0x' + normalized;
  }
  
  // Validate format (0x followed by 16 hex characters)
  const addressRegex = /^0x[a-f0-9]{16}$/;
  if (!addressRegex.test(normalized)) {
    console.warn('⚠️ Invalid Flow address format:', address, '-> normalized:', normalized);
    return null;
  }
  
  return normalized;
};

interface UnifiedWalletContextType {
  // Connection state
  isConnected: boolean;
  address: string | null;
  
  // Wallet type
  walletType: 'dynamic' | 'fcl' | null;
  
  // Connection methods
  connectFCL: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // FCL user object (for Flow-specific operations)
  fclUser: any;
  
  // Mobile-specific
  isMobile: boolean;
  isConnecting: boolean;

  // Debug / diagnostics
  lastCallbackUrl: string | null;
  lastError: string | null;
  lastAuthStartedAt: number | null;
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | undefined>(undefined);

export const UnifiedWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🎮 DEMO MODE OVERRIDE: Check if demo mode is active
  const demoMode = useDemoModeOptional();
  
  // VERSION STAMP TO FORCE CACHE BUST
  console.log('🚀 UnifiedWalletContext VERSION 2.0 - PROVIDER ORDER FIXED');
  console.log('🎮 UnifiedWalletContext: Demo mode check:', { 
    hasDemoContext: !!demoMode, 
    isDemoMode: demoMode?.isDemoMode 
  });
  
  // If demo mode is active, return static demo wallet context
  if (demoMode?.isDemoMode) {
    console.log('✅ UnifiedWalletContext: DEMO MODE ACTIVE - Returning static context, bypassing FCL');

    const demoContextValue: UnifiedWalletContextType = {
      isConnected: false,  // Not actually connected to any wallet
      address: DEMO_WALLET_ADDRESS,
      walletType: null,
      connectFCL: async () => { console.log('🎮 Demo mode: connectFCL blocked'); },
      disconnect: async () => { console.log('🎮 Demo mode: disconnect blocked'); },
      fclUser: null,
      isMobile: true,  // Demo mode is iOS-only
      isConnecting: false,
      lastCallbackUrl: null,
      lastError: null,
      lastAuthStartedAt: null,
    };
    
    return (
      <UnifiedWalletContext.Provider value={demoContextValue}>
        {children}
      </UnifiedWalletContext.Provider>
    );
  }
  
  // Normal wallet logic only runs if NOT in demo mode
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [fclUser, setFclUser] = useState<any>(null);
  const [fclAddress, setFclAddress] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastCallbackUrl, setLastCallbackUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastAuthStartedAt, setLastAuthStartedAt] = useState<number | null>(null);

  // Debug log when Dynamic wallet changes
  useEffect(() => {
    if (primaryWallet?.address) {
      console.log('🔐 Dynamic wallet address (raw):', primaryWallet.address);
      console.log('🔐 Dynamic wallet address (normalized):', normalizeFlowAddress(primaryWallet.address));
    }
  }, [primaryWallet?.address]);

  // Detect mobile app on mount and check for pending auth
  useEffect(() => {
    const mobile = isMobileApp();
    setIsMobile(mobile);
    console.log('🔍 [MOUNT] UnifiedWalletContext initialized', {
      isMobile: mobile,
      hasPendingAuth: mobile ? hasPendingAuth() : false,
      timestamp: new Date().toISOString()
    });
    
    if (mobile) {
      console.log('📱 UnifiedWalletContext: Mobile app detected, using TAB/RPC discovery');
      
      // Check if we have a pending auth (user might be returning from wallet)
      if (hasPendingAuth()) {
        console.log('📱 🔑 PENDING AUTH DETECTED ON APP START!');
        console.log('📱 localStorage check:', {
          pendingAuth: localStorage.getItem(STORAGE_KEY_PENDING_AUTH),
          timestamp: localStorage.getItem(STORAGE_KEY_AUTH_TIMESTAMP),
          elapsed: Date.now() - parseInt(localStorage.getItem(STORAGE_KEY_AUTH_TIMESTAMP) || '0', 10)
        });
        setIsConnecting(true);
        
        // Android/iOS: Give WalletConnect and FCL time to restore session with retries
        const checkSessionOnMount = async (attempt = 1, maxAttempts = 4) => {
          try {
            console.log(`📱 Mount session check attempt ${attempt}/${maxAttempts}`);
            const currentUser = await fcl.currentUser.snapshot();
            console.log('📱 Mount session result:', {
              attempt,
              loggedIn: currentUser?.loggedIn,
              hasAddress: !!currentUser?.addr,
              address: currentUser?.addr
            });
            
            if (currentUser?.loggedIn && currentUser?.addr) {
              console.log('✅ Session restored on mount attempt', attempt, ':', currentUser.addr);
              setFclUser(currentUser);
              setFclAddress(normalizeFlowAddress(currentUser.addr));
              setPendingAuth(false);
              setIsConnecting(false);
              return true;
            } else if (attempt < maxAttempts) {
              // Try again with increasing delay
              const nextDelay = 1000 * attempt; // 1s, 2s, 3s
              console.log(`⏳ No session on mount yet, retrying in ${nextDelay}ms...`);
              setTimeout(() => checkSessionOnMount(attempt + 1, maxAttempts), nextDelay);
            } else {
              console.log('⏳ No session on mount after ${maxAttempts} attempts, will wait for FCL subscription');
              // Keep isConnecting true, will be cleared by FCL subscription or app resume handler
            }
          } catch (error) {
            console.error('❌ Error checking session on mount (attempt ${attempt}):', error);
            if (attempt >= maxAttempts) {
              setPendingAuth(false);
              setIsConnecting(false);
            } else {
              setTimeout(() => checkSessionOnMount(attempt + 1, maxAttempts), 1000 * attempt);
            }
          }
        };
        
        // Start checking after 1 second
        setTimeout(() => checkSessionOnMount(1, 4), 1000);
      }
    }
  }, []);

  // Set up deep link handler for mobile wallet callbacks
  useEffect(() => {
    if (!isMobile) return;
    
    const setupMobileDeepLinks = async () => {
      try {
        // Dynamically import Capacitor App plugin only in mobile context
        const { App } = await import('@capacitor/app');
        
        // Listen for app URL open events (wallet callbacks)
        await App.addListener('appUrlOpen', (event) => {
          console.log('📲 Wallet callback received:', event.url);
          setLastCallbackUrl(event.url);
          // FCL handles the callback automatically via the WalletConnect integration
        });
        
        // Listen for app state changes (resume from background)
        // This is critical for wallet auth - when user returns from Flow Wallet
        await App.addListener('appStateChange', async (state) => {
          console.log('📱 🔄 APP STATE CHANGED:', state.isActive ? '✅ ACTIVE (FOREGROUND)' : '⏸️  BACKGROUND');
          console.log('📱 State details:', {
            isActive: state.isActive,
            currentlyConnecting: isConnecting,
            hasPendingInStorage: hasPendingAuth(),
            timestamp: new Date().toISOString()
          });
          
          if (state.isActive) {
            // Check if we have pending auth (from localStorage or state)
            const hasPending = hasPendingAuth() || isConnecting;
            
            console.log('📱 Resume check:', {
              hasPendingAuth: hasPendingAuth(),
              isConnecting: isConnecting,
              willCheckSession: hasPending
            });
            
            if (hasPending) {
              // App came back to foreground while we were waiting for wallet auth
              console.log('📱 🔑 APP RESUMED WITH PENDING AUTH - CHECKING FCL SESSION...');
              setIsConnecting(true);
              
              // Android/iOS: Give WalletConnect and FCL more time to process the deep link and restore session
              // Multiple attempts with increasing delays to handle slower device/network conditions
              const checkSessionWithRetries = async (attempt = 1, maxAttempts = 5) => {
                try {
                  console.log(`📱 Session check attempt ${attempt}/${maxAttempts}`);
                  
                  // Force FCL to check its current session state
                  const currentUser = await fcl.currentUser.snapshot();
                  console.log('📱 FCL session check result:', {
                    attempt,
                    loggedIn: currentUser?.loggedIn,
                    hasAddress: !!currentUser?.addr,
                    address: currentUser?.addr
                  });
                  
                  if (currentUser?.loggedIn && currentUser?.addr) {
                    console.log('✅ FCL session restored successfully on attempt', attempt, ':', currentUser.addr);
                    setFclUser(currentUser);
                    setFclAddress(normalizeFlowAddress(currentUser.addr));
                    setIsConnecting(false);
                    setPendingAuth(false);
                    return true;
                  } else if (attempt < maxAttempts) {
                    // Not ready yet, try again with exponential backoff
                    const nextDelay = Math.min(1000 * Math.pow(1.5, attempt), 4000); // Max 4 seconds
                    console.log(`⏳ No session yet, retrying in ${nextDelay}ms...`);
                    setTimeout(() => checkSessionWithRetries(attempt + 1, maxAttempts), nextDelay);
                  } else {
                    // Max attempts reached
                    console.log('⏱️ Max session check attempts reached, clearing pending state');
                    console.log('💡 User may need to click "Connect Wallet" again');
                    setIsConnecting(false);
                    setPendingAuth(false);
                    return false;
                  }
                } catch (error) {
                  console.warn(`⚠️ Error checking FCL session (attempt ${attempt}):`, error);
                  if (attempt < maxAttempts) {
                    const nextDelay = Math.min(1000 * Math.pow(1.5, attempt), 4000);
                    setTimeout(() => checkSessionWithRetries(attempt + 1, maxAttempts), nextDelay);
                  } else {
                    setIsConnecting(false);
                    setPendingAuth(false);
                  }
                }
              };
              
              // Start checking with a 1.5 second initial delay
              setTimeout(() => checkSessionWithRetries(1, 5), 1500);
            }
          }
        });
        
        // Check if app was opened with a URL (cold start)
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          console.log('📲 App launched with wallet callback:', launchUrl.url);
          setLastCallbackUrl(launchUrl.url);
        }
        
        console.log('📱 Mobile deep link listeners registered');
      } catch (error) {
        console.warn('⚠️ Failed to set up mobile deep links:', error);
      }
    };
    
    setupMobileDeepLinks();
  }, [isMobile, isConnecting]);

  // Subscribe to FCL auth changes (config is already set in src/config/fcl.ts)
  useEffect(() => {
    console.log('🌊 UnifiedWalletContext: Subscribing to FCL auth (mainnet config from fcl.ts)');
    
    // Subscribe to FCL auth changes ONLY (won't trigger automatically)
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      console.log('FCL user state changed:', JSON.stringify(user, null, 2));
      
      if (user?.loggedIn && user?.addr) {
        setFclUser(user);
        // Normalize the address to ensure consistent format
        const originalAddr = user.addr;
        const normalizedAddr = normalizeFlowAddress(user.addr);
        console.log('📱 FCL address:', {
          original: originalAddr,
          normalized: normalizedAddr,
          rawUserObject: user
        });
        
        if (!normalizedAddr) {
          console.error('❌ Failed to normalize FCL address:', originalAddr);
        }
        
        setFclAddress(normalizedAddr);
        setIsConnecting(false); // Reset connecting state when user logs in
        setPendingAuth(false); // Clear pending auth on successful login
      } else {
        setFclUser(null);
        setFclAddress(null);
        setIsConnecting(false); // Also reset on logout
        setPendingAuth(false); // Clear pending auth on logout
      }
    });

    return () => unsubscribe();
  }, []);

  // Connect to Flow wallet via FCL (explicit user action only)
  const connectFCL = useCallback(async () => {
    // If already connecting, don't start another connection attempt
    if (isConnecting) {
      console.log('⏸️ Already connecting, ignoring duplicate connect request');
      return;
    }
    
    setIsConnecting(true);
    setLastError(null);
    setLastAuthStartedAt(Date.now());
    
    // Persist pending auth to localStorage for mobile
    if (isMobile) {
      setPendingAuth(true);
      console.log('📱 Persisted pending auth to localStorage');
      
      // Set a timeout to clear connecting state if user doesn't return
      // This handles the case where user cancels or backs out of Flow Wallet
      setTimeout(() => {
        const stillPending = localStorage.getItem(STORAGE_KEY_PENDING_AUTH);
        if (stillPending && isConnecting) {
          console.log('⏱️ Connection timeout - user may have cancelled authentication');
          console.log('💡 Clearing connecting state so user can try again');
          setIsConnecting(false);
          setPendingAuth(false);
        }
      }, 60000); // 60 second timeout for initial connection attempt
    }
    
    try {
      console.log(isMobile ? '📱 Connecting to Flow wallet (mobile)...' : '🌊 Connecting to Flow wallet (web)...');
      
      try {
        const network = await fcl.config().get('flow.network');
        const accessNode = await fcl.config().get('accessNode.api');
        const discovery = await fcl.config().get('discovery.wallet');
        const method = await fcl.config().get('discovery.wallet.method');
        console.log('🔧 FCL config before authenticate:', {
          network,
          accessNode,
          discovery,
          method,
          isMobile
        });
      } catch (configError) {
        console.warn('⚠️ Unable to read FCL config before authenticate:', configError);
      }
      
      // IMPORTANT: On mobile WebViews, awaiting `fcl.authenticate()` can hang forever
      // if the deep-link handoff is blocked. Trigger it and let the callback drive state.
      if (isMobile) {
        console.log('📱 Using WalletConnect for mobile authentication...');
        
        // Flow Wallet universal link base
        const FLOW_WALLET_WC_LINK = 'https://frw-link.lilico.app/wc';
        
        // Flow Wallet service with proper universal link for WC deep linking
        const flowWalletService = {
          "f_type": "Service",
          "f_vsn": "1.0.0",
          "type": "authn",
          "uid": FLOW_WALLET_WC_LINK,
          "endpoint": "flow_authn",
          "method": "WC/RPC",
          "provider": {
            "name": "Flow Wallet",
            "icon": "https://lilico.app/logo.png"
          }
        };
        
        console.log('📱 Authenticating with Flow Wallet service:', flowWalletService);
        
        // Use FCL's authenticate with explicit service
        // The fcl-wc plugin's wcRequestHook (configured in fcl.ts) will intercept
        // the WC URI and open the Flow Wallet via window.location.href
        // The native WalletBridgeViewController will then open the app externally
        void fcl.authenticate({ service: flowWalletService }).catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error('Error connecting to Flow wallet (mobile):', error);
          setLastError(message);
          setIsConnecting(false);
        });
      } else {
        await fcl.authenticate();
      }
      
      console.log('✅ Wallet connection initiated');
    } catch (error) {
      console.error('Error connecting to Flow wallet:', error);
      setLastError(error instanceof Error ? error.message : String(error));
      setPendingAuth(false); // Clear pending auth on error
      throw error;
    } finally {
      // For mobile, keep connecting state until user returns (handled by FCL subscription)
      if (!isMobile) {
        setIsConnecting(false);
        setPendingAuth(false);
      }
    }
  }, [isMobile, isConnecting]);

  // Unified disconnect
  const disconnect = useCallback(async () => {
    setIsConnecting(false);
    setLastError(null);
    try {
      // Disconnect from Dynamic if connected
      if (primaryWallet) {
        await handleLogOut();
      }
      
      // Disconnect from FCL if connected
      if (fclUser?.loggedIn) {
        await fcl.unauthenticate();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [primaryWallet, fclUser, handleLogOut]);

  // Determine which wallet is connected and the unified address
  const walletType = primaryWallet ? 'dynamic' : (fclAddress ? 'fcl' : null);
  // Normalize the address from Dynamic wallet as well (may be in CAIP-10 format)
  const address = normalizeFlowAddress(primaryWallet?.address) || fclAddress;
  const isConnected = !!(primaryWallet || fclAddress);

  const value: UnifiedWalletContextType = {
    isConnected,
    address,
    walletType,
    connectFCL,
    disconnect,
    fclUser,
    isMobile,
    isConnecting,
    lastCallbackUrl,
    lastError,
    lastAuthStartedAt,
  };

  return (
    <UnifiedWalletContext.Provider value={value}>
      {children}
    </UnifiedWalletContext.Provider>
  );
};

export const useUnifiedWallet = () => {
  const context = useContext(UnifiedWalletContext);
  if (context === undefined) {
    // Return a safe default instead of throwing - component may render before provider is ready
    console.warn('useUnifiedWallet called outside of UnifiedWalletProvider, returning defaults');
    return {
      isConnected: false,
      address: null,
      walletType: null,
      connectFCL: async () => { console.warn('connectFCL called outside provider'); },
      disconnect: async () => { console.warn('disconnect called outside provider'); },
      fclUser: null,
      isMobile: false,
      isConnecting: false,
      lastCallbackUrl: null,
      lastError: null,
      lastAuthStartedAt: null,
    } as UnifiedWalletContextType;
  }
  return context;
};

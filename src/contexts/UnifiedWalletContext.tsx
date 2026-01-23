import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import * as fcl from '@onflow/fcl';
import { useDemoModeOptional, DEMO_WALLET_ADDRESS } from './DemoModeContext';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
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

  // Detect mobile app on mount
  useEffect(() => {
    const mobile = isMobileApp();
    setIsMobile(mobile);
    if (mobile) {
      console.log('📱 UnifiedWalletContext: Mobile app detected, using TAB/RPC discovery');
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
          console.log('📱 App state changed:', state.isActive ? 'ACTIVE' : 'BACKGROUND');
          
          if (state.isActive && isConnecting) {
            // App came back to foreground while we were waiting for wallet auth
            console.log('📱 App resumed while waiting for wallet auth, checking FCL session...');
            
            // Give WalletConnect a moment to process the session
            setTimeout(async () => {
              try {
                // Force FCL to check its current session state
                const currentUser = await fcl.currentUser.snapshot();
                console.log('📱 FCL session check on resume:', currentUser);
                
                if (currentUser?.loggedIn && currentUser?.addr) {
                  console.log('✅ FCL session found on resume:', currentUser.addr);
                  setFclUser(currentUser);
                  setFclAddress(normalizeFlowAddress(currentUser.addr));
                  setIsConnecting(false);
                } else {
                  console.log('⏳ No FCL session yet, waiting for WalletConnect callback...');
                }
              } catch (error) {
                console.warn('⚠️ Error checking FCL session on resume:', error);
              }
            }, 500);
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
      } else {
        setFclUser(null);
        setFclAddress(null);
        setIsConnecting(false); // Also reset on logout
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Connect to Flow wallet via FCL (explicit user action only)
  const connectFCL = useCallback(async () => {
    setIsConnecting(true);
    setLastError(null);
    setLastAuthStartedAt(Date.now());
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
      throw error;
    } finally {
      // For mobile, keep connecting state until user returns (handled by FCL subscription)
      if (!isMobile) {
        setIsConnecting(false);
      }
    }
  }, [isMobile]);

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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import * as fcl from '@onflow/fcl';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
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
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [fclUser, setFclUser] = useState<any>(null);
  const [fclAddress, setFclAddress] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastCallbackUrl, setLastCallbackUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastAuthStartedAt, setLastAuthStartedAt] = useState<number | null>(null);

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
  }, [isMobile]);

  // Subscribe to FCL auth changes (config is already set in src/config/fcl.ts)
  useEffect(() => {
    console.log('🌊 UnifiedWalletContext: Subscribing to FCL auth (mainnet config from fcl.ts)');
    
    // Subscribe to FCL auth changes ONLY (won't trigger automatically)
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      console.log('FCL user state changed:', user);
      
      if (user?.loggedIn && user?.addr) {
        setFclUser(user);
        setFclAddress(user.addr);
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
        
        // Flow Wallet service with proper universal link for WC deep linking
        const flowWalletService = {
          "f_type": "Service",
          "f_vsn": "1.0.0",
          "type": "authn",
          "uid": "https://frw-link.lilico.app/wc", // Universal link that handles wc: URIs
          "endpoint": "flow_authn",
          "method": "WC/RPC",
          "provider": {
            "name": "Flow Wallet",
            "icon": "https://lilico.app/logo.png"
          }
        };
        
        console.log('📱 Authenticating with Flow Wallet service:', flowWalletService);
        
        // Use FCL's authenticate with explicit service
        void fcl.authenticate({ service: flowWalletService }).catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error('Error connecting to Flow wallet (mobile):', error);
          setLastError(message);
          setIsConnecting(false);
        });
        
        // Fallback: if after 5 seconds we're still connecting and wallet hasn't opened,
        // try opening Flow Wallet directly
        setTimeout(() => {
          if (isConnecting) {
            console.log('📱 Fallback: Wallet may not have opened, trying direct link...');
            window.location.href = 'https://frw-link.lilico.app/wc';
          }
        }, 5000);
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
  const address = primaryWallet?.address || fclAddress;
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
    throw new Error('useUnifiedWallet must be used within a UnifiedWalletProvider');
  }
  return context;
};

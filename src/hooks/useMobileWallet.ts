/**
 * Mobile Wallet Hook
 * Handles Flow wallet connection in Capacitor mobile apps
 * 
 * Features:
 * - Detects mobile app environment
 * - Uses TAB/RPC method for wallet discovery
 * - Handles deep link callbacks from wallets
 * - Provides mobile-specific connection UI guidance
 */

import { useEffect, useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import { App, URLOpenListenerEvent } from '@capacitor/app';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

interface MobileWalletState {
  isMobile: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  user: any | null;
}

interface UseMobileWalletReturn extends MobileWalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isSupported: boolean;
}

export function useMobileWallet(): UseMobileWalletReturn {
  const [state, setState] = useState<MobileWalletState>({
    isMobile: false,
    isConnecting: false,
    connectionError: null,
    user: null,
  });

  // Initialize mobile detection on mount
  useEffect(() => {
    const mobile = isMobileApp();
    setState(prev => ({ ...prev, isMobile: mobile }));
    
    if (mobile) {
      console.log('📱 Mobile wallet hook initialized');
      
      // Set up deep link listener for wallet callbacks
      const setupDeepLinkListener = async () => {
        try {
          // Listen for app URL open events (deep links)
          await App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            console.log('📲 Deep link received:', event.url);
            handleDeepLink(event.url);
          });
          
          // Check if app was opened with a URL
          const urlOpen = await App.getLaunchUrl();
          if (urlOpen?.url) {
            console.log('📲 App launched with URL:', urlOpen.url);
            handleDeepLink(urlOpen.url);
          }
        } catch (error) {
          console.warn('Deep link listener setup failed:', error);
        }
      };
      
      setupDeepLinkListener();
    }
    
    // Subscribe to FCL user state
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      console.log('📱 FCL user state:', user);
      setState(prev => ({ 
        ...prev, 
        user: user?.loggedIn ? user : null,
        isConnecting: false 
      }));
    });
    
    return () => {
      unsubscribe();
      if (isMobileApp()) {
        App.removeAllListeners();
      }
    };
  }, []);

  // Handle deep link URLs from wallet apps
  const handleDeepLink = useCallback((url: string) => {
    console.log('🔗 Processing deep link:', url);
    
    // Parse the URL for wallet callback data
    try {
      const urlObj = new URL(url);
      
      // Handle WalletConnect callbacks
      if (url.includes('wc:') || urlObj.protocol === 'wc:') {
        console.log('🔗 WalletConnect callback detected');
        // WalletConnect handles this automatically via @onflow/fcl-wc
      }
      
      // Handle custom flunks:// scheme callbacks
      if (urlObj.protocol === 'flunks:' || urlObj.protocol === 'net.flunks.app:') {
        const path = urlObj.pathname;
        const params = urlObj.searchParams;
        
        console.log('🔗 Flunks callback:', { path, params: Object.fromEntries(params) });
        
        // Handle authentication callback
        if (path.includes('auth') || params.has('address')) {
          // FCL should handle this automatically, but log for debugging
          console.log('📱 Auth callback received');
        }
      }
    } catch (error) {
      console.warn('Failed to parse deep link URL:', error);
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));
    
    try {
      console.log('📱 Starting mobile wallet connection...');
      
      if (state.isMobile) {
        // For mobile, the TAB/RPC method will open the wallet discovery
        // in an external browser or the wallet app directly
        console.log('📱 Using TAB/RPC method for mobile wallet discovery');
      }
      
      // Authenticate with FCL
      await fcl.authenticate();
      
      console.log('✅ Mobile wallet connection initiated');
    } catch (error: any) {
      console.error('❌ Mobile wallet connection failed:', error);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        connectionError: error.message || 'Connection failed' 
      }));
    }
  }, [state.isMobile]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      console.log('📱 Disconnecting mobile wallet...');
      await fcl.unauthenticate();
      setState(prev => ({ ...prev, user: null }));
      console.log('✅ Mobile wallet disconnected');
    } catch (error: any) {
      console.error('❌ Mobile wallet disconnect failed:', error);
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    isSupported: state.isMobile, // WalletConnect/TAB method is supported on mobile
  };
}

/**
 * Mobile Wallet Connection Instructions
 * Provides user-friendly guidance for mobile wallet connection
 */
export const MobileWalletInstructions = {
  title: 'Connect Your Flow Wallet',
  steps: [
    'Tap "Connect Wallet" below',
    'Choose your wallet (Flow Wallet, Blocto, etc.)',
    'Approve the connection in your wallet app',
    'Return to Flunks - you\'ll be logged in!'
  ],
  supportedWallets: [
    { name: 'Flow Wallet', icon: '🌊', recommended: true },
    { name: 'Blocto', icon: '🔷', recommended: true },
    { name: 'Dapper', icon: '💎', recommended: false },
  ],
  troubleshooting: [
    'Make sure you have a Flow wallet app installed',
    'If the wallet app doesn\'t open, try WalletConnect QR code',
    'Check that you\'re on Flow Mainnet',
  ]
};

export default useMobileWallet;

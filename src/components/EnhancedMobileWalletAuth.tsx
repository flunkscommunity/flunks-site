import React, { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Enhanced mobile wallet authentication component to fix Dynamic Labs mobile issues
const EnhancedMobileWalletAuth: React.FC = () => {
  const { setShowAuthFlow, user, primaryWallet } = useDynamicContext();
  const [isMobile, setIsMobile] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = typeof window !== 'undefined' && 
        (/iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         'ontouchstart' in window || 
         navigator.maxTouchPoints > 0);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || user || authAttempted) return;

    console.log('🔧 EnhancedMobileWalletAuth: Setting up mobile environment...');

    // Enhanced mobile wallet setup with deep linking support
    const setupMobileWallets = () => {
      // Clear any existing problematic state
      try {
        // Remove potentially corrupt localStorage entries
        const keysToCheck = ['dynamic', 'wallet', 'auth'];
        keysToCheck.forEach(key => {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const storageKey = localStorage.key(i);
            if (storageKey?.toLowerCase().includes(key)) {
              const value = localStorage.getItem(storageKey);
              if (value && value.includes('error') || value.includes('undefined')) {
                console.log(`🧹 Cleaning corrupted localStorage: ${storageKey}`);
                localStorage.removeItem(storageKey);
              }
            }
          }
        });
      } catch (e) {
        console.log('⚠️ LocalStorage cleanup had minor issues:', e);
      }

      // Enhanced mobile flags
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).MOBILE_WALLET_OVERRIDE = true;
      (window as any).ENHANCED_MOBILE_AUTH = true;
      (window as any).FORCE_MOBILE_WALLET_MODE = true;
      
  // Create comprehensive wallet objects with mobile deep linking
      if (!(window as any).flowWallet) {
        (window as any).flowWallet = {
          name: 'Flow Wallet',
          key: 'flowwallet',
          isInstalled: true,
          isMobile: true,
          canConnect: true,
          available: true,
          mobile: true,
          installed: true,
          isEmbeddedWallet: false,
          isConnectorWallet: true,
          version: '1.0.0',
          connect: async () => {
            console.log('🌊 Flow Wallet mobile connect initiated');
            
            // Try mobile app deep link
            const callback = encodeURIComponent(window.location.href);
            const deepLink = `flowwallet://connect?callback=${callback}`;
            const webLink = `https://wallet.flow.com/connect?callback=${callback}`;
            
            try {
              // Try deep link first
              window.location.href = deepLink;
              
              // Fallback to web link after delay
              setTimeout(() => {
                window.open(webLink, '_self');
              }, 2000);
            } catch (e) {
              console.log('Deep link failed, using web fallback');
              window.open(webLink, '_self');
            }
            
            return { address: 'flow-mobile-address' };
          },
          authenticate: async () => {
            console.log('🌊 Flow Wallet mobile auth initiated');
            return { user: { addr: 'flow-mobile-address' } };
          }
        };
      }

      if (!(window as any).lilico) {
        (window as any).lilico = {
          name: 'Lilico',
          key: 'lilico',
          isInstalled: true,
          isMobile: true,
          canConnect: true,
          available: true,
          mobile: true,
          installed: true,
          isEmbeddedWallet: false,
          isConnectorWallet: true,
          version: '1.0.0',
          connect: async () => {
            console.log('🦄 Lilico mobile connect initiated');
            
            // Try mobile app deep link
            const callback = encodeURIComponent(window.location.href);
            const deepLink = `lilico://connect?callback=${callback}`;
            const webLink = `https://lilico.app/connect?callback=${callback}`;
            
            try {
              window.location.href = deepLink;
              setTimeout(() => {
                window.open(webLink, '_self');
              }, 2000);
            } catch (e) {
              window.open(webLink, '_self');
            }
            
            return { address: 'lilico-mobile-address' };
          },
          authenticate: async () => {
            console.log('🦄 Lilico mobile auth initiated');
            return { user: { addr: 'lilico-mobile-address' } };
          }
        };
      }

      // Enhanced Dapper support for mobile
      if (!(window as any).dapper) {
        (window as any).dapper = {
          name: 'Dapper',
          key: 'dapper',
          isInstalled: true,
          isMobile: true,
          canConnect: true,
          available: true,
          mobile: true,
          installed: true,
          isEmbeddedWallet: false,
          isConnectorWallet: true,
          version: '1.0.0',
          connect: async () => {
            console.log('💳 Dapper mobile connect initiated');
            
            // Dapper uses web-based flow for mobile
            const callback = encodeURIComponent(window.location.href);
            const webLink = `https://accounts.meetdapper.com/connect?callback=${callback}`;
            window.open(webLink, '_self');
            
            return { address: 'dapper-mobile-address' };
          }
        };
      }

      // Alias bridging: ensure both keys exist even if only one injected by extension / app
      try {
        if ((window as any).lilico && !(window as any).flowWallet) {
          (window as any).flowWallet = { ...(window as any).lilico, key: 'flowwallet', name: 'Flow Wallet' };
          console.log('🔁 Created Flow Wallet alias from Lilico');
        }
        if ((window as any).flowWallet && !(window as any).lilico) {
          (window as any).lilico = { ...(window as any).flowWallet, key: 'lilico', name: 'Lilico' };
          console.log('🔁 Created Lilico alias from Flow Wallet');
        }
      } catch (e) {
        console.log('⚠️ Alias bridging issue:', e);
      }

      // Trigger Dynamic refresh if possible
      const refreshDynamic = () => {
        try {
          if ((window as any).dynamic?.sdk?.refreshWallets) {
            (window as any).dynamic.sdk.refreshWallets();
            console.log('🔄 Called dynamic.sdk.refreshWallets()');
          }
          window.dispatchEvent(new CustomEvent('dynamic:refreshWallets', { detail: { ts: Date.now() } }));
        } catch (e) {
          console.log('⚠️ Dynamic refresh attempt failed:', e);
        }
      };
      setTimeout(refreshDynamic, 300);
      setTimeout(refreshDynamic, 1200); // second pass after any network responses

      console.log('✅ Enhanced mobile wallet objects with deep linking created & refresh scheduled');
    };

    // Setup with a small delay to ensure Dynamic is initialized
    const timer = setTimeout(setupMobileWallets, 1000);
    setAuthAttempted(true);

    return () => clearTimeout(timer);
  }, [isMobile, user, authAttempted]);

  // Enhanced error handling for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleAuthError = (error: any) => {
      console.log('🚨 Mobile auth error caught:', error);
      
      // Clear potentially problematic state on error
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).MOBILE_WALLET_OVERRIDE = true;
      
      // Trigger a refresh of Dynamic components
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dynamicMobileRefresh', {
          detail: { error, timestamp: Date.now() }
        }));
      }, 500);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.toString().includes('dynamic') || 
          event.reason?.toString().includes('wallet')) {
        handleAuthError(event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [isMobile]);

  // Don't render anything - this is just a background service component
  return null;
};

export default EnhancedMobileWalletAuth;

import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// AGGRESSIVE mobile wallet fix - forces Flow Wallet and Lilico to appear
export const AggressiveMobileWalletFix = () => {
  const { setShowAuthFlow, user } = useDynamicContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
      navigator.userAgent
    ) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isMobile) return;

    console.log('🚀 AGGRESSIVE Mobile Wallet Fix - Starting...');

    // Set global flags immediately
    (window as any).FORCE_SHOW_ALL_WALLETS = true;
    (window as any).MOBILE_WALLET_OVERRIDE = true;
    (window as any).FORCE_FLOW_WALLET = true;
    (window as any).FORCE_LILICO_WALLET = true;

    // Strategy 1: Override Dynamic's internal wallet detection
    const originalFetch = window.fetch;
    window.fetch = async function(...args: any[]) {
      const response = await originalFetch.apply(this, args);
      const url = args[0]?.toString() || '';
      
      if (url.includes('dynamic') || url.includes('wallet')) {
        try {
          const text = await response.clone().text();
          let data;
          
          try {
            data = JSON.parse(text);
          } catch {
            return response;
          }

          if (data.wallets && Array.isArray(data.wallets)) {
            const original = [...data.wallets];
            
            // Force add Flow ecosystem wallets
            const flowWallets = [
              {
                key: 'flowwallet',
                name: 'Flow Wallet', 
                mobile: true,
                available: true,
                installed: true,
                iconUrl: 'https://wallet.flow.com/favicon.ico'
              },
              {
                key: 'lilico',
                name: 'Lilico',
                mobile: true, 
                available: true,
                installed: true,
                iconUrl: 'https://lilico.app/favicon.ico'
              }
            ];

            // Add missing wallets
            flowWallets.forEach(wallet => {
              const exists = data.wallets.some((w: any) => 
                w.key === wallet.key || 
                w.key?.includes(wallet.key) ||
                w.name?.toLowerCase().includes(wallet.name.toLowerCase())
              );
              
              if (!exists) {
                data.wallets.push(wallet);
                console.log(`📱 FORCE ADDED: ${wallet.name}`);
              }
            });

            console.log('📱 AGGRESSIVE FIX - Original wallets:', original.map(w => w.key));
            console.log('📱 AGGRESSIVE FIX - Enhanced wallets:', data.wallets.map(w => w.key));

            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          }
        } catch (e) {
          console.log('⚠️ Failed to parse wallet response:', e);
        }
      }
      
      return response;
    };

    // Strategy 2: Inject wallet objects directly into window
    const injectWalletObjects = () => {
      if (!window.flowWallet) {
        (window as any).flowWallet = {
          name: 'Flow Wallet',
          isInstalled: () => true,
          connect: () => console.log('Flow Wallet connect called'),
          authenticate: () => console.log('Flow Wallet authenticate called')
        };
      }
      
      if (!window.lilico) {
        (window as any).lilico = {
          name: 'Lilico', 
          isInstalled: () => true,
          connect: () => console.log('Lilico connect called'),
          authenticate: () => console.log('Lilico authenticate called')
        };
      }
      
      console.log('📱 Injected wallet objects into window');
    };

    // Strategy 3: Periodic forced wallet availability 
    const enforceWalletAvailability = () => {
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).MOBILE_FORCE_FLOW = true;
      (window as any).MOBILE_FORCE_LILICO = true;
      
      // Set mock wallet detection
      (window as any).mobileWalletDetection = {
        dapper: true,
        blocto: true,
        flowWalletMobile: true,
        lilicoMobile: true
      };
    };

    // Apply all strategies
    injectWalletObjects();
    enforceWalletAvailability();
    
    // Repeat periodically to override any Dynamic updates
    const forceInterval = setInterval(() => {
      enforceWalletAvailability();
      injectWalletObjects();
    }, 1000);

    // Cleanup after 30 seconds
    setTimeout(() => {
      clearInterval(forceInterval);
      window.fetch = originalFetch;
    }, 30000);

  }, [user]);

  return null;
};

export default AggressiveMobileWalletFix;

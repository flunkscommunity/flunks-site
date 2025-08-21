import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Force Flow Wallet and Lilico to appear on mobile
export const MobileDynamicWalletOverrideFix = () => {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
      navigator.userAgent
    ) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isMobile || user) return;

    console.log('🔧 Applying mobile wallet override fix...');

    // Force show all wallets flag
    (window as any).FORCE_SHOW_ALL_WALLETS = true;
    
    // Intercept Dynamic Labs API calls and inject Flow Wallet + Lilico
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args: any[]) {
      const response = await originalFetch.apply(this, args);
      
      const url = args[0]?.toString() || '';
      if (url.includes('dynamic') && (url.includes('wallet') || url.includes('connector'))) {
        try {
          const data = await response.clone().json();
          
          if (data.wallets && Array.isArray(data.wallets)) {
            const hasFlowWallet = data.wallets.some((w: any) => 
              w.key?.includes('flowwallet') || w.key?.includes('lilico') || w.key?.includes('flow')
            );
            const hasDapper = data.wallets.some((w: any) => w.key?.includes('dapper'));
            const hasBlocto = data.wallets.some((w: any) => w.key?.includes('blocto'));

            console.log('📡 Intercepted Dynamic wallet API call:', {
              originalWallets: data.wallets.map((w: any) => w.key),
              hasFlowWallet,
              hasDapper,
              hasBlocto
            });

            // Add missing wallets
            if (!hasFlowWallet) {
              data.wallets.push({
                key: 'flowwallet',
                name: 'Flow Wallet',
                mobile: true,
                available: true,
                installed: true,
                iconUrl: 'https://wallet.flow.com/favicon.ico'
              });
              
              data.wallets.push({
                key: 'lilico',
                name: 'Lilico',
                mobile: true,
                available: true,
                installed: true,
                iconUrl: 'https://lilico.app/favicon.ico'
              });
            }

            if (!hasBlocto) {
              data.wallets.push({
                key: 'blocto',
                name: 'Blocto',
                mobile: true,
                available: true,
                installed: true,
                iconUrl: 'https://blocto.portto.io/favicon.ico'
              });
            }

            console.log('📱 Enhanced wallet list:', data.wallets.map((w: any) => w.key));
            
            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          }
        } catch (e) {
          console.log('⚠️ Failed to parse wallet API response:', e);
        }
      }
      
      return response;
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [user]);

  return null; // This component doesn't render anything
};

export default MobileDynamicWalletOverrideFix;

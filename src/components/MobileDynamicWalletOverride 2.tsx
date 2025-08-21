// Mobile-specific Dynamic Labs configuration that mimics older version behavior
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import React, { useEffect, useState } from 'react';

interface MobileDynamicWalletOverrideProps {
  children?: React.ReactNode;
}

export const MobileDynamicWalletOverride: React.FC<MobileDynamicWalletOverrideProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = typeof window !== 'undefined' && 
        window.innerWidth <= 768 &&
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      // Mimic older Dynamic Labs mobile behavior - force show more wallet options
      console.log('📱 Applying mobile Dynamic Labs override for older-style behavior');
      
      // Override Dynamic's internal wallet filtering (like older versions)
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        
        // If this is a Dynamic Labs API call about wallets, modify the response
        const url = args[0]?.toString() || '';
        if (url.includes('dynamic') && url.includes('wallet')) {
          try {
            const data = await response.clone().json();
            
            // Add Flow/Lilico/Dapper if they're missing (like older versions did)
            if (data.wallets && Array.isArray(data.wallets)) {
              const hasFlow = data.wallets.some((w: any) => w.key?.includes('flow') || w.key?.includes('lilico'));
              const hasDapper = data.wallets.some((w: any) => w.key?.includes('dapper'));
              
              if (!hasFlow) {
                data.wallets.push({
                  key: 'flowwallet',
                  name: 'Flow Wallet',
                  mobile: true,
                  available: true,
                  installed: true
                });
              }
              
              if (!hasDapper) {
                data.wallets.push({
                  key: 'dapper',
                  name: 'Dapper',
                  mobile: true,
                  available: true,
                  installed: true
                });
              }
              
              console.log('📱 Modified wallet list for mobile:', data.wallets.map((w: any) => w.key));
            }
            
            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          } catch (e) {
            // If parsing fails, return original response
            return response;
          }
        }
        
        return response;
      };

      // Also set window flags that older versions used
      (window as any).DYNAMIC_MOBILE_WALLET_OVERRIDE = true;
      (window as any).DYNAMIC_LEGACY_MODE = true;
    }

    return () => {
      if (typeof window !== 'undefined') {
        // Clean up overrides
        delete (window as any).DYNAMIC_MOBILE_WALLET_OVERRIDE;
        delete (window as any).DYNAMIC_LEGACY_MODE;
      }
    };
  }, [isMobile]);

  return <>{children}</>;
};

export default MobileDynamicWalletOverride;

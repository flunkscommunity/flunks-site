import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Simplified smart wallet detection - non-interfering version
export const SmartWalletDetection = () => {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Simple device detection for logging only
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
    const isDesktop = !isMobile && window.innerWidth > 1024;

    console.log('🔍 Device Detection (Non-Interfering):', {
      isMobile,
      isDesktop,
      screenWidth: window.innerWidth,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    });

    // Only log wallet status, don't modify anything
    const walletStatus = {
      lilico: !!(window as any).lilico,
      flowWallet: !!(window as any).flow,
      dapper: !!(window as any).dapper,
      blocto: !!(window as any).blocto
    };

    console.log('� Wallet Extensions (Read-Only):', walletStatus);

  }, [user]); // Only re-run when user changes

  return null; // This component doesn't render anything
};

export default SmartWalletDetection;

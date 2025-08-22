import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Smart wallet detection that properly handles desktop vs mobile
export const SmartWalletDetection = () => {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clear any existing overrides first
    delete (window as any).FORCE_SHOW_ALL_WALLETS;
    delete (window as any).SELECTED_WALLET_TYPE;
    delete (window as any).SELECTED_WALLET_STRICT;
    delete (window as any).MOBILE_WALLET_OVERRIDE;

    // Detect device type properly
    const isDesktop = window.innerWidth > 1024 && 
      !('ontouchstart' in window) && 
      !navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i);

    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024 &&
      (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);

    const isMobile = window.innerWidth < 768 &&
      (navigator.maxTouchPoints > 0 || 'ontouchstart' in window ||
       navigator.userAgent.match(/Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i));

    console.log('🔍 Smart Wallet Detection:', {
      isDesktop,
      isTablet,
      isMobile,
      screenWidth: window.innerWidth,
      touchPoints: navigator.maxTouchPoints,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    });

    if (isDesktop) {
      // Desktop: Use proper wallet detection, don't force anything
      console.log('🖥️ Desktop detected - using native wallet detection');
      (window as any).FORCE_DESKTOP_MODE = true;
      
      // Only show installed wallets on desktop
      if ((window as any).lilico || (window as any).flowWallet) {
        console.log('✅ Flow Wallet/Lilico detected on desktop');
      } else {
        console.log('❌ No Flow Wallet/Lilico detected on desktop');
      }

    } else if (isTablet) {
      // Tablet: Hybrid approach
      console.log('📱 Tablet detected - using hybrid wallet detection');
      (window as any).FORCE_SHOW_ALL_WALLETS = false; // Don't force all
      
      // Enable mobile wallet options but respect desktop extensions if available
      if ((window as any).lilico || (window as any).flowWallet) {
        console.log('✅ Desktop wallet extensions found on tablet');
      } else {
        console.log('🔄 Enabling mobile wallet options for tablet');
        (window as any).MOBILE_WALLET_OVERRIDE = true;
      }

    } else if (isMobile) {
      // Mobile: Enable mobile-specific wallet options
      console.log('📱 Mobile detected - enabling mobile wallet support');
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).MOBILE_WALLET_OVERRIDE = true;
      
      console.log('📱 Mobile wallet options enabled');
    }

    // Don't interfere if user is already connected
    if (user) {
      console.log('✅ User already connected, skipping wallet detection overrides');
      return;
    }

  }, [user]);

  return null; // This component doesn't render anything
};

export default SmartWalletDetection;

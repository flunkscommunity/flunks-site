// Mobile wallet detection utilities for Flow ecosystem

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
};

export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|Android/i.test(window.navigator.userAgent) && 
         (window.innerWidth >= 768 || window.innerHeight >= 768);
};

export const detectMobileWallets = () => {
  if (typeof window === 'undefined') return {};
  
  const wallets = {
    // Blocto - has good mobile web support
    blocto: !!(window as any).blocto || !!(window as any).BloctoWallet,
    
    // Dapper - mobile web supported
    dapper: !!(window as any).dapper,
    
    // Lilico/Flow Wallet - check for all possible variants
    lilico: !!(window as any).lilico || 
            !!(window as any).fcl_wallet?.lilico ||
            !!(window as any).flowWallet?.lilico ||
            !!(window as any).flowWallet ||
            // Additional checks for newer implementations
            !!(window as any).FlowWallet ||
            !!(window as any).flow?.wallet,
    
    // FCL configuration
    fcl: !!(window as any).fcl,
    
    // Check for mobile app deep links or injected providers
    flowWalletMobile: !!(window as any).flowWallet || 
                      !!(window as any).FlowWallet ||
                      !!(window as any).flow ||
                      !!(window as any).fcl_wallet?.flow ||
                      // Check for browser extension
                      !!(window as any).lilico
  };
  
  console.log('📱 Mobile Wallet Detection:', wallets);
  return wallets;
};

export const getMobileWalletConnectionUrl = (walletType: string, returnUrl?: string) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const callback = returnUrl || currentUrl;
  
  switch (walletType) {
    case 'lilico':
      // Lilico mobile app deep link
      return `https://lilico.app/wc?uri=${encodeURIComponent(callback)}`;
    
    case 'blocto':
      // Blocto mobile connection
      return `https://wallet.blocto.app/connect?callback=${encodeURIComponent(callback)}`;
    
    case 'dapper':
      // Dapper wallet connection
      return `https://accounts.meetdapper.com/connect?callback=${encodeURIComponent(callback)}`;
    
    default:
      return null;
  }
};

export const shouldUseMobileWalletFlow = (): boolean => {
  return isMobileDevice() && !isTabletDevice();
};

// Enhanced mobile wallet availability check
export const checkMobileWalletAvailability = () => {
  if (!isMobileDevice()) return { available: false, reason: 'Not a mobile device' };
  
  const detected = detectMobileWallets();
  const availableWallets = Object.entries(detected)
    .filter(([_, available]) => available)
    .map(([wallet, _]) => wallet);
  
  return {
    available: availableWallets.length > 0,
    wallets: availableWallets,
    recommendations: availableWallets.length === 0 ? [
      'Install Blocto wallet app',
      'Install Lilico/Flow Wallet app', 
      'Use Dapper wallet in browser'
    ] : []
  };
};

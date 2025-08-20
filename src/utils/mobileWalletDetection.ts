// Mobile wallet detection utilities for Flow ecosystem

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // More comprehensive mobile detection
  const userAgent = window.navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768 || window.screen.width <= 768;
  
  // Check for specific mobile indicators
  const mobileIndicators = [
    isMobileUA,
    isTouchDevice && isSmallScreen,
    /Mobi|Android/i.test(userAgent),
    /iPhone|iPad|iPod/i.test(userAgent),
    window.orientation !== undefined
  ];
  
  const isMobile = mobileIndicators.some(indicator => indicator);
  
  console.log('🔍 Mobile Detection Details:', {
    userAgent,
    isMobileUA,
    isTouchDevice,
    isSmallScreen,
    screenWidth: window.screen?.width,
    innerWidth: window.innerWidth,
    orientation: window.orientation,
    result: isMobile
  });
  
  return isMobile;
};

export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|Android/i.test(window.navigator.userAgent) && 
         (window.innerWidth >= 768 || window.innerHeight >= 768);
};

export const detectMobileWallets = () => {
  if (typeof window === 'undefined') return {};
  
  // Enhanced detection for Flow Wallet/Lilico browser extensions
  const checkFlowWalletExtension = () => {
    // Check common extension injection patterns
    const extensionChecks = [
      // Standard Lilico injection
      !!(window as any).lilico,
      // Flow Wallet browser extension
      !!(window as any).flowWallet,
      !!(window as any).FlowWallet,
      // FCL wallet connections
      !!(window as any).fcl_wallet?.lilico,
      !!(window as any).fcl_wallet?.flowWallet,
      // Flow ecosystem checks
      !!(window as any).flow?.wallet,
      !!(window as any).flow?.lilico,
      // Check for extension context
      !!(document.querySelector('meta[name="flow-wallet-installed"]')),
      !!(document.querySelector('meta[name="lilico-installed"]')),
    ];
    
    return extensionChecks.some(check => check);
  };
  
  // Enhanced mobile wallet detection - more aggressive for mobile
  const isMobile = isMobileDevice();
  
  const wallets = {
    // Blocto - has good mobile web support
    blocto: !!(window as any).blocto || !!(window as any).BloctoWallet || isMobile,
    
    // Dapper - always available via web on mobile
    dapper: isMobile || !!(window as any).dapper,
    
    // Enhanced Lilico/Flow Wallet detection - assume available on mobile
    lilico: isMobile || checkFlowWalletExtension(),
    
    // FCL configuration - assume available if FCL is configured
    fcl: !!(window as any).fcl,
    
    // Generic Flow wallet detection - more lenient on mobile
    flowWalletMobile: isMobile || (checkFlowWalletExtension() || 
                      !!(window as any).flow ||
                      !!(window as any).fcl_wallet?.flow)
  };
  
  console.log('📱 Enhanced Mobile Wallet Detection:', wallets);
  console.log('🔍 Mobile Device:', isMobile);
  console.log('🔍 Window Flow properties:', Object.keys(window).filter(key => 
    key.toLowerCase().includes('lil') || 
    key.toLowerCase().includes('flow') ||
    key.toLowerCase().includes('wallet') ||
    key.toLowerCase().includes('dapper') ||
    key.toLowerCase().includes('blocto')
  ));
  
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

// Mobile wallet forcing utility - adds missing Flow/Dapper wallets to Dynamic Labs
export const forceMobileWalletsAvailable = () => {
  if (typeof window === 'undefined') return;
  
  // More aggressive mobile detection
  const isMobileDevice = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent) ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768;
  
  console.log('🔧 Force Mobile Wallets - Device Detection:', {
    userAgent: navigator.userAgent,
    isMobile: isMobileDevice,
    touchSupport: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints,
    screenWidth: window.innerWidth
  });
  
  if (isMobileDevice) {
    // Force flags to ensure mobile wallet support
    (window as any).FORCE_SHOW_ALL_WALLETS = true;
    (window as any).MOBILE_WALLET_OVERRIDE = true;
    
    console.log('🚨 Mobile detected - forcing wallet availability');
    console.log('🚨 Set flags:', {
      FORCE_SHOW_ALL_WALLETS: (window as any).FORCE_SHOW_ALL_WALLETS,
      MOBILE_WALLET_OVERRIDE: (window as any).MOBILE_WALLET_OVERRIDE
    });
  }
};

// Auto-run on load
if (typeof window !== 'undefined') {
  // Run immediately
  forceMobileWalletsAvailable();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceMobileWalletsAvailable);
  }
  
  // Run when page loads
  window.addEventListener('load', forceMobileWalletsAvailable);
}

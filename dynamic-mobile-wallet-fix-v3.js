// Dynamic Labs Mobile Wallet Compatibility Fix v3
// Fixes: "undefined is not an object (evaluating 'e.isEmbeddedWallet')" error
// Focus: Mobile wallet object structure for Dynamic Labs SDK

console.log('🔧 Dynamic Labs Mobile Wallet Fix v3 - Starting...');

// Enhanced mobile detection
function isMobileDevice() {
  const mobileChecks = [
    /Android/i.test(navigator.userAgent),
    /webOS/i.test(navigator.userAgent),
    /iPhone/i.test(navigator.userAgent),
    /iPad/i.test(navigator.userAgent),
    /iPod/i.test(navigator.userAgent),
    /BlackBerry/i.test(navigator.userAgent),
    /Windows Phone/i.test(navigator.userAgent),
    window.innerWidth <= 768,
    'ontouchstart' in window
  ];
  
  return mobileChecks.some(check => check);
}

// Wait for Dynamic Labs to load
function waitForDynamic() {
  return new Promise((resolve) => {
    if (window.DynamicSDK) {
      resolve(window.DynamicSDK);
      return;
    }
    
    const checkInterval = setInterval(() => {
      if (window.DynamicSDK) {
        clearInterval(checkInterval);
        resolve(window.DynamicSDK);
      }
    }, 100);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(null);
    }, 30000);
  });
}

// Create Dynamic Labs compatible wallet objects
function createDynamicCompatibleWallet(config) {
  return {
    // Required by Dynamic Labs SDK
    key: config.key,
    name: config.name,
    isEmbeddedWallet: false,
    isConnectorWallet: true,
    
    // Mobile specific properties
    mobile: true,
    isMobile: true,
    installed: true,
    isInstalled: true,
    available: true,
    canConnect: true,
    
    // Version info
    version: config.version || '1.0.0',
    
    // Connection methods
    connect: config.connect,
    authenticate: config.authenticate || config.connect,
    disconnect: config.disconnect || (() => Promise.resolve()),
    
    // Event handling
    on: config.on || (() => {}),
    off: config.off || (() => {}),
    
    // Additional properties Dynamic might check
    provider: config.provider || null,
    isConnected: false,
    accounts: [],
    
    // Metadata
    icon: config.icon || null,
    description: config.description || `${config.name} mobile wallet`,
    website: config.website || null,
    
    // Flow-specific properties
    ...(config.flowSpecific || {})
  };
}

// Enhanced mobile wallet configurations
const mobileWalletConfigs = {
  flowwallet: {
    key: 'flowwallet',
    name: 'Flow Wallet',
    version: '1.0.0',
    icon: 'https://wallet.flow.com/favicon.ico',
    website: 'https://wallet.flow.com',
    description: 'Official Flow blockchain wallet',
    connect: async () => {
      console.log('🌊 Flow Wallet mobile connect initiated');
      
      const callback = encodeURIComponent(window.location.href);
      const deepLink = `flowwallet://connect?callback=${callback}`;
      const webLink = `https://wallet.flow.com/connect?callback=${callback}`;
      
      try {
        // Try app deep link first
        window.location.href = deepLink;
        
        // Web fallback after delay
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            window.open(webLink, '_self');
          }
        }, 3000);
        
        return Promise.resolve({
          address: 'flow-mobile-connecting',
          user: { addr: 'flow-mobile-connecting' }
        });
      } catch (error) {
        console.log('Flow Wallet connection error:', error);
        window.open(webLink, '_self');
        return Promise.resolve({ address: 'flow-mobile-fallback' });
      }
    },
    flowSpecific: {
      fcl: true,
      blockchain: 'flow',
      network: 'mainnet'
    }
  },
  
  lilico: {
    key: 'lilico',
    name: 'Lilico',
    version: '1.0.0',
    icon: 'https://lilico.app/favicon.ico',
    website: 'https://lilico.app',
    description: 'Feature-rich Flow wallet with DeFi integration',
    connect: async () => {
      console.log('🦄 Lilico mobile connect initiated');
      
      const callback = encodeURIComponent(window.location.href);
      const deepLink = `lilico://connect?callback=${callback}`;
      const webLink = `https://lilico.app/connect?callback=${callback}`;
      
      try {
        window.location.href = deepLink;
        
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            window.open(webLink, '_self');
          }
        }, 3000);
        
        return Promise.resolve({
          address: 'lilico-mobile-connecting',
          user: { addr: 'lilico-mobile-connecting' }
        });
      } catch (error) {
        console.log('Lilico connection error:', error);
        window.open(webLink, '_self');
        return Promise.resolve({ address: 'lilico-mobile-fallback' });
      }
    },
    flowSpecific: {
      fcl: true,
      blockchain: 'flow',
      network: 'mainnet',
      features: ['nft', 'defi', 'staking']
    }
  },
  
  dapper: {
    key: 'dapper',
    name: 'Dapper',
    version: '1.0.0',
    icon: 'https://www.meetdapper.com/favicon.ico',
    website: 'https://www.meetdapper.com',
    description: 'User-friendly crypto wallet and gateway',
    connect: async () => {
      console.log('💳 Dapper mobile connect initiated');
      
      const callback = encodeURIComponent(window.location.href);
      const webLink = `https://accounts.meetdapper.com/connect?callback=${callback}`;
      
      try {
        window.open(webLink, '_self');
        return Promise.resolve({
          address: 'dapper-mobile-connecting',
          user: { addr: 'dapper-mobile-connecting' }
        });
      } catch (error) {
        console.log('Dapper connection error:', error);
        return Promise.resolve({ address: 'dapper-mobile-fallback' });
      }
    },
    flowSpecific: {
      fcl: true,
      blockchain: 'flow',
      network: 'mainnet',
      custodial: true
    }
  }
};

// Initialize mobile wallets with Dynamic Labs compatibility
async function initializeMobileWallets() {
  if (!isMobileDevice()) {
    console.log('🖥️ Desktop detected - skipping mobile wallet setup');
    return;
  }
  
  console.log('📱 Mobile device detected - initializing mobile wallets...');
  
  try {
    // Wait for Dynamic to be available
    const dynamic = await waitForDynamic();
    if (!dynamic) {
      console.log('⚠️ Dynamic Labs SDK not found - proceeding with window setup');
    }
    
    // Create wallet objects
    Object.entries(mobileWalletConfigs).forEach(([key, config]) => {
      const walletObject = createDynamicCompatibleWallet(config);
      
      // Attach to window
      window[key] = walletObject;
      
      // Also attach with common naming conventions
      if (key === 'flowwallet') {
        window.flowWallet = walletObject;
        window.flow = walletObject;
      }
      
      console.log(`✅ ${config.name} wallet object created with Dynamic compatibility`);
    });
    
    // Create global mobile wallets array for Dynamic Labs
    window.mobileWallets = Object.values(mobileWalletConfigs).map(config => 
      createDynamicCompatibleWallet(config)
    );
    
    // Dispatch event for Dynamic Labs to pick up new wallets
    window.dispatchEvent(new CustomEvent('wallets-updated', {
      detail: { mobileWallets: window.mobileWallets }
    }));
    
    console.log('🎉 Mobile wallet setup complete - Dynamic Labs compatible');
    
    // Debug information
    console.log('📊 Mobile Wallet Debug Info:');
    console.log('- Flow Wallet object:', window.flowwallet);
    console.log('- Lilico object:', window.lilico);
    console.log('- Dapper object:', window.dapper);
    console.log('- Mobile wallets array:', window.mobileWallets);
    
    return true;
    
  } catch (error) {
    console.error('❌ Mobile wallet initialization failed:', error);
    return false;
  }
}

// Patch Dynamic Labs if needed
function patchDynamicLabs() {
  // Listen for Dynamic Labs loading
  const originalWalletFilter = window.DynamicWalletFilter;
  if (originalWalletFilter) {
    window.DynamicWalletFilter = function(wallets) {
      const patched = wallets.map(wallet => {
        if (!wallet.isEmbeddedWallet) {
          wallet.isEmbeddedWallet = false;
        }
        if (!wallet.isConnectorWallet) {
          wallet.isConnectorWallet = true;
        }
        return wallet;
      });
      return originalWalletFilter(patched);
    };
  }
}

// Run the fix
(async function runMobileFix() {
  console.log('🚀 Starting Dynamic Labs mobile wallet compatibility fix...');
  
  // Apply patches
  patchDynamicLabs();
  
  // Initialize mobile wallets
  const success = await initializeMobileWallets();
  
  if (success) {
    console.log('✅ Dynamic Labs mobile wallet fix completed successfully!');
  } else {
    console.log('⚠️ Mobile wallet fix completed with warnings');
  }
  
  // Test wallet objects
  setTimeout(() => {
    console.log('🧪 Testing wallet objects...');
    
    ['flowwallet', 'lilico', 'dapper'].forEach(walletKey => {
      const wallet = window[walletKey];
      if (wallet) {
        console.log(`✅ ${walletKey}:`, {
          hasEmbeddedWalletProp: 'isEmbeddedWallet' in wallet,
          hasConnectorWalletProp: 'isConnectorWallet' in wallet,
          isEmbeddedWallet: wallet.isEmbeddedWallet,
          isConnectorWallet: wallet.isConnectorWallet,
          canConnect: wallet.canConnect,
          isMobile: wallet.isMobile
        });
      } else {
        console.log(`❌ ${walletKey}: not found`);
      }
    });
  }, 1000);
})();

// Export for manual testing
window.dynamicMobileFix = {
  isMobileDevice,
  initializeMobileWallets,
  mobileWalletConfigs,
  createDynamicCompatibleWallet
};

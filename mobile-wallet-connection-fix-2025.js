// MOBILE WALLET CONNECTION FIX - AUGUST 2025
// This script fixes the issue where Dynamic Labs opens but mobile wallets don't connect

console.log('📱 MOBILE WALLET CONNECTION FIX - AUGUST 2025');
console.log('===============================================');

// Step 1: Override mobile wallet behavior
const setupMobileWalletOverrides = () => {
  console.log('🔧 Step 1: Setting up mobile wallet overrides...');
  
  // Override Dynamic Labs mobile wallet behavior
  if (typeof window !== 'undefined') {
    // Force mobile wallet mode
    window.FORCE_MOBILE_WALLET_MODE = true;
    window.MOBILE_DEEP_LINK_MODE = true;
    
    // Override wallet detection to return true for mobile apps
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
      console.log('🔗 Intercepted window.open:', { url, target, features });
      
      // Check if this looks like a wallet deep link
      if (url && (
        url.includes('flowwallet://') ||
        url.includes('lilico://') ||
        url.includes('dapper://') ||
        url.includes('blocto://') ||
        url.includes('wallet.flow.com') ||
        url.includes('lilico.app') ||
        url.includes('accounts.meetdapper.com')
      )) {
        console.log('📱 Mobile wallet deep link detected, opening...');
        
        // Try to open the mobile app
        const result = originalWindowOpen.call(this, url, '_self');
        
        // Also try direct navigation as fallback
        setTimeout(() => {
          window.location.href = url;
        }, 1000);
        
        return result;
      }
      
      return originalWindowOpen.call(this, url, target, features);
    };
    
    console.log('  ✅ Mobile wallet overrides set');
  }
};

// Step 2: Create mobile-friendly wallet connection handlers
const createMobileWalletHandlers = () => {
  console.log('📲 Step 2: Creating mobile wallet handlers...');
  
  // Enhanced mobile wallet objects with proper deep linking
  const mobileWallets = {
    flowWallet: {
      name: 'Flow Wallet',
      isInstalled: true,
      isMobile: true,
      connect: async () => {
        console.log('🌊 Flow Wallet mobile connect initiated');
        
        // Try Flow Wallet mobile app deep link
        const deepLink = 'flowwallet://connect?callback=' + encodeURIComponent(window.location.href);
        const webLink = 'https://wallet.flow.com/connect?callback=' + encodeURIComponent(window.location.href);
        
        // Try deep link first
        try {
          window.location.href = deepLink;
        } catch (e) {
          console.log('Deep link failed, trying web link...');
          window.open(webLink, '_self');
        }
        
        return { address: 'flow-mobile-connecting' };
      }
    },
    
    lilico: {
      name: 'Lilico',
      isInstalled: true,
      isMobile: true,
      connect: async () => {
        console.log('🦄 Lilico mobile connect initiated');
        
        // Try Lilico mobile app deep link  
        const deepLink = 'lilico://connect?callback=' + encodeURIComponent(window.location.href);
        const webLink = 'https://lilico.app/connect?callback=' + encodeURIComponent(window.location.href);
        
        try {
          window.location.href = deepLink;
        } catch (e) {
          console.log('Deep link failed, trying web link...');
          window.open(webLink, '_self');
        }
        
        return { address: 'lilico-mobile-connecting' };
      }
    },
    
    dapper: {
      name: 'Dapper',
      isInstalled: true,
      isMobile: true,
      connect: async () => {
        console.log('💳 Dapper mobile connect initiated');
        
        // Dapper web-based connection for mobile
        const webLink = 'https://accounts.meetdapper.com/connect?callback=' + encodeURIComponent(window.location.href);
        window.open(webLink, '_self');
        
        return { address: 'dapper-mobile-connecting' };
      }
    }
  };
  
  // Install mobile wallet objects
  Object.keys(mobileWallets).forEach(walletKey => {
    window[walletKey] = mobileWallets[walletKey];
    console.log(`  ✅ Created mobile ${mobileWallets[walletKey].name} handler`);
  });
  
  console.log('  📱 Mobile wallet handlers ready');
};

// Step 3: Enhance Dynamic Labs for mobile
const enhanceDynamicForMobile = () => {
  console.log('🚀 Step 3: Enhancing Dynamic Labs for mobile...');
  
  // Intercept Dynamic Labs wallet selection
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0]?.toString() || '';
    
    // Enhance Dynamic wallet API responses for mobile
    if (url.includes('dynamic') && (url.includes('wallet') || url.includes('connect'))) {
      try {
        const clonedResponse = response.clone();
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await clonedResponse.json();
          
          // Force mobile wallets to be available and connectable
          if (data.wallets && Array.isArray(data.wallets)) {
            data.wallets = data.wallets.map(wallet => {
              // Enhance Flow ecosystem wallets for mobile
              if (wallet.key && (
                wallet.key.toLowerCase().includes('flow') ||
                wallet.key.toLowerCase().includes('lilico') ||
                wallet.key.toLowerCase().includes('dapper')
              )) {
                return {
                  ...wallet,
                  mobile: true,
                  available: true,
                  installed: true,
                  canConnect: true,
                  isInstalled: true,
                  deepLinkSupport: true
                };
              }
              return wallet;
            });
            
            console.log('  🔄 Enhanced Dynamic wallet response for mobile');
            
            // Return modified response
            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        }
      } catch (e) {
        console.log('  ⚠️ Could not enhance Dynamic response:', e);
      }
    }
    
    return response;
  };
  
  console.log('  ✅ Dynamic Labs mobile enhancement active');
};

// Step 4: Add mobile wallet UI helpers
const addMobileWalletUI = () => {
  console.log('🎨 Step 4: Adding mobile wallet UI helpers...');
  
  // Create a mobile wallet helper button
  const createMobileWalletHelper = () => {
    // Remove any existing helper
    const existingHelper = document.getElementById('mobile-wallet-helper');
    if (existingHelper) {
      existingHelper.remove();
    }
    
    const helper = document.createElement('div');
    helper.id = 'mobile-wallet-helper';
    helper.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(45deg, #00D4AA, #4A90E2);
      color: white;
      padding: 12px 16px;
      border-radius: 25px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: pulse 2s infinite;
    `;
    
    helper.innerHTML = `
      <span>📱</span>
      <span>Connect Mobile Wallet</span>
    `;
    
    helper.addEventListener('click', () => {
      console.log('📱 Mobile wallet helper clicked');
      
      // Show wallet options
      const walletOptions = [
        { name: 'Flow Wallet', action: () => window.flowWallet?.connect() },
        { name: 'Lilico', action: () => window.lilico?.connect() },
        { name: 'Dapper', action: () => window.dapper?.connect() }
      ];
      
      const optionsList = walletOptions.map(wallet => 
        `• ${wallet.name}`
      ).join('\n');
      
      const choice = confirm(`Choose your mobile wallet:\n\n${optionsList}\n\nClick OK for Flow Wallet, or Cancel to see all options`);
      
      if (choice) {
        // User chose OK - connect Flow Wallet
        window.flowWallet?.connect();
      } else {
        // Show Dynamic Labs modal
        if (window.dynamic?.setShowAuthFlow) {
          window.dynamic.setShowAuthFlow(true);
        }
      }
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(helper);
    console.log('  ✅ Mobile wallet helper UI added');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (helper.parentNode) {
        helper.style.opacity = '0.5';
      }
    }, 10000);
  };
  
  // Create helper after a small delay
  setTimeout(createMobileWalletHelper, 2000);
};

// Step 5: Monitor and fix connection attempts
const monitorMobileConnections = () => {
  console.log('👁️ Step 5: Monitoring mobile wallet connections...');
  
  // Listen for wallet connection events
  const connectionEvents = [
    'walletConnected',
    'walletDisconnected', 
    'authSuccess',
    'authFailure',
    'dynamicAuthSuccess',
    'dynamicAuthFailure'
  ];
  
  connectionEvents.forEach(eventName => {
    window.addEventListener(eventName, (event) => {
      console.log(`📡 Mobile wallet event: ${eventName}`, event.detail);
      
      if (eventName.includes('Success') || eventName === 'walletConnected') {
        // Connection successful - remove helper UI
        const helper = document.getElementById('mobile-wallet-helper');
        if (helper) {
          helper.style.display = 'none';
        }
      }
    });
  });
  
  // Monitor Dynamic Labs state changes
  let lastAuthState = null;
  const checkAuthState = () => {
    const currentAuthState = {
      user: !!window.dynamic?.user,
      wallet: !!window.dynamic?.primaryWallet,
      address: window.dynamic?.primaryWallet?.address
    };
    
    if (JSON.stringify(currentAuthState) !== JSON.stringify(lastAuthState)) {
      console.log('🔄 Auth state changed:', currentAuthState);
      lastAuthState = currentAuthState;
      
      if (currentAuthState.wallet && currentAuthState.address) {
        console.log('🎉 Mobile wallet connection successful!');
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('mobileWalletConnected', {
          detail: currentAuthState
        }));
      }
    }
  };
  
  // Check auth state every 2 seconds
  setInterval(checkAuthState, 2000);
  
  console.log('  ✅ Mobile connection monitoring active');
};

// Main execution function
const runMobileWalletConnectionFix = () => {
  console.log('🚀 Starting mobile wallet connection fix...\n');
  
  setupMobileWalletOverrides();
  console.log('');
  
  createMobileWalletHandlers();
  console.log('');
  
  enhanceDynamicForMobile();
  console.log('');
  
  addMobileWalletUI();
  console.log('');
  
  monitorMobileConnections();
  console.log('');
  
  console.log('✅ MOBILE WALLET CONNECTION FIX COMPLETE!');
  console.log('==========================================');
  console.log('📱 Mobile wallet deep links enabled');
  console.log('🎯 Enhanced Dynamic Labs mobile support');
  console.log('🎨 Mobile wallet helper UI added');
  console.log('👁️ Connection monitoring active');
  
  console.log('\n💡 HOW TO USE:');
  console.log('1. Look for the floating "Connect Mobile Wallet" button');
  console.log('2. Click it to see wallet options');
  console.log('3. Choose your preferred mobile wallet');
  console.log('4. You\'ll be redirected to the wallet app');
  console.log('5. Approve the connection in your wallet app');
  console.log('6. You\'ll be redirected back to the site');
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    mobileWalletsActive: {
      flowWallet: !!window.flowWallet,
      lilico: !!window.lilico,
      dapper: !!window.dapper
    },
    flags: {
      FORCE_MOBILE_WALLET_MODE: window.FORCE_MOBILE_WALLET_MODE,
      MOBILE_DEEP_LINK_MODE: window.MOBILE_DEEP_LINK_MODE
    }
  };
};

// Auto-execute the fix
const results = runMobileWalletConnectionFix();
console.log('\n📊 Fix Results:', results);

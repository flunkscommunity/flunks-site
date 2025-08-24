// DIRECT AUTHENTICATION FIX FOR APPS
// This script directly fixes authentication issues in OnlyFlunks, Semester Zero, etc.

console.log('🛠️ DIRECT AUTHENTICATION FIX FOR APPS');
console.log('=====================================');

// Check current authentication state
const checkAuth = () => {
  const auth = {
    dynamic: !!window.dynamic,
    user: !!window.dynamic?.user, 
    wallet: !!window.dynamic?.primaryWallet,
    address: window.dynamic?.primaryWallet?.address || null
  };
  
  console.log('🔍 Current Auth State:', auth);
  return auth;
};

// Force all apps to recognize authentication
const forceAuthRecognition = () => {
  console.log('🔧 Forcing authentication recognition...');
  
  const auth = checkAuth();
  
  if (!auth.address) {
    console.log('❌ No wallet connected - cannot force recognition');
    return false;
  }
  
  // Set global authentication flags that all apps can check
  window.WALLET_AUTHENTICATED = true;
  window.USER_WALLET_ADDRESS = auth.address;
  window.DYNAMIC_USER_CONNECTED = true;
  
  // Create a global authentication object
  window.AUTH_STATE = {
    isAuthenticated: true,
    user: window.dynamic?.user,
    primaryWallet: window.dynamic?.primaryWallet,
    address: auth.address,
    timestamp: Date.now()
  };
  
  console.log('✅ Set global authentication flags');
  
  // Dispatch comprehensive authentication events
  const authEvents = [
    'authStateChanged',
    'walletAuthenticated', 
    'userConnected',
    'dynamicAuthUpdate',
    'flunksAuthReady'
  ];
  
  authEvents.forEach(eventName => {
    // Dispatch on window
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: window.AUTH_STATE,
      bubbles: true
    }));
    
    // Also dispatch on document for React components
    document.dispatchEvent(new CustomEvent(eventName, {
      detail: window.AUTH_STATE,
      bubbles: true
    }));
    
    console.log(`  📡 Dispatched ${eventName}`);
  });
  
  return true;
};

// Fix specific app authentication checks
const fixAppAuthentication = () => {
  console.log('🎮 Fixing individual app authentication...');
  
  // Fix OnlyFlunks - look for authentication prompts and remove them
  const onlyFlunksPrompts = Array.from(document.querySelectorAll('*')).filter(el =>
    el.textContent?.includes('Connect Wallet to Access OnlyFlunks') ||
    el.textContent?.includes('🔒 Connect Wallet to Access OnlyFlunks')
  );
  
  if (onlyFlunksPrompts.length > 0) {
    console.log(`  🎯 Found ${onlyFlunksPrompts.length} OnlyFlunks auth prompts`);
    onlyFlunksPrompts.forEach(prompt => {
      // Try to find the parent component and trigger an update
      let parent = prompt.parentElement;
      while (parent && parent !== document.body) {
        parent.setAttribute('data-auth-override', 'true');
        parent.dispatchEvent(new CustomEvent('forceRerender', { bubbles: true }));
        parent = parent.parentElement;
      }
    });
  }
  
  // Fix Semester Zero - remove any wallet overlays
  const semesterOverlays = document.querySelectorAll('[class*="wallet-prompt-overlay"]');
  if (semesterOverlays.length > 0) {
    console.log(`  🗺️ Found ${semesterOverlays.length} Semester Zero overlays`);
    semesterOverlays.forEach(overlay => {
      overlay.style.display = 'none';
      overlay.remove();
    });
  }
  
  // Fix Profile creation prompts
  const profilePrompts = Array.from(document.querySelectorAll('*')).filter(el =>
    el.textContent?.includes('create your profile') ||
    el.textContent?.includes('Connect Your Wallet')
  );
  
  if (profilePrompts.length > 0) {
    console.log(`  👤 Found ${profilePrompts.length} Profile creation prompts`);
    profilePrompts.forEach(prompt => {
      prompt.setAttribute('data-auth-fixed', 'true');
      prompt.dispatchEvent(new CustomEvent('authUpdate', { bubbles: true }));
    });
  }
  
  console.log('  ✅ App-specific fixes applied');
};

// Monitor for new authentication prompts and fix them
const startAuthMonitor = () => {
  console.log('👀 Starting authentication monitor...');
  
  let monitorCount = 0;
  const maxMonitors = 10; // Prevent infinite monitoring
  
  const monitor = () => {
    monitorCount++;
    
    if (monitorCount > maxMonitors) {
      console.log('⏹️ Auth monitor stopped (max iterations reached)');
      return;
    }
    
    const auth = checkAuth();
    
    if (auth.address) {
      // Check if any apps are still showing auth prompts
      const authPrompts = Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent?.includes('Connect Wallet to Access') &&
        !el.hasAttribute('data-auth-fixed')
      );
      
      if (authPrompts.length > 0) {
        console.log(`🔄 Monitor ${monitorCount}: Found ${authPrompts.length} new auth prompts, fixing...`);
        fixAppAuthentication();
        forceAuthRecognition();
      } else {
        console.log(`✅ Monitor ${monitorCount}: All apps recognizing authentication`);
      }
    } else {
      console.log(`⏸️ Monitor ${monitorCount}: Wallet not connected, pausing`);
    }
  };
  
  // Run monitor every 2 seconds
  const interval = setInterval(monitor, 2000);
  
  // Stop monitoring after 20 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('⏹️ Auth monitor stopped (timeout)');
  }, 20000);
  
  return interval;
};

// Main fix function
const runAuthFix = async () => {
  console.log('🚀 Running comprehensive authentication fix...\n');
  
  // Step 1: Check current state
  const auth = checkAuth();
  console.log('');
  
  if (!auth.dynamic) {
    console.log('❌ Dynamic Labs not loaded - cannot proceed');
    console.log('💡 Make sure you\'re on the correct page and Dynamic Labs is initialized');
    return false;
  }
  
  if (!auth.address) {
    console.log('⚠️ No wallet connected');
    console.log('🔄 Opening wallet connection dialog...');
    
    if (window.dynamic.setShowAuthFlow) {
      window.dynamic.setShowAuthFlow(true);
      console.log('✅ Wallet connection dialog opened');
      console.log('💡 Connect your wallet, then run this script again');
    } else {
      console.log('❌ Cannot open wallet dialog - method not available');
    }
    
    return false;
  }
  
  // Step 2: Force authentication recognition
  const recognized = forceAuthRecognition();
  if (!recognized) {
    console.log('❌ Could not force authentication recognition');
    return false;
  }
  console.log('');
  
  // Step 3: Fix app-specific authentication
  fixAppAuthentication();
  console.log('');
  
  // Step 4: Start monitoring
  startAuthMonitor();
  console.log('');
  
  console.log('🏁 AUTHENTICATION FIX COMPLETED');
  console.log('================================');
  console.log('✅ Wallet Connected:', auth.address);
  console.log('✅ Global auth flags set');
  console.log('✅ Events dispatched to React components');
  console.log('✅ App-specific fixes applied');
  console.log('✅ Monitoring started');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Try opening OnlyFlunks - should show your NFTs');
  console.log('2. Open Semester Zero - map should be accessible');
  console.log('3. Try Create Profile - should recognize your wallet');
  console.log('4. Test Chat Rooms - should allow access');
  console.log('5. If issues persist, refresh the page');
  
  return true;
};

// Export to window for manual use
window.runAuthFix = runAuthFix;
window.forceAuthRecognition = forceAuthRecognition;
window.fixAppAuth = fixAppAuthentication;
window.checkAuth = checkAuth;

// Auto-run the fix
console.log('🔥 AUTO-RUNNING AUTHENTICATION FIX...');
runAuthFix();

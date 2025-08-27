// Chat User Detection Fix
// Run this script in the browser console while on the chat page

function fixChatUserDetection() {
  console.log('🔧 Chat User Detection Fix - Starting...');
  
  // Check Dynamic context
  const dynamicContext = window.Dynamic;
  if (dynamicContext) {
    console.log('✅ Dynamic context found:', dynamicContext);
    const user = dynamicContext.user;
    console.log('Current user state:', user);
    
    if (user) {
      console.log('✅ User is authenticated:', {
        id: user.userId,
        email: user.email,
        wallets: user.verifiedCredentials?.map(c => c.walletName) || []
      });
    } else {
      console.log('❌ No user found in Dynamic context');
    }
  } else {
    console.log('❌ Dynamic context not found');
  }
  
  // Force React re-render by dispatching custom event
  console.log('🔄 Triggering React re-render...');
  window.dispatchEvent(new CustomEvent('dynamic-user-update', { 
    detail: { forceUpdate: true } 
  }));
  
  // Try to access the React component state directly
  const reactRoot = document.querySelector('#__next');
  if (reactRoot && reactRoot._reactInternalInstance) {
    console.log('🔄 Forcing React update...');
    // This is a hack but might work for older React versions
    reactRoot._reactInternalInstance.forceUpdate?.();
  }
  
  // Check session storage for access levels
  const accessLevel = localStorage.getItem('flunks-access-level');
  const accessGranted = localStorage.getItem('flunks-access-granted');
  console.log('📊 Session storage:', { accessLevel, accessGranted });
  
  // If user is authenticated but chat still shows connect wallet, force a page refresh
  setTimeout(() => {
    if (dynamicContext?.user && document.querySelector('[data-testid="connect-wallet"]')) {
      console.log('🔄 User authenticated but chat not working - refreshing page...');
      window.location.reload();
    }
  }, 2000);
}

// Also create a function to check specifically for FlunksMessenger component issues
function debugFlunksMessenger() {
  console.log('🔍 Debugging FlunksMessenger component...');
  
  // Look for the messenger window
  const messenger = document.querySelector('[data-window-id="flunks-messenger"]');
  if (messenger) {
    console.log('✅ FlunksMessenger window found');
    
    // Check if it's showing the connect wallet message
    const connectWalletHeader = messenger.querySelector('h2');
    if (connectWalletHeader && connectWalletHeader.textContent.includes('Connect Wallet')) {
      console.log('❌ FlunksMessenger is showing Connect Wallet screen');
      console.log('Header text:', connectWalletHeader.textContent);
      
      // Check if Dynamic context has a user
      if (window.Dynamic?.user) {
        console.log('⚠️ MISMATCH: Dynamic has user but FlunksMessenger shows connect wallet!');
        console.log('This is likely a React state synchronization issue');
        
        // Try to trigger a re-render
        fixChatUserDetection();
      }
    } else {
      console.log('✅ FlunksMessenger is not showing Connect Wallet screen');
    }
  } else {
    console.log('❌ FlunksMessenger window not found');
  }
}

// Run the fixes
fixChatUserDetection();
setTimeout(debugFlunksMessenger, 1000);

console.log(`
🔧 Chat User Detection Fix Complete!

To manually test:
1. Check if you're logged in: window.Dynamic?.user
2. Open FlunksMessenger window 
3. If still shows "Connect Wallet", run: fixChatUserDetection()
4. If issue persists, try: window.location.reload()
`);

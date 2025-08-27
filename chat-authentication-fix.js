// Chat Room Authentication Fix
// Run this in browser console to debug and fix chat authentication issues

console.log('🔧 Chat Room Authentication Fix - Starting...');

// Step 1: Check current authentication state
const checkAuthState = () => {
  console.log('\n📊 Authentication State Check:');
  
  // Check Dynamic context
  const dynamicUser = window.dynamic?.user;
  const dynamicWallet = window.dynamic?.primaryWallet;
  
  console.log('Dynamic Context:');
  console.log('  User:', !!dynamicUser);
  console.log('  Primary Wallet:', !!dynamicWallet);
  console.log('  Wallet Address:', dynamicWallet?.address);
  
  // Check session storage
  const accessGranted = sessionStorage.getItem('flunks-access-granted');
  const accessLevel = sessionStorage.getItem('flunks-access-level');
  const accessCode = sessionStorage.getItem('flunks-access-code');
  
  console.log('Session Storage:');
  console.log('  Access Granted:', accessGranted);
  console.log('  Access Level:', accessLevel);
  console.log('  Access Code:', accessCode);
  
  return {
    dynamicUser: !!dynamicUser,
    dynamicWallet: !!dynamicWallet,
    walletAddress: dynamicWallet?.address,
    accessGranted,
    accessLevel,
    accessCode
  };
};

// Step 2: Force authentication state
const forceAuthState = () => {
  console.log('\n🔓 Forcing authentication state...');
  
  const dynamicUser = window.dynamic?.user;
  const dynamicWallet = window.dynamic?.primaryWallet;
  
  if (dynamicUser && dynamicWallet) {
    // Ensure session storage is set
    sessionStorage.setItem('flunks-access-granted', 'true');
    sessionStorage.setItem('flunks-access-level', 'COMMUNITY');
    sessionStorage.setItem('flunks-access-code', 'CHAT_FIX_GRANT');
    
    console.log('✅ Session storage updated');
    
    // Force React re-render by updating a data attribute on chat-related elements
    const chatElements = [
      ...document.querySelectorAll('[class*="messenger"]'),
      ...document.querySelectorAll('[class*="chat"]'),
      ...document.querySelectorAll('[data-window-id*="messenger"]')
    ];
    
    chatElements.forEach(element => {
      element.setAttribute('data-auth-refresh', Date.now().toString());
      // Dispatch a custom event to trigger re-renders
      element.dispatchEvent(new CustomEvent('authStateChanged', { 
        bubbles: true,
        detail: { 
          authenticated: true,
          user: dynamicUser,
          wallet: dynamicWallet 
        }
      }));
    });
    
    console.log(`✅ Triggered re-render on ${chatElements.length} chat elements`);
    
    // Global auth refresh event
    window.dispatchEvent(new Event('flunks-access-updated'));
    window.dispatchEvent(new CustomEvent('dynamicAuthRefresh', {
      detail: { user: dynamicUser, wallet: dynamicWallet }
    }));
    
    return true;
  } else {
    console.log('❌ No Dynamic user/wallet found - connect wallet first');
    return false;
  }
};

// Step 3: Test chat room access
const testChatAccess = () => {
  console.log('\n🧪 Testing chat room access...');
  
  // Find chat room icon
  const chatIcons = document.querySelectorAll('[title="Chat Rooms"]');
  console.log('Chat Icons found:', chatIcons.length);
  
  if (chatIcons.length > 0) {
    console.log('✅ Chat Rooms icon is visible');
    
    // Try opening chat
    try {
      const event = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      chatIcons[0].dispatchEvent(event);
      console.log('✅ Triggered chat room open');
      
      // Check if messenger window opened
      setTimeout(() => {
        const messengerWindow = document.querySelector('[data-window-id*="messenger"]') ||
                               document.querySelector('[class*="messenger"]');
        
        if (messengerWindow) {
          console.log('✅ Chat messenger window opened');
          
          // Check if it's showing connect wallet or ready to chat
          const connectText = messengerWindow.textContent?.includes('Connect Wallet');
          const readyText = messengerWindow.textContent?.includes('Chat Rooms') || 
                           messengerWindow.textContent?.includes('General Chat');
          
          console.log('Connect Wallet shown:', connectText);
          console.log('Ready to chat:', readyText);
          
          if (connectText) {
            console.log('❌ Still showing "Connect Wallet" - authentication not recognized');
            console.log('💡 Try running forceAuthState() and then refresh');
          } else if (readyText) {
            console.log('✅ Chat is ready! Authentication working correctly');
          }
        } else {
          console.log('❌ Chat messenger window did not open');
        }
      }, 1000);
      
    } catch (error) {
      console.log('❌ Error opening chat:', error);
    }
  } else {
    console.log('❌ Chat Rooms icon not visible - run forceAuthState() first');
  }
};

// Step 4: Comprehensive fix function
const fixChatAuthentication = async () => {
  console.log('\n🛠️ Running comprehensive chat authentication fix...');
  
  // Check current state
  const authState = checkAuthState();
  
  if (!authState.dynamicUser || !authState.dynamicWallet) {
    console.log('❌ No wallet connected - connect wallet first');
    return false;
  }
  
  // Force auth state
  const authForced = forceAuthState();
  
  if (authForced) {
    console.log('⏳ Waiting 2 seconds for React updates...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test access
    testChatAccess();
    
    console.log('\n✅ Chat authentication fix completed');
    console.log('💡 If chat still shows "Connect Wallet", try refreshing the page');
    
    return true;
  }
  
  return false;
};

// Export functions to window for manual use
window.checkAuthState = checkAuthState;
window.forceAuthState = forceAuthState;
window.testChatAccess = testChatAccess;
window.fixChatAuthentication = fixChatAuthentication;

// Auto-run the comprehensive fix
console.log('🚀 Auto-running chat authentication fix...');
fixChatAuthentication();

console.log('\n🎯 Available Functions:');
console.log('  checkAuthState() - Check current auth status');
console.log('  forceAuthState() - Force authentication state');
console.log('  testChatAccess() - Test chat room access');
console.log('  fixChatAuthentication() - Run complete fix');

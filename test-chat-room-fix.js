/**
 * Test Script: Chat Room Access Fix
 * 
 * This script tests if the chat room access fix is working properly.
 * Run this in the browser console after connecting a wallet.
 */

console.log('🧪 Testing Chat Room Access Fix...');

// Test function to check current status
const testChatRoomAccess = () => {
  console.log('\n📊 Current System Status:');
  
  // Check session storage
  const accessGranted = sessionStorage.getItem('flunks-access-granted');
  const accessLevel = sessionStorage.getItem('flunks-access-level');
  const accessCode = sessionStorage.getItem('flunks-access-code');
  
  console.log('Session Storage:');
  console.log('  flunks-access-granted:', accessGranted);
  console.log('  flunks-access-level:', accessLevel);
  console.log('  flunks-access-code:', accessCode);
  
  // Check Dynamic wallet status
  const isDynamicConnected = window.dynamic?.primaryWallet?.address;
  const walletAddress = window.dynamic?.primaryWallet?.address;
  
  console.log('\nWallet Status:');
  console.log('  Connected:', !!isDynamicConnected);
  console.log('  Address:', walletAddress || 'None');
  
  // Check for chat rooms icon
  const chatIcons = document.querySelectorAll('[title="Chat Rooms"]');
  
  console.log('\nChat Rooms Icon:');
  console.log('  Found:', chatIcons.length);
  console.log('  Visible:', chatIcons.length > 0 ? 'Yes' : 'No');
  
  // Test app permission logic
  const testAppPermission = () => {
    const userAccessLevel = sessionStorage.getItem('flunks-access-level');
    
    const APP_PERMISSIONS = [
      {
        id: 'chat-rooms',
        title: 'Chat Rooms',
        requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
        description: 'Join community chat rooms'
      }
    ];
    
    const hasAppPermission = (appId, userAccessLevel) => {
      if (!userAccessLevel) return false;
      
      const appPermission = APP_PERMISSIONS.find(app => app.id === appId);
      if (!appPermission) return true;
      
      return appPermission.requiredLevel.includes(userAccessLevel);
    };
    
    return hasAppPermission('chat-rooms', userAccessLevel);
  };
  
  const hasPermission = testAppPermission();
  
  console.log('\nPermission Check:');
  console.log('  Has chat-rooms permission:', hasPermission);
  
  // Overall status
  const isWorking = !!(isDynamicConnected && accessLevel && hasPermission && chatIcons.length > 0);
  
  console.log('\n🎯 Overall Status:', isWorking ? '✅ WORKING' : '❌ NEEDS FIX');
  
  return {
    walletConnected: !!isDynamicConnected,
    accessLevel: accessLevel,
    hasPermission: hasPermission,
    iconVisible: chatIcons.length > 0,
    isWorking: isWorking
  };
};

// Test clicking the chat icon
const testChatIconClick = () => {
  const chatIcons = document.querySelectorAll('[title="Chat Rooms"]');
  
  if (chatIcons.length > 0) {
    console.log('🖱️ Simulating double-click on Chat Rooms icon...');
    
    // Simulate double-click
    const event = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    chatIcons[0].dispatchEvent(event);
    
    // Check if messenger window opened
    setTimeout(() => {
      const messengerWindow = document.querySelector('[data-window-id*="messenger"]') || 
                             document.querySelector('.messenger') ||
                             document.querySelector('[class*="messenger"]');
      
      console.log('💬 Messenger window opened:', !!messengerWindow);
      
      if (messengerWindow) {
        console.log('✅ Chat room access test PASSED');
      } else {
        console.log('❌ Chat room window did not open');
      }
    }, 1000);
    
  } else {
    console.log('❌ No Chat Rooms icon found to click');
  }
};

// Manual trigger for AutoWalletAccessGrant (if it didn't work automatically)
const manualAccessGrant = () => {
  console.log('🔧 Manually triggering access grant...');
  
  const isDynamicConnected = window.dynamic?.primaryWallet?.address;
  
  if (isDynamicConnected) {
    sessionStorage.setItem('flunks-access-granted', 'true');
    sessionStorage.setItem('flunks-access-level', 'COMMUNITY');
    sessionStorage.setItem('flunks-access-code', 'MANUAL_TEST_GRANT');
    
    // Trigger the access update event
    window.dispatchEvent(new Event('flunks-access-updated'));
    
    console.log('✅ Manual access granted - refresh page or wait for re-render');
    
    return true;
  } else {
    console.log('❌ No wallet connected - connect wallet first');
    return false;
  }
};

// Wait for page to load
const runTest = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testChatRoomAccess);
  } else {
    testChatRoomAccess();
  }
};

// Export test functions to window
window.testChatRoomAccess = testChatRoomAccess;
window.testChatIconClick = testChatIconClick;
window.manualAccessGrant = manualAccessGrant;

// Auto-run test
runTest();

console.log('\n🎯 Available Test Functions:');
console.log('  testChatRoomAccess() - Check current system status');
console.log('  testChatIconClick() - Test clicking the chat icon');
console.log('  manualAccessGrant() - Manually grant access if auto-grant failed');

console.log('\n💡 Test Instructions:');
console.log('1. Connect your wallet using Dynamic Labs');
console.log('2. Run testChatRoomAccess() to check if fix is working');
console.log('3. If Chat Rooms icon is visible, run testChatIconClick()');
console.log('4. If icon is not visible, try manualAccessGrant() then refresh');

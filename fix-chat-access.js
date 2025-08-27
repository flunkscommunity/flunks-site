/**
 * Chat Room Access Fix
 * 
 * Problem: Users with connected wallets can't see the "Chat Rooms" icon on desktop
 * because the ConditionalAppIcon component requires an access level to be set in
 * sessionStorage, but wallet connection doesn't automatically set access level.
 * 
 * Root Cause:
 * 1. ConditionalAppIcon checks hasAppPermission() 
 * 2. hasAppPermission() calls getUserAccessLevel()
 * 3. getUserAccessLevel() reads from sessionStorage['flunks-access-level']
 * 4. This is only set when users enter an access code via AccessGate
 * 5. Direct wallet connection bypasses AccessGate, leaving no access level
 * 
 * Solution: Add automatic access level assignment for wallet-connected users
 */

console.log('🔍 Diagnosing Chat Room Access Issue...');

// Check current session storage
const accessGranted = sessionStorage.getItem('flunks-access-granted');
const accessLevel = sessionStorage.getItem('flunks-access-level');

console.log('Current Session Storage:');
console.log('  flunks-access-granted:', accessGranted);
console.log('  flunks-access-level:', accessLevel);

// Check if Dynamic wallet is connected
const isDynamicConnected = () => {
  return window.dynamic?.primaryWallet?.address ? true : false;
};

console.log('Dynamic Wallet Status:');
console.log('  Connected:', isDynamicConnected());
console.log('  Address:', window.dynamic?.primaryWallet?.address);

// Check what app permissions would show
const checkAppPermissions = () => {
  // Simulate the permission check
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
  
  console.log('App Permission Check:');
  console.log('  User Access Level:', userAccessLevel);
  console.log('  Chat Rooms Permission:', hasAppPermission('chat-rooms', userAccessLevel));
  
  return hasAppPermission('chat-rooms', userAccessLevel);
};

const hasPermission = checkAppPermissions();

// Apply the fix
const fixChatAccess = () => {
  console.log('\n🛠️ Applying Chat Room Access Fix...');
  
  if (isDynamicConnected() && !accessLevel) {
    console.log('  ✅ Wallet connected but no access level - setting COMMUNITY level');
    
    // Set session storage for access
    sessionStorage.setItem('flunks-access-granted', 'true');
    sessionStorage.setItem('flunks-access-level', 'COMMUNITY');
    sessionStorage.setItem('flunks-access-code', 'AUTO_WALLET_GRANT');
    
    console.log('  ✅ Access level set to COMMUNITY');
    console.log('  🔄 Refresh the page to see Chat Rooms icon');
    
    return true;
  } else if (accessLevel) {
    console.log('  ℹ️ Access level already set:', accessLevel);
    return false;
  } else {
    console.log('  ⚠️ No wallet connected - connect wallet first');
    return false;
  }
};

// Check if chat rooms icon should be visible now
const checkChatRoomsVisibility = () => {
  const icons = document.querySelectorAll('[title="Chat Rooms"]');
  console.log('\nChat Rooms Icon Visibility:');
  console.log('  Icons found:', icons.length);
  
  if (icons.length > 0) {
    console.log('  ✅ Chat Rooms icon is visible');
    console.log('  💡 Double-click the icon to open chat');
  } else {
    console.log('  ❌ Chat Rooms icon not visible');
    console.log('  💡 Try running fixChatAccess() then refresh');
  }
};

// Run diagnostics
console.log('\n📊 Current Status:');
console.log('  Wallet Connected:', isDynamicConnected());
console.log('  Has Access Level:', !!accessLevel);
console.log('  Has Chat Permission:', hasPermission);

checkChatRoomsVisibility();

// Export fix function
window.fixChatAccess = fixChatAccess;
window.checkChatRoomsVisibility = checkChatRoomsVisibility;

console.log('\n🎯 Available Functions:');
console.log('  fixChatAccess() - Apply the fix');
console.log('  checkChatRoomsVisibility() - Check if icon appears');

console.log('\n💡 Next Steps:');
console.log('1. If wallet is connected: Run fixChatAccess()');
console.log('2. Refresh the page');  
console.log('3. Chat Rooms icon should now appear on desktop');
console.log('4. Double-click Chat Rooms icon to open chat');

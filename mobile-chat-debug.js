// Mobile Chat Debug Script
// Run this in the browser console to test mobile chat improvements

console.log('📱 Mobile Chat Debug Script');

function debugMobileChat() {
  console.log('🔍 Checking mobile chat status...');
  
  // Check if FlunksMessenger is open
  const messengerWindow = document.querySelector('[id="flunks_messenger"]');
  if (!messengerWindow) {
    console.log('❌ FlunksMessenger window not found. Please open Chat Rooms first.');
    return;
  }
  
  console.log('✅ FlunksMessenger window found');
  
  // Check mobile styles
  const messengerContainer = messengerWindow.querySelector('.flunks-messenger-container');
  if (messengerContainer) {
    console.log('✅ Mobile CSS classes applied');
    
    const contactList = messengerContainer.querySelector('.contact-list');
    const chatArea = messengerContainer.querySelector('.chat-area');
    
    if (window.innerWidth <= 768) {
      console.log('📱 Mobile viewport detected');
      
      if (contactList) {
        const contactListHeight = contactList.offsetHeight;
        console.log(`📏 Contact list height: ${contactListHeight}px`);
        
        if (contactListHeight <= 120) {
          console.log('✅ Mobile contact list height optimization working');
        } else {
          console.log('⚠️ Contact list may be too tall for mobile');
        }
      }
      
      if (chatArea) {
        const chatAreaHeight = chatArea.offsetHeight;
        console.log(`📏 Chat area height: ${chatAreaHeight}px`);
      }
      
      // Check if online users are hidden on mobile
      const onlineUsers = messengerContainer.querySelector('.online-users-section');
      if (onlineUsers) {
        const isHidden = window.getComputedStyle(onlineUsers).display === 'none';
        if (isHidden) {
          console.log('✅ Online users section hidden on mobile to save space');
        } else {
          console.log('⚠️ Online users section should be hidden on mobile');
        }
      }
    } else {
      console.log('🖥️ Desktop viewport detected');
    }
  } else {
    console.log('❌ Mobile CSS classes not found');
  }
  
  // Check for profile icons in messages
  const messages = messengerWindow.querySelectorAll('.flunks-messenger-message');
  console.log(`💬 Found ${messages.length} messages`);
  
  let messagesWithIcons = 0;
  messages.forEach((message, index) => {
    const userDisplay = message.querySelector('.flunks-messenger-user-display');
    if (userDisplay) {
      const profileIcon = userDisplay.querySelector('.profile-icon');
      if (profileIcon && profileIcon.textContent.trim()) {
        messagesWithIcons++;
        console.log(`📨 Message ${index + 1}: Has profile icon "${profileIcon.textContent}"`);
      } else {
        console.log(`📨 Message ${index + 1}: No profile icon`);
      }
    }
  });
  
  console.log(`✅ ${messagesWithIcons} out of ${messages.length} messages have profile icons`);
  
  // Check viewport info
  console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`📱 Device pixel ratio: ${window.devicePixelRatio}`);
  console.log(`📱 Touch support: ${'ontouchstart' in window ? 'Yes' : 'No'}`);
}

// Run the debug function
debugMobileChat();

// Add a function to the global scope for easy re-running
window.debugMobileChat = debugMobileChat;

console.log('💡 You can run debugMobileChat() again anytime to check the chat status');

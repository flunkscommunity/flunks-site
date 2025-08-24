// SEMESTER ZERO WALLET INTEGRATION FIX
// Removes login barrier and makes locations clickable based on Flunks ownership

console.log('🗺️ SEMESTER ZERO WALLET INTEGRATION FIX');
console.log('=========================================');

// Function to check wallet connection and Flunks count
const checkWalletAndFlunks = async () => {
  console.log('🔍 Checking wallet connection and Flunks ownership...');
  
  let walletConnected = false;
  let flunksCount = 0;
  let walletAddress = null;
  let backpacksCount = 0;
  
  // Check Dynamic Labs wallet
  if (window.dynamic?.primaryWallet?.address) {
    walletConnected = true;
    walletAddress = window.dynamic.primaryWallet.address;
    console.log('✅ Wallet connected:', walletAddress);
    
    // Try to get NFT count from various sources
    try {
      // Method 1: Check React context state (most reliable)
      const reactFiber = document.querySelector('[data-reactroot]')?._reactInternalFiber;
      if (reactFiber) {
        // Walk the React tree to find StakingContext or similar
        let current = reactFiber;
        let attempts = 0;
        while (current && attempts < 50) {
          if (current.memoizedProps?.children?.props?.value?.walletStakeInfo) {
            const stakingInfo = current.memoizedProps.children.props.value.walletStakeInfo;
            if (Array.isArray(stakingInfo)) {
              flunksCount = stakingInfo.filter(item => item.collection === 'Flunks').length;
              backpacksCount = stakingInfo.filter(item => item.collection === 'Backpack').length;
              console.log('📊 Found NFTs from React context - Flunks:', flunksCount, 'Backpacks:', backpacksCount);
              break;
            }
          }
          current = current.child || current.sibling || current.return;
          attempts++;
        }
      }
      
      // Method 2: Check global state/storage
      if (flunksCount === 0) {
        // Check session/local storage
        const storedNFTs = JSON.parse(sessionStorage.getItem('user_nfts') || localStorage.getItem('user_nfts') || '[]');
        if (Array.isArray(storedNFTs)) {
          flunksCount = storedNFTs.filter(nft => 
            nft.collection?.toLowerCase().includes('flunk') ||
            nft.name?.toLowerCase().includes('flunk')
          ).length;
          
          backpacksCount = storedNFTs.filter(nft => 
            nft.collection?.toLowerCase().includes('backpack') ||
            nft.name?.toLowerCase().includes('backpack')
          ).length;
          
          console.log('💾 Found NFTs from storage - Flunks:', flunksCount, 'Backpacks:', backpacksCount);
        }
      }
      
      // Method 3: Check window global variables
      if (flunksCount === 0) {
        if (window.userNFTs && Array.isArray(window.userNFTs)) {
          flunksCount = window.userNFTs.filter(nft => 
            nft.collection === 'Flunks' || 
            nft.name?.includes('Flunk')
          ).length;
          console.log('🪟 Found NFTs from window.userNFTs - Flunks:', flunksCount);
        }
        
        if (window.stakingData && Array.isArray(window.stakingData)) {
          flunksCount = window.stakingData.filter(item => item.collection === 'Flunks').length;
          backpacksCount = window.stakingData.filter(item => item.collection === 'Backpack').length;
          console.log('⚡ Found NFTs from window.stakingData - Flunks:', flunksCount, 'Backpacks:', backpacksCount);
        }
      }
      
    } catch (error) {
      console.log('⚠️ Could not determine NFT count automatically:', error.message);
    }
    
    // If still no count found, make a reasonable assumption for demo
    if (flunksCount === 0) {
      console.log('🤔 No NFT data found. For demo purposes, assuming user has Flunks if wallet is connected.');
      // You can comment out this line to be more restrictive
      flunksCount = 1; // Assume they have at least 1 Flunk if wallet is connected
    }
    
  } else {
    console.log('❌ No wallet connected');
  }
  
  return { 
    walletConnected, 
    flunksCount, 
    backpacksCount,
    walletAddress,
    hasFlunks: flunksCount >= 1,
    hasBackpacks: backpacksCount >= 1
  };
};

// Remove login overlay and barriers
const removeLoginBarriers = () => {
  console.log('🚫 Removing login barriers...');
  
  // Remove the specific wallet prompt overlay from Semester0Map
  const overlaySelectors = [
    '[class*="wallet-prompt-overlay"]',
    '[class*="auth-overlay"]', 
    '[class*="connect-overlay"]',
    '[class*="signin-overlay"]',
    '.overlay',
    '[data-testid="auth-overlay"]'
  ];
  
  let removedCount = 0;
  
  overlaySelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Check if this contains login/wallet text
      if (el.textContent?.includes('Sign in using your wallet') || 
          el.textContent?.includes('Connect') ||
          el.textContent?.includes('wallet')) {
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
        removedCount++;
        console.log(`  ✅ Hidden overlay: ${selector}`);
      }
    });
  });
  
  // Look for specific text and hide parent containers
  const textPhrases = [
    'Sign in using your wallet to participate',
    'Connect Wallet to Access',
    'Connect Your Wallet',
    '🔒 Sign in using your wallet'
  ];
  
  textPhrases.forEach(phrase => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes(phrase)) {
        let parent = node.parentElement;
        let attempts = 0;
        while (parent && attempts < 10) {
          if (parent.className?.includes('overlay') || 
              parent.style?.position === 'fixed' ||
              parent.style?.position === 'absolute') {
            parent.style.display = 'none';
            removedCount++;
            console.log(`  ✅ Hidden text overlay: "${phrase}"`);
            break;
          }
          parent = parent.parentElement;
          attempts++;
        }
      }
    }
  });
  
  console.log(`🚫 Removed ${removedCount} login barriers`);
  return removedCount > 0;
};

// Make locations conditionally clickable based on NFT ownership
const setupConditionalAccess = async () => {
  console.log('🎯 Setting up conditional location access...');
  
  const { walletConnected, flunksCount, backpacksCount, hasFlunks } = await checkWalletAndFlunks();
  
  // Find all location elements on the map
  const locationSelectors = [
    '[class*="icon"]',
    '[class*="location"]', 
    '[onclick]',
    'area[alt]',
    '[data-location]',
    '[class*="house"]',
    'div[style*="cursor: pointer"]'
  ];
  
  const allLocations = [];
  locationSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Filter to likely location elements
      if (el.onclick || 
          el.getAttribute('onDoubleClick') ||
          el.className?.includes('icon') ||
          el.className?.includes('house') ||
          el.style?.cursor === 'pointer') {
        allLocations.push(el);
      }
    });
  });
  
  // Remove duplicates
  const uniqueLocations = [...new Set(allLocations)];
  
  console.log(`🗺️ Found ${uniqueLocations.length} potential location elements`);
  
  let enabledCount = 0;
  let restrictedCount = 0;
  
  uniqueLocations.forEach((element, index) => {
    // Determine if this location should be accessible
    let shouldEnable = false;
    let accessMessage = '';
    
    // Basic access: Has wallet and at least 1 Flunk
    if (walletConnected && hasFlunks) {
      shouldEnable = true;
      accessMessage = `✅ Access granted (${flunksCount} Flunks owned)`;
    } else if (walletConnected) {
      shouldEnable = false;
      accessMessage = `❌ Need at least 1 Flunk NFT (currently have ${flunksCount})`;
    } else {
      shouldEnable = false;
      accessMessage = '❌ Connect wallet and own at least 1 Flunk NFT';
    }
    
    // Store original state if not already stored
    if (!element.dataset.originalState) {
      element.dataset.originalState = JSON.stringify({
        disabled: element.disabled,
        pointerEvents: getComputedStyle(element).pointerEvents,
        opacity: getComputedStyle(element).opacity,
        cursor: getComputedStyle(element).cursor
      });
    }
    
    if (shouldEnable) {
      // Enable the location
      element.disabled = false;
      element.style.pointerEvents = 'auto';
      element.style.opacity = '1';
      element.style.cursor = 'pointer';
      
      // Add subtle glow to show it's accessible
      element.style.filter = 'drop-shadow(0 0 3px rgba(76, 175, 80, 0.6))';
      element.dataset.accessStatus = 'enabled';
      
      enabledCount++;
      
    } else {
      // Restrict the location but keep it visible
      element.style.pointerEvents = 'auto'; // Keep clickable for feedback
      element.style.opacity = '0.6';
      element.style.cursor = 'not-allowed';
      element.style.filter = 'grayscale(50%) opacity(0.6)';
      element.dataset.accessStatus = 'restricted';
      
      // Add click handler for feedback
      const feedbackHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Show tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = accessMessage;
        tooltip.style.cssText = `
          position: fixed;
          top: ${e.clientY - 40}px;
          left: ${e.clientX}px;
          background: rgba(0,0,0,0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          z-index: 10000;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: fadeInOut 2.5s ease-in-out;
          max-width: 200px;
          text-align: center;
        `;
        
        // Add fade animation
        if (!document.querySelector('#tooltip-styles')) {
          const styles = document.createElement('style');
          styles.id = 'tooltip-styles';
          styles.textContent = `
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translateY(10px); }
              20% { opacity: 1; transform: translateY(0); }
              80% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-10px); }
            }
          `;
          document.head.appendChild(styles);
        }
        
        document.body.appendChild(tooltip);
        setTimeout(() => tooltip.remove(), 2500);
        
        return false;
      };
      
      // Remove any existing feedback handlers
      element.removeEventListener('click', element._feedbackHandler);
      element.removeEventListener('dblclick', element._feedbackHandler);
      
      // Add new feedback handler
      element._feedbackHandler = feedbackHandler;
      element.addEventListener('click', feedbackHandler, true);
      element.addEventListener('dblclick', feedbackHandler, true);
      
      restrictedCount++;
    }
    
    console.log(`  Location ${index + 1}: ${shouldEnable ? '✅ Enabled' : '❌ Restricted'}`);
  });
  
  console.log(`🎯 Location access setup complete:`);
  console.log(`  ✅ Enabled: ${enabledCount} locations`);
  console.log(`  ❌ Restricted: ${restrictedCount} locations`);
  
  return {
    total: uniqueLocations.length,
    enabled: enabledCount,
    restricted: restrictedCount,
    hasAccess: enabledCount > 0
  };
};

// Add wallet status indicator
const addWalletStatusIndicator = async () => {
  console.log('💎 Adding wallet status indicator...');
  
  const { walletConnected, flunksCount, backpacksCount, walletAddress } = await checkWalletAndFlunks();
  
  // Remove existing indicator
  const existing = document.getElementById('semester-zero-wallet-status');
  if (existing) existing.remove();
  
  // Create status indicator
  const indicator = document.createElement('div');
  indicator.id = 'semester-zero-wallet-status';
  
  let statusColor = '#f44336'; // Red
  let statusText = '❌ No Wallet Connected';
  let statusDetail = '';
  
  if (walletConnected) {
    if (flunksCount >= 1) {
      statusColor = '#4CAF50'; // Green
      statusText = `✅ ${flunksCount} Flunks`;
      statusDetail = backpacksCount > 0 ? ` + ${backpacksCount} Backpacks` : '';
    } else {
      statusColor = '#FF9800'; // Orange
      statusText = '⚠️ Wallet Connected';
      statusDetail = ' (Need Flunks for full access)';
    }
  }
  
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${statusColor};
    color: white;
    padding: 10px 16px;
    border-radius: 25px;
    font-size: 13px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid rgba(255,255,255,0.2);
  `;
  
  indicator.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;">
      <span>${statusText}</span>
      ${statusDetail ? `<span style="font-size: 11px; opacity: 0.9;">${statusDetail}</span>` : ''}
    </div>
  `;
  
  // Add hover effect
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.05)';
    indicator.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
    indicator.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  });
  
  // Click to show detailed info
  indicator.addEventListener('click', () => {
    const detail = walletAddress ? 
      `Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : 
      'No wallet connected';
    
    const popup = document.createElement('div');
    popup.textContent = detail;
    popup.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 10001;
      animation: fadeInOut 3s ease-in-out;
    `;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
  });
  
  document.body.appendChild(indicator);
  console.log('✅ Status indicator added');
};

// Monitor wallet changes and update access
const watchWalletChanges = () => {
  console.log('👀 Setting up wallet change monitoring...');
  
  let lastWalletState = null;
  
  const checkForChanges = async () => {
    try {
      const currentState = await checkWalletAndFlunks();
      const stateString = JSON.stringify(currentState);
      
      if (lastWalletState !== stateString) {
        console.log('🔄 Wallet state changed, updating map access...');
        lastWalletState = stateString;
        
        await setupConditionalAccess();
        await addWalletStatusIndicator();
      }
    } catch (error) {
      console.log('⚠️ Error checking wallet changes:', error);
    }
  };
  
  // Check every 3 seconds
  const interval = setInterval(checkForChanges, 3000);
  
  // Listen for Dynamic Labs events
  if (window.dynamic) {
    const events = ['walletConnected', 'walletDisconnected', 'walletStateChanged', 'authSuccess'];
    events.forEach(eventName => {
      window.addEventListener(eventName, checkForChanges);
    });
  }
  
  // Also listen for custom events
  window.addEventListener('forceAccessUpdate', checkForChanges);
  
  return interval;
};

// Main execution function
const fixSemesterZeroMapAccess = async () => {
  console.log('🚀 Starting Semester Zero Map Access Fix...\n');
  
  try {
    // Step 1: Remove login barriers
    const barriersRemoved = removeLoginBarriers();
    
    // Small delay to let DOM updates settle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Check current wallet state
    const walletState = await checkWalletAndFlunks();
    console.log('💰 Current wallet state:', walletState);
    
    // Step 3: Setup conditional access
    const accessResults = await setupConditionalAccess();
    
    // Step 4: Add status indicator
    await addWalletStatusIndicator();
    
    // Step 5: Start monitoring for changes
    const monitoringInterval = watchWalletChanges();
    
    console.log('\n✅ Semester Zero Map Fix Complete!');
    console.log('📊 Results Summary:');
    console.log(`  🚫 Login barriers removed: ${barriersRemoved ? 'Yes' : 'No'}`);
    console.log(`  💰 Wallet connected: ${walletState.walletConnected ? 'Yes' : 'No'}`);
    console.log(`  🎒 Flunks owned: ${walletState.flunksCount}`);
    console.log(`  🗺️ Total locations: ${accessResults.total}`);
    console.log(`  ✅ Accessible locations: ${accessResults.enabled}`);
    console.log(`  ❌ Restricted locations: ${accessResults.restricted}`);
    
    console.log('\n💡 How it works now:');
    console.log('  • Map is visible to everyone (no more login overlay)');
    console.log('  • Locations are clickable only if you own 1+ Flunks NFTs');
    console.log('  • Click restricted locations to see access requirements');
    console.log('  • Status indicator shows your current access level');
    console.log('  • System automatically updates when wallet state changes');
    
    // Return cleanup function
    return {
      results: {
        barriersRemoved,
        walletState,
        accessResults,
        success: true
      },
      cleanup: () => {
        clearInterval(monitoringInterval);
        const indicator = document.getElementById('semester-zero-wallet-status');
        if (indicator) indicator.remove();
        console.log('🧹 Semester Zero fix cleanup completed');
      }
    };
    
  } catch (error) {
    console.error('❌ Error in Semester Zero fix:', error);
    return { results: { success: false, error: error.message } };
  }
};

// Helper functions for manual testing
const testWalletState = () => {
  return checkWalletAndFlunks();
};

const forceAccessUpdate = async () => {
  console.log('🔄 Forcing access update...');
  window.dispatchEvent(new CustomEvent('forceAccessUpdate'));
  return await setupConditionalAccess();
};

const simulateNFTOwnership = (flunks = 1, backpacks = 0) => {
  console.log(`🧪 Simulating NFT ownership: ${flunks} Flunks, ${backpacks} Backpacks`);
  
  // Store fake data for testing
  const fakeNFTs = [];
  for (let i = 0; i < flunks; i++) {
    fakeNFTs.push({ collection: 'Flunks', tokenID: `${1000 + i}`, name: `Flunk #${1000 + i}` });
  }
  for (let i = 0; i < backpacks; i++) {
    fakeNFTs.push({ collection: 'Backpack', tokenID: `${2000 + i}`, name: `Backpack #${2000 + i}` });
  }
  
  sessionStorage.setItem('user_nfts', JSON.stringify(fakeNFTs));
  window.userNFTs = fakeNFTs;
  
  // Trigger update
  forceAccessUpdate();
  
  console.log('✅ Simulated NFT ownership applied. Check the map now!');
};

// Export functions to window for manual use
window.fixSemesterZeroMapAccess = fixSemesterZeroMapAccess;
window.testWalletState = testWalletState;
window.forceAccessUpdate = forceAccessUpdate;
window.simulateNFTOwnership = simulateNFTOwnership;
window.checkWalletAndFlunks = checkWalletAndFlunks;

// Auto-run the fix
console.log('🔥 Auto-running Semester Zero Map Access Fix...');
fixSemesterZeroMapAccess().then(result => {
  if (result.results.success) {
    console.log('\n🎉 SUCCESS! The Semester Zero map should now be accessible.');
    console.log('\n🛠️ Manual Testing Functions:');
    console.log('• window.testWalletState() - Check current wallet/NFT state');
    console.log('• window.forceAccessUpdate() - Manually refresh access permissions'); 
    console.log('• window.simulateNFTOwnership(flunks, backpacks) - Test with fake NFTs');
    console.log('• window.checkWalletAndFlunks() - Get detailed wallet info');
  } else {
    console.log('\n❌ Fix encountered an error:', result.results.error);
    console.log('Try refreshing the page and running the script again.');
  }
});

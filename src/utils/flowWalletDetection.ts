// Flow Wallet Extension Detection Utility
// This helps Dynamic Labs properly detect installed Flow Wallet/Lilico extensions

export const isFlowWalletInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    // Check for extension installation markers
    const extensionMarkers = [
      // Direct wallet objects
      (window as any).lilico,
      (window as any).flowWallet,
      (window as any).FlowWallet,
      
      // FCL wallet providers
      (window as any).fcl_wallet?.lilico,
      (window as any).fcl_wallet?.flowWallet,
      
      // Flow ecosystem providers
      (window as any).flow?.wallet,
      (window as any).flow?.lilico,
      
      // Check for DOM markers that extensions might inject
      document.querySelector('meta[name="flow-wallet-installed"]'),
      document.querySelector('meta[name="lilico-installed"]'),
      document.querySelector('[data-flow-wallet]'),
      
      // Check for extension-specific global flags
      (window as any).isFlowWalletInstalled,
      (window as any).isLilicoInstalled,
    ];

    const isInstalled = extensionMarkers.some(marker => !!marker);
    
    if (isInstalled) {
      console.log('✅ Flow Wallet extension detected');
      
      // Try to get more details about the wallet
      const walletDetails = {
        lilico: !!(window as any).lilico,
        flowWallet: !!(window as any).flowWallet,
        FlowWallet: !!(window as any).FlowWallet,
        fclWallet: !!(window as any).fcl_wallet,
        hasAuthMethod: !!(
          (window as any).lilico?.authenticate ||
          (window as any).flowWallet?.authenticate ||
          (window as any).FlowWallet?.authenticate
        )
      };
      
      console.log('🔍 Flow Wallet details:', walletDetails);
    } else {
      console.log('❌ No Flow Wallet extension detected');
    }
    
    return isInstalled;
  } catch (error) {
    console.warn('Error detecting Flow Wallet:', error);
    return false;
  }
};

export const waitForFlowWalletExtension = (timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (isFlowWalletInstalled()) {
        resolve(true);
        return;
      }

      let attempts = 0;
      const maxAttempts = timeout / 100;
      
      const checkInterval = setInterval(() => {
        try {
          attempts++;
          
          if (isFlowWalletInstalled()) {
            clearInterval(checkInterval);
            resolve(true);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            resolve(false);
          }
        } catch (error) {
          console.error('Error in wallet detection interval:', error);
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error in waitForFlowWalletExtension:', error);
      resolve(false);
    }
  });
};

export const getFlowWalletInstance = () => {
  if (typeof window === 'undefined') return null;

  try {
    // Return the first available wallet instance
    return (
      (window as any).lilico ||
      (window as any).flowWallet ||
      (window as any).FlowWallet ||
      (window as any).fcl_wallet?.lilico ||
      (window as any).fcl_wallet?.flowWallet ||
      (window as any).flow?.wallet
    );
  } catch (error) {
    console.warn('Error getting Flow Wallet instance:', error);
    return null;
  }
};

// Helper to inform Dynamic Labs about wallet availability
export const enhanceFlowWalletDetection = () => {
  if (typeof window === 'undefined') return;

  try {
    // Add detection flags that Dynamic Labs might look for
    if (isFlowWalletInstalled()) {
      // Add global flags
      (window as any).isFlowWalletAvailable = true;
      (window as any).isLilicoAvailable = true;
      
      // Add meta tags
      const addMetaTag = (name: string) => {
        try {
          if (!document.querySelector(`meta[name="${name}"]`)) {
            const meta = document.createElement('meta');
            meta.name = name;
            meta.content = 'true';
            document.head.appendChild(meta);
          }
        } catch (error) {
          console.warn(`Error adding meta tag ${name}:`, error);
        }
      };
    
      addMetaTag('flow-wallet-installed');
      addMetaTag('lilico-installed');
      
      console.log('🔧 Enhanced Flow Wallet detection flags added');
    }
  } catch (error) {
    console.error('Error enhancing Flow Wallet detection:', error);
  }
};

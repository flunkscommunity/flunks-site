// Flow wallet detection utilities with enhanced error handling
declare global {
  interface Window {
    fcl_extensions?: any;
    fcl?: any;
    lilico?: any;
    blocto?: any;
    fcw?: any;
  }
}

export const isFlowWalletInstalled = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    console.log('🔍 Checking for Flow Wallet extensions...');
    
    // Check for various Flow wallet indicators
    const checks = {
      fcl_extensions: !!window.fcl_extensions,
      fcl: !!window.fcl,
      lilico: !!window.lilico,
      blocto: !!window.blocto,
      fcw: !!window.fcw,
    };
    
    console.log('🔍 Flow Wallet checks:', checks);
    
    const isInstalled = Object.values(checks).some(Boolean);
    
    if (isInstalled) {
      const walletDetails = {
        fcl_extensions: window.fcl_extensions,
        fcl: !!window.fcl,
        lilico: !!window.lilico,
        blocto: !!window.blocto,
        fcw: !!window.fcw,
      };
      
      console.log('✅ Flow Wallet extension detected!');
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
        attempts++;
        console.log(`🔍 Checking for Flow Wallet... attempt ${attempts}/${maxAttempts}`);
        
        if (isFlowWalletInstalled()) {
          console.log('✅ Flow Wallet detected after waiting!');
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          console.log('⏱️ Timeout waiting for Flow Wallet extension');
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error waiting for Flow Wallet:', error);
      resolve(false);
    }
  });
};

export const getFlowWalletInfo = () => {
  try {
    if (typeof window === 'undefined') return null;

    const walletInfo = {
      isInstalled: isFlowWalletInstalled(),
      extensions: {
        fcl_extensions: window.fcl_extensions,
        fcl: window.fcl,
        lilico: window.lilico,
        blocto: window.blocto,
        fcw: window.fcw,
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    console.log('🔍 Complete Flow Wallet info:', walletInfo);
    return walletInfo;
  } catch (error) {
    console.error('Error getting Flow Wallet info:', error);
    return null;
  }
};

export const enhanceFlowWalletDetection = () => {
  try {
    if (typeof window === 'undefined') return;
    
    console.log('🔧 Enhancing Flow Wallet detection for Dynamic Labs...');
    
    // Add meta tags that Dynamic Labs might look for
    const addMetaTag = (name: string) => {
      try {
        if (!document.querySelector(`meta[name="${name}"]`)) {
          const meta = document.createElement('meta');
          meta.name = name;
          meta.content = 'true';
          document.head.appendChild(meta);
          console.log(`✅ Added meta tag: ${name}`);
        }
      } catch (error) {
        console.warn(`Error adding meta tag ${name}:`, error);
      }
    };
    
    // Add detection flags to window object
    if (isFlowWalletInstalled()) {
      (window as any).flowWalletDetected = true;
      (window as any).lilicoDetected = true;
      
      // Dispatch custom events
      try {
        window.dispatchEvent(new CustomEvent('flowWalletReady'));
        window.dispatchEvent(new CustomEvent('lilicoReady'));
        console.log('✅ Flow Wallet ready events dispatched');
      } catch (error) {
        console.warn('Error dispatching wallet ready events:', error);
      }
      
      addMetaTag('flow-wallet-installed');
      addMetaTag('lilico-installed');
      
      console.log('🔧 Enhanced Flow Wallet detection flags added');
    }
  } catch (error) {
    console.error('Error enhancing Flow Wallet detection:', error);
  }
};

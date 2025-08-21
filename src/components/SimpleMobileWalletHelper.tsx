import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Simple mobile wallet helper - only shows on mobile, doesn't interfere with desktop
export const SimpleMobileWalletHelper: React.FC = () => {
  const { setShowAuthFlow, user } = useDynamicContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simple mobile detection - no overrides
    const checkMobile = () => {
      const mobile = typeof window !== 'undefined' && 
        window.innerWidth <= 768 &&
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on actual mobile devices
  if (!isMobile || user) return null;

  const handleMobileConnect = () => {
    // Enhanced debugging for mobile wallet issues
    console.log('📱 Mobile Connect Debug:', {
      forceShowAll: (window as any).FORCE_SHOW_ALL_WALLETS,
      lastWallets: (window as any).LAST_DYNAMIC_WALLETS,
      userAgent: navigator.userAgent,
      isMobile
    });
    
    // Set force show all wallets for debugging
    (window as any).FORCE_SHOW_ALL_WALLETS = true;
    console.log('📱 Force flags set - triggering auth flow...');
    
    // Simple trigger - no overrides, let Dynamic Labs handle it normally
    setShowAuthFlow(true);
  };

  const testWalletForce = () => {
    console.log('🧪 Testing wallet force injection...');
    (window as any).FORCE_SHOW_ALL_WALLETS = true;
    console.log('🧪 Available wallets:', (window as any).LAST_DYNAMIC_WALLETS || 'Not set yet');
    alert('Check console for wallet debug info');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      background: 'rgba(0, 123, 255, 0.9)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        📱 Mobile Wallet
      </div>
      <button
        onClick={handleMobileConnect}
        style={{
          background: 'white',
          color: '#007bff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Connect Flow/Dapper
      </button>
      <button
        onClick={testWalletForce}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          marginTop: '4px'
        }}
      >
        🧪 Debug Wallets
      </button>
    </div>
  );
};

export default SimpleMobileWalletHelper;

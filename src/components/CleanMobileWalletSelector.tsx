import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Clean mobile wallet selector without debug components
const CleanMobileWalletSelector: React.FC = () => {
  const { setShowAuthFlow, user, primaryWallet } = useDynamicContext();
  const [isMobile, setIsMobile] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
        navigator.userAgent
      ) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile && window.innerWidth < 768); // Only show on small mobile screens
    };

    checkMobile();
  }, []);

  const connectWallet = async () => {
    console.log('🚀 Mobile wallet connection');
    
    // Set Mobile Labs preferences for mobile
    if (typeof window !== 'undefined') {
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).MOBILE_WALLET_OVERRIDE = true;
    }

    setShowAuthFlow(true);
  };

  // Don't show if user is already connected or not on mobile
  if (!isMobile || user || primaryWallet) {
    return null;
  }

  return (
    <>
      {!showSelector && (
        <button
          onClick={() => setShowSelector(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #00EF8B, #5B2EFF)',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔗 Connect Wallet
        </button>
      )}

      {showSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Choose Your Wallet</h2>
            <p style={{ margin: '0 0 25px 0', color: '#666', fontSize: '14px' }}>
              Select your preferred Flow blockchain wallet
            </p>

            <button
              onClick={connectWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '20px',
                border: '2px solid #00EF8B',
                borderRadius: '12px',
                background: 'white',
                cursor: 'pointer',
                width: '100%',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                transition: 'all 0.2s',
                marginBottom: '15px'
              }}
            >
              <span style={{ fontSize: '24px' }}>🌊</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div>Flow Ecosystem</div>
                <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                  Flow Wallet, Lilico, Dapper, Blocto
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowSelector(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CleanMobileWalletSelector;

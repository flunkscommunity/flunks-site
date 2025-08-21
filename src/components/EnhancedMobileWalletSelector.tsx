import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Enhanced mobile wallet selector that bypasses Dynamic Labs limitations
const EnhancedMobileWalletSelector: React.FC = () => {
  const { setShowAuthFlow, user, primaryWallet } = useDynamicContext();
  const [isMobile, setIsMobile] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
        navigator.userAgent
      ) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };

    checkMobile();
  }, []);

  const wallets = [
    {
      key: 'flowwallet',
      name: 'Flow Wallet',
      icon: '🌊',
      description: 'Official Flow blockchain wallet',
      color: '#00EF8B',
      deepLink: 'flow-wallet://wallet-connect',
      webUrl: 'https://wallet.flow.com'
    },
    {
      key: 'lilico', 
      name: 'Lilico',
      icon: '💎',
      description: 'Rebranded to Flow Wallet',
      color: '#5B2EFF',
      deepLink: 'lilico://connect',
      webUrl: 'https://lilico.app'
    },
    {
      key: 'dapper',
      name: 'Dapper Wallet',
      icon: '💳',
      description: 'Gaming-focused Flow wallet',
      color: '#5932EA',
      deepLink: 'dapper://connect',
      webUrl: 'https://accounts.meetdapper.com'
    },
    {
      key: 'blocto',
      name: 'Blocto',
      icon: '🟦', 
      description: 'Multi-chain mobile wallet',
      color: '#3B82F6',
      deepLink: 'blocto://wallet-connect',
      webUrl: 'https://wallet.blocto.app'
    }
  ];

  const connectWallet = async (wallet: typeof wallets[0]) => {
    console.log(`🚀 Enhanced mobile wallet connection: ${wallet.name}`);
    
    // Strategy 1: Set Dynamic Labs preferences
    if (typeof window !== 'undefined') {
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).SELECTED_WALLET_TYPE = wallet.key;
      (window as any).SELECTED_WALLET_STRICT = true;
      (window as any).MOBILE_WALLET_OVERRIDE = true;
      
      console.log(`🔧 Set Dynamic preferences for ${wallet.name}`);
    }

    // Strategy 2: Try deep link first (if on mobile)
    if (isMobile) {
      try {
        console.log(`📱 Attempting deep link for ${wallet.name}: ${wallet.deepLink}`);
        window.location.href = wallet.deepLink;
        
        // Wait briefly for deep link, then fallback to Dynamic Labs
        setTimeout(() => {
          console.log(`🔄 Deep link timeout, falling back to Dynamic Labs`);
          setShowAuthFlow(true);
        }, 2000);
        
        return;
      } catch (e) {
        console.log(`❌ Deep link failed for ${wallet.name}:`, e);
      }
    }

    // Strategy 3: Fallback to Dynamic Labs with preferences set
    console.log(`🔄 Using Dynamic Labs for ${wallet.name}`);
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {wallets.map((wallet) => (
                <button
                  key={wallet.key}
                  onClick={() => connectWallet(wallet)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px 20px',
                    border: `2px solid ${wallet.color}`,
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '16px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = wallet.color;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {wallet.name}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {wallet.description}
                    </div>
                  </div>
                  <span style={{ fontSize: '18px' }}>→</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSelector(false)}
              style={{
                marginTop: '20px',
                background: 'transparent',
                border: '1px solid #ccc',
                color: '#666',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>

            <div style={{
              marginTop: '15px',
              fontSize: '11px',
              color: '#999',
              textAlign: 'center'
            }}>
              💡 Can't see your wallet? Try the web interface option
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedMobileWalletSelector;

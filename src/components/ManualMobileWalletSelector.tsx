import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Simple manual mobile wallet selector that bypasses Dynamic Labs filtering
export const ManualMobileWalletSelector = () => {
  const { setShowAuthFlow, user } = useDynamicContext();
  const [isMobile, setIsMobile] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const mobile = typeof window !== 'undefined' && 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  if (!isMobile || user) return null;

  const wallets = [
    { key: 'flowwallet', name: 'Flow Wallet', icon: '🌊', color: '#00D4AA' },
    { key: 'lilico', name: 'Lilico', icon: '🦄', color: '#4A90E2' },
    { key: 'dapper', name: 'Dapper', icon: '💎', color: '#5932EA' },
    { key: 'blocto', name: 'Blocto', icon: '🟦', color: '#3B82F6' }
  ];

  const connectWallet = (walletKey: string) => {
    console.log(`🚀 Manual mobile wallet selection: ${walletKey}`);
    
    // Set strong preferences for Dynamic Labs
    (window as any).SELECTED_WALLET_TYPE = walletKey;
    (window as any).SELECTED_WALLET_STRICT = true;
    (window as any).FORCE_SHOW_ALL_WALLETS = true;
    
    // Close our modal
    setShowSelector(false);
    
    // Trigger Dynamic Labs with a delay
    setTimeout(() => {
      setShowAuthFlow(true);
    }, 100);
  };

  if (showSelector) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '350px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Choose Wallet</h2>
            <button 
              onClick={() => setShowSelector(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {wallets.map(wallet => (
              <button
                key={wallet.key}
                onClick={() => connectWallet(wallet.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                  e.currentTarget.style.backgroundColor = wallet.color;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'black';
                }}
              >
                <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{wallet.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Tap to connect
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '12px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>Manual Wallet Selection</strong><br/>
            This bypasses Dynamic Labs filtering and forces all Flow ecosystem wallets to be available.
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowSelector(true)}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: '#FF6B35',
        color: 'white',
        border: 'none',
        padding: '12px 16px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
      }}
    >
      🚀 Manual Wallet Select
    </button>
  );
};

export default ManualMobileWalletSelector;

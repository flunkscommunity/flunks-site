import React, { useState } from 'react';

interface CustomMobileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: string) => void;
  availableWallets?: Array<{ key: string; name?: string }>;
}

const CustomMobileWalletModal: React.FC<CustomMobileWalletModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectWallet,
  availableWallets
}) => {
  if (!isOpen) return null;

  // If Dynamic provided available wallets, use them; otherwise fall back to curated list
  const wallets = availableWallets && availableWallets.length > 0
    ? availableWallets.map(w => ({
        key: w.key,
        name: w.name || w.key,
        description: 'Available via Dynamic',
        icon: '🪪'
      }))
    : [
    {
      key: 'blocto',
      name: 'Blocto',
      description: 'Mobile-friendly wallet',
      icon: '🌊'
    },
    {
      key: 'dapper',
      name: 'Dapper',
      description: 'Flow ecosystem wallet',
      icon: '💎'
    },
    {
      key: 'flowwallet',
      name: 'Flow Wallet',
      description: 'Official Flow wallet',
      icon: '🌊'
    },
    {
      key: 'lilico',
      name: 'Lilico',
      description: 'Legacy Flow wallet',
      icon: '🦄'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Connect Wallet</h2>
          <button 
            onClick={onClose}
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

        <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
          📱 Custom Mobile Wallet Selection (Bypassing Dynamic Labs filtering)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {wallets.map(wallet => (
            <button
              key={wallet.key}
              onClick={() => onSelectWallet(wallet.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>{wallet.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{wallet.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Debug Info:</strong><br/>
          • This modal bypasses Dynamic Labs mobile filtering<br/>
          • All Flow ecosystem wallets should be visible<br/>
          • Selecting a wallet will attempt to connect through Dynamic Labs
        </div>
      </div>
    </div>
  );
};

export default CustomMobileWalletModal;

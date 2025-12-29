/**
 * Mobile Wallet Selector Component
 * A custom wallet selection UI for mobile apps that bypasses FCL Discovery
 * 
 * Since FCL Discovery (discovery.onflow.org) doesn't work well in mobile WebViews,
 * we provide a native-feeling wallet selector that:
 * 1. Shows available wallet options
 * 2. Uses WalletConnect for the actual connection
 */

import React, { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

interface MobileWalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: (address: string) => void;
}

// Available wallets for Flow
const FLOW_WALLETS = [
  {
    id: 'flow-wallet',
    name: 'Flow Wallet',
    icon: '🌊',
    description: 'Official Flow Wallet',
    color: '#00EF8B',
    // WalletConnect supported
    supportsWalletConnect: true,
  },
  {
    id: 'blocto',
    name: 'Blocto',
    icon: '🔷',
    description: 'Easy-to-use Web3 Wallet',
    color: '#4A90E2',
    supportsWalletConnect: true,
  },
];

export const MobileWalletSelector: React.FC<MobileWalletSelectorProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Subscribe to FCL user changes
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      if (user?.loggedIn && user?.addr) {
        console.log('✅ Mobile wallet connected:', user.addr);
        setIsConnecting(false);
        onConnected?.(user.addr);
        onClose();
      }
    });
    return () => unsubscribe();
  }, [onClose, onConnected]);

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    setError(null);

    try {
      console.log(`📱 Connecting to ${walletId} via WalletConnect...`);
      
      // For mobile, we use WalletConnect which FCL-WC handles
      // The WalletConnect modal will appear allowing QR scan or deep link
      await fcl.authenticate();
      
    } catch (err: any) {
      console.error('❌ Wallet connection failed:', err);
      setError(err.message || 'Connection failed. Please try again.');
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      zIndex: 10000,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Backdrop tap to close */}
      <div 
        style={{ flex: 1 }} 
        onClick={onClose}
      />
      
      {/* Bottom sheet */}
      <div style={{
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px',
        paddingBottom: '40px',
        maxHeight: '70vh',
        overflow: 'auto',
      }}>
        {/* Handle bar */}
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: '#444',
          borderRadius: '2px',
          margin: '0 auto 20px',
        }} />
        
        {/* Title */}
        <h2 style={{
          color: '#fff',
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center',
          margin: '0 0 8px',
        }}>
          Connect Wallet
        </h2>
        
        <p style={{
          color: '#888',
          fontSize: '14px',
          textAlign: 'center',
          margin: '0 0 24px',
        }}>
          Select a wallet to connect to Flunks
        </p>

        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
          }}>
            <p style={{
              color: '#ff6b6b',
              fontSize: '14px',
              margin: 0,
              textAlign: 'center',
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Wallet options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {FLOW_WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletSelect(wallet.id)}
              disabled={isConnecting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                backgroundColor: selectedWallet === wallet.id ? 'rgba(0, 239, 139, 0.1)' : '#252540',
                border: selectedWallet === wallet.id ? '2px solid #00EF8B' : '2px solid transparent',
                borderRadius: '16px',
                cursor: isConnecting ? 'wait' : 'pointer',
                opacity: isConnecting && selectedWallet !== wallet.id ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Wallet icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: wallet.color + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                {wallet.icon}
              </div>
              
              {/* Wallet info */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  {wallet.name}
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '13px',
                }}>
                  {wallet.description}
                </div>
              </div>

              {/* Loading spinner or arrow */}
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isConnecting && selectedWallet === wallet.id ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #00EF8B',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                ) : (
                  <span style={{ color: '#666', fontSize: '20px' }}>›</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* WalletConnect info */}
        <p style={{
          color: '#666',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: '1.5',
        }}>
          🔗 Secured with WalletConnect
          <br />
          Scan QR code or use mobile deep link
        </p>

        {/* Cancel button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '16px',
            backgroundColor: 'transparent',
            border: '1px solid #444',
            borderRadius: '12px',
            color: '#888',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileWalletSelector;

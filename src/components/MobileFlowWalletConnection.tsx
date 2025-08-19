import React, { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isMobileDevice } from '../utils/mobileWalletDetection';

interface MobileFlowWalletConnectionProps {
  onWalletConnected?: (wallet: any) => void;
}

export const MobileFlowWalletConnection: React.FC<MobileFlowWalletConnectionProps> = ({
  onWalletConnected
}) => {
  const { setShowAuthFlow } = useDynamicContext();
  const [isClient, setIsClient] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (isMobileDevice()) {
      // Check for Flow wallet availability
      const checkWallets = () => {
        const hasFlowWallet = !!(
          (window as any).lilico ||
          (window as any).flowWallet ||
          (window as any).FlowWallet ||
          (window as any).flow?.wallet ||
          (window as any).fcl_wallet?.lilico
        );
        
        setWalletAvailable(hasFlowWallet);
        console.log('📱 Mobile Flow wallet check:', { hasFlowWallet });
      };

      checkWallets();
      
      // Recheck periodically as wallets may load asynchronously
      const interval = setInterval(checkWallets, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleConnectWallet = () => {
    console.log('🔄 Opening wallet connection flow for mobile...');
    setShowAuthFlow(true);
  };

  const openFlowWalletApp = () => {
    // Try to open Flow Wallet app directly
    const flowWalletUrl = `https://wallet.flow.com/open?callback=${encodeURIComponent(window.location.href)}`;
    window.location.href = flowWalletUrl;
  };

  const openLilicoApp = () => {
    // Try to open Lilico app directly
    const lilicoUrl = `lilico://connect?callback=${encodeURIComponent(window.location.href)}`;
    // Fallback to web version
    setTimeout(() => {
      window.open('https://wallet.flow.com/download', '_blank');
    }, 2000);
    
    window.location.href = lilicoUrl;
  };

  if (!isClient || !isMobileDevice()) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '16px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '12px'
    }}>
      {!walletAvailable && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.9)',
          color: '#000',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #ffc107',
          maxWidth: '250px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            📱 Mobile Flow Wallet
          </div>
          <div style={{ marginBottom: '8px', fontSize: '11px' }}>
            Install a Flow wallet to connect
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={openFlowWalletApp}
              style={{
                background: '#00D4AA',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🌊 Get Flow Wallet
            </button>
            <button
              onClick={openLilicoApp}
              style={{
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              💎 Get Lilico Wallet
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleConnectWallet}
        style={{
          background: walletAvailable ? '#28a745' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {walletAvailable ? '🌊 Connect Flow Wallet' : '📱 Connect Wallet'}
      </button>
    </div>
  );
};

export default MobileFlowWalletConnection;

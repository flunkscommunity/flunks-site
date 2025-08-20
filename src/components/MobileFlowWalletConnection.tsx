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
  const [copied, setCopied] = useState(false);

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
    
    // Enhanced mobile wallet connection with proper Dynamic Labs integration
    if (typeof window !== 'undefined') {
      // Force mobile-friendly wallet selection
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).SELECTED_WALLET_TYPE = 'flowwallet';
      (window as any).SELECTED_WALLET_STRICT = true;
      
      console.log('📱 Set mobile wallet preferences for Flow/Lilico');
    }
    
    setShowAuthFlow(true);
  };

  const openFlowWalletApp = () => {
    // Enhanced Flow Wallet app opening with better callback handling
    const currentUrl = window.location.href;
    const flowWalletUrl = `https://wallet.flow.com/connect?callback=${encodeURIComponent(currentUrl)}`;
    
    // Try app deep link first
    const appLink = document.createElement('a');
    appLink.href = `flow-wallet://connect?callback=${encodeURIComponent(currentUrl)}`;
    appLink.target = '_blank';
    document.body.appendChild(appLink);
    appLink.click();
    document.body.removeChild(appLink);
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      window.open(flowWalletUrl, '_blank');
    }, 1000);
  };

  const copyCurrentLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.log('Clipboard write failed:', e);
    }
  };

  const openDapperInfo = () => {
    // We cannot deep-link Dapper reliably from web; instruct user to open this page in Dapper's in-app browser.
    alert('To use Dapper on mobile:\n\n1) Open the Dapper app\n2) Use the in-app browser\n3) Paste the copied link to this page\n\nThen tap Connect Wallet.');
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
              onClick={openDapperInfo}
              style={{
                background: '#5932EA',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              💎 Use Dapper (Open in App)
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
            <button
              onClick={copyCurrentLink}
              style={{
                background: '#343a40',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              📋 {copied ? 'Link Copied!' : 'Copy Link for Wallet App'}
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

import React, { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { detectMobileWallets, isMobileDevice } from '../utils/mobileWalletDetection';

const WalletTester = () => {
  const { 
    setShowAuthFlow, 
    user, 
    primaryWallet
  } = useDynamicContext();
  
  const [walletInfo, setWalletInfo] = useState<any>({});

  useEffect(() => {
    // Check wallet availability
    const mobileWallets = detectMobileWallets();
    setWalletInfo({
      isMobile: isMobileDevice(),
      detectedWallets: mobileWallets,
      hasLilico: !!(window as any).lilico,
      hasFlowWallet: !!(window as any).flowWallet,
      hasFlow: !!(window as any).flow
    });
  }, []);

  const handleConnect = () => {
    setShowAuthFlow(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 10000
    }}>
      <h3>🔗 Wallet Connection Tester</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>User Status:</strong>
        <div>Authenticated: {user ? '✅' : '❌'}</div>
        <div>Primary Wallet: {primaryWallet?.address || 'None'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Environment:</strong>
        <div>Is Mobile: {walletInfo.isMobile ? '✅' : '❌'}</div>
        <div>Lilico Detected: {walletInfo.hasLilico ? '✅' : '❌'}</div>
        <div>Flow Wallet Detected: {walletInfo.hasFlowWallet ? '✅' : '❌'}</div>
        <div>Flow Object: {walletInfo.hasFlow ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Mobile Wallet Detection:</strong>
        <pre style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '3px' }}>
          {JSON.stringify(walletInfo.detectedWallets, null, 2)}
        </pre>
      </div>

      <button 
        onClick={handleConnect}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🔄 Test Wallet Connection
      </button>
    </div>
  );
};

export default WalletTester;

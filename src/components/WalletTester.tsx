import React, { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { detectMobileWallets, isMobileDevice } from '../utils/mobileWalletDetection';
import { isFlowWalletInstalled, getFlowWalletInstance } from '../utils/flowWalletDetection';

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
    const flowWalletInstalled = isFlowWalletInstalled();
    const flowWalletInstance = getFlowWalletInstance();
    
    setWalletInfo({
      isMobile: isMobileDevice(),
      detectedWallets: mobileWallets,
      hasLilico: !!(window as any).lilico,
      hasFlowWallet: !!(window as any).flowWallet,
      hasFlow: !!(window as any).flow,
      flowWalletInstalled,
      flowWalletInstance: !!flowWalletInstance,
      flowWalletCanAuth: !!(flowWalletInstance?.authenticate),
      availableFlowProps: Object.keys(window).filter(key => 
        key.toLowerCase().includes('lil') || 
        key.toLowerCase().includes('flow') ||
        key.toLowerCase().includes('wallet')
      )
    });
  }, []);

  const handleConnect = () => {
    setShowAuthFlow(true);
  };

  const handleDirectFlowConnect = async () => {
    console.log('🌊 Attempting direct Flow Wallet connection...');
    const flowWallet = getFlowWalletInstance();
    
    if (flowWallet) {
      try {
        if (typeof flowWallet.authenticate === 'function') {
          console.log('🔄 Calling authenticate on Flow Wallet...');
          const result = await flowWallet.authenticate();
          console.log('✅ Direct Flow Wallet auth result:', result);
        } else {
          console.log('❌ Flow Wallet found but no authenticate method');
        }
      } catch (error) {
        console.error('❌ Direct Flow Wallet auth error:', error);
      }
    } else {
      console.log('❌ No Flow Wallet instance available');
      // Fallback to Dynamic Labs modal
      setShowAuthFlow(true);
    }
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
        <div style={{ color: walletInfo.flowWalletInstalled ? '#00ff00' : '#ff0000' }}>
          Extension Installed: {walletInfo.flowWalletInstalled ? '✅' : '❌'}
        </div>
        <div>Has Instance: {walletInfo.flowWalletInstance ? '✅' : '❌'}</div>
        <div>Can Authenticate: {walletInfo.flowWalletCanAuth ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Available Window Props:</strong>
        <div style={{ fontSize: '10px', color: '#ccc' }}>
          {walletInfo.availableFlowProps?.join(', ') || 'None'}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Mobile Wallet Detection:</strong>
        <pre style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '3px' }}>
          {JSON.stringify(walletInfo.detectedWallets, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
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
          🔄 Test Dynamic Connection
        </button>
        
        <button 
          onClick={handleDirectFlowConnect}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🌊 Direct Flow Connect
        </button>
      </div>
    </div>
  );
};

export default WalletTester;

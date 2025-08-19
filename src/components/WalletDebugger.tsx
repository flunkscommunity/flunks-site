import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const WalletDebugger: React.FC = () => {
  const { 
    setShowAuthFlow,
    user,
    primaryWallet
  } = useDynamicContext();

  const [isClient, setIsClient] = useState(false);
  const [hasFlowWallet, setHasFlowWallet] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check for Flow wallets after component mounts on client
    const checkFlowWallet = () => {
      const flowWalletExists = !!(
        window.lilico || 
        (window as any).fcl_wallet?.lilico || 
        (window as any).flowWallet?.lilico || 
        (window as any).flowWallet || 
        (window as any).FlowWallet ||
        (window as any).flow?.wallet ||
        (window as any).flow
      );
      setHasFlowWallet(flowWalletExists);
    };
    checkFlowWallet();
  }, []);

  const isAuthenticated = !!user;
  const walletType = primaryWallet?.connector?.name || 'None';

  const handleDirectFlowWalletConnect = async () => {
    console.log('🌊 Attempting direct Flow wallet connection...');
    
    if (!isClient) return;
    
    try {
      // Check multiple possible Flow wallet locations (including Lilico, Flow Wallet, etc.)
      const flowWallet = window.lilico || 
                        (window as any).fcl_wallet?.lilico || 
                        (window as any).flowWallet?.lilico ||
                        (window as any).flowWallet ||
                        (window as any).FlowWallet ||
                        (window as any).flow?.wallet ||
                        (window as any).flow;
      
      if (flowWallet) {
        console.log('✅ Flow wallet detected:', flowWallet);
        // Flow wallet is available
        if (typeof flowWallet.authenticate === 'function') {
          const response = await flowWallet.authenticate();
          console.log('Flow wallet auth response:', response);
        } else {
          console.log('❌ Flow wallet detected but no authenticate method');
          setShowAuthFlow(true);
        }
      } else {
        console.log('❌ Flow wallet not found in window');
        console.log('Available window properties:', Object.keys(window).filter(key => 
          key.toLowerCase().includes('lil') || 
          key.toLowerCase().includes('flow') ||
          key.toLowerCase().includes('wallet')
        ));
        // Fall back to Dynamic auth flow
        setShowAuthFlow(true);
      }
    } catch (error) {
      console.error('Error connecting to Flow wallet:', error);
      // Fall back to Dynamic auth flow
      setShowAuthFlow(true);
    }
  };

  const handleDynamicAuthFlow = () => {
    console.log('🔄 Triggering Dynamic auth flow...');
    setShowAuthFlow(true);
  };

  const handleCheckWalletAvailability = () => {
    console.log('🔍 Checking all wallet availability...');
    
    if (!isClient) return;
    
    // Check for various Flow wallets
    const checks = {
      'Flow Wallet (Lilico)': !!(window.lilico || (window as any).fcl_wallet?.lilico),
      'Flow Wallet (Official)': !!((window as any).flowWallet || (window as any).flow),
      'Blocto': !!((window as any).blocto || (window as any).BloctoWallet),
      'Dapper': !!((window as any).dapper),
      'FCL Config': !!((window as any).fcl)
    };
    
    console.log('Wallet availability:', checks);
    console.log('Available window properties:', Object.keys(window).filter(key => 
      key.toLowerCase().includes('lil') || 
      key.toLowerCase().includes('flow') || 
      key.toLowerCase().includes('bloc') || 
      key.toLowerCase().includes('dap') ||
      key.toLowerCase().includes('fcl')
    ));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      maxWidth: '300px'
    }}>
      <div><strong>Wallet Debug Info:</strong></div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>User: {user ? '✅' : '❌'}</div>
      <div>Primary Wallet: {primaryWallet?.address ? primaryWallet.address.slice(0, 8) + '...' : '❌'}</div>
      <div>Connector: {walletType}</div>
      <div>Flow Wallet in window: {isClient ? (hasFlowWallet ? '✅' : '❌') : '⏳'}</div>
      
      {isClient && !hasFlowWallet && (
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          background: 'rgba(255,193,7,0.2)', 
          borderRadius: '3px',
          border: '1px solid #ffc107',
          fontSize: '11px'
        }}>
          ⚠️ Flow Wallet not detected. Install: <br/>
          <a 
            href="https://wallet.flow.com/download" 
            target="_blank" 
            style={{ color: '#ffc107' }}
          >
            Official Flow Wallet
          </a> or <br/>
          <a 
            href="https://chrome.google.com/webstore/detail/lilico/hpclkefagolihohboafpheddmmgdffjm" 
            target="_blank" 
            style={{ color: '#ffc107' }}
          >
            Lilico Extension
          </a>
        </div>
      )}
      
      <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexDirection: 'column' }}>
        <button 
          onClick={handleDynamicAuthFlow}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔄 Dynamic Auth Flow
        </button>
        
        <button 
          onClick={handleDirectFlowWalletConnect}
          style={{
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🌊 Direct Flow Wallet Test
        </button>
        
        <button 
          onClick={handleCheckWalletAvailability}
          style={{
            background: '#9b59b6',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔍 Check All Wallets
        </button>
      </div>
    </div>
  );
};

// Extend window interface for Flow wallets (including Lilico)
declare global {
  interface Window {
    lilico?: {
      authenticate: () => Promise<any>;
      [key: string]: any;
    };
    flowWallet?: {
      authenticate: () => Promise<any>;
      [key: string]: any;
    };
    flow?: {
      authenticate: () => Promise<any>;
      [key: string]: any;
    };
  }
}

export default WalletDebugger;

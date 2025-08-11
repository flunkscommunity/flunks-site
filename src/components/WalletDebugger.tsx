import React from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const WalletDebugger: React.FC = () => {
  const { 
    setShowAuthFlow,
    user,
    primaryWallet
  } = useDynamicContext();

  const isAuthenticated = !!user;
  const walletType = primaryWallet?.connector?.name || 'None';

  const handleDirectLilicoConnect = async () => {
    console.log('🌊 Attempting direct Lilico connection...');
    
    try {
      // Try to manually trigger Lilico wallet connection
      if (window.lilico) {
        console.log('✅ Lilico wallet detected in window');
        // Lilico is available
        const response = await window.lilico.authenticate();
        console.log('Lilico auth response:', response);
      } else {
        console.log('❌ Lilico wallet not found in window');
        // Fall back to Dynamic auth flow
        setShowAuthFlow(true);
      }
    } catch (error) {
      console.error('Error connecting to Lilico:', error);
      // Fall back to Dynamic auth flow
      setShowAuthFlow(true);
    }
  };

  const handleDynamicAuthFlow = () => {
    console.log('🔄 Triggering Dynamic auth flow...');
    setShowAuthFlow(true);
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
      <div>Lilico in window: {typeof window !== 'undefined' && window.lilico ? '✅' : '❌'}</div>
      
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
          onClick={handleDirectLilicoConnect}
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
          🌊 Direct Lilico Test
        </button>
      </div>
    </div>
  );
};

// Extend window interface for Lilico
declare global {
  interface Window {
    lilico?: {
      authenticate: () => Promise<any>;
      [key: string]: any;
    };
  }
}

export default WalletDebugger;

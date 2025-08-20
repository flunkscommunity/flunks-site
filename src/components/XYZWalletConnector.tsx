import React from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface XYZWalletConnectorProps {
  xyzApiEndpoint?: string;
  onWalletConnected?: (walletData: any) => void;
}

export const XYZWalletConnector: React.FC<XYZWalletConnectorProps> = ({
  xyzApiEndpoint = process.env.NEXT_PUBLIC_XYZ_WALLET_API || 'https://api.yourxyzwallet.com',
  onWalletConnected
}) => {
  const { primaryWallet, user, setShowAuthFlow } = useDynamicContext();
  
  const connectXYZWallet = async () => {
    try {
      // Call your XYZ wallet API
      const response = await fetch(`${xyzApiEndpoint}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your API authentication if needed
        },
        body: JSON.stringify({
          dynamicUserId: user?.userId,
          existingWallet: primaryWallet?.address,
          // Add any other required data
        })
      });
      
      const walletData = await response.json();
      
      if (walletData.success) {
        console.log('✅ XYZ Wallet connected:', walletData);
        onWalletConnected?.(walletData);
        
        // Optionally store the connection in sessionStorage for persistence
        sessionStorage.setItem('xyz-wallet-data', JSON.stringify(walletData));
      }
      
    } catch (error) {
      console.error('❌ XYZ Wallet connection failed:', error);
    }
  };

  return (
    <div style={{
      padding: '15px',
      background: 'rgba(0, 150, 255, 0.1)',
      border: '1px solid rgba(0, 150, 255, 0.3)',
      borderRadius: '8px',
      margin: '10px 0'
    }}>
      <h4>🔗 XYZ Wallet Integration</h4>
      <p>Connect your XYZ wallet to enhance your Flunks experience.</p>
      
      {user ? (
        <button
          onClick={connectXYZWallet}
          style={{
            background: '#0096ff',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔗 Connect XYZ Wallet
        </button>
      ) : (
        <button
          onClick={() => setShowAuthFlow(true)}
          style={{
            background: '#666',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          First connect with Dynamic
        </button>
      )}
    </div>
  );
};

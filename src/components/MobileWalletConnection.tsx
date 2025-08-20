import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isMobileDevice } from '../utils/mobileWalletDetection';

interface MobileWalletConnectionProps {
  onWalletConnected?: (wallet: any) => void;
  preferredWallets?: string[];
}

export const MobileWalletConnection: React.FC<MobileWalletConnectionProps> = ({
  onWalletConnected,
  preferredWallets = ['flowwallet', 'lilico', 'dapper', 'blocto']
}) => {
  const { setShowAuthFlow, user, primaryWallet } = useDynamicContext();
  const [isClient, setIsClient] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const connectMobileWallet = async (walletType: 'flow' | 'lilico' | 'dapper') => {
    if (!isClient) return;
    
    setConnectionAttempt(walletType);
    setIsConnecting(true);
    
    try {
      console.log(`🔗 Attempting to connect ${walletType} wallet on mobile...`);
      
      // Set Dynamic Labs overrides for mobile wallet selection - more aggressive
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).FORCE_DESKTOP_MODE = false;
      (window as any).SELECTED_WALLET_STRICT = false; // Don't be too strict to allow fallbacks
      
      // Map wallet type to Dynamic Labs wallet key
      const walletKeyMap: Record<string, string> = {
        'flow': 'flowwallet',
        'lilico': 'flowwallet', // Use flowwallet key for lilico too
        'dapper': 'dapper'
      };
      
      const selectedKey = walletKeyMap[walletType];
      (window as any).SELECTED_WALLET_TYPE = selectedKey;
      
      console.log(`🔗 Set wallet preference: ${selectedKey}`);
      console.log(`🚨 Force flags set:`, {
        FORCE_SHOW_ALL_WALLETS: (window as any).FORCE_SHOW_ALL_WALLETS,
        SELECTED_WALLET_TYPE: (window as any).SELECTED_WALLET_TYPE,
        SELECTED_WALLET_STRICT: (window as any).SELECTED_WALLET_STRICT
      });
      
      // Small delay to let the flags take effect, then trigger Dynamic Labs
      setTimeout(() => {
        console.log('📱 Triggering Dynamic Labs modal...');
        setShowAuthFlow(true);
      }, 100);
      
      // Also try direct connection strategies
      switch (walletType) {
        case 'flow':
        case 'lilico':
          await connectFlowLilico();
          break;
          
        case 'dapper':
          await connectDapper();
          break;
      }
      
    } catch (error) {
      console.error(`❌ Failed to connect ${walletType} wallet:`, error);
      // Always try Dynamic Labs as fallback
      setShowAuthFlow(true);
    } finally {
      setTimeout(() => {
        setIsConnecting(false);
        setConnectionAttempt(null);
      }, 2000); // Give more time for connection
    }
  };

  const connectFlowLilico = async () => {
    // Strategy 1: Try direct wallet connection if available
    if ((window as any).lilico || (window as any).flowWallet) {
      console.log('📱 Found Flow/Lilico wallet in browser - attempting direct connection');
      try {
        const wallet = (window as any).lilico || (window as any).flowWallet;
        if (wallet.authenticate) {
          const result = await wallet.authenticate();
          console.log('✅ Direct wallet authentication successful:', result);
          onWalletConnected?.(result);
          return;
        }
      } catch (error) {
        console.log('⚠️ Direct authentication failed, falling back to Dynamic Labs');
      }
    }
    
    // Strategy 2: Try deep link to Flow Wallet app
    if (isMobileDevice()) {
      const currentUrl = window.location.href;
      const flowWalletUrl = `https://wallet.flow.com/connect?callback=${encodeURIComponent(currentUrl)}`;
      
      // Try to open Flow Wallet app
      const appLink = document.createElement('a');
      appLink.href = flowWalletUrl;
      appLink.target = '_blank';
      appLink.click();
      
      // Small delay then trigger Dynamic Labs as fallback
      setTimeout(() => {
        console.log('📱 Triggering Dynamic Labs Flow wallet connection...');
        setShowAuthFlow(true);
      }, 1000);
    } else {
      // Desktop fallback
      setShowAuthFlow(true);
    }
  };

  const connectDapper = async () => {
    if (isMobileDevice()) {
      // Strategy 1: Try Dapper web authentication
      const currentUrl = window.location.href;
      const dapperUrl = `https://accounts.meetdapper.com/connect?callback=${encodeURIComponent(currentUrl)}`;
      
      // Open Dapper in new tab/window
      const dapperWindow = window.open(dapperUrl, '_blank');
      
      // Also trigger Dynamic Labs connection
      setTimeout(() => {
        console.log('📱 Triggering Dynamic Labs Dapper connection...');
        setShowAuthFlow(true);
      }, 500);
    } else {
      setShowAuthFlow(true);
    }
  };

  const getWalletStatus = (walletType: string) => {
    if (!isClient) return 'checking';
    
    const checks = {
      flow: !!(window as any).lilico || !!(window as any).flowWallet || !!(window as any).flow,
      lilico: !!(window as any).lilico || !!(window as any).flowWallet,
      dapper: isMobileDevice() || !!(window as any).dapper,
    };
    
    return checks[walletType as keyof typeof checks] ? 'available' : 'install-needed';
  };

  if (!isClient) return <div>Loading wallet options...</div>;

  // Force mobile detection - more aggressive check
  const isReallyMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(window.navigator.userAgent) ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768
  );

  if (!isReallyMobile) {
    return (
      <div style={{ padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p>🖥️ Desktop detected - wallet connections should work normally through Dynamic Labs.</p>
        <button 
          onClick={() => setShowAuthFlow(true)}
          style={{
            background: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white',
      margin: '10px 0'
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>📱 Mobile Wallet Connection</h3>
      
      {user && primaryWallet ? (
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
          ✅ Connected: {primaryWallet.address?.slice(0, 8)}...
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 15px 0' }}>
            Choose your preferred Flow ecosystem wallet:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Flow Wallet / Lilico */}
            <button
              onClick={() => connectMobileWallet('flow')}
              disabled={isConnecting && connectionAttempt === 'flow'}
              style={{
                background: connectionAttempt === 'flow' ? '#4CAF50' : '#00D4AA',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '8px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                opacity: isConnecting && connectionAttempt !== 'flow' ? 0.5 : 1
              }}
            >
              <span>🌊</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>Flow Wallet (Lilico)</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Status: {getWalletStatus('flow')}
                </div>
              </div>
              {connectionAttempt === 'flow' && <span>🔄</span>}
            </button>

            {/* Dapper */}
            <button
              onClick={() => connectMobileWallet('dapper')}
              disabled={isConnecting && connectionAttempt === 'dapper'}
              style={{
                background: connectionAttempt === 'dapper' ? '#4CAF50' : '#FF6B35',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '8px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                opacity: isConnecting && connectionAttempt !== 'dapper' ? 0.5 : 1
              }}
            >
              <span>💎</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>Dapper Wallet</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Browser-based • Always available
                </div>
              </div>
              {connectionAttempt === 'dapper' && <span>🔄</span>}
            </button>
          </div>

          {isConnecting && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              🔄 Connecting to {connectionAttempt} wallet...
              <br />
              <small>This may redirect to the wallet app</small>
            </div>
          )}
        </div>
      )}
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        opacity: 0.7,
        borderTop: '1px solid rgba(255,255,255,0.2)',
        paddingTop: '10px'
      }}>
        💡 If connection fails, make sure you have the wallet app installed or use the browser option
      </div>
    </div>
  );
};

export default MobileWalletConnection;

import React, { useEffect, useState } from 'react';
import { 
  isMobileDevice, 
  detectMobileWallets, 
  checkMobileWalletAvailability,
  getMobileWalletConnectionUrl 
} from '../utils/mobileWalletDetection';

interface MobileWalletHelperProps {
  onWalletSelected?: (walletType: string) => void;
  showDebugInfo?: boolean;
}

export const MobileWalletHelper: React.FC<MobileWalletHelperProps> = ({
  onWalletSelected,
  showDebugInfo = false
}) => {
  const [mobileInfo, setMobileInfo] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (isMobileDevice()) {
      const info = checkMobileWalletAvailability();
      setMobileInfo(info);
    }
  }, []);

  if (!isClient || !isMobileDevice()) return null;

  const handleWalletDownload = (walletType: string) => {
    const urls = {
      'lilico': 'https://apps.apple.com/app/lilico/id1644110320', // iOS App Store
      'blocto': 'https://apps.apple.com/app/blocto/id1481181682',
      'dapper': 'https://accounts.meetdapper.com/'
    };

    const url = urls[walletType as keyof typeof urls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{
      background: 'rgba(0, 123, 255, 0.1)',
      border: '1px solid rgba(0, 123, 255, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      margin: '10px 0',
      fontSize: '14px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        📱 Mobile Wallet Options
      </div>
      
      {mobileInfo && !mobileInfo.available && (
        <div>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>
            No Flow wallets detected on mobile. Try these options:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleWalletDownload('blocto')}
              style={{
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              📲 Download Blocto Wallet (Recommended)
            </button>
            
            <button
              onClick={() => handleWalletDownload('lilico')}
              style={{
                background: '#00D4AA',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              📲 Download Lilico/Flow Wallet
            </button>
            
            <button
              onClick={() => handleWalletDownload('dapper')}
              style={{
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              🌐 Use Dapper Wallet (Browser)
            </button>
          </div>
        </div>
      )}

      {mobileInfo && mobileInfo.available && (
        <div>
          <p style={{ margin: '0 0 10px 0', color: '#006400' }}>
            ✅ Found {mobileInfo.wallets.length} wallet(s): {mobileInfo.wallets.join(', ')}
          </p>
        </div>
      )}

      {showDebugInfo && mobileInfo && (
        <details style={{ marginTop: '10px', fontSize: '11px', opacity: 0.7 }}>
          <summary>Debug Info</summary>
          <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(mobileInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default MobileWalletHelper;

import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isMobileDevice, detectMobileWallets } from '../utils/mobileWalletDetection';
import CustomMobileWalletModal from './CustomMobileWalletModal';

const MobileWalletDebugger: React.FC = () => {
  const { setShowAuthFlow } = useDynamicContext();
  // Helper to explicitly open a specific wallet by nudging Dynamic's state
  const openWalletDirect = (key: string) => {
    try {
      // Hint Dynamic to default to this wallet; our overrides in _app.tsx will pick this up
      (window as any).SELECTED_WALLET_TYPE = key;
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).SELECTED_WALLET_STRICT = true;
      setShowAuthFlow(false);
      setTimeout(() => setShowAuthFlow(true), 50);
    } catch (e) {
      console.warn('Failed to open wallet directly', e);
      setShowAuthFlow(true);
    }
  };
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isClient, setIsClient] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<Array<{ key: string; name?: string }>>([]);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Pull latest wallet list from Dynamic (populated in walletsFilter)
      try {
        const list = (window as any).LAST_DYNAMIC_WALLETS as Array<{ key: string; name?: string }> | undefined;
        if (list && Array.isArray(list)) setAvailableWallets(list);
      } catch {}

      const info = {
        isMobile: isMobileDevice(),
        userAgent: navigator.userAgent,
        detectedWallets: detectMobileWallets(),
        windowProperties: Object.keys(window).filter(key => 
          key.toLowerCase().includes('dap') ||
          key.toLowerCase().includes('lil') ||
          key.toLowerCase().includes('flow') ||
          key.toLowerCase().includes('bloc') ||
          key.toLowerCase().includes('wallet')
        ),
        // Check for specific wallet objects
        walletChecks: {
          dapper: !!(window as any).dapper,
          lilico: !!(window as any).lilico,
          flowWallet: !!(window as any).flowWallet,
          blocto: !!(window as any).blocto,
          flow: !!(window as any).flow,
        },
        // Check meta tags that might indicate wallet presence
        metaTags: Array.from(document.querySelectorAll('meta')).map(meta => ({
          name: meta.getAttribute('name'),
          content: meta.getAttribute('content')
        })).filter(tag => tag.name && (
          tag.name.includes('wallet') || 
          tag.name.includes('flow') ||
          tag.name.includes('lilico') ||
          tag.name.includes('dapper')
        ))
      };
      setDebugInfo(info);
    }
  }, []);

  // Utility to match aliases to available keys
  const pickWalletKey = (desired: string): string => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const d = norm(desired);
    if (!availableWallets || availableWallets.length === 0) return desired;
    const ranked = availableWallets
      .map(w => ({ w, k: norm(w.key) }))
      .sort((a, b) => {
        const score = (k: string) => {
          if (d.includes('blocto')) return k.includes('blocto') ? 3 : 0;
          if (d.includes('dapper')) return k.includes('dapper') ? 3 : 0;
          if (d.includes('lilico')) return (k.includes('lilico') || k.includes('flowwallet')) ? 3 : 0;
          if (d.includes('flowwallet')) return (k.includes('flowwallet') || k.includes('lilico')) ? 3 : 0;
          if (d === 'flow') return (k.includes('flow') && !k.includes('blocto') && !k.includes('dapper')) ? 2 : 0;
          return k.includes(d) ? 1 : 0;
        };
        return score(b.k) - score(a.k);
      });
    return ranked.length && (ranked[0].w.key.toLowerCase().includes('blocto') && d !== 'blocto')
      ? (ranked.find(r => !r.w.key.toLowerCase().includes('blocto'))?.w.key || desired)
      : (ranked[0]?.w.key || desired);
  };

  const handleForceShowAllWallets = () => {
    // Temporarily override mobile detection and force all wallets to show
    if (typeof window !== 'undefined') {
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      console.log('🚨 FORCE_SHOW_ALL_WALLETS enabled');
      console.log('🚨 Window flag set:', (window as any).FORCE_SHOW_ALL_WALLETS);
      
      // Also try to override Dynamic Labs mobile detection
      (window as any).FORCE_DESKTOP_MODE = true;
      
      // Override navigator.userAgent temporarily for Dynamic Labs
      if (navigator.userAgent) {
        (window as any).ORIGINAL_USER_AGENT = navigator.userAgent;
        Object.defineProperty(navigator, 'userAgent', {
          get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          configurable: true
        });
        console.log('🚨 Temporarily overrode user agent to desktop');
      }
      
      // Try to trigger a re-render of the Dynamic widget
      setTimeout(() => {
        setShowAuthFlow(false);
        setTimeout(() => {
          setShowAuthFlow(true);
          console.log('🚨 Auth flow reopened with force flag');
        }, 200);
      }, 100);
    }
  };

  const handleClearForceFlag = () => {
    if (typeof window !== 'undefined') {
      delete (window as any).FORCE_SHOW_ALL_WALLETS;
      delete (window as any).FORCE_DESKTOP_MODE;
      
      // Restore original user agent
      if ((window as any).ORIGINAL_USER_AGENT) {
        Object.defineProperty(navigator, 'userAgent', {
          get: () => (window as any).ORIGINAL_USER_AGENT,
          configurable: true
        });
        delete (window as any).ORIGINAL_USER_AGENT;
        console.log('🚨 Restored original user agent');
      }
      
      console.log('🚨 All force flags cleared');
      setShowAuthFlow(false);
    }
  };

  if (!isClient || !isMobileDevice()) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '10px',
      maxWidth: '300px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 10000,
      border: '1px solid #333'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>📱 Mobile Wallet Debugger</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Device Info:</strong>
        <div>Mobile: {debugInfo.isMobile ? '✅' : '❌'}</div>
        <div style={{ fontSize: '9px', opacity: 0.7 }}>
          {debugInfo.userAgent}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Detected Wallets:</strong>
        {debugInfo.detectedWallets && Object.entries(debugInfo.detectedWallets).map(([wallet, detected]) => (
          <div key={wallet} style={{ color: detected ? '#00ff00' : '#ff6666' }}>
            {wallet}: {detected ? '✅' : '❌'}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Force Flag Status:</strong>
        <div style={{ color: (typeof window !== 'undefined' && (window as any).FORCE_SHOW_ALL_WALLETS) ? '#00ff00' : '#ff6666' }}>
          FORCE_SHOW_ALL_WALLETS: {(typeof window !== 'undefined' && (window as any).FORCE_SHOW_ALL_WALLETS) ? '✅ ACTIVE' : '❌ OFF'}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Wallet Objects:</strong>
        {debugInfo.walletChecks && Object.entries(debugInfo.walletChecks).map(([wallet, exists]) => (
          <div key={wallet} style={{ color: exists ? '#00ff00' : '#ff6666' }}>
            window.{wallet}: {exists ? '✅' : '❌'}
          </div>
        ))}
      </div>

      {debugInfo.windowProperties && debugInfo.windowProperties.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Wallet-related Properties:</strong>
          <div style={{ fontSize: '9px', color: '#ccc' }}>
            {debugInfo.windowProperties.join(', ')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={() => setShowAuthFlow(true)}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Open Wallet Modal
        </button>
        
        <button
          onClick={handleForceShowAllWallets}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🚨 Force Show All Wallets
        </button>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              (window as any).FORCE_DESKTOP_MODE = true;
              console.log('🖥️ Desktop mode forced');
              setShowAuthFlow(false);
              setTimeout(() => setShowAuthFlow(true), 200);
            }
          }}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🖥️ Force Desktop Mode
        </button>

        <button
          onClick={() => setShowCustomModal(true)}
          style={{
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🔧 Custom Wallet Modal
        </button>

        <button
          onClick={handleClearForceFlag}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Clear Force Flag
        </button>
      </div>

      <details style={{ marginTop: '10px', fontSize: '9px' }}>
        <summary>Full Debug Info</summary>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all',
          marginTop: '5px',
          background: 'rgba(255,255,255,0.1)',
          padding: '5px',
          borderRadius: '3px'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>

      <CustomMobileWalletModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
    onSelectWallet={(walletType) => {
          console.log('🔧 Custom modal selected wallet:', walletType);
          setShowCustomModal(false);
          
          // Try to trigger Dynamic Labs connection for the selected wallet
          if (typeof window !== 'undefined') {
      const resolved = pickWalletKey(walletType);
      (window as any).SELECTED_WALLET_TYPE = resolved;
            // Ensure all wallets are visible so the selected key appears
            (window as any).FORCE_SHOW_ALL_WALLETS = true;
            // Enable strict selection so only the chosen wallet is shown/used when possible
            (window as any).SELECTED_WALLET_STRICT = true;
      console.log('🔧 Set selected wallet type:', resolved);
            
            // Force show that specific wallet
      setTimeout(() => openWalletDirect(resolved), 150);
          }
        }}
    availableWallets={availableWallets}
      />
    </div>
  );
};

export default MobileWalletDebugger;

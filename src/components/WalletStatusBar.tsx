import React, { useState } from 'react';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

interface WalletStatusBarProps {
  onDisconnect?: () => void;
  compact?: boolean;
}

const WalletStatusBar: React.FC<WalletStatusBarProps> = ({ onDisconnect, compact = false }) => {
  const { isConnected, address, walletType, disconnect } = useUnifiedWallet();
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isConnected || !address) {
    return null;
  }

  const handleDisconnect = async () => {
    console.log('🔌 WalletStatusBar: Disconnect clicked');
    // On mobile, use custom confirm since native confirm() may not work
    if (isMobileApp()) {
      setShowConfirm(true);
    } else {
      if (confirm('Disconnect wallet?')) {
        console.log('🔌 WalletStatusBar: Disconnecting...');
        await disconnect();
        console.log('🔌 WalletStatusBar: Disconnected');
        if (onDisconnect) {
          onDisconnect();
        }
      }
    }
  };

  const confirmDisconnect = async () => {
    setShowConfirm(false);
    console.log('🔌 WalletStatusBar: Disconnecting (mobile)...');
    await disconnect();
    console.log('🔌 WalletStatusBar: Disconnected (mobile)');
    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Normalize address for display (handle CAIP-10 format)
  let displayAddress = address;
  if (address.includes(':')) {
    const parts = address.split(':');
    displayAddress = parts[parts.length - 1];
  }

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#1a1a2e',
        padding: '4px 8px',
        border: '2px solid #333',
        borderRadius: '0px',
        fontSize: '10px',
        color: '#00ff00',
        fontFamily: '"Press Start 2P", w95fa, "Courier New", monospace',
        boxShadow: '2px 2px 0px #000, inset 1px 1px 0px #444',
        imageRendering: 'pixelated',
        letterSpacing: '0px',
        position: 'relative',
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile confirmation modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#1a1a2e',
            border: '3px solid #00ff00',
            padding: '20px',
            borderRadius: '0',
            textAlign: 'center',
            boxShadow: '4px 4px 0 #000'
          }}>
            <p style={{ marginBottom: '15px', fontSize: '12px' }}>Disconnect wallet?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={confirmDisconnect}
                style={{
                  background: '#00aa00',
                  color: 'white',
                  border: '2px solid #008800',
                  padding: '8px 16px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontFamily: '"Press Start 2P", w95fa, monospace'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  background: '#aa0000',
                  color: 'white',
                  border: '2px solid #880000',
                  padding: '8px 16px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontFamily: '"Press Start 2P", w95fa, monospace'
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator - pixel style */}
      <div style={{
        width: '8px',
        height: '8px',
        background: '#00ff00',
        border: '1px solid #00aa00',
        boxShadow: '0 0 4px #00ff00',
      }} />
      
      {/* Address - truncated */}
      <span style={{ 
        opacity: 0.9, 
        fontSize: '8px',
        textShadow: '0 0 2px #00ff00'
      }}>
        {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
      </span>
      
      {/* Disconnect button - pixel X - larger touch target for mobile */}
      <button
        onClick={(e) => {
          console.log('🔌 WalletStatusBar: onClick fired');
          e.preventDefault();
          e.stopPropagation();
          handleDisconnect();
        }}
        onTouchStart={(e) => {
          console.log('🔌 WalletStatusBar: onTouchStart fired');
          // Visual feedback
          (e.currentTarget as HTMLButtonElement).style.background = '#ff0000';
        }}
        onTouchEnd={(e) => {
          console.log('🔌 WalletStatusBar: onTouchEnd fired');
          e.preventDefault();
          e.stopPropagation();
          // Reset visual feedback
          (e.currentTarget as HTMLButtonElement).style.background = '#aa0000';
          handleDisconnect();
        }}
        onPointerDown={(e) => {
          console.log('🔌 WalletStatusBar: onPointerDown fired');
          e.stopPropagation();
        }}
        style={{
          background: '#aa0000',
          color: 'white',
          border: '2px solid #660000',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: '"Press Start 2P", w95fa, "Courier New", monospace',
          boxShadow: '2px 2px 0px #000',
          transition: 'background 0.1s',
          lineHeight: 1,
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'rgba(255,0,0,0.5)',
          touchAction: 'manipulation',
          pointerEvents: 'auto',
          zIndex: 10000,
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        title="Disconnect wallet"
      >
        ✕
      </button>
    </div>
  );
};

export default WalletStatusBar;

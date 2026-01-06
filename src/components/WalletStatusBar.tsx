import React, { useState } from 'react';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';

interface WalletStatusBarProps {
  onDisconnect?: () => void;
  compact?: boolean;
}

const WalletStatusBar: React.FC<WalletStatusBarProps> = ({ onDisconnect, compact = false }) => {
  const { isConnected, address, walletType, disconnect } = useUnifiedWallet();
  const [isHovered, setIsHovered] = useState(false);

  if (!isConnected || !address) {
    return null;
  }

  const handleDisconnect = async () => {
    if (confirm('Disconnect wallet?')) {
      await disconnect();
      if (onDisconnect) {
        onDisconnect();
      }
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
        letterSpacing: '0px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
      
      {/* Disconnect button - pixel X */}
      <button
        onClick={handleDisconnect}
        style={{
          background: isHovered ? '#ff4444' : '#aa0000',
          color: 'white',
          border: '2px solid #660000',
          padding: '2px 6px',
          fontSize: '8px',
          cursor: 'pointer',
          fontFamily: '"Press Start 2P", w95fa, "Courier New", monospace',
          boxShadow: '1px 1px 0px #000',
          transition: 'background 0.1s',
          lineHeight: 1
        }}
        title="Disconnect wallet"
      >
        ✕
      </button>
    </div>
  );
};

export default WalletStatusBar;

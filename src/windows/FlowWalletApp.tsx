import React, { useState } from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const FlowWalletApp: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { setShowAuthFlow, primaryWallet, user } = useDynamicContext();
  const [isHovered, setIsHovered] = useState(false);

  const isConnected = !!primaryWallet;
  const address = primaryWallet?.address;

  const handleConnect = () => {
    setShowAuthFlow(true);
  };

  const handleDisconnect = async () => {
    try {
      await primaryWallet?.disconnect();
    } catch (e) {
      console.error('Disconnect error:', e);
    }
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.FLOW_WALLET_APP}
      onClose={() => closeWindow(WINDOW_IDS.FLOW_WALLET_APP)}
      headerTitle="Log In"
      headerIcon="/images/icons/flowty.png"
      initialWidth="420px"
      initialHeight="auto"
      resizable={false}
      showMaximizeButton={false}
    >
      <div 
        style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 40%, #0e0618 100%)',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 30px',
          fontFamily: "'Press Start 2P', monospace",
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }} />

        {/* Pixel border frame */}
        <div style={{
          position: 'absolute', inset: '12px',
          border: '3px solid #c8a820',
          pointerEvents: 'none',
          opacity: 0.4,
        }}>
          {/* Corner diamonds */}
          {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
            <div key={pos} style={{
              position: 'absolute',
              width: '8px', height: '8px',
              background: '#e8d040',
              transform: 'rotate(45deg)',
              ...(pos.includes('top') ? { top: '-4px' } : { bottom: '-4px' }),
              ...(pos.includes('left') ? { left: '-4px' } : { right: '-4px' }),
            }} />
          ))}
        </div>

        {/* Flow Wallet icon */}
        <img 
          src="/images/icons/flowty.png" 
          alt="Flow Wallet" 
          style={{ 
            width: '64px', height: '64px', 
            marginBottom: '24px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 12px rgba(0,200,100,0.4))',
          }} 
        />

        {!isConnected ? (
          <>
            {/* Title */}
            <div style={{
              fontSize: '18px',
              color: '#f0d848',
              letterSpacing: '4px',
              textShadow: '2px 2px 0 #805800, 0 0 12px rgba(240,216,72,0.4)',
              marginBottom: '12px',
            }}>
              LOG IN
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: '9px',
              color: '#8ab4c4',
              letterSpacing: '2px',
              marginBottom: '32px',
              lineHeight: '1.6',
            }}>
              CONNECT YOUR FLOW WALLET<br/>TO ENTER SEMESTER ZERO
            </div>

            {/* Connect button */}
            <button
              onClick={handleConnect}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '13px',
                color: isHovered ? '#0a0a1a' : '#f0d848',
                background: isHovered 
                  ? 'linear-gradient(180deg, #f0d848 0%, #c8a820 100%)' 
                  : 'transparent',
                border: '3px solid #c8a820',
                padding: '14px 32px',
                cursor: 'pointer',
                letterSpacing: '3px',
                textShadow: isHovered ? 'none' : '0 0 8px rgba(240,216,72,0.3)',
                transition: 'all 0.15s ease',
                imageRendering: 'pixelated' as any,
              }}
            >
              CONNECT WALLET
            </button>

            {/* Hint text */}
            <div style={{
              fontSize: '7px',
              color: '#555',
              letterSpacing: '1px',
              marginTop: '24px',
              lineHeight: '1.8',
            }}>
              SUPPORTS FLOW WALLET &amp; DAPPER
            </div>
          </>
        ) : (
          <>
            {/* Connected state */}
            <div style={{
              fontSize: '14px',
              color: '#4ade80',
              letterSpacing: '4px',
              textShadow: '0 0 12px rgba(74,222,128,0.4)',
              marginBottom: '16px',
            }}>
              CONNECTED
            </div>

            {/* Address */}
            <div style={{
              fontSize: '8px',
              color: '#8ab4c4',
              letterSpacing: '1px',
              marginBottom: '8px',
              wordBreak: 'break-all',
              maxWidth: '300px',
            }}>
              {address}
            </div>

            {/* User info */}
            {user?.email && (
              <div style={{
                fontSize: '8px',
                color: '#a8b8d0',
                letterSpacing: '1px',
                marginBottom: '24px',
              }}>
                {user.email}
              </div>
            )}

            {/* Disconnect button */}
            <button
              onClick={handleDisconnect}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: isHovered ? '#0a0a1a' : '#ef4444',
                background: isHovered 
                  ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)' 
                  : 'transparent',
                border: '2px solid #ef4444',
                padding: '10px 24px',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              DISCONNECT
            </button>
          </>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default FlowWalletApp;

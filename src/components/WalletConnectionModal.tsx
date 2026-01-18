import React, { useState } from 'react';
import { Window, WindowHeader, WindowContent, Button, Hourglass } from 'react95';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';
import * as fcl from '@onflow/fcl';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

interface WalletConnectionModalProps {
  onClose: () => void;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ onClose }) => {
  const { setShowAuthFlow } = useDynamicContext();
  const { connectFCL } = useUnifiedWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDynamicForWallet = (walletKey: 'dapper' | 'flowwallet') => {
    try {
      // Hints used by various mobile wallet fixes to bias Dynamic toward a specific wallet.
      (window as any).FORCE_SHOW_ALL_WALLETS = true;
      (window as any).SELECTED_WALLET_TYPE = walletKey;
      (window as any).SELECTED_WALLET_STRICT = false;

      console.log(`🔐 Opening Dynamic auth flow (preferred=${walletKey})`);
      setShowAuthFlow(true);
      onClose();
    } catch (err) {
      console.error('Error opening Dynamic auth:', err);
      setError('Failed to open wallet connection');
    }
  };

  // Dapper Wallet - uses Dynamic SDK (custodial)
  const handleDynamicConnect = () => {
    console.log('💎 Opening Dapper wallet login via Dynamic...');
    openDynamicForWallet('dapper');
  };

  // Flow Wallet - direct connection (self-custodial)
  const handleFlowWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🌊 Connecting directly to Flow Wallet...');
      
      // Native (Capacitor): use FCL WalletConnect (configured in `src/config/fcl.ts`)
      // so we actually deep-link to the Flow Wallet app instead of Dynamic's embedded UI.
      await connectFCL();
      onClose();
    } catch (err) {
      console.error('Error connecting to Flow wallet:', err);
      setError('Failed to connect to Flow Wallet. Make sure you have Flow Wallet installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <Window
        style={{
          width: '600px',
          maxWidth: '95vw',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <WindowHeader style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #1034a6 0%, #0c2b7a 100%)',
          padding: '3px 6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>�</span>
            <span style={{ 
              fontFamily: 'w95fa, "Courier New", monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
            }}>
              Wallet Authentication System
            </span>
          </div>
          <Button 
            onClick={onClose} 
            style={{ 
              padding: '0',
              minHeight: '20px',
              width: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}
          >
            ✕
          </Button>
        </WindowHeader>
        <WindowContent style={{ 
          background: 'linear-gradient(180deg, #c0c0c0 0%, #a0a0a0 100%)',
          padding: '0'
        }}>
          {/* Retro System Banner */}
          <div style={{
            background: 'linear-gradient(90deg, #000080 0%, #0000cd 50%, #000080 100%)',
            padding: '20px',
            textAlign: 'center',
            borderBottom: '3px ridge #808080',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Scanline effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              fontSize: '24px',
              fontFamily: "'Press Start 2P', 'w95fa', monospace",
              color: '#00ff00',
              textShadow: '0 0 10px rgba(0, 255, 0, 0.7), 2px 2px 0px #000',
              marginBottom: '8px',
              letterSpacing: '2px',
              position: 'relative'
            }}>
              🔗 WALLET LOGIN
            </div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'w95fa, "Courier New", monospace',
              color: '#00ffff',
              textShadow: '0 0 8px rgba(0, 255, 255, 0.5), 1px 1px 0px #000',
              letterSpacing: '1px',
              position: 'relative'
            }}>
              SELECT AUTHENTICATION METHOD
            </div>
          </div>

          <div style={{ padding: '25px 30px' }}>
            {error && (
              <div
                style={{
                  padding: '12px',
                  marginBottom: '20px',
                  background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)',
                  border: '3px ridge #ff0000',
                  fontFamily: 'w95fa, "Courier New", monospace',
                  fontSize: '12px',
                  color: 'white',
                  textShadow: '1px 1px 0px #000',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: 'bold'
                }}
              >
                ⚠️ ERROR: {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Flow Wallet Button - Primary login method */}
              <button
                onClick={handleFlowWalletConnect}
                disabled={isConnecting}
                style={{
                  background: isConnecting 
                    ? 'linear-gradient(180deg, #808080 0%, #606060 100%)'
                    : 'linear-gradient(180deg, #00d4aa 0%, #00a884 100%)',
                  border: '3px outset #00d4aa',
                  padding: '0',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  fontFamily: "'Press Start 2P', 'w95fa', monospace",
                  position: 'relative',
                  boxShadow: '0 4px 0 #007755, 0 6px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.1s',
                  opacity: isConnecting ? 0.6 : 1
                }}
                onMouseDown={(e) => !isConnecting && (e.currentTarget.style.transform = 'translateY(2px)')}
                onMouseUp={(e) => !isConnecting && (e.currentTarget.style.transform = 'translateY(0)')}
                onMouseLeave={(e) => !isConnecting && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderBottom: '2px solid rgba(0,0,0,0.2)',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  {isConnecting ? (
                    <>
                      <Hourglass size={32} />
                      <span style={{ 
                        fontSize: '10px',
                        color: '#ffffff',
                        textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                        letterSpacing: '1px'
                      }}>
                        CONNECTING...
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '32px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))' }}>🌊</span>
                      <span style={{ 
                        fontSize: '10px',
                        color: '#ffffff',
                        textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                        letterSpacing: '1px'
                      }}>
                        FLOW WALLET
                      </span>
                    </>
                  )}
                </div>
                <div style={{
                  padding: '12px',
                  fontSize: '8px',
                  color: '#e0fff7',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
                  letterSpacing: '0.5px'
                }}>
                  SELF-CUSTODIAL • MORE CONTROL
                </div>
              </button>

              {/* Info Panel */}
              <div
                style={{
                  marginTop: '10px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #2d2d30 0%, #1e1e1e 100%)',
                  border: '2px inset #404040',
                  borderRadius: '4px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{
                  fontSize: '9px',
                  fontFamily: "'Press Start 2P', 'w95fa', monospace",
                  color: '#00ff00',
                  marginBottom: '10px',
                  textShadow: '0 0 5px rgba(0,255,0,0.5)',
                  letterSpacing: '1px'
                }}>
                  📋 WALLET INFO:
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'w95fa, "Courier New", monospace',
                  color: '#00ffff',
                  lineHeight: '1.6',
                  textShadow: '0 0 3px rgba(0,255,255,0.3)',
                  paddingLeft: '15px'
                }}>
                  • <span style={{color: '#00d4aa'}}>Flow Wallet</span> - Self-custody wallet app<br/>
                  • Download from App Store or Google Play
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <Button 
                onClick={onClose}
                style={{
                  padding: '8px 24px',
                  fontFamily: 'w95fa, "Courier New", monospace',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </WindowContent>
      </Window>
    </div>
  );
};

export default WalletConnectionModal;

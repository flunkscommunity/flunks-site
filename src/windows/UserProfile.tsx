import React, { useState } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo } from '../hooks/useLocker';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const UserProfile: React.FC = () => {
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error } = useLockerInfo();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();

  const isConnected = !!primaryWallet?.address;
  const lockerNumber = lockerInfo?.locker_number || null;

  const handleConnectWallet = () => {
    setShowAuthFlow(true);
    setShowLoginWindow(false);
  };

  return (
    <DraggableResizeableWindow
      headerTitle="My Locker"
      windowsId={WINDOW_IDS.USER_PROFILE}
      onClose={() => closeWindow(WINDOW_IDS.USER_PROFILE)}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Locker Interior */}
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #ecf0f1 0%, #bdc3c7 100%)',
          border: '3px solid #95a5a6',
          borderRadius: '8px',
          position: 'relative',
          padding: '20px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
        }}>
          
          {/* Locker Number Plate */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#34495e',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px',
            border: '2px solid #2c3e50'
          }}>
            {loading ? 'LOADING...' : 
             error ? 'ERROR' :
             lockerNumber ? `LOCKER #${lockerNumber}` :
             isConnected ? 'ASSIGNING LOCKER...' :
             'CONNECT WALLET'}
          </div>

          {/* Empty Locker Content */}
          <div style={{
            width: '100%',
            height: '80%',
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}>
            
            {/* Status Message */}
            <div style={{
              textAlign: 'center',
              color: '#7f8c8d',
              fontSize: '16px',
              fontStyle: 'italic'
            }}>
              {loading ? 'Loading your locker...' :
               error ? `Error: ${error}` :
               !isConnected ? 'Connect Flow wallet to access your locker' :
               lockerNumber ? 'Your locker is empty' :
               'Setting up your locker...'}
            </div>

            {/* Connect Wallet or Login Window Button */}
            {!isConnected ? (
              <button
                onClick={() => setShowLoginWindow(!showLoginWindow)}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#2980b9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#3498db';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {showLoginWindow ? 'Close Login' : 'Connect Flow Wallet to Store Items'}
              </button>
            ) : lockerNumber && (
              <div style={{
                textAlign: 'center',
                color: '#27ae60',
                fontSize: '14px',
                background: 'rgba(39, 174, 96, 0.1)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(39, 174, 96, 0.3)'
              }}>
                ✅ Flow wallet connected • Locker #{lockerNumber} assigned
              </div>
            )}

            {/* Login Window */}
            {showLoginWindow && !isConnected && (
              <div style={{
                width: '90%',
                maxWidth: '300px',
                background: 'white',
                border: '2px solid #bdc3c7',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <h3 style={{
                  margin: '0 0 15px 0',
                  color: '#2c3e50',
                  textAlign: 'center',
                  fontSize: '18px'
                }}>
                  Connect Your Flow Wallet
                </h3>
                
                <p style={{
                  color: '#7f8c8d',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  lineHeight: '1.4'
                }}>
                  Connect your Flow wallet to get assigned a locker number and store your digital items.
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <button 
                    onClick={handleConnectWallet}
                    style={{
                      background: '#00EF8B',
                      color: 'black',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🌊 Connect Flow Wallet (Lilico)
                  </button>
                  
                  <button 
                    onClick={handleConnectWallet}
                    style={{
                      background: '#4285F4',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🔷 Connect Blocto
                  </button>
                  
                  <button 
                    onClick={handleConnectWallet}
                    style={{
                      background: '#1A1A1A',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ⚡ Connect Dapper
                  </button>
                </div>

                <button
                  onClick={() => setShowLoginWindow(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #bdc3c7',
                    color: '#7f8c8d',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '15px'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Locker Interior Details */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            height: '30px',
            background: 'linear-gradient(90deg, transparent 0%, #95a5a6 20%, #95a5a6 80%, transparent 100%)',
            borderRadius: '15px'
          }} />

          {/* Air Vents */}
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                width: '40px',
                height: '3px',
                background: '#95a5a6',
                borderRadius: '2px'
              }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

import React, { useState } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error } = useLockerInfo();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [devBypass, setDevBypass] = useState(false);

  const isConnected = !!primaryWallet?.address || devBypass;
  const lockerNumber = devBypass ? 999 : (lockerInfo?.locker_number || null);
  const isLoading = devBypass ? false : loading;

  const handleConnectWallet = () => {
    console.log('🔄 Triggering setShowAuthFlow...');
    if (!devBypass) {
      setShowAuthFlow(true);
    }
  };

  const toggleDevBypass = () => {
    if (process.env.NODE_ENV === 'development') {
      setDevBypass(!devBypass);
    }
  };

  const handleCreateProfile = () => {
    alert('Welcome Flunks holder! 🎉\n\nTo get your locker assigned automatically:\n\n1. Join our Discord server\n2. Use the #get-locker channel\n3. Your locker will be assigned within 24 hours\n\nWallet: ' + (primaryWallet?.address?.slice(0, 12) || 'N/A') + '...');
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
          
          {/* Dev Bypass Button */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={toggleDevBypass}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: devBypass ? '#e74c3c' : '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1000
              }}
              title={devBypass ? 'Disable Dev Bypass' : 'Enable Dev Bypass'}
            >
              {devBypass ? 'DEV ON' : 'DEV'}
            </button>
          )}
          
          {/* Locker Number Plate */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: devBypass ? '#e74c3c' : '#34495e',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px',
            border: '2px solid #2c3e50'
          }}>
            {isLoading ? 'LOADING...' : 
             error ? 'ERROR' :
             lockerNumber ? 'LOCKER #' + lockerNumber + (devBypass ? ' (DEV)' : '') :
             isConnected ? 'ASSIGNING LOCKER...' :
             'CONNECT WALLET'}
          </div>

          {/* Main Content */}
          {!isConnected ? (
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
              <div style={{
                textAlign: 'center',
                color: '#7f8c8d',
                fontSize: '16px',
                fontStyle: 'italic'
              }}>
                Connect Flow wallet to access your locker
              </div>

              <button
                onClick={handleConnectWallet}
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
                  transition: 'all 0.3s ease',
                  marginBottom: '10px',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 100
                }}
              >
                Connect Flow Wallet to Store Items
              </button>

              {/* Alternative: Direct Dynamic Connect Button */}
              <div style={{ marginBottom: '10px' }}>
                <DynamicConnectButton>
                  <div style={{
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 100
                  }}>
                    🌊 Alternative: Direct Connect
                  </div>
                </DynamicConnectButton>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  textAlign: 'center',
                  color: '#95a5a6',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  marginTop: '10px'
                }}>
                  💡 Click "DEV" button to bypass login for testing
                </div>
              )}
            </div>
          ) : !lockerNumber && primaryWallet?.address && !devBypass ? (
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
              <div style={{
                textAlign: 'center',
                color: '#e67e22',
                fontSize: '14px',
                background: 'rgba(230, 126, 34, 0.1)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(230, 126, 34, 0.3)',
                marginBottom: '15px'
              }}>
                ⚠️ Wallet connected but no locker assigned
                <br />
                <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
                  Wallet: {primaryWallet.address.slice(0, 12)}...
                </span>
              </div>
              
              <button
                onClick={handleCreateProfile}
                style={{
                  background: '#27ae60',
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
              >
                🔐 Get Your Locker
              </button>
            </div>
          ) : (
            /* 3-Section Locker Design */
            <div style={{
              width: '100%',
              height: '100%',
              marginTop: '45px',
              display: 'flex',
              position: 'relative',
              gap: '10px'
            }}>
              {/* Left Side - Main 3 Sections */}
              <div style={{
                width: '65%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                
                {/* Top Section - Letter Jacket */}
                <div style={{
                  height: '30%',
                  background: 'linear-gradient(180deg, #d5dbdb 0%, #aeb6bf 100%)',
                  borderRadius: '6px',
                  position: 'relative',
                  border: '2px solid #85929e',
                  overflow: 'hidden',
                  padding: '8px'
                }}>
                  {/* Jacket Hook */}
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '15px',
                    height: '6px',
                    background: '#5d6d7e',
                    borderRadius: '3px'
                  }} />
                  
                  {/* Letter Jacket */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    borderRadius: '6px 6px 8px 8px',
                    border: '2px solid #1b2631',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      color: '#ecf0f1',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: 'Arial, sans-serif',
                      position: 'relative'
                    }}>
                      F
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '8px',
                        height: '8px',
                        background: '#f39c12',
                        borderRadius: '50%',
                        border: '1px solid #d68910'
                      }} />
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  <div style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '5px',
                    display: 'flex',
                    gap: '3px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: '#2c3e50',
                      borderRadius: '50%',
                      border: '2px solid #ecf0f1',
                      cursor: 'pointer'
                    }} />
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: '#e91e63',
                      borderRadius: '50%',
                      border: '1px solid #ad1457',
                      cursor: 'pointer'
                    }} />
                  </div>
                  
                  <button style={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '3px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '2px 5px',
                    borderRadius: '2px',
                    fontSize: '8px',
                    cursor: 'pointer'
                  }}>
                    ✨
                  </button>
                </div>

                {/* Middle Section - 90s Counters */}
                <div style={{
                  height: '40%',
                  background: 'linear-gradient(180deg, #d5dbdb 0%, #aeb6bf 100%)',
                  borderRadius: '6px',
                  border: '2px solid #85929e',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {/* Gum Counter */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)',
                    padding: '6px',
                    borderRadius: '4px',
                    minWidth: '40px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #ff4081'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>🍬</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>Gum</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>0</div>
                  </div>

                  {/* Flunks Counter */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                    padding: '6px',
                    borderRadius: '4px',
                    minWidth: '40px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #26d0ce'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>👾</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>Flunks</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>0</div>
                  </div>

                  {/* Backpacks Counter */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #95e1d3 0%, #fce38a 100%)',
                    padding: '6px',
                    borderRadius: '4px',
                    minWidth: '40px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #7dd3fc'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>🎒</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#2c3e50' }}>Bags</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>0</div>
                  </div>
                </div>

                {/* Bottom Section - Future Clique */}
                <div style={{
                  height: '25%',
                  background: 'linear-gradient(180deg, #d5dbdb 0%, #aeb6bf 100%)',
                  borderRadius: '6px',
                  border: '2px solid #85929e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#85929e',
                  fontSize: '11px',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  🏫 Clique features coming soon...
                  <br />
                  <span style={{ fontSize: '9px' }}>Join your class & earn rewards</span>
                </div>
              </div>

              {/* Right Side - Door Interior */}
              <div style={{
                width: '35%',
                height: '100%',
                background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '3px solid #adb5bd',
                borderRadius: '6px',
                position: 'relative',
                padding: '8px',
                overflow: 'hidden'
              }}>
                {/* Mirror */}
                <div style={{
                  width: '100%',
                  height: '35%',
                  background: 'linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 100%)',
                  border: '2px solid #85c1e9',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  color: '#5499c7',
                  textAlign: 'center',
                  boxShadow: 'inset 0 0 10px rgba(84, 153, 199, 0.3)'
                }}>
                  <div>
                    Mirror
                    <br />
                    💄✨
                  </div>
                </div>

                {/* 90s Poster */}
                <div style={{
                  width: '100%',
                  height: '55%',
                  background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  color: '#7d6608',
                  textAlign: 'center',
                  position: 'relative',
                  border: '2px solid #d68910',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ marginBottom: '4px' }}>90s Poster</div>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>🎵📺</div>
                  <div style={{ fontSize: '8px', fontStyle: 'italic' }}>Customize your vibe</div>
                  
                  <button style={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '3px',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    fontSize: '7px',
                    cursor: 'pointer'
                  }}>
                    📸
                  </button>
                </div>

                {/* Shelf */}
                <div style={{
                  position: 'absolute',
                  bottom: '5px',
                  left: '8px',
                  right: '8px',
                  height: '20px',
                  background: '#95a5a6',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  color: '#2c3e50'
                }}>
                  📚 Shelf space
                </div>
              </div>
            </div>
          )}

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
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

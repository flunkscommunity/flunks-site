import React, { useState } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';

const UserProfile: React.FC = () => {
  const [showLoginWindow, setShowLoginWindow] = useState(false);

  return (
    <DraggableResizeableWindow
      headerTitle="My Locker"
      windowsId={WINDOW_IDS.USER_PROFILE}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #ecf0f1 0%, #bdc3c7 100%)',
        border: '3px solid #95a5a6',
        borderRadius: '8px',
        position: 'relative',
        padding: '20px',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        fontFamily: 'Arial, sans-serif'
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
          LOCKER #247
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
          
          {/* Empty State Message */}
          <div style={{
            textAlign: 'center',
            color: '#7f8c8d',
            fontSize: '16px',
            fontStyle: 'italic'
          }}>
            Your locker is empty
          </div>

          {/* Login Window Button */}
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
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            {showLoginWindow ? 'Close Login' : 'Connect Wallet to Store Items'}
          </button>

          {/* Login Window */}
          {showLoginWindow && (
            <div style={{
              width: '90%',
              maxWidth: '300px',
              background: 'white',
              border: '2px solid #bdc3c7',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#2c3e50',
                textAlign: 'center',
                fontSize: '18px'
              }}>
                Connect Your Wallet
              </h3>
              
              <p style={{
                color: '#7f8c8d',
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}>
                Connect your wallet to store and access your digital items in this locker.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <button style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  🦊 Connect MetaMask
                </button>
                
                <button style={{
                  background: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  👻 Connect Phantom
                </button>
                
                <button style={{
                  background: '#34495e',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  🔗 Other Wallets
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
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

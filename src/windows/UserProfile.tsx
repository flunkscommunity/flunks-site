import React, { useState } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo } from '../hooks/useLocker';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error } = useLockerInfo();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [devBypass, setDevBypass] = useState(false);

  const isConnected = !!primaryWallet?.address || devBypass;
  // In dev mode, immediately show locker as assigned and skip loading
  const lockerNumber = devBypass ? 999 : (lockerInfo?.locker_number || null);
  const isLoading = devBypass ? false : loading;

  const handleConnectWallet = () => {
    setShowAuthFlow(true);
  };

  const handleDevBypass = () => {
    setDevBypass(!devBypass);
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
          
          {/* Dev Bypass Button - Only show in dev mode */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleDevBypass}
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
             lockerNumber ? `LOCKER #${lockerNumber}${devBypass ? ' (DEV)' : ''}` :
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
              {isLoading ? 'Loading your locker...' :
               error ? `Error: ${error}` :
               !isConnected ? 'Connect Flow wallet to access your locker' :
               lockerNumber ? (devBypass ? 'Your locker is empty (Dev Mode)' : 'Your locker is empty') :
               'Setting up your locker...'}
            </div>

            {/* Connect Wallet Button */}
            {!isConnected ? (
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
                Connect Flow Wallet to Store Items
              </button>
            ) : lockerNumber && (
              <div style={{
                textAlign: 'center',
                color: devBypass ? '#e74c3c' : '#27ae60',
                fontSize: '14px',
                background: devBypass ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                padding: '10px',
                borderRadius: '6px',
                border: devBypass ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid rgba(39, 174, 96, 0.3)'
              }}>
                {devBypass ? '🔧 Dev Mode Active' : '✅ Flow wallet connected'} • Locker #{lockerNumber} assigned
              </div>
            )}

            {/* Dev Mode Instructions */}
            {process.env.NODE_ENV === 'development' && !isConnected && (
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

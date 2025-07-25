import React from 'react';
import { Button, Frame } from 'react95';
import { useTrialMode } from 'contexts/TrialModeContext';
import { useUserProfile } from 'contexts/UserProfileContext';
import styled from 'styled-components';

const TrialBanner = styled(Frame)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-bottom: 3px solid #d55300;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  font-family: 'Courier New', monospace;
  animation: slideDown 0.5s ease-out;
  
  @keyframes slideDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
`;

const TrialContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
`;

const TrialInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const TrialActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const TrialModeBanner: React.FC = () => {
  const { isTrialMode, setTrialMode, mockWallet, connectTrialWallet, disconnectTrialWallet, restartTrialMode } = useTrialMode();
  const { clearProfile } = useUserProfile();

  const handleRestart = () => {
    // Clear profile context first
    clearProfile();
    
    // Clear all trial-related data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('trial-profile-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear all trial-related data from sessionStorage
    sessionStorage.removeItem('trial-wallet');
    sessionStorage.removeItem('trial-user');
    sessionStorage.removeItem('trial-mode-dismissed');
    sessionStorage.removeItem('trial-welcome-shown');
    sessionStorage.removeItem('trial-mode-enabled');
    sessionStorage.removeItem('user-profile');
    
    // Clear any other profile-related data
    localStorage.removeItem('user-profile');
    
    // Restart trial mode
    restartTrialMode();
    
    // Reload the page to ensure completely clean state
    window.location.reload();
  };

  if (!isTrialMode) return null;

  return (
    <TrialBanner variant="window">
      <TrialContent>
        <TrialInfo>
          <span style={{ fontSize: '18px' }}>🚀</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              TRIAL MODE ACTIVE
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {mockWallet 
                ? `Connected: ${mockWallet.address.slice(0, 8)}... (Demo Wallet)`
                : 'Experience Flunks without wallet connection'
              }
            </div>
          </div>
        </TrialInfo>
        
        <TrialActions>
          {!mockWallet ? (
            <Button
              onClick={connectTrialWallet}
              style={{
                background: '#fff',
                color: '#ff6b35',
                border: '2px solid #fff',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              🔗 Connect Trial Wallet
            </Button>
          ) : (
            <Button
              onClick={disconnectTrialWallet}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.3)',
                fontSize: '12px'
              }}
            >
              🔌 Disconnect
            </Button>
          )}
          
          <Button
            onClick={handleRestart}
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: '2px solid #45a049',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            🔄 Restart Trial
          </Button>
          
          <Button
            onClick={() => setTrialMode(false)}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.5)',
              fontSize: '12px'
            }}
          >
            ✕ Exit Trial
          </Button>
        </TrialActions>
      </TrialContent>
    </TrialBanner>
  );
};

export default TrialModeBanner;

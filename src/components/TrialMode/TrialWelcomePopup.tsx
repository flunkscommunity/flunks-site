import React, { useEffect, useState } from 'react';
import { Button, Frame, Window, WindowHeader, WindowContent } from 'react95';
import { useTrialMode } from 'contexts/TrialModeContext';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import LockerSystemNew from 'windows/LockerSystemNew';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #4a9c59, #5fb370);
  color: white;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
`;

const FeatureList = styled.div`
  text-align: left;
  background: rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
`;

const TrialWelcomePopup: React.FC = () => {
  const { isTrialMode, mockWallet, connectTrialWallet } = useTrialMode();
  const { openWindow, closeWindow } = useWindowsContext();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Auto-show welcome popup when trial mode is first activated
    if (isTrialMode && !hasShownWelcome && !sessionStorage.getItem('trial-welcome-shown')) {
      const timer = setTimeout(() => {
        openWindow({
          key: 'trial-welcome',
          window: <TrialWelcomeWindow onClose={() => closeWindow('trial-welcome')} />
        });
        setHasShownWelcome(true);
        sessionStorage.setItem('trial-welcome-shown', 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isTrialMode, hasShownWelcome, openWindow, closeWindow]);

  return null; // This component only manages the popup logic
};

interface TrialWelcomeWindowProps {
  onClose: () => void;
}

const TrialWelcomeWindow: React.FC<TrialWelcomeWindowProps> = ({ onClose }) => {
  const { connectTrialWallet, mockWallet } = useTrialMode();
  const { openWindow } = useWindowsContext();

  const handleStartTrial = () => {
    if (!mockWallet) {
      connectTrialWallet();
    }
    onClose();
    
    // Auto-open profile creation after a short delay
    setTimeout(() => {
      openWindow({
        key: WINDOW_IDS.USER_PROFILE,
        window: <LockerSystemNew />
      });
    }, 500);
  };

  const handleExploreFirst = () => {
    if (!mockWallet) {
      connectTrialWallet();
    }
    onClose();
  };

  return (
    <Window
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        zIndex: 10000
      }}
    >
      <WindowHeader>
        <span>🚀 Welcome to Flunks Trial Mode!</span>
      </WindowHeader>
      <WindowContent>
        <WelcomeContainer>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            🎮 Experience the Full Flunks Platform!
          </div>
          
          <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
            You're viewing Flunks in Trial Mode - perfect for testing without wallet connections!
          </div>

          <FeatureList>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>✨ What you can try:</div>
            <div>🎯 Create a retro RPG-style profile</div>
            <div>🎵 Listen to Flunks FM radio stations</div>
            <div>🏫 Explore the virtual school campus</div>
            <div>🎮 Play games like Flappy Flunk</div>
            <div>💬 Test the messenger system</div>
            <div>🖼️ Browse the Flunk Creator tools</div>
          </FeatureList>

          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            All your trial data is saved locally - no blockchain required!
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={handleStartTrial}
              style={{
                background: '#fff',
                color: '#4a9c59',
                border: '2px solid #fff',
                fontWeight: 'bold',
                padding: '10px 20px',
                fontSize: '16px'
              }}
            >
              🚀 Start with Profile Creation
            </Button>
            
            <Button
              onClick={handleExploreFirst}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.5)',
                padding: '10px 20px',
                fontSize: '16px'
              }}
            >
              🔍 Explore First
            </Button>
          </div>

          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
            Ready to join for real? Connect your Flow wallet anytime!
          </div>
        </WelcomeContainer>
      </WindowContent>
    </Window>
  );
};

export default TrialWelcomePopup;

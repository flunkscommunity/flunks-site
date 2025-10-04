import React, { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import * as fcl from '@onflow/fcl';
import styled from 'styled-components';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import FlunkyUppyLeaderboardWindow from './FlunkyUppyLeaderboardWindow';

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const GameFrame = styled.div`
  flex: 1;
  width: 100%;
  background: #000;
  position: relative;
  overflow: hidden;
`;

const GameIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const StartScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/Games/Flunky Uppy/start-screens/start-screen.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 10;
  cursor: pointer;
  transition: opacity 0.3s ease;
  padding-bottom: 40px;
`;

const StartTitle = styled.h1`
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 30px #00ffff;
  letter-spacing: 3px;
`;

const StartButton = styled.div`
  background: rgba(255, 71, 87, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 15px 30px;
  color: white;
  font-family: 'Orbitron', monospace;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 6px 20px rgba(0,0,0,0.4),
    inset 0 1px 2px rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  &:hover {
    background: rgba(255, 71, 87, 0.95);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0,0,0,0.5),
      inset 0 1px 2px rgba(255,255,255,0.3);
  }
  
  &:active {
    transform: translateY(0px);
  }
`;

const Instructions = styled.div`
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-align: center;
  margin-top: 30px;
  text-shadow: 0 0 5px #00ffff;
  line-height: 1.5;
`;

const SfxButton = styled.div<{ isOn: boolean }>`
  background: ${props => props.isOn ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'};
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  margin-top: 15px;
  cursor: pointer;
  text-transform: uppercase;
  
  &:hover {
    background: ${props => props.isOn ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0px);
  }
`;

const LeaderboardButton = styled.div`
  background: rgba(255, 215, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  margin-top: 15px;
  cursor: pointer;
  text-transform: uppercase;
  
  &:hover {
    background: rgba(255, 215, 0, 0.9);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0px);
  }
`;

const FlunkJumpWindow = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const { openWindow, closeWindow } = useWindowsContext();
  const { mutate } = useSWRConfig();

  const openLeaderboard = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the start game
    openWindow({
      key: WINDOW_IDS.FLUNKY_UPPY_LEADERBOARD,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FLUNKY_UPPY_LEADERBOARD}
          onClose={() => closeWindow(WINDOW_IDS.FLUNKY_UPPY_LEADERBOARD)}
          headerTitle="Flunky Uppy Leaderboard"
          initialWidth="500px"
          initialHeight="600px"
          headerIcon="/images/icons/flunky-uppy-icon.png"
        >
          <FlunkyUppyLeaderboardWindow />
        </DraggableResizeableWindow>
      ),
    });
  };

  useEffect(() => {
    // Score submission handler for Flunky Uppy
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'FLUNKY_UPPY_SCORE') {
        const score = event.data.score;
        console.log('🦘 Flunky Uppy score received:', score);
        
        fcl.currentUser().snapshot().then((user: any) => {
          console.log('👤 User authentication check:', { 
            hasUser: !!user, 
            hasAddr: !!user?.addr, 
            addr: user?.addr?.substring(0, 10) + '...' 
          });
          
          const wallet = user?.addr;
          if (!wallet) {
            console.warn('❌ No wallet connected - score not submitted for score:', score);
            return;
          }
          
          console.log('📮 Submitting Flunky Uppy score to database:', { wallet: wallet.substring(0, 10) + '...', score });
          
          // Generate username from wallet address
          const username = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
          
          // Submit score to Flunky Uppy API endpoint
          fetch('/api/flunky-uppy-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet, score, username }),
          })
          .then(response => {
            console.log('📊 Flunky Uppy score submission response status:', response.status);
            if (!response.ok) {
              return response.text().then(text => {
                throw new Error(`Score API Error ${response.status}: ${text}`);
              });
            }
            return response.json();
          })
          .then(data => {
            console.log('✅ Flunky Uppy score submitted successfully to leaderboard:', data);
            // Proactively refresh the leaderboard cache so repeated higher scores appear immediately
            try {
              mutate('/api/flunky-uppy-leaderboard');
              console.log('🔄 Leaderboard revalidated after score submission');
            } catch (e) {
              console.log('⚠️ Failed to trigger leaderboard refresh:', e);
            }
          })
          .catch(error => {
            console.error('❌ Flunky Uppy score submission failed:', error);
          });
        }).catch(authError => {
          console.error('❌ Flow authentication error:', authError);
        });
      }
      
      // Handle leaderboard opening request from game
      if (event.data?.type === 'FLUNKY_UPPY_OPEN_LEADERBOARD') {
        console.log('🏆 Opening Flunky Uppy leaderboard from game');
        openLeaderboard({ stopPropagation: () => {} } as React.MouseEvent);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const startGame = () => {
    setGameStarted(true);
    console.log('🦘 Flunky Uppy game started - removing overlay!');
    
    // Also trigger the game start in the iframe (in case it didn't auto-start)
    setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Flunky Uppy Game"]') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          // Focus the iframe so keyboard controls work immediately
          iframe.focus();
          console.log('🎯 Focused iframe for keyboard controls');
          
          // Send message to start audio and game
          iframe.contentWindow.postMessage({
            type: 'START_GAME_WITH_AUDIO'
          }, '*');
          console.log('🎵 Sent start game with audio message');
          
          // Try to call the game's start function (fallback)
          (iframe.contentWindow as any).startFlunkJump?.();
          console.log('🎮 Called game start function');
        } catch (e) {
          console.log('Could not access iframe content:', e);
        }
      }
    }, 100);
  };

  const toggleSfx = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the start game function
    setSfxEnabled(!sfxEnabled);
    console.log('🔊 SFX toggled:', !sfxEnabled ? 'ON' : 'OFF');
    
    // Send SFX setting to the game iframe
    setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Flunky Uppy Game"]') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ 
            type: 'SFX_TOGGLE', 
            enabled: !sfxEnabled 
          }, '*');
        } catch (e) {
          console.log('Could not send SFX setting to game:', e);
        }
      }
    }, 100);
  };

  return (
    <GameContainer>
      {!gameStarted && (
        <StartScreen onClick={startGame}>
          <StartButton>CLICK TO START</StartButton>
          <SfxButton isOn={sfxEnabled} onClick={toggleSfx}>
            SFX: {sfxEnabled ? 'ON' : 'OFF'}
          </SfxButton>
          <LeaderboardButton onClick={openLeaderboard}>
            🏆 LEADERBOARD
          </LeaderboardButton>
        </StartScreen>
      )}
      
      <GameFrame>
        <GameIframe 
          src="/Games/Flunky Uppy/index.html"
          title="Flunky Uppy Game"
          tabIndex={0}
        />
      </GameFrame>
    </GameContainer>
  );
};

export default FlunkJumpWindow;
import styled from "styled-components";
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import TiltedGridLoader from "components/TiltedGridLoader";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUnifiedWallet } from "contexts/UnifiedWalletContext";
import { useCliqueAccess, CliqueType } from "hooks/useCliqueAccess";
import MySpaceProfile from "../components/MySpaceProfile";
import { useMusicContext } from "../contexts/MusicContext";
import Image from "next/image";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40px;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%);
  background-size: 400px 400px, 300px 300px, 200px 200px, 100% 100%;
  background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  animation: backgroundPulse 4s ease-in-out infinite alternate;
  
  @media (max-width: 768px) {
    padding: 20px 10px 100px 10px; /* Add extra bottom padding for mobile */
    min-height: 100vh;
    justify-content: flex-start;
  }

  @keyframes backgroundPulse {
    0% {
      background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%;
    }
    100% {
      background-position: 10% 10%, 90% 90%, 60% 40%, 0% 0%;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.1) 49%, rgba(0, 255, 255, 0.1) 51%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(255, 0, 255, 0.1) 49%, rgba(255, 0, 255, 0.1) 51%, transparent 52%);
    background-size: 60px 60px, 60px 60px;
    animation: gridMove 8s linear infinite;
    pointer-events: none;
  }

  @keyframes gridMove {
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 60px 60px, -60px 60px; }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    margin-bottom: 40px;
    margin-top: 20px;
  }
`;

const HeaderText = styled.h1`
  font-family: 'Press Start 2P', monospace;
  color: #00ffff;
  font-size: 48px;
  text-align: center;
  text-shadow: 
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 30px #00ffff,
    0 0 40px #00ffff;
  margin: 0;
  animation: flashingText 1.5s ease-in-out infinite alternate;
  position: relative;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 20px;
    white-space: normal;
    line-height: 1.3;
    word-spacing: 100vw; /* Force each word to its own line */
  }
  
  @media (max-width: 600px) {
    font-size: 18px;
  }
  
  @keyframes flashingText {
    0% {
      color: #00ffff;
      text-shadow: 
        0 0 10px #00ffff,
        0 0 20px #00ffff,
        0 0 30px #00ffff,
        0 0 40px #00ffff;
      transform: scale(1);
    }
    100% {
      color: #ff00ff;
      text-shadow: 
        0 0 10px #ff00ff,
        0 0 20px #ff00ff,
        0 0 30px #ff00ff,
        0 0 40px #ff00ff;
      transform: scale(1.05);
    }
  }

  &::before {
    content: 'SELECT YOUR PROFILE';
    position: absolute;
    top: 2px;
    left: 2px;
    color: rgba(255, 255, 255, 0.1);
    z-index: -1;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const CharacterGrid = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1600px;
  z-index: 2;
  position: relative;
  
  @media (max-width: 768px) {
    gap: 20px;
    flex-direction: column;
    align-items: center;
    padding: 0 10px;
  }
`;

const CharacterSlot = styled.div<{ locked: boolean }>`
  position: relative;
  width: 300px;
  height: 640px;
  border: 6px solid ${props => props.locked ? '#444' : '#00ffff'};
  border-radius: 24px;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: ${props => props.locked 
    ? 'linear-gradient(135deg, #1a1a1a, #333)' 
    : 'linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(0, 255, 255, 0.05))'
  };
  filter: ${props => props.locked ? 'grayscale(100%)' : 'none'};
  opacity: ${props => props.locked ? 0.5 : 1};
  overflow: hidden;
  box-shadow: ${props => props.locked 
    ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
    : '0 8px 40px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)'
  };
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff);
    border-radius: 26px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    ${props => !props.locked && `
      border-color: #ff00ff;
      box-shadow: 
        0 0 40px rgba(255, 0, 255, 0.6),
        0 0 80px rgba(0, 255, 255, 0.4),
        inset 0 0 40px rgba(255, 0, 255, 0.1);
      transform: translateY(-10px) scale(1.08);
      
      &::before {
        opacity: 0.7;
        animation: borderPulse 1s ease-in-out infinite alternate;
      }
    `}
  }

  @keyframes borderPulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.02); }
  }
  
  &:active {
    ${props => !props.locked && `
      transform: translateY(-5px) scale(1.05);
    `}
  }
  
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    max-width: 280px;
    height: 450px;
  }
`;

const CharacterImage = styled.div`
  width: 100%;
  height: 85%;
  position: relative;
  overflow: hidden;
`;

const CharacterLabel = styled.div<{ locked: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  background: ${props => props.locked 
    ? 'linear-gradient(90deg, #333, #555)' 
    : 'linear-gradient(90deg, #00ffff, #ff00ff)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: ${props => props.locked ? '#888' : '#000'};
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: ${props => props.locked ? 'none' : '2px 2px 4px rgba(0, 0, 0, 0.8)'};
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LockOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #666;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  text-align: center;
  z-index: 10;
`;

const WalletStatus = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00ffff;
  border-radius: 8px;
  padding: 10px 15px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #00ffff;
  z-index: 3;
  
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 20px;
    font-size: 10px;
    padding: 8px 12px;
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  border: 3px solid #ff0000;
  border-radius: 12px;
  padding: 30px;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fff;
  text-align: center;
  max-width: 80%;
  z-index: 100;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 20px;
  }
`;

const LoadingMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 255, 255, 0.2);
  border: 3px solid #00ffff;
  border-radius: 12px;
  padding: 30px;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #00ffff;
  text-align: center;
  z-index: 100;
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 20px;
  }
`;


const ParticleField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const Particle = styled.div<{ delay: number; size: number; duration: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  border-radius: 50%;
  animation: floatUp ${props => props.duration}s infinite linear;
  animation-delay: ${props => props.delay}s;
  opacity: 0.6;
  
  @keyframes floatUp {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    90% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(-100px) rotate(360deg);
      opacity: 0;
    }
  }
`;

const ScanLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: scanDown 3s ease-in-out infinite;
  z-index: 4;
  
  @keyframes scanDown {
    0% {
      top: 0%;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }
`;

const StarField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
`;

const Star = styled.div<{ delay: number; size: number; duration: number; x: number; y: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: #fff;
  border-radius: 50%;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  animation: twinkle ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 ${props => props.size * 2}px rgba(255, 255, 255, 0.8);
  
  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.5);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${props => props.size * 4}px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    transform: translate(-50%, -50%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: ${props => props.size * 4}px;
    background: linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    transform: translate(-50%, -50%);
  }
`;

const MovingStar = styled.div<{ delay: number; size: number; duration: number; startY: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  border-radius: 50%;
  top: ${props => props.startY}%;
  left: -10px;
  animation: moveAcrossScreen ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 ${props => props.size * 3}px rgba(0, 255, 255, 0.6);
  
  @keyframes moveAcrossScreen {
    0% {
      left: -10px;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      left: calc(100% + 10px);
      opacity: 0;
    }
  }
`;

const characterSlots = [
  { clique: "the-nerds", imageId: "images/myplace/myplace-geek", label: "Geek", color: "#059669" },
  { clique: "the-preps", imageId: "images/myplace/myspace-prep", label: "Prep", color: "#ff69b4" },
  { clique: "the-jocks", imageId: "images/myplace/myplace-jock", label: "Jock", color: "#1e3a8a" },
  { clique: "the-freaks", imageId: "images/myplace/myplace-freak", label: "Freak", color: "#2c1810" },
];

const MyPlace = () => {
  const { closeWindow, openWindow, windowApps, windows } = useWindowsContext();
  const { user, primaryWallet } = useDynamicContext();
  const { isConnected, address: unifiedAddress } = useUnifiedWallet();
  const { hasAccess, loading: cliqueLoading, error: cliqueError } = useCliqueAccess();
  
  // Use unified wallet for mobile compatibility
  const walletAddress = unifiedAddress || primaryWallet?.address;
  const { stopAllMusic } = useMusicContext();

  // Generate retro sound effects
  const playRetroSound = (type: 'hover' | 'select') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'hover') {
      // Quick ascending beep
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else {
      // Selection sound - three ascending tones
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  // Generate particles for retro effect
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push(
        <Particle
          key={i}
          delay={Math.random() * 10}
          size={Math.random() * 4 + 1}
          duration={Math.random() * 8 + 12}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      );
    }
    return particles;
  };

  // Generate twinkling stars
  const generateStars = () => {
    const stars = [];
    // Static twinkling stars
    for (let i = 0; i < 50; i++) {
      stars.push(
        <Star
          key={`static-${i}`}
          delay={Math.random() * 3}
          size={Math.random() * 2 + 1}
          duration={Math.random() * 3 + 2}
          x={Math.random() * 100}
          y={Math.random() * 100}
        />
      );
    }
    // Moving stars across screen
    for (let i = 0; i < 15; i++) {
      stars.push(
        <MovingStar
          key={`moving-${i}`}
          delay={Math.random() * 8}
          size={Math.random() * 3 + 2}
          duration={Math.random() * 6 + 8}
          startY={Math.random() * 100}
        />
      );
    }
    return stars;
  };

  const userHasTrait = (clique: string) => {
    // All cliques are now accessible without NFT ownership
    return true;
  };

  const handleCharacterClick = (character: typeof characterSlots[0]) => {
    const locked = !userHasTrait(character.clique);
    
    if (locked) {
      // Play error sound for locked characters
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Error sound - descending tone
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      return;
    }

    // Play selection sound
    playRetroSound('select');

    // Close all existing profile windows and stop current music
    const existingProfileKeys = Object.keys(windows).filter(key => key.endsWith('_profile'));
    existingProfileKeys.forEach(key => {
      console.log(`Closing existing profile: ${key}`);
      closeWindow(key);
    });
    
    // Stop any currently playing music
    stopAllMusic();
    
    // Small delay to ensure previous profile is closed and music stopped
    setTimeout(() => {
      // Open new MySpace-style profile page
      openWindow({
        key: `${character.clique}_profile`,
        window: (
          <DraggableResizeableWindow
            windowsId={`${character.clique}_profile`}
            headerTitle={`${character.label}'s MyPlace Profile`}
            onClose={() => closeWindow(`${character.clique}_profile`)}
            initialWidth="90%"
            initialHeight="90%"
            resizable={true}
          >
            <MySpaceProfile clique={character.clique} />
          </DraggableResizeableWindow>
        ),
      });
    }, 100);
  };

  return (
    <TiltedGridLoader>
      <DraggableResizeableWindow
        windowsId={WINDOW_IDS.MYPLACE}
        onClose={() => closeWindow(WINDOW_IDS.MYPLACE)}
        initialWidth="100%"
        initialHeight="100%"
        headerTitle="MyPlace - Select Your Profile"
        headerIcon="/images/icons/myplace.png"
        resizable={false}
        style={{
          transform: 'perspective(800px) rotateX(2deg)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        <Container>
          {/* Retro Effects */}
          <StarField>
            {generateStars()}
          </StarField>
          <ParticleField>
            {generateParticles()}
          </ParticleField>
          <ScanLine />
          
          <WalletStatus>
            Wallet: {walletAddress ? `${walletAddress.slice(0, 8)}...` : "Not connected"}
          </WalletStatus>
          
          {/* Show error message if there's an error */}
          {cliqueError && !cliqueLoading && (
            <ErrorMessage>
              ⚠️ ERROR<br /><br />
              {cliqueError}<br /><br />
              Please try refreshing the page
            </ErrorMessage>
          )}
          
          {/* Show loading state */}
          {cliqueLoading && (
            <LoadingMessage>
              ⏳ LOADING...<br /><br />
              Checking NFT access...
            </LoadingMessage>
          )}
          
          {/* Show main content when not loading and no errors */}
          {!cliqueLoading && !cliqueError && (
            <>
              <Header>
                <HeaderText>SELECT YOUR PROFILE</HeaderText>
              </Header>
              
              <CharacterGrid>
                {characterSlots.map((character) => {
                  const locked = !userHasTrait(character.clique);
                  return (
                    <CharacterSlot
                      key={character.clique}
                      locked={locked}
                      onClick={() => handleCharacterClick(character)}
                      onMouseEnter={() => !locked && playRetroSound('hover')}
                      title={locked ? `Requires ${character.label} NFT` : `Enter ${character.label} profile`}
                    >
                      <CharacterImage>
                        <Image
                          src={`/${character.imageId}.png`}
                          alt={character.label}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </CharacterImage>
                      <CharacterLabel locked={locked}>
                        {character.label}
                      </CharacterLabel>
                      {locked && (
                        <LockOverlay>
                          LOCKED
                        </LockOverlay>
                      )}
                    </CharacterSlot>
                  );
                })}
              </CharacterGrid>
            </>
          )}
        </Container>
      </DraggableResizeableWindow>
    </TiltedGridLoader>
  );
};

export default MyPlace;

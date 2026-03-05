/**
 * Mobile Splash Screen Component
 * CRT-style boot sequence for the Flunks mobile app
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDemoModeOptional } from '../contexts/DemoModeContext';

// Check if running on iOS (for demo mode - only needed for App Store review)
const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
    (userAgent.includes('mac') && 'ontouchend' in document);
};

const pulse = keyframes`
  0%, 100% {
    filter: brightness(1.2) drop-shadow(0 0 20px #33ff33);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.5) drop-shadow(0 0 40px #33ff33) drop-shadow(0 0 60px #33ff33);
    transform: scale(1.05);
  }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const flicker = keyframes`
  0% { opacity: 0.97; }
  50% { opacity: 1; }
  100% { opacity: 0.98; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const SplashContainer = styled.div<{ $fading: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0a0a;
  z-index: 99999;
  overflow: hidden;
  animation: ${props => props.$fading ? fadeOut : 'none'} 0.5s ease-out forwards;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.25) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 10;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    pointer-events: none;
    z-index: 11;
  }
`;

const Screen = styled.div`
  padding: 40px 20px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #33ff33;
  text-shadow: 0 0 10px #33ff33;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: ${flicker} 0.15s infinite;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (orientation: landscape) and (max-height: 500px) {
    padding: 12px 20px;
    font-size: 13px;
    justify-content: flex-start;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  @media (orientation: landscape) and (max-height: 500px) {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 24px;
    width: 100%;
    max-width: 100%;
  }
`;

const BootText = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: left;
  padding-left: 20px;

  @media (orientation: landscape) and (max-height: 500px) {
    max-width: 280px;
    flex-shrink: 0;
    font-size: 12px;
    padding-left: 10px;
  }
`;

const Line = styled.div<{ $visible: boolean }>`
  opacity: ${props => props.$visible ? 1 : 0};
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 4px;
  transition: opacity 0.1s;

  @media (orientation: landscape) and (max-height: 500px) {
    margin-bottom: 2px;
    font-size: 11px;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 16px;
  background: #33ff33;
  vertical-align: middle;
  margin-left: 4px;
  animation: ${blink} 0.8s infinite;
`;

const LogoContainer = styled.div<{ $visible: boolean }>`
  text-align: center;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s ease-out;

  @media (orientation: landscape) and (max-height: 500px) {
    margin-top: 0;
    flex-shrink: 1;
    min-width: 0;
  }
`;

const Logo = styled.img<{ $pulsing: boolean }>`
  width: min(180px, 45vw);
  height: auto;
  filter: brightness(1.2) drop-shadow(0 0 20px #33ff33);
  animation: ${props => props.$pulsing ? pulse : 'none'} 1.5s ease-in-out infinite;

  @media (orientation: landscape) and (max-height: 500px) {
    width: min(100px, 20vh);
  }
`;

const AsciiArt = styled.pre`
  font-family: 'Courier New', monospace;
  font-size: 8px;
  color: #33ff33;
  text-shadow: 0 0 10px #33ff33;
  white-space: pre;
  line-height: 1.1;
  text-align: center;
  margin-top: 15px;
  opacity: 0;
  transition: opacity 0.5s ease-out;
  
  &.visible {
    opacity: 1;
  }

  @media (orientation: landscape) and (max-height: 500px) {
    display: none;
  }
`;

const ReadyText = styled.div<{ $visible: boolean }>`
  font-size: 20px;
  margin-top: 20px;
  color: #33ff33;
  text-shadow: 0 0 20px #33ff33;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s ease-out;
  animation: ${props => props.$visible ? blink : 'none'} 1s infinite;

  @media (orientation: landscape) and (max-height: 500px) {
    font-size: 16px;
    margin-top: 10px;
  }
`;

const DemoButton = styled.button<{ $visible: boolean }>`
  margin-top: 24px;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid #ffaa00;
  color: #ffaa00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-shadow: 0 0 10px #ffaa00;
  cursor: pointer;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: all 0.3s ease;
  
  &:hover, &:active {
    background: rgba(255, 170, 0, 0.2);
    box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
  }
`;

const DemoModeLabel = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 8px;
  text-shadow: none;
`;

const BOOT_LINES = [
  'FLUNKS OS v2.0',
  '(C) 2026 Flunks',
  '',
  'Booting system...',
  '[OK] Flow Network: MAINNET',
  '[OK] Semester Zero: IN PROGRESS',
  '[OK] Flunks NFT: LOADED',
  '[OK] Backpacks: REMEMBER THOSE?',
  '',
  'Welcome to FLUNKS!',
];



const ASCII_LOGO = `
 ██████╗██╗     ██╗   ██╗███╗   ██╗██╗  ██╗███████╗
 ██╔════╝██║     ██║   ██║████╗  ██║██║ ██╔╝██╔════╝
 █████╗  ██║     ██║   ██║██╔██╗ ██║█████╔╝ ███████╗
 ██╔══╝  ██║     ██║   ██║██║╚██╗██║██╔═██╗ ╚════██║
 ██║     ███████╗╚██████╔╝██║ ╚████║██║  ██╗███████║
 ╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
`;

interface MobileSplashScreenProps {
  onComplete: () => void;
  onDemoMode?: () => void;
}

const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({ onComplete, onDemoMode }) => {
  const demoMode = useDemoModeOptional();
  const [visibleLines, setVisibleLines] = useState<boolean[]>(BOOT_LINES.map(() => false));
  const [typedLines, setTypedLines] = useState<string[]>(BOOT_LINES.map(() => ''));
  const [showLogo, setShowLogo] = useState(false);
  const [showAscii, setShowAscii] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [fading, setFading] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);
  
  const playTypeSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, []);
  
  const playBeep = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, []);
  
  const playBootSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  }, []);

  useEffect(() => {
    // Initialize audio
    initAudio();
    
    // Play boot sound
    setTimeout(() => playBootSound(), 100);
    
    // Type out each line
    let lineIndex = 0;
    let charIndex = 0;
    let totalDelay = 120;

    const charDelay = () => 12 + Math.random() * 8;
    const lineDelay = 70;
    
    const typeNextChar = () => {
      if (lineIndex >= BOOT_LINES.length) {
        // All lines done, show logo
        setTimeout(() => {
          setShowLogo(true);
          playBootSound();
        }, 200);
        setTimeout(() => setShowAscii(true), 600);
        setTimeout(() => {
          setShowReady(true);
          setCanProceed(true);
          playBeep();
        }, 1000);
        return;
      }
      
      const currentLine = BOOT_LINES[lineIndex];
      if (currentLine === undefined) {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, lineDelay);
        return;
      }
      
      if (charIndex === 0) {
        // Start showing this line
        setVisibleLines(prev => {
          const next = [...prev];
          next[lineIndex] = true;
          return next;
        });
      }
      
      if (charIndex < currentLine.length) {
        // Type next character
        setTypedLines(prev => {
          const next = [...prev];
          next[lineIndex] = currentLine.substring(0, charIndex + 1);
          return next;
        });
        
        if (currentLine[charIndex] !== ' ') {
          playTypeSound();
        }
        
        charIndex++;
        setTimeout(typeNextChar, charDelay());
      } else {
        // Line complete
        if (currentLine.includes('[OK]')) {
          playBeep();
        }
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, lineDelay);
      }
    };
    
    setTimeout(typeNextChar, totalDelay);
  }, [initAudio, playTypeSound, playBeep, playBootSound]);
  
  const handleTap = useCallback(() => {
    // Allow tap to skip at any time (bypass loading)
    
    // Initialize audio on tap (iOS requires user interaction)
    initAudio();
    
    // Play the Windows 95 boot sound — keep playing after splash dismisses
    // Create audio element on document.body so it survives component unmount
    const win95Sound = new Audio('/sounds/win95-boot.mp3');
    win95Sound.volume = 0.7;
    // Prevent garbage collection by attaching to window temporarily
    (window as any).__bootSound = win95Sound;
    win95Sound.play().then(() => {
      // Clean up reference after sound finishes
      win95Sound.addEventListener('ended', () => {
        delete (window as any).__bootSound;
      });
    }).catch(err => {
      console.log('Win95 boot sound failed:', err);
      // Fallback to beep if sound fails
      playBeep();
    });
    
    // Skip splash immediately — sound continues playing in background
    setFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [initAudio, playBeep, onComplete]);

  const handleDemoMode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the tap handler from firing
    if (!canProceed) return;
    
    // Initialize audio
    initAudio();
    
    // Play a different sound for demo mode
    playBeep();
    
    // Enable demo mode
    if (demoMode) {
      demoMode.enableDemoMode();
    }
    
    // Fade out and complete
    setFading(true);
    setTimeout(() => {
      if (onDemoMode) {
        onDemoMode();
      } else {
        onComplete();
      }
    }, 500);
  }, [canProceed, initAudio, playBeep, demoMode, onDemoMode, onComplete]);

  return (
    <SplashContainer $fading={fading} onClick={handleTap}>
      <Screen>
        <ContentWrapper>
          <BootText>
            {BOOT_LINES.map((line, index) => (
              <Line key={index} $visible={visibleLines[index] ?? false}>
                {typedLines[index]}
                {index === BOOT_LINES.length - 1 && visibleLines[index] && <Cursor />}
              </Line>
            ))}
          </BootText>
          
          <LogoContainer $visible={showLogo}>
            <Logo 
              src="/flunks-logo.png" 
              alt="Flunks" 
              $pulsing={showLogo}
            />
            <AsciiArt className={showAscii ? 'visible' : ''}>
              {ASCII_LOGO}
            </AsciiArt>
            <ReadyText $visible={showReady}>
              TAP TO ENTER
            </ReadyText>
            
            {/* Demo Mode Button - DISABLED for production release */}
            {false && isIOSDevice() && (
              <>
                <DemoButton 
                  $visible={showReady} 
                  onClick={handleDemoMode}
                >
                  🎮 TRY DEMO MODE
                </DemoButton>
                <DemoModeLabel style={{ opacity: showReady ? 1 : 0 }}>
                  No wallet needed • 1000 GUM included
                </DemoModeLabel>
              </>
            )}
          </LogoContainer>
          
          {/* Tap to skip hint - always visible */}
          {!showReady && (
            <ReadyText $visible={true} style={{ opacity: 0.5, fontSize: '0.8rem' }}>
              TAP TO SKIP
            </ReadyText>
          )}
        </ContentWrapper>
      </Screen>
    </SplashContainer>
  );
};

export default MobileSplashScreen;

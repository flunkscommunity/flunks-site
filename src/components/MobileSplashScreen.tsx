/**
 * Mobile Splash Screen Component
 * CRT-style boot sequence for the Flunks mobile app
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

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
  padding: 60px 20px 40px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #33ff33;
  text-shadow: 0 0 10px #33ff33;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: ${flicker} 0.15s infinite;
`;

const Line = styled.div<{ $visible: boolean }>`
  opacity: ${props => props.$visible ? 1 : 0};
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 4px;
  transition: opacity 0.1s;
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
  margin-top: auto;
  padding-bottom: 40px;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s ease-out;
`;

const Logo = styled.img<{ $pulsing: boolean }>`
  width: 100px;
  height: 100px;
  filter: brightness(1.2) drop-shadow(0 0 20px #33ff33);
  animation: ${props => props.$pulsing ? pulse : 'none'} 1.5s ease-in-out infinite;
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
`;

const ReadyText = styled.div<{ $visible: boolean }>`
  font-size: 20px;
  margin-top: 20px;
  color: #33ff33;
  text-shadow: 0 0 20px #33ff33;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s ease-out;
  animation: ${props => props.$visible ? blink : 'none'} 1s infinite;
`;

const BOOT_LINES = [
  'FLUNKS OS v2.0',
  'Copyright (C) 2026 Flunks Community',
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
}

const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({ onComplete }) => {
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
    let totalDelay = 200;
    
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
        setTimeout(typeNextChar, 25 + Math.random() * 15);
      } else {
        // Line complete
        if (currentLine.includes('[OK]')) {
          playBeep();
        }
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, 150);
      }
    };
    
    setTimeout(typeNextChar, totalDelay);
  }, [initAudio, playTypeSound, playBeep, playBootSound]);
  
  const handleTap = useCallback(() => {
    if (!canProceed) return;
    
    // Initialize audio on tap (iOS requires user interaction)
    initAudio();
    playBeep();
    
    // Fade out and complete
    setFading(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [canProceed, initAudio, playBeep, onComplete]);

  return (
    <SplashContainer $fading={fading} onClick={handleTap}>
      <Screen>
        {BOOT_LINES.map((line, index) => (
          <Line key={index} $visible={visibleLines[index]}>
            {typedLines[index]}
            {index === BOOT_LINES.length - 1 && visibleLines[index] && <Cursor />}
          </Line>
        ))}
        
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
        </LogoContainer>
      </Screen>
    </SplashContainer>
  );
};

export default MobileSplashScreen;

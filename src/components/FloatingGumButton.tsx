import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { awardGum, getUserGumBalance, checkGumCooldown, type GumAwardResult } from '../utils/gumAPI';
import { useUserProfile } from '../contexts/UserProfileContext';

// Floating animation for the gum button
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  50% { transform: translateY(-3px) rotate(-1deg); }
  75% { transform: translateY(-7px) rotate(0.5deg); }
`;

// Bounce animation for when clicked
const bounce = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(5deg); }
  50% { transform: scale(1.1) rotate(-3deg); }
  75% { transform: scale(1.15) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// Glow animation for the button
const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff;
  }
  50% { 
    box-shadow: 0 0 30px #00ffff, 0 0 50px #00ffff, 0 0 70px #00ffff;
  }
`;

// Pulsing effect for earnings display
const pulse = keyframes`
  0% { opacity: 0; transform: scale(0.5) translateY(0); }
  50% { opacity: 1; transform: scale(1.2) translateY(-20px); }
  100% { opacity: 0; transform: scale(0.8) translateY(-40px); }
`;

const FloatingContainer = styled.div<{ 
  $isDragging: boolean; 
  $x: number; 
  $y: number;
  $isClicked: boolean;
}>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  z-index: 500; /* Lower z-index so it appears behind windows but above desktop */
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  
  ${props => !props.$isDragging && css`
    animation: ${float} 3s ease-in-out infinite;
  `}
  
  ${props => props.$isClicked && css`
    animation: ${bounce} 0.5s ease-out;
  `}
  
  transition: ${props => props.$isDragging ? 'none' : 'all 0.3s ease'};
`;

const GumButton = styled.button<{ $isClicked: boolean; $canEarn: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #ff00ff;
  background: linear-gradient(45deg, #ff1493, #ff69b4, #ff00ff);
  color: white;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  position: relative;
  overflow: hidden;
  
  ${props => props.$canEarn && css`
    animation: ${glow} 2s ease-in-out infinite;
  `}
  
  ${props => !props.$canEarn && css`
    opacity: 0.6;
    background: linear-gradient(45deg, #666, #888, #aaa);
    border-color: #666;
    cursor: not-allowed;
  `}
  
  &:hover {
    ${props => props.$canEarn && css`
      transform: scale(1.1);
      filter: brightness(1.2);
    `}
  }
  
  &:active {
    ${props => props.$canEarn && css`
      transform: scale(0.95);
    `}
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
    border-radius: 50%;
    animation: ${float} 2s linear infinite;
  }
`;

const GumIcon = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const EarningsDisplay = styled.div<{ $show: boolean }>`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #00ff00, #32cd32);
  color: black;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid #ffffff;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  
  ${props => props.$show && css`
    animation: ${pulse} 2s ease-out forwards;
  `}
  
  ${props => !props.$show && css`
    opacity: 0;
    visibility: hidden;
  `}
`;

const CooldownOverlay = styled.div<{ $show: boolean; $progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(255,0,0,0.7) 0%,
    rgba(255,0,0,0.7) ${props => props.$progress}%,
    transparent ${props => props.$progress}%,
    transparent 100%
  );
  display: ${props => props.$show ? 'block' : 'none'};
  pointer-events: none;
`;

interface FloatingGumButtonProps {
  initialX?: number;
  initialY?: number;
}

export const FloatingGumButton: React.FC<FloatingGumButtonProps> = ({
  initialX = typeof window !== 'undefined' ? window.innerWidth / 2 - 30 : 100,
  initialY = typeof window !== 'undefined' ? window.innerHeight / 2 - 30 : 100
}) => {
  const { primaryWallet } = useDynamicContext();
  const { hasProfile, profile } = useUserProfile();
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [earnings, setEarnings] = useState<number | null>(null);
  const [showEarnings, setShowEarnings] = useState(false);
  const [canEarn, setCanEarn] = useState(true);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [gumBalance, setGumBalance] = useState(0);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial gum balance and check for existing cooldown
  useEffect(() => {
    if (primaryWallet?.address) {
      loadGumBalance();
      checkInitialCooldown();
    }
  }, [primaryWallet?.address]);

  const checkInitialCooldown = async () => {
    if (!primaryWallet?.address) return;
    
    // First check localStorage for persisted cooldown
    const storedCooldownEnd = localStorage.getItem(`gum_cooldown_${primaryWallet.address}`);
    if (storedCooldownEnd) {
      const cooldownEndTime = new Date(storedCooldownEnd);
      const now = new Date();
      
      if (cooldownEndTime > now) {
        // Still in cooldown
        const remainingMs = cooldownEndTime.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
        
        setCanEarn(false);
        startCooldown(remainingMinutes);
        return;
      } else {
        // Cooldown expired, remove from localStorage
        localStorage.removeItem(`gum_cooldown_${primaryWallet.address}`);
      }
    }
    
    // If no localStorage cooldown or it expired, check with server
    try {
      const cooldownCheck = await checkGumCooldown(primaryWallet.address, 'floating_button');
      
      if (!cooldownCheck.canEarn && cooldownCheck.cooldownMinutes) {
        // Server says still in cooldown
        setCanEarn(false);
        startCooldown(cooldownCheck.cooldownMinutes);
      } else {
        setCanEarn(true);
      }
    } catch (error) {
      console.error('Error checking initial cooldown:', error);
      // Default to allowing earning on error
      setCanEarn(true);
    }
  };

  const loadGumBalance = async () => {
    if (!primaryWallet?.address) return;
    
    const balance = await getUserGumBalance(primaryWallet.address);
    setGumBalance(balance);
  };

  // Generate random position within viewport bounds
  const getRandomPosition = () => {
    const padding = 80;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;
    
    return {
      x: Math.random() * (maxX - padding) + padding,
      y: Math.random() * (maxY - padding) + padding
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canEarn) return;
    
    e.preventDefault();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  }, [canEarn]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep button within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartRef.current.x, 2) + 
      Math.pow(e.clientY - dragStartRef.current.y, 2)
    );

    setIsDragging(false);

    // If it was a click (not a drag), award gum
    if (dragDistance < 5 && primaryWallet?.address && canEarn) {
      handleGumClick();
    }
  }, [isDragging, primaryWallet?.address, canEarn]);

  const handleGumClick = async () => {
    if (!primaryWallet?.address || !canEarn) return;

    // Check if user has a profile before allowing gum collection
    if (!hasProfile) {
      console.log('🍬 User needs profile to collect gum - will be handled in locker app');
      // TODO: This will be handled by the "my locker" app in the future
      alert('Please create your profile first by opening your locker!');
      return;
    }

    setIsClicked(true);
    
    try {
      const result: GumAwardResult = await awardGum(
        primaryWallet.address,
        'floating_button',
        {
          position: position,
          timestamp: new Date().toISOString(),
          button_type: 'floating_gum'
        }
      );

      if (result.success && result.earned > 0) {
        setEarnings(result.earned);
        setShowEarnings(true);
        setGumBalance(prev => prev + result.earned);
        
        // Dispatch event to update gum displays elsewhere
        window.dispatchEvent(new CustomEvent('gumBalanceUpdated'));
        
        // Move to random position after successful click
        setTimeout(() => {
          setPosition(getRandomPosition());
        }, 500);

        // Start cooldown
        if (result.cooldown_minutes && result.cooldown_minutes > 0) {
          startCooldown(result.cooldown_minutes);
        }
      } else {
        // Handle cooldown or error
        if (result.cooldown_remaining_minutes && result.cooldown_remaining_minutes > 0) {
          startCooldown(result.cooldown_remaining_minutes);
        }
      }
    } catch (error) {
      console.error('Error clicking gum button:', error);
    }

    // Reset click animation
    setTimeout(() => {
      setIsClicked(false);
      setShowEarnings(false);
    }, 2000);
  };

  const startCooldown = (minutes: number) => {
    setCanEarn(false);
    setCooldownProgress(100);
    
    // Store cooldown end time in localStorage for persistence across page reloads
    const cooldownEndTime = new Date(Date.now() + minutes * 60 * 1000);
    localStorage.setItem(`gum_cooldown_${primaryWallet?.address}`, cooldownEndTime.toISOString());
    
    const totalMs = minutes * 60 * 1000;
    const intervalMs = 100;
    let elapsed = 0;
    
    // Clear any existing timer
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const progress = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setCooldownProgress(progress);

      if (progress <= 0) {
        clearInterval(timer);
        setCanEarn(true);
        setCooldownProgress(0);
        
        // Clear localStorage when cooldown expires
        localStorage.removeItem(`gum_cooldown_${primaryWallet?.address}`);
      }
    }, intervalMs);

    cooldownTimerRef.current = timer;
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Don't show if no wallet connected
  if (!primaryWallet?.address) {
    return null;
  }

  // Hide button completely during cooldown
  if (!canEarn && !hasProfile) {
    // Still show if user doesn't have profile (for profile creation prompt)
    // But hide completely if they have profile and are in cooldown
    return null;
  }

  // Hide if user has profile but is in cooldown
  if (hasProfile && !canEarn) {
    return null;
  }

  return (
    <FloatingContainer
      ref={buttonRef}
      $isDragging={isDragging}
      $x={position.x}
      $y={position.y}
      $isClicked={isClicked}
      onMouseDown={handleMouseDown}
      title={
        !hasProfile 
          ? 'Create your profile in your locker first!'
          : canEarn 
            ? 'Click to earn gum! Drag to move.' 
            : 'Cooling down...'
      }
    >
      <GumButton
        $isClicked={isClicked}
        $canEarn={canEarn}
      >
        <GumIcon>
          🍬
          <div style={{ fontSize: '8px', marginTop: '2px' }}>
            {!hasProfile ? 'PROFILE' : canEarn ? 'GUM' : 'WAIT'}
          </div>
        </GumIcon>
        
        <CooldownOverlay 
          $show={!canEarn} 
          $progress={cooldownProgress}
        />
      </GumButton>
      
      <EarningsDisplay $show={showEarnings}>
        +{earnings} GUM!
      </EarningsDisplay>
    </FloatingContainer>
  );
};

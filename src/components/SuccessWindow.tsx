import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'react95';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from 'contexts/UserProfileContext';

// Global style override for this specific success window
const GlobalSuccessStyle = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  
  /* Override any parent backgrounds */
  * {
    background: transparent !important;
  }
  
  /* Force dark background on container */
  && {
    background: #2a2a2a !important;
  }
  
  /* Mobile scrolling fix */
  @media (max-width: 768px) {
    height: 100vh;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #2a2a2a !important;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 25%, #1e2a1e 50%, #2a3a2a 75%, #252525 100%) !important;
  border: 2px solid #33ff33;
  border-radius: 15px;
  font-family: 'Courier New', monospace;
  width: 100%;
  height: 100%;
  min-height: 500px;
  text-align: center;
  box-shadow: 
    0 0 30px rgba(51, 255, 51, 0.6),
    inset 0 0 50px rgba(51, 255, 51, 0.1);
  background-image: 
    radial-gradient(circle at 15% 15%, rgba(51, 255, 51, 0.15) 2px, transparent 2px),
    radial-gradient(circle at 85% 85%, rgba(51, 255, 51, 0.15) 2px, transparent 2px),
    radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.05) 1px, transparent 1px);
  background-size: 40px 40px, 40px 40px, 20px 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%, 
      rgba(51, 255, 51, 0.03) 50%, 
      transparent 70%
    );
    animation: scanLine 3s ease-in-out infinite;
  }
  
  @keyframes scanLine {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    padding: 20px;
    min-height: 400px;
    border-radius: 10px;
    overflow-y: auto;
    justify-content: flex-start;
    height: auto;
    max-height: 100%;
  }
`;

const SuccessTitle = styled.h1`
  color: #33ff33;
  font-size: 48px;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 
    0 0 10px #33ff33,
    0 0 20px #33ff33,
    0 0 30px #33ff33;
  animation: titleGlow 2s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 3px;
  
  @keyframes titleGlow {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
      text-shadow: 
        0 0 10px #33ff33,
        0 0 20px #33ff33,
        0 0 30px #33ff33;
    }
    50% { 
      opacity: 0.9; 
      transform: scale(1.02);
      text-shadow: 
        0 0 15px #33ff33,
        0 0 30px #33ff33,
        0 0 45px #33ff33,
        0 0 60px #00ff00;
    }
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 32px;
    margin: 15px 0;
    letter-spacing: 2px;
  }
`;

const SecurityBadge = styled.div`
  background: linear-gradient(135deg, #ffaa00 0%, #ff6600 100%);
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(255, 170, 0, 0.4);
  animation: badgeFloat 3s ease-in-out infinite;
  
  @keyframes badgeFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
`;

const SuccessMessage = styled.div`
  color: #99ff99;
  font-size: 20px;
  margin: 30px 0;
  line-height: 1.8;
  max-width: 500px;
  background: rgba(51, 255, 51, 0.05);
  padding: 25px;
  border-radius: 10px;
  border: 1px solid rgba(51, 255, 51, 0.2);
  backdrop-filter: blur(5px);
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 16px;
    margin: 20px 0;
    padding: 20px;
    max-width: 100%;
    line-height: 1.6;
  }
`;

const CelebrationButton = styled(Button)`
  font-size: 28px;
  font-weight: bold;
  padding: 25px 50px;
  margin: 40px 0;
  background: linear-gradient(135deg, #33ff33 0%, #00cc00 100%);
  border: 3px solid #ffffff;
  color: #000;
  text-shadow: none;
  box-shadow: 
    0 6px 20px rgba(51, 255, 51, 0.5),
    0 0 30px rgba(51, 255, 51, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  &:hover {
    background: linear-gradient(135deg, #44ff44 0%, #00dd00 100%);
    box-shadow: 
      0 8px 25px rgba(51, 255, 51, 0.7),
      0 0 40px rgba(51, 255, 51, 0.5);
    transform: translateY(-3px) scale(1.05);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 20px;
    padding: 20px 30px;
    margin: 25px 0;
    letter-spacing: 1px;
  }
`;

const FloatingIcon = styled.div`
  font-size: 120px;
  margin-bottom: 30px;
  animation: iconFloat 4s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(255, 170, 0, 0.8);
  
  @keyframes iconFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(2deg); }
    50% { transform: translateY(-5px) rotate(-1deg); }
    75% { transform: translateY(-8px) rotate(1deg); }
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 80px;
    margin-bottom: 20px;
  }
`;

const MatrixRain = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.1;
  overflow: hidden;
  
  &::before {
    content: '01001000 01100001 01100011 01101011 01100101 01100100';
    position: absolute;
    top: -20px;
    left: 10%;
    color: #33ff33;
    font-size: 12px;
    animation: matrixFall 8s linear infinite;
  }
  
  &::after {
    content: '01010011 01110101 01100011 01100011 01100101 01110011 01110011';
    position: absolute;
    top: -20px;
    right: 10%;
    color: #33ff33;
    font-size: 12px;
    animation: matrixFall 10s linear infinite;
    animation-delay: 2s;
  }
  
  @keyframes matrixFall {
    0% { transform: translateY(-20px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(500px); opacity: 0; }
  }
`;

interface SuccessWindowProps {
  onContinue: () => void;
}

const SuccessWindow: React.FC<SuccessWindowProps> = ({ onContinue }) => {
  const { primaryWallet } = useDynamicContext();
  const { profile } = useUserProfile();
  const [isTracking, setIsTracking] = useState(false);

  const handleCelebration = async () => {
    setIsTracking(true);
    
    console.log('🎯 SuccessWindow: Code crack celebration!');
    console.log('🎯 Wallet Address:', primaryWallet?.address);
    console.log('🎯 Username:', profile?.username);
    
    // Note: Tracking is handled by DigitalLock component, not here
    // This prevents duplicate API calls and conflicts
    
    setIsTracking(false);
    onContinue();
  };  return (
    <GlobalSuccessStyle>
      <SuccessContainer>
        <MatrixRain />
        
        <SecurityBadge>
          🏆 SECURITY BREACH SUCCESSFUL 🏆
        </SecurityBadge>
        
        <FloatingIcon>
          🎉
        </FloatingIcon>
        
        <SuccessTitle>
          ACCESS GRANTED!
        </SuccessTitle>
        
        <SuccessMessage>
          🔓 <strong>DIGITAL LOCK COMPROMISED</strong><br/>
          <br/>
          The Principal's Office security system has been bypassed.<br/>
          You've successfully infiltrated the restricted zone!<br/>
          <br/>
          <span style={{ color: '#ffaa00' }}>⚡ Elite hacker status achieved ⚡</span>
        </SuccessMessage>
        
        <CelebrationButton onClick={handleCelebration} disabled={isTracking}>
          {isTracking ? '📊 LOGGING BREACH...' : '🚀 ENTER THE OFFICE 🚀'}
        </CelebrationButton>
        
        <div style={{ 
          color: '#ffaa00', 
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '25px',
          textShadow: '0 0 10px rgba(255, 170, 0, 0.8)'
        }}>
          🕵️‍♂️ Mission Status: COMPLETE 🕵️‍♂️
        </div>
        
        <div style={{ 
          color: '#666', 
          textAlign: 'center', 
          marginTop: '20px', 
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          FLUNKS SECURITY SYSTEM v2.0 - BREACH DETECTED
        </div>
      </SuccessContainer>
    </GlobalSuccessStyle>
  );
};

export default SuccessWindow;

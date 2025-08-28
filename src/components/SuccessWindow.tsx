import React from 'react';
import styled from 'styled-components';
import { Button } from 'react95';

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, #1a4d1a 0%, #0d3d0d 100%);
  border: 3px solid #33ff33;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  width: 100%;
  height: 100%;
  min-height: 400px;
  text-align: center;
  box-shadow: 0 0 20px rgba(51, 255, 51, 0.5);
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(51, 255, 51, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(51, 255, 51, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
`;

const SuccessTitle = styled.h1`
  color: #33ff33;
  font-size: 36px;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 0 0 15px #33ff33;
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const SuccessMessage = styled.div`
  color: #99ff99;
  font-size: 18px;
  margin: 20px 0;
  line-height: 1.6;
  max-width: 400px;
`;

const CelebrationButton = styled(Button)`
  font-size: 24px;
  font-weight: bold;
  padding: 20px 40px;
  margin: 30px 0;
  background: linear-gradient(135deg, #33ff33 0%, #00cc00 100%);
  border: 3px solid #ffffff;
  color: #000;
  text-shadow: none;
  box-shadow: 0 4px 12px rgba(51, 255, 51, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #44ff44 0%, #00dd00 100%);
    box-shadow: 0 6px 16px rgba(51, 255, 51, 0.6);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface SuccessWindowProps {
  onContinue: () => void;
}

const SuccessWindow: React.FC<SuccessWindowProps> = ({ onContinue }) => {
  return (
    <SuccessContainer>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>
        🎉
      </div>
      
      <SuccessTitle>
        YOU DID IT!
      </SuccessTitle>
      
      <SuccessMessage>
        🔓 Access code accepted!<br/>
        The Principal's Office is now unlocked.<br/>
        You've successfully cracked the security system!
      </SuccessMessage>
      
      <CelebrationButton onClick={onContinue}>
        🚀 YOU DID IT! 🚀
      </CelebrationButton>
      
      <div style={{ 
        color: '#66cc66', 
        fontSize: '14px',
        fontStyle: 'italic',
        marginTop: '20px'
      }}>
        Mission accomplished, agent! 🕵️‍♂️
      </div>
      
      <div style={{ 
        color: '#444', 
        textAlign: 'center', 
        marginTop: '15px', 
        fontSize: '10px' 
      }}>
        FLUNKS SECURITY SYSTEM - ACCESS GRANTED
      </div>
    </SuccessContainer>
  );
};

export default SuccessWindow;

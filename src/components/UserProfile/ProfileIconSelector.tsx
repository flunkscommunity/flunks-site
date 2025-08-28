import React, { useState, useEffect } from 'react';
import { Button, Frame } from 'react95';
import styled from 'styled-components';

// Profile icon collection - 5x5 grid (25 icons total)
const PROFILE_ICONS = [
  // Row 1 - Face Characters
  '🤓', '�', '🥶', '🤡', '�',
  // Row 2 - Creatures  
  '👻', '�', '�', '👾', '🤖',
  // Row 3 - Professionals
  '🕵🏼‍♂️', '�🏽‍⚕️', '👨�‍🍳', '�🏽‍🌾', '👨🏼‍🎤',
  // Row 4 - More Professionals
  '👨🏽‍�', '�🏽‍🎨', '🧑🏽‍�', '🥷', '🧙�‍♂️',
  // Row 5 - Fantasy Characters
  '🧌', '🧛', '🧞‍♂️', '🧜�‍♂️', '🎮'
];

const IconSelectionContainer = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  border-radius: 8px;
  border: 3px solid #4a90e2;
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.3);
  text-align: center;
  color: #fff;
  font-family: 'Courier New', monospace;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 15px;
    max-height: 95vh;
    margin: 10px;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-width: 300px;
  margin: 20px auto;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 2px solid #333;
  
  @media (max-width: 768px) {
    max-width: 280px;
    gap: 6px;
    padding: 10px;
    margin: 15px auto;
  }
  
  @media (max-width: 480px) {
    max-width: 250px;
    gap: 4px;
  }
`;

const IconButton = styled.button<{ $selected: boolean }>`
  width: 50px;
  height: 50px;
  border: ${props => props.$selected ? '3px solid #4a90e2' : '2px solid #666'};
  border-radius: 8px;
  background: ${props => props.$selected ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4a90e2;
    background: rgba(74, 144, 226, 0.1);
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    font-size: 22px;
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
`;

const PreviewSection = styled.div`
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #333;
`;

const UsernamePreview = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 10px 0;
`;

const IconDisplay = styled.span`
  font-size: 24px;
  filter: drop-shadow(0 0 4px rgba(74, 144, 226, 0.6));
`;

interface ProfileIconSelectorProps {
  username: string;
  selectedIcon: string;
  onIconChange: (icon: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const ProfileIconSelector: React.FC<ProfileIconSelectorProps> = ({
  username,
  selectedIcon,
  onIconChange,
  onConfirm,
  onBack
}) => {
  console.log('🎨 ProfileIconSelector: Render with selectedIcon:', selectedIcon);
  console.log('🎨 ProfileIconSelector: Username:', username);
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <IconSelectionContainer>
            <h2 style={{ 
        margin: '0 0 10px 0', 
        fontSize: isMobile ? '20px' : '24px', 
        color: '#4a90e2'
      }}>
        🎨 Choose Your Profile Icon
      </h2>
      
      <p style={{ 
        margin: '0 0 20px 0', 
        color: '#ccc', 
        fontSize: isMobile ? '12px' : '14px',
        lineHeight: '1.4',
        padding: '0 10px'
      }}>
        Select an icon that will appear next to your username<br/>
        on scoreboards and throughout the site
      </p>

      <IconGrid>
        {PROFILE_ICONS.map((icon, index) => (
          <IconButton
            key={index}
            $selected={selectedIcon === icon}
            onClick={() => {
              console.log('🎨 ProfileIconSelector: Icon clicked:', icon);
              console.log('🎨 ProfileIconSelector: Current selectedIcon before change:', selectedIcon);
              onIconChange(icon);
              console.log('🎨 ProfileIconSelector: Icon change callback called for:', icon);
            }}
            title={`Select ${icon} as your profile icon`}
          >
            {icon}
          </IconButton>
        ))}
      </IconGrid>

      <PreviewSection>
        <div style={{ fontSize: '16px', color: '#999', marginBottom: '10px' }}>
          Preview:
        </div>
        <UsernamePreview>
          <IconDisplay>{selectedIcon || '❓'}</IconDisplay>
          <span>{username}</span>
        </UsernamePreview>
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          marginTop: '8px',
          fontStyle: 'italic'
        }}>
          This is how your name will appear on leaderboards
        </div>
      </PreviewSection>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center', 
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <Button onClick={onBack} style={{
          minWidth: '120px',
          fontSize: '14px',
          padding: '8px 16px'
        }}>
          ← Back to Profile
        </Button>
        
        <Button 
          onClick={() => {
            console.log('🎨 ProfileIconSelector: Confirm button clicked');
            console.log('🎨 ProfileIconSelector: Selected icon at confirm:', selectedIcon);
            onConfirm();
          }}
          disabled={!selectedIcon}
          style={{
            background: selectedIcon ? '#4a90e2' : '#666',
            color: 'white',
            fontWeight: 'bold',
            minWidth: '120px',
            fontSize: '14px',
            padding: '8px 16px'
          }}
        >
          Confirm Icon ✨
        </Button>
      </div>
    </IconSelectionContainer>
  );
};

export default ProfileIconSelector;

import React, { useState, useEffect } from 'react';
import { Button, Frame } from 'react95';
import styled from 'styled-components';

// Profile icon collection - 5x5 grid (25 icons total) - NEW EMOJI SET
const PROFILE_ICONS = [
  // Row 1 - Face Characters
  '🤓', '🥸', '🥶', '🤡', '😈',
  // Row 2 - Creatures  
  '👻', '👽', '💩', '👾', '🤖',
  // Row 3 - Professionals
  '🕵🏼‍♂️', '👨🏽‍⚕️', '👨🏽‍🍳', '👨🏽‍🌾', '👨🏼‍🎤',
  // Row 4 - More Professionals
  '👨🏽‍🏫', '👨🏽‍🎨', '🧑🏽‍🚀', '🥷', '🧙🏼‍♂️',
  // Row 5 - Fantasy Characters
  '🧌', '🧛', '🧞‍♂️', '🧜🏽‍♂️', '🎮'
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
    max-width: 260px;
    gap: 4px;
    padding: 8px;
  }
`;

const IconButton = styled.button<{ $isSelected: boolean }>`
  width: 50px;
  height: 50px;
  border: 2px solid ${props => props.$isSelected ? '#4a90e2' : '#666'};
  border-radius: 8px;
  background: ${props => props.$isSelected ? 
    'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' : 
    'linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 100%)'
  };
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$isSelected ? 
    '0 0 15px rgba(74, 144, 226, 0.6)' : 
    '0 2px 4px rgba(0, 0, 0, 0.3)'
  };

  &:hover {
    border-color: #4a90e2;
    box-shadow: 0 0 15px rgba(74, 144, 226, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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
  display: inline-block;
`;

interface ProfileIconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  onBack: () => void;
  onNext: () => void;
  username: string;
}

const ProfileIconSelector: React.FC<ProfileIconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  onBack,
  onNext,
  username
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleIconClick = (icon: string) => {
    console.log('🎨 NEW ProfileIconSelector: Icon clicked:', icon);
    onIconSelect(icon);
  };

  return (
    <IconSelectionContainer>
      <h2 style={{ 
        fontSize: isMobile ? '18px' : '20px', 
        margin: '0 0 10px 0',
        textShadow: '0 0 10px rgba(74, 144, 226, 0.8)'
      }}>
        🎨 Choose Your Avatar
      </h2>
      <p style={{ 
        fontSize: '12px', 
        color: '#b0c4de', 
        margin: '0 0 20px 0',
        fontStyle: 'italic'
      }}>
        Select from our NEW emoji collection! 🆕
      </p>
      
      <IconGrid>
        {PROFILE_ICONS.map((icon, index) => (
          <IconButton
            key={`${icon}-${index}`}
            $isSelected={selectedIcon === icon}
            onClick={() => handleIconClick(icon)}
            type="button"
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
          This is how your name will appear in chat and leaderboards
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
          ← Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedIcon}
          style={{
            minWidth: '120px',
            fontSize: '14px',
            padding: '8px 16px',
            background: selectedIcon ? '#4a90e2' : undefined,
            color: selectedIcon ? 'white' : undefined
          }}
        >
          Continue →
        </Button>
      </div>
    </IconSelectionContainer>
  );
};

export default ProfileIconSelector;

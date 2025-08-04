import React, { useState, useEffect } from 'react';
import { Button, Frame } from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { usePaginatedItems } from 'contexts/UserPaginatedItems';
import styled from 'styled-components';

interface RPGProfileDisplayProps {
  onEdit?: () => void;
}

// Styled components for RPG look
const RPGContainer = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 600px;
  padding: 20px;
  color: #fff;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 30%);
    pointer-events: none;
  }
`;

const CharacterFrame = styled(Frame)`
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid #ffd700;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
`;

const LetterjacketContainer = styled.div`
  position: relative;
  width: 200px;
  height: 250px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #B22222 100%);
  border: 3px solid #FFD700;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 2px solid rgba(255, 215, 0, 0.5);
    border-radius: 10px;
    pointer-events: none;
  }
`;

const VarsityF = styled.div`
  font-size: 120px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 
    3px 3px 0px #8B0000,
    6px 6px 10px rgba(0, 0, 0, 0.5);
  font-family: 'Arial Black', sans-serif;
  line-height: 1;
`;

const PinsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Pin = styled.div<{ position: { top: string; left: string } }>`
  position: absolute;
  top: ${props => props.position.top};
  left: ${props => props.position.left};
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 2px solid #8B0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const StatsPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
`;

const StatBox = styled(Frame)`
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #4a90e2;
  padding: 15px;
  text-align: center;
  
  .stat-label {
    color: #4a90e2;
    font-size: 12px;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .stat-value {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
  }
`;

const InfoPanel = styled(Frame)`
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #666;
  padding: 15px;
  margin-top: 20px;
  
  .info-row {
    display: flex;
    align-items: center;
    margin: 8px 0;
    
    .icon {
      width: 24px;
      height: 24px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 14px;
    }
    
    .label {
      color: #ccc;
      font-size: 12px;
      min-width: 80px;
    }
    
    .value {
      color: #fff;
      font-weight: bold;
    }
  }
`;

const RPGButton = styled(Button)`
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: 2px solid #fff;
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #5ba0f2 0%, #4585c9 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Title = styled.h2`
  text-align: center;
  font-size: 28px;
  color: #FFD700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

// Define collectible types and their pins
const COLLECTIBLE_TYPES = {
  flunks: { emoji: '🎓', name: 'Flunks', color: '#4a90e2' },
  backpacks: { emoji: '🎒', name: 'Backpacks', color: '#e24a4a' },
  achievements: { emoji: '🏆', name: 'Achievements', color: '#ffd700' },
  events: { emoji: '📅', name: 'Events', color: '#9a4ae2' }
};

const RPGProfileDisplay: React.FC<RPGProfileDisplayProps> = ({ onEdit }) => {
  const { primaryWallet } = useDynamicContext();
  const { profile, loading } = useUserProfile();
  const { flunksCount, backpacksCount } = usePaginatedItems();
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  if (loading) {
    return (
      <RPGContainer>
        <div style={{ textAlign: 'center', marginTop: '200px' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
          <div>Loading character data...</div>
        </div>
      </RPGContainer>
    );
  }

  if (!profile) {
    return (
      <RPGContainer>
        <div style={{ textAlign: 'center', marginTop: '200px' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>👤</div>
          <div>No character profile found</div>
          {onEdit && (
            <RPGButton onClick={onEdit} style={{ marginTop: '20px' }}>
              Create Character
            </RPGButton>
          )}
        </div>
      </RPGContainer>
    );
  }

  // Calculate total collectibles for pin placement
  const totalCollectibles = flunksCount + backpacksCount;
  const achievements = 3; // Mock achievements
  const events = 1; // Mock events

  // Generate pin positions in a spiral pattern around the jacket
  const generatePinPositions = (count: number) => {
    const positions = [];
    const radius = 60;
    const centerX = 50;
    const centerY = 45;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + Math.PI / 4;
      const spiralRadius = radius + (i * 5);
      const x = centerX + Math.cos(angle) * (spiralRadius / 100) * 50;
      const y = centerY + Math.sin(angle) * (spiralRadius / 100) * 50;
      
      positions.push({
        top: `${Math.max(5, Math.min(90, y))}%`,
        left: `${Math.max(5, Math.min(90, x))}%`
      });
    }
    
    return positions;
  };

  const pinPositions = generatePinPositions(Math.min(totalCollectibles + achievements + events, 20));

  const renderPins = () => {
    const pins = [];
    let pinIndex = 0;

    // Add Flunks pins
    for (let i = 0; i < Math.min(flunksCount, 8); i++) {
      if (pinIndex < pinPositions.length) {
        pins.push(
          <Pin
            key={`flunk-${i}`}
            position={pinPositions[pinIndex]}
            onClick={() => setSelectedPin(`Flunk #${i + 1}`)}
            title={`Flunk #${i + 1}`}
          >
            🎓
          </Pin>
        );
        pinIndex++;
      }
    }

    // Add Backpack pins
    for (let i = 0; i < Math.min(backpacksCount, 8); i++) {
      if (pinIndex < pinPositions.length) {
        pins.push(
          <Pin
            key={`backpack-${i}`}
            position={pinPositions[pinIndex]}
            onClick={() => setSelectedPin(`Backpack #${i + 1}`)}
            title={`Backpack #${i + 1}`}
          >
            🎒
          </Pin>
        );
        pinIndex++;
      }
    }

    // Add Achievement pins
    for (let i = 0; i < Math.min(achievements, 4); i++) {
      if (pinIndex < pinPositions.length) {
        pins.push(
          <Pin
            key={`achievement-${i}`}
            position={pinPositions[pinIndex]}
            onClick={() => setSelectedPin(`Achievement: Profile Master`)}
            title="Profile Master"
          >
            🏆
          </Pin>
        );
        pinIndex++;
      }
    }

    return pins;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <RPGContainer>
      <Title>🎓 Flunks Profile 🎓</Title>
      
      <CharacterFrame variant="well">
        {/* Character Name */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '32px', 
            color: '#FFD700', 
            margin: '0 0 5px 0',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            {profile.username}
          </h3>
          <div style={{ color: '#ccc', fontSize: '14px' }}>
            Student since {formatDate(profile.created_at)}
          </div>
        </div>

        {/* Letterjacket with Pins */}
        <LetterjacketContainer>
          <VarsityF>F</VarsityF>
          <PinsContainer>
            {renderPins()}
          </PinsContainer>
        </LetterjacketContainer>

        {/* Selected Pin Info */}
        {selectedPin && (
          <div style={{ 
            textAlign: 'center', 
            background: 'rgba(255, 215, 0, 0.2)', 
            padding: '10px', 
            borderRadius: '5px',
            border: '1px solid #FFD700',
            marginBottom: '20px'
          }}>
            <strong>📌 {selectedPin}</strong>
            <button 
              onClick={() => setSelectedPin(null)}
              style={{ 
                marginLeft: '10px', 
                background: 'transparent', 
                border: 'none', 
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Panel */}
        <StatsPanel>
          <StatBox variant="well">
            <div className="stat-label">Flunks Owned</div>
            <div className="stat-value">{flunksCount}</div>
          </StatBox>
          <StatBox variant="well">
            <div className="stat-label">Backpacks</div>
            <div className="stat-value">{backpacksCount}</div>
          </StatBox>
          <StatBox variant="well">
            <div className="stat-label">Achievements</div>
            <div className="stat-value">{achievements}</div>
          </StatBox>
          <StatBox variant="well">
            <div className="stat-label">Events</div>
            <div className="stat-value">{events}</div>
          </StatBox>
        </StatsPanel>

        {/* Info Panel */}
        <InfoPanel variant="well">
          {profile.discord_id && (
            <div className="info-row">
              <div className="icon">🎮</div>
              <div className="label">Discord:</div>
              <div className="value">{profile.discord_id}</div>
            </div>
          )}
          {profile.email && (
            <div className="info-row">
              <div className="icon">📧</div>
              <div className="label">Email:</div>
              <div className="value">{profile.email}</div>
            </div>
          )}
          <div className="info-row">
            <div className="icon">💰</div>
            <div className="label">Wallet:</div>
            <div className="value" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
              {profile.wallet_address.slice(0, 8)}...{profile.wallet_address.slice(-8)}
            </div>
          </div>
        </InfoPanel>

        {/* Action Buttons */}
        {onEdit && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <RPGButton onClick={onEdit}>
              ⚙️ Edit Character
            </RPGButton>
          </div>
        )}
      </CharacterFrame>
    </RPGContainer>
  );
};

export default RPGProfileDisplay;

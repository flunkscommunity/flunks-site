import React from 'react';
import styled from 'styled-components';
import { Frame } from 'react95';
import { getUserAccessLevel, getAccessLevelInfo } from 'utils/appPermissions';
import { getCurrentBuildMode } from 'utils/buildMode';

const StatusContainer = styled.div`
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%); /* Center horizontally */
  z-index: 1000;
`;

const StatusFrame = styled(Frame)`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(192, 192, 192, 0.95);
  backdrop-filter: blur(4px);
`;

const StatusDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const StatusText = styled.span`
  font-size: 12px;
  font-weight: bold;
  font-family: 'MS Sans Serif', sans-serif;
`;

const AccessLevelStatus: React.FC = () => {
  const accessLevel = getUserAccessLevel();
  const buildMode = getCurrentBuildMode();
  
  // Hide access level status in public mode
  if (buildMode === 'public') return null;
  
  if (!accessLevel) return null;
  
  const levelInfo = getAccessLevelInfo(accessLevel);
  
  return (
    <StatusContainer>
      <StatusFrame variant="field">
        <StatusDot color={levelInfo.color} />
        <StatusText>
          {levelInfo.name}
        </StatusText>
      </StatusFrame>
    </StatusContainer>
  );
};

export default AccessLevelStatus;

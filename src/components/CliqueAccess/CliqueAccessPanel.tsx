import React from 'react';
import { Frame, Button, Tooltip } from 'react95';
import { CliqueType, useCliqueAccess } from 'hooks/useCliqueAccess';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import styled from 'styled-components';

interface CliqueAccessIndicatorProps {
  clique: CliqueType;
  showLabel?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const AccessIndicator = styled.div<{ hasAccess: boolean; compact?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.compact ? '4px' : '8px'};
  padding: ${props => props.compact ? '4px 8px' : '8px 12px'};
  border-radius: 4px;
  background: ${props => props.hasAccess ? '#2d7d3240' : '#7d2d3240'};
  border: 2px solid ${props => props.hasAccess ? '#4ade80' : '#f87171'};
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  transition: all 0.2s ease;

  &:hover {
    ${props => props.onClick && `
      transform: scale(1.05);
      background: ${props.hasAccess ? '#2d7d3260' : '#7d2d3260'};
    `}
  }
`;

const CliqueIcon = styled.div<{ clique: CliqueType; size?: string }>`
  font-size: ${props => props.size || '20px'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getCliqueIcon = (clique: CliqueType): string => {
  switch (clique) {
    case 'GEEK': return '🤓';
    case 'JOCK': return '🏈';
    case 'PREP': return '💅';
    case 'FREAK': return '🖤';
    default: return '❓';
  }
};

const getCliqueName = (clique: CliqueType): string => {
  switch (clique) {
    case 'GEEK': return "Geek's House";
    case 'JOCK': return "Jock's House";
    case 'PREP': return "Prep's House";
    case 'FREAK': return "Freak's House";
    default: return 'Unknown';
  }
};

export const CliqueAccessIndicator: React.FC<CliqueAccessIndicatorProps> = ({
  clique,
  showLabel = true,
  compact = false,
  onClick
}) => {
  const { hasAccess } = useCliqueAccess();
  const { user } = useDynamicContext();
  
  const hasCliqueAccess = hasAccess(clique);
  const icon = getCliqueIcon(clique);
  const name = getCliqueName(clique);

  if (!user) {
    return (
      <Tooltip text="Connect wallet to check access">
        <AccessIndicator hasAccess={false} compact={compact}>
          <CliqueIcon clique={clique} size={compact ? '16px' : '20px'}>
            {icon}
          </CliqueIcon>
          {showLabel && <span>🔒 {name}</span>}
        </AccessIndicator>
      </Tooltip>
    );
  }

  return (
    <Tooltip text={hasCliqueAccess ? `You have access to ${name}` : `You need a ${clique} NFT for access`}>
      <AccessIndicator 
        hasAccess={hasCliqueAccess} 
        compact={compact}
        onClick={onClick}
      >
        <CliqueIcon clique={clique} size={compact ? '16px' : '20px'}>
          {hasCliqueAccess ? icon : '🔒'}
        </CliqueIcon>
        {showLabel && (
          <span>
            {hasCliqueAccess ? `✅ ${name}` : `🔒 ${name}`}
          </span>
        )}
      </AccessIndicator>
    </Tooltip>
  );
};

interface CliqueAccessPanelProps {
  showTitle?: boolean;
  onCliqueClick?: (clique: CliqueType) => void;
}

export const CliqueAccessPanel: React.FC<CliqueAccessPanelProps> = ({
  showTitle = true,
  onCliqueClick
}) => {
  const { cliqueAccess, loading, error, getUserCliques } = useCliqueAccess();
  const { user } = useDynamicContext();

  if (!user) {
    return (
      <Frame variant="field" className="p-4">
        <div className="text-center">
          <div className="mb-2">🔐 Connect Wallet</div>
          <div className="text-sm text-gray-600">
            Connect your wallet to check clique access
          </div>
        </div>
      </Frame>
    );
  }

  if (loading) {
    return (
      <Frame variant="field" className="p-4">
        <div className="text-center">
          <div className="mb-2">⏳ Checking Access...</div>
          <div className="text-sm text-gray-600">
            Scanning your NFTs for clique traits
          </div>
        </div>
      </Frame>
    );
  }

  if (error) {
    return (
      <Frame variant="field" className="p-4">
        <div className="text-center text-red-600">
          <div className="mb-2">❌ Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </Frame>
    );
  }

  const userCliques = getUserCliques();
  const cliques: CliqueType[] = ['GEEK', 'JOCK', 'PREP', 'FREAK'];

  return (
    <Frame variant="field" className="p-4">
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">🏠 Clique House Access</h3>
          <div className="text-sm text-gray-600 mb-3">
            {userCliques.length > 0 
              ? `You have access to ${userCliques.length} clique house${userCliques.length > 1 ? 's' : ''}`
              : 'You need to own clique NFTs to access houses'
            }
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {cliques.map(clique => (
          <CliqueAccessIndicator
            key={clique}
            clique={clique}
            showLabel={true}
            onClick={onCliqueClick ? () => onCliqueClick(clique) : undefined}
          />
        ))}
      </div>

      {userCliques.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <div className="text-sm">
            <strong>💡 How to get access:</strong><br/>
            Own a Flunks NFT with the clique trait you want to access. 
            Each clique grants access to their exclusive house!
          </div>
        </div>
      )}
    </Frame>
  );
};

export default CliqueAccessPanel;

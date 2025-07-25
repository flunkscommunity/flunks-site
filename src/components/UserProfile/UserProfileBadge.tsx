import React from 'react';
import { Frame } from 'react95';

interface UserProfileBadgeProps {
  walletAddress: string;
  username?: string;
  compact?: boolean;
  showWallet?: boolean;
  onClick?: () => void;
}

const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  walletAddress,
  username,
  compact = true,
  showWallet = false,
  onClick
}) => {
  const displayAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Unknown';

  const displayName = username || displayAddress;

  if (compact) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-blue-100 ${
          onClick ? 'cursor-pointer hover:bg-blue-200' : ''
        }`}
        onClick={onClick}
        title={showWallet ? walletAddress : displayName}
      >
        <span className="text-xs">👤</span>
        <span className="font-medium">{displayName}</span>
      </span>
    );
  }

  return (
    <Frame 
      variant="field" 
      className={`p-2 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">👤</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {displayName}
          </div>
          {showWallet && username && (
            <div className="text-xs text-gray-600 font-mono truncate">
              {displayAddress}
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
};

export default UserProfileBadge;

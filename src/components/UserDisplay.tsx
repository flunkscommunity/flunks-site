import React from 'react';
import styled from 'styled-components';

const UsernameContainer = styled.div<{ $size?: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => 
    props.$size === 'small' ? '4px' : 
    props.$size === 'large' ? '8px' : '6px'
  };
  font-weight: ${props => 
    props.$size === 'small' ? 'normal' : 'bold'
  };
`;

const ProfileIcon = styled.span<{ $size?: 'small' | 'medium' | 'large' }>`
  font-size: ${props => 
    props.$size === 'small' ? '14px' : 
    props.$size === 'large' ? '24px' : '18px'
  };
  filter: ${props => 
    props.$size === 'large' ? 'drop-shadow(0 0 4px rgba(74, 144, 226, 0.6))' : 'none'
  };
  line-height: 1;
  user-select: none;
`;

const Username = styled.span<{ $size?: 'small' | 'medium' | 'large' }>`
  font-size: ${props => 
    props.$size === 'small' ? '12px' : 
    props.$size === 'large' ? '20px' : '14px'
  };
  color: inherit;
  user-select: text;
`;

interface UserDisplayProps {
  username: string;
  profileIcon?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  showWalletFallback?: boolean;
  walletAddress?: string;
}

const UserDisplay: React.FC<UserDisplayProps> = ({
  username,
  profileIcon,
  size = 'medium',
  className,
  style,
  showWalletFallback = false,
  walletAddress
}) => {
  // If no profile icon and showWalletFallback is true, use default icon
  const displayIcon = profileIcon || (showWalletFallback ? '👤' : '');
  
  // If no username and we have wallet address, show truncated wallet
  const displayName = username || (walletAddress ? 
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
    'Unknown'
  );

  return (
    <UsernameContainer 
      $size={size} 
      className={className} 
      style={style}
      title={username ? `${displayIcon} ${username}` : displayName}
    >
      {displayIcon && (
        <ProfileIcon $size={size}>
          {displayIcon}
        </ProfileIcon>
      )}
      <Username $size={size}>
        {displayName}
      </Username>
    </UsernameContainer>
  );
};

export default UserDisplay;

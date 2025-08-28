import React from 'react';
import styled from 'styled-components';

const UsernameContainer = styled.div<{ $size?: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  font-weight: ${props => 
    props.$size === 'small' ? 'normal' : 'bold'
  };
  font-size: ${props => 
    props.$size === 'small' ? '12px' : 
    props.$size === 'large' ? '20px' : '14px'
  };
  /* Ensure emoji icons render properly on all platforms */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  /* Force hardware acceleration for better emoji rendering */
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

/**
 * Simplified approach: Display icon+username as a single string.
 * This makes it easy to show consistently across scoreboards, chat, etc.
 * Format: "🎮 Username" or "👤 Username" (fallback)
 */
const UserDisplay: React.FC<UserDisplayProps> = ({
  username,
  profileIcon,
  size = 'medium',
  className,
  style,
  showWalletFallback = false,
  walletAddress
}) => {
  // If no username and we have wallet address, show truncated wallet
  const displayName = username || (walletAddress ? 
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
    'Unknown'
  );

  // Create the display string with icon prefix
  const displayIcon = profileIcon || (showWalletFallback ? '👤' : '');
  const fullDisplayName = displayIcon ? `${displayIcon} ${displayName}` : displayName;

  return (
    <UsernameContainer 
      $size={size} 
      className={className} 
      style={style}
      title={fullDisplayName}
    >
      {fullDisplayName}
    </UsernameContainer>
  );
};

export default UserDisplay;

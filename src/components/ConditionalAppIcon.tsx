import React, { useState, useEffect } from 'react';
import DesktopAppIcon from './DesktopAppIcon';
import { hasAppPermission, getUserAccessLevel, AccessLevel } from 'utils/appPermissions';

interface ConditionalAppIconProps {
  appId: string;
  title: string;
  icon: string;
  onDoubleClick: () => void;
  requiredLevel?: AccessLevel[];
}

/**
 * Desktop app icon that only shows if user has permission
 */
const ConditionalAppIcon: React.FC<ConditionalAppIconProps> = ({
  appId,
  title,
  icon,
  onDoubleClick,
  requiredLevel
}) => {
  const [userAccessLevel, setUserAccessLevel] = useState<AccessLevel | null>(null);
  
  // Update access level when it changes
  useEffect(() => {
    const updateAccessLevel = () => {
      setUserAccessLevel(getUserAccessLevel());
    };
    
    // Initial check
    updateAccessLevel();
    
    // Listen for access level updates
    const handleAccessUpdate = () => {
      console.log(`🔄 Access level updated - rechecking permissions for ${appId}`);
      updateAccessLevel();
    };
    
    window.addEventListener('flunks-access-updated', handleAccessUpdate);
    
    return () => {
      window.removeEventListener('flunks-access-updated', handleAccessUpdate);
    };
  }, [appId]);
  
  // Check if user has permission to see this app
  const hasPermission = hasAppPermission(appId, userAccessLevel);
  
  // Don't render if no permission
  if (!hasPermission) {
    return null;
  }

  // Render the app icon
  return (
    <DesktopAppIcon
      title={title}
      icon={icon}
      onDoubleClick={onDoubleClick}
    />
  );
};

export default ConditionalAppIcon;

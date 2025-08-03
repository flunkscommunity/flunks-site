import React from 'react';
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
  const userAccessLevel = getUserAccessLevel();
  
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

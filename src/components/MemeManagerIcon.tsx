import React from 'react';
import DesktopAppIcon from '../components/DesktopAppIcon';
import { useWindowsContext } from '../contexts/WindowsContext';
import { WINDOW_IDS } from '../fixed';
import MemeManagerWindow from '../windows/MemeManagerWindow';

const MemeManagerIcon: React.FC = () => {
  const { openWindow } = useWindowsContext();

  const handleDoubleClick = () => {
    openWindow({
      key: WINDOW_IDS.MEME_MANAGER,
      window: <MemeManagerWindow onClose={() => {}} />
    });
  };

  return (
    <DesktopAppIcon
      title="Meme Manager"
      icon="/images/icons/high-school-icon.png" // You can change this to a specific meme icon
      onDoubleClick={handleDoubleClick}
    />
  );
};

export default MemeManagerIcon;

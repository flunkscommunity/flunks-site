import React from 'react';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  const handleClose = () => {
    closeWindow(WINDOW_IDS.USER_PROFILE);
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.USER_PROFILE}
      headerTitle="🔒 My Locker (Test)"
      onClose={handleClose}
      initialWidth="400px"
      initialHeight="300px"
      headerIcon="/images/icons/my-locker-icon.svg"
    >
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Test Locker Window</h2>
        <p>This is a simplified test to debug the React error.</p>
        <p>If you see this, the component structure is working.</p>
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

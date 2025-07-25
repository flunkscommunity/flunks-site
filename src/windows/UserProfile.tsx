import React, { useState } from 'react';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useTrialMode } from 'contexts/TrialModeContext';
import { useWindowsContext } from 'contexts/WindowsContext';
import UserProfileForm from 'components/UserProfile/UserProfileForm';
import UserProfileDisplay from 'components/UserProfile/UserProfileDisplay';
import { Button, Frame, Checkbox } from 'react95';
import { WINDOW_IDS } from 'fixed';

const UserProfileWindow: React.FC = () => {
  const { primaryWallet } = useDynamicContext();
  const { isTrialMode, mockWallet } = useTrialMode();
  const { closeWindow } = useWindowsContext();
  const { profile, loading, hasProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [useRPGStyle, setUseRPGStyle] = useState(true);

  const handleClose = () => {
    closeWindow(WINDOW_IDS.USER_PROFILE);
  };

  // In trial mode, use mock wallet, otherwise use primary wallet
  const hasWallet = isTrialMode ? mockWallet : primaryWallet;

  if (!hasWallet) {
    return (
      <DraggableResizeableWindow
        windowsId={WINDOW_IDS.USER_PROFILE}
        headerTitle="👤 User Profile"
        onClose={handleClose}
        initialWidth="400px"
        initialHeight="300px"
        headerIcon="/images/icons/user.png"
      >
        <div className="p-6 text-center">
          <Frame variant="field" className="p-4">
            <div className="space-y-4">
              <div className="text-lg">🔒 Wallet Required</div>
              <div className="text-sm">
                {isTrialMode 
                  ? "Please connect trial wallet to access profile features"
                  : "Please connect your wallet to access profile features"
                }
              </div>
            </div>
          </Frame>
        </div>
      </DraggableResizeableWindow>
    );
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFormClose = () => {
    setIsEditing(false);
  };

  // Show form if editing or if user doesn't have a profile yet
  const showForm = isEditing || (!hasProfile && !loading);

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.USER_PROFILE}
      headerTitle={`👤 ${showForm ? (hasProfile ? 'Edit Profile' : 'Create Profile') : 'User Profile'}`}
      onClose={handleClose}
      initialWidth="700px"
      initialHeight="650px"
      headerIcon="/images/icons/user.png"
      resizable
    >
      <div className="h-full overflow-auto">
        {showForm ? (
          <div>
            {/* Style Toggle */}
            {!useRPGStyle && (
              <div className="p-4 border-b">
                <Checkbox
                  checked={useRPGStyle}
                  onChange={(e) => setUseRPGStyle(e.target.checked)}
                  label="🎮 Use Retro RPG Style"
                />
              </div>
            )}
            
            <UserProfileForm
              onClose={hasProfile ? handleFormClose : handleClose}
              isEditMode={hasProfile}
              useRPGStyle={useRPGStyle}
            />
          </div>
        ) : (
          <div className="p-4">
            <UserProfileDisplay
              onEdit={handleEditClick}
            />
          </div>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfileWindow;

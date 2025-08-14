import React from 'react';
import { Button, Frame, Window, WindowHeader, WindowContent } from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useWindowsContext } from 'contexts/WindowsContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { WINDOW_IDS } from 'fixed';
import UserProfile from 'windows/UserProfile';

interface ProfilePromptProps {
  onDismiss?: () => void;
  autoShow?: boolean;
}

const UserProfilePrompt: React.FC<ProfilePromptProps> = ({ 
  onDismiss,
  autoShow = false 
}) => {
  const { primaryWallet } = useDynamicContext();
  const { hasProfile, loading } = useUserProfile();
  const { openWindow } = useWindowsContext();

  // Don't show if wallet not connected, loading, or user already has profile
  if (!primaryWallet?.address || loading || hasProfile) {
    return null;
  }

  const handleCreateProfile = () => {
    openWindow({
      key: WINDOW_IDS.USER_PROFILE,
      window: <UserProfile />
    });
    onDismiss?.();
  };

  if (autoShow) {
    // Auto-show as a toast/notification
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Frame variant="window" className="p-4 bg-yellow-50 border-yellow-300">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <span className="font-bold">Welcome to Flunks!</span>
            </div>
            <div className="text-sm">
              Create your profile to connect with other Flunks community members
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateProfile} size="sm">
                ✨ Create Profile
              </Button>
              <Button onClick={onDismiss} size="sm" variant="flat">
                Later
              </Button>
            </div>
          </div>
        </Frame>
      </div>
    );
  }

  // Regular window mode
  return (
    <Window className="w-full max-w-md mx-auto">
      <WindowHeader>
        <span>👤 Create Your Profile</span>
      </WindowHeader>
      <WindowContent>
        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-bold text-lg mb-2">
              Welcome to the Flunks Community!
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Create a profile to personalize your experience and connect with other Flunks
            </div>
          </div>

          <Frame variant="field" className="p-3 bg-blue-50">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Choose a unique username</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Link your Discord (optional)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Add email for updates (optional)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Connected to wallet: {primaryWallet?.address?.slice(0, 8)}...</span>
              </div>
            </div>
          </Frame>

          <div className="flex gap-2 justify-end">
            <Button onClick={onDismiss} variant="flat">
              Skip for Now
            </Button>
            <Button onClick={handleCreateProfile}>
              � Create My Locker
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            You can always create your profile later from the Start menu
          </div>
        </div>
      </WindowContent>
    </Window>
  );
};

export default UserProfilePrompt;

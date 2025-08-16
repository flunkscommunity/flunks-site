import React, { useState, useEffect } from 'react';
import { Button, Frame, Window, WindowHeader, WindowContent } from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useWindowsContext } from 'contexts/WindowsContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { WINDOW_IDS } from 'fixed';
import LockerSystemNew from 'windows/LockerSystemNew';
import RPGProfileForm from './RPGProfileForm';

interface UserProfilePromptProps {
  onDismiss?: () => void;
  autoShow?: boolean;
  showToast?: boolean; // New prop to control toast visibility
}

const UserProfilePrompt: React.FC<UserProfilePromptProps> = ({ 
  onDismiss, 
  autoShow = false,
  showToast = false
}) => {
  const { primaryWallet } = useDynamicContext();
  const { hasProfile, loading } = useUserProfile();
  const { openWindow } = useWindowsContext();
  const [showRPGForm, setShowRPGForm] = useState(false);

  // Auto-show the RPG form when wallet connects and no profile exists
  useEffect(() => {
    if (autoShow && primaryWallet?.address && !loading && !hasProfile && !showRPGForm) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        console.log('Auto-showing RPG profile form');
        setShowRPGForm(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [primaryWallet?.address, loading, hasProfile, autoShow, showRPGForm]);

  // Don't show anything if wallet not connected, loading, or user already has profile
  if (!primaryWallet?.address || loading || hasProfile) {
    return null;
  }

  const handleCreateProfile = () => {
    console.log('Create Profile button clicked - opening RPG form');
    setShowRPGForm(true);
  };

  const handleRPGClose = () => {
    setShowRPGForm(false);
    onDismiss?.();
  };

  const handleRPGComplete = () => {
    setShowRPGForm(false);
    onDismiss?.();
    // Profile was successfully created, the UserProfileContext will update automatically
  };

  // If we should show the RPG form (either auto or manual)
  if (showRPGForm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative">
          <RPGProfileForm 
            onComplete={handleRPGComplete} 
            onCancel={handleRPGClose} 
          />
        </div>
      </div>
    );
  }

  // Show the toast in bottom-right if:
  // 1. showToast prop is explicitly true, OR
  // 2. autoShow is enabled and either we haven't auto-shown yet, or we have auto-shown but aren't currently showing the RPG form
  if (showToast || (autoShow && !showRPGForm)) {
    // Show toast notification in bottom right corner
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
              ✨ Create My Locker
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

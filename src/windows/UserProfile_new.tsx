import React, { useState } from 'react';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import UserProfileForm from 'components/UserProfile/UserProfileForm';
import UserProfileDisplay from 'components/UserProfile/UserProfileDisplay';
import RPGProfileDisplay from 'components/UserProfile/RPGProfileDisplay';
import { Button, Frame, Checkbox } from 'react95';
import { WINDOW_IDS } from 'fixed';

const UserProfileWindow: React.FC = () => {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { closeWindow } = useWindowsContext();
  const { profile, loading, hasProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [useRPGStyle, setUseRPGStyle] = useState(true);

  const handleClose = () => {
    closeWindow(WINDOW_IDS.USER_PROFILE);
  };

  if (!primaryWallet) {
    return (
      <DraggableResizeableWindow
        windowsId={WINDOW_IDS.USER_PROFILE}
        headerTitle="🎮 Flunks Academy"
        onClose={handleClose}
        initialWidth="600px"
        initialHeight="480px"
        headerIcon="/images/icons/user.png"
      >
        <div 
          className="h-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
            fontFamily: 'monospace',
            color: '#fff'
          }}
        >
          {/* Animated starfield background */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 8 + 4}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 1}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center space-y-8 px-8">
            {/* Main Title - Classic game style */}
            <div className="space-y-4">
              <div 
                className="text-5xl font-bold tracking-wider"
                style={{
                  fontFamily: 'monospace',
                  textShadow: '4px 4px 0 #ff6b6b, 8px 8px 0 #4ecdc4',
                  color: '#ffd93d',
                  letterSpacing: '0.1em'
                }}
              >
                FLUNKS
              </div>
              <div 
                className="text-2xl font-bold tracking-widest"
                style={{
                  fontFamily: 'monospace',
                  textShadow: '2px 2px 0 #333',
                  color: '#ff6b6b',
                  letterSpacing: '0.2em'
                }}
              >
                ACADEMY
              </div>
            </div>

            {/* Subtitle */}
            <div 
              className="text-lg"
              style={{
                color: '#4ecdc4',
                textShadow: '1px 1px 0 #000',
                letterSpacing: '0.1em'
              }}
            >
              ~ PROFILE SYSTEM ~
            </div>

            {/* Spacer */}
            <div className="h-12"></div>

            {/* Blinking "CONNECT WALLET" text */}
            <div 
              className="text-2xl font-bold cursor-pointer"
              onClick={() => setShowAuthFlow(true)}
              style={{
                fontFamily: 'monospace',
                color: '#ffd93d',
                textShadow: '2px 2px 0 #ff6b6b',
                letterSpacing: '0.15em',
                animation: 'blink 1.5s infinite'
              }}
            >
              CONNECT WALLET
            </div>

            {/* Instructions */}
            <div 
              className="text-sm mt-8"
              style={{
                color: '#a0a0a0',
                letterSpacing: '0.05em'
              }}
            >
              DAPPER • LILICO SUPPORTED
            </div>

            {/* Copyright/Version info like old games */}
            <div 
              className="absolute bottom-4 left-4 text-xs"
              style={{ color: '#666' }}
            >
              © 2025 FLUNKS
            </div>
            <div 
              className="absolute bottom-4 right-4 text-xs"
              style={{ color: '#666' }}
            >
              V1.0
            </div>
          </div>

          {/* CSS for the blinking animation */}
          <style jsx>{`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0.3; }
            }
          `}</style>
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
            {/* Style Toggle - Always show */}
            <div className="p-4 border-b bg-gray-100">
              <Checkbox
                checked={useRPGStyle}
                onChange={(e) => setUseRPGStyle(e.target.checked)}
                label="🎮 Use Epic RPG Style"
              />
            </div>
            
            <UserProfileForm
              onClose={hasProfile ? handleFormClose : handleClose}
              isEditMode={hasProfile}
              useRPGStyle={useRPGStyle}
            />
          </div>
        ) : (
          <div className="h-full">
            {/* Style Toggle */}
            <div className="p-4 border-b bg-gray-100">
              <Checkbox
                checked={useRPGStyle}
                onChange={(e) => setUseRPGStyle(e.target.checked)}
                label="🎮 Use Epic RPG Style"
              />
            </div>
            
            {useRPGStyle ? (
              <RPGProfileDisplay onEdit={handleEditClick} />
            ) : (
              <div className="p-4">
                <UserProfileDisplay onEdit={handleEditClick} />
              </div>
            )}
          </div>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfileWindow;

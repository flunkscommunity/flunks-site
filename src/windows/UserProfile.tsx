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
        headerTitle="⚔️ Adventurer's Gate"
        onClose={handleClose}
        initialWidth="480px"
        initialHeight="400px"
        headerIcon="/images/icons/user.png"
      >
        <div 
          className="h-full flex items-center justify-center p-6"
          style={{
            background: 'linear-gradient(135deg, #2a4a72 0%, #1e3a5f 50%, #0f1419 100%)',
            fontFamily: 'monospace',
            color: '#fff'
          }}
        >
          <div 
            className="relative p-8 max-w-md w-full"
            style={{
              background: 'linear-gradient(145deg, #4a5568 0%, #2d3748 100%)',
              border: '4px solid #a0aec0',
              borderRadius: '12px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.4)',
            }}
          >
            {/* RPG-style corner decorations */}
            <div 
              className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400"
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            />
            <div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400"
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
            />
            <div 
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400"
              style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
            />
            <div 
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-400"
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
            />

            <div className="text-center space-y-6">
              {/* Main icon */}
              <div className="text-6xl mb-4">🏰</div>
              
              {/* Title with 8-bit styling */}
              <div 
                className="text-xl font-bold mb-2"
                style={{
                  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                  color: '#ffd700'
                }}
              >
                ⚔️ QUEST GATE SEALED ⚔️
              </div>
              
              {/* Message text */}
              <div 
                className="text-sm leading-relaxed px-2"
                style={{ color: '#e2e8f0' }}
              >
                "Brave adventurer! To enter these sacred halls and forge your legend, 
                you must first prove your identity with a mystical wallet connection."
              </div>
              
              {/* Connect button with RPG styling */}
              <div className="mt-6">
                <button
                  onClick={() => setShowAuthFlow(true)}
                  className="relative group w-full py-3 px-6 text-lg font-bold transition-all duration-200"
                  style={{
                    background: 'linear-gradient(145deg, #48bb78 0%, #38a169 50%, #2f855a 100%)',
                    border: '3px solid #68d391',
                    borderRadius: '8px',
                    color: '#fff',
                    textShadow: '1px 1px 0 #000',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
                    transform: 'translateY(0)',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(2px)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)';
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    � Connect Wallet
                  </span>
                </button>
              </div>
              
              {/* Footer text */}
              <div 
                className="text-xs italic mt-4"
                style={{ color: '#a0aec0' }}
              >
                Compatible with Dapper & Lilico enchantments
              </div>
              
              {/* Animated sparkles */}
              <div className="absolute top-4 right-4 text-yellow-300 animate-pulse">✨</div>
              <div className="absolute bottom-4 left-4 text-blue-300 animate-pulse" style={{ animationDelay: '1s' }}>💫</div>
            </div>
          </div>
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

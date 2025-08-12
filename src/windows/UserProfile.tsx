import React, { useState, useRef } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error } = useLockerInfo();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [devBypass, setDevBypass] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConnected = !!primaryWallet?.address || devBypass;
  const lockerNumber = devBypass ? 999 : (lockerInfo?.locker_number || null);
  const isLoading = devBypass ? false : loading;

  const handleConnectWallet = () => {
    console.log('🔄 Triggering setShowAuthFlow...');
    if (!devBypass) {
      setShowAuthFlow(true);
    }
  };

  const toggleDevBypass = () => {
    if (process.env.NODE_ENV === 'development') {
      setDevBypass(!devBypass);
    }
  };

  const handleCreateProfile = () => {
    alert('Welcome Flunks holder! 🎉\n\nTo get your locker assigned automatically:\n\n1. Join our Discord server\n2. Use the #get-locker channel\n3. Your locker will be assigned within 24 hours\n\nWallet: ' + (primaryWallet?.address?.slice(0, 12) || 'N/A') + '...');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be under 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DraggableResizeableWindow
      headerTitle="My Locker"
      windowsId={WINDOW_IDS.USER_PROFILE}
      onClose={() => closeWindow(WINDOW_IDS.USER_PROFILE)}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(145deg, 
            #8B6914 0%, 
            #A0732B 15%, 
            #B8834A 35%, 
            #A0732B 65%, 
            #8B6914 85%, 
            #6B5409 100%
          )
        `,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"MS Sans Serif", sans-serif',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse at center, 
              rgba(184,131,74,0.9) 0%, 
              rgba(139,105,20,0.95) 70%, 
              rgba(107,84,8,1) 100%
            )
          `,
          border: '4px solid #654321',
          borderRadius: '12px',
          position: 'relative',
          padding: '20px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
        }}>
          
          {/* Dev Bypass Button */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={toggleDevBypass}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: devBypass ? '#e74c3c' : '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1000
              }}
              title={devBypass ? 'Disable Dev Bypass' : 'Enable Dev Bypass'}
            >
              {devBypass ? 'DEV ON' : 'DEV'}
            </button>
          )}
          
          {/* Vintage Brass Nameplate */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `
              linear-gradient(145deg, 
                #DEB887 0%, 
                #F5DEB3 20%, 
                #FFE4B5 40%, 
                #F5DEB3 60%, 
                #DEB887 80%, 
                #CD853F 100%
              )
            `,
            color: '#654321',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '13px',
            border: '3px solid #8B4513',
            boxShadow: `
              0 4px 8px rgba(0,0,0,0.4),
              inset 0 1px 3px rgba(255,255,255,0.6),
              inset 0 -1px 3px rgba(139,69,19,0.4)
            `,
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
            fontFamily: '"Times New Roman", serif',
            letterSpacing: '1.5px'
          }}>
            {isLoading ? 'LOADING...' : 
             error ? 'ERROR' :
             lockerNumber ? 'LOCKER #' + lockerNumber + (devBypass ? ' (DEV)' : '') :
             isConnected ? 'ASSIGNING LOCKER...' :
             'CONNECT WALLET'}
          </div>

          {/* Main Content */}
          {!isConnected ? (
            <div style={{
              width: '100%',
              height: '80%',
              marginTop: '50px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '25px',
              background: `
                radial-gradient(ellipse at center, 
                  rgba(245,222,179,0.1) 0%, 
                  rgba(139,105,20,0.05) 70%, 
                  transparent 100%
                )
              `
            }}>
              <div style={{
                textAlign: 'center',
                color: '#F5DEB3',
                fontSize: '16px',
                fontStyle: 'italic',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                fontFamily: '"Times New Roman", serif',
                padding: '15px',
                background: 'rgba(139,69,19,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(245,222,179,0.3)'
              }}>
                Connect Flow wallet to unlock your vintage locker
              </div>

              <button
                onClick={handleConnectWallet}
                style={{
                  background: `
                    linear-gradient(145deg, 
                      #B8834A 0%, 
                      #DEB887 30%, 
                      #F5DEB3 50%, 
                      #DEB887 70%, 
                      #B8834A 100%
                    )
                  `,
                  color: '#654321',
                  border: '3px solid #8B4513',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: `
                    0 6px 12px rgba(0,0,0,0.4),
                    inset 0 1px 3px rgba(255,255,255,0.6),
                    inset 0 -1px 3px rgba(139,69,19,0.4)
                  `,
                  transition: 'all 0.3s ease',
                  marginBottom: '10px',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 100,
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  fontFamily: '"Times New Roman", serif',
                  letterSpacing: '0.5px'
                }}
              >
                🔐 Connect Flow Wallet to Store Items
              </button>

              {/* Alternative: Direct Dynamic Connect Button */}
              <div style={{ marginBottom: '10px' }}>
                <DynamicConnectButton>
                  <div style={{
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 100
                  }}>
                    🌊 Alternative: Direct Connect
                  </div>
                </DynamicConnectButton>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  textAlign: 'center',
                  color: '#95a5a6',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  marginTop: '10px'
                }}>
                  💡 Click "DEV" button to bypass login for testing
                </div>
              )}
            </div>
          ) : !lockerNumber && primaryWallet?.address && !devBypass ? (
            <div style={{
              width: '100%',
              height: '80%',
              marginTop: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#e67e22',
                fontSize: '14px',
                background: 'rgba(230, 126, 34, 0.1)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(230, 126, 34, 0.3)',
                marginBottom: '15px'
              }}>
                ⚠️ Wallet connected but no locker assigned
                <br />
                <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
                  Wallet: {primaryWallet.address.slice(0, 12)}...
                </span>
              </div>
              
              <button
                onClick={handleCreateProfile}
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                🔐 Get Your Locker
              </button>
            </div>
          ) : (
            /* Vintage Brass Locker Interior */
            <div style={{
              width: '100%',
              height: '100%',
              marginTop: '50px',
              padding: '15px',
              position: 'relative',
              background: `
                linear-gradient(135deg, 
                  rgba(160,115,43,0.2) 0%, 
                  rgba(245,222,179,0.1) 30%, 
                  rgba(184,131,74,0.15) 70%, 
                  rgba(139,105,20,0.25) 100%
                )
              `,
              borderRadius: '8px',
              border: '2px solid rgba(139,69,19,0.4)',
              boxShadow: 'inset 0 0 15px rgba(139,69,19,0.3)'
            }}>
              
              {/* Vintage Hook at Top */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '8px',
                background: `
                  linear-gradient(145deg, 
                    #DEB887 0%, 
                    #F5DEB3 50%, 
                    #DEB887 100%
                  )
                `,
                borderRadius: '4px',
                border: '1px solid #8B4513',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.6)'
              }} />

              {/* Upper Shelf - Vintage Items */}
              <div style={{
                position: 'absolute',
                top: '25px',
                left: '10px',
                right: '10px',
                height: '25px',
                background: `
                  linear-gradient(135deg, 
                    rgba(139,69,19,0.3) 0%, 
                    rgba(160,115,43,0.2) 50%, 
                    rgba(139,69,19,0.3) 100%
                  )
                `,
                borderRadius: '4px',
                border: '1px solid rgba(139,69,19,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 8px'
              }}>
                {/* Vintage Items */}
                <div style={{ fontSize: '12px' }}>📚</div>
                <div style={{ fontSize: '12px' }}>⚰️</div>
                <div style={{ fontSize: '12px' }}>🕯️</div>
                <div style={{ fontSize: '12px' }}>📜</div>
              </div>

              {/* Main Photo Section */}
              <div style={{
                position: 'absolute',
                top: '60px',
                left: '10px',
                right: '10px',
                height: '40%',
                display: 'flex',
                gap: '10px'
              }}>
                
                {/* Vintage Poster/Photo */}
                <div style={{
                  width: '100%',
                  height: '50%',
                  background: uploadedPhoto ? 'transparent' : `
                    linear-gradient(135deg, 
                      rgba(139,69,19,0.9) 0%, 
                      rgba(160,82,45,0.95) 50%,
                      rgba(139,69,19,1) 100%
                    )
                  `,
                  borderRadius: '3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '7px',
                  color: '#F5DEB3',
                  textAlign: 'center',
                  position: 'relative',
                  border: '2px solid #8B4513',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  transform: 'rotate(1deg)',
                  overflow: 'hidden',
                  cursor: uploadedPhoto ? 'default' : 'pointer'
                }}
                onClick={!uploadedPhoto ? triggerPhotoUpload : undefined}
                >
                  <div style={{ marginBottom: '3px', fontWeight: 'bold' }}>📸 UPLOAD PHOTO</div>
                  {uploadedPhoto ? (
                    <>
                      <img 
                        src={uploadedPhoto} 
                        alt="Profile" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, rgba(139,69,19,0.1) 0%, transparent 30%, transparent 70%, rgba(139,69,19,0.1) 100%)`,
                        pointerEvents: 'none'
                      }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(220,20,60,0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '14px',
                          height: '14px',
                          fontSize: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                        title="Remove photo"
                      >×</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '10px', marginBottom: '3px' }}>📷</div>
                      <div style={{ fontSize: '6px', fontStyle: 'italic', opacity: 0.8 }}>
                        Click to add your photo
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Shelf with Vintage Items */}
              <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '10px',
                right: '10px',
                height: '30px',
                background: `
                  linear-gradient(135deg, 
                    rgba(139,69,19,0.4) 0%, 
                    rgba(160,115,43,0.3) 50%, 
                    rgba(139,69,19,0.4) 100%
                  )
                `,
                borderRadius: '4px',
                border: '1px solid rgba(139,69,19,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 8px'
              }}>
                {/* Vintage Collection Items */}
                <div style={{ fontSize: '14px', transform: 'rotate(-5deg)' }}>⚱️</div>
                <div style={{ fontSize: '14px', transform: 'rotate(3deg)' }}>🗝️</div>
                <div style={{ fontSize: '14px', transform: 'rotate(-2deg)' }}>📖</div>
                <div style={{ fontSize: '14px', transform: 'rotate(7deg)' }}>🕰️</div>
              </div>

              {/* Vintage Wear Marks */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                width: '8px',
                height: '1px',
                background: 'rgba(107,78,8,0.4)',
                transform: 'rotate(15deg)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '25px',
                right: '10px',
                width: '10px',
                height: '1px',
                background: 'rgba(107,78,8,0.3)',
                transform: 'rotate(-20deg)'
              }} />
            </div>
          )}

          {/* Vintage Locker Base */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            right: '10px',
            height: '20px',
            background: `
              linear-gradient(135deg, 
                #654321 0%, 
                #8B4513 30%, 
                #A0522D 50%, 
                #8B4513 70%, 
                #654321 100%
              )
            `,
            borderRadius: '0 0 8px 8px',
            border: '2px solid #4A2C17',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 -2px 6px rgba(0,0,0,0.4)'
          }} />

          {/* Vintage Corner Reinforcements */}
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            width: '8px',
            height: '8px',
            background: '#8B4513',
            borderRadius: '50%',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
          }} />
          <div style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            width: '8px',
            height: '8px',
            background: '#8B4513',
            borderRadius: '50%',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '5px',
            width: '8px',
            height: '8px',
            background: '#8B4513',
            borderRadius: '50%',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '32px',
            right: '5px',
            width: '8px',
            height: '8px',
            background: '#8B4513',
            borderRadius: '50%',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
          }} />

          {/* Vintage Shadow Effect */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: `
              radial-gradient(ellipse at 30% 30%, 
                transparent 0%, 
                transparent 40%, 
                rgba(139,69,19,0.1) 70%, 
                rgba(107,84,8,0.2) 100%
              )
            `,
            pointerEvents: 'none',
            borderRadius: '15px'
          }} />

          {/* Air Vents */}
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                width: '40px',
                height: '3px',
                background: '#95a5a6',
                borderRadius: '2px'
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

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
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    alert('Welcome Flunks holder! 🎉\\n\\nTo get your locker assigned automatically:\\n\\n1. Join our Discord server\\n2. Use the #get-locker channel\\n3. Your locker will be assigned within 24 hours\\n\\nWallet: ' + (primaryWallet?.address?.slice(0, 12) || 'N/A') + '...');
  };

  // Smooth scroll to specific section
  const scrollToSection = (section: 1 | 2 | 3) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionHeight = container.scrollHeight / 3;
      const targetScrollTop = (section - 1) * sectionHeight;
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      
      setCurrentSection(section);
    }
  };

  // Handle scroll event to update current section
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const sectionHeight = container.scrollHeight / 3;
      
      if (scrollTop < sectionHeight * 0.5) {
        setCurrentSection(1);
      } else if (scrollTop < sectionHeight * 1.5) {
        setCurrentSection(2);
      } else {
        setCurrentSection(3);
      }
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
        position: 'relative',
        backgroundImage: 'url(/images/my-locker-front.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        // Fallback gradient if image doesn't load
        background: `
          linear-gradient(135deg, 
            #654321 0%, 
            #8B4513 20%, 
            #A0522D 40%, 
            #CD853F 60%, 
            #8B4513 80%, 
            #654321 100%
          )
        `,
        overflow: 'hidden'
      }}>
        
        {/* DEV button - top right corner */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={toggleDevBypass}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: devBypass ? '#2ecc71' : '#95a5a6',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              zIndex: 1000,
              opacity: 0.8
            }}
          >
            DEV
          </button>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F5DEB3',
            fontSize: '16px',
            background: 'rgba(0,0,0,0.7)'
          }}>
            🔄 Loading your locker...
          </div>
        
        /* Not connected state */
        ) : !isConnected ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: '#F5DEB3'
          }}>
            <div style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#F5DEB3',
              marginBottom: '10px'
            }}>
              🔐 Connect Flow wallet to unlock your vintage locker
            </div>

            <button
              onClick={handleConnectWallet}
              style={{
                background: `
                  linear-gradient(135deg, 
                    #D2691E 0%, 
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
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                fontFamily: '"Times New Roman", serif',
                letterSpacing: '0.5px'
              }}
            >
              🔐 Connect Flow Wallet to Store Items
            </button>

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
                  textAlign: 'center'
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
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: '#F5DEB3'
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
          /* 3-Level Scrollable Locker Interior */
          <>
            {/* Navigation Tabs */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              zIndex: 100
            }}>
              <button
                onClick={() => scrollToSection(1)}
                style={{
                  background: currentSection === 1 ? '#FFD700' : 'rgba(255,255,255,0.8)',
                  color: currentSection === 1 ? '#654321' : '#8B4513',
                  border: '2px solid #8B4513',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
                title="Top Section"
              >
                1
              </button>
              <button
                onClick={() => scrollToSection(2)}
                style={{
                  background: currentSection === 2 ? '#FFD700' : 'rgba(255,255,255,0.8)',
                  color: currentSection === 2 ? '#654321' : '#8B4513',
                  border: '2px solid #8B4513',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
                title="Middle Section"
              >
                2
              </button>
              <button
                onClick={() => scrollToSection(3)}
                style={{
                  background: currentSection === 3 ? '#FFD700' : 'rgba(255,255,255,0.8)',
                  color: currentSection === 3 ? '#654321' : '#8B4513',
                  border: '2px solid #8B4513',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
                title="Bottom Section"
              >
                3
              </button>
            </div>

            {/* Locker Number Display */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              color: '#FFD700',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid #8B4513',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              zIndex: 100
            }}>
              🔐 Locker #{lockerNumber}
            </div>

            {/* Scrollable Content Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              style={{
                position: 'absolute',
                top: '60px',
                left: '20px',
                right: '20px',
                bottom: '20px',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth',
                // Custom scrollbar
                scrollbarWidth: 'thin',
                scrollbarColor: '#8B4513 transparent'
              }}
            >
              {/* Section 1 - Top */}
              <div style={{
                height: '100vh',
                minHeight: '400px',
                backgroundImage: 'url(/images/inside-locker-1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // Fallback if image doesn't load
                background: `
                  linear-gradient(135deg, 
                    rgba(205, 133, 63, 0.9) 0%, 
                    rgba(160, 82, 45, 0.95) 50%,
                    rgba(139, 69, 19, 1) 100%
                  )
                `,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '3px solid #8B4513',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.7)',
                  color: '#FFD700',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>📚 Top Shelf</h2>
                  <p style={{ margin: '0', fontSize: '16px' }}>Your most treasured items go here</p>
                  <div style={{ marginTop: '20px', fontSize: '48px' }}>🎓📖🏆</div>
                </div>
              </div>

              {/* Section 2 - Middle */}
              <div style={{
                height: '100vh',
                minHeight: '400px',
                backgroundImage: 'url(/images/inside-locker-2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // Fallback if image doesn't load
                background: `
                  linear-gradient(135deg, 
                    rgba(184, 134, 11, 0.9) 0%, 
                    rgba(139, 105, 20, 0.95) 50%,
                    rgba(107, 84, 8, 1) 100%
                  )
                `,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '3px solid #8B4513',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.7)',
                  color: '#FFD700',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>🎯 Middle Shelf</h2>
                  <p style={{ margin: '0', fontSize: '16px' }}>Daily essentials and favorite items</p>
                  <div style={{ marginTop: '20px', fontSize: '48px' }}>📱💻🎮</div>
                </div>
              </div>

              {/* Section 3 - Bottom */}
              <div style={{
                height: '100vh',
                minHeight: '400px',
                backgroundImage: 'url(/images/inside-locker-3.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // Fallback if image doesn't load
                background: `
                  linear-gradient(135deg, 
                    rgba(160, 115, 43, 0.9) 0%, 
                    rgba(139, 89, 19, 0.95) 50%,
                    rgba(101, 67, 33, 1) 100%
                  )
                `,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                borderRadius: '8px',
                border: '3px solid #8B4513',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.7)',
                  color: '#FFD700',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>👟 Bottom Shelf</h2>
                  <p style={{ margin: '0', fontSize: '16px' }}>Sports gear and heavy items</p>
                  <div style={{ marginTop: '20px', fontSize: '48px' }}>🎒⚽🏀</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error } = useLockerInfo();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [devBypass, setDevBypass] = useState(false);
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    alert('Welcome Flunks holder! 🎉\\n\\nTo get your locker assigned automatically:\\n\\n1. Join our Discord server\\n2. Use the #get-locker channel\\n3. Your locker will be assigned within 24 hours\\n\\nWallet: ' + (primaryWallet?.address?.slice(0, 12) || 'N/A') + '...');
  };

  // Smooth scroll to specific section
  const scrollToSection = (section: 1 | 2 | 3) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionHeight = container.scrollHeight / 3;
      const targetScrollTop = (section - 1) * sectionHeight;
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      
      setCurrentSection(section);
    }
  };

  // Handle scroll event to update current section
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const sectionHeight = container.scrollHeight / 3;
      
      if (scrollTop < sectionHeight * 0.5) {
        setCurrentSection(1);
      } else if (scrollTop < sectionHeight * 1.5) {
        setCurrentSection(2);
      } else {
        setCurrentSection(3);
      }
    }
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

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Background image size must be under 10MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedBackground(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerBackgroundUpload = () => {
    backgroundInputRef.current?.click();
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeBackground = () => {
    setUploadedBackground(null);
    setOverlayText('');
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = '';
    }
  };

  const downloadImage = () => {
    if (!uploadedBackground) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw background image
      ctx.drawImage(img, 0, 0);
      
      // Draw text overlay if present
      if (overlayText && ctx) {
        ctx.font = `bold ${textSize}px Arial`;
        ctx.fillStyle = textColor;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 2;
        
        const x = (canvas.width * textPosition.x) / 100;
        const y = (canvas.height * textPosition.y) / 100;
        
        // Add text stroke (outline)
        ctx.strokeText(overlayText, x, y);
        // Add text fill
        ctx.fillText(overlayText, x, y);
      }
      
      // Download the canvas as image
      const link = document.createElement('a');
      link.download = 'background-with-text.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = uploadedBackground;
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
        background: uploadedBackground ? 'transparent' : `
          linear-gradient(145deg, 
            #8B6914 0%, 
            #A0732B 15%, 
            #B8834A 35%, 
            #A0732B 65%, 
            #8B6914 85%, 
            #6B5409 100%
          )
        `,
        backgroundImage: uploadedBackground ? `url(${uploadedBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"MS Sans Serif", sans-serif',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: uploadedBackground ? 'rgba(139,105,20,0.3)' : `
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
                  width: '50%',
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
                  <div style={{ marginBottom: '3px', fontWeight: 'bold' }}>📸 PHOTO</div>
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
                        Click to add
                      </div>
                    </>
                  )}
                </div>

                {/* Background Upload Section */}
                <div style={{
                  width: '50%',
                  height: '50%',
                  background: uploadedBackground ? 'transparent' : `
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
                  transform: 'rotate(-1deg)',
                  overflow: 'hidden',
                  cursor: uploadedBackground ? 'default' : 'pointer'
                }}
                onClick={!uploadedBackground ? triggerBackgroundUpload : undefined}
                >
                  <div style={{ marginBottom: '3px', fontWeight: 'bold' }}>🖼️ BACKGROUND</div>
                  {uploadedBackground ? (
                    <>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundImage: `url(${uploadedBackground})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {overlayText && (
                          <div style={{
                            color: textColor,
                            fontSize: `${Math.max(textSize / 4, 6)}px`,
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            position: 'absolute',
                            left: `${textPosition.x}%`,
                            top: `${textPosition.y}%`,
                            transform: 'translate(-50%, -50%)',
                            whiteSpace: 'nowrap',
                            maxWidth: '90%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {overlayText}
                          </div>
                        )}
                      </div>
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
                          removeBackground();
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
                        title="Remove background"
                      >×</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '10px', marginBottom: '3px' }}>🖼️</div>
                      <div style={{ fontSize: '6px', fontStyle: 'italic', opacity: 0.8 }}>
                        Click to add
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Text Overlay Controls - Only show when background is uploaded */}
              {uploadedBackground && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: '140px',
                    left: '10px',
                    right: '10px',
                    height: '80px',
                    background: `
                      linear-gradient(135deg, 
                        rgba(139,69,19,0.8) 0%, 
                        rgba(160,115,43,0.9) 50%, 
                        rgba(139,69,19,0.8) 100%
                      )
                    `,
                    borderRadius: '4px',
                    border: '2px solid #8B4513',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '8px',
                    color: '#F5DEB3'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px', textAlign: 'center' }}>✏️ TEXT OVERLAY</div>
                    
                    <input
                      type="text"
                      placeholder="Enter overlay text..."
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '2px 4px',
                        fontSize: '8px',
                        border: '1px solid #654321',
                        borderRadius: '2px',
                        background: 'rgba(245,222,179,0.9)',
                        color: '#654321'
                      }}
                    />
                    
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <label style={{ fontSize: '7px', minWidth: '25px' }}>Color:</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        style={{
                          width: '20px',
                          height: '12px',
                          border: '1px solid #654321',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      />
                      
                      <label style={{ fontSize: '7px', minWidth: '25px', marginLeft: '8px' }}>Size:</label>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={textSize}
                        onChange={(e) => setTextSize(parseInt(e.target.value))}
                        style={{
                          width: '40px',
                          height: '8px'
                        }}
                      />
                      <span style={{ fontSize: '7px', minWidth: '20px' }}>{textSize}px</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <label style={{ fontSize: '7px', minWidth: '25px' }}>Position:</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={textPosition.x}
                        onChange={(e) => setTextPosition({...textPosition, x: parseInt(e.target.value)})}
                        style={{ width: '30px', height: '8px' }}
                      />
                      <span style={{ fontSize: '7px' }}>H</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={textPosition.y}
                        onChange={(e) => setTextPosition({...textPosition, y: parseInt(e.target.value)})}
                        style={{ width: '30px', height: '8px' }}
                      />
                      <span style={{ fontSize: '7px' }}>V</span>
                    </div>
                  </div>

                  {/* Large Preview Section */}
                  <div style={{
                    position: 'absolute',
                    top: '230px',
                    left: '10px',
                    right: '10px',
                    height: '120px',
                    background: 'transparent',
                    borderRadius: '4px',
                    border: '2px solid #8B4513',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${uploadedBackground})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {overlayText && (
                        <div style={{
                          color: textColor,
                          fontSize: `${Math.max(textSize / 2, 10)}px`,
                          fontWeight: 'bold',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                          position: 'absolute',
                          left: `${textPosition.x}%`,
                          top: `${textPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          whiteSpace: 'nowrap',
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          userSelect: 'none'
                        }}>
                          {overlayText}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#F5DEB3',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        fontSize: '7px',
                        fontWeight: 'bold'
                      }}>
                        🖼️ PREVIEW
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        display: 'flex',
                        gap: '4px'
                      }}>
                        <button
                          onClick={downloadImage}
                          style={{
                            background: 'rgba(0,100,0,0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            padding: '2px 6px',
                            fontSize: '7px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                          title="Download image with text overlay"
                        >
                          💾 DOWNLOAD
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bottom Shelf with Vintage Items */}
              <div style={{
                position: 'absolute',
                bottom: uploadedBackground ? '-20px' : '40px',
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

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleBackgroundUpload}
      />
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

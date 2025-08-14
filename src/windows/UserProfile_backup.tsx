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

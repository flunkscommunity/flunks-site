import React, { useState, useRef, useEffect } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import MobileWalletHelper from '../components/MobileWalletHelper';
import { isMobileDevice } from '../utils/mobileWalletDetection';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo, useLockerAssignment } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';
import { getUserGumBalance } from '../utils/gumAPI';
import { useUserProfile } from '../contexts/UserProfileContext';
// WINDOW_IDS lives in src/fixed.ts (baseUrl set to src)
import { WINDOW_IDS } from 'fixed';

const LockerSystemNew: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error, refetch } = useLockerInfo();
  const { assignLocker, assigning } = useLockerAssignment();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { hasProfile, profile } = useUserProfile();
  const [devBypass, setDevBypass] = useState(false);
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3>(1);
  const [gumBalance, setGumBalance] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load gum balance when wallet connects
  useEffect(() => {
    if (primaryWallet?.address) {
      loadGumBalance();
    }
  }, [primaryWallet?.address]);

  // Listen for gum balance updates from floating button
  useEffect(() => {
    const handleGumUpdate = () => {
      loadGumBalance();
    };

    window.addEventListener('gumBalanceUpdated', handleGumUpdate);
    return () => window.removeEventListener('gumBalanceUpdated', handleGumUpdate);
  }, []);

  // Scroll position listener with snap-to-section behavior
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        // Determine which section user is closest to
        let targetSection: 1 | 2 | 3;
        if (scrollTop < containerHeight * 0.4) {
          targetSection = 1;
        } else if (scrollTop < containerHeight * 1.8) {
          targetSection = 2;
        } else {
          targetSection = 3;
        }
        
        // Only snap if we're not already in the middle of scrolling
        if (targetSection !== currentSection) {
          setCurrentSection(targetSection);
          
          // Smooth snap to the target section
          let targetScrollTop = 0;
          if (targetSection === 2) {
            targetScrollTop = containerHeight * 0.8;
          } else if (targetSection === 3) {
            targetScrollTop = containerHeight * 0.8 + containerHeight * 1.4;
          }
          
          // Use smooth scrolling to snap to position
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      // Add some debouncing to prevent excessive snapping
      let scrollTimeout: NodeJS.Timeout;
      
      const debouncedScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 150);
      };
      
      container.addEventListener('scroll', debouncedScroll);
      return () => {
        container.removeEventListener('scroll', debouncedScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [currentSection]);

  const loadGumBalance = async () => {
    if (!primaryWallet?.address) return;
    try {
      const balance = await getUserGumBalance(primaryWallet.address);
      setGumBalance(balance || 0);
    } catch (error) {
      console.error('Error loading gum balance:', error);
    }
  };

  // Toggle dev bypass mode
  const toggleDevBypass = () => {
    if (primaryWallet?.address === "0xe327216d843357f1") {
      setDevBypass(!devBypass);
    }
  };

  const handleCreateProfile = async () => {
    console.log('🚀 NEW SYSTEM: handleCreateProfile called - Checking for existing profile first!');
    
    if (!primaryWallet?.address) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      console.log('🚀 NEW SYSTEM: Calling assignLocker...');
      const result = await assignLocker();
      console.log('🚀 NEW SYSTEM: assignLocker result:', result);
      
      if (result.success) {
        alert(`🎉 SUCCESS! ${result.message}\n\nYour locker is now ready to use!\n\n✨ Your profile name is displayed in your locker!`);
        
        // Small delay to ensure database update is complete
        setTimeout(async () => {
          console.log('🔄 Refreshing locker info after assignment...');
          await refetch();
          
          // Force a complete component re-render by updating a state
          setCurrentSection(1); // Start at top
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to assign locker:', error);
      
      // Check if this is the "no profile" error
      if (error instanceof Error && error.message.includes('create your profile first')) {
        alert(`🎯 CREATE YOUR CHARACTER FIRST!\n\n${error.message}\n\n➡️ Please go through the character creation process in the main app to set up your username, then return here to get your locker assigned.`);
      } else if (error instanceof Error && error.message.includes('character profile first')) {
        alert(`🎯 COMPLETE YOUR PROFILE!\n\n${error.message}\n\n➡️ Your profile needs a proper username to get a locker assigned.`);
      } else {
        alert(`❌ Failed to assign locker: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
      }
    }
  };

  // Simple smooth scroll to specific section
  const scrollToSection = (section: 1 | 2 | 3) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerHeight = container.clientHeight;
      
      let targetScrollTop = 0;
      
      if (section === 1) {
        targetScrollTop = 0;
      } else if (section === 2) {
        targetScrollTop = containerHeight * 0.8;
      } else if (section === 3) {
        targetScrollTop = containerHeight * 0.8 + containerHeight * 1.4;
      }
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      
      setCurrentSection(section);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && currentSection > 1) {
      e.preventDefault();
      scrollToSection((currentSection - 1) as 1 | 2 | 3);
    } else if (e.key === 'ArrowDown' && currentSection < 3) {
      e.preventDefault();
      scrollToSection((currentSection + 1) as 1 | 2 | 3);
    } else if (e.key === '1') {
      e.preventDefault();
      scrollToSection(1);
    } else if (e.key === '2') {
      e.preventDefault();
      scrollToSection(2);
    } else if (e.key === '3') {
      e.preventDefault();
      scrollToSection(3);
    }
  };

  return (
    <DraggableResizeableWindow
      headerTitle="My Locker"
      windowsId={WINDOW_IDS.USER_PROFILE}
      onClose={() => closeWindow(WINDOW_IDS.USER_PROFILE)}
    >
      <style>{`
        @keyframes gumEarnings {
          0% { opacity: 0; transform: translateX(-50%) scale(0.5) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.2) translateY(-20px); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(-40px); }
        }
        
        @keyframes lockerGlow {
          0% { box-shadow: 0 0 20px rgba(40, 167, 69, 0.3); }
          50% { box-shadow: 0 0 40px rgba(40, 167, 69, 0.6), 0 0 80px rgba(40, 167, 69, 0.3); }
          100% { box-shadow: 0 0 20px rgba(40, 167, 69, 0.3); }
        }
        
        @keyframes jacketSway {
          0% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        
        @keyframes scrollIndicator {
          0% { opacity: 1; transform: translateY(0px); }
          50% { opacity: 0.5; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .locker-section {
          animation: fadeInUp 1s ease-out;
        }
        
        .jacket-container:hover {
          animation: jacketSway 2s ease-in-out infinite;
        }
        
        .scroll-indicator {
          animation: scrollIndicator 2s ease-in-out infinite;
        }
        
        .progress-bar {
          transition: width 0.1s ease-out;
          background: linear-gradient(90deg, #40a9ff, #1890ff, #096dd9);
        }
      `}</style>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundImage: 'url(/images/my-locker-front.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      >
        {/* DEV BYPASS TOGGLE - Hidden click area */}
        <div 
          onClick={toggleDevBypass}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50px',
            height: '50px',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 1000
          }}
        />

        {/* Loading State */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>🔄 Loading locker info...</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Checking Supabase database</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>❌ Error loading locker</div>
            <div style={{ fontSize: '12px' }}>{error}</div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* No Wallet Connected */}
            {!primaryWallet && (
              <div style={{
                textAlign: 'center',
                maxWidth: '400px'
              }}>
                <div style={{
                  background: 'rgba(255, 193, 7, 0.9)',
                  color: '#000',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔐</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Connect Your Wallet</div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>
                    Connect your wallet to access the new automatic locker system
                  </div>
                </div>

                {/* Mobile-specific wallet guidance */}
                {isMobileDevice() && (
                  <MobileWalletHelper 
                    showDebugInfo={false}
                    onWalletSelected={(walletType) => {
                      console.log('Selected mobile wallet:', walletType);
                    }}
                  />
                )}
                
                <DynamicConnectButton>
                  <button style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                  }}>
                    🔗 Connect Wallet
                  </button>
                </DynamicConnectButton>
              </div>
            )}

            {/* Wallet Connected - Show Locker System */}
            {primaryWallet && (
              <>
                {/* Already Has Locker */}
                {lockerInfo?.locker_number && (
                  <div 
                    ref={scrollContainerRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflowY: 'auto',
                      scrollBehavior: 'smooth',
                      position: 'relative'
                    }}
                  >
                    {/* Scrolling Progress Bar */}
                    <div style={{
                      position: 'fixed',
                      top: '0',
                      left: '0',
                      right: '0',
                      height: '4px',
                      background: 'rgba(255,255,255,0.2)',
                      zIndex: 1000
                    }}>
                      <div 
                        className="progress-bar"
                        style={{
                          height: '100%',
                          width: `${(currentSection - 1) * 50}%`,
                          borderRadius: '0 2px 2px 0'
                        }}
                      />
                    </div>

                    {/* Navigation Controls */}
                    <div style={{
                      position: 'fixed',
                      bottom: '100px',
                      right: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      zIndex: 1000
                    }}>
                      {/* Section Navigation */}
                      {[1, 2, 3].map((section) => (
                        <button
                          key={section}
                          onClick={() => scrollToSection(section as 1 | 2 | 3)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            background: currentSection === section 
                              ? 'linear-gradient(145deg, #40a9ff, #1890ff)'
                              : 'rgba(255,255,255,0.2)',
                            color: currentSection === section ? 'white' : '#666',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            boxShadow: currentSection === section 
                              ? '0 4px 15px rgba(64, 169, 255, 0.4)'
                              : '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          {section === 1 ? '🏠' : section === 2 ? '👕' : '📚'}
                        </button>
                      ))}
                    </div>
                    {/* Keyboard Shortcuts Hint */}
                    <div style={{
                      position: 'fixed',
                      top: '20px',
                      left: '20px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      opacity: 0.6,
                      zIndex: 1000,
                      backdropFilter: 'blur(10px)'
                    }}>
                      🎯 1,2,3: Jump to section | ↑↓: Navigate
                    </div>

                    {/* Navigation Controls */}
                    <div style={{
                      position: 'fixed',
                      bottom: '100px',
                      right: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      zIndex: 1000
                    }}>
                      {/* Section Navigation */}
                      {[1, 2, 3].map((section) => (
                        <button
                          key={section}
                          onClick={() => scrollToSection(section as 1 | 2 | 3)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            background: currentSection === section 
                              ? 'linear-gradient(145deg, #40a9ff, #1890ff)'
                              : 'rgba(255,255,255,0.2)',
                            color: currentSection === section ? 'white' : '#666',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            boxShadow: currentSection === section 
                              ? '0 4px 15px rgba(64, 169, 255, 0.4)'
                              : '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          {section === 1 ? '🏠' : section === 2 ? '👕' : '📚'}
                        </button>
                      ))}
                    </div>

                    {/* Section 1: Top */}
                    <div className="locker-section" style={{
                      height: '80vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        background: 'rgba(40, 167, 69, 0.95)',
                        color: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '400px',
                        animation: currentSection === 1 ? 'lockerGlow 3s ease-in-out infinite' : 'none',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏠</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                          LOCKER #{lockerInfo.locker_number}
                        </div>
                        {lockerInfo.username && (
                          <div style={{ fontSize: '18px', marginBottom: '15px', color: '#90EE90' }}>
                            👤 {lockerInfo.username}
                          </div>
                        )}
                        <div style={{ fontSize: '16px', marginBottom: '20px', opacity: 0.9 }}>
                          Welcome to your personal locker!
                        </div>
                        <div className="scroll-indicator" style={{ 
                          fontSize: '14px', 
                          marginTop: '20px',
                          cursor: 'pointer'
                        }}
                        onClick={() => scrollToSection(2)}
                        >
                          ⬇️ Scroll down to explore
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Middle (Letter Jacket with Enhanced Effects) */}
                    <div className="locker-section" style={{
                      height: '140vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                      position: 'relative'
                    }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '40px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>👕</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                          Letter Jacket Section
                        </div>
                        
                        {/* Enhanced CSS Letter Jacket with Hover Effects */}
                        <div className="jacket-container" style={{
                          position: 'relative',
                          width: '120px',
                          height: '140px',
                          margin: '20px auto',
                          background: 'linear-gradient(145deg, #1a365d, #2d3748)',
                          borderRadius: '60px 60px 20px 20px',
                          border: '3px solid #4299e1',
                          boxShadow: `
                            0 8px 25px rgba(0,0,0,0.5),
                            inset 0 2px 10px rgba(255,255,255,0.1)
                          `,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: currentSection === 2 ? 'scale(1.05)' : 'scale(1)'
                        }}>
                          {/* Animated Letter */}
                          <div style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: '#ffd700',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.5)',
                            fontFamily: 'serif',
                            animation: currentSection === 2 ? 'pulse 2s ease-in-out infinite' : 'none'
                          }}>
                            F
                          </div>
                          
                          {/* Enhanced Sleeves with Gradient */}
                          <div style={{
                            position: 'absolute',
                            left: '-15px',
                            top: '20px',
                            width: '25px',
                            height: '60px',
                            background: 'linear-gradient(145deg, #1a365d, #2d3748, #4a5568)',
                            borderRadius: '15px',
                            border: '2px solid #4299e1',
                            boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.1)'
                          }} />
                          <div style={{
                            position: 'absolute',
                            right: '-15px',
                            top: '20px',
                            width: '25px',
                            height: '60px',
                            background: 'linear-gradient(145deg, #1a365d, #2d3748, #4a5568)',
                            borderRadius: '15px',
                            border: '2px solid #4299e1',
                            boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.1)'
                          }} />
                          
                          {/* Glowing Collar */}
                          <div style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '35px',
                            right: '35px',
                            height: '20px',
                            background: 'linear-gradient(145deg, #4299e1, #63b3ed)',
                            borderRadius: '10px 10px 0 0',
                            border: '2px solid #2b6cb0',
                            boxShadow: '0 0 15px rgba(66, 153, 225, 0.4)'
                          }} />
                          
                          {/* Sparkle Effects for when focused */}
                          {currentSection === 2 && (
                            <>
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '4px',
                                height: '4px',
                                background: '#ffd700',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px #ffd700',
                                animation: 'pulse 1.5s ease-in-out infinite'
                              }} />
                              <div style={{
                                position: 'absolute',
                                bottom: '15px',
                                left: '15px',
                                width: '6px',
                                height: '6px',
                                background: '#40a9ff',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px #40a9ff',
                                animation: 'pulse 2s ease-in-out infinite 0.5s'
                              }} />
                            </>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                          Your Flunks varsity letter jacket hangs here proudly.
                          <br />
                          <em style={{ color: '#ffd700', fontSize: '13px' }}>
                            A symbol of your community membership
                          </em>
                        </div>
                        
                        <div className="scroll-indicator" style={{ 
                          fontSize: '12px', 
                          opacity: 0.6, 
                          marginTop: '15px',
                          cursor: 'pointer'
                        }}
                        onClick={() => scrollToSection(3)}
                        >
                          ⬇️ Continue to storage area
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Bottom (Enhanced Storage Area) */}
                    <div className="locker-section" style={{
                      height: '80vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
                      position: 'relative'
                    }}>
                      <div style={{
                        background: 'rgba(108, 117, 125, 0.95)',
                        color: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transform: currentSection === 3 ? 'scale(1.02)' : 'scale(1)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>📚</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                          Storage Section
                        </div>
                        
                        {/* Interactive Storage Items */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          margin: '20px 0',
                          gap: '10px'
                        }}>
                          {['📖', '🎒', '📝', '🗂️'].map((item, index) => (
                            <div key={index} style={{
                              fontSize: '24px',
                              padding: '10px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              animation: currentSection === 3 ? `fadeInUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.2) rotate(5deg)';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
                          This is the bottom section of your locker where you can store
                          books, supplies, and other items. Everything is organized
                          and easily accessible.
                        </div>
                        
                        <div style={{ 
                          fontSize: '12px', 
                          marginTop: '15px', 
                          opacity: 0.7,
                          cursor: 'pointer',
                          padding: '8px',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          transition: 'background 0.3s ease'
                        }}
                        onClick={() => scrollToSection(1)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        >
                          ⬆️ Back to top
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Locker Yet - Show Assignment Button */}
                {!lockerInfo?.locker_number && (
                  <div style={{
                    textAlign: 'center',
                    maxWidth: '400px'
                  }}>
                    <div style={{
                      background: 'rgba(255, 193, 7, 0.9)',
                      color: '#000',
                      padding: '20px',
                      borderRadius: '12px',
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
                      disabled={assigning}
                      style={{
                        background: assigning ? '#95a5a6' : '#ff0000', // BRIGHT RED TO CONFIRM NEW VERSION
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: assigning ? 'not-allowed' : 'pointer',
                        boxShadow: '0 6px 15px rgba(255,0,0,0.3)',
                        transition: 'all 0.3s ease',
                        opacity: assigning ? 0.7 : 1
                      }}
                    >
                      {assigning ? '⏳ Checking Profile...' : '🏠 GET YOUR LOCKER'}
                    </button>
                    
                    <div style={{
                      textAlign: 'center',
                      fontSize: '14px',
                      color: '#28a745',
                      fontWeight: 'bold',
                      marginTop: '15px',
                      padding: '10px',
                      background: 'rgba(40, 167, 69, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(40, 167, 69, 0.3)'
                    }}>
                      ✨ Uses your character profile name!
                      <br />
                      <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
                        Create your character first, then get your locker assigned
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* RETRO 90's GUM COUNTER */}
        {primaryWallet?.address && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(145deg, #c0c0c0, #808080)',
            border: '3px ridge #c0c0c0',
            borderRadius: '8px',
            padding: '8px 16px',
            fontFamily: 'MS Sans Serif, sans-serif',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#000',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '150px',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'linear-gradient(45deg, #ff00ff, #ff69b4)',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3)'
            }}>
              🍬
            </div>
            <div style={{
              background: '#000',
              color: '#00ff00',
              fontFamily: 'Courier New, monospace',
              fontSize: '11px',
              padding: '2px 6px',
              border: '1px inset #c0c0c0',
              minWidth: '60px',
              textAlign: 'center',
              textShadow: '0 0 2px #00ff00'
            }}>
              {gumBalance.toLocaleString()}
            </div>
            <span style={{ fontSize: '10px', color: '#333' }}>GUM</span>
          </div>
        )}

        {/* DEV BYPASS INDICATOR */}
        {devBypass && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            DEV MODE
          </div>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default LockerSystemNew;

import React, { useState, useRef } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo, useLockerAssignment } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';

const LockerSystemNew: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error, refetch } = useLockerInfo();
  const { assignLocker, assigning } = useLockerAssignment();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [devBypass, setDevBypass] = useState(false);
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
          setCurrentSection(2); // Switch to middle section to show locker
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

  // Smooth scroll to specific section
  const scrollToSection = (section: 1 | 2 | 3) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerHeight = container.clientHeight;
      
      let targetScrollTop = 0;
      
      if (section === 1) {
        targetScrollTop = 0;
      } else if (section === 2) {
        targetScrollTop = containerHeight * 0.8; // After top section
      } else if (section === 3) {
        targetScrollTop = containerHeight * 0.8 + containerHeight * 1.4; // After top + middle
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
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentSection === 1) {
        setCurrentSection(2);
      } else if (currentSection === 2) {
        setCurrentSection(3);
      } else {
        setCurrentSection(3);
      }
    }
  };

  return (
    <DraggableResizeableWindow
      headerTitle="🚀 NEW LOCKER SYSTEM - SUPABASE POWERED!"
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
                      scrollBehavior: 'smooth'
                    }}
                  >
                    {/* Section 1: Top */}
                    <div style={{
                      height: '80vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        background: 'rgba(40, 167, 69, 0.95)',
                        color: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '400px'
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
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>
                          ✨ Automatically assigned via Supabase
                        </div>
                        <div style={{ fontSize: '14px', marginTop: '20px' }}>
                          Scroll down to explore your locker sections
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Middle (Expanded for Letter Jacket) */}
                    <div style={{
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
                        maxWidth: '500px'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>👕</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                          Letter Jacket Section
                        </div>
                        
                        {/* CSS Letter Jacket */}
                        <div style={{
                          position: 'relative',
                          width: '120px',
                          height: '140px',
                          margin: '20px auto',
                          background: 'linear-gradient(145deg, #1a365d, #2d3748)',
                          borderRadius: '60px 60px 20px 20px',
                          border: '3px solid #4299e1',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {/* Letter */}
                          <div style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: '#ffd700',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                            fontFamily: 'serif'
                          }}>
                            F
                          </div>
                          
                          {/* Sleeves */}
                          <div style={{
                            position: 'absolute',
                            left: '-15px',
                            top: '20px',
                            width: '25px',
                            height: '60px',
                            background: 'linear-gradient(145deg, #1a365d, #2d3748)',
                            borderRadius: '15px',
                            border: '2px solid #4299e1'
                          }} />
                          <div style={{
                            position: 'absolute',
                            right: '-15px',
                            top: '20px',
                            width: '25px',
                            height: '60px',
                            background: 'linear-gradient(145deg, #1a365d, #2d3748)',
                            borderRadius: '15px',
                            border: '2px solid #4299e1'
                          }} />
                          
                          {/* Collar */}
                          <div style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '35px',
                            right: '35px',
                            height: '20px',
                            background: 'linear-gradient(145deg, #4299e1, #63b3ed)',
                            borderRadius: '10px 10px 0 0',
                            border: '2px solid #2b6cb0'
                          }} />
                        </div>
                        
                        <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                          Your Flunks varsity letter jacket hangs here proudly.
                          <br />
                          <span style={{ fontSize: '12px', opacity: 0.6 }}>
                            Scroll to see more locker sections
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Bottom */}
                    <div style={{
                      height: '80vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
                    }}>
                      <div style={{
                        background: 'rgba(108, 117, 125, 0.95)',
                        color: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        textAlign: 'center',
                        maxWidth: '400px'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>📚</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                          Storage Section
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
                          This is the bottom section of your locker where you can store
                          books, supplies, and other items. Everything is organized
                          and easily accessible.
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '15px', opacity: 0.7 }}>
                          End of locker - scroll up to navigate
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

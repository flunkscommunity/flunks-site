import React, { useState, useRef, useEffect } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo, useLockerAssignment } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../contexts/UserProfileContext';
import RPGProfileForm from '../components/UserProfile/RPGProfileForm';
import { GumDisplay } from '../components/GumDisplay';
import { useGum } from '../contexts/GumContext';
import { getActiveSpecialEvents, canParticipateInEvent, claimSpecialEvent, type SpecialEvent } from '../services/specialEventsService';
import { canClaimDailyLogin, claimDailyLogin } from '../services/dailyLoginService';

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error, refetch } = useLockerInfo();
  const { assignLocker, assigning } = useLockerAssignment();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { profile, hasProfile, loading: profileLoading } = useUserProfile();
  const { balance, refreshBalance, refreshStats } = useGum();
  const [devBypass, setDevBypass] = useState(false);
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3>(1);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [claimingEvent, setClaimingEvent] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isConnected = !!primaryWallet?.address || devBypass;
  const lockerNumber = devBypass ? 999 : (lockerInfo?.locker_number || null);
  const isLoading = devBypass ? false : (loading || profileLoading);

  // Debug logging for profile state
  console.log('🏠 UserProfile Component State:', {
    isConnected,
    hasProfile,
    profile: profile?.username || 'none',
    walletAddress: primaryWallet?.address,
    profileLoading,
    lockerNumber,
    showProfileCreation,
    loading,
    devBypass,
    // Key render conditions:
    renderCondition: isLoading ? 'loading' : 
                    !isConnected ? 'not-connected' :
                    !lockerNumber && primaryWallet?.address && !devBypass ? 'need-profile-or-locker' :
                    'locker-interior'
  });

  // Check daily login status and load special events
  useEffect(() => {
    if (!primaryWallet?.address) return;
    
    const checkDailyStatus = async () => {
      const canClaim = await canClaimDailyLogin(primaryWallet!.address);
      setCanClaimDaily(canClaim);
    };
    
    const loadSpecialEvents = async () => {
      const events = await getActiveSpecialEvents();
      setSpecialEvents(events);
    };
    
    checkDailyStatus();
    loadSpecialEvents();
    
    // Set up interval to refresh special events
    const interval = setInterval(loadSpecialEvents, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [primaryWallet?.address]);

  const handleClaimDailyLogin = async () => {
    if (claimingDaily || !canClaimDaily || !primaryWallet?.address) return;
    
    setClaimingDaily(true);
    try {
      await claimDailyLogin(primaryWallet.address);
      setCanClaimDaily(false);
      await refreshBalance();
      await refreshStats();
    } catch (error) {
      console.error('Failed to claim daily login:', error);
      alert('Failed to claim daily bonus. Please try again.');
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleClaimSpecialEvent = async (eventId: string) => {
    if (claimingEvent || !primaryWallet?.address) return;
    
    setClaimingEvent(eventId);
    try {
      await claimSpecialEvent(eventId, primaryWallet.address);
      // Refresh events to remove claimed event
      const updatedEvents = await getActiveSpecialEvents();
      setSpecialEvents(updatedEvents);
      await refreshBalance();
      await refreshStats();
    } catch (error) {
      console.error('Failed to claim special event:', error);
      alert('Failed to claim event reward. Please try again.');
    } finally {
      setClaimingEvent(null);
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

  const handleCreateProfile = async () => {
    console.log('🔧 DEBUG: handleCreateProfile called');
    console.log('🔧 DEBUG: hasProfile:', hasProfile, 'devBypass:', devBypass);
    console.log('🔧 DEBUG: primaryWallet address:', primaryWallet?.address);
    
    if (!primaryWallet?.address) {
      alert('Please connect your wallet first!');
      return;
    }

    // Check if user has a proper profile first
    if (!hasProfile && !devBypass) {
      console.log('🎯 User needs to create profile first, showing profile creation form');
      console.log('🎯 Setting showProfileCreation to true');
      setShowProfileCreation(true);
      return;
    }

    try {
      console.log('🔧 DEBUG: Calling assignLocker...');
      const result = await assignLocker();
      console.log('🔧 DEBUG: assignLocker result:', result);
      
      if (result.success) {
        // Refresh the locker info to show the new assignment
        await refetch();
        alert(`🎉 Success! ${result.message}\n\nYour locker is now ready to use!`);
      }
    } catch (error) {
      console.error('Failed to assign locker:', error);
      
      // Check if this is a profile-related error
      if (error instanceof Error && error.message.includes('create your profile first')) {
        console.log('🎯 API says user needs profile, showing profile creation form');
        setShowProfileCreation(true);
        return;
      }
      
      alert(`❌ Failed to assign locker: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
    }
  };

  const handleProfileComplete = async () => {
    console.log('🎉 Profile creation completed, now assigning locker...');
    setShowProfileCreation(false);
    
    // Small delay to let the profile system update
    setTimeout(async () => {
      try {
        const result = await assignLocker();
        if (result.success) {
          await refetch();
          alert(`🎉 Welcome to Flunks! ${result.message}\n\nYour locker is ready!`);
        }
      } catch (error) {
        console.error('Failed to assign locker after profile creation:', error);
        alert(`❌ Profile created but failed to assign locker: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 1000);
  };

  // Smooth scroll to specific section
  const scrollToSection = (section: 1 | 2 | 3) => {
    // Scroll functionality disabled
    console.log(`Scroll to section ${section} disabled`);
    // if (scrollContainerRef.current) {
    //   const container = scrollContainerRef.current;
    //   const containerHeight = container.clientHeight;
      
    //   let targetScrollTop = 0;
      
    //   if (section === 1) {
    //     targetScrollTop = 0;
    //   } else if (section === 2) {
    //     targetScrollTop = containerHeight * 0.8;
    //   } else if (section === 3) {
    //     targetScrollTop = containerHeight * 0.8 + containerHeight * 1.4;
    //   }
      
    //   container.scrollTo({
    //     top: targetScrollTop,
    //     behavior: 'smooth'
    //   });
      
    //   setCurrentSection(section);
    // }
  };

  // Handle scroll event to update current section
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      const topHeight = containerHeight * 0.8;
      const middleHeight = containerHeight * 1.4;
      
      if (scrollTop < topHeight * 0.5) {
        setCurrentSection(1);
      } else if (scrollTop < topHeight + middleHeight * 0.5) {
        setCurrentSection(2);
      } else {
        setCurrentSection(3);
      }
    }
  };

  return (
    <DraggableResizeableWindow
      headerTitle="🔄 My Locker (NEW AUTO SYSTEM)"
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
        background: `linear-gradient(135deg, #654321 0%, #8B4513 20%, #A0522D 40%, #CD853F 60%, #8B4513 80%, #654321 100%)`,
        overflow: 'hidden'
      }}>
        
        {/* DEV button - top left corner */}
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

        {/* Profile Creation Modal Overlay */}
        {(() => {
          if (showProfileCreation) {
            console.log('🎯 RENDERING: Profile creation modal is showing');
            return (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999
              }}>
                <RPGProfileForm
                  onComplete={handleProfileComplete}
                  onCancel={() => {
                    console.log('🎯 Profile creation cancelled');
                    setShowProfileCreation(false);
                  }}
                />
              </div>
            );
          }
          return null;
        })()}

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
                background: `linear-gradient(135deg, #D2691E 0%, #F5DEB3 50%, #DEB887 70%, #B8834A 100%)`,
                color: '#654321',
                border: '3px solid #8B4513',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: `0 6px 12px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 3px rgba(139,69,19,0.4)`,
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
        
        /* No locker but wallet connected - Need profile or locker assignment */
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
              fontSize: '16px',
              background: 'rgba(230, 126, 34, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid rgba(230, 126, 34, 0.3)',
              marginBottom: '20px'
            }}>
              🎉 Welcome to Flunks High School!
              <br />
              <span style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '10px', display: 'block' }}>
                Wallet: {primaryWallet.address.slice(0, 12)}...
              </span>
              <br />
              <span style={{ fontSize: '14px', color: '#f39c12' }}>
                {hasProfile ? 
                  `✅ Profile created as: ${profile?.username}` : 
                  '🎯 Ready to create your profile and get your locker!'
                }
              </span>
            </div>
            
            <button
              onClick={handleCreateProfile}
              disabled={assigning}
              style={{
                background: assigning ? '#95a5a6' : '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: assigning ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                opacity: assigning ? 0.7 : 1
              }}
            >
              {assigning ? '🔄 Setting up your locker...' : 
               hasProfile ? '🏠 Get Your Locker Now!' : 
               '✨ Create Profile & Get Locker'}
            </button>
            
            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#bdc3c7',
              fontStyle: 'italic',
              marginTop: '10px',
              maxWidth: '400px',
              lineHeight: '1.4'
            }}>
              {hasProfile ? 
                '🎓 Your profile is ready! Click above to get your personal locker assigned.' :
                '🌈 Create your profile, then get your locker!'
              }
            </div>
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
              {[1, 2, 3].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section as 1 | 2 | 3)}
                  style={{
                    background: currentSection === section ? '#FFD700' : 'rgba(255,255,255,0.8)',
                    color: currentSection === section ? '#654321' : '#8B4513',
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
                  title={`Section ${section}`}
                >
                  {section}
                </button>
              ))}
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
              🔐 Locker #{lockerNumber} {profile?.username && `- ${profile.username}`}
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
                scrollbarWidth: 'thin',
                scrollbarColor: '#8B4513 transparent'
              }}
            >
              {/* Section 1 - Top Shelf */}
              <div style={{
                height: '80vh',
                minHeight: '300px',
                backgroundImage: 'url(/images/inside-locker-1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                background: `linear-gradient(135deg, rgba(205, 133, 63, 0.9) 0%, rgba(160, 82, 45, 0.95) 50%, rgba(139, 69, 19, 1) 100%)`,
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

              {/* Section 2 - Middle Area */}
              <div style={{
                height: '140vh',
                minHeight: '600px',
                backgroundImage: 'url(/images/inside-locker-2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                background: `linear-gradient(135deg, rgba(184, 134, 11, 0.9) 0%, rgba(139, 105, 20, 0.95) 50%, rgba(107, 84, 8, 1) 100%)`,
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
                  background: 'rgba(0,0,0,0.8)',
                  color: '#FFD700',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>🎽 Middle Area</h2>
                  <p style={{ margin: '0', fontSize: '16px' }}>Your varsity jacket and memories</p>
                  <div style={{ marginTop: '20px', fontSize: '48px' }}>👕🏅📸</div>
                </div>
              </div>

              {/* Section 3 - Gum Information Panel */}
              <div style={{
                height: '80vh',
                minHeight: '300px',
                background: `linear-gradient(135deg, rgba(50, 168, 82, 0.9) 0%, rgba(34, 139, 34, 0.95) 50%, rgba(25, 111, 25, 1) 100%)`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '20px',
                borderRadius: '8px',
                border: '3px solid #228B22',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                gap: '15px'
              }}>
                {/* Gum Balance Display */}
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: '#90EE90',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #32CD32',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#90EE90' }}>🟢 Gum Balance</h2>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0' }}>
                    {balance} GUM
                  </div>
                </div>

                {/* Daily Login Section */}
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: '#90EE90',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #32CD32',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#90EE90' }}>🌅 Daily Login Bonus</h3>
                  {canClaimDaily ? (
                    <button
                      onClick={handleClaimDailyLogin}
                      disabled={claimingDaily}
                      style={{
                        background: claimingDaily ? '#666' : '#32CD32',
                        color: '#000',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: claimingDaily ? 'not-allowed' : 'pointer',
                        width: '100%'
                      }}
                    >
                      {claimingDaily ? '⏳ Claiming...' : '🎁 Claim 15 GUM'}
                    </button>
                  ) : (
                    <div style={{ color: '#FFD700', fontSize: '14px' }}>
                      ✅ Already claimed today!
                    </div>
                  )}
                </div>

                {/* Special Events Section */}
                {specialEvents.length > 0 && (
                  <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#90EE90',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #FF6347',
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#FF6347' }}>🎉 Special Events</h3>
                    {specialEvents.map((event) => (
                      <div key={event.id} style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '14px', marginBottom: '5px', color: '#FFD700' }}>
                          {event.name}
                        </div>
                        <div style={{ fontSize: '12px', marginBottom: '8px', color: '#CCC' }}>
                          {event.gum_reward} GUM • Ends: {new Date(event.end_time).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handleClaimSpecialEvent(event.id)}
                          disabled={claimingEvent === event.id}
                          style={{
                            background: claimingEvent === event.id ? '#666' : '#FF6347',
                            color: '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: claimingEvent === event.id ? 'not-allowed' : 'pointer',
                            width: '100%'
                          }}
                        >
                          {claimingEvent === event.id ? '⏳ Claiming...' : `🎁 Claim ${event.gum_reward} GUM`}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Daily Activities Info */}
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: '#90EE90',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #9370DB',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#9370DB' }}>🎯 Daily Activities</h3>
                  <div style={{ fontSize: '14px', color: '#CCC' }}>
                    Don't forget your daily check-in for GUM rewards!
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gum System Components - Only visible inside the locker */}
            <GumDisplay showDetailedStats={true} />
          </>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfile;

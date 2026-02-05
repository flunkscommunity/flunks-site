import React, { useState, useRef, useEffect } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo, useLockerAssignment } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';
import UnifiedConnectButton from '../components/UnifiedConnectButton';

// Check if running in Capacitor mobile app
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};
import { useUserProfile } from '../contexts/UserProfileContext';
import RPGProfileForm from '../components/UserProfile/RPGProfileForm';
import { GumDisplay } from '../components/GumDisplay';
import { useGum } from '../contexts/GumContext';
import { getActiveSpecialEvents, canParticipateInEvent, claimSpecialEvent, type SpecialEvent } from '../services/specialEventsService';
import { canClaimDailyLogin, claimDailyLogin } from '../services/dailyLoginService';
import { getChapter2ObjectivesStatus, getChapter3ObjectivesStatus, getChapter4ObjectivesStatus, getChapter5ObjectivesStatus, ChapterObjective } from '../utils/weeklyObjectives';

const UserProfile: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error, refetch } = useLockerInfo();
  const { assignLocker, assigning } = useLockerAssignment();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { connectFCL, isMobile, isConnected: unifiedIsConnected, address: unifiedAddress } = useUnifiedWallet();
  const { profile, hasProfile, loading: profileLoading } = useUserProfile();
  const { balance, refreshBalance, refreshStats } = useGum();
  const [devBypass, setDevBypass] = useState(false);
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3 | 4 | 5>(5); // Default to Chapter 5 - Paradise Motel
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [claimingEvent, setClaimingEvent] = useState<string | null>(null);
  const [chapter2Objectives, setChapter2Objectives] = useState<ChapterObjective[]>([]);
  const [chapter2Loading, setChapter2Loading] = useState(false);
  const [chapter3Objectives, setChapter3Objectives] = useState<ChapterObjective[]>([]);
  const [chapter3Loading, setChapter3Loading] = useState(false);
  const [chapter4Objectives, setChapter4Objectives] = useState<ChapterObjective[]>([]);
  const [chapter4Loading, setChapter4Loading] = useState(false);
  const [chapter5Objectives, setChapter5Objectives] = useState<ChapterObjective[]>([]);
  const [chapter5Loading, setChapter5Loading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use unified wallet state - works for both Dynamic (web) and FCL (mobile) connections
  const isConnected = unifiedIsConnected || !!primaryWallet?.address || devBypass;
  const lockerNumber = devBypass ? 999 : (lockerInfo?.locker_number || null);
  const isLoading = devBypass ? false : (loading || profileLoading);

  // Debug logging for profile state - disabled by default
  // Uncomment below to debug profile rendering issues:
  // console.log('🏠 UserProfile Component State:', { isConnected, hasProfile, profile: profile?.username });

  const loadChapter2Objectives = async () => {
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (!walletAddr) return;
    setChapter2Loading(true);
    try {
      const objectiveStatus = await getChapter2ObjectivesStatus(walletAddr);
      setChapter2Objectives(objectiveStatus.completedObjectives);
      console.log('📋 Chapter 2 objectives loaded:', objectiveStatus.completedObjectives);
    } catch (error) {
      console.error('❌ Failed to load Chapter 2 objectives:', error);
    } finally {
      setChapter2Loading(false);
    }
  };

  const loadChapter3Objectives = async () => {
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (!walletAddr) return;
    setChapter3Loading(true);
    try {
      const objectiveStatus = await getChapter3ObjectivesStatus(walletAddr);
      setChapter3Objectives(objectiveStatus.completedObjectives);
      console.log('📋 Chapter 3 objectives loaded:', objectiveStatus.completedObjectives);
    } catch (error) {
      console.error('❌ Failed to load Chapter 3 objectives:', error);
    } finally {
      setChapter3Loading(false);
    }
  };

  const loadChapter4Objectives = async () => {
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (!walletAddr) return;
    setChapter4Loading(true);
    try {
      const objectiveStatus = await getChapter4ObjectivesStatus(walletAddr);
      setChapter4Objectives(objectiveStatus.completedObjectives);
      console.log('📋 Chapter 4 objectives loaded:', objectiveStatus.completedObjectives);
    } catch (error) {
      console.error('❌ Failed to load Chapter 4 objectives:', error);
    } finally {
      setChapter4Loading(false);
    }
  };

  const loadChapter5Objectives = async () => {
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (!walletAddr) return;
    setChapter5Loading(true);
    try {
      const objectiveStatus = await getChapter5ObjectivesStatus(walletAddr);
      setChapter5Objectives(objectiveStatus.completedObjectives);
      console.log('📋 Chapter 5 objectives loaded:', objectiveStatus.completedObjectives);
    } catch (error) {
      console.error('❌ Failed to load Chapter 5 objectives:', error);
    } finally {
      setChapter5Loading(false);
    }
  };

  // Check daily login status and load special events
  useEffect(() => {
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (!walletAddr) return;
    
    const checkDailyStatus = async () => {
      const canClaim = await canClaimDailyLogin(walletAddr);
      setCanClaimDaily(canClaim);
    };
    
    const loadSpecialEvents = async () => {
      const events = await getActiveSpecialEvents();
      setSpecialEvents(events);
    };
    
    checkDailyStatus();
    loadSpecialEvents();
    loadChapter2Objectives();
    loadChapter3Objectives();
    loadChapter4Objectives();
    loadChapter5Objectives();
    
    // Set up interval to refresh special events
    const interval = setInterval(() => {
      loadSpecialEvents();
      loadChapter2Objectives();
      loadChapter3Objectives();
      loadChapter4Objectives();
      loadChapter5Objectives();
    }, 300000); // Check every 5 minutes (reduced from 30 seconds to minimize console noise)
    
    return () => clearInterval(interval);
  }, [unifiedAddress, primaryWallet?.address]);

  const handleFeedbackSubmit = async (feedback: string) => {
    // Handle feedback submission here
    console.log('Feedback submitted:', feedback);
    setFeedbackSubmitted(true);
    
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (walletAddr) {
      loadChapter2Objectives(); // Also refresh objectives
      loadChapter3Objectives(); // Also refresh Chapter 3 objectives
      loadChapter4Objectives(); // Also refresh Chapter 4 objectives
    }
  };

  const handleClaimDailyLogin = async () => {
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (claimingDaily || !canClaimDaily || !walletAddr) return;
    
    setClaimingDaily(true);
    try {
      await claimDailyLogin(walletAddr);
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
    const walletAddr = unifiedAddress || primaryWallet?.address;
    if (claimingEvent || !walletAddr) return;
    
    setClaimingEvent(eventId);
    try {
      await claimSpecialEvent(eventId, walletAddr);
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

  const handleConnectWallet = async () => {
    console.log('🔄 Triggering wallet connection...');
    if (devBypass) return;
    
    // Use FCL for mobile native apps, Dynamic for web
    if (isMobileApp() || isMobile) {
      console.log('📱 UserProfile: Using FCL for mobile wallet connection');
      try {
        await connectFCL();
      } catch (error) {
        console.error('Mobile wallet connection error:', error);
      }
    } else {
      console.log('🌐 UserProfile: Using Dynamic for web wallet connection');
      setShowAuthFlow(true);
    }
  };

  const toggleDevBypass = () => {
    if (process.env.NODE_ENV === 'development') {
      setDevBypass(!devBypass);
    }
  };

  const handleCreateProfile = async () => {
    // Get the active wallet address - unified address works for both Dynamic (web) and FCL (mobile)
    const activeWalletAddress = unifiedAddress || primaryWallet?.address;
    
    console.log('🔧 DEBUG: handleCreateProfile called');
    console.log('🔧 DEBUG: hasProfile:', hasProfile, 'devBypass:', devBypass);
    console.log('🔧 DEBUG: unifiedAddress:', unifiedAddress, 'primaryWallet address:', primaryWallet?.address);
    console.log('🔧 DEBUG: activeWalletAddress:', activeWalletAddress);
    
    if (!activeWalletAddress && !devBypass) {
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
  const scrollToSection = (section: 1 | 2 | 3 | 4 | 5) => {
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
      const gumSectionHeight = containerHeight * 0.8;
      const chapter3Height = containerHeight * 1.2;
      const chapter4Height = containerHeight * 1.2;
      
      if (scrollTop < topHeight * 0.5) {
        setCurrentSection(1);
      } else if (scrollTop < topHeight + middleHeight * 0.5) {
        setCurrentSection(2);
      } else if (scrollTop < topHeight + middleHeight + gumSectionHeight * 0.5) {
        setCurrentSection(3);
      } else if (scrollTop < topHeight + middleHeight + gumSectionHeight + chapter3Height * 0.5) {
        setCurrentSection(4);
      } else {
        setCurrentSection(5);
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
        background: `url(/images/my-locker-front.png), linear-gradient(135deg, #654321 0%, #8B4513 20%, #A0522D 40%, #CD853F 60%, #8B4513 80%, #654321 100%)`,
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
              <UnifiedConnectButton>
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
                  🔗 Connect Wallet
                </div>
              </UnifiedConnectButton>
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
        ) : !lockerNumber && (unifiedAddress || primaryWallet?.address) && !devBypass ? (
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
                Wallet: {(unifiedAddress || primaryWallet?.address || '').slice(0, 12)}...
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
              {[1, 2, 3, 4, 5].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section as 1 | 2 | 3 | 4 | 5)}
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

              {/* Section 2 - Week 2 Objectives */}
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
                justifyContent: 'flex-start',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '3px solid #8B4513',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                gap: '20px'
              }}>
                {/* Week 2 Title */}
                <div style={{
                  background: 'rgba(0,0,0,0.9)',
                  color: '#FFD700',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>📚 Week 2 Objectives</h2>
                  <p style={{ margin: '0', fontSize: '16px', color: '#DDD' }}>Complete challenges to earn GUM rewards</p>
                </div>

                {/* Objectives List */}
                <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {chapter2Loading ? (
                    <div style={{
                      background: 'rgba(0,0,0,0.8)',
                      color: '#FFD700',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '2px solid #8B4513'
                    }}>
                      <p style={{ margin: '0', fontSize: '16px' }}>🔄 Loading objectives...</p>
                    </div>
                  ) : chapter2Objectives.length > 0 ? (
                    chapter2Objectives.map((objective) => (
                      <div key={objective.id} style={{
                        background: objective.completed ? 'rgba(34, 139, 34, 0.9)' : 'rgba(0,0,0,0.8)',
                        color: objective.completed ? '#90EE90' : '#FFD700',
                        padding: '20px',
                        borderRadius: '8px',
                        border: objective.completed ? '2px solid #32CD32' : '2px solid #8B4513',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                              {objective.completed ? '✅' : '⏳'} {objective.title}
                            </h3>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>
                              {objective.description}
                            </p>
                            {objective.reward && (
                              <p style={{ 
                                margin: '0', 
                                fontSize: '12px', 
                                color: objective.completed ? '#90EE90' : '#FFD700',
                                fontWeight: 'bold'
                              }}>
                                🎁 Reward: {objective.reward} GUM
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {objective.completed && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#32CD32',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            COMPLETE
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: 'rgba(0,0,0,0.8)',
                      color: '#FFD700',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '2px solid #8B4513'
                    }}>
                      <p style={{ margin: '0', fontSize: '16px' }}>📋 No objectives available</p>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                {chapter2Objectives.length > 0 && (
                  <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#FFD700',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #8B4513',
                    width: '100%',
                    maxWidth: '300px'
                  }}>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      📊 Progress: {chapter2Objectives.filter(obj => obj.completed).length}/{chapter2Objectives.length}
                    </p>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      height: '8px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#32CD32',
                        height: '100%',
                        width: `${(chapter2Objectives.filter(obj => obj.completed).length / chapter2Objectives.length) * 100}%`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {/* Hint for digital lock */}
                <div style={{
                  background: 'rgba(139, 69, 19, 0.8)',
                  color: '#FFD700',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic' }}>
                    � Hint: Check out Jock's House → Bedroom → Under the Bed for a digital lock challenge!
                  </p>
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

              {/* Section 4 - Chapter 3: Picture Day */}
              <div style={{
                height: '120vh',
                minHeight: '600px',
                background: `linear-gradient(135deg, rgba(255, 20, 147, 0.9) 0%, rgba(199, 21, 133, 0.95) 50%, rgba(139, 69, 19, 1) 100%)`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '3px solid #FF1493',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                gap: '20px'
              }}>
                {/* Chapter 3 Title */}
                <div style={{
                  background: 'rgba(0,0,0,0.9)',
                  color: '#FFD700',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #FF1493',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>📸 Chapter 3: Picture Day</h2>
                  <p style={{ margin: '0', fontSize: '16px', color: '#DDD' }}>Vote for your favorite flunks in the yearbook!</p>
                </div>

                {/* Objectives List */}
                <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {chapter3Loading ? (
                    <div style={{
                      background: 'rgba(0,0,0,0.8)',
                      color: '#FFD700',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '2px solid #FF1493'
                    }}>
                      <p style={{ margin: '0', fontSize: '16px' }}>🔄 Loading objectives...</p>
                    </div>
                  ) : chapter3Objectives.length > 0 ? (
                    chapter3Objectives.map((objective) => (
                      <div key={objective.id} style={{
                        background: objective.completed ? 'rgba(34, 139, 34, 0.9)' : 'rgba(0,0,0,0.8)',
                        color: objective.completed ? '#90EE90' : '#FFD700',
                        padding: '20px',
                        borderRadius: '8px',
                        border: objective.completed ? '2px solid #32CD32' : '2px solid #FF1493',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                              {objective.completed ? '✅' : '⏳'} {objective.title}
                            </h3>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>
                              {objective.description}
                            </p>
                            {objective.reward && (
                              <p style={{ 
                                margin: '0', 
                                fontSize: '12px', 
                                color: objective.completed ? '#90EE90' : '#FF1493',
                                fontWeight: 'bold'
                              }}>
                                🎁 Reward: {objective.reward} GUM
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {objective.completed && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#32CD32',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            COMPLETE
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: 'rgba(0,0,0,0.8)',
                      color: '#FFD700',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '2px solid #FF1493'
                    }}>
                      <p style={{ margin: '0', fontSize: '16px' }}>📋 No objectives available</p>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                {chapter3Objectives.length > 0 && (
                  <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#FFD700',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #FF1493',
                    width: '100%',
                    maxWidth: '300px'
                  }}>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      📊 Progress: {chapter3Objectives.filter(obj => obj.completed).length}/{chapter3Objectives.length}
                    </p>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      height: '8px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#FF1493',
                        height: '100%',
                        width: `${(chapter3Objectives.filter(obj => obj.completed).length / chapter3Objectives.length) * 100}%`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {/* Link to Picture Day */}
                <div style={{
                  background: 'rgba(255, 20, 147, 0.8)',
                  color: '#FFD700',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #FF1493',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic' }}>
                    📸 Head to Picture Day to vote for your favorite flunks in each clique yearbook photo!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Section 5 - Chapter 4: Homecoming Dance */}
            <div style={{
              height: '120vh',
              minHeight: '600px',
              background: `linear-gradient(135deg, rgba(255, 165, 0, 0.9) 0%, rgba(255, 140, 0, 0.95) 50%, rgba(255, 99, 71, 1) 100%)`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '10px',
              border: '3px solid #FFA500',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
              gap: '20px'
            }}>
              {/* Chapter 4 Title */}
              <div style={{
                background: 'rgba(0,0,0,0.9)',
                color: '#FFD700',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                border: '2px solid #FFA500',
                width: '100%',
                maxWidth: '500px'
              }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🕺 Chapter 4: Homecoming Dance</h2>
                <p style={{ margin: '0', fontSize: '16px', color: '#DDD' }}>Dance the night away and find clues!</p>
              </div>

              {/* Objectives List */}
              <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {chapter4Loading ? (
                  <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#FFD700',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #FFA500'
                  }}>
                    <p style={{ margin: '0', fontSize: '16px' }}>🔄 Loading objectives...</p>
                  </div>
                ) : chapter4Objectives.length > 0 ? (
                  chapter4Objectives.map((objective) => (
                    <div key={objective.id} style={{
                      background: objective.completed ? 'rgba(34, 139, 34, 0.9)' : 'rgba(0,0,0,0.8)',
                      color: objective.completed ? '#90EE90' : '#FFD700',
                      padding: '20px',
                      borderRadius: '8px',
                      border: objective.completed ? '2px solid #32CD32' : '2px solid #FFA500',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                            {objective.completed ? '✅' : '⏳'} {objective.title}
                          </h3>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>
                            {objective.description}
                          </p>
                          {objective.reward && (
                            <p style={{ 
                              margin: '0', 
                              fontSize: '12px', 
                              color: objective.completed ? '#90EE90' : '#FFD700',
                              fontWeight: 'bold'
                            }}>
                              🎁 Reward: {objective.reward} GUM
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {objective.completed && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#32CD32',
                          color: '#000',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          COMPLETE
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#FFD700',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #FFA500'
                  }}>
                    <p style={{ margin: '0', fontSize: '16px' }}>📋 No objectives available</p>
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              {chapter4Objectives.length > 0 && (
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: '#FFD700',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #FFA500',
                  width: '100%',
                  maxWidth: '300px'
                }}>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                    📊 Progress: {chapter4Objectives.filter(obj => obj.completed).length}/{chapter4Objectives.length}
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    height: '8px',
                    marginTop: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#FFA500',
                      height: '100%',
                      width: `${(chapter4Objectives.filter(obj => obj.completed).length / chapter4Objectives.length) * 100}%`,
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              {/* Hint for homecoming dance */}
              <div style={{
                background: 'rgba(255, 165, 0, 0.8)',
                color: '#000',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
                border: '2px solid #FFA500',
                width: '100%',
                maxWidth: '400px'
              }}>
                <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic', fontWeight: 'bold' }}>
                  🕺 Visit the gymnasium in the high school for the one-time homecoming dance!
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                  💡 Navigate to the high school from the map and enter the gymnasium to find the dance floor.
                </p>
              </div>
            </div>

            {/* Section 6 - Chapter 5: Paradise Motel */}
            <div style={{
              height: '120vh',
              minHeight: '600px',
              background: `linear-gradient(135deg, rgba(139, 69, 19, 0.9) 0%, rgba(101, 67, 33, 0.95) 50%, rgba(160, 82, 45, 1) 100%)`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              gap: '20px'
            }}>
              {/* Chapter 5 Title */}
              <div style={{
                background: 'rgba(0,0,0,0.8)',
                color: '#CD853F',
                padding: '30px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '3px solid #8B4513',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🏨 Chapter 5: Paradise Motel</h2>
                  <p style={{ margin: '0', fontSize: '16px', color: '#DDD' }}>Explore the mysteries of the Paradise Motel</p>
                </div>

                {/* Objectives List */}
                <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {chapter5Loading ? (
                    <div style={{
                      background: 'rgba(0,0,0,0.8)',
                      color: '#CD853F',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '2px solid #8B4513'
                    }}>
                      <p style={{ margin: '0', fontSize: '16px' }}>🔄 Loading objectives...</p>
                    </div>
                  ) : chapter5Objectives.length > 0 ? (
                    chapter5Objectives.map((objective) => (
                      <div key={objective.id} style={{
                        background: objective.completed ? 'rgba(34, 139, 34, 0.9)' : 'rgba(0,0,0,0.8)',
                        color: objective.completed ? '#90EE90' : '#CD853F',
                        padding: '20px',
                        borderRadius: '8px',
                        border: objective.completed ? '2px solid #32CD32' : '2px solid #8B4513',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                              {objective.completed ? '✅' : '📋'} {objective.title}
                            </h3>
                            <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>
                              {objective.description}
                            </p>
                          </div>
                          {objective.reward && (
                            <div style={{
                              background: objective.completed ? 'rgba(50, 205, 50, 0.3)' : 'rgba(255,215,0,0.2)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: objective.completed ? '#90EE90' : '#FFD700',
                              border: objective.completed ? '1px solid #32CD32' : '1px solid #FFD700'
                            }}>
                              +{objective.reward} GUM
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: 'rgba(0,0,0,0.8)',
                      color: '#CD853F',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '2px solid #8B4513'
                    }}>
                      <p style={{ margin: '0', fontSize: '16px' }}>📋 No objectives available</p>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                {chapter5Objectives.length > 0 && (
                  <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#CD853F',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #8B4513',
                    width: '100%',
                    maxWidth: '300px'
                  }}>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      📊 Progress: {chapter5Objectives.filter(obj => obj.completed).length}/{chapter5Objectives.length}
                    </p>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      height: '8px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#CD853F',
                        height: '100%',
                        width: `${(chapter5Objectives.filter(obj => obj.completed).length / chapter5Objectives.length) * 100}%`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {/* Hint for Paradise Motel */}
                <div style={{
                  background: 'rgba(139, 69, 19, 0.8)',
                  color: '#FFF',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px solid #8B4513',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic', fontWeight: 'bold' }}>
                    🏨 The Paradise Motel awaits on the map...
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                    💡 More details coming soon!
                  </p>
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

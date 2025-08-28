import { type NextPage } from "next";
import Head from "next/head";
import CustomMonitor from "components/CustomMonitor";
import DesktopAppIcon from "components/DesktopAppIcon";
import React, { useEffect, useMemo, useState } from "react";
import YourStudents from "windows/YourStudents";
import ProjectJnr from "windows/ProjectJnr";
import AboutUs from "windows/AboutUs";
import { ProgressBar } from "react95";
import { useTheme } from "styled-components";
import { animated, config, useSpring } from "@react-spring/web";
import useGettingStarted from "store/useGettingStarted";
import Welcome from "windows/Welcome";
import Onlyflunks from "../windows/Onlyflunks";
import { useRouter } from "next/router";
import Semester0Map from "windows/Semester0Map";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import FlunksTerminal from "windows/FlunksTerminal";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";
import AccessGate from "components/AccessGate";
import FlappyFlunkWindow from "windows/Games/FlappyFlunkWindow";
import RadioPlayer from "components/RadioPlayer";
import FHSSchool from "windows/FHSSchool";
import MyPlace from "windows/MyPlace";
import FlunksMessenger from "windows/FlunksMessenger";
import FlunkCreator from "windows/FlunkCreator";
import LockerSystemNew from "windows/LockerSystemNew";
import GameManualWindow from "windows/GameManualWindow";
import MemeManagerWindow from "windows/MemeManagerWindow";
import SimpleBrowser from "windows/SimpleBrowser";
import DevPreview from "windows/DevPreview";
import ReportCard from "windows/ReportCard";
import IconAnimationWindow from "windows/IconAnimationWindow";
import BulletinBoard from "windows/BulletinBoard";
import Yearbook from "windows/Yearbook";
import AccessLevelStatus from "components/AccessLevelStatus";
import ConditionalAppIcon from "components/ConditionalAppIcon";
import { getUserAccessLevel } from "utils/appPermissions";
import { BACKGROUND_CONFIG } from "config/backgroundConfig";
import useThemeSettings from "store/useThemeSettings";
import RPGProfileForm from "components/UserProfile/RPGProfileForm";
import { useUserProfile } from "contexts/UserProfileContext";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

import { GumAdminPanel } from "components/GumAdminPanel";
import { TimeConfigAdmin } from "components/DayNightHouse";

const FullScreenLoader = () => {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const fadeOutSpring = useSpring({
    from: { opacity: 1, scale: 1 },
    to: {
      opacity: complete ? 0 : 1,
      scale: complete ? 1.5 : 1,
    },
    config: config.slow,
  });
  const theme = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setComplete(true);
          return 0;
        }
        return Math.min(prev + Math.random() * 10, 100);
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <animated.div
      className="bg-black pointer-events-none fixed inset-0 z-[1001] bg-cover bg-center flex flex-col items-center justify-end gap-10"
      style={{ backgroundImage: `url('/images/loading/bootup.webp')`, ...fadeOutSpring }}
    >
      <span className="text-3xl font-bold animate-pulse">Starting Flunks 95</span>
      <ProgressBar
        variant="tile"
        style={{ backgroundColor: (theme as any).background || "#fff" }}
        value={Math.floor(percent)}
      />
    </animated.div>
  );
};

const Desktop = () => {
  const router = useRouter();
  const { windows, openWindow, closeWindow, windowApps } = useWindowsContext();
  const { showGettingStartedOnStartup } = useGettingStarted();
  const [showGumAdmin, setShowGumAdmin] = useState(false);
  const [showTimeAdmin, setShowTimeAdmin] = useState(false);
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { hasProfile, profile } = useUserProfile();

  // Keyboard shortcut for gum admin panel (Ctrl+G) and time admin (Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setShowGumAdmin(prev => !prev);
      }
      if (event.ctrlKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        setShowTimeAdmin(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

useEffect(() => {
  if (showGettingStartedOnStartup) {
    openWindow({ key: WINDOW_IDS.WELCOME, window: <Welcome /> });
  }
}, []);

const windowsMemod = useMemo(() => (
  <>
    {Object.entries(windows).map(([key, window]) => {
      const app = windowApps.find((a) => a.key === key);
      
      // Special handling for radio - keep it mounted but hidden when minimized
      if (app?.isMinimized) {
        if (key === WINDOW_IDS.RADIO_PLAYER) {
          return (
            <div key={key} style={{ display: 'none' }}>
              {window as React.ReactNode}
            </div>
          );
        }
        return null;
      }
      
      return <React.Fragment key={key}>{window as React.ReactNode}</React.Fragment>;
    })}
  </>
), [windows, windowApps]);

  return (
    <>
      <div className="h-full w-full overflow-auto p-4 touch-pan-y">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8 min-h-full w-full items-start justify-items-center">
          {/* 1. OnlyFlunks */}
          <ConditionalAppIcon
            appId="onlyflunks"
          title="OnlyFlunks"
          icon="/images/icons/onlyflunks.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.FLUNKS_HUB, window: <Onlyflunks /> })}
        />

        {/* 2. My Locker */}
        <ConditionalAppIcon
          appId="my-locker"
          title="My Locker"
          icon="/images/icons/locker-icon.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.USER_PROFILE, window: <LockerSystemNew /> })}
        />

        {/* 3. Create Profile - Show for BETA+ users */}
        {(() => {
          const userAccessLevel = getUserAccessLevel();
          const showCreateProfile = userAccessLevel && ['ADMIN', 'BETA', 'COMMUNITY'].includes(userAccessLevel);
          
          if (!showCreateProfile) return null;
          
          return (
            <ConditionalAppIcon
              appId="create-profile"
              title={hasProfile ? `Edit ${profile?.username || 'Profile'}` : "Create Profile"}
              icon="/images/icons/astro-mascot.png"
              onDoubleClick={() => {
                // If no wallet connected, show sign-in prompt
                if (!primaryWallet?.address) {
                  openWindow({
                    key: 'PROFILE_SIGNIN_PROMPT',
                    window: (
                      <DraggableResizeableWindow
                        windowsId="PROFILE_SIGNIN_PROMPT"
                        onClose={() => closeWindow('PROFILE_SIGNIN_PROMPT')}
                        headerTitle="Sign In Required"
                        headerIcon="/images/icons/astro-mascot.png"
                        initialWidth="400px"
                        initialHeight="300px"
                        resizable={false}
                        style={{ zIndex: 1000 }}
                      >
                        <div style={{ 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '30px',
                          textAlign: 'center',
                          color: 'white'
                        }}>
                          <img 
                            src="/images/icons/astro-mascot.png" 
                            alt="Flunks Astronaut" 
                            style={{ width: '64px', height: '80px', marginBottom: '20px' }}
                          />
                          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Create Your Profile</h2>
                          <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.4' }}>
                            Connect your wallet to create your Semester Zero character profile and get your locker assigned!
                          </p>
                          <button
                            onClick={() => {
                              closeWindow('PROFILE_SIGNIN_PROMPT');
                              setShowAuthFlow(true);
                            }}
                            style={{
                              background: '#ffffff',
                              color: '#8b5cf6',
                              border: '2px solid #8b5cf6',
                              borderRadius: '8px',
                              padding: '12px 24px',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#8b5cf6';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.color = '#8b5cf6';
                            }}
                          >
                            🔗 Connect Wallet
                          </button>
                        </div>
                      </DraggableResizeableWindow>
                    )
                  });
                  return;
                }
                
                // If wallet connected, show profile form
                openWindow({
                  key: 'PROFILE_CREATOR',
                  window: (
                    <DraggableResizeableWindow
                      windowsId="PROFILE_CREATOR"
                      onClose={() => closeWindow('PROFILE_CREATOR')}
                      headerTitle={hasProfile ? "Edit Your Flunks Profile" : "Create Your Flunks Profile"}
                      headerIcon="/images/icons/astro-mascot.png"
                      initialWidth="auto"
                      initialHeight="auto"
                      resizable={false}
                      style={{ zIndex: 1000 }}
                    >
                      <div style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                        minHeight: '400px',
                        maxHeight: '95vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <RPGProfileForm 
                          onComplete={() => {
                            closeWindow('PROFILE_CREATOR');
                            alert(hasProfile ? 
                              '✅ Profile updated successfully!' : 
                              '🎉 Profile created successfully! Welcome to the Flunks community!'
                            );
                          }}
                          onCancel={() => closeWindow('PROFILE_CREATOR')}
                        />
                      </div>
                    </DraggableResizeableWindow>
                  )
                });
              }}
            />
          );
        })()}

        {/* 4. Terminal */}
        <ConditionalAppIcon
          appId="terminal"
          title="Terminal"
          icon="/images/icons/newterminal.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.TERMINAL,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.TERMINAL}
                onClose={() => closeWindow(WINDOW_IDS.TERMINAL)}
                headerTitle="Flunks Terminal"
                headerIcon="/images/icons/newterminal.png"
                initialWidth="520px"
                initialHeight="400px"
              >
                <FlunksTerminal onClose={() => closeWindow(WINDOW_IDS.TERMINAL)} />
              </DraggableResizeableWindow>
            )
          })}
        />

        {/* 5. FHS */}
        <ConditionalAppIcon
          appId="fhs-school"
          title="FHS"
          icon="/images/icons/fhs.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.FHS_SCHOOL,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FHS_SCHOOL}
                onClose={() => closeWindow(WINDOW_IDS.FHS_SCHOOL)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
                headerTitle="Flunks High School - Official Website"
                headerIcon="/images/icons/fhs.png"
              >
                <FHSSchool onClose={() => closeWindow(WINDOW_IDS.FHS_SCHOOL)} />
              </DraggableResizeableWindow>
            ),
          })}
        />

        {/* 6. Semester Zero */}
        <ConditionalAppIcon
          appId="semester-zero"
          title="semester zero"
          icon="/images/icons/semester0-icon.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.SEMESTER_0,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.SEMESTER_0}
                onClose={() => closeWindow(WINDOW_IDS.SEMESTER_0)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
                headerTitle="semester zero"
                headerIcon="/images/icons/semester0-icon.png"
              >
                <Semester0Map onClose={() => closeWindow(WINDOW_IDS.SEMESTER_0)} />
              </DraggableResizeableWindow>
            ),
          })}
        />

        {/* 6.5. Game Manual */}
        <ConditionalAppIcon
          appId="game-manual"
          title="Game Manual"
          icon="/images/icons/game-manual-icon.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.GAME_MANUAL,
            window: <GameManualWindow />
          })}
        />

        {/* 6. Radio */}
        <ConditionalAppIcon
          appId="radio"
          title="Radio"
          icon="/images/icons/boom-box.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.RADIO_PLAYER,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.RADIO_PLAYER}
                  onClose={() => closeWindow(WINDOW_IDS.RADIO_PLAYER)}
                  headerTitle="Radio"
                  initialWidth="720px"
                  initialHeight="540px"
                  headerIcon="/images/icons/boom-box.png"
                  resizable={false}
                >
                  <RadioPlayer />
                </DraggableResizeableWindow>
              ),
            })
          }
        />

        {/* 7. Meme Manager */}
        <ConditionalAppIcon
          appId="meme-manager"
          title="Meme Manager"
          icon="/images/icons/attack-64x64.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.MEME_MANAGER,
            window: <MemeManagerWindow onClose={() => closeWindow(WINDOW_IDS.MEME_MANAGER)} />
          })}
        />

        {/* 8. Chat Rooms */}
        <ConditionalAppIcon
          appId="chat-rooms"
          title="Chat Rooms"
          icon="/images/icons/chat-rooms.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.FLUNKS_MESSENGER,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FLUNKS_MESSENGER}
                onClose={() => closeWindow(WINDOW_IDS.FLUNKS_MESSENGER)}
                initialWidth="600px"
                initialHeight="500px"
                headerTitle="Chat Rooms"
                headerIcon="/images/icons/chat-rooms.png"
                style={{
                  top: '50px',   // Position below any potential top navigation
                  left: '100px'  // Keep it away from the edge
                }}
              >
                <FlunksMessenger />
              </DraggableResizeableWindow>
            )
          })}
        />

        {/* 8. X */}
        <a
          href="https://twitter.com/Flunks_NFT"
          target="_blank"
          rel="noreferrer noopener"
          style={{ textDecoration: "none" }}
        >
          <ConditionalAppIcon
            appId="x-twitter"
            title="X"
            icon="/images/icons/x.png"
            onDoubleClick={() => null}
          />
        </a>

        {/* 9. Discord */}
        <a href="https://discord.gg/flunks" target="_blank" rel="noreferrer noopener">
          <ConditionalAppIcon
            appId="discord"
            title="Discord"
            icon="/images/icons/discord.png"
            onDoubleClick={() => window.open("https://discord.gg/wuukvhHhS3", "_blank")}
          />
        </a>

        {/* 10. Market */}
        <a href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks" target="_blank" rel="noreferrer noopener">
          <ConditionalAppIcon 
            appId="market"
            title="Market" 
            icon="/images/icons/flowty.png" 
            onDoubleClick={() => null} 
          />
        </a>

        {/* 11. MyPlace */}
        <ConditionalAppIcon
          appId="myplace"
          title="MyPlace"
          icon="/images/icons/myplace.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.MYPLACE,
            window: <MyPlace />
          })}
        />

        {/* 12. Pocket Juniors */}
        <ConditionalAppIcon
          appId="pocket-juniors"
          title="Pocket Juniors"
          icon="/images/icons/pocket-juniors-50x50.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.PROJECT_JNR, window: <ProjectJnr /> })}
        />

        {/* 13. Flunk Creator */}
        <ConditionalAppIcon
          appId="flunk-creator"
          title="Flunk Creator"
          icon="/images/icons/experiment-3d.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.FLUNK_CREATOR,
            window: <FlunkCreator />
          })}
        />

        {/* 14. Flappy Flunk */}
        <ConditionalAppIcon
          appId="flappyflunk"
          title="Flappy Flunk"
          icon="/images/icons/flappyflunk.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.FLAPPY_FLUNK,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.FLAPPY_FLUNK}
                  onClose={() => closeWindow(WINDOW_IDS.FLAPPY_FLUNK)}
                  headerTitle="Flappy Flunk"
                  initialWidth="480px"
                  initialHeight="640px"
                  headerIcon="/images/icons/flappyflunk.png"
                >
                  <FlappyFlunkWindow />
                </DraggableResizeableWindow>
              ),
            })
          }
        />

        {/* 15. Report Card */}
        <ConditionalAppIcon
          appId="report-card"
          title="Report Card"
          icon="/images/icons/report-card.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.REPORT_CARD,
            window: <ReportCard />
          })}
        />

        {/* 16. Icon Animation */}
        <ConditionalAppIcon
          appId="icon-animation"
          title="Icon Animation"
          icon="/images/icons/attack-64x64.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.ICON_ANIMATION,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.ICON_ANIMATION}
                  onClose={() => closeWindow(WINDOW_IDS.ICON_ANIMATION)}
                  headerTitle="Icon Animation"
                  initialWidth="520px"
                  initialHeight="420px"
                  headerIcon="/images/icons/attack-64x64.png"
                >
                  <IconAnimationWindow />
                </DraggableResizeableWindow>
              ),
            })
          }
        />

        {/* 17. Bulletin Board */}
        <ConditionalAppIcon
          appId="bulletin-board"
          title="Bulletin Board"
          icon="/images/icons/bulletin-board-icon.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.BULLETIN_BOARD,
              window: <BulletinBoard />
            })
          }
        />

        {/* 18. Yearbook */}
        <ConditionalAppIcon
          appId="yearbook"
          title="Flunks Yearbook"
          icon="/images/icons/open-book.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.YEARBOOK,
              window: <Yearbook />
            })
          }
        />
        </div>
      </div>

      {windowsMemod}
      
      {/* Gum Admin Panel - Ctrl+G to toggle */}
      {showGumAdmin && (
        <GumAdminPanel onClose={() => setShowGumAdmin(false)} />
      )}

      {/* Time Admin Panel - Ctrl+T to toggle */}
      {showTimeAdmin && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: 'white',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px',
            borderBottom: '1px solid #ccc',
            paddingBottom: '8px'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>🌅🌙 Day/Night Configuration</h2>
            <button 
              onClick={() => setShowTimeAdmin(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '20px', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✖
            </button>
          </div>
          <TimeConfigAdmin />
        </div>
      )}
    </>
  );
};

const MonitorScreenWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { desktopBackground, desktopBackgroundType } = useThemeSettings();
  
  // Debug logging
  console.log('Desktop Background Settings:', { desktopBackground, desktopBackgroundType });
  
  return (
    <CustomMonitor
      backgroundStyles={{
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
      }}
      showBottomBar
      enableScrollingBackground={BACKGROUND_CONFIG.enableScrolling}
      customBackgroundImage={desktopBackgroundType === 'image' ? desktopBackground : BACKGROUND_CONFIG.imageUrl}
      scrollingPattern={BACKGROUND_CONFIG.pattern}
      scrollingSpeed={BACKGROUND_CONFIG.speed}
      scrollingOpacity={BACKGROUND_CONFIG.opacity}
      scrollingTileSize={BACKGROUND_CONFIG.tileSize}
    >
      {children}
    </CustomMonitor>
  );
};

const Home: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Check build mode and environment variables
    const buildMode = process.env.NEXT_PUBLIC_BUILD_MODE || 'public';
    
    // Import build mode utilities
    import('../utils/buildMode').then(({ shouldShowAccessGate, getDefaultAccessLevel }) => {
      const needsAccessGate = shouldShowAccessGate();
      const defaultAccessLevel = getDefaultAccessLevel();
      
      // Check if user already has access
      const accessGranted = sessionStorage.getItem('flunks-access-granted');
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      
      console.log('🔍 Access Check:', { 
        buildMode,
        needsAccessGate,
        defaultAccessLevel,
        accessGranted, 
        isLocalhost, 
        isDev,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server' 
      });
      
    // Access logic based on build mode
    if (!needsAccessGate || (isLocalhost && isDev)) {
      // Skip access gate - automatically grant access
      if (defaultAccessLevel) {
        // Auto-grant access level for public mode
        sessionStorage.setItem('flunks-access-granted', 'true');
        sessionStorage.setItem('flunks-access-level', defaultAccessLevel);
        sessionStorage.setItem('flunks-access-code', 'AUTO-GRANTED-PUBLIC');
        console.log(`🎯 Auto-granted ${defaultAccessLevel} access for ${buildMode} mode`);
        
        // Dispatch access update event to update all components
        window.dispatchEvent(new CustomEvent('flunks-access-updated'));
      }
      setHasAccess(true);
    } else if (accessGranted === 'true') {
      // User has already entered valid access code
      setHasAccess(true);
    }
    
    setCheckingAccess(false);
    });
  }, []);

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  if (!isMounted || checkingAccess) return null;

  // Show access gate if user doesn't have access
  if (!hasAccess) {
    return (
      <>
        <Head>
          <title>Flunks High School - Access Required</title>
          <meta name="description" content="Flunks High School - Beta Access Required" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="icon" href="/flunks-logo.png" />
        </Head>
        <AccessGate onAccessGranted={handleAccessGranted} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Flunks</title>
        <meta name="description" content="Welcome to the Flunks Highschool computer." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/flunks-logo.png" />
      </Head>
      
      <MonitorScreenWrapper>
        <AccessLevelStatus />
        <Desktop />
      </MonitorScreenWrapper>
    </>
  );
};

export default Home;

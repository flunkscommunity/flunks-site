import { type NextPage } from "next";
import Head from "next/head";
import CustomMonitor from "components/CustomMonitor";
import DesktopAppIcon from "components/DesktopAppIcon";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import YourStudents from "windows/YourStudents";
import ProjectJnr from "windows/ProjectJnr";
import AboutUs from "windows/AboutUs";
import { ProgressBar } from "react95";
import { useTheme } from "styled-components";
import { animated, config, useSpring } from "@react-spring/web";
import Onlyflunks from "../windows/Onlyflunks";
import { useRouter } from "next/router";
import Semester0Map from "windows/Semester0Map";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import FlunksTerminal from "windows/FlunksTerminal";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";
import AccessGate from "components/AccessGate";
import FlappyFlunkWindow from "windows/Games/FlappyFlunkWindow";
import FlunkyUppyArcadeWindow from "windows/Games/FlunkyUppyArcadeWindow";
import FlunkJumpWindow from "windows/Games/FlunkJumpWindow";
import FlunkyBash from "components/games/FlunkyBash";
import HiddenRiffWindow from "windows/Games/HiddenRiffWindow";
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
import BuyMeADeloreanWindow from "windows/BuyMeADeloreanWindow";
import AccessLevelStatus from "components/AccessLevelStatus";
import ConditionalAppIcon from "components/ConditionalAppIcon";
import StoryManual from "components/StoryManual";
import VCREffectsTest from "components/VCREffectsTest";
import { getUserAccessLevel } from "utils/appPermissions";
import { isFeatureEnabled, isDevLocalhost, isMobileApp } from "utils/buildMode";
import { BACKGROUND_CONFIG } from "config/backgroundConfig";
import useThemeSettings from "store/useThemeSettings";
import { getTimeBasedDesktopBackground } from "utils/timeBasedDesktopBackground";
import MobileSplashScreen from "components/MobileSplashScreen";
import RPGProfileForm from "components/UserProfile/RPGProfileForm";
import DevBypass from "components/DevBypass";
import { useUserProfile } from "contexts/UserProfileContext";
import WalletStatusBar from "components/WalletStatusBar";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import LoadingScreenPreview from "windows/LoadingScreenPreview";
import TestFlowWalletWindow from "windows/TestFlowWalletWindow";

import { GumAdminPanel } from "components/GumAdminPanel";
import { TimeConfigAdmin } from "components/DayNightHouse";
import SemesterZeroSetup from "components/SemesterZeroSetup";
import SemesterZeroVarsityDisplay from "components/SemesterZeroVarsityDisplay";
import RevealTester from "components/admin/RevealTester";
import LevelUp from "components/admin/LevelUp";
import BurnNFT from "components/admin/BurnNFT";
import AlexandriaLibrary from "components/AlexandriaLibrary";
import UndergroundPasswordWindow from "windows/UndergroundPasswordWindow";

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

// Check mobile status synchronously for initial state
const getInitialMobileState = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

const Desktop = () => {
  const router = useRouter();
  const { windows, openWindow, closeWindow, windowApps } = useWindowsContext();
  const [showGumAdmin, setShowGumAdmin] = useState(false);
  const [showTimeAdmin, setShowTimeAdmin] = useState(false);
  // Initialize splash to true if mobile, prevents flash
  const [showSplash, setShowSplash] = useState(() => getInitialMobileState());
  const [isMobile, setIsMobile] = useState(() => getInitialMobileState());
  const [initComplete, setInitComplete] = useState(false);
  const splashDismissedRef = useRef(false);
  const mobileInitRanRef = useRef(false);
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { hasProfile, profile } = useUserProfile();

  const handleSplashComplete = useCallback(() => {
    splashDismissedRef.current = true;
    setShowSplash(false);
  }, []);

  // FIRST: Check for mobile app immediately and set both states atomically
  useEffect(() => {
    if (mobileInitRanRef.current) return;
    mobileInitRanRef.current = true;

    const checkMobile = () => {
      const mobile = isMobileApp();
      console.log('📱 Mobile check - isMobileApp:', mobile);
      
      if (mobile) {
        // Set both states together - mobile detected
        setIsMobile(true);
        if (!splashDismissedRef.current) {
          setShowSplash(true);
        }
        // Force close Welcome if it somehow opened
        closeWindow(WINDOW_IDS.WELCOME);
      }
      
      setInitComplete(true);
    };
    
    // Check immediately, then again after delays to be safe
    checkMobile();
    const t1 = setTimeout(checkMobile, 50);
    const t2 = setTimeout(checkMobile, 150);
    const t3 = setTimeout(checkMobile, 300);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [closeWindow]);

  // SECOND: Only show Welcome on desktop AFTER we've confirmed it's not mobile
  // THIRD: Safety net - always close Welcome if we're showing splash
  useEffect(() => {
    if (showSplash || isMobile) {
      closeWindow(WINDOW_IDS.WELCOME);
    }
  }, [showSplash, isMobile, closeWindow]);

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
      {/* Mobile Splash Screen */}
      {showSplash && (
        <MobileSplashScreen onComplete={handleSplashComplete} />
      )}
      
      <div 
        className="h-full w-full overflow-auto p-4 touch-pan-y"
        style={{
          // On iPhone, keep the top-row icons out from under the notch/Dynamic Island.
          // In the Capacitor app, push the whole icon grid down a bit (~5%).
          paddingTop: isMobile
            ? 'calc(max(16px, env(safe-area-inset-top, 16px)) + 5vh)'
            : 'max(16px, env(safe-area-inset-top, 16px))',
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8 min-h-full w-full items-start justify-items-center">
          {/* 1. Semester Zero - Large 2x2 Featured App */}
          <div className="col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2">
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
          </div>

          {/* 2. OnlyFlunks */}
          <ConditionalAppIcon
            appId="onlyflunks"
          title="OnlyFlunks"
          icon="/images/icons/onlyflunks.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.FLUNKS_HUB, window: <Onlyflunks /> })}
        />

        {/* 3. My Locker */}
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

        {/* Test Flow Wallet */}
        <ConditionalAppIcon
          appId="test-flow-wallet"
          title="Test Flow Wallet"
          icon="/images/icons/flowty.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.TEST_FLOW_WALLET,
              window: <TestFlowWalletWindow />,
            })
          }
        />

        {/* 4.5 Level Up - NFT Evolution */}
        {isFeatureEnabled('showLevelUp') && (
          <ConditionalAppIcon
            appId="level-up"
            title="Level Up"
            icon="/images/icons/level.png"
            onDoubleClick={() => openWindow({
              key: WINDOW_IDS.LEVEL_UP,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.LEVEL_UP}
                  onClose={() => closeWindow(WINDOW_IDS.LEVEL_UP)}
                  headerTitle="⚡ LEVEL UP - NFT Upgrade Arcade"
                  initialWidth="95vw"
                  initialHeight="95vh"
                  headerIcon="/images/icons/level.png"
                  resizable={true}
                >
                  <LevelUp />
                </DraggableResizeableWindow>
              )
            })}
          />
        )}

        {/* 4.6 Semester Zero NFT Collection */}
        <ConditionalAppIcon
          appId="semester-zero-nft"
          title="Semester Zero NFT"
          icon="/images/icons/semester-zero-nft.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.SEMESTER_ZERO_SETUP,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.SEMESTER_ZERO_SETUP}
                  onClose={() => closeWindow(WINDOW_IDS.SEMESTER_ZERO_SETUP)}
                  headerTitle="Flunks: Semester Zero NFT"
                  initialWidth="850px"
                  initialHeight="750px"
                  headerIcon="/images/icons/semester-zero-nft.png"
                  resizable={true}
                >
                  <SemesterZeroVarsityDisplay onClose={() => closeWindow(WINDOW_IDS.SEMESTER_ZERO_SETUP)} />
                </DraggableResizeableWindow>
              ),
            })
          }
        />

        {/* 4.7 The Underground - Secret Password Entry */}
        <ConditionalAppIcon
          appId="underground"
          title="The Underground"
          icon="/images/locations/four-thieves/password-icon.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.UNDERGROUND_PASSWORD,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.UNDERGROUND_PASSWORD}
                onClose={() => closeWindow(WINDOW_IDS.UNDERGROUND_PASSWORD)}
                headerTitle="🚪 The Underground"
                initialWidth="650px"
                initialHeight="600px"
                headerIcon="/images/locations/four-thieves/password-icon.png"
                resizable={false}
              >
                <UndergroundPasswordWindow onClose={() => closeWindow(WINDOW_IDS.UNDERGROUND_PASSWORD)} />
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

        {/* 6.6. Story Manual */}
        <ConditionalAppIcon
          appId="story-manual"
          title="Story Mode"
          icon="/images/icons/story-mode.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.STORY_MANUAL,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.STORY_MANUAL}
                onClose={() => closeWindow(WINDOW_IDS.STORY_MANUAL)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
                headerTitle="Story Mode"
                headerIcon="/images/icons/story-mode.png"
              >
                <StoryManual onClose={() => closeWindow(WINDOW_IDS.STORY_MANUAL)} />
              </DraggableResizeableWindow>
            ),
          })}
        />

        {/* 5b. VCR Effects Test - Development Tool */}
        <ConditionalAppIcon
          appId="vcr-test"
          title="VCR Effects Test"
          icon="🎛️"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.VCR_EFFECTS_TEST,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.VCR_EFFECTS_TEST}
                onClose={() => closeWindow(WINDOW_IDS.VCR_EFFECTS_TEST)}
                initialWidth="1400px"
                initialHeight="900px"
                resizable={true}
                headerTitle="VCR Effects Test Lab"
                headerIcon="🎛️"
              >
                <VCREffectsTest onClose={() => closeWindow(WINDOW_IDS.VCR_EFFECTS_TEST)} />
              </DraggableResizeableWindow>
            ),
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

        {/* 8. ChatRoom */}
        <ConditionalAppIcon
          appId="chat-room"
          title="ChatRoom"
          icon="/images/icons/chat-rooms.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.FLUNKS_MESSENGER,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FLUNKS_MESSENGER}
                onClose={() => closeWindow(WINDOW_IDS.FLUNKS_MESSENGER)}
                initialWidth="95vw"
                initialHeight="90vh"
                headerTitle="ChatRoom"
                headerIcon="/images/icons/chat-rooms.png"
                resizable={true}
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

        {/* 14. Flappy Flunk - MOVED TO ARCADE */}

        {/* 14b. Hidden Riff - REMOVED FROM DESKTOP - Access via dev tools only */}
        {/* {isFeatureEnabled('showHiddenRiff') && (
          <ConditionalAppIcon
            appId="hidden-riff"
            title="Hidden Riff"
            icon="/images/icons/controller-bg.png"
            onDoubleClick={() =>
              openWindow({
                key: WINDOW_IDS.HIDDEN_RIFF,
                window: <HiddenRiffWindow />,
              })
            }
          />
        )} */}
        
        {/* 15. Report Card */}
        {/* <ConditionalAppIcon
          appId="report-card"
          title="Report Card"
          icon="/images/icons/report-card.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.REPORT_CARD,
            window: <ReportCard />
          })}
        /> */}

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
        {/* <ConditionalAppIcon
          appId="bulletin-board"
          title="Bulletin Board"
          icon="/images/icons/bulletin-board-icon.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.BULLETIN_BOARD,
              window: <BulletinBoard />
            })
          }
        /> */}

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

        {/* 20. Picture Day - Build Mode Only */}
        <ConditionalAppIcon
          appId="picture-day"
          title="Picture Day"
          icon="/images/icons/picture-day.png"
          onDoubleClick={() => {
            window.location.href = '/picture-day';
          }}
        />

        {/* 20. DeLorean Fund - Build Mode Only */}
        {isFeatureEnabled('showDeloreanTracker') && (
          <ConditionalAppIcon
            appId="buy-me-a-delorean"
            title="DeLorean Fund"
            icon="/images/icons/delorean.png"
            onDoubleClick={() => openWindow({
              key: WINDOW_IDS.BUY_ME_A_DELOREAN,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.BUY_ME_A_DELOREAN}
                  onClose={() => closeWindow(WINDOW_IDS.BUY_ME_A_DELOREAN)}
                  headerTitle="DeLorean Fund - Time Travel Tracker"
                  initialWidth="800px"
                  initialHeight="600px"
                  headerIcon="/images/icons/delorean.png"
                >
                  <BuyMeADeloreanWindow />
                </DraggableResizeableWindow>
              )
            })}
          />
        )}

        {/* 21. Loading Screen Preview - Build Mode Only */}
        {isFeatureEnabled('showLoadingScreenPreview') && (
          <ConditionalAppIcon
            appId="loading-screen-preview"
            title="Loading Screens"
            icon="/images/icons/myplace.png"
            onDoubleClick={() => openWindow({
              key: WINDOW_IDS.LOADING_PREVIEW,
              window: <LoadingScreenPreview />
            })}
          />
        )}

        {/* 22. Magic Test (Reveal Tester) - Build Mode Only */}
        {/* Magic Test - LOCALHOST ONLY (not mobile app) */}
        {isDevLocalhost() && (
          <ConditionalAppIcon
            appId="magic-test"
            title="Magic Test"
            icon="/images/icons/experiment-3d.png"
            onDoubleClick={() => openWindow({
              key: WINDOW_IDS.MAGIC_TEST,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.MAGIC_TEST}
                  onClose={() => closeWindow(WINDOW_IDS.MAGIC_TEST)}
                  headerTitle="🎭 Magic Test - NFT Reveal Preview (localhost only)"
                  initialWidth="95vw"
                  initialHeight="95vh"
                  headerIcon="/images/icons/experiment-3d.png"
                  resizable={true}
                >
                  <RevealTester />
                </DraggableResizeableWindow>
              )
            })}
          />
        )}

        {/* 22.6 Burn NFT - LOCALHOST + BUILD MODE ONLY (not mobile app) */}
        {(isDevLocalhost() || isFeatureEnabled('showBurnNFT')) && (
          <ConditionalAppIcon
            appId="burn-nft"
            title="Burn NFT"
            icon="/images/icons/Icon-Face.png"
            onDoubleClick={() => openWindow({
              key: WINDOW_IDS.BURN_NFT,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.BURN_NFT}
                  onClose={() => closeWindow(WINDOW_IDS.BURN_NFT)}
                  headerTitle="🔥 BURN NFT - DANGER ZONE"
                  initialWidth="650px"
                  initialHeight="700px"
                  headerIcon="/images/icons/Icon-Face.png"
                  resizable={true}
                >
                  <BurnNFT />
                </DraggableResizeableWindow>
              )
            })}
          />
        )}

        {/* 23. Fantasy Football */}
        <a
          href="https://sports.yahoo.com/dailyfantasy/league/147616/overview"
          target="_blank"
          rel="noreferrer noopener"
          style={{ textDecoration: "none" }}
        >
          <ConditionalAppIcon
            appId="fantasy-football"
            title="Fantasy Football"
            icon="/images/icons/football-field-icon.png"
            onDoubleClick={() => null}
          />
        </a>

        {/* 24. Slot Machine - build mode only */}
        {isFeatureEnabled('showSlotMachine') && (
          <ConditionalAppIcon
            appId="slot-machine"
            title="Slot Machine"
            icon="/images/slot-machine.png"
            onDoubleClick={() => {
              window.location.href = '/slots-play';
            }}
          />
        )}

        {/* 25. Flunky Bash - Launcher Game - BUILD MODE ONLY */}
        {isFeatureEnabled('showFlunkyBash') && (
          <ConditionalAppIcon
            appId="flunky-bash"
            title="Flunky Bash"
            icon="/images/icons/game-manual-icon.png"
            onDoubleClick={() => openWindow({
              key: WINDOW_IDS.FLUNKY_BASH,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.FLUNKY_BASH}
                  onClose={() => closeWindow(WINDOW_IDS.FLUNKY_BASH)}
                  headerTitle="🎯 Flunky Bash"
                  initialWidth="650px"
                  initialHeight="580px"
                  headerIcon="/images/icons/game-manual-icon.png"
                  resizable={true}
                >
                  <FlunkyBash />
                </DraggableResizeableWindow>
              )
            })}
          />
        )}

        {/* 26. Alexandria Library - On-Chain Books */}
        <ConditionalAppIcon
          appId="alexandria-library"
          title="Alexandria Library"
          icon="/images/icons/alexandria-library-icon.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.ALEXANDRIA_LIBRARY,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.ALEXANDRIA_LIBRARY}
                onClose={() => closeWindow(WINDOW_IDS.ALEXANDRIA_LIBRARY)}
                headerTitle="📚 Alexandria Library - On-Chain Books"
                initialWidth="95vw"
                initialHeight="95vh"
                headerIcon="/images/icons/alexandria-library-icon.png"
                resizable={true}
              >
                <AlexandriaLibrary />
              </DraggableResizeableWindow>
            )
          })}
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
  
  // Use time-based background for main desktop
  const timeBasedBackground = getTimeBasedDesktopBackground();
  const backgroundImageUrl = timeBasedBackground.replace('url(', '').replace(')', '');
  
  // Debug logging
  console.log('Desktop Background Settings:', { desktopBackground, desktopBackgroundType, timeBasedBackground });
  
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
      customBackgroundImage={backgroundImageUrl}
      scrollingPattern={BACKGROUND_CONFIG.pattern}
      scrollingSpeed={BACKGROUND_CONFIG.speed}
      scrollingOpacity={BACKGROUND_CONFIG.opacity}
      scrollingTileSize={BACKGROUND_CONFIG.tileSize}
      enableCloudScroll={BACKGROUND_CONFIG.enableCloudScroll}
      cloudScrollSpeed={BACKGROUND_CONFIG.cloudScrollSpeed}
    >
      {children}
    </CustomMonitor>
  );
};

const Home: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(process.env.NODE_ENV === 'development'); // Force true in dev
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
    if (!needsAccessGate || (isLocalhost && isDev) || isDev) {
      // Skip access gate - automatically grant access (FORCE BYPASS FOR DEV)
      if (defaultAccessLevel || isDev) {
        // Auto-grant access level for public mode or development
        sessionStorage.setItem('flunks-access-granted', 'true');
        sessionStorage.setItem('flunks-access-level', defaultAccessLevel || 'BETA');
        sessionStorage.setItem('flunks-access-code', 'AUTO-GRANTED-DEV');
        console.log(`🎯 Auto-granted ${defaultAccessLevel || 'BETA'} access for ${buildMode} mode`);
        
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

  // Show access gate if user doesn't have access - COMPLETELY BYPASS IN DEV
  const isDev = process.env.NODE_ENV === 'development';
  if (!hasAccess && !isDev) {
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
        
        {/* Wallet Status Bar - Bottom Right (moved from top to avoid iPhone notch) */}
        <div style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          right: '10px',
          zIndex: 9998
        }}>
          <WalletStatusBar compact={true} />
        </div>
        
        <Desktop />
      </MonitorScreenWrapper>
    </>
  );
};

export default Home;

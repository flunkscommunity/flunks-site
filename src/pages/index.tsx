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
import UserProfile from "windows/UserProfile";
import GameManualWindow from "windows/GameManualWindow";
import MemeManagerWindow from "windows/MemeManagerWindow";
import AccessLevelStatus from "components/AccessLevelStatus";
import ConditionalAppIcon from "components/ConditionalAppIcon";

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
      <div className="flex relative flex-col max-h-[calc(100vh-64px)] w-full flex-wrap items-start gap-4 content-start">
        {/* 1. OnlyFlunks */}
        <ConditionalAppIcon
          appId="onlyflunks"
          title="OnlyFlunks"
          icon="/images/icons/onlyflunks.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.YOUR_STUDENTS, window: <YourStudents /> })}
        />

        {/* 2. My Profile */}
        <ConditionalAppIcon
          appId="my-profile"
          title="My Profile"
          icon="/flunks-logo.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.USER_PROFILE, window: <UserProfile /> })}
        />

        {/* 3. Terminal */}
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

        {/* 4. FHS */}
        <DesktopAppIcon
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

        {/* 5. Semester Zero */}
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

        {/* 5.5. Game Manual */}
        <ConditionalAppIcon
          appId="game-manual"
          title="Game Manual"
          icon="/images/icons/high-school-icon.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.GAME_MANUAL,
            window: <GameManualWindow />
          })}
        />

        {/* 6. Radio */}
        <DesktopAppIcon
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
          <DesktopAppIcon
            title="X"
            icon="/images/icons/x.png"
            onDoubleClick={() => null}
          />
        </a>

        {/* 9. Discord */}
        <a href="https://discord.gg/flunks" target="_blank" rel="noreferrer noopener">
          <DesktopAppIcon
            title="Discord"
            icon="/images/icons/discord.png"
            onDoubleClick={() => window.open("https://discord.gg/wuukvhHhS3", "_blank")}
          />
        </a>

        {/* 10. Market */}
        <a href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks" target="_blank" rel="noreferrer noopener">
          <DesktopAppIcon title="Market" icon="/images/icons/flowty.png" onDoubleClick={() => null} />
        </a>

        {/* 11. MyPlace */}
        <DesktopAppIcon
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
          icon="/images/icons/pocket-juniors.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.FLUNK_CREATOR,
            window: <FlunkCreator />
          })}
        />

        {/* 14. Flappy Flunk */}
        <DesktopAppIcon
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

        {/* 15. About Us */}
        <DesktopAppIcon
          title="About Us"
          icon="/images/icons/about-us.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.ABOUT_US, window: <AboutUs /> })}
        />
      </div>



      {windowsMemod}
    </>
  );
};

const MonitorScreenWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <CustomMonitor
    backgroundStyles={{
      overflow: "hidden",
      width: "100%",
      height: "100%",
      position: "relative",
      display: "flex",
    }}
    showBottomBar
  >
    {children}
  </CustomMonitor>
);

const Home: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user already has access
    const accessGranted = sessionStorage.getItem('flunks-access-granted');
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    // Allow access for localhost development or if access was previously granted
    if (accessGranted === 'true' || isLocalhost || process.env.NODE_ENV === 'development') {
      setHasAccess(true);
    }
    
    setCheckingAccess(false);
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
          <link rel="icon" href="/images/logos/os-logo.png" />
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
        <link rel="icon" href="/images/logos/os-logo.png" />
      </Head>
      
      <MonitorScreenWrapper>
        <AccessLevelStatus />
        <Desktop />
      </MonitorScreenWrapper>
    </>
  );
};

export default Home;

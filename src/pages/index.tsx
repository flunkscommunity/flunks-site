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
import FlappyFlunkWindow from "windows/Games/FlappyFlunkWindow";
import RadioPlayer from "components/RadioPlayer";
import BootScreen from "components/BootScreen";

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
      if (app?.isMinimized) return null;
      return <React.Fragment key={key}>{window as React.ReactNode}</React.Fragment>;
    })}
  </>
), [windows, windowApps]);

  return (
    <>
      <div className="flex relative flex-col max-h-[calc(100vh-64px)] w-full flex-wrap items-start gap-4 content-start">
        <DesktopAppIcon
          title="Onlyflunks"
          icon="/images/icons/onlyflunks.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.YOUR_STUDENTS, window: <YourStudents /> })}
        />

        <DesktopAppIcon
          title="Pocket Juniors"
          icon="/images/icons/pocket-juniors-50x50.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.PROJECT_JNR, window: <ProjectJnr /> })}
        />

        <DesktopAppIcon
          title="About Us"
          icon="/images/icons/about-us.png"
          onDoubleClick={() => openWindow({ key: WINDOW_IDS.ABOUT_US, window: <AboutUs /> })}
        />

        <DesktopAppIcon
          title="Radio"
          icon="/images/icons/radio.png"
          onDoubleClick={() =>
            openWindow({
              key: WINDOW_IDS.RADIO_PLAYER,
              window: (
                <DraggableResizeableWindow
                  windowsId={WINDOW_IDS.RADIO_PLAYER}
                  onClose={() => closeWindow(WINDOW_IDS.RADIO_PLAYER)}
                  headerTitle="Radio"
                  initialWidth="480px"
                  initialHeight="370px"
                  headerIcon="/images/icons/radio.png"
                >

                  <RadioPlayer />
                </DraggableResizeableWindow>
              ),
            })
          }
        />

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

        <a href="https://discord.gg/flunks" target="_blank" rel="noreferrer noopener">
          <DesktopAppIcon
            title="Discord"
            icon="/images/icons/discord.png"
            onDoubleClick={() => window.open("https://discord.gg/wuukvhHhS3", "_blank")}
          />
        </a>

        <a href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks" target="_blank" rel="noreferrer noopener">
          <DesktopAppIcon title="Market" icon="/images/icons/flowty.png" onDoubleClick={() => null} />
        </a>

        <DesktopAppIcon
          title="MyPlace"
          icon="/images/icons/myplace.png"
          onDoubleClick={() => router.push('/select-your-flunk')}
        />

        <DesktopAppIcon
          title="Terminal"
          icon="/images/icons/terminal.png"
          onDoubleClick={() => openWindow({
            key: 'flunks_terminal',
            window: (
              <DraggableResizeableWindow
                windowsId="flunks_terminal"
                onClose={() => closeWindow('flunks_terminal')}
                headerTitle="Flunks Terminal"
                initialWidth="520px"
                initialHeight="400px"
              >
                <FlunksTerminal onClose={() => closeWindow('flunks_terminal')} />
              </DraggableResizeableWindow>
            )
          })}
        />

<DesktopAppIcon
  title="Flappy Flunk"
  icon="/images/icons/flappyflunk.png" // adjust path if needed
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


        <DesktopAppIcon
          title="semester zero"
          icon="/images/icons/semester0-icon.png"
          onDoubleClick={() => openWindow({
            key: WINDOW_IDS.SEMESTER_0,
            label: "Semester 0",
            icon: "/images/icons/semester0-icon.png",
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
  const [bootComplete, setBootComplete] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  if (!bootComplete) {
    return (
      <>
        <Head>
          <title>Flunks</title>
          <meta name="description" content="Welcome to the Flunks Highschool computer." />
          <link rel="icon" href="/images/logos/os-logo.png" />
        </Head>
        <BootScreen onComplete={() => setBootComplete(true)} />
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
        <Desktop />
      </MonitorScreenWrapper>
    </>
  );
};

export default Home;

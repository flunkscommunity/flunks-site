import { type NextPage } from "next";
import Head from "next/head";
import CustomMonitor from "components/CustomMonitor";
import StudentExplorer from "windows/StudentExplorer";
import { useWindowsContext } from "contexts/WindowsContext";
import DesktopAppIcon from "components/DesktopAppIcon";
import Draggable from "react-draggable";
import { WINDOW_IDS } from "fixed";
import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "contexts/WalletContext";
import YourStudents from "windows/YourStudents";
import LostAndFound from "windows/LostAndFound";
import LoginScreen from "components/LoginScreen";
import GumballMachine from "windows/GumballMachine";
import useThemeSettings from "store/useThemeSettings";
import ProjectJnr from "windows/ProjectJnr";
import AboutUs from "windows/AboutUs";
import { ProgressBar } from "react95";
import { useTheme } from "styled-components";
import { animated, config, useSpring, useSpringRef } from "@react-spring/web";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((previousPercent) => {
        if (previousPercent === 100) {
          clearInterval(timer);
          setComplete(true);
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(previousPercent + diff, 100);
      });
    }, 200);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const theme = useTheme();

  return (
    <animated.div
      className="bg-black pointer-events-none fixed inset-0 z-[1001] bg-cover bg-center flex flex-col items-center justify-end gap-10"
      style={{
        backgroundImage: `url('/images/loading/bootup.webp')`,
        ...fadeOutSpring,
      }}
    >
      <span className="text-3xl font-bold animate-pulse">
        Starting Flunks 95
      </span>
      <ProgressBar
        variant="tile"
        style={{
          backgroundColor: theme.canvas,
        }}
        value={Math.floor(percent)}
      />
    </animated.div>
  );
};

const Desktop = () => {
  const { windows, openWindow } = useWindowsContext();

  const windowsMemod = useMemo(() => {
    return (
      <React.Fragment>
        {Object.keys(windows).length > 0 &&
          Object.entries(windows).map(([key, window]) => (
            <React.Fragment key={key}>{window}</React.Fragment>
          ))}
      </React.Fragment>
    );
  }, [windows]);

  return (
    <>
      <div className="flex flex-col max-h-[calc(100vh-64px)] w-full flex-wrap items-start gap-4 content-start">
        <DesktopAppIcon
          title="Flunkfolio"
          icon="/images/icons/vault.png"
          onDoubleClick={() => {
            openWindow({
              key: WINDOW_IDS.YOUR_STUDENTS,
              window: <YourStudents />,
            });
          }}
        />

        <DesktopAppIcon
          title="Gumball Machine"
          icon="/images/icons/gum-machine.png"
          onDoubleClick={() => {
            openWindow({
              key: WINDOW_IDS.GUMBALL_MACHINE,
              window: <GumballMachine />,
            });
          }}
        />

        <DesktopAppIcon
          title="Pocket Juniors"
          icon="/images/icons/pocket-juniors-50x50.png"
          onDoubleClick={() => {
            openWindow({
              key: WINDOW_IDS.PROJECT_JNR,
              window: <ProjectJnr />,
            });
          }}
        />

        <DesktopAppIcon
          title="About Us"
          icon="/images/icons/about-us.png"
          onDoubleClick={() => {
            openWindow({
              key: WINDOW_IDS.ABOUT_US,
              window: <AboutUs />,
            });
          }}
        />

        <a
          href="https://twitter.com/Flunks_NFT"
          target="_blank"
          rel="noreferrer noopener"
          style={{
            textDecoration: "none",
          }}
        >
          <DesktopAppIcon
            title="X"
            icon="/images/icons/x.png"
            onDoubleClick={() => {
              return null;
            }}
          />
        </a>

        <a
          href="https://discord.gg/flunks"
          target="_blank"
          rel="noreferrer noopener"
          style={{
            textDecoration: "none",
          }}
        >
          <DesktopAppIcon
            title="Discord"
            icon="/images/icons/discord.png"
            onDoubleClick={() => {
              return null;
            }}
          />
        </a>

        <a
          href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks"
          target="_blank"
          rel="noreferrer noopener"
          style={{
            textDecoration: "none",
          }}
        >
          <DesktopAppIcon
            title="Market"
            icon="/images/icons/flowty.png"
            onDoubleClick={() => {
              return null;
            }}
          />
        </a>
      </div>
      {windowsMemod}
      <FullScreenLoader />
    </>
  );
};

const MonitorScreenWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
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
    >
      {children}
    </CustomMonitor>
  );
};

const Home: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Flunks</title>
        <meta
          name="description"
          content="Welcome to the Flunks Highschool computer."
        />
        <link rel="icon" href="/images/os-logo.png" />
      </Head>

      <MonitorScreenWrapper>
        <Desktop />
      </MonitorScreenWrapper>
    </>
  );
};

export default Home;

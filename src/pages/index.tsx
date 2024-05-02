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
          title="Student Directory"
          icon="/images/student-directory.png"
          onDoubleClick={() => {
            openWindow({
              key: WINDOW_IDS.STUDENT_EXPLORER,
              window: <StudentExplorer />,
            });
          }}
        />

        <DesktopAppIcon
          title="Your Students"
          icon="/images/your-students.png"
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
          title="Lost and Found"
          icon="/images/lost-and-found.png"
          onDoubleClick={() => {
            openWindow({
              key: WINDOW_IDS.LOST_AND_FOUND,
              window: <LostAndFound />,
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
            title="Twitter"
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
      </div>
      {windowsMemod}
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

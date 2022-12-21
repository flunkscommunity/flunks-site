import { type NextPage } from "next";
import Head from "next/head";
import CustomMonitor from "components/CustomMonitor";
import StudentExplorer from "windows/StudentExplorer";
import { useWindowsContext } from "contexts/WindowsContext";
import DesktopAppIcon from "components/DesktopAppIcon";
import Draggable from "react-draggable";
import { WINDOW_IDS } from "fixed";
import React, { useEffect, useState } from "react";
import { useUser } from "contexts/WalletContext";
import YourStudents from "windows/YourStudents";
import LostAndFound from "windows/LostAndFound";
import LoginScreen from "components/LoginScreen";

const Home: NextPage = () => {
  const { windows, openWindow } = useWindowsContext();
  const { walletAddress } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setShowLogin(!walletAddress);
  }, [walletAddress]);

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

      {showLogin && <LoginScreen />}

      {!showLogin && (
        <CustomMonitor
          backgroundStyles={{
            backgroundColor: "#008080",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
          showBottomBar
        >
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
            title="Lost and Found"
            icon="/images/lost-and-found.png"
            onDoubleClick={() => {
              openWindow({
                key: WINDOW_IDS.LOST_AND_FOUND,
                window: <LostAndFound />,
              });
            }}
          />

          <React.Fragment>
            {Object.keys(windows).length > 0 &&
              Object.entries(windows).map(([key, window]) => (
                <React.Fragment key={key}>{window}</React.Fragment>
              ))}
          </React.Fragment>
        </CustomMonitor>
      )}
    </>
  );
};

export default Home;

import { type NextPage } from "next";
import Head from "next/head";
import CustomMonitor from "components/CustomMonitor";
import { useSwrInfiniteWrapper } from "api/useSwrWrapper";
import { CollectionApiInstance } from "api";
import StudentExplorer from "windows/StudentExplorer";
import { useWindowsContext } from "contexts/WindowsContext";
import DesktopAppIcon from "components/DesktopAppIcon";
import Draggable from "react-draggable";
import { WINDOW_IDS } from "fixed";
import React from "react";
import { useUser } from "contexts/WalletContext";
import { Button, TextInput, Window, WindowHeader } from "react95";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { H2, P } from "components/Typography";

const Home: NextPage = () => {
  const { windows, openWindow } = useWindowsContext();
  const { walletAddress, authenticate } = useUser();
  console.log(walletAddress);
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

      {!walletAddress && (
        <CustomMonitor
          backgroundStyles={{
            backgroundImage: "url('/images/loginbg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <DraggableResizeableWindow
            headerTitle="Welcome to Flunks"
            showHeaderActions={false}
            initialHeight="auto"
            initialWidth="auto"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 8fr 2fr",
                gap: 16,
              }}
            >
              <img
                src="/images/os-logo-large.png"
                style={{
                  maxWidth: "100px",
                  height: "100%",
                }}
                alt="Flunks Logo"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  gap: 16,
                }}
              >
                <P>Type a user name and password to log on to Flunks High </P>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gridTemplateRows: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <P>
                    <u>U</u>sername
                  </P>

                  <TextInput placeholder="Doesn't really matter what you put in here" />

                  <P>
                    <u>P</u>assword
                  </P>

                  <TextInput
                    placeholder="Nor here, just press Log On lol"
                    type="password"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <Button onClick={authenticate}>Log On</Button>
              </div>
            </div>
          </DraggableResizeableWindow>
        </CustomMonitor>
      )}

      {walletAddress && (
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
          <Draggable bounds="parent">
            <div
              style={{
                width: 80,
                margin: 8,
              }}
            >
              <DesktopAppIcon
                title="Student Directory"
                icon="/images/student-directory.ico"
                onDoubleClick={() => {
                  openWindow({
                    key: WINDOW_IDS.STUDENT_EXPLORER,
                    window: <StudentExplorer />,
                  });
                }}
              />
            </div>
          </Draggable>

          <Draggable bounds="parent">
            <div
              style={{
                width: 80,
                margin: 8,
              }}
            >
              <DesktopAppIcon
                title="Your Students"
                icon="/images/your-students.ico"
                onDoubleClick={() => {
                  openWindow({
                    key: WINDOW_IDS.STUDENT_EXPLORER,
                    window: <StudentExplorer />,
                  });
                }}
              />
            </div>
          </Draggable>

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

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
import React, { useEffect, useState } from "react";
import { useUser } from "contexts/WalletContext";
import { Button, TextInput, Window, WindowHeader } from "react95";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { H2, P } from "components/Typography";
import styled from "styled-components";
import YourStudents from "windows/YourStudents";

const LoginScreenContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 8fr 2fr;
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Home: NextPage = () => {
  const { windows, openWindow } = useWindowsContext();
  const { walletAddress, authenticate } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setShowLogin(!walletAddress);
  }, []);

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

      {showLogin && (
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <DraggableResizeableWindow
              headerTitle="Welcome to Flunks"
              showHeaderActions={false}
              initialHeight="400px"
              initialWidth="auto"
            >
              <LoginScreenContainer>
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

                  <form
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

                    <TextInput
                      autoComplete={"off"}
                      placeholder="Doesn't really matter what you put in here"
                    />

                    <P>
                      <u>P</u>assword
                    </P>

                    <TextInput
                      autoComplete={"off"}
                      placeholder="Nor here, just press Log On lol"
                      type="password"
                    />
                  </form>
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
              </LoginScreenContainer>
            </DraggableResizeableWindow>
          </div>
        </CustomMonitor>
      )}

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
                    key: WINDOW_IDS.YOUR_STUDENTS,
                    window: <YourStudents />,
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

import { type NextPage } from "next";
import Head from "next/head";
import CustomMonitor from "components/CustomMonitor";
import { useSwrInfiniteWrapper } from "api/useSwrWrapper";
import { CollectionApiInstance } from "api";
import StudentExplorer from "windows/StudentExplorer";
import { useWindowsContext } from "contexts/WindowsContext";
import DesktopAppIcon from "components/DesktopAppIcon";
import Draggable from "react-draggable";
import { WINDOW_IDS } from "constants";
import React from "react";

const Home: NextPage = () => {
  const { windows, openWindow } = useWindowsContext();
  
  return (
    <>
      <Head>
        <title>Flunks</title>
        <meta
          name="description"
          content="Welcome to the Flunks Graduation Software."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CustomMonitor
        backgroundStyles={{
          backgroundImage: "url('/images/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {/* <Draggable bounds="parent">
          <div
            style={{
              width: 80,
            }}
          >
            <DesktopAppIcon
              title="Lost and Found"
              icon="/images/lost-found.ico"
            />
          </div>
        </Draggable> */}

        <Draggable bounds="parent">
          <div
            style={{
              width: 80,
            }}
          >
            <DesktopAppIcon
              title="Student Explorer"
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

        {/* <Draggable bounds="parent">
          <div
            style={{
              width: 80,
            }}
          >
            <DesktopAppIcon title="Twitter" icon="/images/twitter.png" />
          </div>
        </Draggable>

        <Draggable bounds="parent">
          <div
            style={{
              width: 80,
            }}
          >
            <DesktopAppIcon title="Discord" icon="/images/discord.png" />
          </div>
        </Draggable> */}

        {/* <Draggable handle="strong" bounds="parent">
          <Window
            className="window"
            style={{
              position: "absolute",
              resize: "both",
              overflow: "hidden",
            }}
          >
            <strong className="cursor">
              <WindowHeader
                className="window-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none",
                  padding: "20px 8px",
                }}
              >
                <span>Flunk #{flunks[0]?.templateId}</span>
                <Button>
                  <span className="close-icon" />
                </Button>
              </WindowHeader>
            </strong>

            <WindowContent
              style={{
                width: "100%",
                height: "calc(100% - 80px)",
              }}
            >
              <ScrollView
                style={{
                  width: "100%",
                  height: "calc(100% - 44px)",
                }}
              >
                {flunks.length > 0 && (
                  <Frame
                    variant="field"
                    style={{
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: ".5rem",
                    }}
                  >
                    <FlunkImage src={flunks[0].metadata.uri} width="300px" />
                    <span
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      Flunk #{flunks[0].templateId}
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                      }}
                    >
                      {flunks[0].metadata.Superlative}
                    </span>
                  </Frame>
                )}
                <span
                  ref={resizeRef}
                  onResize={console.log}
                  onResizeCapture={console.log}
                />
              </ScrollView>
            </WindowContent>
          </Window>
        </Draggable> */}
        <React.Fragment>
          {Object.keys(windows).length > 0 &&
            Object.entries(windows).map(([key, window]) => (
              <React.Fragment key={key}>{window}</React.Fragment>
            ))}
        </React.Fragment>
      </CustomMonitor>
    </>
  );
};

export default Home;

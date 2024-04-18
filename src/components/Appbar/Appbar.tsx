import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import useInitCollection from "hooks/useInitCollection";
import { useEffect, useState } from "react";
import {
  AppBar,
  Button,
  MenuList,
  MenuListItem,
  Separator,
  Toolbar,
} from "react95";
import styled from "styled-components";
import LostAndFound from "windows/LostAndFound";
import StudentExplorer from "windows/StudentExplorer";
import YourStudents from "windows/YourStudents";
import StartButton from "./StartButton";

const CustomMenuListItem = styled(MenuListItem)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  position: relative;
`;

const Appbar = () => {
  const [open, setOpen] = useState(false);
  const { openWindow } = useWindowsContext();
  const { isInitialized, initializeCollection } = useInitCollection();

  return (
    <AppBar
      fixed={false}
      style={{
        zIndex: 1000,
        top: "100%",
        transform: "translateY(-100%)",
      }}
    >
      <Toolbar
        style={{ justifyContent: "space-between", position: "relative" }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <StartButton />
          {/* <Button
            onClick={() => setOpen(!open)}
            active={open}
            style={{ fontWeight: "bold" }}
          >
            <img
              src={"/images/os-logo.png"}
              alt="react95 logo"
              style={{ height: "20px", marginRight: 4 }}
            />
            Start
          </Button> */}
          {/* {open && (
            <MenuList
              style={{
                position: "absolute",
                left: "0",
                bottom: "100%",
                minWidth: "200px",
              }}
              onClick={() => setOpen(false)}
            >
              <CustomMenuListItem
                onClick={() => {
                  openWindow({
                    key: WINDOW_IDS.STUDENT_EXPLORER,
                    window: <StudentExplorer />,
                  });
                }}
              >
                <img
                  src="/images/student-directory.png"
                  width="32px"
                  height="32px"
                />
                Student Directory
              </CustomMenuListItem>
              <CustomMenuListItem
                onClick={() => {
                  openWindow({
                    key: WINDOW_IDS.YOUR_STUDENTS,
                    window: <YourStudents />,
                  });
                }}
              >
                <img
                  src="/images/your-students.png"
                  width="32px"
                  height="32px"
                />
                Your Students
              </CustomMenuListItem>
              <CustomMenuListItem
                onClick={() => {
                  openWindow({
                    key: WINDOW_IDS.LOST_AND_FOUND,
                    window: <LostAndFound />,
                  });
                }}
              >
                <img
                  src="/images/lost-and-found.png"
                  width="32px"
                  height="32px"
                />
                Lost and Found
              </CustomMenuListItem>
              {!isInitialized && (
                <CustomMenuListItem
                  onClick={() => {
                    initializeCollection();
                  }}
                >
                  <img
                    src="/images/init-collection.png"
                    width="32px"
                    height="32px"
                  />
                  Initialize Collection
                </CustomMenuListItem>
              )}
              <Separator />
              <CustomMenuListItem>
                <img src="/images/logout.png" width="32px" height="32px" />
                Login
              </CustomMenuListItem>
            </MenuList>
          )} */}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Appbar;

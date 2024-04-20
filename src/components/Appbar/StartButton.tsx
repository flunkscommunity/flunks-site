import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import React from "react";
import { Button, MenuList, MenuListItem, Separator } from "react95";
import styled from "styled-components";
import LostAndFound from "windows/LostAndFound";
import Settings from "windows/Settings";
import StudentExplorer from "windows/StudentExplorer";
import YourStudents from "windows/YourStudents";

const CustomMenuListItem = styled(MenuListItem)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  position: relative;
`;

const AuthButton = () => {
  const { user, setShowDynamicUserProfile } = useDynamicContext();

  if (user) {
    return (
      <CustomMenuListItem onClick={() => setShowDynamicUserProfile(true)}>
        <img src="/images/logout.png" width="32px" height="32px" />
        View Profile
      </CustomMenuListItem>
    );
  }

  return (
    <DynamicConnectButton buttonClassName="w-full">
      <CustomMenuListItem className="!w-full">
        <img src="/images/logout.png" width="32px" height="32px" />
        Sign In
      </CustomMenuListItem>
    </DynamicConnectButton>
  );
};

const StartMenu: React.FC<{ closeStartMenu: () => void }> = (props) => {
  const { openWindow } = useWindowsContext();

  return (
    <MenuList className="!absolute bottom-[calc(100%+6px)] -left-1 min-w-[300px] !flex !flex-row">
      <div className="w-10 bg-[#888888] relative">
        <div className="absolute -bottom-5 left-1 text-xl text-white origin-[0_0] -rotate-90 text-nowrap">
          <span className="text-[#C4C2C4] font-black leading-[1]">FLUNKS</span>
          <span className="font-medium text-white leading-[1]">95</span>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.STUDENT_EXPLORER,
              window: <StudentExplorer />,
            });
            props.closeStartMenu();
          }}
        >
          <img src="/images/student-directory.png" width="32px" height="32px" />
          Student Directory
        </CustomMenuListItem>
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.YOUR_STUDENTS,
              window: <YourStudents />,
            });
            props.closeStartMenu();
          }}
        >
          <img src="/images/your-students.png" width="32px" height="32px" />
          Your Students
        </CustomMenuListItem>
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.LOST_AND_FOUND,
              window: <LostAndFound />,
            });
            props.closeStartMenu();
          }}
        >
          <img src="/images/lost-and-found.png" width="32px" height="32px" />
          Lost and Found
        </CustomMenuListItem>
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.SETTINGS,
              window: <Settings />,
            });
            props.closeStartMenu();
          }}
        >
          <img src="/images/icons/user.png" width="32px" height="32px" />
          User Information
        </CustomMenuListItem>
        <Separator />
        <AuthButton />
      </div>
    </MenuList>
  );
};

const StartButton = () => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      {open && <StartMenu closeStartMenu={() => setOpen(false)} />}
      <Button
        onClick={() => setOpen(!open)}
        active={open}
        className="font-black !flex !items-center gap-1"
      >
        <img
          src={"/images/os-logo.png"}
          alt="flunks-95 logo"
          className="object-contain max-h-5 mr-1"
        />
        <span className="mb-1.5">Start</span>
      </Button>
    </div>
  );
};

export default StartButton;

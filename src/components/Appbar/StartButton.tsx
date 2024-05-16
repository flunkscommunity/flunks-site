import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import useIsMounted from "hooks/useIsMounted";
import React from "react";
import { Button, MenuList, MenuListItem, Separator } from "react95";
import styled from "styled-components";
import GumballMachine from "windows/GumballMachine";
import LostAndFound from "windows/LostAndFound";
import Settings from "windows/Settings";
import StudentExplorer from "windows/StudentExplorer";
import Welcome from "windows/Welcome";
import YourStudents from "windows/YourStudents";

const CustomMenuListItem = styled(MenuListItem)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  position: relative;
`;

const AuthButton = () => {
  const { user, handleLogOut } = useDynamicContext();

  if (user) {
    return (
      <CustomMenuListItem onClick={handleLogOut} className="!text-xl">
        <img src="/images/logout.png" width="32px" height="32px" />
        Sign Out
      </CustomMenuListItem>
    );
  }

  return (
    <DynamicConnectButton buttonClassName="w-full">
      <CustomMenuListItem className="!w-full !text-xl">
        <img src="/images/logout.png" width="32px" height="32px" />
        Sign In
      </CustomMenuListItem>
    </DynamicConnectButton>
  );
};

const SideLogoContainer = styled.div`
  background-color: ${({ theme }) => theme.borderDark};
`;
const FlunksLogoText = styled.span`
  color: ${({ theme }) => theme.borderLight};
`;
const NintyFiveLogoText = styled.span`
  color: ${({ theme }) => theme.borderLightest};
`;

const StartMenu: React.FC<{ closeStartMenu: () => void }> = (props) => {
  const { openWindow } = useWindowsContext();

  return (
    <MenuList className="!absolute bottom-[calc(100%+6px)] -left-1 min-w-[300px] !flex !flex-row">
      <SideLogoContainer className="w-10 relative">
        <div className="absolute -bottom-5 left-1 text-xl origin-[0_0] -rotate-90 text-nowrap">
          <FlunksLogoText className="font-black mr-2">FLUNKS</FlunksLogoText>
          <NintyFiveLogoText className="font-medium">95</NintyFiveLogoText>
        </div>
      </SideLogoContainer>
      <div className="flex flex-col w-full">
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.WELCOME,
              window: <Welcome />,
            });
            props.closeStartMenu();
          }}
          className="!text-xl"
        >
          <img
            src="/images/icons/getting_started.png"
            width="32px"
            height="32px"
          />
          Getting Started
        </CustomMenuListItem>
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.GUMBALL_MACHINE,
              window: <GumballMachine />,
            });
            props.closeStartMenu();
          }}
          className="!text-xl"
        >
          <img src="/images/icons/gum-machine.png" width="32px" height="32px" />
          Gumball Machine
        </CustomMenuListItem>
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.STUDENT_EXPLORER,
              window: <StudentExplorer />,
            });
            props.closeStartMenu();
          }}
          className="!text-xl"
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
          className="!text-xl"
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
          className="!text-xl"
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
          className="!text-xl"
        >
          <img src="/images/icons/settings.png" width="32px" height="32px" />
          Settings
        </CustomMenuListItem>
        <Separator />
        <AuthButton />
      </div>
    </MenuList>
  );
};

const StartButton = () => {
  const [open, setOpen] = React.useState(false);

  const { isMounted } = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative">
      {open && <StartMenu closeStartMenu={() => setOpen(false)} />}
      <Button
        onClick={() => setOpen(!open)}
        active={open ? open : undefined}
        className="font-black !flex !items-center gap-1"
      >
        <img
          src={"/images/os-logo.png"}
          alt="flunks-95 logo"
          className="object-contain max-h-5 mr-1"
        />
        <span className="text-xl">Start</span>
      </Button>
    </div>
  );
};

export default StartButton;

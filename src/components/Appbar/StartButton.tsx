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
import AboutUs from "windows/AboutUs";
import GumballMachine from "windows/GumCenterNew";
import ProjectJnr from "windows/ProjectJnr";
import Settings from "windows/Settings";
import LockerSystemNew from "windows/LockerSystemNew";
import Welcome from "windows/Welcome";
import YourStudents from "windows/YourStudents";
import Onlyflunks from "windows/Onlyflunks";
import SimpleBrowser from "windows/SimpleBrowser";
import DevPreview from "windows/DevPreview";

const CustomMenuListItem = styled(MenuListItem)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  position: relative;
`;

const AuthButton = () => {
  const { user, setShowDynamicUserProfile } = useDynamicContext();

  // Regular auth flow
  if (user) {
    return (
      <CustomMenuListItem
        onClick={() => setShowDynamicUserProfile(true)}
        className="!text-xl"
      >
        <img src="/images/icons/user.png" width="32px" height="32px" />
        Open Wallet
      </CustomMenuListItem>
    );
  }

  return (
    <DynamicConnectButton buttonClassName="w-full">
      <CustomMenuListItem className="!w-full !text-xl">
        <img src="/images/icons/logout.png" width="32px" height="32px" />
        Sign In
      </CustomMenuListItem>
    </DynamicConnectButton>
  );
};

const SideLogoContainer = styled.div`
  background-color: ${({ theme }) => theme.borderDark};
`;
const FlunksLogoText = styled.span`
  color: ${({ theme }) => "white"};
  opacity: 0.5;
  // text-shadow: 1px 1px 0 ${({ theme }) => "white"};
`;
const NintyFiveLogoText = styled.span`
  color: ${({ theme }) => "white"};
  opacity: 1;
  // text-shadow: 1px 1px 0 ${({ theme }) => "white"};
`;

const StartMenu: React.FC<{ closeStartMenu: () => void }> = (props) => {
  const { openWindow } = useWindowsContext();

  return (
    <MenuList className="!absolute bottom-[calc(100%+6px)] -left-1 min-w-[300px] !flex !flex-row">
      <SideLogoContainer className="w-10 relative">
        <div className="absolute -bottom-5 left-0.5 text-2xl origin-[0_0] -rotate-90 text-nowrap mix-blend-plus-lighter">
          <FlunksLogoText className="font-black mr-1 tracking-widest">
            FLUNKS
          </FlunksLogoText>
          <NintyFiveLogoText className="font-light tracking-widest">
            2.0
          </NintyFiveLogoText>
        </div>
      </SideLogoContainer>
      <div className="flex flex-col w-full">
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.FLUNKS_HUB,
              window: <Onlyflunks />,
            });
            props.closeStartMenu();
          }}
          className="!text-xl"
        >
          <img src="/images/icons/onlyflunks.png" width="32px" height="32px" />
          OnlyFlunks
        </CustomMenuListItem>
        <CustomMenuListItem
          onClick={() => {
            openWindow({
              key: WINDOW_IDS.USER_PROFILE,
              window: <LockerSystemNew />,
            });
            props.closeStartMenu();
          }}
          className="!text-xl"
        >
          <img src="/images/icons/my-locker-icon.svg" width="32px" height="32px" />
          My Locker
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
    <div className="relative flex-shrink-0">
      {open && <StartMenu closeStartMenu={() => setOpen(false)} />}
      <Button
        onClick={() => setOpen(!open)}
        active={open ? open : undefined}
        className="font-black !flex !items-center gap-1"
      >
        <img
          src={"/images/logos/os-logo.png"}
          alt="flunks-95 logo"
          className="object-contain max-h-5 mr-1"
        />
        <span className="text-xl">Start</span>
      </Button>
    </div>
  );
};

export default StartButton;

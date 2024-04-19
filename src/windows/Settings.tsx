import { UsersApiInstance } from "api";
import NftFrameGrid from "components/NftFrameGrid";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Avatar,
  Button,
  Frame,
  GroupBox,
  Handle,
  ScrollView,
  Tab,
  TabBody,
  Tabs,
  TextInput,
  Toolbar,
} from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";
import { useUser } from "contexts/WalletContext";
import { useSwrWrapper } from "api/useSwrWrapper";
import BackpackFrameGrid from "components/Backpacks/BackpackFrameGrid";
import { H2, H3 } from "components/Typography";
import ClaimChecker from "components/ClaimForm/ClaimChecker";
import ClaimFormFrameGrid from "components/ClaimForm/ClaimFormFrameGrid";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";

const ICONS = {
  blocto: "https://iconic.dynamic-static-assets.com/icons/sprite.svg#blocto",
  dapper: "https://iconic.dynamic-static-assets.com/icons/sprite.svg#dapper",
};

const UserTab = () => {
  const { user, primaryWallet, handleLogOut } = useDynamicContext();

  return (
    <ScrollView className="w-full h-full flex flex-col">
      <GroupBox
        label="User Information"
        className="!mx-2 lg:!mx-5 lg:!mt-8 !mt-6 !mb-3"
      >
        {!user && (
          <div className="flex flex-col items-start gap-10">
            <div className="flex items-center gap-4">
              <img src="/images/icons/error.png" />
              <span className="text-xl mt-1">
                No User Information Available
              </span>
            </div>
            <DynamicConnectButton>
              <Button className="ml-auto">Sign In</Button>
            </DynamicConnectButton>
          </div>
        )}
        {user && (
          <div className="flex flex-col gap-y-3">
            <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
              <label className="min-w-[150px]">Username:</label>
              <span className="max-w-fit ml-3 w-full min-w-[150px]">
                {user.username}
              </span>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
              <label className="min-w-[150px]">Email:</label>
              <span className="max-w-fit ml-3 w-full min-w-[150px]">
                {user.email}
              </span>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
              <label className="min-w-[150px]">User Identifier:</label>
              <span className="max-w-fit ml-3 w-full min-w-[150px]">
                {user.userId}
              </span>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
              <label className="min-w-[150px]">Connected Wallet:</label>
              <div className="max-w-fit ml-3 w-full flex gap-2 items-center min-w-[150px]">
                <div className="rounded-full w-2 h-2 bg-green-500 animate-pulse" />
                <span>{primaryWallet.address}</span>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
              <label className="min-w-[150px]">Wallet Provider:</label>
              <span className="max-w-fit ml-3 w-full min-w-[150px]">
                {primaryWallet.connector.name}
              </span>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1.5 gap-x-4">
              <label className="min-w-[150px]">Blockchain:</label>
              <span className="max-w-fit ml-3 w-full uppercase min-w-[150px]">
                {primaryWallet.chain}
              </span>
            </div>
            <span className="col-span-12">Verified Wallets</span>
            <Frame
              variant="field"
              className="!grid !grid-cols-1 max-w-[300px] col-span-12 px-3 py-3 gap-2"
            >
              {user.verifiedCredentials.map((credential) => {
                if (!credential.walletName) return null;

                return (
                  <GroupBox
                    variant="flat"
                    label={credential.walletName || credential.format}
                    key={credential.id}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={ICONS[credential.walletName]}
                      alt={credential.walletName}
                      className="w-4 h-4"
                    />
                    <span className="mt-1">{credential.address}</span>
                  </GroupBox>
                );
              })}
            </Frame>
          </div>
        )}
      </GroupBox>
    </ScrollView>
  );
};

const Settings: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="System Settings"
      onClose={() => {
        closeWindow(WINDOW_IDS.SETTINGS);
      }}
      showMaximizeButton={false}
    >
      <div className="h-full flex flex-col w-full">
        <UserTab />
        {/* <Tabs
          value={activeTab}
          onChange={() => {
            setActiveTab(activeTab === 0 ? 1 : 0);
          }}
        >
          <Tab value={0}>User</Tab>
          <Tab value={1}>General</Tab>
        </Tabs>
        <TabBody>{activeTab === 0 && <UserTab />}</TabBody> */}
        {/* <div className="w-full flex items-center justify-end py-4 gap-2">
          <Button className="min-w-[100px]" disabled>
            OK
          </Button>
          <Button className="min-w-[100px]">Cancel</Button>
        </div> */}
      </div>
    </DraggableResizeableWindow>
  );
};

export default Settings;

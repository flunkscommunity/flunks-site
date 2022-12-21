import { UsersApiInstance } from "api";
import NftFrameGrid from "components/NftFrameGrid";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Button,
  Frame,
  Handle,
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
import { H3 } from "components/Typography";
import ClaimChecker from "components/ClaimForm/ClaimChecker";
import ClaimFormFrameGrid from "components/ClaimForm/ClaimFormFrameGrid";

const LostAndFound: React.FC = () => {
  const { walletAddress } = useUser();
  const { closeWindow, openWindow } = useWindowsContext();
  const [activeTab, setActiveTab] = useState(0);
  const { data, isValidating } = useSwrWrapper({
    fetcher:
      UsersApiInstance.usersControllerGetUserNftsByWalletAddress.bind(
        UsersApiInstance
      ),
    requestParameters: {
      walletAddress,
    },
    key: `${walletAddress}-students`,
  });
  const flunks = data?.Flunks || [];
  const backpacks = data?.Backpack || [];

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Lost and Found v2.0"
      onClose={() => {
        closeWindow(WINDOW_IDS.LOST_AND_FOUND);
      }}
    >
      <SlowProgressBar bgImage="/images/lost-and-found-bg.png">
        <Tabs
          value={activeTab}
          onChange={() => {
            setActiveTab(activeTab === 0 ? 1 : 0);
          }}
        >
          <Tab value={0}>Claim Checker</Tab>
          <Tab value={1}>Claim Forms</Tab>
        </Tabs>
        <TabBody>
          {activeTab === 1 && (
            <ClaimFormFrameGrid nfts={flunks} isValidating={isValidating} />
          )}
          {activeTab === 0 && <ClaimChecker />}
        </TabBody>
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default LostAndFound;

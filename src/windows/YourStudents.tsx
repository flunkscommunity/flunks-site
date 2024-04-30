import { CollectionApiInstance, UsersApiInstance } from "api";
import { MarketplaceIndividualNftDto } from "api/generated";
import PaginatedProdiver, {
  usePaginatedContext,
} from "contexts/PaginatedContext";
import NftFrameGrid from "components/NftFrameGrid";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Anchor, Button, Handle, Tab, TabBody, Tabs, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS, FLUNK_TRAITS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";
import Filters from "components/Filters";
import TraitFilters from "./TraitFilters";
import { useUser } from "contexts/WalletContext";
import { useSwrWrapper } from "api/useSwrWrapper";
import BackpackFrameGrid from "components/Backpacks/BackpackFrameGrid";
import {
  useDynamicContext,
  DynamicConnectButton,
} from "@dynamic-labs/sdk-react-core";

const YourStudents: React.FC = () => {
  // const { walletAddress } = useUser();
  const { user, primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address;
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

  // Not sure if this is needed anymore.
  // =========================================
  // if (!user)
  //   return (
  //     <ErrorWindow
  //       title="Error Starting Program"
  //       message="You're not signed in. Please sign in to continue.."
  //       actions={
  //         <>
  //           <Button onClick={() => closeWindow(WINDOW_IDS.YOUR_STUDENTS)}>
  //             Close
  //           </Button>
  //           <DynamicConnectButton>
  //             <Button as={"a"} primary className="ml-auto">
  //               Sign In
  //             </Button>
  //           </DynamicConnectButton>
  //         </>
  //       }
  //       windowId={WINDOW_IDS.SETTINGS}
  //     />
  //   );

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Your Students v0.6"
      authGuard={true}
      windowsId={WINDOW_IDS.YOUR_STUDENTS}
      onClose={() => {
        closeWindow(WINDOW_IDS.YOUR_STUDENTS);
      }}
    >
      <SlowProgressBar bgImage="/images/your-students-bg.png">
        <Tabs
          value={activeTab}
          onChange={() => {
            setActiveTab(activeTab === 0 ? 1 : 0);
          }}
        >
          <Tab value={0}>Students</Tab>
          <Tab value={1}>Accessories</Tab>
        </Tabs>
        <TabBody>
          {activeTab === 0 && (
            <NftFrameGrid nfts={flunks} isValidating={isValidating} />
          )}
          {activeTab === 1 && (
            <BackpackFrameGrid nfts={backpacks} isValidating={isValidating} />
          )}
        </TabBody>
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default YourStudents;

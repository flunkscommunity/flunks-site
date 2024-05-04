import { CollectionApiInstance, UsersApiInstance } from "api";
import { MarketplaceIndividualNftDto } from "api/generated";
import PaginatedProdiver, {
  usePaginatedContext,
} from "contexts/PaginatedContext";
import NftFrameGrid from "components/NftFrameGrid";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Anchor,
  Button,
  Frame,
  Handle,
  ScrollView,
  Tab,
  TabBody,
  Tabs,
  Toolbar,
} from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS, FLUNK_TRAITS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useState } from "react";
import Filters from "components/Filters";
import TraitFilters from "./TraitFilters";
import { useUser } from "contexts/WalletContext";
import { useSwrWrapper } from "api/useSwrWrapper";
import BackpackFrameGrid from "components/Backpacks/BackpackFrameGrid";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import styled from "styled-components";
import ItemsGrid from "components/YourItems/ItemsGrid";

{
  /* <Frame variant="field" className="!p-10 !flex flex-col">
            <div className="flex w-full">
              <Frame
                variant="well"
                className="col-span-9 flex-grow items-center px-2 py-1"
              >
                <span>$GUM Balance</span>
              </Frame>
              <Frame
                variant="well"
                className="col-span-3 !flex items-end justify-end px-2 py-1 z-[1]"
              >
                <animated.span>
                  {gumBalanceProps.number &&
                    gumBalanceProps.number.to((n) => n.toFixed(5))}
                </animated.span>
              </Frame>
            </div>
          </Frame> */
}

{
  /* <div className="flex flex-col items-start px-4 py-2">
            <div className="relative flex flex-row items-center w-full justify-between">
              <div className="flex flex-col items-start">
                <span className="text-base font-bold">Flunks</span>

                <span className="text-base">Exclusive</span>
              </div>
              <Frame
                variant="field"
                className="!flex-grow-0 py-1.5 px-2 !flex gap-2 items-center ml-auto"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="mt-0.5">{walletAddress}</span>
              </Frame>
            </div>
            {true && (
              <>
                <div className="flex pt-4 w-full">
                  <Frame
                    variant="well"
                    className="col-span-9 flex-grow items-center px-2 py-1"
                  >
                    <span>GUM Balance</span>
                  </Frame>
                  <Frame
                    variant="well"
                    className="col-span-3 !flex items-end justify-end px-2 py-1 z-[1]"
                  >
                    <animated.span>
                      {gumBalanceProps.number &&
                        gumBalanceProps.number.to((n) => n.toFixed(5))}
                    </animated.span>
                  </Frame>
                </div>
                <div className="flex flex-col w-full items-start gap-2">
                  <div className="flex w-full">
                    <Frame
                      variant="well"
                      className="col-span-9 flex-grow items-center px-2 py-1"
                    >
                      <span>Pending Gum</span>
                    </Frame>
                    <Frame
                      variant="well"
                      className="col-span-3 !flex items-end justify-end px-2 py-1"
                    >
                      <animated.span>
                        {pendingRewardsProps.number &&
                          pendingRewardsProps.number.to((n) => n.toFixed(5))}
                      </animated.span>
                    </Frame>
                  </div>
                </div>
              </>
            )}
          </div> */
}

const CustomImage = styled.img`
  background-color: ${({ theme }) => theme.borderLight};
`;

const ScrollViewWithBackground = styled(ScrollView)`
  background-image: linear-gradient(
      ${({ theme }) => theme.borderLightest} 1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => theme.borderLightest} 1px,
      ${({ theme }) => theme.material} 1px
    );
  background-size: 20px 20px;
`;

const YourStudents: React.FC = () => {
  const { primaryWallet } = useDynamicContext();
  const { closeWindow, openWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Vault Explorer"
      authGuard={true}
      windowsId={WINDOW_IDS.YOUR_STUDENTS}
      onClose={() => {
        closeWindow(WINDOW_IDS.YOUR_STUDENTS);
      }}
      initialHeight="auto"
      initialWidth="auto"
    >
      <SlowProgressBar bgImage="/images/your-students-bg.png">
        <ItemsGrid />
        {/* <Tabs
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
            <Frame className="!w-full !h-full">

            </Frame>
            // <NftFrameGrid nfts={flunks} isValidating={isValidating} />
          )}
          {activeTab === 1 && (
            <BackpackFrameGrid nfts={backpacks} isValidating={isValidating} />
          )}
        </TabBody> */}
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default YourStudents;

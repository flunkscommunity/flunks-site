import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  useUsersControllerGetUserNftsByWalletAddress,
  usersControllerGetUserNftsByWalletAddress,
} from "generated/api/users/users";
import { MarketplaceIndividualNftDto } from "generated/models";
import React, { use, useEffect, useMemo, useState } from "react";
import {
  Button,
  Frame,
  Handle,
  MenuList,
  MenuListItem,
  Monitor,
  ScrollView,
  Select,
  SelectNative,
  Separator,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "react95";
import useThemeSettings from "store/useThemeSettings";
import styled from "styled-components";
import FlunkItem from "./FlunkItem";
import BackpackItem from "./BackpackItem";
import { InfoItem } from "components/Settings/UserInformation";
import Marquee from "react-fast-marquee";
import { getGumBalance } from "web3/script-get-gum-balance";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import GumballMachine from "windows/GumballMachine";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import FlunkfolioItem from "windows/FlunkfolioItem";
import { getWalletStakeInfo } from "web3/script-get-wallet-stake-info";
import { getWalletInfoShallow } from "web3/script-get-wallet-items-shallow";
import YourItemsGridHeader from "./Header/Header";
import NoItemsMessage from "./NoItemsMessage";
import { usePaginatedItems } from "contexts/UserPaginatedItems";

const CustomImage = styled.img`
  background-color: ${({ theme }) => theme.borderLight};
`;

const ScrollViewWithBackground = styled(CustomScrollArea)`
  background-image: linear-gradient(
      ${({ theme }) => theme.borderLightest}3F 1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => theme.borderLightest}3F 1px,
      ${({ theme }) => theme.material} 1px
    );
  background-size: 20px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const GridedView: React.FC<{
  items: NftItem[];
  setActiveItem: (nft: NftItem) => void;
}> = ({ items, setActiveItem }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))]">
      {items.map((nft: NftItem) => (
        <Frame variant="window" className="p-2">
          <Frame variant="field" className="relative !flex !flex-col">
            <Frame variant="well" className="!w-full !h-full">
              <CustomImage
                src={nft.MetadataViewsDisplay.thumbnail.url}
                className="min-w-full min-h-full"
              />
            </Frame>
            <div className="backdrop-blur-xl bottom-0 left-0flex flex-col w-full items-start gap-2">
              <div className="flex w-full items-center">
                <Frame
                  variant="well"
                  className="col-span-9 flex-grow items-center px-2 py-1"
                >
                  <div className="text-xl flex items-center justify-between">
                    <span>
                      {nft.collection === "Flunks" ? "Flunk" : "Backpack"}
                    </span>
                    <span>#{nft.serialNumber}</span>
                  </div>
                </Frame>
                <Frame
                  variant="well"
                  className="col-span-3 !flex items-end justify-end"
                >
                  <Button
                    onClick={() => setActiveItem(nft)}
                    variant="raised"
                    className="text-xl"
                  >
                    Full Details
                  </Button>
                </Frame>
              </div>
            </div>
          </Frame>
        </Frame>
      ))}
    </div>
  );
};

interface Thumbnail {
  url: string;
}

interface MetadataViewsDisplay {
  name: string;
  description: string;
  thumbnail: Thumbnail;
}

interface Trait {
  name: string;
  value: string;
  displayType: string | null;
  rarity: string | null;
}

interface Traits {
  traits: Trait[];
}

interface StakingInfo {
  staker: string;
  tokenID: string;
  stakedAtInSeconds: string;
  pool: string;
}

export interface CombinedObject {
  owner: string;
  tokenID: string;
  MetadataViewsDisplay: MetadataViewsDisplay;
  traits: Traits;
  serialNumber: string;
  stakingInfo: StakingInfo;
  collection: string;
  rewards: string;
  claimedRewards: string;
  pixelUrl: string;
}

export interface NftItem {
  owner: string;
  tokenID: string;
  MetadataViewsDisplay: MetadataViewsDisplay;
  traits: Record<string, string>;
  serialNumber: string;
  stakingInfo: StakingInfo;
  collection: string;
  rewards: string;
  claimedRewards: string;
  pixelUrl: string;
}

const TableView: React.FC<{
  items: NftItem[];
  setActiveItem: (nft: NftItem) => void;
}> = ({ items, setActiveItem }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
      {items.map((nft: NftItem) => (
        <button
          className="flex h-full group !p-0"
          onClick={() => {
            setActiveItem(nft);
          }}
        >
          <Frame variant="field" className="h-full flex-shrink-0">
            <img
              src={nft.MetadataViewsDisplay.thumbnail.url}
              className="h-full max-h-[40px]"
            />
          </Frame>
          <Frame variant="well" className="w-full h-full ">
            <div className="max-h-[40px] h-[40px] !flex flex-col items-start justify-start">
              <div className="w-full h-full flex">
                <Frame
                  variant="status"
                  className="w-full h-full px-3 !flex items-center"
                >
                  {nft.collection === "Flunks" ? "Flunk" : "Backpack"} #
                  {nft.serialNumber}
                </Frame>

                <Frame
                  variant="field"
                  className="w-auto h-full px-3 !flex items-center"
                >
                  <img
                    src="/images/icons/arrow-right.png"
                    className="h-4 w-auto group-hover:translate-x-1 transition-transform"
                  />
                </Frame>
              </div>
            </div>
          </Frame>
        </button>
      ))}
    </div>
  );
};

const ItemsGrid: React.FC = () => {
  const { openWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const scrollViewRef = React.useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] =
    useState<MarketplaceIndividualNftDto | null>(null);
  const [canLoadData, setCanLoadData] = useState<boolean>(false);
  const [data, setData] = useState<CombinedObject[]>(null!);

  const { displayedItems, currentPage, setPage, viewType, currentDataPages } =
    usePaginatedItems();

  const memodCombinedItems = displayedItems;

  React.useEffect(() => {
    // Scroll to top when active item changes
    scrollViewRef.current?.scrollTo(0, 0);
  }, [activeItem]);

  const noItems = !memodCombinedItems?.length;

  const handleOpenFlunkfolioItem = (nft: NftItem) => {
    openWindow({
      key: `${WINDOW_IDS.FLUNKFOLIO_ITEM}${nft.serialNumber}`,
      window: (
        <FlunkfolioItem
          title={`${nft.collection === "Flunks" ? "Flunk" : "Backpack"} #${
            nft.serialNumber
          } - Full Details`}
          templateId={nft.serialNumber}
        >
          {nft.collection === "Flunks" && (
            <CustomStyledScrollView
              ref={scrollViewRef}
              className="!p-0 !w-full max-w-full !m-0 [&>div]:!p-0"
              style={{
                height: nft ? "100%" : "calc(100% - 160px)",
              }}
            >
              <ScrollViewWithBackground>
                <FlunkItem {...nft} onBack={() => setActiveItem(null)} />
              </ScrollViewWithBackground>
            </CustomStyledScrollView>
          )}
          {nft.collection === "Backpack" && (
            <CustomStyledScrollView
              ref={scrollViewRef}
              className="!p-0 !w-full max-w-full !m-0 [&>div]:!p-0"
              style={{
                height: nft ? "100%" : "calc(100% - 160px)",
              }}
            >
              <ScrollViewWithBackground>
                <BackpackItem {...nft} onBack={() => setActiveItem(null)} />
              </ScrollViewWithBackground>
            </CustomStyledScrollView>
          )}
        </FlunkfolioItem>
      ),
    });
  };

  return (
    <div className="!w-full !h-full max-w-full max-h-full flex flex-col">
      <YourItemsGridHeader />

      {noItems && canLoadData && <NoItemsMessage />}
      {!activeItem && !noItems && (
        <CustomStyledScrollView
          ref={scrollViewRef}
          className="!p-0 !w-full max-w-full !m-0 [&>div]:!p-0 relative"
          style={{
            height: activeItem ? "100%" : "calc(100% - 152px)",
          }}
        >
          <ScrollViewWithBackground>
            {viewType === "grid" && (
              <GridedView
                // @ts-ignore
                items={memodCombinedItems}
                setActiveItem={handleOpenFlunkfolioItem}
              />
            )}
            {viewType === "table" && (
              <TableView
                // @ts-ignore
                items={memodCombinedItems}
                setActiveItem={handleOpenFlunkfolioItem}
              />
            )}
            {currentDataPages?.length > 1 &&
              <Frame className="w-full !sticky bottom-0 !flex items-center justify-end p-1 mt-auto">
              <Button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <img src="/images/icons/arrow-left.png" className="h-4" />
              </Button>
              {currentDataPages
                ?.slice(currentPage, currentPage + 3)
                .map((_, i) => {
                  const pageIndex = currentPage + i; // Adjust the index to reflect the actual page number
                  return (
                    <Button
                      key={pageIndex}
                      onClick={() => setPage(pageIndex)}
                      disabled={currentPage === pageIndex}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
              <Button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === currentDataPages.length - 1}
              >
                <img src="/images/icons/arrow-right.png" className="h-4" />
              </Button>
            </Frame>}
          </ScrollViewWithBackground>
        </CustomStyledScrollView>
      )}
    </div>
  );
};

export default ItemsGrid;

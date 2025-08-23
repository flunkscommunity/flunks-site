import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
// import { MarketplaceIndividualNftDto } from "generated/models";
import React, { use, useCallback, useEffect, useMemo, useState } from "react";
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
// TODO: GUM functionality temporarily disabled - keep imports for future re-implementation
// import { getGumBalance } from "web3/script-get-gum-balance";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
// import GumballMachine from "windows/GumballMachine";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import OnlyflunksItem from "windows/OnlyflunksItem";
import { getWalletStakeInfo } from "web3/script-get-wallet-stake-info";
import { getWalletInfoShallow } from "web3/script-get-wallet-items-shallow";
import YourItemsGridHeader from "./Header/Header";
import NoItemsMessage from "./NoItemsMessage";
import { usePaginatedItems } from "contexts/UserPaginatedItems";
import { ObjectDetails } from "contexts/StakingContext";

const CustomImage = styled.img`
  background-color: ${({ theme }) => theme.borderLight};
  image-rendering: ${props => props.className?.includes('pixelated') ? 'pixelated' : 'auto'};
  image-rendering: ${props => props.className?.includes('pixelated') ? '-moz-crisp-edges' : 'auto'};
  image-rendering: ${props => props.className?.includes('pixelated') ? 'crisp-edges' : 'auto'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

// Retro 8-bit grid styling - Fixed 4-per-row layout for OnlyFlunks
const RetroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  background: 
    linear-gradient(45deg, #001122 25%, transparent 25%), 
    linear-gradient(-45deg, #001122 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #001122 75%), 
    linear-gradient(-45deg, transparent 75%, #001122 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  
  @media (max-width: 800px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 12px;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    padding: 8px;
  }
`;

const RetroItemFrame = styled(Frame)`
  background: linear-gradient(135deg, #000080 0%, #000040 50%, #000020 100%) !important;
  border: 2px solid #00ffff !important;
  box-shadow: 
    inset 0 0 0 1px #0088aa,
    0 0 10px #00ffff33,
    0 0 20px #00ffff11 !important;
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 255, 0.05) 2px,
        rgba(0, 255, 255, 0.05) 4px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

const RetroImageFrame = styled(Frame)`
  background: #000000 !important;
  border: 2px solid #ff00ff !important;
  box-shadow: 
    inset 0 0 0 1px #880088,
    0 0 5px #ff00ff33 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const RetroButton = styled(Button)`
  background: #800080 !important;
  border: 2px solid #ff00ff !important;
  color: #ffffff !important;
  font-family: 'Cooper Black', 'Arial Black', 'Helvetica', 'Courier New', monospace !important;
  font-weight: bold !important;
  text-shadow: 0 0 3px #ff00ff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  padding: 4px 8px !important;
  
  &:hover {
    background: #400040 !important;
    box-shadow: 0 0 8px #ff00ff !important;
  }
  
  & > * {
    width: 100% !important;
    text-align: center !important;
  }
`;

const RetroText = styled.span`
  font-family: 'Cooper Black', 'Arial Black', 'Helvetica', 'Courier New', monospace;
  color: #ff00ff;
  text-shadow: 
    /* Dark outline for contrast */
    -1px -1px 0 #000000,
    1px -1px 0 #000000,
    -1px 1px 0 #000000,
    1px 1px 0 #000000,
    0 -1px 0 #000000,
    0 1px 0 #000000,
    -1px 0 0 #000000,
    1px 0 0 #000000,
    /* Glow effect */
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 15px currentColor;
  font-weight: bold;
  animation: neonCycle 8s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  @keyframes neonCycle {
    0% { 
      color: #ff00ff; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #ff00ff,
        0 0 10px #ff00ff,
        0 0 15px #ff00ff;
    }
    16.6% { 
      color: #00ffff; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #00ffff,
        0 0 10px #00ffff,
        0 0 15px #00ffff;
    }
    33.3% { 
      color: #ffff00; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #ffff00,
        0 0 10px #ffff00,
        0 0 15px #ffff00;
    }
    50% { 
      color: #ff6600; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #ff6600,
        0 0 10px #ff6600,
        0 0 15px #ff6600;
    }
    66.6% { 
      color: #00ff00; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #00ff00,
        0 0 10px #00ff00,
        0 0 15px #00ff00;
    }
    83.3% { 
      color: #ff0099; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #ff0099,
        0 0 10px #ff0099,
        0 0 15px #ff0099;
    }
    100% { 
      color: #ff00ff; 
      text-shadow: 
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000,
        1px 1px 0 #000000,
        0 -1px 0 #000000,
        0 1px 0 #000000,
        -1px 0 0 #000000,
        1px 0 0 #000000,
        0 0 5px #ff00ff,
        0 0 10px #ff00ff,
        0 0 15px #ff00ff;
    }
  }
`;

const ScrollViewWithBackground = styled(CustomScrollArea)`
  background: 
    /* Arcade carpet speckle pattern */
    radial-gradient(circle at 15% 25%, #ff00ff55 1px, transparent 1px),
    radial-gradient(circle at 85% 75%, #00ffff55 1px, transparent 1px),
    radial-gradient(circle at 45% 85%, #ffff0055 1px, transparent 1px),
    radial-gradient(circle at 75% 15%, #ff660055 1px, transparent 1px),
    radial-gradient(circle at 25% 55%, #00ff0055 1px, transparent 1px),
    radial-gradient(circle at 65% 45%, #ff009955 1px, transparent 1px),
    
    /* Larger speckles for more texture */
    radial-gradient(circle at 35% 15%, #ff00ff33 2px, transparent 2px),
    radial-gradient(circle at 85% 35%, #00ffff33 2px, transparent 2px),
    radial-gradient(circle at 15% 75%, #ffff0033 2px, transparent 2px),
    radial-gradient(circle at 55% 65%, #ff660033 2px, transparent 2px),
    
    /* Subtle geometric pattern overlay */
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(255, 0, 255, 0.08) 8px,
      rgba(255, 0, 255, 0.08) 10px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 12px,
      rgba(0, 255, 255, 0.06) 12px,
      rgba(0, 255, 255, 0.06) 14px
    ),
    
    /* Base carpet color - deep black with slight texture */
    linear-gradient(
      135deg,
      #000000 0%,
      #0a0a0a 25%,
      #000000 50%,
      #050505 75%,
      #000000 100%
    );
  
  background-size: 
    40px 40px,  /* Small speckles */
    60px 60px,
    35px 35px,
    55px 55px,
    45px 45px,
    50px 50px,
    80px 80px,  /* Larger speckles */
    70px 70px,
    90px 90px,
    65px 65px,
    30px 30px,  /* Geometric patterns */
    25px 25px,
    100% 100%;  /* Base color */
  
  position: relative;
  display: flex;
  flex-direction: column;
`;

const GridedView: React.FC<{
  items: NftItem[];
  setActiveItem: (nft: NftItem) => void;
  pixelMode: boolean;
}> = ({ items, setActiveItem, pixelMode }) => {
  console.log('GridedView rendering with items:', items?.length || 0);
  
  if (!items || items.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '200px',
        color: '#00ffff',
        fontFamily: 'monospace'
      }}>
        No items to display in grid view
      </div>
    );
  }
  
  return (
    <RetroGrid>
      {items.map((nft: NftItem) => (
        <RetroItemFrame key={nft.tokenID} variant="window" className="p-2">
          <RetroImageFrame variant="field" className="relative !flex !flex-col flex-1">
            <Frame variant="well" className="!w-full !flex-1 !flex !items-center !justify-center overflow-hidden">
              <CustomImage
                src={pixelMode ? nft.pixelUrl || nft.MetadataViewsDisplay.thumbnail.url : nft.MetadataViewsDisplay.thumbnail.url}
                className="w-full h-full object-contain max-h-[150px]"
                alt={`${nft.collection} #${nft.serialNumber}`}
                onError={(e) => {
                  // Fallback to main thumbnail if pixel version fails
                  e.currentTarget.src = nft.MetadataViewsDisplay.thumbnail.url;
                }}
              />
            </Frame>
            <div className="w-full flex flex-col items-center gap-1 pt-2 z-10 relative">
              <Frame
                variant="well"
                className="w-full flex items-center justify-between px-2 py-1"
                style={{ background: '#000040', border: '1px solid #00ffff' }}
              >
                <RetroText className="text-xs">
                  {nft.collection === "Flunks" ? "Flunk" : "Backpack"}
                </RetroText>
                <RetroText className="text-xs">#{nft.serialNumber}</RetroText>
              </Frame>
              <RetroButton
                onClick={() => setActiveItem(nft)}
                variant="raised"
                className="w-full py-1"
                style={{ fontSize: '10px' }}
              >
                <RetroText style={{ fontSize: '10px' }}>FULL DETAILS</RetroText>
              </RetroButton>
            </div>
          </RetroImageFrame>
        </RetroItemFrame>
      ))}
    </RetroGrid>
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
  pixelMode: boolean;
}> = ({ items, setActiveItem, pixelMode }) => {
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
              src={pixelMode ? nft.pixelUrl || nft.MetadataViewsDisplay.thumbnail.url : nft.MetadataViewsDisplay.thumbnail.url}
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
  const scrollViewRef = React.useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] =
    useState<any | null>(null);
  const [pixelMode, setPixelMode] = useState<boolean>(false);

  const { displayedItems, currentPage, setPage, viewType, currentDataPages } =
    usePaginatedItems();

  const memodCombinedItems = displayedItems;

  React.useEffect(() => {
    // Scroll to top when active item changes
    scrollViewRef.current?.scrollTo(0, 0);
  }, [activeItem]);

  const noItems = !memodCombinedItems?.length;

  const handleOpenOnlyflunksItem = useCallback((nft: ObjectDetails) => {
    console.log(nft);
    openWindow({
      key: `${WINDOW_IDS.ONLYFLUNKS_ITEM}${nft.serialNumber}`,
      window: (
        <OnlyflunksItem
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
                <FlunkItem {...nft as ObjectDetails & { pixelUrl: string }} onBack={() => setActiveItem(null)} />
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
        </OnlyflunksItem>
      ),
    });
  }, [openWindow, setActiveItem]);

  return (
    <div className="!w-full !h-full max-w-full max-h-full flex flex-col">
      <YourItemsGridHeader pixelMode={pixelMode} setPixelMode={setPixelMode} />

      {noItems && <NoItemsMessage />}
      {!activeItem && !noItems && (
        <CustomStyledScrollView
          ref={scrollViewRef}
          className="!p-0 !w-full max-w-full !m-0 [&>div]:!p-0 relative"
          data-scroll-container="true"
          style={{
            height: activeItem ? "100%" : "calc(100% - 152px)",
          }}
        >
          <ScrollViewWithBackground>
            {viewType === "grid" && (
              <GridedView
                // @ts-ignore - Type conversion handled in component
                items={memodCombinedItems}
                setActiveItem={(nft) => handleOpenOnlyflunksItem(nft as unknown as ObjectDetails)}
                pixelMode={pixelMode}
              />
            )}
            {viewType === "table" && (
              <TableView
                // @ts-ignore - Type conversion handled in component
                items={memodCombinedItems}
                setActiveItem={(nft) => handleOpenOnlyflunksItem(nft as unknown as ObjectDetails)}
                pixelMode={pixelMode}
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

export default React.memo(ItemsGrid);

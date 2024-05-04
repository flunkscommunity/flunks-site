import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  useUsersControllerGetUserNftsByWalletAddress,
  usersControllerGetUserNftsByWalletAddress,
} from "generated/api/users/users";
import { MarketplaceIndividualNftDto } from "generated/models";
import React, { use, useMemo, useState } from "react";
import {
  Button,
  Frame,
  Handle,
  MenuList,
  MenuListItem,
  Monitor,
  ScrollView,
  Separator,
} from "react95";
import useThemeSettings from "store/useThemeSettings";
import styled from "styled-components";
import FlunkItem from "./FlunkItem";
import BackpackItem from "./BackpackItem";

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

const ItemsGrid: React.FC = () => {
  const { primaryWallet } = useDynamicContext();
  const { setBackgroundImage } = useThemeSettings();
  const walletAddress = primaryWallet?.address;
  const [activeItem, setActiveItem] =
    useState<MarketplaceIndividualNftDto | null>(null);

  const { data } = useUsersControllerGetUserNftsByWalletAddress(walletAddress);
  const memodCombinedItems = useMemo(() => {
    return Object.values(data?.data || {}).flat();
  }, [data]);

  return (
    <div className="!w-full !h-full max-w-full max-h-full">
      <ScrollViewWithBackground className="!h-full !p-0 !w-full max-w-full !m-0 [&>div]:!p-0">
        {!activeItem && (
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))]">
            {memodCombinedItems.map((nft: MarketplaceIndividualNftDto) => (
              <Frame variant="window" className="p-2">
                <Frame variant="field" className="relative !flex !flex-col">
                  <Frame variant="well" className="!w-full !h-full">
                    <CustomImage
                      src={nft.metadata.uri}
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
                            {nft.collectionName === "flunks"
                              ? "Flunk"
                              : "Backpack"}
                          </span>
                          <span>#{nft.tokenId}</span>
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
        )}
        {activeItem && activeItem.collectionName === "flunks" && (
          <FlunkItem {...activeItem} onBack={() => setActiveItem(null)} />
        )}
        {activeItem && activeItem.collectionName === "backpack" && (
          <BackpackItem {...activeItem} onBack={() => setActiveItem(null)} />
        )}
      </ScrollViewWithBackground>
    </div>
  );
};

export default ItemsGrid;

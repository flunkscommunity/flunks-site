import { MarketplaceIndividualNftDto } from "generated/models";
import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Button,
  Frame,
  Handle,
  MenuList,
  MenuListItem,
  Monitor,
  Separator,
} from "react95";
import useThemeSettings from "store/useThemeSettings";
import NavMenu from "./ItemNavMenu";
import ImageDisplay from "./ItemImageDisplay";
import TraitSection from "./ItemTraitSection";
import GumSection from "./ItemGumSection";
import { NftItem } from "./ItemsGrid";

interface BackpackItemProps extends NftItem {
  onBack: () => void;
}

const BackpackItem: React.FC<BackpackItemProps> = (props) => {
  return (
    <div className="w-full h-full relative">
      <NavMenu
        collectionName={"Backpack"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
        onBack={props.onBack}
      />
      <ImageDisplay
        src={props.MetadataViewsDisplay.thumbnail.url}
        collectionItemName={"Backpack"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
        pixelSrc={props.traits?.pixelUri}
      />
      <Frame className="!w-full h-auto pb-4">
        <TraitSection metadata={props.traits} />
        <GumSection
          pool={"Backpacks"}
          tokenId={Number(props.tokenID)}
          slots={Number(props.traits.slots)}
          claimedRewards={Number(props?.claimedRewards)?.toFixed(2)}
          rewards={Number(props.rewards)?.toFixed(2)}
        />
      </Frame>
    </div>
  );
};

export default BackpackItem;

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

interface BackpackItemProps extends MarketplaceIndividualNftDto {
  onBack: () => void;
}

const BackpackItem: React.FC<BackpackItemProps> = (props) => {
  return (
    <div className="w-full h-full relative">
      <NavMenu
        collectionName={"Backpack"}
        tokenId={props.tokenId}
        onBack={props.onBack}
      />
      <ImageDisplay
        src={props.metadata.uri}
        collectionItemName={"Backpack"}
        tokenId={props.tokenId}
        pixelSrc={props.metadata?.pixelUri}
      />
      <Frame className="!w-full h-auto pb-4">
        <TraitSection metadata={props.metadata} />
        <GumSection pool={"Backpacks"} tokenId={props.tokenId} />
      </Frame>
    </div>
  );
};

export default BackpackItem;

import { MarketplaceIndividualNftDto } from "generated/models";
import React, { useEffect, useMemo, useState } from "react";
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
// TODO: GUM functionality temporarily disabled - keep import for future re-implementation
// import GumSection from "./ItemGumSection";
import { NftItem } from "./ItemsGrid";
import { ObjectDetails } from "contexts/StakingContext";

interface BackpackItemProps extends ObjectDetails {
  onBack: () => void;
}

const BackpackItem: React.FC<BackpackItemProps> = (props) => {

  const _traitsObject = useMemo(() => {
    return props.traits.traits.reduce((acc, trait) => {
      acc[trait.name] = trait.value;
      return acc;
    }, {});
  }, [props.traits]);

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
      />
      <Frame className="!w-full h-auto pb-4">
        <TraitSection metadata={_traitsObject} />
        {/* TODO: GUM functionality temporarily disabled for backpacks - keep for future re-implementation
        <GumSection
          pool={"Backpacks"}
          tokenId={Number(props.tokenID)}
          slots={Number(_traitsObject?.slots)}
          claimedRewards={Number(props?.claimedRewards)?.toFixed(2)}
          rewards={Number(props.rewards)?.toFixed(2)}
        />
        */}
      </Frame>
    </div>
  );
};

export default React.memo(BackpackItem);

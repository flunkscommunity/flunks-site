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
    // Defensive: handle missing or malformed traits data
    if (!props.traits?.traits || !Array.isArray(props.traits.traits)) {
      console.warn('BackpackItem: Missing traits data for tokenID:', props.tokenID);
      return {};
    }
    return props.traits.traits.reduce((acc, trait) => {
      acc[trait.name] = trait.value;
      return acc;
    }, {} as Record<string, string>);
  }, [props.traits, props.tokenID]);

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

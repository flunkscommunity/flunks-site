import { MarketplaceIndividualNftDto } from "generated/models";
import { Button, Frame, Separator } from "react95";
import NavMenu from "./ItemNavMenu";
import ImageDisplay from "./ItemImageDisplay";
import TraitSection from "./ItemTraitSection";
import DesktopBackgroundSection from "./ItemDesktopBackgroundSection";
import GumSection from "./ItemGumSection";
import { useEffect, useState } from "react";
import { checkBackpackClaimed } from "web3/script-can-claim-bp";
import { checkCanGraduate } from "web3/script-check-can-graduate";

interface FlunkItemProps extends MarketplaceIndividualNftDto {
  onBack: () => void;
}

const FlunkItem: React.FC<FlunkItemProps> = (props) => {
  const [canClaimBackpack, setCanClaimBackpack] = useState(false);
  const [canGraduate, setCanGraduate] = useState(false);

  useEffect(() => {
    checkBackpackClaimed(Number(props.tokenId)).then(setCanClaimBackpack);

    return () => {
      setCanClaimBackpack(false);
    };
  }, [props.tokenId]);

  useEffect(() => {
    if (props.metadata?.Type === "Graduated") {
      setCanGraduate(false);
    } else {
      checkCanGraduate(Number(props.tokenId)).then(setCanGraduate);
    }

    return () => {
      setCanGraduate(false);
    };
  }, [props.tokenId]);

  return (
    <div className="w-full h-full relative">
      <NavMenu
        collectionName={"Flunks"}
        tokenId={props.tokenId}
        onBack={props.onBack}
      />
      <ImageDisplay
        src={props.metadata.uri}
        collectionItemName={"Flunk"}
        tokenId={props.tokenId}
        pixelSrc={props.metadata?.pixelUri}
      />
      <Frame className="!w-full h-auto pb-4">
        {(canClaimBackpack ||
          canGraduate) && (
            <>
              <div className="px-3 py-2 !flex !items-center !justify-between">
                <div className="flex gap-2">
                  {canClaimBackpack && <Button>Claim Backpack</Button>}
                  {canGraduate && <Button>Graduation</Button>}
                </div>
              </div>
              <Separator />
            </>
          )}
        <TraitSection metadata={props.metadata} />
        <GumSection pool={"Flunks"} tokenId={props.tokenId} />
        {props.metadata?.Backdrop?.toUpperCase() && (
          <DesktopBackgroundSection
            src={`/images/backdrops/${props.metadata?.Backdrop?.toUpperCase()}.png`}
            itemSrc={props.metadata.uri}
            pixelSrc={props.metadata?.pixelUri}
          />
        )}
      </Frame>
    </div>
  );
};

export default FlunkItem;

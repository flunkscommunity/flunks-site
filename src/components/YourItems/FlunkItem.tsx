import { MarketplaceIndividualNftDto } from "generated/models";
import { Button, Frame, Separator } from "react95";
import NavMenu from "./ItemNavMenu";
import ImageDisplay from "./ItemImageDisplay";
import TraitSection from "./ItemTraitSection";
import DesktopBackgroundSection from "./ItemDesktopBackgroundSection";
import GumSection from "./ItemGumSection";
import { useEffect, useMemo, useState } from "react";
import { checkCanGraduate } from "web3/script-check-can-graduate";
import { useWindowsContext } from "contexts/WindowsContext";
import Graduation from "windows/Graduation";
import ClaimForm from "windows/ClaimForm";
import { NftItem } from "./ItemsGrid";

interface FlunkItemProps extends NftItem {
  onBack: () => void;
}

const FlunkItem: React.FC<FlunkItemProps> = (props) => {
  const [canClaimBackpack] = useState(true);
  const [canGraduate, setCanGraduate] = useState(false);
  const { openWindow } = useWindowsContext();

  useEffect(() => {
    if (props.traits.Type === "Graduated") {
      setCanGraduate(false);
    } else {
      checkCanGraduate(Number(props.tokenID)).then(setCanGraduate);
    }

    return () => {
      setCanGraduate(false);
    };
  }, [props.tokenID]);

  return (
    <div className="w-full h-full relative">
      <NavMenu
        collectionName={"Flunks"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
        onBack={props.onBack}
      />
      <ImageDisplay
        src={props.MetadataViewsDisplay.thumbnail.url}
        collectionItemName={"Flunk"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
        pixelSrc={props.traits?.pixelUri}
      />
      <Frame className="!w-full h-auto pb-4">
        {(canClaimBackpack || canGraduate) && (
          <>
            <div className="px-3 py-2 !flex !items-center !justify-between max-w-[1440px] mx-auto">
              <div className="flex gap-2">
                {canClaimBackpack && (
                  <Button
                    onClick={() => {
                      openWindow({
                        key: `claim-form-${props.serialNumber}`,
                        window: <ClaimForm flunk={props} shouldFetch={false} />,
                      });
                    }}
                  >
                    Backpack Claim Form
                  </Button>
                )}
                {canGraduate && (
                  <Button
                    onClick={() => {
                      openWindow({
                        key: `graduation-${props.serialNumber}`,
                        window: <Graduation flunk={props} />,
                      });
                    }}
                  >
                    Graduation
                  </Button>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}
        <TraitSection metadata={props.traits} />
        <GumSection
          pool={"Flunks"}
          tokenId={props.tokenID}
          claimedRewards={Number(props?.claimedRewards)?.toFixed(2)}
          rewards={Number(props.rewards)?.toFixed(2)}
        />
        {props.traits?.Backdrop?.toUpperCase() && (
          <DesktopBackgroundSection
            src={`/images/backdrops/${props.traits?.Backdrop?.split(" ")
              ?.join("-")
              ?.toUpperCase()}.png`}
            itemSrc={props.MetadataViewsDisplay.thumbnail.url}
            pixelSrc={props.traits?.pixelUri}
          />
        )}
      </Frame>
    </div>
  );
};

export default FlunkItem;

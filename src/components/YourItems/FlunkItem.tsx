import { MarketplaceIndividualNftDto } from "generated/models";
import { Button, Frame, Separator } from "react95";
import NavMenu from "./ItemNavMenu";
import ImageDisplay from "./ItemImageDisplay";
import TraitSection from "./ItemTraitSection";
import DesktopBackgroundSection from "./ItemDesktopBackgroundSection";
import GumSection from "./ItemGumSection";
import { useEffect, useMemo, useState } from "react";
import { useWindowsContext } from "contexts/WindowsContext";
import Graduation from "windows/Graduation";
import ClaimForm from "windows/ClaimForm";
import { NftItem } from "./ItemsGrid";

interface FlunkItemProps extends NftItem {
  onBack: () => void;
}

const FlunkItem: React.FC<FlunkItemProps> = (props) => {
  const [canClaimBackpack] = useState(true);
  const { openWindow } = useWindowsContext();
  const [activeSrc, setActiveSrc] = useState(
    props.MetadataViewsDisplay.thumbnail.url
  );

  useEffect(() => {
    // Preload pxelated image
    if (props.pixelUrl) {
      const img = new Image();
      img.src = props.pixelUrl;
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <NavMenu
        collectionName={"Flunks"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
        onBack={props.onBack}
        extraButtons={
          <>
            <Button
              className="ml-auto w-full"
              active={activeSrc === props.pixelUrl}
              disabled={!props.pixelUrl || activeSrc === props.pixelUrl}
              onClick={() => setActiveSrc(props.pixelUrl)}
            >
              <span className="text-xl leading-[1]">PX</span>
            </Button>
            <Button
              className="w-full"
              active={activeSrc === props.MetadataViewsDisplay.thumbnail.url}
              disabled={activeSrc === props.MetadataViewsDisplay.thumbnail.url}
              onClick={() =>
                setActiveSrc(props.MetadataViewsDisplay.thumbnail.url)
              }
            >
              <span className="text-xl leading-[1]">2D</span>
            </Button>

            <Button
              className="w-full"
              onClick={() => {
                openWindow({
                  key: `graduation-${props.serialNumber}`,
                  window: <Graduation flunk={props} />,
                });
              }}
            >
              <img src="/images/icons/graduation.png" className="h-6 w-auto" />
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                openWindow({
                  key: `claim-form-${props.serialNumber}`,
                  window: <ClaimForm flunk={props} shouldFetch={false} />,
                });
              }}
            >
              <img src="/images/icons/backpack.png" className="h-6 w-auto" />
            </Button>
          </>
        }
      />
      <ImageDisplay
        src={activeSrc}
        collectionItemName={"Flunk"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
      />
      <Frame className="!w-full h-auto pb-4">
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
            pixelSrc={props.pixelUrl}
          />
        )}
      </Frame>
    </div>
  );
};

export default FlunkItem;

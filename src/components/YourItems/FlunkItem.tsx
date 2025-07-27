import { MarketplaceIndividualNftDto } from "generated/models";
import { Button, Frame, Separator } from "react95";
import NavMenu from "./ItemNavMenu";
import ImageDisplay from "./ItemImageDisplay";
import TraitSection from "./ItemTraitSection";
import DesktopBackgroundSection from "./ItemDesktopBackgroundSection";
// TODO: GUM functionality temporarily disabled - keep import for future re-implementation
// import GumSection from "./ItemGumSection";
import { useEffect, useMemo, useState } from "react";
import { useWindowsContext } from "contexts/WindowsContext";
import Graduation from "windows/Graduation";
import ClaimForm from "windows/ClaimForm";
import { NftItem } from "./ItemsGrid";
import { ObjectDetails } from "contexts/StakingContext";
import styled from "styled-components";

// 8-bit retro styling - dynamic based on mode
const RetroContainer = styled.div<{ isPixelMode: boolean }>`
  background: ${props => props.isPixelMode 
    ? 'linear-gradient(135deg, #001100 0%, #002200 50%, #003300 100%)' 
    : 'linear-gradient(135deg, #110033 0%, #220066 50%, #330099 100%)'};
  border: 2px solid ${props => props.isPixelMode ? '#00ff00' : '#6600ff'};
  box-shadow: 
    inset 0 0 0 1px ${props => props.isPixelMode ? '#008800' : '#4400aa'},
    0 0 10px ${props => props.isPixelMode ? '#00ff0033' : '#6600ff33'},
    0 0 20px ${props => props.isPixelMode ? '#00ff0011' : '#6600ff11'};
  position: relative;
  transition: all 0.5s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isPixelMode 
      ? `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 3px,
          rgba(0, 255, 0, 0.05) 3px,
          rgba(0, 255, 0, 0.05) 6px
        )`
      : `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(102, 0, 255, 0.03) 2px,
          rgba(102, 0, 255, 0.03) 4px
        )`};
    pointer-events: none;
    z-index: 1;
    transition: all 0.5s ease;
  }
`;

const PixelButton = styled(Button)<{ isActive: boolean; isPixelButton: boolean }>`
  background: ${props => {
    if (props.isActive && props.isPixelButton) return '#004400 !important'; // Active pixel mode
    if (props.isActive && !props.isPixelButton) return '#400080 !important'; // Active 2D mode
    if (props.isPixelButton) return '#002200 !important'; // Inactive pixel button
    return '#200040 !important'; // Inactive 2D button
  }};
  border: 2px solid ${props => {
    if (props.isActive && props.isPixelButton) return '#00ff88 !important';
    if (props.isActive && !props.isPixelButton) return '#8800ff !important';
    if (props.isPixelButton) return '#00aa44 !important';
    return '#6600aa !important';
  }};
  color: ${props => {
    if (props.isActive && props.isPixelButton) return '#00ff88 !important';
    if (props.isActive && !props.isPixelButton) return '#8800ff !important';
    if (props.isPixelButton) return '#00aa44 !important';
    return '#6600aa !important';
  }};
  font-family: 'Courier New', monospace !important;
  font-weight: bold !important;
  text-shadow: 0 0 5px ${props => {
    if (props.isActive && props.isPixelButton) return '#00ff88 !important';
    if (props.isActive && !props.isPixelButton) return '#8800ff !important';
    return 'transparent !important';
  }};
  transition: all 0.3s ease !important;
  
  &:hover {
    background: ${props => {
      if (props.isPixelButton) return '#006600 !important';
      return '#600099 !important';
    }};
    box-shadow: 0 0 10px ${props => {
      if (props.isPixelButton) return '#00ff88 !important';
      return '#8800ff !important';
    }};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const RetroFrame = styled(Frame)<{ isPixelMode: boolean }>`
  background: ${props => props.isPixelMode 
    ? 'linear-gradient(135deg, #002200 0%, #004400 100%)' 
    : 'linear-gradient(135deg, #220044 0%, #440088 100%)'} !important;
  border: 2px solid ${props => props.isPixelMode ? '#00ff88' : '#8800ff'} !important;
  box-shadow: 
    inset 0 0 0 1px ${props => props.isPixelMode ? '#006644' : '#440066'},
    0 0 5px ${props => props.isPixelMode ? '#00ff8833' : '#8800ff33'} !important;
  transition: all 0.5s ease !important;
`;

const PixelText = styled.span<{ isPixelMode?: boolean; isPixelButton?: boolean }>`
  font-family: 'Courier New', monospace;
  color: ${props => {
    if (props.isPixelButton) return '#00ff88';
    return '#8800ff';
  }};
  text-shadow: 0 0 3px ${props => {
    if (props.isPixelButton) return '#00ff88';
    return '#8800ff';
  }};
  font-weight: bold;
  transition: all 0.3s ease;
`;

interface FlunkItemProps extends ObjectDetails {
  onBack: () => void;
  pixelUrl: string;
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

  const _traitsObject = useMemo(() => {
    return props.traits.traits.reduce((acc, trait) => {
      acc[trait.name] = trait.value;
      return acc;
    }, {});
  }, [props.traits]);

  // Determine if we're in pixel mode
  const isPixelMode = activeSrc === props.pixelUrl;

  return (
    <RetroContainer className="w-full h-full relative" isPixelMode={isPixelMode}>
      <NavMenu
        collectionName={"Flunks"}
        tokenId={props.tokenID}
        templateId={Number(props.serialNumber)}
        onBack={props.onBack}
        extraButtons={
          <>
            <PixelButton
              className="ml-auto w-full"
              active={activeSrc === props.pixelUrl}
              disabled={!props.pixelUrl || activeSrc === props.pixelUrl}
              onClick={() => setActiveSrc(props.pixelUrl)}
              isActive={activeSrc === props.pixelUrl}
              isPixelButton={true}
            >
              <PixelText className="text-xl leading-[1]" isPixelButton={true}>PX</PixelText>
            </PixelButton>
            <PixelButton
              className="w-full"
              active={activeSrc === props.MetadataViewsDisplay.thumbnail.url}
              disabled={activeSrc === props.MetadataViewsDisplay.thumbnail.url}
              onClick={() =>
                setActiveSrc(props.MetadataViewsDisplay.thumbnail.url)
              }
              isActive={activeSrc === props.MetadataViewsDisplay.thumbnail.url}
              isPixelButton={false}
            >
              <PixelText className="text-xl leading-[1]" isPixelButton={false}>2D</PixelText>
            </PixelButton>

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
      <RetroFrame className="!w-full h-auto pb-4" isPixelMode={isPixelMode}>
        <TraitSection metadata={_traitsObject} />
        {/* TODO: GUM functionality temporarily disabled - keep for future re-implementation
        <GumSection
          pool={"Flunks"}
          tokenId={props.tokenID}
          claimedRewards={Number(props?.claimedRewards)?.toFixed(2)}
          rewards={Number(props.rewards)?.toFixed(2)}
        />
        */}
        {_traitsObject?.Backdrop?.toUpperCase() && (
          <DesktopBackgroundSection
            src={`/images/backdrops/${_traitsObject?.Backdrop?.split(" ")
              ?.join("-")
              ?.toUpperCase()}.png`}
            itemSrc={props.MetadataViewsDisplay.thumbnail.url}
            pixelSrc={props.pixelUrl}
          />
        )}
      </RetroFrame>
    </RetroContainer>
  );
};

export default FlunkItem;

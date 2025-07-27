import { useMemo } from "react";
import { Frame } from "react95";
import styled from "styled-components";

// Retro neon styled frames for traits
const RetroTraitFrame = styled(Frame)`
  background: linear-gradient(135deg, #000020 0%, #000040 50%, #000060 100%) !important;
  border: 2px solid #00ffff !important;
  box-shadow: 
    inset 0 0 0 1px #0088aa,
    0 0 8px #00ffff22,
    0 0 15px #00ffff11 !important;
  position: relative;
  
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
        rgba(0, 255, 255, 0.03) 2px,
        rgba(0, 255, 255, 0.03) 4px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

const RetroIconFrame = styled(Frame)`
  background: linear-gradient(135deg, #001100 0%, #002200 100%) !important;
  border: 2px solid #00ff88 !important;
  box-shadow: 
    inset 0 0 0 1px #006644,
    0 0 5px #00ff8833 !important;
`;

const RetroText = styled.span`
  font-family: 'Courier New', monospace;
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 15px #00ffff;
  font-weight: bold;
  position: relative;
  z-index: 2;
`;

const RetroSectionTitle = styled.span`
  font-family: 'Courier New', monospace;
  color: #ff00ff;
  text-shadow: 
    0 0 5px #ff00ff,
    0 0 10px #ff00ff,
    0 0 15px #ff00ff;
  font-weight: bold;
  animation: neonPulse 2s ease-in-out infinite alternate;
  
  @keyframes neonPulse {
    0% { 
      text-shadow: 
        0 0 5px #ff00ff,
        0 0 10px #ff00ff,
        0 0 15px #ff00ff;
    }
    100% { 
      text-shadow: 
        0 0 8px #ff00ff,
        0 0 15px #ff00ff,
        0 0 25px #ff00ff;
    }
  }
`;

const TraitItem = ({ traitName, traitValue }) => {
  return (
    <div className="flex flex-row w-full">
      <RetroIconFrame
        variant="field"
        className="!flex items-center justify-center w-auto p-2"
      >
        <img
          src={
            traitName.toLocaleLowerCase() === "slots"
              ? `/images/icons/slots.png`
              : `/images/icons/Icon-${traitName}.png`
          }
          className="flex-shrink-0"
          style={{ filter: 'drop-shadow(0 0 3px #00ff88)' }}
        />
      </RetroIconFrame>
      <RetroTraitFrame
        variant="field"
        className="w-auto min-w-[40%] px-2 py-1 !flex gap-2 items-center"
      >
        <RetroText className="text-base lg:text-xl capitalize font-bold">{traitName}</RetroText>
      </RetroTraitFrame>
      <RetroTraitFrame variant="field" className="w-full truncate text-wrap !flex items-center px-2 py-1">
        <RetroText className="text-base lg:text-xl capitalize">{traitValue}</RetroText>
      </RetroTraitFrame>
    </div>
  );
};

const TraitSection = ({ metadata }) => {
  const ignoredTraits = useMemo(
    () => ["uri", "pixelUri", "Type", "path", "cid", "mimetype"],
    []
  );

  return (
    <div className="mt-6 flex flex-col px-3 gap-2 max-w-[1440px] mx-auto">
      <RetroSectionTitle className="text-lg font-bold">TRAITS</RetroSectionTitle>
      <div className="flex flex-col w-full">
        {Object.entries(metadata).map(([traitName, traitValue]) => {
          if (ignoredTraits.includes(traitName)) return null;

          return (
            <TraitItem
              key={traitName}
              traitName={traitName}
              traitValue={traitValue}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TraitSection;

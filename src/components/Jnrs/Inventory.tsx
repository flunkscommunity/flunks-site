import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { useJnrCanvas } from "contexts/JnrCanvasContext";
import { JnrTrait, UserTraits } from "mocks/jnr-traits";
import { useMemo, useState } from "react";
import {
  Button,
  Frame,
  FrameProps,
  Handle,
  MenuList,
  MenuListItem,
  Select,
  SelectNative,
} from "react95";
import styled from "styled-components";

const EmptyInventory = () => {
  return (
    <Frame
      className="p-4"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl">Inventory</h1>
        <p>Nothing here yet!</p>
      </div>
    </Frame>
  );
};

// group: "back" | "bottoms" | "head" | "lh" | "rh" | "shoes" | "torso";

const GROUPS = [
  { name: "Head", group: "head" },
  { name: "Torso", group: "torso" },
  { name: "Bottoms", group: "bottoms" },
  { name: "Shoes", group: "shoes" },
  { name: "Left Hand", group: "lh" },
  { name: "Right Hand", group: "rh" },
  { name: "Back", group: "back" },
];

const Classes = [
  { name: "Art", class: "art" },
  { name: "Biology", class: "biology" },
  { name: "Chemistry", class: "chemistry" },
  { name: "History", class: "history" },
  { name: "Mathematics", class: "mathematics" },
  { name: "Music", class: "music" },
  { name: "Physics", class: "physics" },
  { name: "Sport", class: "sport" },
];

export const TraitImage = ({
  src,
  traitName,
  className,
}: {
  src: string;
  traitName: string;
  className?: string;
}) => {
  const imageRenderOrder = [
    traitName === "back" ? src : "",
    "/images/jnr-traits/base-bottoms.png",
    traitName === "shoes" ? src : "",
    traitName === "bottoms" ? src : "",
    "/images/jnr-traits/base-torso.png",
    traitName === "torso" ? src : "",
    "/images/jnr-traits/base-head.png",
    "/images/jnr-traits/base-eyes.png",
    traitName === "head" ? src : "",
    traitName === "lh" ? src : "",
    traitName === "rh" ? src : "",
  ];

  return (
    <div
      className={`w-full min-h-[80px] lg:min-h-[128px] h-full relative ${
        className || ""
      }`}
    >
      {imageRenderOrder.map((src, index) => {
        if (src === "") return null;

        return (
          <img
            key={index}
            src={src}
            className="!absolute w-full h-full object-contain select-none pointer-events-none"
            style={{
              zIndex: index,
              opacity: [1, 4, 6, 7].includes(index) ? 0.2 : 1,
              filter: [1, 4, 6, 7].includes(index) ? "grayscale(100%)" : "none",
            }}
          />
        );
      })}
    </div>
  );
};

const TraitImageFrame = styled(Frame)`
  background-color: ${({ theme, id }) =>
    id === "selected" ? "#00000099" : "#000000CC"};
`;

export const OwnedTrait: React.FC<JnrTrait> = (trait) => {
  const { selectedTraits, equipTrait } = useJnrCanvas();
  const isActive = selectedTraits[trait.group]?.glbUrl === trait.glbUrl;

  const handleClick = () => {
    equipTrait(trait, trait.group);
  };

  return (
    <Button
      active={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={handleClick}
      disabled={isActive}
      className="!flex flex-col w-full !py-2 !h-full"
    >
      <div className="flex items-center w-full">
        <Frame variant="status" className="w-full capitalize px-2 !flex">
          <span className="text-lg text-center w-full">
            {isActive ? "Equipped" : trait.groupLabel}
          </span>
        </Frame>
      </div>
      <TraitImageFrame
        id={isActive ? "selected" : "unselected"}
        variant="status"
        className="!flex flex-col gap-2 w-full relative"
      >
        <TraitImage src={trait.thumbnail} traitName={trait.group} />
      </TraitImageFrame>
      <div className="flex items-center w-full">
        <Frame variant="field" className="w-full capitalize px-2 !flex">
          <span className="text-lg text-center w-full">{trait.set}</span>
        </Frame>
      </div>
    </Button>
  );
};

export const OwnedTraitAlt: React.FC<JnrTrait> = (trait) => {
  const { selectedTraits, equipTrait } = useJnrCanvas();
  const isActive = selectedTraits[trait.group]?.glbUrl === trait.glbUrl;

  const handleClick = () => {
    equipTrait(trait, trait.group);
  };

  return (
    <Button
      active={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={handleClick}
      disabled={isActive}
      className="!flex flex-col w-full !py-2 !h-full"
    >
      <TraitImageFrame
        id={isActive ? "selected" : "unselected"}
        variant="status"
        className="!flex flex-col gap-2 w-full relative"
      >
        <TraitImage src={trait.thumbnail} traitName={trait.group} />
      </TraitImageFrame>
    </Button>
  );
};

const Inventory = () => {
  const { ownedTraits, randomizeSelectedTraits } = useJnrCanvas();

  const allOwnedTraits = useMemo(
    () => Object.values(ownedTraits).flat(),
    [ownedTraits]
  );

  return (
    <CustomStyledScrollView className="!p-0 !w-full max-w-full !m-0 [&>div]:!p-0 h-full">
      <CustomScrollArea>
        <Frame className="!flex flex-row items-center justify-between w-full py-2 px-2 !sticky top-0 z-50 gap-1">
          <span className="text-lg font-bold">Sample Inventory</span>
          <Button onClick={randomizeSelectedTraits}>Randomize</Button>
        </Frame>
        <div className="!grid w-full h-full grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5 px-2 py-2">
          {allOwnedTraits.map((trait) => {
            return <OwnedTrait key={trait.thumbnail} {...trait} />;
          })}
        </div>
      </CustomScrollArea>
    </CustomStyledScrollView>
  );
};

export default Inventory;

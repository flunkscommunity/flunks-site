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

const TraitImage = ({ src, traitName }: { src: string; traitName: string }) => {
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
    <div className="w-full min-h-[80px] lg:min-h-[128px] h-full relative">
      {imageRenderOrder.map((src, index) => {
        if (src === "") return null;

        return (
          <img
            key={index}
            src={src}
            className="!absolute w-full h-full object-contain"
            style={{ zIndex: index }}
          />
        );
      })}
    </div>
  );
};

const OwnedTrait: React.FC<JnrTrait> = (trait) => {
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
      <Frame variant="status" className="!flex flex-col gap-2 w-full relative">
        <TraitImage src={trait.thumbnail} traitName={trait.group} />
      </Frame>
      <div className="flex items-center w-full">
        <Frame variant="field" className="w-full capitalize px-2 !flex">
          <span className="text-lg text-center w-full">{trait.set}</span>
        </Frame>
      </div>
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
    <CustomStyledScrollView className="h-full w-full">
      <CustomScrollArea className="!p-0 relative bg-white">
        <Frame className="!flex flex-row items-center justify-between w-full py-2 px-2 !sticky top-0 z-50 gap-1">
          <span className="text-lg font-bold">Sample Inventory</span>
          <Button onClick={randomizeSelectedTraits}>Randomize</Button>
        </Frame>
        <div className="!grid w-full h-full grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
          {allOwnedTraits.map((trait) => {
            return <OwnedTrait key={trait.thumbnail} {...trait} />;
          })}
        </div>
      </CustomScrollArea>
    </CustomStyledScrollView>
  );
};

export default Inventory;

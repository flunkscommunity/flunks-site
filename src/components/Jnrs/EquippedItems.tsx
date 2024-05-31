import { useJnrCanvas } from "contexts/JnrCanvasContext";
import Full2DJnr, { Class } from "./Full2DJnr";
import { Frame } from "react95";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { TraitImage } from "./Inventory";
import { useMemo } from "react";
import { CLASSES } from "windows/ProjectJnr";
import { CLASS_TO_BG_COLOR } from "./JnrCollectibleCard";

const traitOrder = ["lh", "rh", "head", "back", "torso", "bottoms", "shoes"];

const EquippedItem = ({ trait }) => {
  return (
    <Frame className="w-full aspect-square relative">
      <TraitImage
        src={trait.thumbnail}
        traitName={trait.group}
        className="!w-full !h-full !min-h-full !min-w-full bg-black/80"
      />
      <div className="absolute bottom-0 w-full !flex items-center justify-between px-2 text-white">
        <div className="flex flex-row gap-1 items-center">
          <img
            src="/images/icons/attack-64x64.png"
            alt="attack"
            className="w-4 h-4"
          />
          <span className="text-base text-center">{trait.metadata.attack}</span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <span className="text-base text-center">
            {trait.metadata.defense}
          </span>
          <img
            src="/images/icons/defense-64x64.png"
            alt="attack"
            className="w-4 h-4"
          />
        </div>
      </div>
    </Frame>
  );
};

const EquippedItems = () => {
  const { selectedTraits, selectedClass } = useJnrCanvas();

  return (
    <div className="relative w-full h-full flex flex-col">
      <Full2DJnr
        selectedTraits={selectedTraits}
        className="!bg-[#E9E9E9] !bg-none"
        jnrClass={selectedClass as Class}
        backgroundColor={CLASS_TO_BG_COLOR[selectedClass]}
      />
      <CustomStyledScrollView className="w-full flex h-[50%] flex-shrink-0">
        <CustomScrollArea className="flex flex-row overflow-x-auto flex-nowrap !p-0">
          {traitOrder.map((trait) => (
            <EquippedItem key={trait} trait={selectedTraits[trait]} />
          ))}
        </CustomScrollArea>
      </CustomStyledScrollView>
      {/* <div className="col-span-2 col-start-6 row-start-1 bg-red-700"></div>
        <div className="col-span-2 row-start-2 bg-red-600"></div>
        <div className="col-span-2 row-start-3 bg-red-500"></div>
        <div className="col-span-2 row-start-4 bg-red-400"></div>
        <div className="col-span-2 col-start-11 row-start-2 bg-red-600"></div>
        <div className="col-span-2 col-start-11 row-start-3 bg-red-500"></div>
        <div className="col-span-2 col-start-11 row-start-4 bg-red-400"></div> */}
    </div>
  );
};

export default EquippedItems;

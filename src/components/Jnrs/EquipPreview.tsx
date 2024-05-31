import { useJnrCanvas } from "contexts/JnrCanvasContext";
import { Button, Frame, MenuList, ScrollView } from "react95";
import Full2DJnr, { Class } from "./Full2DJnr";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { useMemo } from "react";
import { OwnedTrait, OwnedTraitAlt } from "./Inventory";
import { CLASSES } from "windows/ProjectJnr";
import { CLASS_TO_BG_COLOR } from "./JnrCollectibleCard";

const EquipPreview = () => {
  const { selectedTraits, ownedTraits, randomizeSelectedTraits, selectedClass } =
    useJnrCanvas();
  const allTraits = useMemo(
    () => Object.values(ownedTraits).flat(),
    [ownedTraits]
  );

  return (
    <Frame className="!flex flex-col lg:flex-row w-full mx-auto h-[510px] lg:h-[720px] overflow-hidden p-4">
      <div className="h-1/2 w-full lg:h-full lg:w-2/4 !aspect-square flex-shrink-0">
        <Full2DJnr
          selectedTraits={selectedTraits}
          jnrClass={selectedClass as Class}
          withBackground
          backgroundColor={CLASS_TO_BG_COLOR[selectedClass]}
        />
      </div>
      <div className="w-full h-full">
        <Frame
          variant="well"
          className="!flex items-center justify-end !py-2 px-1"
        >
          <Button onClick={randomizeSelectedTraits}>
            Randomize
          </Button>
        </Frame>
        <CustomStyledScrollView className="h-[calc(50%-56px)] w-full lg:h-[calc(100%-56px)] lg:w-full flex-grow-0">
          <CustomScrollArea className="h-full">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
              {allTraits.map((trait) => (
                <OwnedTraitAlt key={trait.thumbnail} {...trait} />
              ))}
            </div>
          </CustomScrollArea>
        </CustomStyledScrollView>
      </div>
    </Frame>
  );
};

export default EquipPreview;

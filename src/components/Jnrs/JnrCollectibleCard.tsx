import { useJnrCanvas } from "contexts/JnrCanvasContext";
import Full2DJnr from "./Full2DJnr";
import { Button, Frame, Window, WindowHeader } from "react95";
import { useMemo } from "react";

const JnrCollectibleCard = () => {
  const { selectedTraits } = useJnrCanvas();
  const totalAttack = useMemo(() => {
    return Object.values(selectedTraits).reduce((acc, trait) => {
      return acc + trait.metadata.attack;
    }, 0);
  }, [selectedTraits]);
  const totalDefense = useMemo(() => {
    return Object.values(selectedTraits).reduce((acc, trait) => {
      return acc + trait.metadata.defense;
    }, 0);
  }, [selectedTraits]);

  return (
    <Window className="w-[528px] h-auto">
      <WindowHeader className="!w-full !flex items-center justify-between !py-6 !px-2">
        <span className="text-3xl font-bold">Pocket Junior #????</span>
      </WindowHeader>
      <div className="w-[516px] px-2 py-2">
        <Full2DJnr selectedTraits={selectedTraits} />
        <Frame variant="field" className="!flex flex-col w-full px-4 py-4">
          <span className="text-2xl">
            Introducing Pocket Juniors – the latest craze at Flunks High!
            <br/><br/>Collect and customize mini-figures from 8 unique classes like Art,
            Biology, and Sports, each with totally unique sets. Complete full
            sets, equip them with various items, and watch them battle for epic
            prizes. Coming soon to Flunks.io.
          </span>
        </Frame>
        <div className="w-full !flex gap-2">
          <Frame variant="well" className="w-full !flex items-center">
            <Frame
              variant="well"
              className="h-full px-2 py-2 flex-shrink-0 !flex items-center justify-center"
            >
              <img
                src="/images/icons/attack-64x64.png"
                alt="attack"
                className="w-8 h-8"
              />
            </Frame>
            <Frame
              variant="well"
              className="h-full w-full px-2 py-2 !flex items-center justify-center"
            >
              <span className="text-3xl leading-[1] drop-shadow-[-0.5px_2px_0_rgba(255,255,255,0.8)]">
                {totalAttack}
              </span>
            </Frame>
          </Frame>
          <Frame variant="well" className="w-full !flex items-center">
            <Frame
              variant="well"
              className="h-full w-full px-2 py-2 !flex items-center justify-center"
            >
              <span className="text-3xl leading-[1] drop-shadow-[-0.5px_2px_0_rgba(255,255,255,0.8)]">
                {totalDefense}
              </span>
            </Frame>
            <Frame
              variant="well"
              className="h-full px-2 py-2 flex-shrink-0 !flex items-center justify-center"
            >
              <img
                src="/images/icons/defense-64x64.png"
                alt="attack"
                className="w-8 h-8"
              />
            </Frame>
          </Frame>
        </div>
      </div>
    </Window>
  );
};

export default JnrCollectibleCard;

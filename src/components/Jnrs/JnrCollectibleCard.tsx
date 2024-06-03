import { useJnrCanvas } from "contexts/JnrCanvasContext";
import Full2DJnr from "./Full2DJnr";
import { Button, Frame, Window, WindowHeader } from "react95";
import { forwardRef, useMemo, useRef } from "react";
import { useTheme } from "styled-components";
import { CLASSES } from "windows/ProjectJnr";
import { toPng } from "html-to-image";

const JnrCollectibleCard = () => {
  const { selectedTraits, selectedClass, statsCombined } = useJnrCanvas();

  const theme = useTheme();

  return (
    <Window className="w-[528px] h-auto scale-50 lg:scale-100 origin-center">
      <WindowHeader className="!w-full !flex items-center justify-between !py-6 !px-2">
        <span className="text-3xl font-bold">Pocket Junior #????</span>
        <div>
          <img
            src="/images/icons/pocket-juniors-50x50.png"
            alt="heart"
            className="w-auto h-8 mix-blend-soft-light"
          />
        </div>
      </WindowHeader>
      <div className="w-[516px] px-2 py-2">
        <div className="relative ">
          <Full2DJnr
            selectedTraits={selectedTraits}
            className="min-h-[400px]"
            withBackground={true}
            jnrClass={selectedClass}
          />
          <div
            className="absolute top-1 text-xl uppercase  font-bold right-1 z-20 px-5 py-1"
            style={{
              clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
              // @ts-ignore
              backgroundColor: theme.material,
            }}
          >
            {selectedClass}
          </div>
          <div
            className="absolute top-[5px] text-xl uppercase font-bold right-1 px-5 py-1 scale-105 z-10"
            style={{
              clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
              // @ts-ignore
              backgroundColor: theme.borderDark,
            }}
          >
            {selectedClass}
          </div>
        </div>
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
                {statsCombined.attack}
              </span>
            </Frame>
          </Frame>
          <Frame variant="well" className="w-full !flex items-center">
            <Frame
              variant="well"
              className="h-full w-full px-2 py-2 !flex items-center justify-center"
            >
              <span className="text-3xl leading-[1] drop-shadow-[-0.5px_2px_0_rgba(255,255,255,0.8)]">
                {statsCombined.health}
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
        <Frame variant="field" className="!flex flex-col w-full px-4 py-4 my-2">
          <span className="text-2xl">
            Introducing Pocket Juniors – the latest craze at Flunks High!
            <br />
            <br />
            Collect and customize mini-figures from 8 unique classes like Art,
            Biology, and Sports, each with totally unique sets. Complete full
            sets, equip them with various items, and watch them battle for epic
            prizes. Coming soon to Flunks.io.
          </span>
        </Frame>

        <div className="flex flex-row">
          <Frame
            variant="well"
            className="h-full px-2 py-2 flex-shrink tracking-widest !flex items-start justify-start w-full"
          >
            <span className="text-2xl">First Edition Junior 2024</span>
          </Frame>
          <Frame
            variant="well"
            className="px-2 py-2 flex-shrink text-xl tracking-widest !flex items-start justify-start"
          >
            <img
              src="/images/logos/flunks.png"
              alt="heart"
              className="h-7 my-auto"
            />
          </Frame>
        </div>
      </div>
    </Window>
  );
};

export const CLASS_TO_BG_COLOR = {
  HISTORY: "#E59B9B",
  ART: "#E5C094",
  MATH: "#8BDDE5",
  BIOLOGY: "#B5E5AB",
  MUSIC: "#8FB0E5",
  SPORT: "#A99FE5",
  PHYSICS: "#E5B1E5",
  CHEMISTRY: "#E3E5A3",
};

export const JnrCollectibleCardReffed = forwardRef<HTMLDivElement>(
  (props, elementRef) => {
    const { selectedTraits, selectedClass } = useJnrCanvas();
    const statsCombined = useMemo(() => {
      if (!selectedTraits) return {};
      return Object.values(selectedTraits).reduce(
        (acc, trait) => {
          if (!trait) return acc;
          const stats = trait.stats;
          return {
            attack: acc.attack + (stats.attack || 0),
            defense: acc.defense + (stats.defense || 0),
            speed: acc.speed + (stats.speed || 0),
            health: acc.health + (stats.health || 0),
            crit: acc.crit + (stats.crit || 0),
            hit: acc.hit + (stats.hit || 0),
            dodge: acc.dodge + (stats.dodge || 0),
          };
        },
        {
          attack: 10,
          defense: 0,
          speed: 0,
          health: 20,
          crit: 0,
          hit: 0,
          dodge: 0,
        }
      );
    }, [selectedTraits]);

    const theme = useTheme();

    return (
      <div
        ref={elementRef}
        className="min-w-[528px] h-auto origin-center !shadow-none scale-50 lg:scale-100"
      >
        <Window className="!w-full !h-full origin-center !shadow-none">
          <WindowHeader className="!w-full !flex items-center justify-between !py-6 !px-2">
            <span className="text-3xl font-bold">Pocket Junior #????</span>
            <div>
              <img
                src="/images/logos/jnr-logo.png"
                alt="heart"
                className="w-auto h-10"
              />
            </div>
          </WindowHeader>
          <div className="w-[516px] px-2 py-2">
            <div className="relative ">
              <Full2DJnr
                selectedTraits={selectedTraits}
                className="min-h-[400px]"
                jnrClass={selectedClass}
                withBackground={true}
                backgroundColor={CLASS_TO_BG_COLOR[selectedClass] as string}
                extraLayers={
                  <div className="absolute -top-[2px] left-[2px] w-full">
                    <div
                      className="absolute text-xl uppercase font-bold z-20 px-5 py-1"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
                        // @ts-ignore
                        backgroundColor: theme.material,
                      }}
                    >
                      {selectedClass}
                    </div>
                    <div
                      className="absolute text-xl uppercase font-bold top-[2px] px-5 py-1 scale-105 z-10"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
                        // @ts-ignore
                        backgroundColor: theme.borderDark,
                      }}
                    >
                      {selectedClass}
                    </div>
                  </div>
                }
              />
            </div>
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
                    {statsCombined.attack}
                  </span>
                </Frame>
              </Frame>
              <Frame variant="well" className="w-full !flex items-center">
                <Frame
                  variant="well"
                  className="h-full w-full px-2 py-2 !flex items-center justify-center"
                >
                  <span className="text-3xl leading-[1] drop-shadow-[-0.5px_2px_0_rgba(255,255,255,0.8)]">
                    {statsCombined.health}
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
            <Frame
              variant="field"
              className="!flex flex-col w-full px-4 py-4 my-2"
            >
              <span className="text-2xl">
                Introducing Pocket Juniors – the latest craze at Flunks High!
                <br />
                <br />
                Collect and customize mini-figures from 8 unique classes like
                Art, Biology, and Sports, each with totally unique sets.
                Complete full sets, equip them with various items, and watch
                them battle for epic prizes. Coming soon to Flunks.io.
              </span>
            </Frame>

            <div className="flex flex-row">
              <Frame
                variant="well"
                className="h-full px-2 py-2 flex-shrink tracking-widest !flex items-start justify-start w-full"
              >
                <span className="text-2xl font-bold">
                  Promotional Edition Junior 2024
                </span>
              </Frame>
              <Frame
                variant="field"
                className="px-2 flex-shrink relative flex-col tracking-widest !flex items-center justify-center"
              >
                <img
                  src="/images/logos/flunks.png"
                  alt="heart"
                  className="h-6 grayscale"
                />
              </Frame>
            </div>
          </div>
        </Window>
      </div>
    );
  }
);

export default JnrCollectibleCard;

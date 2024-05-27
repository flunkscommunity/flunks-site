import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Frame, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import styled from "styled-components";
import React, { Fragment, Suspense, useRef, useState } from "react";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { JnrCanvasProvider } from "contexts/JnrCanvasContext";
import { Canvas } from "@react-three/fiber";
import { JnrBox } from "components/3D/Jnrbox";
import {
  Bounds,
  Center,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
  Stage,
  useProgress,
} from "@react-three/drei";
import Full2DJnr from "components/Jnrs/Full2DJnr";
import EquipPreview from "components/Jnrs/EquipPreview";
import FightPreview from "components/Jnrs/FightPreview";
import JnrTeaserMain from "components/JnrTeaser/JnrTeaserMain";

const FrameWithBackground = styled(Frame)`
  background-image: linear-gradient(
      ${({ theme }) => theme.borderLightest} 1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => theme.borderLightest} 1px,
      ${({ theme }) => theme.material} 1px
    );
  background-size: 20px 20px;
`;

const BackgroundDiv = styled(Frame)`
  background-color: ${({ theme }) => theme.canvas};
  background-image: linear-gradient(
      ${({ theme }) => {
          // color is rgb, turn it int rgba with 0.25 alpha
          const color = theme.canvasText;

          if (color.startsWith("rgb")) {
            return color.replace(")", ", 0.10)").replace("rgb", "rgba");
          }

          if (color === "black") {
            return "rgba(0, 0, 0, 0.10)";
          }

          return `${theme.canvasText}1A`;
        }}
        1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => {
          // color is rgb, turn it int rgba with 0.25 alpha
          const color = theme.canvasText;

          if (color.startsWith("rgb")) {
            return color.replace(")", ", 0.10)").replace("rgb", "rgba");
          }

          if (color === "black") {
            return "rgba(0, 0, 0, 0.10)";
          }

          return `${theme.canvasText}1A`;
        }}
        1px,
      ${({ theme }) => theme.canvas} 1px
    );
  background-size: 32px 32px;
`;

const CustomScrollAreaAsField = styled(CustomScrollArea)`
  background-color: ${({ theme }) => theme.canvas};
  color: ${({ theme }) => theme.canvasText};
  background-color: ${({ theme }) => theme.canvas};
  background-image: linear-gradient(
      ${({ theme }) => {
          // color is rgb, turn it int rgba with 0.25 alpha
          const color = theme.canvasText;

          if (color.startsWith("rgb")) {
            return color.replace(")", ", 0.10)").replace("rgb", "rgba");
          }

          if (color === "black") {
            return "rgba(0, 0, 0, 0.10)";
          }

          return `${theme.canvasText}1A`;
        }}
        1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => {
          // color is rgb, turn it int rgba with 0.25 alpha
          const color = theme.canvasText;

          if (color.startsWith("rgb")) {
            return color.replace(")", ", 0.10)").replace("rgb", "rgba");
          }

          if (color === "black") {
            return "rgba(0, 0, 0, 0.10)";
          }

          return `${theme.canvasText}1A`;
        }}
        1px,
      ${({ theme }) => theme.canvas} 1px
    );
  background-size: 32px 32px;
`;

const CLASSES = [
  {
    className: "HISTORY",
    description:
      "Masters of the past, wielding ancient wisdom and strategies to outmaneuver their foes.",
    set: "Plague Doctor",
    setImage: "/images/about-us/jnr-8.png",
    spells: [
      {
        type: "Offensive",
        name: "Ancient Strike",
        description:
          "Unleash a powerful attack infused with the strength of ancient warriors.",
      },
      {
        type: "Defensive",
        name: "Timeless Wisdom",
        description:
          "Gain insight from historical figures, boosting your defense and resistance.",
      },
    ],
  },
  {
    className: "ART",
    description:
      "Creators of beauty and chaos, using their artistic talents to inspire allies and confound enemies.",
    set: "Origami",
    setImage: "/images/about-us/jnr-7.png",
    spells: [
      {
        type: "Offensive",
        name: "Artistic Flare",
        description:
          "Enhance your critical hit chance with a burst of artistic energy.",
      },
      {
        type: "Defensive",
        name: "Graffiti Shield",
        description: "Create a barrier of graffiti that absorbs damage.",
      },
    ],
  },
  {
    className: "MATHS",
    description:
      "Strategists and thinkers, leveraging calculations and probability to gain the upper hand in any situation.",
    set: "PC",
    setImage: "/images/about-us/jnr-1.png",
    spells: [
      {
        type: "Offensive",
        name: "Calculated Strike",
        description:
          "Perform a precise attack that deals extra damage based on your hit rating.",
      },
      {
        type: "Defensive",
        name: "Geometric Shield",
        description:
          "Create a geometric shield that absorbs a percentage of incoming damage.",
      },
    ],
  },
  {
    className: "BIOLOGY",
    description:
      "Masters of life and nature, utilizing biological knowledge to heal and harm with equal proficiency.",
    set: "Skeleton",
    setImage: "/images/about-us/jnr-9.png",
    spells: [
      {
        type: "Offensive",
        name: "Venomous Bite",
        description: "Inflict a venomous bite that deals damage over time.",
      },
      {
        type: "Defensive",
        name: "Natural Regeneration",
        description: "Heal over time by harnessing the power of nature.",
      },
    ],
  },
  {
    className: "MUSIC",
    description:
      "Sonic virtuosos who use the power of sound to inspire allies and disorient enemies.",
    set: "Disco",
    setImage: "/images/about-us/jnr-2.png",
    spells: [
      {
        type: "Offensive",
        name: "Harmonic Resonance",
        description: "Play a harmonic tune that boosts allies’ attack.",
      },
      {
        type: "Defensive",
        name: "Healing Melody",
        description: "Play a soothing melody that heals allies over time.",
      },
    ],
  },
  {
    className: "SPORT",
    description:
      "Athletic champions who use their physical prowess to dominate the battlefield.",
    set: "Baseball",
    setImage: "/images/about-us/jnr-5.png",
    spells: [
      {
        type: "Offensive",
        name: "Power Strike",
        description: "Deliver a powerful strike that deals extra damage.",
      },
      {
        type: "Defensive",
        name: "Defensive Stance",
        description: "Adopt a defensive stance that reduces incoming damage.",
      },
    ],
  },
  {
    className: "PHYSICS",
    description:
      "Masters of the physical universe, manipulating the laws of nature to their advantage.",
    set: "Robot",
    setImage: "/images/about-us/jnr-3.png",
    spells: [
      {
        type: "Offensive",
        name: "Gravity Well",
        description:
          "Create a gravity well that pulls opponents in, reducing their speed.",
      },
      {
        type: "Defensive",
        name: "Kinetic Shield",
        description: "Create a kinetic shield that absorbs damage.",
      },
    ],
  },
  {
    className: "CHEMISTRY",
    description:
      "Alchemists and scientists who use chemical reactions to devastate enemies and protect allies.",
    set: "Radioactive",
    setImage: "/images/about-us/jnr-10.png",
    spells: [
      {
        type: "Offensive",
        name: "Acidic Spray",
        description: "Spray a corrosive acid that deals damage over time.",
      },
      {
        type: "Defensive",
        name: "Chemical Shield",
        description: "Create a chemical shield that absorbs damage.",
      },
    ],
  },
];

function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const MemodCanvas = React.memo(({ scroll }) => {
  return (
    <Canvas
      gl={{
        antialias: true,
        precision: "highp",
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
      }}
      shadows
      flat
      className="pointer-events-none "
    >
      <PerspectiveCamera makeDefault attach={"camera"} position={[0, 0, 10]} />
      <ambientLight intensity={1} />
      <Suspense fallback={<Loader />}>
        <Bounds fit clip margin={1.5}>
          <Center>
            <JnrBox scroll={scroll} />
          </Center>
        </Bounds>
        <Environment preset="forest" />
      </Suspense>
    </Canvas>
  );
});

const ProjectJnr: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const scroll = useRef(0);

  return (
    <JnrCanvasProvider>
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="JNR.exe"
        onClose={() => {
          closeWindow(WINDOW_IDS.PROJECT_JNR);
        }}
        windowsId={WINDOW_IDS.PROJECT_JNR}
        initialHeight="100%"
        initialWidth="100%"
        showMaximizeButton={false}
        resizable={false}
        toolbar={
          <Toolbar>
            <Button variant="menu" size="lg">
              File
            </Button>
            <Button variant="menu" size="lg">
              Edit
            </Button>
            <Button variant="menu" size="lg" disabled>
              Save
            </Button>
          </Toolbar>
        }
      >
        <JnrTeaserMain />
        {/* <CustomStyledScrollView
          className="w-full h-full"
          onTouchMove={(e) => {
            console.log(e);
          }}
        >
          <CustomScrollAreaAsField
            onScroll={(e) => {
              // scroll.current =
              //   e.target.scrollTop / (e.target.scrollHeight - window.innerHeight);
              scroll.current =
                e.target.scrollTop /
                (e.target.scrollHeight / 3.8 - window.innerHeight);
            }}
            className="relative w-full !p-0"
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="relative flex flex-col mx-auto h-[300%] z-0 pointer-events-none">
              <div className="sticky top-0 w-full h-[33%] z-0 flex-shrink-0 max-w-[1440px] mx-auto pointer-events-none">
                <MemodCanvas scroll={scroll} />
              </div>
              <div className="absolute top-0 left-0 w-full pointer-events-none flex-shrink-0 flex flex-col pt-10 z-10">
                <span className="text-3xl lg:text-6xl font-bold mx-auto text-center px-2">
                  POCKET JUNIORS (J.N.R)
                </span>
                <span className="text-xl lg:text-4xl font-bold mx-auto text-center animate-pulse">
                  Scroll to see more
                </span>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <span className="font-bold text-3xl lg:text-6xl text-center max-w-[700px] mx-auto mb-[112px] lg:mb-[20%]">
                Introducing Pocket Juniors (J.N.R) – the coolest craze to hit
                the schoolyard! <br />{" "}
                <span className="text-xl lg:text-3xl font-normal">
                  *💥 cue explosion sound 💥*
                </span>
              </span>

              <div className="w-full flex flex-col gap-10 max-w-[1440px] mx-auto mb-[112px] lg:mb-[20%]">
                <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                  Dive into 8 unique classes: History, Art, Maths, Biology,
                  Music, Sport, Physics, and Chemistry! Each class comes with
                  its own captivating themes, specialized traits, and dynamic
                  abilities, bringing a new level of excitement to every battle.
                </span>

                <Frame className="w-full !grid grid-col-[repeat(auto-fill,minmax(160px,1fr))] gap-4 overflow-hidden p-4">
                  {CLASSES.map((item) => (
                    <Frame
                      key={item.className}
                      variant="well"
                      className="w-full !min-h-[300px] h-full !flex flex-col items-center justify-center relative !overflow-hidden contrast-125"
                      style={{
                        backgroundImage: `url(${item.setImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "50% 30%",
                      }}
                    >
                      <div className=" z-10 absolute w-full h-full inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 px-4">
                        <span className="text-white text-3xl font-bold">
                          {item.className}
                        </span>
                        <span className="text-white text-xl font-normal max-w-[325px] text-center">
                          {item.description}
                        </span>
                      </div>
                    </Frame>
                  ))}
                </Frame>
              </div>

              <div className="w-full flex flex-col gap-10 max-w-[1440px] mx-auto mb-[112px] lg:mb-[20%]">
                <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                  Equip your JNR with powerful traits! Discover and unlock a
                  vast array of unique abilities, customizing your Pocket Junior
                  for epic battles and strategic dominance. With each trait
                  enhancing your JNR's stats and skills, you can create the
                  perfect team to outsmart and outfight your opponents.
                </span>

                <EquipPreview />
              </div>

              <div className="w-full flex flex-col gap-10 mx-auto ">
                <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                  Form your team, plan your strategy, and let the battles begin!
                  Challenge other players and see who reigns supreme in the
                  digital school yard. Are you ready to rise to the top? The
                  battle for ultimate glory awaits!
                </span>

                <FightPreview />
              </div>
            </div>
          </CustomScrollAreaAsField>
        </CustomStyledScrollView> */}
      </DraggableResizeableWindow>
    </JnrCanvasProvider>
  );
};

export default ProjectJnr;

/* <div className="flex flex-col xl:flex-row-reverse w-full h-full gap-2">
        <JnrCanvas traits={selectedTraits} />
        <ScrollView className="h-[calc(100%-50%-8px)] xl:h-full w-full max-w-[400px] !p-0">
          <Frame variant="field" className="w-full">
            <Marquee autoFill>
              <span className="text-xl">- PREVIEW ONLY - TOP SECRET</span>
            </Marquee>
          </Frame>
          <div className="w-full flex flex-col">
            <Frame variant="field" className="!flex">
              <span className="w-full py-1 px-2">Sample Items</span>
              <Button
                active={show2d}
                onClick={() => {
                  setShow2d(!show2d);
                }}
              >
                2D
              </Button>
            </Frame>
            <ScrollView className="!max-w-full">
              <div className="!h-auto pt-1 pb-1 px-1 !flex flex-nowrap gap-2 !w-full">
                {Object.keys(TRAITS_BY_CLASS).map((nameOfClass) => (
                  <Button
                    key={nameOfClass}
                    onClick={() => {
                      setSelectedTraits(TRAITS_BY_CLASS[nameOfClass]);
                    }}
                    className="!flex-shrink-0"
                  >
                    {nameOfClass} - {TRAIT_COLLECTION_NAME[nameOfClass]}
                  </Button>
                ))}
              </div>
            </ScrollView>

            {show2d && (
              <Frame>
                <FullTraitsImage {...selectedTraits} />
              </Frame>
            )}

            <ScrollView className="!max-w-full">
              <Frame className="!grid grid-cols-4">
                {Object.entries(TRAITS_BY_CLASS).map(([trait, glbUrl]) => {
                  return Object.entries(glbUrl).map(([traitName, url]) => (
                    <TraitImage
                      key={TRAIT_IMAGES_BY_URL[url].url}
                      src={TRAIT_IMAGES_BY_URL[url].url}
                      traitName={TRAIT_IMAGES_BY_URL[url].trait}
                      onClick={(src) => {
                        setSelectedTraits({
                          ...selectedTraits,
                          [TRAIT_IMAGES_BY_URL[url].trait]: url,
                        });
                      }}
                      active={selectedTraits[traitName] === url}
                    />
                  ));
                })}
              </Frame>
            </ScrollView>
          </div>
        </ScrollView>
      </div> 
      
      
      <Frame className="!w-full !h-full max-w-full max-h-full !grid grid-cols-12 grid-rows-2">
          <Frame
            variant="button"
            className="col-span-12 lg:col-span-6 lg:row-span-1 xl:col-span-5 2xl:col-span-3  p-1"
          >
            <Frame variant="well" className="w-full h-full p-px">
              <JnrCanvas />
            </Frame>
          </Frame>

          <Frame
            variant="button"
            className="row-span-1 col-span-12 lg:col-span-6 lg:row-span-2 xl:col-span-7 2xl:col-span-9"
          >
            <Frame variant="well" className="w-full h-full p-px">
              <Inventory />
            </Frame>
          </Frame>

          <Frame
            variant="button"
            className={`!hidden  lg:col-span-6 xl:col-span-5 2xl:col-span-3 row-span-1 !p-1 ${
              height < 700 ? "!hidden" : "lg:!block"
            }`}
          >
            <Frame variant="well" className="w-full h-full p-2">
              <EquippedItems />
            </Frame>
          </Frame>
        </Frame>
      */

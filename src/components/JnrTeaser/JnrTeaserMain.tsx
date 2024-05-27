import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { Avatar, Frame, ProgressBar } from "react95";
import JnrBoxCanvas from "./JnrBoxCanvas";
import { useEffect, useRef } from "react";
import { useProgress } from "@react-three/drei";
import styled from "styled-components";
import {
  SpringValue,
  animated,
  useSpring,
  useSpringRef,
} from "@react-spring/web";
import IntroJnrs from "./IntroJnrs";

const StyledLoader = styled.div`
  background-color: ${({ theme }) => theme.material};
`;

const AnimatedStyledLoader = animated(StyledLoader);

const JnrTeaserMain = () => {
  const animationScrollContainer = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const { progress, loaded } = useProgress();

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const heightOfScrollContainer =
      animationScrollContainer.current?.clientHeight;
    const _scroll = e.currentTarget.scrollTop;

    if (heightOfScrollContainer) {
      const percentage =
        _scroll / (heightOfScrollContainer - window.innerHeight);
      scroll.current = percentage;
    }
  };
  const fadeOutRef = useSpringRef();
  const fadeOutSpring = useSpring({
    ref: fadeOutRef,
    from: { opacity: 1, pointerEvents: "auto" },
    to: { opacity: 0, pointerEvents: "none" },
  });

  const fadeInRef = useSpringRef();
  const fadeInSpring = useSpring({
    ref: fadeInRef,
    from: { opacity: 0, pointerEvents: "none" },
    to: { opacity: 1, pointerEvents: "auto" },
  });

  useEffect(() => {
    if (loaded) {
      fadeOutRef.start({
        opacity: 0,
        pointerEvents: "none",
        config: { duration: 1000 },
      });

      fadeInRef.start({
        opacity: 1,
        pointerEvents: "auto",
        config: { duration: 2000 },
      });
    }
  }, [loaded]);

  return (
    <div className="flex flex-col h-full relative">
      <CustomStyledScrollView className="w-full h-[calc(100%-52px)]">
        <CustomScrollArea
          onScroll={handleScroll}
          className="relative w-full"
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="w-full h-full">
            <div
              ref={animationScrollContainer}
              className="relative flex flex-col mx-auto h-[300%] z-0 pointer-events-none"
            >
              <animated.div
                style={fadeInSpring as Record<string, SpringValue>}
                className="sticky top-0 w-full h-[34%] overflow-hidden z-0 flex-shrink-0 mx-auto pointer-events-none"
              >
                <Frame
                  variant="window"
                  className="w-full h-[calc(100%-6px)] lg:h-[calc(100%-20px)] p-2 pb-10"
                >
                  <Frame variant="field" className="w-full h-full">
                    <JnrBoxCanvas key={loaded} scroll={scroll} />
                  </Frame>
                  <Avatar size={24} className="ml-auto mr-1">
                    <div className="bg-green-600 rounded-full w-full animate-pulse h-full" />
                  </Avatar>
                </Frame>
              </animated.div>
              <div className="absolute top-0 left-0 w-full pointer-events-none flex-shrink-0 mix-blend-difference text-white flex flex-col pt-10 z-10">
                <span className="text-3xl lg:text-6xl font-bold mx-auto text-center px-2">
                  POCKET JUNIORS (J.N.R)
                </span>
                <span className="text-xl lg:text-4xl font-bold mx-auto text-center animate-pulse">
                  Scroll to see more
                </span>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <div className="w-full flex flex-col gap-10 mx-auto mb-[112px] lg:mb-[20%]">
                <IntroJnrs />
              </div>

              <div className="w-full flex flex-col gap-10 max-w-[1440px] mx-auto mb-[112px] lg:mb-[20%]">
                <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                  Dive into 8 unique classes: History, Art, Maths, Biology,
                  Music, Sport, Physics, and Chemistry! Each class comes with
                  its own captivating themes, specialized traits, and dynamic
                  abilities, bringing a new level of excitement to every battle.
                </span>

                {/* <Frame className="w-full !grid grid-col-[repeat(auto-fill,minmax(160px,1fr))] gap-4 overflow-hidden p-4">
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
              </Frame> */}
              </div>

              <div className="w-full flex flex-col gap-10 max-w-[1440px] mx-auto mb-[112px] lg:mb-[20%]">
                <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                  Equip your JNR with powerful traits! Discover and unlock a
                  vast array of unique abilities, customizing your Pocket Junior
                  for epic battles and strategic dominance. With each trait
                  enhancing your JNR's stats and skills, you can create the
                  perfect team to outsmart and outfight your opponents.
                </span>

                {/* <EquipPreview /> */}
              </div>

              <div className="w-full flex flex-col gap-10 mx-auto ">
                <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                  Form your team, plan your strategy, and let the battles begin!
                  Challenge other players and see who reigns supreme in the
                  digital school yard. Are you ready to rise to the top? The
                  battle for ultimate glory awaits!
                </span>

                {/* <FightPreview /> */}
              </div>
            </div>
          </div>
        </CustomScrollArea>
      </CustomStyledScrollView>
      <AnimatedStyledLoader
        style={fadeOutSpring}
        className="absolute inset-0 w-full h-[calc(100%-52px)] flex items-center flex-col gap-4 justify-end"
      >
        <span className="text-2xl animate-pulse">
          Loading the JNR Experience
        </span>
        <ProgressBar value={Number(progress.toFixed(0))} />
      </AnimatedStyledLoader>
    </div>
  );
};

export default JnrTeaserMain;

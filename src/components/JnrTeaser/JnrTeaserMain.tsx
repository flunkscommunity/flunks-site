import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { Avatar, Button, Frame, Handle, Hourglass, ProgressBar } from "react95";
import JnrBoxCanvas from "./JnrBoxCanvas";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import styled from "styled-components";
import {
  SpringValue,
  animated,
  useInView,
  useSpring,
  useSpringRef,
} from "@react-spring/web";
import IntroJnrs from "./IntroJnrs";
import { CLASSES } from "windows/ProjectJnr";
import EquipPreview from "components/Jnrs/EquipPreview";
import FightPreview from "components/Jnrs/FightPreview";
import JnrCollectibleCard, {
  JnrCollectibleCardReffed,
} from "components/Jnrs/JnrCollectibleCard";
import { useJnrCanvas } from "contexts/JnrCanvasContext";
import { toBlob, toJpeg, toPng } from "html-to-image";
import {
  FrameWithBackground,
  FrameWithCheckedBackground,
} from "components/AboutUs/FrameWithBackground";
import { domToPng } from "modern-screenshot";
import useWindowSize from "hooks/useWindowSize";

const StyledLoader = styled.div`
  background-color: ${({ theme }) => theme.material};
`;

const AnimatedStyledLoader = animated(StyledLoader);

const ClassItem = (item: (typeof CLASSES)[0]) => {
  const [ref, inView] = useInView({
    amount: 1
  });
  const { isTablet } = useWindowSize();
  const [hideBg, setHideBg] = useState(false);

  useEffect(() => {
    if (inView && isTablet) {
      setHideBg(true);
    } else {
      setHideBg(false);
    }
  }, [inView, isTablet]);

  return (
    <Frame
      ref={ref}
      key={item.className}
      variant="well"
      className={`${
        hideBg ? "!bg-[size:200%_4000%] !bg-[position:0%_100%]" : ""
      } w-full !min-h-[300px] h-full lg:hover:!bg-[position:0%_100%] lg:hover:!bg-[size:200%_4000%] group !flex flex-col items-center justify-center relative !overflow-hidden contrast-125`}
      style={{
        backgroundImage: `url(${item.setImage})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 30%",
      }}
    >
      <div
        className={`${
          hideBg ? "!bg-black/40" : ""
        } z-10 absolute py-6 w-full h-full inset-0 bg-black/70 lg:group-hover:bg-black/40 lg:group-hover:mix-blend-luminosity transition-all flex flex-col items-center justify-center gap-3 px-4`}
      >
        <span className="text-white text-3xl font-bold">{item.className}</span>
        <span className="text-white text-xl font-normal max-w-[325px] text-center">
          {item.description}
        </span>
      </div>
    </Frame>
  );
};

const JnrTeaserMain = () => {
  const animationScrollContainer = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const { progress, loaded } = useProgress();
  const { randomizeSelectedTraits } = useJnrCanvas();

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

  const elementRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGeneratedImageLoading, setIsGeneratedImageLoading] = useState(false);

  const generateImage = async () => {
    if (elementRef.current) {
      const element = elementRef.current;

      // Fixed dimensions
      const fixedWidth = 1056;
      const fixedHeight = 1808;

      // Calculate the scale factors
      const scaleX = fixedWidth / element.offsetWidth;
      const scaleY = fixedHeight / element.offsetHeight;

      setIsGeneratedImageLoading(true);
      try {
        const dataUrl = await domToPng(element, {
          width: fixedWidth,
          height: fixedHeight,
          style: {
            transform: `scale(${scaleX}, ${scaleY})`,
            transformOrigin: "top left",
          },
        });

        setGeneratedImage(dataUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGeneratedImageLoading(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col h-full relative">
        <CustomStyledScrollView className="w-full h-[calc(100%)]">
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
                <div className="w-full flex flex-col gap-10 mx-auto mb-[112px] lg:mb-[10%]">
                  <IntroJnrs />
                </div>

                <div className="w-full flex flex-col gap-10 max-w-[1440px] mx-auto mb-[112px] lg:mb-[10%]">
                  <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                    Dive into 8 unique classes: History, Art, Math, Biology,
                    Music, Sport, Physics, and Chemistry!
                    <br />
                    <br />
                    <span className="text-xl lg:text-3xl">
                      Each class comes with its own captivating themes,
                      specialized traits, and dynamic abilities, bringing a new
                      level of excitement to every battle.
                    </span>
                  </span>

                  <Frame className="w-full !grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden p-4">
                    {CLASSES.map((item) => (
                      <ClassItem key={item.setImage} {...item} />
                    ))}
                  </Frame>
                </div>

                <div
                  id="equip"
                  className="w-full flex flex-col gap-10 max-w-[1440px] mx-auto mb-[112px] lg:mb-[10%]"
                >
                  <span className="font-bold text-2xl lg:text-4xl text-pretty text-center max-w-[700px] mx-auto px-4">
                    Equip your JNR with powerful traits! Discover and unlock a
                    vast array of unique abilities, customizing your Pocket
                    Junior for epic battles and strategic dominance. <br />{" "}
                    <br />{" "}
                    <span className="text-xl lg:text-3xl">
                      With each trait enhancing your JNR's stats and skills, you
                      can create the perfect team to outsmart and outfight your
                      opponents.
                    </span>
                  </span>

                  <EquipPreview />
                </div>

                <div className="w-full flex flex-col gap-10 mx-auto mb-[112px] lg:mb-[10%]">
                  <span className="font-bold text-2xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                    Form your team, plan your strategy, and let the battles
                    begin! Challenge other players and see who reigns supreme in
                    the digital school yard. Are you ready to rise to the top?
                    The battle for ultimate glory awaits!
                  </span>

                  <FightPreview />
                </div>

                <div className="w-full flex flex-col gap-10 mx-auto pb-1">
                  <span className="font-bold text-2xl lg:text-6xl text-center max-w-[700px] mx-auto px-4">
                    CLOSED BETA APPLICATION COMING SOON!
                  </span>
                  <span className="text-xl lg:text-4xl text-center max-w-[700px] mx-auto px-4">
                    In the meantime, create your very own Pocket Junior
                    collectible card!
                  </span>

                  <Frame
                    variant="well"
                    className="!flex max-w-[1440px] mx-auto w-full h-full flex-col relative"
                  >
                    <Frame className="px-2 py-2 !flex items-end justify-end sticky top-0 gap-1">
                      <Button onClick={randomizeSelectedTraits}>
                        Randomize
                      </Button>
                      <Handle className="mx-1" />
                      <Button onClick={generateImage}>
                        Save to your Device
                      </Button>
                    </Frame>
                    <FrameWithCheckedBackground
                      variant="well"
                      className="!flex py-10 w-full items-center justify-center overflow-hidden h-full max-h-[500px] lg:max-h-none"
                    >
                      <JnrCollectibleCardReffed ref={elementRef} />
                    </FrameWithCheckedBackground>
                  </Frame>
                </div>
              </div>
            </div>
          </CustomScrollArea>
        </CustomStyledScrollView>
        <AnimatedStyledLoader
          style={fadeOutSpring}
          className="absolute inset-0 w-full h-full flex items-center flex-col gap-4 justify-end"
        >
          <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full items-center justify-center px-4">
            <span className="text-2xl animate-pulse">
              Loading the JNR Experience
            </span>
            <ProgressBar value={Number(progress.toFixed(0))} />
          </div>
        </AnimatedStyledLoader>
        {(generatedImage || isGeneratedImageLoading) && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (isGeneratedImageLoading) return;
                setGeneratedImage(null);
              }
            }}
            className="!absolute inset-0 !bg-black/50 backdrop-blur-lg z-50 p-4 flex flex-col gap-4 items-center justify-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='60' height='60' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M10 60V30m10 0v30m10 0H0V30M50 0v30m-10 0V0M30 0h30v30M30 40h30m0 10H30m0-20h30v30H30zM0 10h30m0 10H0M0 0h30v30H0z'  stroke-width='1' stroke='hsla(259, 0%, 100%, 0.04)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
            }}
          >
            <span className="text-xl text-center text-white pointer-events-none max-w-[375px]">
              Right click and save the image to your device! On mobile, long
              press and save the image.
            </span>
            {!isGeneratedImageLoading && (
              <img src={generatedImage} className="max-h-[60%] flex-shrink" />
            )}
            {isGeneratedImageLoading && <Hourglass className="w-16 h-16" />}
            <span className="text-xl text-center text-white/50 pointer-events-none max-w-[375px]">
              Click anywhere outside of the image to close this view.
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default JnrTeaserMain;

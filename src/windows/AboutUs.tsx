import { a, config, useScroll } from "@react-spring/web";
import CrowdSimulator from "components/CrowdSimulator";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useRef } from "react";
import Draggable from "react-draggable";
import Marquee from "react-fast-marquee";
import { Frame, ScrollView, ScrollViewProps, createScrollbars } from "react95";
import {
  createBorderStyles,
  createBoxStyles,
  createFlatBoxStyles,
  insetShadow,
} from "react95/dist/common";
import styled from "styled-components";

const BackgroundDiv = styled(Frame)`
  background-color: ${({ theme }) => theme.canvas};
  background-image: linear-gradient(
      ${({ theme }) => theme.borderLightest} 1px,
      transparent 1px
    ),
    linear-gradient(
      to right,
      ${({ theme }) => theme.borderLightest} 1px,
      ${({ theme }) => theme.canvas} 1px
    );
  background-size: 32px 32px;
`;

const HeaderText = styled.span`
  color: ${({ theme }) => theme.progress};
`;

const MarqueeText = styled.span`
  color: ${({ theme }) => theme.canvasText};
  text-shadow: ${({ theme }) => theme.canvasTextDisabledShadow} 1px 1px;
`;

const Polaroid = (props: { image: string; x: number; y: number }) => {
  return (
    <Draggable
      bounds="parent"
      defaultPosition={{
        x: props.x,
        y: props.y,
      }}
    >
      <Frame className="!flex flex-col items-center gap-2 pb-10 px-2 pt-2">
        <Frame
          variant="well"
          className="w-28 h-28 md:w-64 md:h-64 object-cover relative"
        >
          <img
            src={props.image}
            alt="Flunk"
            className="w-full h-full !select-none"
          />
          <div className="absolute inset-0 w-full h-full" />
        </Frame>
      </Frame>
    </Draggable>
  );
};

const RANGES = {
  onceUponATimeText: {
    desktop: [
      [0, 0.5, 1],
      [0, 0.5, 1],
    ],
    tablet: [
      [0.1, 0.16, 1],
      [0, 1, 1],
    ],
  },
};

const AboutUs = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { closeWindow } = useWindowsContext();
  const { scrollYProgress } = useScroll({
    config: config.gentle,
    container: containerRef,
  });
  const draggableRef = useRef<HTMLDivElement>(null);

  return (
    <DraggableResizeableWindow
      ref={draggableRef}
      onClose={() => {
        closeWindow(WINDOW_IDS.ABOUT_US);
      }}
      headerTitle={"About Us"}
      initialHeight="100%"
      initialWidth="100%"
      windowsId={WINDOW_IDS.ABOUT_US}
    >
      <CustomStyledScrollView className="!h-full !w-full">
        <CustomScrollArea
          ref={containerRef}
          className="!w-full !h-full !overflow-x-hidden"
        >
          <Frame variant="field" className="!h-auto w-full !flex flex-col">
            <div className="h-full max-w-[1200px] mx-auto min-h-screen w-full px-6 lg:px-12 py-10 lg:py-[40px] !flex flex-col items-start justify-start gap-10 md:gap-[112px]">
              <div className="flex flex-row gap-2 items-center justify-between w-full">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  Flunks is a web3 brand that combines the nostalgia of
                  high-school with the excitement of NFTs and modern technology.
                </span>
                <div className="relative hidden xl:block scale-90">
                  <Frame className="!flex !absolute top-0 -left-[60%] scale-90 flex-col items-center gap-2 pb-10 px-2 pt-2 -rotate-12">
                    <Frame
                      variant="well"
                      className="w-28 h-28 md:w-64 md:h-64 object-cover relative"
                    >
                      <img
                        src={
                          "https://res.cloudinary.com/hxn7xk7oa/image/fetch/c_lfill,w_1200,h_1200,q_100,f_auto/https://storage.googleapis.com/flunk-graduation/5a4b2cdca6b0563f5ffd50bcee78bd2a12e0547d9eeef0a1ea8d6ba6f7ce5094.png"
                        }
                        alt="Flunk"
                        className="w-full h-full !select-none"
                      />
                      <div className="absolute inset-0 w-full h-full" />
                    </Frame>
                  </Frame>
                  <Frame className="!flex !absolute top-0 left-[50%] scale-[0.8] flex-col items-center gap-2 pb-10 px-2 pt-2 rotate-12">
                    <Frame
                      variant="well"
                      className="w-28 h-28 md:w-64 md:h-64 object-cover relative"
                    >
                      <img
                        src={
                          "https://res.cloudinary.com/hxn7xk7oa/image/fetch/c_lfill,w_1200,h_1200,q_100,f_auto/https://storage.googleapis.com/flunk-graduation/7465eeede3419aaa6def3cf3811bb4ce7416320da65fd60d6aa4d56cd3b4d0d3.png"
                        }
                        alt="Flunk"
                        className="w-full h-full !select-none"
                      />
                      <div className="absolute inset-0 w-full h-full" />
                    </Frame>
                  </Frame>
                  <Frame className="!flex flex-col items-center gap-2 pb-10 px-2 pt-2 -rotate-3">
                    <Frame
                      variant="well"
                      className="w-28 h-28 md:w-64 md:h-64 object-cover relative"
                    >
                      <img
                        src={
                          "https://res.cloudinary.com/hxn7xk7oa/image/fetch/c_lfill,w_1200,h_1200,q_100,f_auto/https://images.ongaia.com/ipfs/QmZPxYTEx8E5cNy5SzXWDkJQg8j5C3bKV6v7csaowkovua/497e9f78b8baf7dea1754da06812fc5d1eca8d28444de1a11a51c459f03400a0.jpg"
                        }
                        alt="Flunk"
                        className="w-full h-full !select-none"
                      />
                      <div className="absolute inset-0 w-full h-full" />
                    </Frame>
                  </Frame>
                </div>
              </div>
              {/* <video
                src="https://storage.googleapis.com/flunks_public/rebrand/map-bg-optimized.mp4"
                autoPlay
                loop
                muted
                playsInline
                poster="https://storage.googleapis.com/flunks_public/rebrand/map-poster.jpg"
                className="w-full aspect-video object-cover mix-blend-multiply"
              /> */}
              <div className="flex flex-col gap-4 mt-10">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  Our Timeline
                </span>
                <span className="text-xl md:text-2xl font-normal max-w-2xl text-pretty">
                  Over the years we have developed a range of products that are
                  designed to be fun and engaging.
                </span>

                <div className="grid grid-cols-2 w-full gap-10">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="https://res.cloudinary.com/hxn7xk7oa/image/fetch/c_lfill,w_1200,h_1200,q_100,f_auto/https://storage.googleapis.com/flunk-graduation/7465eeede3419aaa6def3cf3811bb4ce7416320da65fd60d6aa4d56cd3b4d0d3.png"
                      className="w-full h-auto"
                    />
                    <span className="text-xl md:text-2xl font-bold">
                      Flunks
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="https://res.cloudinary.com/hxn7xk7oa/image/fetch/c_lfill,w_1200,h_1200,q_100,f_auto/https://storage.googleapis.com/backpack_public/backpack/38ba8e5b3025d0a53dac9c2306654116f922bce8804fa53d3089e948b04e9b24.png"
                      className="w-full h-auto"
                    />
                    <span className="text-xl md:text-2xl font-bold">
                      Backpacks
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="https://zeero.art/images/logos/zeero-solo-black.svg"
                      className="w-full h-auto"
                    />
                    <span className="text-xl md:text-2xl font-bold">
                      Zeero Marketplace
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 h-full justify-center">
                    <img
                      src="https://storage.googleapis.com/flunks_public/rebrand/pocketjnrs.png"
                      className="w-full h-auto"
                    />
                    <span className="text-xl md:text-2xl font-bold text-pretty">
                      Pocket Juniors (coming soon)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Frame>
          <Frame
            variant="status"
            className="relative h-[300px] max-h-[70%] w-full bg-white !flex items-center overflow-hidden justify-center flex-col gap-6 max-w-full overflow-x-hidden"
          >
            <div className="absolute -bottom-4 w-full left-0 z-0 mix-blend-luminosity px-1">
              <CrowdSimulator
                spriteSheetUrl="/images/Footer-Crowd.webp"
                rows={8}
                cols={2}
              />
            </div>
            <div className="relative flex flex-col items-start justify-start">
              <span className="text-7xl md:text-9xl tracking-wide font-bold uppercase mix-blend-difference">
                Flunks
              </span>
              <HeaderText className="text-7xl md:text-9xl font-bold tracking-wide uppercase absolute mix-blend-difference">
                Flunks
              </HeaderText>
            </div>
            {/* <span className="absolute top-[60%] text-lg md:text-4xl font-bold uppercase max-w-[400px] text-center -rotate-3">
              cute but mischievous high-schoolers wreaking havoc on FLow!
            </span> */}
          </Frame>
          {/* <Frame variant="well" className="!w-full py-2">
            <Marquee autoFill>
              <MarqueeText className="text-4xl ml-4 font-bold">
                The Birth of Flunks
              </MarqueeText>
            </Marquee>
          </Frame> */}
          {/* <Frame variant="field" className="!w-full py-2">
            <Marquee autoFill>
              <MarqueeText className="text-4xl ml-4 font-bold">
                BACKPACKS AND MARKETPLACE REVOLUTION
              </MarqueeText>
            </Marquee>
          </Frame> */}
        </CustomScrollArea>
      </CustomStyledScrollView>
    </DraggableResizeableWindow>
  );
};

export default AboutUs;

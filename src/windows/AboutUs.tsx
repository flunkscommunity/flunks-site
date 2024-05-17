import { a, config, useScroll } from "@react-spring/web";
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

const BackgroundDiv = styled.div`
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

  return (
    <DraggableResizeableWindow
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
          <BackgroundDiv className="relative h-[90%] w-full bg-white flex items-center justify-center flex-col gap-6 max-w-full overflow-x-hidden">
            {/* <div className="absolute inset-0 w-full h-full overflow-hidden flex flex-col items-start justify-start z-0">
            <Polaroid
              image="https://images.ongaia.com/ipfs/QmZPxYTEx8E5cNy5SzXWDkJQg8j5C3bKV6v7csaowkovua/71db6709ef6dda573fbee5e8db8cdcf1703c8b40ed047de252371a630a07e250.jpg"
              x={100}
              y={100}
            />
            <Polaroid
              image="https://images.ongaia.com/ipfs/QmZPxYTEx8E5cNy5SzXWDkJQg8j5C3bKV6v7csaowkovua/e623714e12694537da651d347e57dbc6c87e9b2a23fab6649870ba9466c96bf4.jpg"
              x={200}
              y={200}
            />
            <Polaroid
              image="https://res.cloudinary.com/hxn7xk7oa/image/fetch/c_lfill,w_1200,h_1200,q_100,f_auto/https://storage.googleapis.com/flunk-graduation/da19ec9481cbcf30da9993db3570aa8442c6684464f26030eb2c045152b376bd.png"
              x={0}
              y={0}
            />
          </div> */}

            <div className="relative flex flex-col items-start justify-start">
              <span className="text-7xl md:text-9xl font-bold uppercase">
                Flunks
              </span>
              <HeaderText className="text-7xl md:text-9xl font-bold uppercase absolute bottom-2">
                Flunks
              </HeaderText>
            </div>
            <span className="absolute top-[60%] text-lg md:text-4xl font-bold uppercase max-w-[400px] text-center -rotate-3">
              cute but mischievous high-schoolers wreaking havoc on FLow!
            </span>
          </BackgroundDiv>
          <Frame variant="field" className="!w-full py-2">
            <Marquee autoFill>
              <MarqueeText className="text-4xl ml-4 font-bold">
                ORIGINS
              </MarqueeText>
            </Marquee>
          </Frame>
          <Frame variant="field" className="!h-auto w-full p-4 !flex flex-col">
            <div className="h-full min-h-screen w-full p-4 !flex items-center justify-center">
              <span className="text-3xl md:text-6xl text-center">
                Once upon a time,
                <br /> there were four cliques
              </span>
            </div>
            <div className="h-full min-h-screen w-full p-4 !flex items-center justify-center">
              <span className="text-3xl md:text-6xl text-center font-bold">
                JOCKS
              </span>
            </div>
            <div className="h-full min-h-screen w-full p-4 !flex items-center justify-center">
              <span className="text-3xl md:text-6xl text-center font-bold">
                GEEKS
              </span>
            </div>
            <div className="h-full min-h-screen w-full p-4 !flex items-center justify-center">
              <span className="text-3xl md:text-6xl text-center font-bold">
                FREAKS
              </span>
            </div>
            <div className="h-full min-h-screen w-full p-4 !flex items-center justify-center">
              <span className="text-3xl md:text-6xl text-center font-bold">
                PREPS
              </span>
            </div>
            <div className="h-full min-h-screen w-full p-4 !flex items-center justify-center">
              <span className="text-2xl md:text-4xl text-center">
                These original cliques were the foundation of Flunks High and
                the beginning of the Flunks' story.
              </span>
            </div>
          </Frame>
        </CustomScrollArea>
      </CustomStyledScrollView>
    </DraggableResizeableWindow>
  );
};

export default AboutUs;

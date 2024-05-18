import { a, config, useScroll } from "@react-spring/web";
import OurApps from "components/AboutUs/OurApps";
import OurProducts from "components/AboutUs/OurProducts";
import OurTeam from "components/AboutUs/OurTeam";
import Timeline from "components/AboutUs/Timeline";
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
  background-color: ${({ theme }) => theme.material};
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
      ${({ theme }) => theme.material} 1px
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
          className="w-28 h-28 md:w-[300px] md:h-[300px] object-cover relative"
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
      [0, 0.1, 1],
      [0, 0.1, 1],
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
      resizable={false}
      showMaximizeButton={false}
    >
      <CustomStyledScrollView className="!h-full !w-full">
        <CustomScrollArea
          ref={containerRef}
          className="!w-full !h-full !overflow-x-hidden"
        >
          <BackgroundDiv
            variant="field"
            className="relative pb-[330px] !h-auto w-full !flex flex-col overflow-hidden"
          >
            <div className="h-full relative mx-auto min-h-[600px] w-full px-4 lg:px-20 py-10 lg:py-[80px] !flex flex-col items-start justify-start gap-10 md:gap-[112px]">
              <div className="flex flex-col max-w-[1440px] mx-auto lg:flex-row gap-10 items-center justify-between w-full">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  Flunks is a web3 brand that blends high school nostalgia with
                  the excitement of NFTs and modern technology.
                </span>
              </div>

              <div className="flex flex-col max-w-[1440px] mx-auto lg:flex-row gap-10 items-center justify-end w-full">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  Founded in 2022 by web3 enthusiasts, Flunks has quickly become
                  a staple in the FLOW ecosystem. Our mission is to deliver a
                  tasteful fusion of art and technology.
                </span>
              </div>

              <div className="flex flex-col max-w-[1440px] mx-auto lg:flex-row gap-10 items-center justify-between w-full">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  <u>Community is at the core of Flunks.</u> From the community
                  vote that named us to the creation of the Cafeteria DAO,
                  Flunks is a project by the people, for the people.
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col mt-20">
              <div className="flex w-full px-4 lg:px-20">
                <div className="max-w-[1440px] mx-auto w-full flex">
                  <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase ml-auto underline">
                    Our Art
                  </span>
                </div>
              </div>

              <OurProducts />
            </div>
            <div className="w-full flex flex-col mt-20">
              <div className="flex w-full px-4 lg:px-20">
                <div className="max-w-[1440px] mx-auto w-full flex">
                  <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase ml-auto underline">
                    Our Apps
                  </span>
                </div>
              </div>

              <OurApps />
            </div>
            <div className="w-full flex flex-col mt-20">
              <div className="flex w-full px-4 lg:px-20 flex-col">
                <div className="max-w-[1440px] mx-auto w-full flex flex-col">
                  <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase ml-auto underline">
                    Our Team
                  </span>

                  <OurTeam />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 w-full left-0 z-0 mix-blend-luminosity px-1">
              <CrowdSimulator
                spriteSheetUrl="/images/Footer-Crowd.webp"
                rows={8}
                cols={2}
              />
            </div>
          </BackgroundDiv>
        </CustomScrollArea>
      </CustomStyledScrollView>
    </DraggableResizeableWindow>
  );
};

export default AboutUs;

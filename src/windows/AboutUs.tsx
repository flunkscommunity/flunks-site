import { config, useScroll } from "@react-spring/web";
import OurApps from "components/AboutUs/OurApps";
import OurProducts from "components/AboutUs/OurProducts";
import OurTeam from "components/AboutUs/OurTeam";
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
import { Frame, TableDataCell, Avatar, Button, Anchor } from "react95";
import styled from "styled-components";
import useSWR from "swr";

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

const fetcher = (url) => fetch(url).then((r) => r.json());

const AboutUs = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { closeWindow } = useWindowsContext();
  const { scrollYProgress } = useScroll({
    config: config.gentle,
    container: containerRef,
  });

  const { data: discordStats } = useSWR(
    "https://discord.com/api/guilds/929609214215725056/widget.json",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
    }
  );

  return (
    <DraggableResizeableWindow
      onClose={() => {
        closeWindow(WINDOW_IDS.ABOUT_US);
      }}
      headerTitle={"About Us"}
      initialHeight="100%"
      initialWidth="100%"
      windowsId={WINDOW_IDS.ABOUT_US}
      resizable={false}
      showMaximizeButton={false}
      headerIcon="/images/icons/about-us.png"
    >
      <CustomStyledScrollView className="!h-full !w-full">
        <CustomScrollArea
          ref={containerRef}
          className="!w-full !h-full !overflow-x-hidden"
        >
          <BackgroundDiv
            variant="field"
            className="!h-auto w-full !flex flex-col overflow-hidden z-50 static pb-28"
          >
            <div className="h-full relative mx-auto min-h-[600px] w-full px-4 lg:px-20 py-10 lg:py-[80px] !flex flex-col items-start justify-start gap-10 md:gap-[112px]">
              <div className="flex flex-col max-w-[1440px] mx-auto lg:flex-col gap-10 items-start w-full">
                <img src="/images/logos/flunks.png" className="h-[50px] lg:h-24" />
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  Flunks is a web3 brand that blends high school nostalgia with
                  the excitement of NFTs and modern technology.
                </span>
              </div>

              <div className="flex flex-col max-w-[1440px] mx-auto gap-10 items-end w-full">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  Founded in 2022 by web3 enthusiasts, Flunks has quickly become
                  a staple in the FLOW ecosystem. Our mission is to deliver a
                  tasteful fusion of art and technology.
                </span>
              </div>

              <div className="flex flex-col max-w-[1440px] mx-auto gap-10 items-start w-full">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty">
                  <Anchor
                    href={discordStats?.instant_invite}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Community is at the core of Flunks.
                  </Anchor>{" "}
                  From the community vote that named us to the creation of the
                  Cafeteria DAO, Flunks is a project by the people, for the
                  people.
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col mt-20">
              <div className="flex w-full px-4 lg:px-20">
                <div className="max-w-[1440px] mx-auto w-full flex">
                  <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase underline">
                    Our Art
                  </span>
                </div>
              </div>

              <OurProducts />
            </div>
            <div className="w-full flex flex-col mt-20">
              <div className="flex w-full px-4 lg:px-20">
                <div className="max-w-[1440px] mx-auto w-full flex">
                  <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase underline">
                    Our Apps
                  </span>
                </div>
              </div>

              <OurApps />
            </div>
            <div className="w-full flex flex-col mt-20">
              <div className="flex w-full px-4 lg:px-20 flex-col">
                <div className="max-w-[1440px] mx-auto w-full flex flex-col">
                  <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase underline">
                    Our Team
                  </span>

                  <OurTeam />
                </div>
              </div>
            </div>
          </BackgroundDiv>
          <Frame
            variant="well"
            className="w-full flex flex-col pt-10 pb-[330px] overflow-hidden "
            style={{
              backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 700 700" width="700" height="700" id="nnnoise" opacity="0.12"><defs><filter id="nnnoise-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="15" stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence"></feTurbulence><feSpecularLighting surfaceScale="3" specularConstant="0.8" specularExponent="20" lighting-color="%23ffffff" x="0%" y="0%" width="100%" height="100%" in="turbulence" result="specularLighting"><feDistantLight azimuth="3" elevation="59"></feDistantLight></feSpecularLighting></filter></defs><rect width="700" height="700" fill="transparent"></rect><rect width="700" height="700" fill="%23ffffff" filter="url(%23nnnoise-filter)"></rect></svg>')`,
            }}
          >
            <div className="flex w-full flex-col">
              <div className="max-w-[1440px] mx-auto w-full flex flex-col">
                <span className="text-3xl md:text-6xl font-bold max-w-2xl text-pretty uppercase mx-auto">
                  Join our Community
                </span>

                <div className="flex gap-4 mt-10 overflow-hidden flex-col w-full items-center">
                  {/* <div className="flex flex-col">
                      <iframe
                        src="https://discord.com/widget?id=929609214215725056&theme=dark"
                        width="600"
                        height="450"
                        allowTransparency={true}
                        frameBorder="0"
                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                        className="max-w-[280px] lg:max-w-full"
                      ></iframe>
                    </div> */}
                  <Frame
                    variant="field"
                    className="max-w-[600px] h-full max-h-[400px] w-full overflow-hidden"
                  >
                    <Frame className="px-2 py-4 !flex gap-2 items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <img src="/images/icons/discord.png" className="h-8" />
                        <span className="text-lg font-bold">Discord</span>
                      </div>

                      <span className="text-lg font-bold">
                        {discordStats?.presence_count || 0} Flunks Online
                      </span>
                    </Frame>

                    <CustomStyledScrollView>
                      <CustomScrollArea className="!max-h-[200px] w-full overflow-y-auto !p-0 gap-px flex flex-col">
                        {discordStats?.members?.map((member) => (
                          <div
                            key={member.id}
                            className="!w-full !flex items-center !h-full py-2 gap-2 bg-white shadow-sm"
                          >
                            <TableDataCell className="flex items-center justify-center">
                              <Avatar
                                src={member.avatar_url}
                                className="w-8 h-8"
                              />
                            </TableDataCell>
                            <TableDataCell className="flex-grow text-lg !text-black">
                              {member.username}
                            </TableDataCell>
                            <TableDataCell className="capitalize flex items-center gap-1">
                              <span className="text-base leading-[1]">
                                {member.status}
                              </span>
                              {member.status === "online" ? (
                                <div className="w-2 h-2 mb-0.5 rounded-full bg-green-500" />
                              ) : member.status === "idle" ? (
                                <div className="w-2 h-2 mb-0.5 rounded-full bg-yellow-500" />
                              ) : (
                                <div className="w-2 h-2 mb-0.5 rounded-full bg-red-500" />
                              )}
                            </TableDataCell>
                          </div>
                        ))}
                      </CustomScrollArea>
                    </CustomStyledScrollView>
                    <Frame
                      variant="well"
                      className="px-2 py-4 !flex flex-col gap-2 items-center justify-between w-full"
                    >
                      <a
                        href={discordStats?.instant_invite}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="w-full"
                      >
                        <Button
                          primary
                          fullWidth
                          className="font-bold !py-8 !text-2xl flex items-center justify-center"
                        >
                          JOIN NOW
                        </Button>
                      </a>
                    </Frame>
                  </Frame>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 w-full left-0 z-0 px-1">
              <CrowdSimulator
                spriteSheetUrl="/images/Footer-Crowd.webp"
                rows={8}
                cols={2}
              />
            </div>
          </Frame>
        </CustomScrollArea>
      </CustomStyledScrollView>
    </DraggableResizeableWindow>
  );
};

export default AboutUs;

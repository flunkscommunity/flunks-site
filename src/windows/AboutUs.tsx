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
import {
  Frame,
  ScrollView,
  ScrollViewProps,
  createScrollbars,
  TableBody,
  TableRow,
  TableDataCell,
  Avatar,
  Button,
} from "react95";
import {
  createBorderStyles,
  createBoxStyles,
  createFlatBoxStyles,
  insetShadow,
} from "react95/dist/common";
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
          </BackgroundDiv>
          <Frame
            variant="well"
            className="w-full flex flex-col pt-10 pb-[330px] overflow-hidden "
            style={{
              backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='75' height='75' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M32.763-11.976c-1.05-.075-1.95.676-2.024 1.726L29.764.849c-.075 1.05.675 1.95 1.725 2.026 1.05.075 1.95-.675 2.025-1.725l.975-11.1c.075-1.05-.675-1.95-1.725-2.025zM54.299 1.32a1.912 1.912 0 0 0-.386.015c-.975.15-1.725 1.05-1.575 2.1l1.5 11.025c.15.975 1.05 1.725 2.1 1.575a1.732 1.732 0 0 0 1.575-2.1l-1.5-11.025c-.131-.853-.836-1.533-1.714-1.59zm-46.93 1.22a1.809 1.809 0 0 0-1.662 1.663c-.075 1.05.675 1.952 1.65 2.027l11.1 1.05c.975.15 1.95-.601 2.025-1.651.15-.975-.6-1.95-1.65-2.025l-11.1-1.05a1.643 1.643 0 0 0-.363-.015zM1.76 13.017a1.825 1.825 0 0 0-1.285.6l-7.65 8.101c-.75.75-.675 1.95.075 2.625s1.95.674 2.625-.076l7.651-8.099c.75-.75.674-1.95-.076-2.625a1.785 1.785 0 0 0-1.34-.526zm75 0a1.825 1.825 0 0 0-1.285.6l-7.65 8.101c-.75.75-.675 1.95.075 2.625s1.95.674 2.625-.076l7.651-8.099c.75-.75.674-1.95-.076-2.625a1.785 1.785 0 0 0-1.34-.526zm-39.731 2.906a1.785 1.785 0 0 0-1.34.527l-7.95 7.723c-.75.675-.826 1.875-.076 2.625.675.75 1.875.752 2.625.077l7.95-7.725c.75-.675.826-1.875.076-2.625a1.825 1.825 0 0 0-1.285-.602zm24.639 18.928c-.24.02-.48.085-.705.197a1.903 1.903 0 0 0-.825 2.55l5.1 9.902a1.902 1.902 0 0 0 2.55.824c.975-.45 1.276-1.574.826-2.55l-5.1-9.9c-.395-.73-1.125-1.083-1.846-1.023zm-50.37-4.862a1.756 1.756 0 0 0-1.035.336c-.825.6-1.05 1.725-.524 2.625l6.15 9.223c.6.9 1.8 1.127 2.625.526.9-.6 1.124-1.8.524-2.624l-6.15-9.226a1.912 1.912 0 0 0-1.59-.86zm32.705 9.766c-.12-.006-.243 0-.365.019l-10.95 2.175c-1.05.15-1.725 1.126-1.5 2.176.15 1.05 1.126 1.725 2.176 1.5l10.95-2.175c1.05-.15 1.725-1.125 1.5-2.175a1.99 1.99 0 0 0-1.811-1.52zm4.556 12.195a1.932 1.932 0 0 0-1.845.949c-.45.9-.15 2.025.75 2.55l9.75 5.4c.9.45 2.025.15 2.55-.75.525-.9.15-2.025-.75-2.55l-9.75-5.4a1.958 1.958 0 0 0-.705-.199zM71.913 58c-1.05-.075-1.875.748-1.95 1.798l-.45 11.1c-.075 1.05.75 1.876 1.8 1.95.975 0 1.875-.75 1.95-1.8l.45-11.1c.075-1.05-.75-1.873-1.8-1.948zm-55.44 1.08a1.865 1.865 0 0 0-1.035.42l-8.775 6.825c-.75.6-.9 1.8-.3 2.625.6.75 1.8.9 2.626.3l8.775-6.827c.75-.6.9-1.8.3-2.625a1.783 1.783 0 0 0-1.591-.72zm16.29 3.945c-1.05-.075-1.95.675-2.024 1.725l-.975 11.099c-.075 1.05.675 1.95 1.725 2.026 1.05.075 1.95-.675 2.025-1.725l.975-11.102c.075-1.05-.675-1.95-1.725-2.024z'  stroke-width='1' stroke='none' fill='hsla(259, 0%, 100%, 0.42)'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "overlay",
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
                      <CustomScrollArea className="!max-h-[200px] w-full overflow-y-auto">
                        {discordStats?.members?.map((member) => (
                          <TableRow
                            key={member.id}
                            className="!w-full !flex items-center !h-full py-2"
                          >
                            <TableDataCell className="flex items-center justify-center">
                              <Avatar
                                src={member.avatar_url}
                                className="w-8 h-8"
                              />
                            </TableDataCell>
                            <TableDataCell className="flex-grow">
                              {member.username}
                            </TableDataCell>
                            <TableDataCell>{member.status}</TableDataCell>
                          </TableRow>
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
                        <Button variant="flat" fullWidth className="font-bold !py-8 !text-2xl flex items-center justify-center">
                          JOIN NOW
                          <img src="/images/icons/arrow-right.png" className="h-6 ml-2" />
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

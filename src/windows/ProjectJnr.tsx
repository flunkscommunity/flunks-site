import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Anchor,
  Frame,
  MenuList,
  MenuListItem,
  ScrollView,
  Button,
  Toolbar,
} from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import JnrCanvas from "components/Canvases/JnrCanvas";
import Marquee from "react-fast-marquee";
import styled from "styled-components";
import React, { Fragment, useState } from "react";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import Inventory from "components/Jnrs/Inventory";
import { JnrCanvasProvider } from "contexts/JnrCanvasContext";
import JnrCollectibleCard from "components/Jnrs/JnrCollectibleCard";
import EquippedItems from "components/Jnrs/EquippedItems";
import useWindowSize from "hooks/useWindowSize";

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

const ProjectJnr: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { height } = useWindowSize();

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
      >
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
        {/* 
        <Frame className="xl:!hidden !w-full !h-full max-w-full max-h-full !hidden lg:!grid grid-cols-12 grid-rows-2">
          <Frame
            variant="well"
            className="col-span-6 row-span-2 !bg-blue-500"
          ></Frame>
          <Frame
            variant="well"
            className="col-span-6 row-span-1 !bg-red-500"
          ></Frame>
          <Frame
            variant="well"
            className="col-span-6 row-span-1 !bg-green-500"
          ></Frame>
        </Frame>

        <Frame className="!w-full !h-full max-w-full max-h-full !grid lg:!hidden grid-cols-12 grid-rows-2">
          <Frame
            variant="well"
            className="col-span-12 row-span-1 !bg-red-500"
          ></Frame>
          <Frame
            variant="well"
            className="col-span-12 row-span-1 !bg-blue-500"
          ></Frame>
        </Frame> */}

        {/* <div className="flex flex-col-reverse xl:flex-row h-full w-full">
          <div
            className={`w-full ${
              mobileExpandTraitMenu ? "h-3/4" : "h-1/2"
            } xl:h-full xl:max-w-[500px] xl:min-w-[500px] flex-shrink-0`}
          >
            <Inventory
              onExpand={() => {
                setMobileExpandTraitMenu((prev) => !prev);
              }}
            />
          </div>

          <div
            className="w-full xl:w-[calc(100%-500px)]"
            style={{
              minHeight: mobileExpandTraitMenu ? "25%" : "50%",
            }}
          >
            <JnrCanvas />
          </div>
        </div> */}
      </DraggableResizeableWindow>
    </JnrCanvasProvider>
  );
};

export default ProjectJnr;

{
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
      </div> */
}

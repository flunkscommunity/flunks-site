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
  const [selectedTraits, setSelectedTraits] = useState<{
    back: string;
    bottoms: string;
    head: string;
    lh: string;
    rh: string;
    shoes: string;
    torso: string;
  }>({
    back: "/3d/SKELETON/BACK.BIOLOGY.SKELETON.glb",
    bottoms: "/3d/SKELETON/BOTTOMS.BIOLOGY.SKELETON.glb",
    head: "/3d/SKELETON/HEAD.BIOLOGY.SKELETON.glb",
    lh: "/3d/SKELETON/LH.BIOLOGY.SKELETON.glb",
    rh: "/3d/SKELETON/RH.BIOLOGY.SKELETON.glb",
    shoes: "/3d/SKELETON/SHOES.BIOLOGY.SKELETON.glb",
    torso: "/3d/SKELETON/TORSO.BIOLOGY.SKELETON.glb",
  });
  const [show2d, setShow2d] = useState(false);
  const [showApp, setShowApp] = useState(false);

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Project J.N.R"
      onClose={() => {
        closeWindow(WINDOW_IDS.PROJECT_JNR);
      }}
      windowsId={WINDOW_IDS.PROJECT_JNR}
      initialHeight="100%"
      initialWidth="100%"
      showMaximizeButton={false}
      resizable={false}
    >
      <JnrCanvasProvider>
        <div className="flex flex-col-reverse lg:flex-row h-full w-full">
          <div className="w-full h-[50%] lg:h-full lg:max-w-[450px]">
            <Inventory />
          </div>

          <JnrCanvas traits={selectedTraits} />
        </div>
      </JnrCanvasProvider>
    </DraggableResizeableWindow>
  );
};

export default ProjectJnr;

{
  /* <div className="flex flex-col lg:flex-row-reverse w-full h-full gap-2">
        <JnrCanvas traits={selectedTraits} />
        <ScrollView className="h-[calc(100%-50%-8px)] lg:h-full w-full max-w-[400px] !p-0">
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

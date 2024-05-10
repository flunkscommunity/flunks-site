import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import {
  Anchor,
  Frame,
  MenuList,
  MenuListItem,
  ScrollView,
  Button,
} from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import JnrCanvas, {
  TRAITS_BY_CLASS,
  TRAIT_COLLECTION_NAME,
  TRAIT_IMAGES_BY_CLASS,
  TRAIT_IMAGES_BY_URL,
} from "components/Canvases/JnrCanvas";
import Marquee from "react-fast-marquee";
import styled from "styled-components";
import React, { Fragment, useState } from "react";

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

// image stack order reversed:
// RH TRAIT
// LH TRAIT
// HEAD TRAIT
// BASE EYES url = /images/jnr-traits/base-eyes.png
// BASE HEAD url = /images/jnr-traits/base-head.png
// TORSO TRAIT
// BASE TORSO url = /images/jnr-traits/base-torso.png
// BOTTOMS TRAIT
// SHOES TRAIT
// BASE BOTTOMS url = /images/jnr-traits/base-bottoms.png
// BACK TRAIT

const TraitImage = ({
  src,
  traitName,
  onClick,
  active,
}: {
  src: string;
  traitName: string;
  onClick: (src) => void;
  active?: boolean;
}) => {
  const imageRenderOrder = [
    traitName === "back" ? src : "",
    "/images/jnr-traits/base-bottoms.png",
    traitName === "shoes" ? src : "",
    traitName === "bottoms" ? src : "",
    "/images/jnr-traits/base-torso.png",
    traitName === "torso" ? src : "",
    "/images/jnr-traits/base-head.png",
    "/images/jnr-traits/base-eyes.png",
    traitName === "head" ? src : "",
    traitName === "lh" ? src : "",
    traitName === "rh" ? src : "",
  ];

  return (
    <Button
      className="w-full min-h-[100px] h-full relative"
      onClick={() => {
        onClick(src);
      }}
      active={active}
    >
      {imageRenderOrder.map((src, index) => {
        if (src === "") return null;

        return (
          <img
            key={index}
            src={src}
            className="!absolute w-full h-full object-contain"
            style={{ zIndex: index }}
          />
        );
      })}
    </Button>
  );
};

const FullTraitsImage: React.FC<{
  back: string;
  bottoms: string;
  head: string;
  lh: string;
  rh: string;
  shoes: string;
  torso: string;
}> = (props) => {
  const { back, bottoms, head, lh, rh, shoes, torso } = props;

  return (
    <FrameWithBackground
      variant="well"
      className="w-full h-full relative min-h-[300px] !bg-gradient-to-bl from-white/10 to-black/10"
    >
      <img
        src={TRAIT_IMAGES_BY_URL[back].url}
        className="!absolute w-full h-full object-contain"
      />
      <img
        src="/images/jnr-traits/base-bottoms.png"
        className="!absolute w-full h-full object-contain"
      />
      <img
        src={TRAIT_IMAGES_BY_URL[shoes].url}
        className="!absolute w-full h-full object-contain"
      />
      <img
        src={TRAIT_IMAGES_BY_URL[bottoms].url}
        className="!absolute w-full h-full object-contain"
      />
      <img
        src="/images/jnr-traits/base-torso.png"
        className="!absolute w-full h-full object-contain"
      />
      <img
        src={TRAIT_IMAGES_BY_URL[torso].url}
        className="!absolute w-full h-full object-contain"
      />
      <img
        src="/images/jnr-traits/base-head.png"
        className="!absolute w-full h-full object-contain"
      />
      <img
        src="/images/jnr-traits/base-eyes.png"
        className="!absolute w-full h-full object-contain"
      />
      <img
        src={TRAIT_IMAGES_BY_URL[head].url}
        className="!absolute w-full h-full object-contain"
      />
      <img
        src={TRAIT_IMAGES_BY_URL[lh].url}
        className="!absolute w-full h-full object-contain"
      />
      <img
        src={TRAIT_IMAGES_BY_URL[rh].url}
        className="!absolute w-full h-full object-contain"
      />
    </FrameWithBackground>
  );
};

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
      <div className="flex flex-col lg:flex-row-reverse w-full h-full gap-2">
        {/* <Frame variant="field" className="">
          <div className="absolute inset-0 z-0 flex flex-col justify-end opacity-100 mix-blend-overlay">
          <Marquee autoFill>
            <span className="ml-4 text-6xl">- PREVIEW ONLY - TOP SECRET</span>
          </Marquee>
        </div>
        </Frame> */}
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
        {/* <Frame
          variant="field"
          className="!w-[400px] min-w-[400px]  !flex-shrink-0"
        ></Frame> */}
      </div>
    </DraggableResizeableWindow>
  );
};

export default ProjectJnr;

import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Frame, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import styled from "styled-components";
import React, { Fragment, Suspense, useRef, useState } from "react";
import {
  CustomScrollArea,
  CustomStyledScrollView,
} from "components/CustomStyledScrollView";
import { JnrCanvasProvider } from "contexts/JnrCanvasContext";
import { Canvas } from "@react-three/fiber";
import { JnrBox } from "components/3D/Jnrbox";
import {
  Bounds,
  Center,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
  Stage,
  useProgress,
} from "@react-three/drei";
import Full2DJnr from "components/Jnrs/Full2DJnr";
import EquipPreview from "components/Jnrs/EquipPreview";
import FightPreview from "components/Jnrs/FightPreview";
import JnrTeaserMain from "components/JnrTeaser/JnrTeaserMain";

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

const CustomScrollAreaAsField = styled(CustomScrollArea)`
  background-color: ${({ theme }) => theme.canvas};
  color: ${({ theme }) => theme.canvasText};
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

export const CLASSES = [
  {
    className: "HISTORY",
    description:
      "Masters of the past, wielding ancient wisdom and strategies to outmaneuver their foes.",
    set: "Plague Doctor",
    setImage: "/images/about-us/jnr-7.webp",
    spells: [
      {
        type: "Offensive",
        name: "Ancient Strike",
        description:
          "Unleash a powerful attack infused with the strength of ancient warriors.",
      },
      {
        type: "Defensive",
        name: "Timeless Wisdom",
        description:
          "Gain insight from historical figures, boosting your defense and resistance.",
      },
    ],
  },
  {
    className: "ART",
    description:
      "Creators of beauty and chaos, using their artistic talents to inspire allies and confound enemies.",
    set: "Origami",
    setImage: "/images/about-us/jnr-9.webp",
    spells: [
      {
        type: "Offensive",
        name: "Artistic Flare",
        description:
          "Enhance your critical hit chance with a burst of artistic energy.",
      },
      {
        type: "Defensive",
        name: "Graffiti Shield",
        description: "Create a barrier of graffiti that absorbs damage.",
      },
    ],
  },
  {
    className: "MATH",
    description:
      "Strategists and thinkers, leveraging calculations and probability to gain the upper hand in any situation.",
    set: "PC",
    setImage: "/images/about-us/jnr-5.webp",
    spells: [
      {
        type: "Offensive",
        name: "Calculated Strike",
        description:
          "Perform a precise attack that deals extra damage based on your hit rating.",
      },
      {
        type: "Defensive",
        name: "Geometric Shield",
        description:
          "Create a geometric shield that absorbs a percentage of incoming damage.",
      },
    ],
  },
  {
    className: "BIOLOGY",
    description:
      "Masters of life and nature, utilizing biological knowledge to heal and harm with equal proficiency.",
    set: "Skeleton",
    setImage: "/images/about-us/jnr-6.webp",
    spells: [
      {
        type: "Offensive",
        name: "Venomous Bite",
        description: "Inflict a venomous bite that deals damage over time.",
      },
      {
        type: "Defensive",
        name: "Natural Regeneration",
        description: "Heal over time by harnessing the power of nature.",
      },
    ],
  },
  {
    className: "MUSIC",
    description:
      "Sonic virtuosos who use the power of sound to inspire allies and disorient enemies.",
    set: "Disco",
    setImage: "/images/about-us/jnr-4.webp",
    spells: [
      {
        type: "Offensive",
        name: "Harmonic Resonance",
        description: "Play a harmonic tune that boosts allies’ attack.",
      },
      {
        type: "Defensive",
        name: "Healing Melody",
        description: "Play a soothing melody that heals allies over time.",
      },
    ],
  },
  {
    className: "SPORT",
    description:
      "Athletic champions who use their physical prowess to dominate the battlefield.",
    set: "Baseball",
    setImage: "/images/about-us/jnr-3.webp",
    spells: [
      {
        type: "Offensive",
        name: "Power Strike",
        description: "Deliver a powerful strike that deals extra damage.",
      },
      {
        type: "Defensive",
        name: "Defensive Stance",
        description: "Adopt a defensive stance that reduces incoming damage.",
      },
    ],
  },
  {
    className: "PHYSICS",
    description:
      "Masters of the physical universe, manipulating the laws of nature to their advantage.",
    set: "Robot",
    setImage: "/images/about-us/jnr-2.webp",
    spells: [
      {
        type: "Offensive",
        name: "Gravity Well",
        description:
          "Create a gravity well that pulls opponents in, reducing their speed.",
      },
      {
        type: "Defensive",
        name: "Kinetic Shield",
        description: "Create a kinetic shield that absorbs damage.",
      },
    ],
  },
  {
    className: "CHEMISTRY",
    description:
      "Alchemists and scientists who use chemical reactions to devastate enemies and protect allies.",
    set: "Radioactive",
    setImage: "/images/about-us/jnr-1.webp",
    spells: [
      {
        type: "Offensive",
        name: "Acidic Spray",
        description: "Spray a corrosive acid that deals damage over time.",
      },
      {
        type: "Defensive",
        name: "Chemical Shield",
        description: "Create a chemical shield that absorbs damage.",
      },
    ],
  },
];

function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

const ProjectJnr: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const scroll = useRef(0);

  return (
    <JnrCanvasProvider>
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="Pocket Juniors - Preview"
        onClose={() => {
          closeWindow(WINDOW_IDS.PROJECT_JNR);
        }}
        windowsId={WINDOW_IDS.PROJECT_JNR}
        initialHeight="100%"
        initialWidth="100%"
        showMaximizeButton={false}
        resizable={false}
        headerIcon="/images/icons/pocket-juniors-50x50.png"
      >
        <JnrTeaserMain />
       
      </DraggableResizeableWindow>
    </JnrCanvasProvider>
  );
};

export default ProjectJnr;

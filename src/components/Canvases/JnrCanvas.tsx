import {
  AsciiRenderer,
  Bounds,
  Center,
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
  SpotLight,
  Stage,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";
import { PCFSoftShadowMap } from "three";
import { type PerspectiveCamera as ThreePerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { type PerspectiveCameraProps } from "@react-three/fiber";
import GlbModel from "components/3D/GlbModel";
import { Button, Frame } from "react95";
import { degToRad } from "three/src/math/MathUtils";
import styled from "styled-components";
import { useJnrCanvas } from "contexts/JnrCanvasContext";

const Camera = React.forwardRef<ThreePerspectiveCamera, PerspectiveCameraProps>(
  (props, ref) => {
    return (
      <>
        <PerspectiveCamera
          ref={ref}
          makeDefault
          attach={"camera"}
          fov={50}
          {...props}
        />

        <OrbitControls
          // enableZoom={false}
          makeDefault
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={1}
          panSpeed={0.5}
          keyPanSpeed={0.5}
          target={[0, 0.5, 0]}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2.7}
          enablePan={false}
          minDistance={6}
          maxDistance={11}
        />
      </>
    );
  }
);
Camera.displayName = "Camera";

const Lights = () => {
  return (
    <>
      <ambientLight intensity={1} color={"white"} />
      {/* <directionalLight
        intensity={2}
        position={[1, 10, 10]}
        color="blue"
        shadow-bias={-0.0001}
        shadow-camera-left={5}
        shadow-camera-right={-5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        // shadow-camera-near={1}
        // shadow-camera-far={10}
        castShadow
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      /> */}
      <directionalLight intensity={2} position={[0, 2, 5]} color="white" />
    </>
  );
};

const CanvasChildren = () => {
  return (
    <>
      <Camera />
      <Lights />
      {/* <Environment preset="sunset" /> */}
    </>
  );
};

interface JnrCanvasProps {
  traits: {
    back: string;
    bottoms: string;
    head: string;
    lh: string;
    rh: string;
    shoes: string;
    torso: string;
  };
}

export const CanvasWithBorders = styled(Canvas)`
  border-style: inset;
  border-bottom: 4px solid ${({ theme }) => theme.borderLight};
  border-right: 4px solid ${({ theme }) => theme.borderLight};
  border-top: 4px solid ${({ theme }) => theme.borderDark};
  border-left: 4px solid ${({ theme }) => theme.borderDark};
`;

const JnrCanvas: React.FC<JnrCanvasProps> = (props) => {
  const canvasRef = useRef<Canvas>(null);
  const { selectedTraits } = useJnrCanvas();

  return (
    <CanvasWithBorders
      ref={canvasRef}
      gl={{
        antialias: true,
        precision: "highp",
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
      }}
      flat
      shadows={{
        enabled: true,
        type: PCFSoftShadowMap,
      }}
      // resize={{ debounce: 0 }}
      className="bg-black min-h-[50%] transition-all"
    >
      <CanvasChildren />
      {/* <Center>
      <Bounds> */}
      <group>
        <GlbModel url={"/3d/base.glb"} />
        <GlbModel url={"/3d/base-eyes.glb"} />
        {Object.values(selectedTraits).map((trait) => (
          <GlbModel url={trait.glbUrl} />
        ))}
      </group>
      <GlbModel url={"/3d/stand.glb"} />
      <Grid
        renderOrder={-1}
        position={[0, -2.17, 0]}
        infiniteGrid
        cellSize={0.3}
        cellThickness={2}
        sectionSize={3.3}
        sectionThickness={0}
        sectionColor={"#63FF5F"}
        cellColor={"#63FF5F"}
        fadeDistance={16}
      />
    </CanvasWithBorders>
  );

  return (
    <div className="h-full flex flex-col w-full">
      {/* <Frame
        variant="field"
        className="!h-auto !flex lg:!hidden flex-nowrap overflow-x-auto !w-full py-2 px-2"
      >
        Scroll for more (SHIFT + scroll for horizontal scroll)
      </Frame>
      <Frame
        variant="well"
        className="!h-auto pt-2 pb-3 px-2 !flex flex-nowrap gap-2 overflow-x-auto !w-full no-scrollbar"
      >
        {Object.keys(TRAITS_BY_CLASS).map((nameOfClass) => (
          <Button
            key={nameOfClass}
            active={selectedClass === nameOfClass}
            onClick={() => {
              setSelectedClass(nameOfClass);
            }}
            className="!flex-shrink-0"
          >
            {nameOfClass} - {TRAIT_COLLECTION_NAME[nameOfClass]}
          </Button>
        ))}
      </Frame> */}
    </div>
  );
};

export default JnrCanvas;

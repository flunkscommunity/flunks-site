import {
  Bounds,
  Center,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Stage,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";
import { PCFSoftShadowMap } from "three";
import { type PerspectiveCamera as ThreePerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { type PerspectiveCameraProps } from "@react-three/fiber";
import GlbModel from "components/3D/GlbModel";
import { Button, Frame } from "react95";

const Camera = React.forwardRef<ThreePerspectiveCamera, PerspectiveCameraProps>(
  (props, ref) => {
    return (
      <>
        <PerspectiveCamera
          ref={ref}
          // makeDefault
          attach={"camera"}
          fov={20}
          {...props}
        />

        <OrbitControls
          // enableZoom={false}
          // makeDefault
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={1}
          panSpeed={0.5}
          keyPanSpeed={0.5}
          // target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          // maxAzimuthAngle={degToRad(80)}
          // minAzimuthAngle={degToRad(5)}
          enablePan={false}
          // minDistance={15}
        />
      </>
    );
  }
);
Camera.displayName = "Camera";

const Lights = () => {
  return (
    <>
      {/* <ambientLight intensity={0.2} color={"white"} castShadow  /> */}
      <directionalLight
        intensity={0}
        position={[0, 10, 5]}
        color="blue"
        shadow-bias={-0.0001}
        shadow-camera-left={2}
        shadow-camera-right={-2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        // shadow-camera-near={1}
        // shadow-camera-far={10}
        castShadow
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <directionalLight intensity={1} position={[0, 20, 20]} color="green" />
    </>
  );
};

const CanvasChildren = () => {
  return (
    <>
      <Camera />
      <Lights />
      <Environment preset="sunset" blur={1} />
    </>
  );
};

const TRAITS_BY_CLASS = {
  //origami
  art: {
    back: "/3d/ORIGAMI/BACK.ART.ORIGAMI.glb",
    bottoms: "/3d/ORIGAMI/BOTTOMS.ART.ORIGAMI.glb",
    head: "/3d/ORIGAMI/HEAD.ART.ORIGAMI.glb",
    lh: "/3d/ORIGAMI/LH.ART.ORIGAMI.glb",
    rh: "/3d/ORIGAMI/RH.ART.ORIGAMI.glb",
    shoes: "/3d/ORIGAMI/SHOES.ART.ORIGAMI.glb",
    torso: "/3d/ORIGAMI/TORSO.ART.ORIGAMI.glb",
  },
  // skeleton
  biology: {
    back: "/3d/SKELETON/BACK.BIOLOGY.SKELETON.glb",
    bottoms: "/3d/SKELETON/BOTTOMS.BIOLOGY.SKELETON.glb",
    head: "/3d/SKELETON/HEAD.BIOLOGY.SKELETON.glb",
    lh: "/3d/SKELETON/LH.BIOLOGY.SKELETON.glb",
    rh: "/3d/SKELETON/RH.BIOLOGY.SKELETON.glb",
    shoes: "/3d/SKELETON/SHOES.BIOLOGY.SKELETON.glb",
    torso: "/3d/SKELETON/TORSO.BIOLOGY.SKELETON.glb",
  },
  // radioactive
  chemistry: {
    back: "/3d/RADIOACTIVE/BACK.CHEMISTRY.RADIOACTIVE.glb",
    bottoms: "/3d/RADIOACTIVE/BOTTOMS.CHEMISTRY.RADIOACTIVE.glb",
    head: "/3d/RADIOACTIVE/HEAD.CHEMISTRY.RADIOACTIVE.glb",
    lh: "/3d/RADIOACTIVE/LH.CHEMISTRY.RADIOACTIVE.glb",
    rh: "/3d/RADIOACTIVE/RH.CHEMISTRY.RADIOACTIVE.glb",
    shoes: "/3d/RADIOACTIVE/SHOES.CHEMISTRY.RADIOACTIVE.glb",
    torso: "/3d/RADIOACTIVE/TORSO.CHEMISTRY.RADIOACTIVE.glb",
  },
  // plague doctor
  history: {
    back: "/3d/PLAGUE-DOCTOR/BACK.HISTORY.PLAGUE DOCTOR.glb",
    bottoms: "/3d/PLAGUE-DOCTOR/BOTTOMS.HISTORY.PLAGUE DOCTOR.glb",
    head: "/3d/PLAGUE-DOCTOR/HEAD.HISTORY.PLAGUE DOCTOR.glb",
    lh: "/3d/PLAGUE-DOCTOR/LH.HISTORY.PLAGUE DOCTOR.glb",
    rh: "/3d/PLAGUE-DOCTOR/RH.HISTORY.PLAGUE DOCTOR.glb",
    shoes: "/3d/PLAGUE-DOCTOR/SHOES.HISTORY.PLAGUE DOCTOR.glb",
    torso: "/3d/PLAGUE-DOCTOR/TORSO.HISTORY.PLAGUE DOCTOR.glb",
  },
  // casino
  maths: {
    back: "/3d/CASINO/BACK.MATHS.CASINO.glb",
    bottoms: "/3d/CASINO/BOTTOMS.MATHS.CASINO.glb",
    head: "/3d/CASINO/HEAD.MATHS.CASINO.glb",
    lh: "/3d/CASINO/LH.MATHS.CASINO.glb",
    rh: "/3d/CASINO/RH.MATHS.CASINO.glb",
    shoes: "/3d/CASINO/SHOES.MATHS.CASINO.glb",
    torso: "/3d/CASINO/TORSO.MATHS.CASINO.glb",
  },
  // barbershop
  music: {
    back: "/3d/BARBERSHOP/BACK.MUSIC.BARBERSHOP.glb",
    bottoms: "/3d/BARBERSHOP/BOTTOMS.MUSIC.BARBERSHOP.glb",
    head: "/3d/BARBERSHOP/HEAD.MUSIC.BARBERSHOP.glb",
    lh: "/3d/BARBERSHOP/LH.MUSIC.BARBERSHOP.glb",
    rh: "/3d/BARBERSHOP/RH.MUSIC.BARBERSHOP.glb",
    shoes: "/3d/BARBERSHOP/SHOES.MUSIC.BARBERSHOP.glb",
    torso: "/3d/BARBERSHOP/TORSO.MUSIC.BARBERSHOP.glb",
  },
  // robot
  physics: {
    back: "/3d/ROBOT/BACK.PHYSICS.ROBOT.glb",
    bottoms: "/3d/ROBOT/BOTTOMS.PHYSICS.ROBOT.glb",
    head: "/3d/ROBOT/HEAD.PHYSICS.ROBOT.glb",
    lh: "/3d/ROBOT/LH.PHYSICS.ROBOT.glb",
    rh: "/3d/ROBOT/RH.PHYSICS.ROBOT.glb",
    shoes: "/3d/ROBOT/SHOES.PHYSICS.ROBOT.glb",
    torso: "/3d/ROBOT/TORSO.PHYSICS.ROBOT.glb",
  },
  // baseball
  sport: {
    back: "/3d/BASEBALL/BACK.SPORT.BASEBALL.glb",
    bottoms: "/3d/BASEBALL/BOTTOMS.SPORT.BASEBALL.glb",
    head: "/3d/BASEBALL/HEAD.SPORT.BASEBALL.glb",
    lh: "/3d/BASEBALL/LH.SPORT.BASEBALL.glb",
    rh: "/3d/BASEBALL/RH.SPORT.BASEBALL.glb",
    shoes: "/3d/BASEBALL/SHOES.SPORT.BASEBALL.glb",
    torso: "/3d/BASEBALL/TORSO.SPORT.BASEBALL.glb",
  },
};

const TRAIT_COLLECTION_NAME = {
  art: "Origami",
  biology: "Skeleton",
  chemistry: "Radioactive",
  history: "Plague Doctor",
  maths: "Casino",
  music: "Barbershop",
  physics: "Robot",
  sport: "Baseball",
};

const JnrCanvas = () => {
  const canvasRef = useRef<Canvas>(null);
  const [selectedClass, setSelectedClass] = React.useState("biology");

  return (
    <div className="h-full flex flex-col w-full">
      <Frame
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
      </Frame>
      <Canvas
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
        className="w-full h-full"
      >
        <CanvasChildren />
        <Center>
          <Bounds>
            <group>
              <GlbModel url={"/3d/base.glb"} />
              <GlbModel url={"/3d/base-eyes.glb"} />
              {Object.keys(TRAITS_BY_CLASS[selectedClass]).map((trait) => (
                <GlbModel url={TRAITS_BY_CLASS[selectedClass][trait]} />
              ))}
            </group>
          </Bounds>
        </Center>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.1} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default JnrCanvas;

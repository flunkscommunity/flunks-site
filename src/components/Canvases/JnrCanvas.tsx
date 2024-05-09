import {
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
          // target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2.7}
          // maxAzimuthAngle={degToRad(80)}
          // minAzimuthAngle={degToRad(5)}
          enablePan={false}
          minDistance={9}
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
      {/* <ambientLight intensity={1} color={"white"}  /> */}
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
      {/* <directionalLight intensity={20} position={[0, 20, 20]} color="green" /> */}
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

export const TRAITS_BY_CLASS = {
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
  mathematics: {
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

export const TRAIT_COLLECTION_NAME = {
  art: "Origami",
  biology: "Skeleton",
  chemistry: "Radioactive",
  history: "Plague Doctor",
  mathematics: "Casino",
  music: "Barbershop",
  physics: "Robot",
  sport: "Baseball",
};

export const TRAIT_IMAGES_BY_CLASS = {
  art: {
    back: "/images/jnr-traits/origami-back.png",
    bottoms: "/images/jnr-traits/origami-bottoms.png",
    head: "/images/jnr-traits/origami-head.png",
    rh: "/images/jnr-traits/origami-lh.png",
    lh: "/images/jnr-traits/origami-rh.png",
    shoes: "/images/jnr-traits/origami-shoes.png",
    torso: "/images/jnr-traits/origami-torso.png",
  },
  biology: {
    back: "/images/jnr-traits/skeleton-back.png",
    bottoms: "/images/jnr-traits/skeleton-bottoms.png",
    head: "/images/jnr-traits/skeleton-head.png",
    rh: "/images/jnr-traits/skeleton-lh.png",
    lh: "/images/jnr-traits/skeleton-rh.png",
    shoes: "/images/jnr-traits/skeleton-shoes.png",
    torso: "/images/jnr-traits/skeleton-torso.png",
  },
  chemistry: {
    back: "/images/jnr-traits/radioactive-back.png",
    bottoms: "/images/jnr-traits/radioactive-bottoms.png",
    head: "/images/jnr-traits/radioactive-head.png",
    rh: "/images/jnr-traits/radioactive-lh.png",
    lh: "/images/jnr-traits/radioactive-rh.png",
    shoes: "/images/jnr-traits/radioactive-shoes.png",
    torso: "/images/jnr-traits/radioactive-torso.png",
  },
  history: {
    back: "/images/jnr-traits/plague-doctor-back.png",
    bottoms: "/images/jnr-traits/plague-doctor-bottoms.png",
    head: "/images/jnr-traits/plague-doctor-head.png",
    rh: "/images/jnr-traits/plague-doctor-lh.png",
    lh: "/images/jnr-traits/plague-doctor-rh.png",
    shoes: "/images/jnr-traits/plague-doctor-shoes.png",
    torso: "/images/jnr-traits/plague-doctor-torso.png",
  },
  mathematics: {
    back: "/images/jnr-traits/casino-back.png",
    bottoms: "/images/jnr-traits/casino-bottoms.png",
    head: "/images/jnr-traits/casino-head.png",
    rh: "/images/jnr-traits/casino-lh.png",
    lh: "/images/jnr-traits/casino-rh.png",
    shoes: "/images/jnr-traits/casino-shoes.png",
    torso: "/images/jnr-traits/casino-torso.png",
  },
  music: {
    back: "/images/jnr-traits/barbershop-back.png",
    bottoms: "/images/jnr-traits/barbershop-bottoms.png",
    head: "/images/jnr-traits/barbershop-head.png",
    rh: "/images/jnr-traits/barbershop-lh.png",
    lh: "/images/jnr-traits/barbershop-rh.png",
    shoes: "/images/jnr-traits/barbershop-shoes.png",
    torso: "/images/jnr-traits/barbershop-torso.png",
  },
  physics: {
    back: "/images/jnr-traits/robot-back.png",
    bottoms: "/images/jnr-traits/robot-bottoms.png",
    head: "/images/jnr-traits/robot-head.png",
    rh: "/images/jnr-traits/robot-lh.png",
    lh: "/images/jnr-traits/robot-rh.png",
    shoes: "/images/jnr-traits/robot-shoes.png",
    torso: "/images/jnr-traits/robot-torso.png",
  },
  sport: {
    back: "/images/jnr-traits/baseball-back.png",
    bottoms: "/images/jnr-traits/baseball-bottoms.png",
    head: "/images/jnr-traits/baseball-head.png",
    rh: "/images/jnr-traits/baseball-lh.png",
    lh: "/images/jnr-traits/baseball-rh.png",
    shoes: "/images/jnr-traits/baseball-shoes.png",
    torso: "/images/jnr-traits/baseball-torso.png",
  },
};

export const TRAIT_IMAGES_BY_URL = {
  [TRAITS_BY_CLASS.art.back]: {
    url: TRAIT_IMAGES_BY_CLASS.art.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.art.back,
  },
  [TRAITS_BY_CLASS.art.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.art.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.art.bottoms,
  },
  [TRAITS_BY_CLASS.art.head]: {
    url: TRAIT_IMAGES_BY_CLASS.art.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.art.head,
  },
  [TRAITS_BY_CLASS.art.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.art.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.art.lh,
  },
  [TRAITS_BY_CLASS.art.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.art.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.art.rh,
  },
  [TRAITS_BY_CLASS.art.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.art.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.art.shoes,
  },
  [TRAITS_BY_CLASS.art.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.art.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.art.torso,
  },
  [TRAITS_BY_CLASS.biology.back]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.biology.back,
  },
  [TRAITS_BY_CLASS.biology.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.biology.bottoms,
  },
  [TRAITS_BY_CLASS.biology.head]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.biology.head,
  },
  [TRAITS_BY_CLASS.biology.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.biology.lh,
  },
  [TRAITS_BY_CLASS.biology.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.biology.rh,
  },
  [TRAITS_BY_CLASS.biology.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.biology.shoes,
  },
  [TRAITS_BY_CLASS.biology.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.biology.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.biology.torso,
  },
  [TRAITS_BY_CLASS.chemistry.back]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.chemistry.back,
  },
  [TRAITS_BY_CLASS.chemistry.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.chemistry.bottoms,
  },
  [TRAITS_BY_CLASS.chemistry.head]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.chemistry.head,
  },
  [TRAITS_BY_CLASS.chemistry.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.chemistry.lh,
  },
  [TRAITS_BY_CLASS.chemistry.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.chemistry.rh,
  },
  [TRAITS_BY_CLASS.chemistry.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.chemistry.shoes,
  },
  [TRAITS_BY_CLASS.chemistry.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.chemistry.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.chemistry.torso,
  },
  [TRAITS_BY_CLASS.history.back]: {
    url: TRAIT_IMAGES_BY_CLASS.history.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.history.back,
  },
  [TRAITS_BY_CLASS.history.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.history.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.history.bottoms,
  },
  [TRAITS_BY_CLASS.history.head]: {
    url: TRAIT_IMAGES_BY_CLASS.history.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.history.head,
  },
  [TRAITS_BY_CLASS.history.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.history.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.history.lh,
  },
  [TRAITS_BY_CLASS.history.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.history.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.history.rh,
  },
  [TRAITS_BY_CLASS.history.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.history.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.history.shoes,
  },
  [TRAITS_BY_CLASS.history.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.history.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.history.torso,
  },
  [TRAITS_BY_CLASS.mathematics.back]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.mathematics.back,
  },
  [TRAITS_BY_CLASS.mathematics.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.mathematics.bottoms,
  },
  [TRAITS_BY_CLASS.mathematics.head]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.mathematics.head,
  },
  [TRAITS_BY_CLASS.mathematics.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.mathematics.lh,
  },
  [TRAITS_BY_CLASS.mathematics.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.mathematics.rh,
  },
  [TRAITS_BY_CLASS.mathematics.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.mathematics.shoes,
  },
  [TRAITS_BY_CLASS.mathematics.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.mathematics.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.mathematics.torso,
  },
  [TRAITS_BY_CLASS.music.back]: {
    url: TRAIT_IMAGES_BY_CLASS.music.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.music.back,
  },
  [TRAITS_BY_CLASS.music.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.music.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.music.bottoms,
  },
  [TRAITS_BY_CLASS.music.head]: {
    url: TRAIT_IMAGES_BY_CLASS.music.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.music.head,
  },
  [TRAITS_BY_CLASS.music.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.music.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.music.lh,
  },
  [TRAITS_BY_CLASS.music.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.music.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.music.rh,
  },
  [TRAITS_BY_CLASS.music.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.music.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.music.shoes,
  },
  [TRAITS_BY_CLASS.music.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.music.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.music.torso,
  },
  [TRAITS_BY_CLASS.physics.back]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.physics.back,
  },
  [TRAITS_BY_CLASS.physics.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.physics.bottoms,
  },
  [TRAITS_BY_CLASS.physics.head]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.physics.head,
  },
  [TRAITS_BY_CLASS.physics.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.physics.lh,
  },
  [TRAITS_BY_CLASS.physics.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.physics.rh,
  },
  [TRAITS_BY_CLASS.physics.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.physics.shoes,
  },
  [TRAITS_BY_CLASS.physics.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.physics.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.physics.torso,
  },
  [TRAITS_BY_CLASS.sport.back]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.back,
    trait: "back",
    glbUrl: TRAITS_BY_CLASS.sport.back,
  },
  [TRAITS_BY_CLASS.sport.bottoms]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.bottoms,
    trait: "bottoms",
    glbUrl: TRAITS_BY_CLASS.sport.bottoms,
  },
  [TRAITS_BY_CLASS.sport.head]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.head,
    trait: "head",
    glbUrl: TRAITS_BY_CLASS.sport.head,
  },
  [TRAITS_BY_CLASS.sport.lh]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.lh,
    trait: "lh",
    glbUrl: TRAITS_BY_CLASS.sport.lh,
  },
  [TRAITS_BY_CLASS.sport.rh]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.rh,
    trait: "rh",
    glbUrl: TRAITS_BY_CLASS.sport.rh,
  },
  [TRAITS_BY_CLASS.sport.shoes]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.shoes,
    trait: "shoes",
    glbUrl: TRAITS_BY_CLASS.sport.shoes,
  },
  [TRAITS_BY_CLASS.sport.torso]: {
    url: TRAIT_IMAGES_BY_CLASS.sport.torso,
    trait: "torso",
    glbUrl: TRAITS_BY_CLASS.sport.torso,
  },
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

const JnrCanvas: React.FC<JnrCanvasProps> = (props) => {
  const canvasRef = useRef<Canvas>(null);
  const [selectedClass, setSelectedClass] = React.useState("biology");

  return (
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
      className="bg-black min-h-[50%]"
    >
      <CanvasChildren />
      {/* <Center>
      <Bounds> */}
      <group>
        <GlbModel url={"/3d/base.glb"} />
        <GlbModel url={"/3d/base-eyes.glb"} />
        {Object.values(props.traits).map((trait) => (
          <GlbModel url={trait} />
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
        fadeDistance={12}
      />
    </Canvas>
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

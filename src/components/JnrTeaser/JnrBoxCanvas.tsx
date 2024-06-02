import {
  Bounds,
  Center,
  Cloud,
  Clouds,
  Environment,
  Fisheye,
  PerspectiveCamera,
  Sky,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Glitch,
  Noise,
  Scanline,
  Sepia,
  Vignette,
} from "@react-three/postprocessing";
import { JnrBox } from "components/3D/Jnrbox";
import { BlendFunction, GlitchMode } from "postprocessing";
import { MutableRefObject, Suspense, useRef } from "react";
import { useTheme } from "styled-components";
import { MathUtils, MeshBasicMaterial, MeshStandardMaterial } from "three";

interface Props {
  scroll: MutableRefObject<number>;
}

const PrettyThings = ({ scroll }) => {
  const cloudsRef = useRef(null);
  const theme = useTheme();

  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.position.y = MathUtils.lerp(
        cloudsRef.current.position.y,
        -scroll.current * 7 - 7,
        0.05
      );
    }
  });

  return (
    <>
      <Clouds
        ref={cloudsRef}
        material={MeshStandardMaterial}
        position={[0, -7, 5]}
      >
        <Cloud
          seed={3}
          segments={30}
          bounds={[30, 2, 2]}
          volume={12}
          color="white"
          speed={0.3}
        />
        <Cloud
          seed={1}
          scale={2}
          volume={5}
          color="lightblue"
          fade={100}
          speed={0.3}
        />
      </Clouds>
      <Stars />
      <Sky sunPosition={[5, 5, 0]} />
    </>
  );
};

const JnrBoxCanvas = ({ scroll }) => {
  return (
    <Canvas
      gl={{
        antialias: true,
        precision: "highp",
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
      }}
      shadows
      flat
      className="pointer-events-none"
    >
      <PerspectiveCamera makeDefault attach={"camera"} position={[0, 0, 10]} />
      <ambientLight intensity={1.5} />
      <Suspense>
        <Center>
          <Bounds margin={1.5}>
            <JnrBox scroll={scroll} />
          </Bounds>
        </Center>
        <PrettyThings scroll={scroll} />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
};

export default JnrBoxCanvas;

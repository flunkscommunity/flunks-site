import {
  Bounds,
  Center,
  Cloud,
  Clouds,
  Environment,
  Fisheye,
  PerspectiveCamera,
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
import { MathUtils, MeshBasicMaterial, MeshStandardMaterial } from "three";

interface Props {
  scroll: MutableRefObject<number>;
}

const PrettyThings = ({ scroll }) => {
  const cloudsRef = useRef(null);

  useFrame(() => {
    if (cloudsRef.current) {
      /*
        THREE.MathUtils.lerp(
      actions["Animation"].time,
      actions["Animation"].getClip().duration * props.scroll.current,
      0.05
    );
      */

      // cloudsRef.current.position.y = -scroll.current * 2 - 5;
      // cloudsRef.current.position.z = -scroll.current * 9 + 6;

      cloudsRef.current.position.y = MathUtils.lerp(
        cloudsRef.current.position.y,
        -scroll.current * 2 - 5,
        0.05
      );

      cloudsRef.current.position.z = MathUtils.lerp(
        cloudsRef.current.position.z,
        -scroll.current * 9 + 6,
        0.05
      );
    }
  });

  return (
    <Clouds
      ref={cloudsRef}
      material={MeshStandardMaterial}
      position={[0, -7, 3]}
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
        color="cyan"
        fade={100}
        speed={0.3}
      />
    </Clouds>
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
        <Stars />
        <Environment
          background
          backgroundRotation={[0, 10, 0]}
          backgroundBlurriness={0.15}
          files={[
            "/envs/sky/px.jpg",
            "/envs/sky/nx.jpg",
            "/envs/sky/py.jpg",
            "/envs/sky/ny.jpg",
            "/envs/sky/pz.jpg",
            "/envs/sky/nz.jpg",
          ]}
          environmentIntensity={1}
        />
      </Suspense>
    </Canvas>
  );
};

export default JnrBoxCanvas;

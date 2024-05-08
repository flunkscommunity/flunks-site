import { type PrimitiveProps, type ThreeElements } from "@react-three/fiber";
import { forwardRef, Suspense, useEffect, useMemo } from "react";
import { Loader, useGLTF } from "@react-three/drei";

interface GlbModelProps extends PrimitiveProps {
  url: string;
}

const GlbModel = forwardRef<ThreeElements["primitive"], GlbModelProps>(
  (props, ref) => {
    const { object, url, ...rest } = props;
    const { scene } = useGLTF(url);

    // Memoing to allow duplicates of the model to be rendered:
    // See: https://github.com/pmndrs/react-three-fiber/issues/245
    // const copiedScene = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
      if(!scene) return;

      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [scene]);

    return (
      <Suspense fallback={<Loader />}>
        <primitive ref={ref} object={scene} dispose={null} {...rest} />
      </Suspense>
    );
  }
);

GlbModel.displayName = "GlbModel";
export default GlbModel;

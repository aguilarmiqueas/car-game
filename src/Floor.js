import { MeshReflectorMaterial } from "@react-three/drei";
import { useControls } from "leva";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { useEffect, useRef } from "react";
import { useGlobalStore } from "./useStore";
import * as THREE from "three";

export function Floor() {
  const [normalMap, roughMap] = useLoader(TextureLoader, [
    "/textures/floor_tiles_06_nor_gl_1k.jpg",
    "/textures/floor_tiles_06_rough_1k.jpg",
  ]);
  const floor = useRef();
  const setFloor = useGlobalStore((state) => state.setFloor);
  setFloor(floor);

  useEffect(() => {
    [normalMap, roughMap].forEach((t) => {
      (t.wrapS = THREE.RepeatWrapping),
        (t.wrapT = THREE.RepeatWrapping),
        t.repeat.set(250, 250);
    });
  }, [normalMap, roughMap]);

  // console.log(normalMap, roughMap);
  let {
    dithering,
    roughness,
    mixBlur,
    mixStrength,
    resolution,
    mirror,
    depthScale,
    minDepthThreshold,
    maxDepthThreshold,
    depthToBlurRatioBias,
    distortion,
    debug,
    reflectorOffset,
    blurX,
    blurY,
  } = useControls({
    dithering: true,
    roughness: 0.75,
    mixBlur: 40,
    mixStrength: 80,
    resolution: 1024,
    mirror: 0,
    depthScale: 0.2,
    minDepthThreshold: 0.9,
    maxDepthThreshold: 1,
    depthToBlurRatioBias: 0.25,
    distortion: 1,
    debug: 0,
    reflectorOffset: 0,
    blurX: 2000,
    blurY: 300,
  });
  return (
    <>
      <mesh ref={floor} rotation-x={-Math.PI / 2} position-y={-1} receiveShadow>
        <planeBufferGeometry args={[4096, 4096, 2, 2]} />
        <MeshReflectorMaterial
          normalMap={normalMap}
          roughnessMap={roughMap}
          color={"#171717"}
          dithering={dithering}
          blur={[blurX, blurY]}
          mixBlur={mixBlur}
          mixStrength={mixStrength}
          resolution={resolution}
          mirror={mirror}
          depthScale={depthScale}
          minDepthThreshold={minDepthThreshold}
          maxDepthThreshold={maxDepthThreshold}
          depthToBlurRatioBias={depthToBlurRatioBias}
          distortion={distortion}
          debug={debug}
          reflectorOffset={reflectorOffset}
        />
      </mesh>
      <mesh fog={false} position={[4000, 0, 0]} frustumCulled={false}>
        <sphereBufferGeometry args={[500]} />
        <meshBasicMaterial fog={false} color={"#fa065b"} />
      </mesh>
      <mesh fog={false} position={[-4000, 0, 0]} frustumCulled={false}>
        <sphereBufferGeometry args={[500]} />
        <meshBasicMaterial fog={false} color={"#eb1173"} />
      </mesh>
    </>
  );
}

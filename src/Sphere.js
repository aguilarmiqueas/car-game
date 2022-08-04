import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import { TextureLoader } from "three/src/loaders/TextureLoader";

import * as THREE from "three";

export function Sphere() {
  const [metalMap, normalMap, roughnessMap, aoMap] = useLoader(TextureLoader, [
    "/textures/metal_plate_metal_1k.jpg",
    "/textures/metal_plate_nor_gl_1k.jpg",
    "/textures/metal_plate_rough_1k.jpg",
    "/textures/metal_plate_ao_1k.jpg",
  ]);
  useEffect(() => {
    [metalMap, normalMap, roughnessMap, aoMap].forEach((t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(0.6, 0.6);
    });
  }, [metalMap, normalMap, roughnessMap, aoMap]);
  const x = Math.random() * 2000 - 1000;
  const y = 0;
  const z = Math.random() * 2000 - 1000;
  return (
    <mesh
      position={[x, y, z]}
      rotation={[Math.random(), Math.random(), Math.random()]}
      receiveShadow
      castShadow
    >
      <sphereBufferGeometry />
      <meshStandardMaterial
        color="#4e4e4e"
        metalnessMap={metalMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        metalness={1}
      />
    </mesh>
  );
}

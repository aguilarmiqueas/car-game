import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { TextureLoader } from "three/src/loaders/TextureLoader";

import * as THREE from "three";

export function Spheres({ count = 100, temp = new THREE.Object3D() }) {
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

  const ref = useRef();

  let x, y, z;

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      x = Math.random() * 2000 - 1000;
      y = 0;
      z = Math.random() * 2000 - 1000;
      temp.position.set(x, 0, z);
      temp.rotation.set(Math.random(), Math.random(), Math.random());
      temp.updateMatrix();
      ref.current.setMatrixAt(i, temp.matrix);
      ref.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereBufferGeometry />
      <meshStandardMaterial
        color="#4e4e4e"
        metalnessMap={metalMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        metalness={1}
        fog={true}
      />
    </instancedMesh>
  );
}

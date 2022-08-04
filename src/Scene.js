import { Floor } from "./Floor";
import { Sphere } from "./Sphere";
import { Car } from "./Car";
import { Path } from "./Path";
import { Suspense } from "react";

export function Scene({ controls }) {
  let spheres = new Array(250).fill("").map((e, i) => (
    <Suspense fallback={null} key={i}>
      <Sphere />
    </Suspense>
  ));

  return (
    <>
      {spheres}
      <ambientLight intensity={0.01} color="white" />
      <Suspense fallback={null}>
        <Floor />
      </Suspense>
      <Car />
      {/* <mesh position-y={-0}>
        <planeBufferGeometry args={[4, 7]} />
        <meshStandardMaterial
          fog={false}
          emissive="#FFFFFF"
          side={THREE.DoubleSide}
        />
      </mesh> */}
      <Path />
    </>
  );
}

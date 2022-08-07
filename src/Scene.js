import { Floor } from "./Floor";
import { Sphere } from "./Sphere";
import { Car } from "./Car";
import { Path } from "./Path";
import { Suspense } from "react";
import { Spheres } from "./Spheres";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function Scene({ controls }) {
  return (
    <>
      {/* {spheres} */}
      <Spheres count={500} />
      <ambientLight intensity={0.04} color="white" />
      <Suspense fallback={null}>
        <Floor />
      </Suspense>
      <Car />
      <Path />
    </>
  );
}

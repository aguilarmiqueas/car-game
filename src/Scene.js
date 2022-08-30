import { Floor } from "./Floor";
import { Car } from "./Car";
import { Path } from "./Path";
import { Suspense } from "react";
import { Spheres } from "./Spheres";

export function Scene({ controls }) {
  return (
    <>
      {/* {spheres} */}
      <Spheres count={500} />
      <ambientLight intensity={1.2} color="white" />
      <Suspense fallback={null}>
        <Floor />
        <Car />
      </Suspense>
      <Path />
    </>
  );
}

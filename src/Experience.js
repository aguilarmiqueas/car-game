import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { useGlobalStore } from "./useStore";
import { Stats } from "@react-three/drei";
import { Postprocessing } from "./Postprocessing";
import { Loader } from "./Loader";
import { HUD } from "./HUD";
import { Leva } from "leva";
import { Song } from "./Song";
import { useRef, useEffect, useState } from "react";
let deviceOrientation = [0, 0, 0];
let first = false;
export function Experience() {
  let loaded = useGlobalStore((state) => state.loaded);

  return (
    <>
      <Loader loaded={loaded} />
      <HUD />
      <div className="webgl">
        <Canvas shadows camera={{ far: 50000 }} dpr={[1, 1]}>
          {/* Scene */}
          <fog attach="fog" args={["#020202", 0.1, 400]} />
          <color attach="background" args={["#010101"]} />
          <Scene />

          {/* Post-processing*/}
          <Postprocessing />

          {/* FPS Counter */}
          {/* <Stats /> */}
          <Leva hidden />
        </Canvas>
      </div>
    </>
  );
}

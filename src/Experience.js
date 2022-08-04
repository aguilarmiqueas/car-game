import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

import { Stats } from "@react-three/drei";
import { Postprocessing } from "./Postprocessing";
import { Leva } from "leva";

export function Experience() {
  // useFrame(() => {
  //   if (shader.current) {
  //     console.log(shader.current);
  //   }
  // });

  return (
    <Canvas shadows>
      {/* Scene */}
      <fog attach="fog" args={["#020202", 0.1, 220]} />
      <color attach="background" args={["#010101"]} />
      <Scene />

      {/* Post-processing*/}
      <Postprocessing />

      {/* FPS Counter */}
      {/* <Stats hidden /> */}
      <Leva hidden />
    </Canvas>
  );
}

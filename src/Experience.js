import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

import { Stats, AdaptiveDpr } from "@react-three/drei";
import { Postprocessing } from "./Postprocessing";
import { Leva } from "leva";

export function Experience() {
  return (
    <Canvas camera={{ far: 50000 }} dpr={[1, 1]}>
      {/* Scene */}
      <fog attach="fog" args={["#020202", 0.1, 400]} />
      <color attach="background" args={["#010101"]} />
      <Scene />

      {/* Post-processing*/}
      <Postprocessing />

      {/* FPS Counter */}
      <Stats />
      <Leva hidden />
    </Canvas>
  );
}

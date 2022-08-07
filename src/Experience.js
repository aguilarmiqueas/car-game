import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Scene } from "./Scene";

import { Stats, AdaptiveDpr } from "@react-three/drei";
import { Postprocessing } from "./Postprocessing";
import { Leva } from "leva";
import { useRef } from "react";
import { useGlobalStore } from "./useStore";

let deviceOrientation = [0, 0, 0];
let first = false;
export function Experience() {
  let setDeviceOrientationFlag = useGlobalStore(
    (state) => state.setDeviceOrientationFlag
  );
  let setDeviceOrientation = useGlobalStore(
    (state) => state.setDeviceOrientation
  );
  let setBdo = useGlobalStore((state) => state.setBdo);
  function handleClick() {
    DeviceOrientationEvent.requestPermission().then((response) => {
      if (response == "granted") {
        setDeviceOrientationFlag(true);

        window.addEventListener("deviceorientation", (e) => {
          if (first) {
            setBdo([e.alpha, e.beta, e.gamma]);
            first = true;
          }
          deviceOrientation[0] = e.alpha;
          deviceOrientation[1] = e.beta;
          deviceOrientation[2] = e.gamma;
          setDeviceOrientation(deviceOrientation);
        });
      }
    });
  }
  return (
    <>
      <button onClick={handleClick}>h</button>
      <Canvas shadows camera={{ far: 50000 }} dpr={[1, 1]}>
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
    </>
  );
}

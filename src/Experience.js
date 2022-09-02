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
  let button = useRef();
  let setButton = useGlobalStore((state) => state.setButton);
  let setDeviceOrientationFlag = useGlobalStore(
    (state) => state.setDeviceOrientationFlag
  );
  let setDeviceOrientation = useGlobalStore(
    (state) => state.setDeviceOrientation
  );
  let setBdo = useGlobalStore((state) => state.setBdo);
  let loaded = useGlobalStore((state) => state.loaded);
  useEffect(() => {
    setButton(button);
  }, []);

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
      <Loader loaded={loaded} />
      <HUD />
      <Song loaded={loaded} />
      <button ref={button} onClick={handleClick}>
        0
      </button>
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
    </>
  );
}

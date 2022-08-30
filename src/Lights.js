import * as THREE from "three";
import { useGlobalStore } from "./useStore";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
export function Lights({ position, direction }) {
  let velRef = useRef(useGlobalStore.getState().vel);
  useEffect(
    () => useGlobalStore.subscribe((state) => (velRef.current = state.vel)),
    []
  );
  useFrame(() => {
    light1.current.intensity = 1 * (0.5 * Math.abs(velRef.current) + 1);
    light2.current.intensity = 1 * (0.5 * Math.abs(velRef.current) + 1);
  });
  let newDirection = direction
    .clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

  let positivePosition = position.clone().addScaledVector(newDirection, 6);
  let negativePosition = position.clone().addScaledVector(newDirection, -6);
  let light1 = useRef();
  let light2 = useRef();
  return (
    <>
      <pointLight
        ref={light1}
        position={[
          positivePosition.x,
          positivePosition.y + 14.5,
          positivePosition.z,
        ]}
        distance={0}
        decay={0}
        intensity={0.5}
        color={"#0db3fa"}
      />
      <pointLight
        ref={light2}
        position={[
          negativePosition.x,
          negativePosition.y + 14.5,
          negativePosition.z,
        ]}
        distance={0}
        decay={0}
        intensity={0.5}
        color={"#ff25b6"}
      />
    </>
  );
}

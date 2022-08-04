import * as THREE from "three";
import { useGlobalStore } from "./useStore";

export function Lights({ position, direction }) {
  let vel = useGlobalStore((state) => state.vel);
  let newDirection = direction
    .clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

  let positivePosition = position.clone().addScaledVector(newDirection, 6);
  let negativePosition = position.clone().addScaledVector(newDirection, -6);

  return (
    <>
      <pointLight
        position={[
          positivePosition.x,
          positivePosition.y + 1.5,
          positivePosition.z,
        ]}
        distance={0}
        decay={0}
        intensity={2 * (3 * Math.abs(vel) + 1)}
        color={"#0db3fa"}
      />
      <pointLight
        position={[
          negativePosition.x,
          negativePosition.y + 1.5,
          negativePosition.z,
        ]}
        distance={0}
        decay={0}
        intensity={2 * (3 * Math.abs(vel) + 1)}
        color={"#ff25b6"}
      />
    </>
  );
}

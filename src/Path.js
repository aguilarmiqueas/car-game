import * as THREE from "three";
import { Lights } from "./Lights";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useGlobalStore } from "./useStore";
import { useThree } from "@react-three/fiber";
export function Path() {
  const ref = useRef();
  const setPath = useGlobalStore((state) => state.setPath);
  setPath(ref);
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(
        Math.random() * 2000 - 1000,
        0.1,
        Math.random() * 2000 - 1000
      ),
      new THREE.Vector3(
        Math.random() * 2000 - 1000,
        0.1,
        Math.random() * 2000 - 1000
      ),
      new THREE.Vector3(
        Math.random() * 2000 - 1000,
        0.1,
        Math.random() * 2000 - 1000
      ),
      new THREE.Vector3(
        Math.random() * 2000 - 1000,
        0.1,
        Math.random() * 2000 - 1000
      ),
      new THREE.Vector3(
        Math.random() * 2000 - 1000,
        0.1,
        Math.random() * 2000 - 1000
      ),
    ],

    true,
    "chordal",
    0.25
  );

  const points = curve.getPoints(1000);
  useLayoutEffect(() => {
    ref.current.geometry.setFromPoints(points);
  }, []);

  const lightPoints = curve.getPoints(4);
  const lights = lightPoints.map((e, i) => {
    let tangent = curve.getTangentAt(i / 4).normalize();

    return (
      <>
        <Lights position={e} direction={tangent} key={i} />
      </>
    );
  });

  let arr = useRef([]);
  const planes = curve.getPoints(20).map((e, i) => {
    let tangent = curve.getTangentAt(i / 20).normalize();
    let rotation = new THREE.Vector3(0, 1, 0);

    let dot = rotation.dot(tangent);
    dot = Math.acos(dot / tangent.length());

    rotation.applyAxisAngle(new THREE.Vector3(0, 1, 0), dot);
    return (
      <>
        <mesh
          position={[e.x, e.y - 0.75, e.z]}
          // rotation={[0, 2, 0]}
          rotation={[rotation.x, rotation.y, rotation.z]}
          key={i}
          ref={(el) => (arr.current[i] = el)}
        >
          <planeBufferGeometry args={[8, 0.5]} />
          <meshStandardMaterial
            fog={true}
            emissive="#FFFFFF"
            side={THREE.DoubleSide}
          />
        </mesh>
      </>
    );
  });
  let setBoosters = useGlobalStore((store) => store.setBoosters);
  setBoosters(arr.current);
  return (
    <>
      <line ref={ref} frustumCulled={false}>
        <bufferGeometry />
        <lineBasicMaterial fog={true} color="#fb59fb" />
      </line>
      {lights}
      {planes}
    </>
  );
}

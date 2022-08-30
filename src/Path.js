import * as THREE from "three";
import { Lights } from "./Lights";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useGlobalStore } from "./useStore";
import { useThree } from "@react-three/fiber";
import { CatmullRomLine } from "@react-three/drei";
export function Path() {
  const ref = useRef();
  const setPath = useGlobalStore((state) => state.setPath);
  setPath(ref);
  const pointsArray = [
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(
      Math.random() * 1500 - 750,
      0.1,
      Math.random() * 1500 - 750
    ),
    new THREE.Vector3(
      Math.random() * 1500 - 750,
      0.1,
      Math.random() * 1500 - 750
    ),
    new THREE.Vector3(
      Math.random() * 1500 - 750,
      0.1,
      Math.random() * 1500 - 750
    ),
    new THREE.Vector3(
      Math.random() * 1500 - 750,
      0.1,
      Math.random() * 1500 - 750
    ),
  ];
  const curve = new THREE.CatmullRomCurve3(pointsArray, true, "chordal", 0.25);

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
    let tangent = curve.getTangent(i / 20).normalize();
    let rotation = new THREE.Vector3(0, 1, 0);

    let dot = rotation.dot(tangent);
    dot = Math.acos(dot / tangent.length());

    rotation.applyAxisAngle(new THREE.Vector3(0, 1, 0), dot);
    return (
      <>
        <mesh
          position={[e.x, e.y - 1.1, e.z]}
          ref={(el) => (arr.current[i] = el)}
        >
          <boxBufferGeometry args={[2, 0.025, 2]} />
          <meshStandardMaterial
            fog={true}
            emissive="#2cfff8"
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
      <line ref={ref} frustumCulled={false} position={[0, -1, 0]}>
        <bufferGeometry />
        <lineBasicMaterial fog={true} color="#fb59fb" />
      </line>
      {lights}
      {planes}
    </>
  );
}

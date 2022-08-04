import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { useGlobalStore } from "./useStore";

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};
let targetRotation = 0;

export function Car({ controls }) {
  const carScene = useLoader(GLTFLoader, "/models/scene.gltf");
  //   carScene.scenes[0].children[0].position.y += 90;

  carScene.scene.traverse((object) => {
    if (object.isMesh) {
      object.material.envMapIntensity = 10;
    }
  });
  const car = useRef();
  const setCar = useGlobalStore((state) => state.setCar);
  setCar(car.current);
  const setVel = useGlobalStore((state) => state.setVel);

  const dir = new THREE.Vector3();
  const { camera, size, clock } = useThree();
  let aspectRatio = size.width / size.height;

  let currentRotation = 0;
  let vel = 0;
  let boostFactor = 1;

  let path = useGlobalStore((state) => state.path);
  let raycaster = new THREE.Raycaster();
  raycaster.params.Line.threshold = 2;
  const raycasterDirection = new THREE.Vector3(0, -1, 0);
  let controlsTarget = new THREE.Vector3();
  let intersect, intersects;
  let targetPos;
  let cameraFactor;

  let boosters = useGlobalStore((state) => state.boosters).map((e) => e);
  useFrame(() => {
    targetPos = car.current.position.clone();
    targetPos.y += 1;
    raycaster.set(targetPos, raycasterDirection);
    intersects = raycaster.intersectObjects(boosters);

    if (path.current) {
      intersect = raycaster.intersectObjects([path.current]);
    }

    if (intersect.length) {
      boostFactor = THREE.MathUtils.lerp(boostFactor, 2, 0.00035);
    } else {
      boostFactor = THREE.MathUtils.lerp(boostFactor, 1, 0.05);
    }

    if (car.current) {
      car.current.position.set(
        car.current.position.x,
        car.current.position.y,
        car.current.position.z
      );
    }
    car.current.getWorldDirection(dir);
    car.current.position.addScaledVector(dir, vel * boostFactor);
    if (keys.w) {
      vel = THREE.MathUtils.lerp(vel, -1, 0.005);
      setVel(vel);
    } else if (keys.s) {
      vel = THREE.MathUtils.lerp(vel, +1, 0.005);
      setVel(vel);
    } else {
      vel = THREE.MathUtils.lerp(vel, 0, 0.1);
      setVel(vel);
    }

    if (vel > 0.03 || vel < -0.03) {
      if (keys.a) {
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.3
        );
        car.current.rotateY(currentRotation * -Math.sign(vel));
      } else if (keys.d) {
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.3
        );
        car.current.rotateY(currentRotation * -Math.sign(vel));
      }
    }
    cameraFactor =
      Math.abs(vel) * boostFactor * (aspectRatio > 1 ? 1 : 0.1) + 1;
    camera.position.set(
      car.current.position.x,
      car.current.position.y +
        (aspectRatio > 1 ? cameraFactor * 1.25 : cameraFactor * 4),
      car.current.position.z
    );

    camera.position.addScaledVector(
      dir,
      aspectRatio > 1 ? 7 * cameraFactor : cameraFactor * 12
    );
    controlsTarget.set(
      car.current.position.x,
      car.current.position.y,
      car.current.position.z
    );
    camera.lookAt(controlsTarget);
  });

  return (
    <Suspense fallback={null}>
      <primitive
        position={[0, 0.375, 0]}
        scale={[0.01, 0.01, 0.01]}
        object={carScene.scene}
        ref={car}
      />
      {/* <Model ref={car} position={[0, 0.375, 0]} scale={[0.01, 0.01, 0.01]} /> */}
    </Suspense>
  );
}
let currentTarget = null;
let clicked = false;
window.addEventListener("pointerdown", (e) => {
  let x = (e.clientX / window.innerWidth) * 2 - 1;
  let y = -(e.clientY / window.innerHeight) * 2 + 1;
  currentTarget = { x, y };
  clicked = true;
  keys.w = true;
});
window.addEventListener("pointermove", (e) => {
  if (clicked) {
    let x = (e.clientX / window.innerWidth) * 2 - 1;
    let y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (y < currentTarget.y - 0.1) {
      keys.w = false;
      keys.s = true;
    } else {
      keys.s = false;
      keys.w = true;
    }

    if (x < currentTarget.x - 0.05) {
      keys.a = true;
      targetRotation = 0.04 * Math.abs(x - currentTarget.x);
    } else {
      keys.a = false;
    }

    if (x > currentTarget.x + 0.05) {
      keys.d = true;
      targetRotation = -0.04 * Math.abs(x - currentTarget.x);
    } else {
      keys.d = false;
    }
  }
});
window.addEventListener("pointerup", (e) => {
  currentTarget = null;
  clicked = false;
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
});
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w = true;
      break;
    case "a":
      keys.a = true;
      targetRotation = +0.02;
      break;
    case "s":
      keys.s = true;
      break;
    case "d":
      keys.d = true;
      targetRotation = -0.02;
      break;
  }
});
window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w = false;
      break;
    case "a":
      keys.a = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "d":
      keys.d = false;
      break;
  }
});

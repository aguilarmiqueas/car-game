import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGlobalStore } from "./useStore";
import { Html } from "@react-three/drei";

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
};
let targetRotation = 0;
let drifting = false;
let currentDir = new THREE.Vector3();
let vel = 0;

export function Car({ controls }) {
  // Model loading
  const carScene = useLoader(GLTFLoader, "/models/scene.gltf");
  carScene.scene.traverse((object) => {
    if (object.isMesh) {
      object.material.envMapIntensity = 10;
      object.material.color = new THREE.Color("#da7575");
    }
  });

  // Setup
  const { camera, size } = useThree();
  let aspectRatio = size.width / size.height;

  let raycaster = new THREE.Raycaster();
  const raycasterDirection = new THREE.Vector3(0, -1, 0);
  raycaster.params.Line.threshold = 2;
  raycaster.params.Mesh.threshold = 100;

  const car = useRef();
  const setCar = useGlobalStore((state) => state.setCar);
  const setVel = useGlobalStore((state) => state.setVel);
  setCar(car.current);

  let path = useGlobalStore((state) => state.path);
  let boosters = useGlobalStore((state) => state.boosters).map((e) => e);

  let dir = new THREE.Vector3();
  let currentRotation = 0;
  let boostFactor = 1;
  let boxBoostFactor = 1;
  let boxBoosting = false;
  let lastBoxBoostTime = 0;
  let currentTime = 0;
  let driftTimer = 0;

  let controlsTarget = new THREE.Vector3();
  let intersect, intersects;
  let targetPos;
  let cameraFactor;

  let previousDir = new THREE.Vector3(0, 0, 0);
  let previousVel = 0;

  useFrame(({ clock, performance }, delta) => {
    performance.regress();
    console.log(performance.current);

    // Raycasting
    targetPos = car.current.position.clone();
    targetPos.y += 1;
    raycaster.set(targetPos, raycasterDirection);

    // Line boosting
    if (path.current) {
      intersect = raycaster.intersectObjects([path.current]);
    }
    if (intersect.length) {
      boostFactor = THREE.MathUtils.lerp(boostFactor, 2, 0.00035);
    } else {
      boostFactor = THREE.MathUtils.lerp(boostFactor, 1, 0.05);
    }

    // Box boosting
    intersects = raycaster.intersectObjects(boosters);
    if (intersects.length) {
      boxBoosting = true;
      lastBoxBoostTime = clock.getElapsedTime();
    }

    if (boxBoosting) {
      currentTime = clock.getElapsedTime();
      if (currentTime - lastBoxBoostTime < 2.5) {
        boxBoostFactor = THREE.MathUtils.lerp(boxBoostFactor, 1.75, 0.05);
      } else if (currentTime - lastBoxBoostTime < 5) {
        boxBoostFactor = THREE.MathUtils.lerp(boxBoostFactor, 1, 0.02);
      } else {
        boxBoosting = false;
        boxBoostFactor = 1;
      }
    }

    // Car movement
    if (!keys.space) {
      if (drifting) {
        drifting = false;
        driftTimer = clock.getElapsedTime();
      }
      if (clock.getElapsedTime() - driftTimer < 0.6) {
        vel = THREE.MathUtils.lerp(vel, previousVel * 0.5, 0.03);
        car.current.getWorldDirection(currentDir);

        dir.set(
          THREE.MathUtils.lerp(dir.x, currentDir.x, 0.09),
          THREE.MathUtils.lerp(dir.y, currentDir.y, 0.01),
          THREE.MathUtils.lerp(dir.z, currentDir.z, 0.09)
        );
        car.current.position.addScaledVector(
          dir,
          vel * boostFactor * boxBoostFactor * delta * 60
        );
      } else {
        car.current.getWorldDirection(currentDir);
        dir.set(
          THREE.MathUtils.lerp(dir.x, currentDir.x, 0.15),
          THREE.MathUtils.lerp(dir.y, currentDir.y, 0.15),
          THREE.MathUtils.lerp(dir.z, currentDir.z, 0.15)
        );
        car.current.position.addScaledVector(
          dir,
          vel * boostFactor * boxBoostFactor * delta * 60
        );
      }
    } else {
      if (!drifting) {
        drifting = true;
        previousDir.set(dir.x, dir.y, dir.z);
        previousVel = vel;
      }
      vel = THREE.MathUtils.lerp(vel, previousVel * 0.5, 0.03);
      car.current.getWorldDirection(currentDir);

      dir.set(
        THREE.MathUtils.lerp(dir.x, currentDir.x, 0.0175),
        THREE.MathUtils.lerp(dir.y, currentDir.y, 0.01),
        THREE.MathUtils.lerp(dir.z, currentDir.z, 0.0175)
      );
      car.current.position.addScaledVector(
        dir,
        vel * boostFactor * boxBoostFactor * delta * 60
      );
    }

    // Velocity handling
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

    // Rotation
    if (vel > 0.03 || vel < -0.03) {
      if (keys.a) {
        targetRotation = !drifting ? 0.02 : 0.03;
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.3
        );
        car.current.rotateY(currentRotation * -Math.sign(vel));
      } else if (keys.d) {
        targetRotation = !drifting ? -0.02 : -0.03;
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.3
        );
        car.current.rotateY(currentRotation * -Math.sign(vel));
      }
    }

    // Camera update
    cameraFactor = Math.max(
      1,
      Math.abs(vel) * boxBoostFactor * boostFactor * (aspectRatio > 1 ? 0 : 0.1)
    );

    camera.position.set(
      THREE.MathUtils.lerp(camera.position.x, car.current.position.x, 0.05),
      car.current.position.y +
        (aspectRatio > 1 ? (Math.abs(vel) + 1) * 2.5 : cameraFactor * 4),
      THREE.MathUtils.lerp(camera.position.z, car.current.position.z, 0.05)
    );

    // Camera displacement based on velocity
    camera.position.addScaledVector(
      dir,
      aspectRatio > 1 ? 0.33 * cameraFactor : cameraFactor * 2 * 0.33
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

// Mouse controls handling
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

    if (y < currentTarget.y - 0.3) {
      keys.w = false;
      keys.s = true;
    } else {
      keys.s = false;
      keys.w = true;
    }

    if (x < currentTarget.x - 0.15) {
      keys.a = true;
      targetRotation = 0.005 * Math.abs(x - currentTarget.x);
    } else {
      keys.a = false;
    }

    if (x > currentTarget.x + 0.15) {
      keys.d = true;
      targetRotation = -0.005 * Math.abs(x - currentTarget.x);
    } else {
      keys.d = false;
    }
  }
});
window.addEventListener("pointerup", () => {
  currentTarget = null;
  clicked = false;
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
});

// Keyboard controls handling
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w = true;
      break;
    case "a":
      targetRotation = !drifting ? 0.01 : 0.03;
      keys.a = true;
      break;
    case "s":
      keys.s = true;
      break;
    case "d":
      targetRotation = !drifting ? -0.01 : -0.03;
      keys.d = true;
      break;
    case " ":
      keys.space = true;
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
    case " ":
      keys.space = false;
      break;
  }
});

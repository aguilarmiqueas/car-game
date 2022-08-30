import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGlobalStore } from "./useStore";
import { Trail } from "@react-three/drei";

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
  shift: false,
};
let targetRotation = 0;
let drifting = false;
let currentDir = new THREE.Vector3();
let vel = 0;

export function Car() {
  // Model loading
  const setLoaded = useGlobalStore((state) => state.setLoaded);
  const carScene = useLoader(GLTFLoader, "/models/scene.gltf");
  useEffect(() => {
    setLoaded(true);
  }, carScene);
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
  const setCarPos = useGlobalStore((state) => state.setCarPos);
  setCar(car.current);

  const HUDRef = useGlobalStore((state) => state.HUDRef);

  let path = useGlobalStore((state) => state.path);
  let boosters = useGlobalStore((state) => state.boosters).map((e) => e);

  let dir = new THREE.Vector3();
  let currentRotation = 0;
  let boostFactor = 1;
  let manualBoostFactor = 1;
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

  let carWheel = useRef();
  let carWheel2 = useRef();
  let trail = useRef();
  let trail2 = useRef();
  let group = useRef();

  let deviceOrientationEnabled = useGlobalStore(
    (state) => state.deviceOrientationEnabled
  );
  let deviceOrientationRef = useRef(
    useGlobalStore.getState().deviceOrientation
  );
  let bdo = useGlobalStore((state) => state.bdo);
  let deviceOrientationConverted = 0;
  useEffect(
    () =>
      useGlobalStore.subscribe(
        (state) => (deviceOrientationRef.current = state.deviceOrientation)
      ),
    []
  );
  let boostProgress = 0;
  let currentlyHittingPath = false;
  let notHittingPath = true;
  let timeSinceHitPath = 0;
  let currentLap = 0;
  let previousLap = 0;
  let bestLap = 0;
  useFrame(({ clock, performance }, delta) => {
    performance.regress();
    // console.log(HUDRef.current);
    // Raycasting
    targetPos = group.current.position.clone();
    targetPos.y += 1;
    raycaster.set(targetPos, raycasterDirection);

    // Path intersection
    if (path.current) {
      intersect = raycaster.intersectObjects([path.current]);
    }
    if (intersect.length) {
      currentlyHittingPath = true;
      notHittingPath = false;

      if (Math.abs(vel) > 0.2) {
        if (boostFactor < 10) {
          boostProgress += delta;
        }
        boostFactor = THREE.MathUtils.lerp(boostFactor, 2, 0.00035);

        HUDRef.current.children[1].children[0].innerHTML = `00:${Math.floor(
          currentLap
        )
          .toString()
          .padStart(2, "0")}:${((currentLap % 1) * 100)
          .toString()
          .slice(0, 2)}`;
        currentLap += delta;
      }
    } else {
      if (currentlyHittingPath) {
        currentlyHittingPath = false;
        timeSinceHitPath = clock.getElapsedTime();
      }
      if (clock.getElapsedTime() - timeSinceHitPath < 2) {
        HUDRef.current.children[1].children[0].innerHTML = `00:${Math.floor(
          currentLap
        )
          .toString()
          .padStart(2, "0")}:${((bestLap % 1).toFixed(2) * 100)
          .toString()
          .slice(0, 2)
          .padStart(2, "0")}`;
        currentLap += delta;
      } else {
        if (!notHittingPath) {
          bestLap = Math.max(bestLap, currentLap);
          previousLap = currentLap;
          HUDRef.current.children[1].children[1].innerHTML = `00:${Math.floor(
            bestLap
          )
            .toString()
            .padStart(2, "0")}:${((bestLap % 1) * 100).toString().slice(0, 2)}`;
          currentLap = 0;
          notHittingPath = true;
        }
        if (boostProgress > 0) {
          boostProgress -= delta;
        }
        boostFactor = THREE.MathUtils.lerp(boostFactor, 1, 0.05);
      }
    }

    // Box boosting
    intersects = raycaster.intersectObjects(boosters);
    if (intersects.length) {
      boxBoosting = true;
      lastBoxBoostTime = clock.getElapsedTime();
    }

    if (boxBoosting) {
      trail.current.decay = 10;
      currentTime = clock.getElapsedTime();
      if (currentTime - lastBoxBoostTime < 2.5) {
        boxBoostFactor = THREE.MathUtils.lerp(boxBoostFactor, 1.75, 0.05);
      } else if (currentTime - lastBoxBoostTime < 5) {
        boxBoostFactor = THREE.MathUtils.lerp(boxBoostFactor, 1, 0.02);
      } else {
        boxBoosting = false;
        trail.current.decay = 100;
        group.current.length = 1;
        boxBoostFactor = 1;
      }
    }

    if (keys.shift) {
      if (boostProgress > 0) {
        boostProgress -= delta * 2;
        manualBoostFactor = THREE.MathUtils.lerp(manualBoostFactor, 2.5, 0.05);
      } else {
        manualBoostFactor = THREE.MathUtils.lerp(manualBoostFactor, 1, 0.1);
      }
    } else {
      manualBoostFactor = THREE.MathUtils.lerp(manualBoostFactor, 1, 0.1);
    }
    // console.log(HUDRef.current.children[0].children[1]);
    HUDRef.current.children[0].children[1].children[0].style.width = `${THREE.MathUtils.lerp(
      Number(
        HUDRef.current.children[0].children[1].children[0].style.width.slice(
          0,
          -1
        )
      ),
      boostProgress * 10,
      0.1
    )}%
    `;

    // Car movement
    if (!keys.space) {
      if (drifting) {
        drifting = false;
        driftTimer = clock.getElapsedTime();
      }
      if (clock.getElapsedTime() - driftTimer < 1.5) {
        vel = THREE.MathUtils.lerp(vel, previousVel * 0.5, 0.03);
        group.current.getWorldDirection(currentDir);

        dir.set(
          THREE.MathUtils.lerp(dir.x, currentDir.x, 0.03),
          THREE.MathUtils.lerp(dir.y, currentDir.y, 0.03),
          THREE.MathUtils.lerp(dir.z, currentDir.z, 0.03)
        );
        group.current.position.addScaledVector(
          dir,
          vel * boostFactor * boxBoostFactor * manualBoostFactor * delta * 60
        );
      } else {
        group.current.getWorldDirection(currentDir);
        dir.set(
          THREE.MathUtils.lerp(dir.x, currentDir.x, 0.15),
          THREE.MathUtils.lerp(dir.y, currentDir.y, 0.15),
          THREE.MathUtils.lerp(dir.z, currentDir.z, 0.15)
        );
        group.current.position.addScaledVector(
          dir,
          vel * boostFactor * manualBoostFactor * boxBoostFactor * delta * 60
        );
      }
    } else {
      if (!drifting) {
        drifting = true;
        previousDir.set(dir.x, dir.y, dir.z);
        previousVel = vel;
      }
      vel = THREE.MathUtils.lerp(vel, previousVel * 0.9, 0.03);
      group.current.getWorldDirection(currentDir);

      dir.set(
        THREE.MathUtils.lerp(dir.x, currentDir.x, 0.01),
        THREE.MathUtils.lerp(dir.y, currentDir.y, 0.01),
        THREE.MathUtils.lerp(dir.z, currentDir.z, 0.01)
      );
      group.current.position.addScaledVector(
        dir,
        vel * boostFactor * manualBoostFactor * boxBoostFactor * delta * 60
      );
    }

    carWheel.current.position.set(
      group.current.position.x + 1,
      group.current.position.y - 1,
      group.current.position.z
    );
    carWheel2.current.position.set(
      group.current.position.x - 1,
      group.current.position.y - 1,
      group.current.position.z
    );
    setCarPos([
      group.current.position.x,
      group.current.position.y,
      group.current.position.z,
    ]);

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
    if (Math.abs(vel) > 0.03 && !deviceOrientationEnabled) {
      if (keys.a) {
        targetRotation = !drifting ? 0.02 : 0.03;
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.3
        );
        group.current.rotateY(currentRotation * -Math.sign(vel));
      } else if (keys.d) {
        targetRotation = !drifting ? -0.02 : -0.03;
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.3
        );
        group.current.rotateY(currentRotation * -Math.sign(vel));
      }
    } else if (Math.abs(vel) > 0.03 && deviceOrientationEnabled) {
      deviceOrientationConverted = deviceOrientationRef.current[0] - bdo[0];
      if (deviceOrientationConverted > 180) {
        deviceOrientationConverted -= 360;
      }
      targetRotation = deviceOrientationConverted * 0.00025;
      currentRotation = THREE.MathUtils.lerp(
        currentRotation,
        targetRotation,
        0.3
      );
      group.current.rotateY(currentRotation);
    }

    // Camera update
    cameraFactor = Math.max(
      1,
      Math.abs(vel) * boxBoostFactor * boostFactor * (aspectRatio > 1 ? 0 : 0.1)
    );

    camera.position.set(
      THREE.MathUtils.lerp(camera.position.x, group.current.position.x, 0.05),
      group.current.position.y +
        (aspectRatio > 1 ? (Math.abs(vel) + 1) * 2.5 : cameraFactor * 4),
      THREE.MathUtils.lerp(camera.position.z, group.current.position.z, 0.05)
    );

    // Camera displacement based on velocity
    camera.position.addScaledVector(
      dir,
      aspectRatio > 1 ? 0.33 * cameraFactor : cameraFactor * 2 * 0.33
    );
    controlsTarget.set(
      group.current.position.x,
      group.current.position.y,
      group.current.position.z
    );

    camera.lookAt(controlsTarget);
    // trail.current.visible = false;
  });

  return (
    <Suspense fallback={null}>
      <Trail
        ref={trail}
        width={0.7} // Width of the line
        color={"#5df2fc"} // Color of the line
        length={40} // Length of the line
        decay={36} // How fast the wline fades away
        local={false} // Wether to use the target's world or local positions
        stride={0} // Min distance between previous and current point
        interval={0.5} // Number of frames to wait before next calculation
        target={carWheel} // Optional target. This object will produce the trail.
        attenuation={(width) => width * 3}
        visible={false}
      ></Trail>
      <Trail
        ref={trail2}
        width={0.7} // Width of the line
        color={"#5df2fc"} // Color of the line
        length={40} // Length of the line
        decay={36} // How fast the wline fades away
        local={false} // Wether to use the target's world or local positions
        stride={0} // Min distance between previous and current point
        interval={0.5} // Number of frames to wait before next calculation
        target={carWheel2} // Optional target. This object will produce the trail.
        attenuation={(width) => width * 3}
        visible={false}
      ></Trail>
      <group ref={group}>
        <primitive
          position={[0, 0.375, 0]}
          scale={[0.01, 0.01, 0.01]}
          object={carScene.scene}
          ref={car}
        />
      </group>

      <object3D ref={carWheel}></object3D>
      <object3D ref={carWheel2}></object3D>

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
  switch (e.key.toLowerCase()) {
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
    case "shift":
      keys.shift = true;
      break;
  }
});
window.addEventListener("keyup", (e) => {
  switch (e.key.toLowerCase()) {
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
    case "shift":
      keys.shift = false;
      break;
  }
});

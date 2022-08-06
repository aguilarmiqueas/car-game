import {
  EffectComposer,
  Noise,
  Vignette,
  Bloom,
  DepthOfField,
} from "@react-three/postprocessing";
import {
  BlurPass,
  Resizer,
  KernelSize,
} from "@react-three/postprocessing/node_modules/postprocessing";
import { CustomPass } from "./CustomPass";
import { useControls } from "leva";
import { useGlobalStore } from "./useStore";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function Postprocessing() {
  let shader = useRef();
  // GUI Controls for DoF post
  let { focusDistance, focalLength, bokehScale } = useControls({
    focusDistance: 1,
    focalLength: 0.2,
    bokehScale: 0.6,
  });
  let velRef = useRef(useGlobalStore.getState().vel);
  useEffect(
    () => useGlobalStore.subscribe((state) => (velRef.current = state.vel)),
    []
  );

  useFrame(() => {
    shader.current.uniforms.get("a").value = Math.abs(velRef.current);
  });

  return (
    <EffectComposer>
      <CustomPass ref={shader} />
      <DepthOfField
        focusDistance={focusDistance}
        focalLength={focalLength}
        bokehScale={bokehScale}
        height={480}
      />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.07} darkness={1} />
    </EffectComposer>
  );
}

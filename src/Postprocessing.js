import {
  EffectComposer,
  Noise,
  Vignette,
  Bloom,
  DepthOfField,
  SSR,
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

  const { enabled, ...props } = useControls({
    enabled: true,
    temporalResolve: true,
    STRETCH_MISSED_RAYS: true,
    USE_MRT: true,
    USE_NORMALMAP: true,
    USE_ROUGHNESSMAP: true,
    ENABLE_JITTERING: true,
    ENABLE_BLUR: true,
    temporalResolveMix: { value: 0.9, min: 0, max: 1 },
    temporalResolveCorrectionMix: { value: 0.43, min: 0, max: 1 },
    maxSamples: { value: 0, min: 0, max: 1 },
    resolutionScale: { value: 1, min: 0, max: 1 },
    blurMix: { value: 0.2, min: 0, max: 1 },
    blurExponent: { value: 10, min: 0, max: 20 },
    blurKernelSize: { value: 1, min: 0, max: 10 },
    rayStep: { value: 0.5, min: 0, max: 1 },
    intensity: { value: 1.85, min: 0, max: 5 },
    maxRoughness: { value: 1, min: 0, max: 1 },
    jitter: { value: 0.3, min: 0, max: 5 },
    jitterSpread: { value: 0.25, min: 0, max: 1 },
    jitterRough: { value: 0.1, min: 0, max: 1 },
    roughnessFadeOut: { value: 1, min: 0, max: 1 },
    rayFadeOut: { value: 0, min: 0, max: 1 },
    MAX_STEPS: { value: 20, min: 0, max: 20 },
    NUM_BINARY_SEARCH_STEPS: { value: 6, min: 0, max: 10 },
    maxDepthDifference: { value: 10, min: 0, max: 10 },
    maxDepth: { value: 1, min: 0, max: 1 },
    thickness: { value: 10, min: 0, max: 10 },
    ior: { value: 1.45, min: 0, max: 2 },
  });

  useFrame(() => {
    shader.current.uniforms.get("a").value = Math.abs(velRef.current);
  });

  return (
    <EffectComposer>
      <CustomPass ref={shader} />
      <SSR {...props} />
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

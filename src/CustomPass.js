/* eslint-disable react/display-name */
import React, { forwardRef, useMemo } from "react";
import { Uniform } from "three";
import { Effect } from "@react-three/postprocessing/node_modules/postprocessing";
import { useGlobalStore } from "./useStore";
import { useFrame } from "@react-three/fiber";
const fragmentShader = `
uniform float a;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // BASIC SETUP
    vec4 col = inputColor;
    vec2 center = vec2(0.5); 
    float distance = distance(vUv, center) * 2.;
    vec4 finalCol;

    // CHROM ABERRATION
    vec2 mixR = mix(vUv, vUv + 0.002, distance);
    vec2 mixB = mix(vUv, vUv - 0.002, distance);
    float r = texture2D(inputBuffer, mixR).r;
    float b = texture2D(inputBuffer, mixB).b;
    finalCol = vec4(r, inputColor.g, b, 1.0);

    // SCANLINES
    vec4 scanLines = vec4(vec3(sin(vUv.y * (resolution.y / 1.) * 1.58)), 1.);
    finalCol += scanLines * .009;

    // ASPECT RATIO
    if (vUv.y > 0.9 + (0.1 * a)) finalCol.rgb *= 0.;
    if (vUv.y < 0.1 - (0.1 * a)) finalCol.rgb *= 0.;

    outputColor = finalCol;
    outputColor.rgb *= max(a, 0.9);
}
void mainUv(inout vec2 uv) {
    uv = vUv;
}

`;

let _uParam, a;

// Effect implementation
class MyCustomEffectImpl extends Effect {
  constructor({ param = 0.1 } = {}) {
    super("MyCustomEffect", fragmentShader, {
      uniforms: new Map([
        ["param", new Uniform(param)],
        ["a", new Uniform(a)],
      ]),
    });

    _uParam = param;
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get("param").value = _uParam;
    // this.uniforms.get("a").value = "1";
  }
}

// Effect component
export const CustomPass = forwardRef(({ param, a }, ref) => {
  const effect = useMemo(() => new MyCustomEffectImpl(param), [param]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

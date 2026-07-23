"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { seededRandom } from "@/lib/utils";

/**
 * The hero's three-dimensional layer: a slowly rotating point cloud that leans
 * toward the pointer.
 *
 * Kept deliberately cheap — one BufferGeometry, one PointsMaterial, no lights,
 * no post-processing. It is loaded with `ssr: false` and only when the visitor
 * has a fine pointer and hasn't asked for reduced motion (see `hero.tsx`), so
 * it never costs anything on mobile.
 */

const PARTICLE_COUNT = 1400;
const FIELD_RADIUS = 4.2;

function Points() {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Seeded so the layout is identical run to run; positions never change after
  // the first frame, so this stays out of the render loop entirely.
  const { positions, colors } = useMemo(() => {
    const random = seededRandom("hero-field");
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const violet = new THREE.Color("#7c3aed");
    const cyan = new THREE.Color("#06b6d4");
    const amber = new THREE.Color("#f59e0b");
    const mixed = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Sample inside a sphere with a cube-root radius so density stays even
      // instead of clustering at the centre.
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const radius = FIELD_RADIUS * Math.cbrt(random());

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Mostly the two brand colours, with amber as a rare accent.
      const roll = random();
      if (roll > 0.94) mixed.copy(amber);
      else mixed.copy(violet).lerp(cyan, random());

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    // Constant slow drift, plus a small lean toward the pointer. `delta`-scaled
    // so the motion is frame-rate independent.
    points.rotation.y += delta * 0.045;

    const targetTilt = (state.pointer.y * viewport.height) / 14;

    points.rotation.x = THREE.MathUtils.damp(points.rotation.x, targetTilt, 2, delta);
    points.position.x = THREE.MathUtils.damp(points.position.x, state.pointer.x * 0.3, 2, delta);
    points.position.y = THREE.MathUtils.damp(points.position.y, state.pointer.y * 0.2, 2, delta);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <Canvas
      // `dpr` capped at 1.5: past that the point cloud costs more than it adds.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Points />
    </Canvas>
  );
}

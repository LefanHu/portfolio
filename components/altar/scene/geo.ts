// Low-poly geometry helpers for the altar scene.

import * as THREE from "three";

/** Deterministic pseudo-random in [0,1) from a seed. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x: number, y: number, z: number, seed: number) {
  // Coincident vertices (cylinder seams, cap rings) hash to the same value,
  // so jitter never tears the mesh open.
  // Math.round + 0 folds -0 into 0 so seam vertices really do match.
  const k = `${Math.round(x * 1000) + 0},${Math.round(y * 1000) + 0},${Math.round(z * 1000) + 0}`;
  let h = 2166136261 ^ seed;
  for (let i = 0; i < k.length; i++) {
    h = Math.imul(h ^ k.charCodeAt(i), 16777619);
  }
  return mulberry32(h)();
}

/**
 * Jitter every vertex by a hash of its position.
 * `flatTopY`: vertices at/above this y keep their y (keeps walkable tops flat).
 */
export function jitter(
  geo: THREE.BufferGeometry,
  amount: number,
  seed: number,
  opts: { flatTopY?: number; yAmount?: number } = {}
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const yAmount = opts.yAmount ?? amount;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const rx = hash3(x, y, z, seed) - 0.5;
    const ry = hash3(x, y, z, seed + 17) - 0.5;
    const rz = hash3(x, y, z, seed + 31) - 0.5;
    const keepY = opts.flatTopY !== undefined && y >= opts.flatTopY - 1e-4;
    pos.setXYZ(
      i,
      x + rx * amount * 2,
      keepY ? y : y + ry * yAmount * 2,
      z + rz * amount * 2
    );
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Floating-island rock body: flat top at y=0, bulging then tapering to a point. */
export function islandRockGeometry(radius: number, depth: number, seed: number, segments = 11) {
  const geo = new THREE.CylinderGeometry(radius, radius, depth, segments, 6, false);
  geo.translate(0, -depth / 2, 0);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.min(1, Math.max(0, 1 + y / depth)); // 1 at top, 0 at bottom
    const f = 0.04 + 0.96 * Math.pow(t, 0.55) * (1 - 0.12 * Math.sin(t * Math.PI));
    pos.setX(i, pos.getX(i) * f);
    pos.setZ(i, pos.getZ(i) * f);
  }
  return jitter(geo, 0.32, seed, { flatTopY: 0, yAmount: 0.22 });
}

export function rockChunkGeometry(size: number, seed: number) {
  const geo = new THREE.DodecahedronGeometry(size, 0);
  return jitter(geo, size * 0.22, seed);
}

/** Banded vertex colours for the hanging rock: warm earth near the top, cooler stone below. */
export function strataColors(geo: THREE.BufferGeometry, top: string, mid: string, bottom: string) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const cTop = new THREE.Color(top);
  const cMid = new THREE.Color(mid);
  const cBot = new THREE.Color(bottom);
  const c = new THREE.Color();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - box.min.y) / (box.max.y - box.min.y); // 0 bottom, 1 top
    if (t > 0.55) c.copy(cMid).lerp(cTop, (t - 0.55) / 0.45);
    else c.copy(cBot).lerp(cMid, t / 0.55);
    const v = 0.9 + hash3(pos.getX(i), pos.getY(i), pos.getZ(i), 777) * 0.2;
    colors[i * 3] = c.r * v;
    colors[i * 3 + 1] = c.g * v;
    colors[i * 3 + 2] = c.b * v;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

let softDot: THREE.DataTexture | null = null;
/**
 * Shared round, soft-edged sprite for point clouds (white, alpha falloff), so
 * points read as motes instead of squares, which shows at the projection close-up.
 */
export function softDotTexture(): THREE.DataTexture {
  if (softDot) return softDot;
  const n = 32;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2) / (n / 2);
      const k = THREE.MathUtils.clamp((r - 0.3) / 0.7, 0, 1);
      const i = (y * n + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(255 * (1 - k * k * (3 - 2 * k)));
    }
  }
  softDot = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  softDot.magFilter = THREE.LinearFilter;
  softDot.minFilter = THREE.LinearFilter;
  softDot.needsUpdate = true;
  return softDot;
}

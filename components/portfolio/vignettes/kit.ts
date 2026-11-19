/**
 * The shared drawing kit for the experience vignettes. Every scene is built
 * from these so the seven read as one set of figures: hairline structure,
 * flat or softly lit solids, one or two accents.
 *
 * Materials made here keep a reference to the palette colour they are given
 * instead of copying it, so they follow a theme switch (see Palette).
 */
import * as THREE from "three";
import type { View } from "./types";

export type Vec3 = [x: number, y: number, z: number];

/** A true isometric look down at the ground plane. */
export const DEFAULT_VIEW: View = {
  yaw: Math.PI / 4,
  pitch: Math.atan(Math.SQRT1_2),
  frame: [4, 3],
  target: [0, 0, 0],
};

/* ── Materials ─────────────────────────────────────────────────────────── */

interface Look {
  /** Below 1 the material blends; depth writes are turned off so it never hides what is behind it. */
  opacity?: number;
  doubleSided?: boolean;
}

function finish<M extends THREE.Material & { color: THREE.Color }>(material: M, color: THREE.Color, look: Look) {
  material.color = color;
  const opacity = look.opacity ?? 1;
  if (opacity < 1) {
    material.transparent = true;
    material.opacity = opacity;
    material.depthWrite = false;
  }
  if (look.doubleSided) material.side = THREE.DoubleSide;
  return material;
}

/** An unlit fill: exactly the token's colour. For flat shapes, markers, glows. */
export function flat(color: THREE.Color, look: Look = {}) {
  return finish(new THREE.MeshBasicMaterial(), color, look);
}

/** A fill shaded by the stage lights, so a box shows three faces. For solid objects. */
export function solid(color: THREE.Color, look: Look = {}) {
  return finish(new THREE.MeshLambertMaterial(), color, look);
}

/** A one-pixel line. For grids, outlines, guides. */
export function stroke(color: THREE.Color, look: Look = {}) {
  return finish(new THREE.LineBasicMaterial(), color, look);
}

/** A one-pixel dashed line, in world units. For things planned or not yet built. */
export function dashed(color: THREE.Color, dash = 0.08, gap = 0.06, look: Look = {}) {
  return finish(new THREE.LineDashedMaterial({ dashSize: dash, gapSize: gap }), color, look);
}

/* ── Shapes ────────────────────────────────────────────────────────────── */

const toVectors = (points: readonly Vec3[]) => points.map(([x, y, z]) => new THREE.Vector3(x, y, z));

/** A line through `points`; `closed` joins the last back to the first. */
export function polyline(points: readonly Vec3[], material: THREE.Material, closed = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(toVectors(closed ? [...points, points[0]] : points));
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

/** Separate line segments, one per pair of points. */
export function segments(pairs: readonly [Vec3, Vec3][], material: THREE.Material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(toVectors(pairs.flat()));
  const lines = new THREE.LineSegments(geometry, material);
  lines.computeLineDistances();
  return lines;
}

/** A grid of `columns` × `rows` cells on the ground, centred on the origin. */
export function gridFloor(columns: number, rows: number, cell: number, material: THREE.Material) {
  const width = columns * cell;
  const depth = rows * cell;
  const pairs: [Vec3, Vec3][] = [];
  for (let column = 0; column <= columns; column += 1) {
    const x = column * cell - width / 2;
    pairs.push([[x, 0, -depth / 2], [x, 0, depth / 2]]);
  }
  for (let row = 0; row <= rows; row += 1) {
    const z = row * cell - depth / 2;
    pairs.push([[-width / 2, 0, z], [width / 2, 0, z]]);
  }
  return segments(pairs, material);
}

/** A box standing on the ground: its origin is the centre of its base. */
export function box(width: number, height: number, depth: number, material: THREE.Material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  geometry.translate(0, height / 2, 0);
  return new THREE.Mesh(geometry, material);
}

/** The hard edges of a mesh as lines, to add as its child (`mesh.add(edges(mesh, …))`). */
export function edges(mesh: THREE.Mesh, material: THREE.Material) {
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), material);
  lines.computeLineDistances();
  return lines;
}

/** A line with real thickness (one-pixel lines cannot be widened). For the one path that matters. */
export function tube(points: readonly Vec3[], radius: number, material: THREE.Material, closed = false) {
  const curve = new THREE.CatmullRomCurve3(toVectors(points), closed, "catmullrom", 0.02);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8, points.length * 12), radius, 6, closed), material);
}

/* ── Time and motion ───────────────────────────────────────────────────── */

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

/** Where `t` is in a repeating cycle of `period` seconds, 0..1. `offset` shifts the start, in cycles. */
export function loop(t: number, period: number, offset = 0) {
  const phase = (t / period + offset) % 1;
  return phase < 0 ? phase + 1 : phase;
}

/** How far `value` is through the span from `start` to `end`, clamped to 0..1. */
export const span = (value: number, start: number, end: number) => clamp01((value - start) / (end - start));

/** Ease in and out. */
export const ease = (amount: number) => {
  const x = clamp01(amount);
  return x * x * (3 - 2 * x);
};

/** Up to 1 and back down over 0..1: a pulse that starts and ends at rest. */
export const pulse = (amount: number) => Math.sin(clamp01(amount) * Math.PI);

/** A fixed pseudo-random number in 0..1 for an index: the same every call, so scenes stay pure. */
export function hash(index: number, salt = 0) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/** The shortest way round from one angle to another. */
export function lerpAngle(from: number, to: number, amount: number) {
  const turn = ((((to - from) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
  return from + turn * amount;
}

/** A path through points, walked by distance. */
export interface Route {
  /** Total length in world units. */
  length: number;
  /** Number of straight legs. */
  legs: number;
  /** The length of each leg. */
  lengths: readonly number[];
  /** The point `along` of the way round (0..1, wraps when closed), written to `out`. */
  at(along: number, out: THREE.Vector3): THREE.Vector3;
  /** Which leg that point is on, and how far along it (0..1). */
  leg(along: number): { index: number; fraction: number };
  /** The heading of a leg on the ground plane, as a rotation about Y. */
  heading(index: number): number;
}

export function route(points: readonly Vec3[], closed = false): Route {
  const stops = toVectors(closed ? [...points, points[0]] : points);
  const lengths = stops.slice(1).map((stop, index) => stop.distanceTo(stops[index]));
  const length = lengths.reduce((sum, value) => sum + value, 0);
  const legs = lengths.length;

  const leg = (along: number) => {
    const wrapped = closed ? along - Math.floor(along) : clamp01(along);
    let remaining = wrapped * length;
    for (let index = 0; index < legs; index += 1) {
      if (remaining <= lengths[index] || index === legs - 1) {
        return { index, fraction: lengths[index] > 0 ? clamp01(remaining / lengths[index]) : 0 };
      }
      remaining -= lengths[index];
    }
    return { index: 0, fraction: 0 };
  };

  return {
    length,
    legs,
    lengths,
    leg,
    at(along, out) {
      const { index, fraction } = leg(along);
      return out.lerpVectors(stops[index], stops[index + 1], fraction);
    },
    heading(index) {
      const wrapped = closed ? ((index % legs) + legs) % legs : Math.min(legs - 1, Math.max(0, index));
      const from = stops[wrapped];
      const to = stops[wrapped + 1];
      return Math.atan2(to.x - from.x, to.z - from.z);
    },
  };
}

/**
 * Drives a route the way a vehicle would: it eases to a stop at every corner
 * and turns there before setting off down the next leg. `phase` is 0..1
 * through one trip. Writes the position to `out`; returns how far along the
 * route that is (0..1, by distance) and the heading as a rotation about Y.
 */
export function ride(path: Route, phase: number, out: THREE.Vector3, turn = 0.22) {
  // Each leg takes time for its length plus a fixed share for the corner.
  const dwell = (path.length / path.legs) * 0.4;
  let remaining = (phase - Math.floor(phase)) * (path.length + dwell * path.legs);
  let travelled = 0;
  let index = 0;
  for (; index < path.legs - 1; index += 1) {
    const share = path.lengths[index] + dwell;
    if (remaining <= share) break;
    remaining -= share;
    travelled += path.lengths[index];
  }
  const fraction = clamp01(remaining / (path.lengths[index] + dwell));
  const along = (travelled + ease(fraction) * path.lengths[index]) / path.length;
  path.at(along, out);
  const heading = lerpAngle(path.heading(index - 1), path.heading(index), ease(span(fraction, 0, turn)));
  return { along, heading };
}

/* ── Housekeeping ──────────────────────────────────────────────────────── */

/** Frees every geometry and material under `root`. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((object) => {
    const item = object as Partial<THREE.Mesh>;
    item.geometry?.dispose();
    const materials = Array.isArray(item.material) ? item.material : item.material ? [item.material] : [];
    for (const material of materials) material.dispose();
    if (object instanceof THREE.InstancedMesh) object.dispose();
  });
}

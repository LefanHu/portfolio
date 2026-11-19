/**
 * Drafting helpers shared by the two upcoming-role scenes (ATOMS and Aven
 * Financial). Both are drawn as blueprints: the same ground grid, the same
 * registration and centre marks, the same dimension lines and the same slow
 * "pen" that draws the plan in once and then lets it rest, so the two read as
 * siblings.
 */
import * as THREE from "three";
import { clamp01, dashed, ease, flat, gridFloor, lerp, loop, segments, span, stroke, type Vec3 } from "../kit";
import type { Palette } from "../types";

/** The shared ground: a square of CELLS × CELLS cells, centred on the origin. */
export const CELL = 0.4;
export const CELLS = 5;
export const HALF = (CELL * CELLS) / 2;

/** Dash lengths that stay readable on a one-pixel line at 240×180. */
export const DASH = 0.08;
export const GAP = 0.06;

/** The grid, the corner registration marks and the centre cross-hairs, all on the ground. */
export function drawingSheet(palette: Palette) {
  const sheet = new THREE.Group();
  sheet.add(gridFloor(CELLS, CELLS, CELL, stroke(palette.line)));

  // Registration marks: an L just outside each corner of the grid.
  const gap = 0.08;
  const arm = 0.22;
  const corner = HALF + gap;
  const marks: [Vec3, Vec3][] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      marks.push([[sx * corner, 0.002, sz * corner], [sx * (corner - arm), 0.002, sz * corner]]);
      marks.push([[sx * corner, 0.002, sz * corner], [sx * corner, 0.002, sz * (corner - arm)]]);
    }
  }
  sheet.add(segments(marks, stroke(palette.rune)));

  // Centre cross-hairs: four short arms with a gap at the middle, where the subject sits.
  const arms: [Vec3, Vec3][] = [];
  for (const sign of [-1, 1]) {
    arms.push([[sign * 0.12, 0.002, 0], [sign * 0.4, 0.002, 0]]);
    arms.push([[0, 0.002, sign * 0.12], [0, 0.002, sign * 0.4]]);
  }
  sheet.add(segments(arms, stroke(palette.lineStrong)));
  return sheet;
}

/**
 * A dimension line: extension lines from `from` and `to`, a line between their
 * far ends, and a slanted tick across each end.
 */
export function dimension(from: Vec3, to: Vec3, offset: Vec3, material: THREE.Material) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const away = new THREE.Vector3(...offset);
  const along = b.clone().sub(a).normalize();
  const tick = along.clone().add(away.clone().normalize()).multiplyScalar(0.05);
  const a2 = a.clone().add(away);
  const b2 = b.clone().add(away);
  const pair = (p: THREE.Vector3, q: THREE.Vector3): [Vec3, Vec3] => [p.toArray(), q.toArray()];
  return segments(
    [
      pair(a, a2.clone().addScaledVector(away.clone().normalize(), 0.04)),
      pair(b, b2.clone().addScaledVector(away.clone().normalize(), 0.04)),
      pair(a2, b2),
      pair(a2.clone().sub(tick), a2.clone().add(tick)),
      pair(b2.clone().sub(tick), b2.clone().add(tick)),
    ],
    material,
  );
}

/** Points round an ellipse in the local XZ plane, closed (the last point repeats the first). */
export function ellipsePoints(radiusX: number, radiusZ: number, count = 72): Vec3[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return [Math.cos(angle) * radiusX, 0, Math.sin(angle) * radiusZ];
  });
}

/** Points round a rounded rectangle in the local XY plane, closed, starting top-left. */
export function roundedRectPoints(width: number, height: number, radius: number, steps = 8): Vec3[] {
  const points: Vec3[] = [];
  const hw = width / 2;
  const hh = height / 2;
  // Corner centres in drawing order, with the angle each corner's arc starts at.
  const corners: [number, number, number][] = [
    [-hw + radius, hh - radius, Math.PI / 2],
    [hw - radius, hh - radius, 0],
    [hw - radius, -hh + radius, -Math.PI / 2],
    [-hw + radius, -hh + radius, Math.PI],
  ];
  // Each arc turns clockwise by a quarter, i.e. from its start angle down by 90 degrees.
  for (const [cx, cy, start] of corners) {
    for (let step = 0; step <= steps; step += 1) {
      const angle = start - (step / steps) * (Math.PI / 2);
      points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 0]);
    }
  }
  points.push(points[0]);
  return points;
}

/** How long a drawing takes to be drawn, held, rubbed out and started again, in seconds. */
export const REDRAW = 26;

/**
 * Where a drawing is in that cycle: `at` is seconds since it was started, and
 * `keep` falls from 1 to 0 over the last moments as it is rubbed out. Multiply
 * each line's own drawn amount by `keep` and the sheet ends every cycle empty,
 * which is where the next one begins.
 */
export function redraw(t: number) {
  const at = loop(t, REDRAW) * REDRAW;
  return { at, keep: 1 - ease(span(at, REDRAW - 2.4, REDRAW - 0.4)) };
}

/** A dashed line through `points`, as a polyline whose drawn length can be set with `trace`. */
export function dashedLine(points: readonly Vec3[], color: THREE.Color) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const line = new THREE.Line(geometry, dashed(color, DASH, GAP));
  line.computeLineDistances();
  line.userData.points = points;
  return line;
}

/** The pen: a small dot in the rune colour that rides the end of a line being drawn. */
export function makePen(palette: Palette) {
  const pen = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), flat(palette.rune));
  pen.visible = false;
  return pen;
}

/**
 * Draws `line` in to `amount` (0..1 of its length) and, when given, puts the
 * pen at the drawing end. The pen shows only while the line is part drawn, so
 * a finished drawing is left at rest. Everything comes from `amount`, so the
 * result is the same however the scene got here.
 */
export function trace(line: THREE.Line, amount: number, pen?: THREE.Mesh) {
  const points = line.userData.points as readonly Vec3[];
  const last = points.length - 1;
  const reach = clamp01(amount) * last;
  const whole = Math.floor(reach);
  line.visible = amount > 0;
  // The line grows a vertex at a time; the pen glides between vertices, so it leads by under one step.
  line.geometry.setDrawRange(0, Math.min(points.length, whole + 1));
  if (pen) {
    const from = points[Math.min(whole, last)];
    const to = points[Math.min(whole + 1, last)];
    const fraction = reach - whole;
    pen.position.set(lerp(from[0], to[0], fraction), lerp(from[1], to[1], fraction), lerp(from[2], to[2], fraction));
    const live = span(amount, 0, 0.02) * (1 - span(amount, 0.98, 1));
    pen.visible = live > 0;
    pen.scale.setScalar(live);
  }
}

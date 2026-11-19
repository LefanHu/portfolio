/**
 * ATOMS: an upcoming role, drawn as a blueprint.
 *
 * A plan of an atom floating over a drafting grid: a wireframe nucleus and
 * three dashed orbits, turning very slowly, with an electron on each (one in
 * the accent colour, the hint of what is coming). A small pen draws the
 * orbits in; the drawing is held, rubbed out and begun again (blueprint.ts).
 * Nothing is solid, because nothing is built yet.
 */
import * as THREE from "three";
import { dashed, ease, flat, polyline, span, stroke, type Vec3 } from "../kit";
import type { VignetteFactory } from "../types";
import { dashedLine, dimension, drawingSheet, ellipsePoints, HALF, makePen, redraw, trace } from "./blueprint";

const RADIUS = 0.95;
const FLATNESS = 0.4;
const CENTRE_HEIGHT = 0.85;

/** Each orbit: when the pen draws it, how it sits, and its electron's lap time in seconds. */
const ORBITS = [
  { from: 1.2, to: 4.4, yaw: 0, period: 9, electron: "ink" },
  { from: 2.2, to: 5.4, yaw: (Math.PI * 2) / 3, period: 12, electron: "accent" },
  { from: 3.2, to: 6.4, yaw: (Math.PI * 4) / 3, period: 15, electron: "mute" },
] as const;
const TILT = 1.05;

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();
  root.add(drawingSheet(palette));

  // The footprint of the orbits on the grid, and the line that drops to it.
  root.add(polyline(ellipsePoints(RADIUS, RADIUS).map(([x, , z]) => [x, 0.002, z] as Vec3), dashed(palette.lineStrong, 0.07, 0.07)));
  root.add(polyline([[0, 0, 0], [0, CENTRE_HEIGHT, 0]], dashed(palette.lineStrong, 0.05, 0.05)));
  root.add(dimension([-RADIUS, 0, HALF + 0.1], [RADIUS, 0, HALF + 0.1], [0, 0, 0.16], stroke(palette.mute)));

  const atom = new THREE.Group();
  atom.position.y = CENTRE_HEIGHT;
  root.add(atom);

  // The nucleus: three great circles of a small sphere.
  const nucleus = new THREE.Group();
  const ring = ellipsePoints(0.2, 0.2, 32);
  const rings = [0, 1, 2].map((index) => {
    const line = dashedLine(ring, palette.ink);
    line.rotation.set(index === 1 ? Math.PI / 2 : 0, 0, index === 2 ? Math.PI / 2 : 0);
    nucleus.add(line);
    return line;
  });
  atom.add(nucleus);

  const orbits = ORBITS.map((orbit) => {
    const group = new THREE.Group();
    group.rotation.set(TILT, orbit.yaw, 0, "YXZ");
    const points = ellipsePoints(RADIUS, RADIUS * FLATNESS);
    const line = dashedLine(points, orbit.electron === "accent" ? palette.mute : palette.ink);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(orbit.electron === "accent" ? 0.065 : 0.05, 12, 8),
      flat(palette[orbit.electron]),
    );
    // Each orbit has its own pen, so it sits in the orbit's tilted frame.
    const pen = makePen(palette);
    group.add(line, dot, pen);
    atom.add(group);
    return { ...orbit, line, dot, pen };
  });

  return {
    root,
    view: { target: [0, 0.3, 0], frame: [3.8, 2.8] },
    still: 12,
    update(t) {
      atom.rotation.y = t * 0.1;
      nucleus.rotation.set(t * 0.2, t * 0.13, 0);
      const { at, keep } = redraw(t);
      for (const ring of rings) trace(ring, ease(span(at, 0.3, 2.6)) * keep);

      for (const orbit of orbits) {
        const amount = ease(span(at, orbit.from, orbit.to)) * keep;
        trace(orbit.line, amount, orbit.pen);
        // Electrons arrive once their orbit is drawn.
        const angle = (t / orbit.period) * Math.PI * 2;
        orbit.dot.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS * FLATNESS);
        orbit.dot.scale.setScalar(ease(span(amount, 0.97, 1)));
      }
    },
  };
};

export default scene;

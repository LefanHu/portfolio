/**
 * Aven Financial: an upcoming role, drawn as a blueprint.
 *
 * A plan of a payment card floating over a drafting grid, tilting and turning
 * slowly, with its footprint outlined on the grid below. On the card are a
 * chip and a small house (a nod to a card backed by home equity); the house
 * carries the one small accent pulse. A pen draws the card in; the
 * drawing is held, rubbed out and begun again (blueprint.ts). Nothing is solid,
 * because nothing is built yet.
 */
import * as THREE from "three";
import { dashed, ease, flat, loop, polyline, pulse, span, stroke, type Vec3 } from "../kit";
import type { VignetteFactory } from "../types";
import { dashedLine, dimension, drawingSheet, HALF, makePen, redraw, roundedRectPoints, trace } from "./blueprint";

// A bank card is 85.6 by 54 mm.
const WIDTH = 1.7;
const HEIGHT = WIDTH / 1.586;
const RADIUS = 0.1;
const FLOAT = 0.8;

const rectangle = (cx: number, cy: number, width: number, height: number): Vec3[] => [
  [cx - width / 2, cy + height / 2, 0],
  [cx + width / 2, cy + height / 2, 0],
  [cx + width / 2, cy - height / 2, 0],
  [cx - width / 2, cy - height / 2, 0],
  [cx - width / 2, cy + height / 2, 0],
];

/** A house: a square with a gable roof, one stroke, centred on (cx, cy). */
const house = (cx: number, cy: number, size: number): Vec3[] => {
  const half = size / 2;
  return [
    [cx - half, cy - half, 0],
    [cx + half, cy - half, 0],
    [cx + half, cy + half * 0.2, 0],
    [cx, cy + half * 1.1, 0],
    [cx - half, cy + half * 0.2, 0],
    [cx - half, cy - half, 0],
  ];
};

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();
  root.add(drawingSheet(palette));

  // The footprint of the card on the grid, the line that drops to it, and its two dimensions.
  const footprint = roundedRectPoints(WIDTH, HEIGHT, RADIUS).map(([x, y]) => [x, 0.002, -y] as Vec3);
  root.add(polyline(footprint, dashed(palette.lineStrong, 0.07, 0.07)));
  root.add(polyline([[0, 0, 0], [0, FLOAT, 0]], dashed(palette.lineStrong, 0.05, 0.05)));
  const edge = HALF + 0.1;
  root.add(
    dimension([-WIDTH / 2, 0, edge], [WIDTH / 2, 0, edge], [0, 0, 0.16], stroke(palette.mute)),
    dimension([edge, 0, -HEIGHT / 2], [edge, 0, HEIGHT / 2], [0.16, 0, 0], stroke(palette.mute)),
  );

  // The card lies in its own XY plane; the pivot tilts and turns it.
  const pivot = new THREE.Group();
  pivot.position.y = FLOAT;
  pivot.rotation.order = "YXZ";
  root.add(pivot);

  const outline = dashedLine(roundedRectPoints(WIDTH, HEIGHT, RADIUS), palette.ink);
  const chip = dashedLine(rectangle(-0.5, 0.1, 0.38, 0.3), palette.rune);
  const chipLines = dashedLine(
    [[-0.69, 0.1, 0], [-0.31, 0.1, 0]],
    palette.rune,
  );
  const roof = dashedLine(house(0.45, 0.1, 0.34), palette.mute);
  // The number, as three groups of dashes along the lower edge.
  const number = dashedLine([[-0.7, -0.3, 0], [0.7, -0.3, 0]], palette.mute);
  const pen = makePen(palette);
  const live = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), flat(palette.accent));
  live.position.set(0.45, 0.05, 0.001);
  pivot.add(outline, chip, chipLines, roof, number, pen, live);

  return {
    root,
    view: { target: [0, 0.3, 0], frame: [3.8, 2.8] },
    still: 10,
    update(t) {
      // The sway returns to where it began every 30 s.
      const sway = Math.sin(loop(t, 30) * Math.PI * 2);
      const bob = Math.sin(loop(t, 30, 0.25) * Math.PI * 2);
      // It turns about the direction of the camera, so its face is always in view.
      pivot.rotation.set(-Math.PI / 2 + 0.5 + 0.1 * bob, 0.45 + 0.28 * sway, 0);

      const { at, keep } = redraw(t);
      trace(outline, ease(span(at, 0.4, 4.6)) * keep, pen);
      trace(chip, ease(span(at, 3.4, 5)) * keep);
      trace(chipLines, ease(span(at, 4.4, 5.6)) * keep);
      trace(roof, ease(span(at, 4.2, 6)) * keep);
      trace(number, ease(span(at, 5.4, 6.6)) * keep);

      // The accent pulse arrives with the house and then beats gently.
      live.scale.setScalar(ease(span(at, 6, 6.8)) * keep * (0.75 + 0.5 * pulse(loop(t, 3))));
    },
  };
};

export default scene;

/**
 * Capital One: a Figma-to-Astro framework.
 *
 * Two sheets of paper side by side. The left one is the design: every block of
 * a product page drawn as a dashed mock-up outline. The right one is the page
 * being built from it. One block at a time, an outline lifts off the design in
 * the signal colour, arcs across and lands as a solid block (the hero, the
 * accent colour, is the centrepiece). When the page is complete it holds for a
 * beat, then the built blocks shrink away and the build starts over.
 */
import * as THREE from "three";
import { box, dashed, edges, ease, flat, loop, polyline, pulse, solid, span, stroke, type Vec3 } from "../kit";
import type { VignetteFactory } from "../types";

const PERIOD = 11;
const SHEET_W = 1.2;
const SHEET_D = 1.7;
const SHEET_X = 0.85;
const SHEET_H = 0.03;

/** Blocks in build order. x/z are the block's centre on the sheet, w/d its size, h how tall it stands once built. */
const BLOCKS = [
  { name: "header", x: 0, z: -0.72, w: 1.04, d: 0.18, h: 0.05 },
  { name: "hero", x: 0, z: -0.38, w: 1.04, d: 0.42, h: 0.09 },
  { name: "card", x: -0.36, z: 0.0, w: 0.32, d: 0.3, h: 0.06 },
  { name: "card", x: 0, z: 0.0, w: 0.32, d: 0.3, h: 0.06 },
  { name: "card", x: 0.36, z: 0.0, w: 0.32, d: 0.3, h: 0.06 },
  { name: "text", x: 0, z: 0.33, w: 1.04, d: 0.2, h: 0.04 },
  { name: "footer", x: 0, z: 0.68, w: 1.04, d: 0.18, h: 0.05 },
] as const;

// Each block is carried a little after the last; the page then holds, clears and rests.
const FIRST = 0.5;
const STEP = 0.9;
const FLIGHT = 1.4;
const CLEAR_AT = 9.3;
const CLEAR_FOR = 1.0;
/** How high a block arcs over the gap, in world units. */
const ARC = 0.75;

/** A unit rectangle on the ground (1 × 1, centred), scaled per block. */
const UNIT: Vec3[] = [
  [-0.5, 0, -0.5],
  [0.5, 0, -0.5],
  [0.5, 0, 0.5],
  [-0.5, 0, 0.5],
];

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();

  const sheet = (x: number, outline: THREE.Color) => {
    const pad = box(SHEET_W, SHEET_H, SHEET_D, solid(palette.pane));
    pad.position.x = x;
    pad.add(edges(pad, stroke(outline)));
    root.add(pad);
  };
  sheet(-SHEET_X, palette.lineStrong);
  sheet(SHEET_X, palette.ink);

  const top = SHEET_H + 0.004;
  const hairline = stroke(palette.line);
  const mockup = dashed(palette.mute, 0.05, 0.04);
  const ghostFill = flat(palette.rune, { opacity: 0.22, doubleSided: true });
  const ghostLine = stroke(palette.rune);
  const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

  const blocks = BLOCKS.map((block, index) => {
    const place = (group: THREE.Object3D, side: number) => {
      group.position.set(side * SHEET_X + block.x, top, block.z);
      group.scale.set(block.w, 1, block.d);
    };

    // The design: always there, drawn as a mock-up outline.
    const design = polyline(UNIT, mockup, true);
    place(design, -1);
    root.add(design);

    // A faint slot on the target sheet, so the landing place is already marked.
    const slot = polyline(UNIT, hairline, true);
    place(slot, 1);
    root.add(slot);

    // The outline that travels: a signal-coloured frame with a faint tint.
    const ghost = new THREE.Group();
    ghost.add(polyline(UNIT, ghostLine, true), new THREE.Mesh(plane, ghostFill));
    root.add(ghost);

    // The built block: pane fill with ink edges, or the accent for the hero.
    const built = new THREE.Group();
    const body = box(block.w, block.h, block.d, solid(block.name === "hero" ? palette.accent : palette.pane));
    body.add(edges(body, stroke(palette.ink)));
    built.add(body);
    built.position.set(SHEET_X + block.x, SHEET_H, block.z);
    root.add(built);

    return { ...block, index, ghost, built, from: new THREE.Vector3(-SHEET_X + block.x, top, block.z) };
  });

  return {
    root,
    view: { yaw: 0.45, pitch: 0.6, frame: [3.7, 2.8], target: [0, 0.1, 0] },
    still: 4.8,
    update(t) {
      const time = loop(t, PERIOD) * PERIOD;
      // 1 while the page stands, easing to 0 as it clears.
      const standing = 1 - ease(span(time, CLEAR_AT, CLEAR_AT + CLEAR_FOR));

      for (const block of blocks) {
        const flight = ease(span(time, FIRST + block.index * STEP, FIRST + block.index * STEP + FLIGHT));
        const { ghost, from } = block;

        // The outline grows off the design, rides an arc to the slot, and shrinks into the block.
        const size = ease(span(flight, 0, 0.12)) * (1 - ease(span(flight, 0.85, 1)));
        ghost.scale.set(block.w * size, size, block.d * size);
        ghost.position.set(
          from.x + (SHEET_X * 2) * flight,
          top + ARC * pulse(flight),
          from.z,
        );

        // The block lands as the outline arrives, and is cleared with the rest of the page.
        block.built.scale.setScalar(Math.max(1e-4, ease(span(flight, 0.8, 1)) * standing));
      }
    },
  };
};

export default scene;

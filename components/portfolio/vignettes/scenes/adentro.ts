/**
 * Adentro: resilient monitoring for a large ECS cluster.
 *
 * A cluster of services drawn as a block of cubes. A monitoring sweep (a
 * cyan plane on two coral emitters) crosses the block once per cycle and
 * every service answers with a small heartbeat bump as it passes. One service,
 * a different one each cycle, has already gone wrong: it is ember and shaking.
 * When the sweep reaches it a coral ring marks it, then it recovers.
 */
import * as THREE from "three";
import { box, ease, flat, gridFloor, hash, lerp, loop, polyline, pulse, solid, span, stroke } from "../kit";
import type { VignetteFactory } from "../types";

const COLUMNS = 8;
const ROWS = 5;
const STEP = 0.36;
const SIZE = 0.22;
const PERIOD = 10;
const WIDTH = COLUMNS * STEP;
const DEPTH = ROWS * STEP;

const cellX = (column: number) => (column - (COLUMNS - 1) / 2) * STEP;
const cellZ = (row: number) => (row - (ROWS - 1) / 2) * STEP;

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();
  root.add(gridFloor(COLUMNS, ROWS, STEP, stroke(palette.line)));

  // Instance colours multiply the material colour, so this fill is white and
  // the palette colours are applied per instance in update (see below).
  const fill = solid(palette.pane);
  fill.color = new THREE.Color(1, 1, 1);
  const cubes = new THREE.InstancedMesh(box(SIZE, SIZE, SIZE, fill).geometry, fill, COLUMNS * ROWS);
  root.add(cubes);

  // The sweep: a translucent upright plane with a bright top edge, held by an
  // emitter post at each end of the block.
  const sweep = new THREE.Group();
  const height = 0.5;
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(DEPTH + 0.1, height).translate(0, height / 2, 0).rotateY(Math.PI / 2),
    flat(palette.rune, { opacity: 0.28, doubleSided: true }),
  );
  sweep.add(sheet);
  const half = (DEPTH + 0.1) / 2;
  sweep.add(
    polyline(
      [
        [0, height, -half],
        [0, height, half],
      ],
      stroke(palette.rune),
    ),
  );
  for (const side of [-1, 1]) {
    const post = box(0.07, height + 0.1, 0.07, solid(palette.accent));
    post.position.z = side * (half + 0.02);
    sweep.add(post);
  }
  root.add(sweep);

  // The marker over the caught service: a ring with a stem down to the cube.
  const marker = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    flat(palette.accent, { doubleSided: true }),
  );
  ring.position.y = 0.5;
  marker.add(ring, polyline([[0, 0.3, 0], [0, 0.5, 0]], stroke(palette.accent)));
  root.add(marker);

  const pose = new THREE.Object3D();
  const tint = new THREE.Color();
  const base = new THREE.Color();

  return {
    root,
    view: { target: [0, 0.1, 0] },
    still: 5.4,
    update(t) {
      const cycle = Math.floor(t / PERIOD);
      const phase = loop(t, PERIOD);
      const bad = Math.floor(hash(cycle + 3) * COLUMNS * ROWS);
      const badColumn = bad % COLUMNS;
      const badRow = Math.floor(bad / COLUMNS);

      // The sweep travels from past one end to past the other, growing in and
      // out at the ends so it never pops.
      const sweepX = lerp(-WIDTH / 2 - 0.25, WIDTH / 2 + 0.25, span(phase, 0.15, 0.7));
      const grow = ease(span(phase, 0.1, 0.18)) * (1 - ease(span(phase, 0.7, 0.78)));
      sweep.position.x = sweepX;
      sweep.scale.set(1, Math.max(grow, 0.001), 1);
      sweep.visible = grow > 0.01;

      // The fault: arrives early in the cycle, is caught by the sweep, then clears.
      const recovery = ease(span(phase, 0.8, 0.9));
      const fault = ease(span(phase, 0.02, 0.1)) * (1 - recovery);
      const healed = pulse(span(phase, 0.8, 1));

      let index = 0;
      for (let row = 0; row < ROWS; row += 1) {
        for (let column = 0; column < COLUMNS; column += 1) {
          const x = cellX(column);
          const isBad = column === badColumn && row === badRow;
          // Heartbeat: a bump just behind the sweep, fading out within half a unit.
          const behind = sweepX - x;
          const beat = behind > 0 ? pulse(behind / 0.55) * grow : 0;

          base.copy(palette.pane).lerp(palette.mute, 0.4);
          tint.copy(base).lerp(palette.ok, beat * 0.9);
          let lift = 1 + 0.4 * beat;
          pose.position.set(x, 0, cellZ(row));
          if (isBad) {
            tint.copy(base).lerp(palette.ember, fault).lerp(palette.ok, healed * 0.9);
            lift = 1 + 0.4 * beat;
            const shake = Math.sin(t * 38) * 0.014 * fault;
            pose.position.x += shake;
            pose.position.z += Math.cos(t * 31) * 0.01 * fault;
          }
          pose.scale.set(1, lift, 1);
          pose.updateMatrix();
          cubes.setMatrixAt(index, pose.matrix);
          cubes.setColorAt(index, tint);
          index += 1;
        }
      }
      cubes.instanceMatrix.needsUpdate = true;
      if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;

      // Caught once the sweep has passed the bad cube; the ring drops in, then fades with the recovery.
      const caught = ease(span(sweepX - cellX(badColumn), 0, 0.2)) * (1 - ease(span(phase, 0.86, 0.94)));
      marker.position.set(cellX(badColumn), 0, cellZ(badRow));
      marker.scale.setScalar(Math.max(caught, 0.001));
      marker.position.y = (1 - caught) * 0.15 + Math.sin(t * 3) * 0.015 * caught;
    },
  };
};

export default scene;

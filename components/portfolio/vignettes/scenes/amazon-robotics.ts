/**
 * Amazon Robotics: planning pipelines for drive units.
 *
 * A patch of fulfilment-centre floor. Three drive units run their planned
 * routes, two of them carrying pods; the route ahead of each one is laid down
 * as markers and used up as it drives. The frame at the back is a workcell,
 * the station the pods are brought to.
 */
import * as THREE from "three";
import {
  box,
  ease,
  edges,
  flat,
  gridFloor,
  loop,
  polyline,
  ride,
  route,
  segments,
  solid,
  span,
  stroke,
  type Vec3,
} from "../kit";
import type { VignetteFactory } from "../types";

const CELL = 0.42;
const COLUMNS = 7;
const ROWS = 5;

/** The centre of a floor cell. */
const cell = (column: number, row: number, y = 0): Vec3 => [
  (column - (COLUMNS - 1) / 2) * CELL,
  y,
  (row - (ROWS - 1) / 2) * CELL,
];

// The routes never share a cell, so the units cannot meet.
const UNITS = [
  { stops: [[0, 0], [3, 0], [3, 2], [0, 2]], period: 11, offset: 0.1, pod: true },
  { stops: [[4, 1], [6, 1], [6, 4], [4, 4]], period: 12, offset: 0.55, pod: true },
  { stops: [[0, 3], [3, 3], [3, 4], [0, 4]], period: 8, offset: 0.3, pod: false },
] as const;

/** Route markers per cell of travel. */
const MARKERS_PER_CELL = 2;
/** How far ahead of a unit its route is marked, in world units. */
const LOOKAHEAD = 1.5;

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();
  root.add(gridFloor(COLUMNS, ROWS, CELL, stroke(palette.line)));

  // The workcell: a pad along the back edge with a gantry over it.
  const [padLeft, , padBack] = cell(3.5, -0.5);
  const [padRight, , padFront] = cell(6.5, 0.5);
  const gantry = 0.62;
  root.add(
    polyline(
      [
        [padLeft, 0.004, padBack],
        [padRight, 0.004, padBack],
        [padRight, 0.004, padFront],
        [padLeft, 0.004, padFront],
      ],
      stroke(palette.rune),
      true,
    ),
    segments(
      [
        [[padLeft, 0, padBack], [padLeft, gantry, padBack]],
        [[padRight, 0, padBack], [padRight, gantry, padBack]],
        [[padLeft, gantry, padBack], [padRight, gantry, padBack]],
      ],
      stroke(palette.ink),
    ),
  );

  const units = UNITS.map((unit) => {
    const path = route(unit.stops.map(([column, row]) => cell(column, row)), true);
    root.add(polyline(unit.stops.map(([column, row]) => cell(column, row, 0.003)), stroke(palette.lineStrong), true));

    const body = new THREE.Group();
    const drive = box(0.3, 0.08, 0.3, solid(palette.accent));
    body.add(drive);
    if (unit.pod) {
      const pod = box(0.27, 0.44, 0.27, solid(palette.pane));
      pod.position.y = 0.12;
      const shelves = edges(pod, stroke(palette.ink));
      // Two shelves, drawn as rings round the pod.
      for (const height of [0.15, 0.3]) {
        const ring = polyline(
          [
            [-0.135, height, -0.135],
            [0.135, height, -0.135],
            [0.135, height, 0.135],
            [-0.135, height, 0.135],
          ],
          stroke(palette.mute),
          true,
        );
        pod.add(ring);
      }
      pod.add(shelves);
      body.add(pod);
    }
    root.add(body);

    const markers = Math.round((path.length / CELL) * MARKERS_PER_CELL);
    return { ...unit, path, body, markers };
  });

  // Every route marker is one instance of a small square lying on the floor.
  const tile = new THREE.PlaneGeometry(0.09, 0.09).rotateX(-Math.PI / 2);
  const total = units.reduce((sum, unit) => sum + unit.markers, 0);
  const markers = new THREE.InstancedMesh(tile, flat(palette.rune), total);
  root.add(markers);

  const position = new THREE.Vector3();
  const pose = new THREE.Object3D();

  return {
    root,
    view: { target: [0, 0.12, 0] },
    still: 2,
    update(t) {
      let instance = 0;
      for (const unit of units) {
        const { along, heading } = ride(unit.path, loop(t, unit.period, unit.offset), position);
        unit.body.position.copy(position);
        unit.body.rotation.y = heading;

        for (let index = 0; index < unit.markers; index += 1) {
          const at = index / unit.markers;
          // Distance from the unit forward to this marker, round the loop.
          const ahead = ((at - along + 1) % 1) * unit.path.length;
          // Markers appear at the far end of the plan and vanish under the unit.
          const size = ease(span(ahead, 0.16, 0.3)) * (1 - ease(span(ahead, LOOKAHEAD - 0.4, LOOKAHEAD)));
          unit.path.at(at, pose.position);
          pose.position.y = 0.006;
          pose.scale.setScalar(size);
          pose.updateMatrix();
          markers.setMatrixAt(instance, pose.matrix);
          instance += 1;
        }
      }
      markers.instanceMatrix.needsUpdate = true;
    },
  };
};

export default scene;

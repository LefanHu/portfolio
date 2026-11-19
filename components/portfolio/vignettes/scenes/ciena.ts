/**
 * Ciena: a log aggregator for network devices.
 *
 * Five devices on the left each send log entries (small beads) down a fibre
 * into one coral box, the aggregator. Out of its far side the entries leave
 * as a single evenly spaced stream along a straight rail. Every fifth
 * entry is an error: it turns ember, is lifted off the rail onto a raised
 * branch and ringed, while the normal entries carry on below.
 */
import * as THREE from "three";
import { box, dashed, edges, ease, flat, gridFloor, hash, loop, polyline, segments, solid, span, stroke, tube, type Vec3 } from "../kit";
import type { VignetteFactory } from "../types";

const DEVICES = 5;
const DEVICE_X = -1.3;
const SPREAD = 0.36;
const RAIL_Y = 0.17;
const RAIL_START = 0.3;
const RAIL_END = 1.72;
/** Distance between entries on the output rail, and how fast they move. */
const SPACING = 0.3;
const SPEED = 0.36;
/** Output slots in flight at once. */
const SLOTS = Math.ceil((RAIL_END - RAIL_START) / SPACING) + 1;
/** How far an error is lifted off the rail. */
const LIFT = 0.32;
/** One entry in this many is an error: often enough that one is always in sight. */
const ERROR_EVERY = 5;

// Each fibre carries two beads at its own rhythm.
const RHYTHM = [2.3, 2.9, 3.4, 2.6, 3.1];

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();
  root.add(gridFloor(8, 5, 0.38, stroke(palette.line)));

  // Devices: rack-unit boxes spread in depth, each with a status stripe.
  const fibres = Array.from({ length: DEVICES }, (_, index) => {
    const z = (index - (DEVICES - 1) / 2) * SPREAD;
    const device = box(0.4, 0.13, 0.22, solid(palette.pane));
    device.position.set(DEVICE_X - hash(index) * 0.12, 0, z);
    device.add(edges(device, stroke(palette.ink)));
    root.add(device);
    const port = DEVICE_X - hash(index) * 0.12 + 0.2;
    root.add(polyline([[port - 0.34, 0.095, z + 0.115], [port - 0.12, 0.095, z + 0.115]], stroke(palette.mute)));

    const points: Vec3[] = [
      [port, 0.065, z],
      [port + 0.3, 0.065, z],
      [-0.62, 0.12, z * 0.45],
      [-0.28, RAIL_Y, (index - (DEVICES - 1) / 2) * 0.12],
    ];
    root.add(tube(points, 0.011, solid(palette.lineStrong)));
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, zz]) => new THREE.Vector3(x, y, zz)), false, "catmullrom", 0.02);
    return { curve, period: RHYTHM[index], offset: hash(index, 3) };
  });

  // The aggregator: the thing that was built.
  const aggregator = box(0.5, 0.3, 0.6, solid(palette.accent));
  aggregator.position.x = 0;
  aggregator.add(edges(aggregator, stroke(palette.ink)));
  root.add(aggregator);

  // The output rail, and the raised branch errors are lifted onto.
  root.add(polyline([[RAIL_START - 0.02, RAIL_Y, 0], [RAIL_END, RAIL_Y, 0]], stroke(palette.lineStrong)));
  root.add(
    polyline(
      [[RAIL_START + 0.55, RAIL_Y + LIFT, 0], [RAIL_END, RAIL_Y + LIFT, 0]],
      dashed(palette.mute, 0.05, 0.04),
    ),
    segments([[[RAIL_START + 0.55, RAIL_Y, 0], [RAIL_START + 0.55, RAIL_Y + LIFT, 0]]], dashed(palette.mute, 0.03, 0.03)),
  );

  // Beads on the fibres: two per fibre. Beads on the rail: one per slot.
  const bead = new THREE.SphereGeometry(0.036, 8, 6);
  const inBeads = new THREE.InstancedMesh(bead, flat(palette.rune), DEVICES * 2);
  const outBeads = new THREE.InstancedMesh(bead, flat(palette.rune), SLOTS);
  // Errors are a second set of beads in the fault colour; each slot shows one or the other.
  const errorBeads = new THREE.InstancedMesh(bead, flat(palette.ember), SLOTS);
  const rings = new THREE.InstancedMesh(
    new THREE.RingGeometry(0.075, 0.095, 20).rotateY(0.45),
    flat(palette.ember, { doubleSided: true }),
    SLOTS,
  );
  root.add(inBeads, outBeads, errorBeads, rings);

  const pose = new THREE.Object3D();
  const point = new THREE.Vector3();

  return {
    root,
    view: { yaw: 0.45, pitch: 0.75, frame: [3.7, 2.8], target: [0, 0.32, -0.12] },
    still: 1,
    update(t) {
      // Entries travelling down fibres, fading in at the device and into the aggregator.
      let instance = 0;
      for (const fibre of fibres) {
        for (let k = 0; k < 2; k += 1) {
          const u = loop(t, fibre.period, fibre.offset + k * 0.5);
          fibre.curve.getPointAt(u, point);
          pose.position.copy(point);
          pose.scale.setScalar(Math.max(1e-4, ease(span(u, 0, 0.08)) * (1 - ease(span(u, 0.92, 1)))));
          pose.updateMatrix();
          inBeads.setMatrixAt(instance, pose.matrix);
          instance += 1;
        }
      }
      inBeads.instanceMatrix.needsUpdate = true;

      // The ordered stream: entry `id` has travelled (phase + slot) spacings from the aggregator.
      const steps = (t * SPEED) / SPACING;
      const whole = Math.floor(steps);
      const phase = steps - whole;
      const length = RAIL_END - RAIL_START;
      for (let slot = 0; slot < SLOTS; slot += 1) {
        const id = whole - slot;
        const distance = (phase + slot) * SPACING;
        const u = distance / length;
        const isError = ((id % ERROR_EVERY) + ERROR_EVERY) % ERROR_EVERY === 0;
        const lift = isError ? ease(span(distance, 0.45, 0.65)) * LIFT : 0;
        const size = Math.max(1e-4, ease(span(u, 0, 0.1)) * (1 - ease(span(u, 0.9, 1))));

        pose.position.set(RAIL_START + distance, RAIL_Y + lift, 0);
        pose.scale.setScalar(isError ? 1e-4 : size);
        pose.updateMatrix();
        outBeads.setMatrixAt(slot, pose.matrix);
        pose.scale.setScalar(isError ? size * 1.25 : 1e-4);
        pose.updateMatrix();
        errorBeads.setMatrixAt(slot, pose.matrix);

        // The ring closes round an error once it is lifted.
        pose.scale.setScalar(Math.max(1e-4, isError ? ease(span(lift / LIFT, 0.6, 1)) * size : 0));
        pose.updateMatrix();
        rings.setMatrixAt(slot, pose.matrix);
      }
      outBeads.instanceMatrix.needsUpdate = true;
      errorBeads.instanceMatrix.needsUpdate = true;
      rings.instanceMatrix.needsUpdate = true;
    },
  };
};

export default scene;

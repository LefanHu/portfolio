/**
 * Telus: dispatching service calls to field technicians.
 *
 * A patch of town: streets as hairlines, low buildings for context, and the
 * coral dispatch tower in the middle of a block. Three vans wait at street
 * corners. A call comes in at a house (ember rings pulse out), the tower sends
 * a cyan signal to a van, the van drives the streets to the house, the call
 * resolves (the ring turns green and fades) and the van drives home.
 */
import * as THREE from "three";
import {
  box,
  clamp01,
  ease,
  edges,
  flat,
  lerp,
  lerpAngle,
  loop,
  ride,
  route,
  segments,
  solid,
  span,
  stroke,
  type Route,
  type Vec3,
} from "../kit";
import type { VignetteFactory } from "../types";

const PERIOD = 14;
/** Each call plays out over this many seconds; the three start staggered. */
const CALL_LENGTH = 5.5;
const CALL_START = [0, 4.2, 8.4];

const VERTICAL_STREETS = [-1.1, 0, 1.1];
const HORIZONTAL_STREETS = [-0.75, 0.75];
const REACH_X = 1.5;
const REACH_Z = 1.05;
const CURB = 0.06;

const HUB: Vec3 = [-0.55, 0, 0];
const HUB_TOP = 0.6;

type Point = [x: number, z: number];

/** Quiet context buildings: centre and size on the ground. */
const BUILDINGS: [x: number, z: number, w: number, d: number][] = [
  [-0.85, 0.42, 0.3, 0.34],
  [-0.85, -0.42, 0.3, 0.3],
  [0.58, 0.38, 0.5, 0.3],
  [0.45, -0.1, 0.3, 0.26],
  [-1.5, -0.2, 0.2, 0.4],
  [1.5, 0.3, 0.2, 0.36],
  [-0.1, 0.98, 0.34, 0.2],
  [0.1, -0.98, 0.3, 0.2],
  [-1.5, 0.55, 0.2, 0.3],
];

/** The three calls: where the house is and the streets its van takes (home first, stop last). */
const CALLS: { house: [x: number, z: number, w: number, d: number]; path: Point[] }[] = [
  { house: [0.58, -0.38, 0.5, 0.3], path: [[1.1, -0.75], [0, -0.75], [0, -0.38]] },
  { house: [-0.5, -0.97, 0.36, 0.2], path: [[-1.1, 0.75], [-1.1, -0.75], [-0.5, -0.75]] },
  { house: [0.55, 0.97, 0.36, 0.2], path: [[1.1, 0], [1.1, 0.75], [0.55, 0.75]] },
];

const ground = ([x, z]: Point, y = 0): Vec3 => [x, y, z];

/** The road edges: two hairlines per street, broken where streets cross. */
function roadEdges() {
  const pairs: [Vec3, Vec3][] = [];
  const cut = (limit: number, crossings: number[]) => {
    // The stretches of a street between crossings, as [from, to] pairs.
    const stops = [-limit, ...crossings.flatMap((c) => [c - CURB, c + CURB]), limit];
    const out: [number, number][] = [];
    for (let i = 0; i < stops.length; i += 2) out.push([stops[i], stops[i + 1]]);
    return out;
  };
  for (const x of VERTICAL_STREETS) {
    for (const side of [-CURB, CURB]) {
      for (const [from, to] of cut(REACH_Z, HORIZONTAL_STREETS)) pairs.push([[x + side, 0, from], [x + side, 0, to]]);
    }
  }
  for (const z of HORIZONTAL_STREETS) {
    for (const side of [-CURB, CURB]) {
      for (const [from, to] of cut(REACH_X, VERTICAL_STREETS)) pairs.push([[from, 0, z + side], [to, 0, z + side]]);
    }
  }
  return pairs;
}

const scene: VignetteFactory = (palette) => {
  const root = new THREE.Group();
  root.add(segments(roadEdges(), stroke(palette.lineStrong)));

  const edgeMaterial = stroke(palette.mute);
  for (const [x, z, w, d] of BUILDINGS) {
    const building = box(w, 0.1, d, solid(palette.pane));
    building.position.set(x, 0, z);
    building.add(edges(building, edgeMaterial));
    root.add(building);
  }

  // The dispatch tower: the thing this role built.
  const tower = new THREE.Group();
  const shaft = box(0.22, HUB_TOP - 0.12, 0.22, solid(palette.accent));
  const cap = box(0.32, 0.12, 0.32, solid(palette.accent));
  cap.position.y = HUB_TOP - 0.12;
  tower.add(shaft, cap);
  for (const part of [shaft, cap]) part.add(edges(part, stroke(palette.ink)));
  tower.position.set(...HUB);
  root.add(tower);

  // Vans: muted boxes with ink edges and a smaller cab at the front (+z).
  const homes = CALLS.map((call) => call.path[0]);
  const vans = CALLS.map((call) => {
    const van = new THREE.Group();
    const body = box(0.14, 0.1, 0.24, solid(palette.mute));
    const cab = box(0.14, 0.06, 0.09, solid(palette.mute));
    cab.position.set(0, 0.1, 0.075);
    for (const part of [body, cab]) part.add(edges(part, stroke(palette.ink)));
    van.add(body, cab);
    van.scale.setScalar(1.45);
    root.add(van);
    const out = route(call.path.map((p) => ground(p)));
    const back = route(call.path.map((p) => ground(p)).reverse());
    return { van, out, back };
  });

  // Faint links from the tower to every van, so a signal has a wire to travel.
  root.add(
    segments(
      homes.map((home): [Vec3, Vec3] => [[HUB[0], HUB_TOP, HUB[2]], ground(home, 0.22)]),
      stroke(palette.line),
    ),
  );

  // Per call: three ember ripples, a centre dot, an ok ring and a signal bead.
  const ripple = new THREE.RingGeometry(0.86, 1, 40).rotateX(-Math.PI / 2);
  const dot = new THREE.CircleGeometry(0.05, 16).rotateX(-Math.PI / 2);
  const ringY = 0.115;
  const calls = CALLS.map((call) => {
    const group = new THREE.Group();
    group.position.set(call.house[0], ringY, call.house[1]);
    const ripples = [0, 1, 2].map(() => {
      const mesh = new THREE.Mesh(ripple, flat(palette.ember, { opacity: 1, doubleSided: true }));
      group.add(mesh);
      return mesh;
    });
    const centre = new THREE.Mesh(dot, flat(palette.ember, { opacity: 1, doubleSided: true }));
    const done = new THREE.Mesh(ripple, flat(palette.ok, { opacity: 1, doubleSided: true }));
    group.add(centre, done);
    root.add(group);

    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8), flat(palette.rune));
    root.add(bead);
    return { ripples, centre, done, bead };
  });

  // A ring on the ground round the tower that flashes when it sends a signal.
  const wave = new THREE.Mesh(ripple, flat(palette.rune, { opacity: 1, doubleSided: true }));
  wave.position.set(HUB[0], 0.01, HUB[2]);
  root.add(wave);

  const position = new THREE.Vector3();
  const opacityOf = (mesh: THREE.Mesh, value: number) => {
    (mesh.material as THREE.Material).opacity = value;
    mesh.visible = value > 0.01;
  };

  /** Heading the van parks at: the way it first sets off. */
  const parked = (path: Route) => path.heading(0);

  return {
    root,
    still: 1.05,
    update(t) {
      const cycleTime = loop(t, PERIOD) * PERIOD;
      let waveStrength = 0;
      let waveSize = 0;

      CALLS.forEach((call, index) => {
        const u = cycleTime - CALL_START[index];
        const state = calls[index];
        const { van, out, back } = vans[index];

        // 0..1 over each stage of the call.
        const appear = ease(span(u, 0, 0.5));
        const signal = span(u, 0.5, 1.1);
        const drive = span(u, 1.1, 3.0);
        const resolve = span(u, 3.0, 3.3);
        const fade = span(u, 3.5, 4.2);
        const turn = span(u, 3.0, 3.4);
        const home = span(u, 3.4, 5.0);
        const settle = ease(span(u, 5.0, 5.4));

        // Ripples: expand and fade, forever while the call is open.
        const open = appear * (1 - ease(resolve));
        state.ripples.forEach((mesh, i) => {
          const r = loop(u, 1.3, i / 3);
          const size = lerp(0.06, 0.3, r);
          mesh.scale.set(size, 1, size);
          opacityOf(mesh, open * (1 - r) * (1 - r * 0.3));
        });
        state.centre.scale.setScalar(Math.max(appear, 0.001));
        opacityOf(state.centre, open);
        const ring = 0.3 + 0.08 * ease(span(u, 3.0, 4.2));
        state.done.scale.set(ring, 1, ring);
        opacityOf(state.done, ease(resolve) * (1 - ease(fade)));

        // Signal bead: tower top to the van's roof.
        const target = ground(call.path[0], 0.22);
        const beadSize = Math.sin(clamp01(signal) * Math.PI);
        state.bead.position.set(
          lerp(HUB[0], target[0], ease(signal)),
          lerp(HUB_TOP, target[1], ease(signal)),
          lerp(HUB[2], target[2], ease(signal)),
        );
        state.bead.scale.setScalar(Math.max(beadSize, 0.001));
        state.bead.visible = signal > 0 && signal < 1;
        const flash = Math.sin(clamp01(span(u, 0.5, 1.3)) * Math.PI);
        if (flash > waveStrength) {
          waveStrength = flash;
          waveSize = span(u, 0.5, 1.3);
        }

        // The van: out along the streets, a half turn at the stop, back, and settle to its parked heading.
        let heading: number;
        if (drive <= 0) {
          ride(out, 0, position);
          heading = parked(out);
        } else if (turn <= 0 || (drive < 1 && home <= 0)) {
          const result = ride(out, Math.min(drive, 0.9999), position);
          heading = result.heading;
        } else if (home <= 0) {
          ride(out, 0.9999, position);
          heading = lerpAngle(out.heading(out.legs - 1), back.heading(0), ease(turn));
        } else {
          const result = ride(back, Math.min(home, 0.9999), position);
          heading = result.heading;
          if (home >= 1) heading = lerpAngle(back.heading(back.legs - 1), parked(out), settle);
        }
        van.position.copy(position);
        van.rotation.y = heading;
      });

      wave.scale.set(0.1 + waveSize * 0.55, 1, 0.1 + waveSize * 0.55);
      opacityOf(wave, waveStrength * (1 - waveSize));
    },
  };
};

export default scene;

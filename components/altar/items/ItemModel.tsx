"use client";

import type { ReactNode } from "react";
import type { ItemId } from "@/lib/altar/items";
import { PALETTE } from "@/lib/altar/theme";

// Low-poly model for each item, built in code.
// Each model rests on y = 0 at unit scale; the scene applies ITEM_SCALE.

type V3 = [number, number, number];

function Mat({
  color,
  roughness = 0.85,
  metalness = 0,
  emissive,
  emissiveIntensity,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      flatShading
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissiveIntensity ?? 0}
    />
  );
}

function Box({
  args,
  position,
  rotation,
  color,
  ...m
}: {
  args: V3;
  position?: V3;
  rotation?: V3;
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <Mat color={color} {...m} />
    </mesh>
  );
}

function Cyl({
  args,
  position,
  rotation,
  color,
  ...m
}: {
  args: [number, number, number, number];
  position?: V3;
  rotation?: V3;
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <Mat color={color} {...m} />
    </mesh>
  );
}

// Item colors: muted, but each item reads on its own.
const C = {
  wrench: "#9aa3ab",
  wrenchGrip: "#c9a640",
  notebookCover: "#7a3b33",
  notebookPages: PALETTE.paper,
  drive: "#c98b2e",
  driveTop: "#3d4148",
  keyboard: "#3a3f47",
  key: "#c9c2b0",
  fpga: "#2f5a46",
  chip: "#1f2226",
  pin: "#c7b37a",
  ironBody: "#3b6f8f",
  ironTip: "#b9bcc0",
  rack: "#2c3036",
  rackLed: "#7dffb0",
  chalk: "#b8462f",
  chalkTrim: "#e6dfcf",
  drone: "#2e3238",
  prop: "#d0d4d8",
  mug: "#e8e1d0",
  coffee: "#3b2416",
};

function Wrench() {
  return (
    <group rotation={[0, 0.5, 0]}>
      <Box args={[0.42, 0.04, 0.07]} position={[0, 0.02, 0]} color={C.wrench} metalness={0.4} roughness={0.5} />
      <Box args={[0.16, 0.05, 0.08]} position={[-0.08, 0.025, 0]} color={C.wrenchGrip} />
      <Cyl args={[0.08, 0.08, 0.045, 6]} position={[0.22, 0.022, 0]} color={C.wrench} metalness={0.4} roughness={0.5} />
      <Box args={[0.08, 0.05, 0.05]} position={[0.27, 0.025, 0]} color={PALETTE.woodDark} />
    </group>
  );
}

function Notebook() {
  return (
    <group rotation={[0, -0.25, 0]}>
      <Box args={[0.34, 0.03, 0.42]} position={[0, 0.015, 0]} color={C.notebookCover} />
      <Box args={[0.31, 0.04, 0.39]} position={[0.01, 0.05, 0]} color={C.notebookPages} />
      <Box args={[0.34, 0.025, 0.42]} position={[0, 0.082, 0]} color={C.notebookCover} />
      <Box args={[0.035, 0.1, 0.42]} position={[-0.17, 0.05, 0]} color={PALETTE.woodDark} />
      <Box args={[0.02, 0.005, 0.3]} position={[0.08, 0.097, 0]} color={C.wrenchGrip} />
    </group>
  );
}

function DriveUnit() {
  return (
    <group rotation={[0, 0.3, 0]}>
      <Box args={[0.34, 0.1, 0.34]} position={[0, 0.08, 0]} color={C.drive} />
      <Cyl args={[0.15, 0.15, 0.03, 8]} position={[0, 0.145, 0]} color={C.driveTop} />
      {[
        [-0.13, 0.13],
        [0.13, 0.13],
        [-0.13, -0.13],
        [0.13, -0.13],
      ].map(([x, z], i) => (
        <Cyl key={i} args={[0.04, 0.04, 0.03, 6]} position={[x, 0.035, z]} rotation={[0, 0, Math.PI / 2]} color={C.chip} />
      ))}
    </group>
  );
}

function Keyboard() {
  const keys: V3[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      keys.push([-0.21 + c * 0.07, 0.055, -0.07 + r * 0.07]);
    }
  }
  return (
    <group rotation={[0, -0.12, 0]}>
      <Box args={[0.56, 0.05, 0.24]} position={[0, 0.025, 0]} color={C.keyboard} />
      {keys.map((p, i) => (
        <Box key={i} args={[0.055, 0.025, 0.055]} position={p} color={i === 10 ? C.wrenchGrip : C.key} />
      ))}
    </group>
  );
}

function FpgaChip() {
  const pins: V3[] = [];
  for (let i = 0; i < 6; i++) {
    pins.push([-0.125 + i * 0.05, 0.04, 0.15]);
    pins.push([-0.125 + i * 0.05, 0.04, -0.15]);
  }
  return (
    <group rotation={[0, 0.6, 0]}>
      <Box args={[0.36, 0.025, 0.28]} position={[0, 0.013, 0]} color={C.fpga} />
      <Box args={[0.14, 0.03, 0.14]} position={[0, 0.04, 0]} color={C.chip} />
      {pins.map((p, i) => (
        <Box key={i} args={[0.02, 0.012, 0.03]} position={p} color={C.pin} metalness={0.5} roughness={0.4} />
      ))}
      <Box args={[0.04, 0.012, 0.04]} position={[0.13, 0.032, 0.08]} color="#ff5a3c" emissive="#ff5a3c" emissiveIntensity={0.8} />
    </group>
  );
}

function SolderingIron() {
  return (
    <group rotation={[0, -0.7, 0]}>
      {/* stand */}
      <Cyl args={[0.1, 0.12, 0.03, 7]} position={[0, 0.015, 0]} color={C.chip} />
      <mesh position={[0.02, 0.08, 0]} rotation={[0, 0, -0.9]} castShadow>
        <torusGeometry args={[0.05, 0.012, 4, 8]} />
        <Mat color={C.ironTip} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* iron lying across */}
      <group position={[0.05, 0.1, 0]} rotation={[0, 0, -0.45]}>
        <Cyl args={[0.035, 0.035, 0.26, 7]} rotation={[0, 0, Math.PI / 2]} position={[-0.05, 0, 0]} color={C.ironBody} />
        <Cyl args={[0.015, 0.03, 0.12, 6]} rotation={[0, 0, Math.PI / 2]} position={[0.14, 0, 0]} color={C.ironTip} metalness={0.5} roughness={0.4} />
      </group>
    </group>
  );
}

function ServerRack() {
  return (
    <group rotation={[0, 0.15, 0]}>
      <Box args={[0.26, 0.5, 0.24]} position={[0, 0.25, 0]} color={C.rack} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <Box args={[0.22, 0.08, 0.01]} position={[0, 0.08 + i * 0.11, 0.121]} color="#40464e" />
          <Box
            args={[0.02, 0.02, 0.01]}
            position={[0.08, 0.08 + i * 0.11, 0.128]}
            color={C.rackLed}
            emissive={C.rackLed}
            emissiveIntensity={0.9}
          />
        </group>
      ))}
    </group>
  );
}

function ChalkBag() {
  return (
    <group>
      <Cyl args={[0.13, 0.11, 0.24, 7]} position={[0, 0.12, 0]} color={C.chalk} roughness={1} />
      <Cyl args={[0.14, 0.14, 0.04, 7]} position={[0, 0.245, 0]} color={C.chalkTrim} roughness={1} />
      <Cyl args={[0.12, 0.12, 0.01, 7]} position={[0, 0.268, 0]} color="#f2efe8" roughness={1} />
      <Box args={[0.03, 0.12, 0.06]} position={[0.14, 0.12, 0]} color={C.chalkTrim} />
    </group>
  );
}

function FpvDrone() {
  return (
    <group rotation={[0, 0.4, 0]} position={[0, 0.03, 0]}>
      <Box args={[0.42, 0.025, 0.04]} position={[0, 0.03, 0]} rotation={[0, Math.PI / 4, 0]} color={C.drone} />
      <Box args={[0.42, 0.025, 0.04]} position={[0, 0.03, 0]} rotation={[0, -Math.PI / 4, 0]} color={C.drone} />
      <Box args={[0.11, 0.05, 0.14]} position={[0, 0.06, 0]} color="#c05a2a" />
      <Box args={[0.04, 0.03, 0.03]} position={[0, 0.07, 0.08]} color={C.chip} />
      {[
        [0.15, 0.15],
        [-0.15, 0.15],
        [0.15, -0.15],
        [-0.15, -0.15],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.05, z]}>
          <Cyl args={[0.025, 0.025, 0.04, 6]} color={C.chip} />
          <Cyl args={[0.09, 0.09, 0.006, 8]} position={[0, 0.024, 0]} color={C.prop} roughness={0.6} />
        </group>
      ))}
    </group>
  );
}

function CoffeeMug() {
  return (
    <group rotation={[0, -0.8, 0]}>
      <Cyl args={[0.1, 0.09, 0.2, 8]} position={[0, 0.1, 0]} color={C.mug} roughness={0.6} />
      <Cyl args={[0.085, 0.085, 0.01, 8]} position={[0, 0.19, 0]} color={C.coffee} roughness={0.3} />
      <mesh position={[0.11, 0.1, 0]} castShadow>
        <torusGeometry args={[0.05, 0.016, 4, 8]} />
        <Mat color={C.mug} roughness={0.6} />
      </mesh>
    </group>
  );
}

const MODELS: Record<ItemId, () => ReactNode> = {
  tool: Wrench,
  notebook: Notebook,
  driveUnit: DriveUnit,
  keyboard: Keyboard,
  fpgaChip: FpgaChip,
  solderingIron: SolderingIron,
  serverRack: ServerRack,
  chalkBag: ChalkBag,
  fpvDrone: FpvDrone,
  coffeeMug: CoffeeMug,
};

export { MODEL_SCALE } from "@/lib/altar/itemColliders";

export default function ItemModel({ id }: { id: ItemId }) {
  const Model = MODELS[id];
  return <Model />;
}

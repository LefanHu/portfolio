"use client";

import type { ReactNode } from "react";
import type { ItemId } from "@/lib/altar/items";
import { RELICS } from "@/lib/altar/relics";
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
  brass: "#c9a640",
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
  drone: "#2e3238",
  prop: "#d0d4d8",
  mug: "#e8e1d0",
  coffee: "#3b2416",
  // relics: dark bodies, so the accent glow reads
  substrate: "#25282d",
  die: "#8a9098",
  serverCase: "#34373d",
  reel: "#c7cbd0",
  frame: "#8a5d3b",
  canvas: "#efe8d6",
  sky: "#8fb8d8",
  sea: "#3f7f8f",
  sand: "#d9c08a",
  wax: "#ecd89c",
  honeyDark: "#7a4a12",
  bee: "#e8b923",
  wing: "#e6eef2",
  coin: "#c9a640",
  candleDown: "#8f3a34",
  micGrille: "#9aa0a8",
};

/** Glow strength of a relic's accent parts: just over the bloom threshold. */
const RELIC_GLOW = 1.4;
const glow = (accent: string) => ({ color: accent, emissive: accent, emissiveIntensity: RELIC_GLOW });

function Notebook() {
  return (
    <group rotation={[0, -0.25, 0]}>
      <Box args={[0.34, 0.03, 0.42]} position={[0, 0.015, 0]} color={C.notebookCover} />
      <Box args={[0.31, 0.04, 0.39]} position={[0.01, 0.05, 0]} color={C.notebookPages} />
      <Box args={[0.34, 0.025, 0.42]} position={[0, 0.082, 0]} color={C.notebookCover} />
      <Box args={[0.035, 0.1, 0.42]} position={[-0.17, 0.05, 0]} color={PALETTE.woodDark} />
      <Box args={[0.02, 0.005, 0.3]} position={[0.08, 0.097, 0]} color={C.brass} />
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
        <Box key={i} args={[0.055, 0.025, 0.055]} position={p} color={i === 10 ? C.brass : C.key} />
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

// Relics: one per portfolio project. The relic's accent colours only its glowing parts.

/** LLM Accelerator: a lidded silicon die whose top is a glowing 4x4 systolic array. */
function Accelerator() {
  const a = RELICS.accelerator.accent;
  const cells: V3[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) cells.push([-0.069 + c * 0.046, 0.113, -0.069 + r * 0.046]);
  return (
    <group rotation={[0, 0.35, 0]}>
      <Box args={[0.32, 0.035, 0.32]} position={[0, 0.018, 0]} color={C.substrate} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Box key={`${sx}${sz}`} args={[0.04, 0.008, 0.04]} position={[sx * 0.13, 0.039, sz * 0.13]} color={C.pin} metalness={0.5} roughness={0.4} />
        )),
      )}
      <Box args={[0.25, 0.03, 0.25]} position={[0, 0.05, 0]} color="#3a3f47" />
      <Box args={[0.21, 0.045, 0.21]} position={[0, 0.087, 0]} color={C.die} metalness={0.55} roughness={0.35} />
      {cells.map((p, i) => (
        <Box key={i} args={[0.034, 0.008, 0.034]} position={p} {...glow(a)} />
      ))}
    </group>
  );
}

/** Media Stack: two stacked server units, the top one fronted by a film reel. */
function MediaStack() {
  const a = RELICS.mediaStack.accent;
  return (
    <group rotation={[0, 0.45, 0]}>
      <Box args={[0.3, 0.09, 0.22]} position={[0, 0.045, 0]} color={C.serverCase} />
      <Box args={[0.22, 0.02, 0.01]} position={[-0.02, 0.045, 0.111]} color="#40464e" />
      <Box args={[0.025, 0.02, 0.01]} position={[0.115, 0.045, 0.114]} {...glow(a)} />
      <Box args={[0.26, 0.17, 0.2]} position={[0, 0.175, -0.005]} color={C.serverCase} />
      {/* film reel on the face */}
      <group position={[0, 0.175, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
        <Cyl args={[0.072, 0.072, 0.018, 10]} position={[0, 0.009, 0]} color={C.reel} metalness={0.4} roughness={0.45} />
        {[0, 1, 2, 3, 4].map((i) => {
          const t = (i / 5) * Math.PI * 2;
          return (
            <Cyl key={i} args={[0.017, 0.017, 0.02, 6]} position={[Math.cos(t) * 0.042, 0.011, Math.sin(t) * 0.042]} color={C.chip} />
          );
        })}
        <Cyl args={[0.016, 0.016, 0.024, 6]} position={[0, 0.012, 0]} {...glow(a)} />
      </group>
    </group>
  );
}

/** SDXL LoRA: a small framed beach painting leaning on its strut, a loaded brush in front. */
function SdxlLora() {
  const a = RELICS.sdxlLora.accent;
  return (
    <group rotation={[0, 0.45, 0]}>
      <group position={[0, 0.012, -0.02]} rotation={[-0.25, 0, 0]}>
        <Box args={[0.28, 0.24, 0.025]} position={[0, 0.12, 0]} color={C.frame} />
        <Box args={[0.235, 0.195, 0.01]} position={[0, 0.12, 0.012]} color={C.canvas} roughness={1} />
        <Box args={[0.235, 0.09, 0.012]} position={[0, 0.172, 0.013]} color={C.sky} roughness={1} />
        <Box args={[0.235, 0.05, 0.012]} position={[0, 0.103, 0.013]} color={C.sea} roughness={1} />
        <Box args={[0.235, 0.055, 0.012]} position={[0, 0.05, 0.013]} color={C.sand} roughness={1} />
        <Cyl args={[0.022, 0.022, 0.01, 8]} position={[0.06, 0.18, 0.02]} rotation={[Math.PI / 2, 0, 0]} {...glow(a)} />
      </group>
      {/* back strut */}
      <Box args={[0.03, 0.2, 0.02]} position={[0, 0.09, -0.115]} rotation={[0.35, 0, 0]} color={PALETTE.woodDark} />
      {/* brush */}
      <group position={[0.01, 0.014, 0.06]} rotation={[0, -0.35, 0]}>
        <Cyl args={[0.011, 0.014, 0.2, 6]} position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} color={PALETTE.woodDark} />
        <Cyl args={[0.014, 0.013, 0.04, 6]} position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]} color={C.ironTip} metalness={0.5} roughness={0.4} />
        <Cyl args={[0.002, 0.014, 0.045, 6]} position={[0.13, 0, 0]} rotation={[0, 0, -Math.PI / 2]} {...glow(a)} />
      </group>
    </group>
  );
}

/** HIVE-HQ: a flat slab of pale honeycomb, its cells dark with honey (three aglow), and a bee on top. */
function HiveHq() {
  const a = RELICS.hiveHq.accent;
  const SLAB_R = 0.19;
  const SLAB_H = 0.07;
  const CELL_R = 0.028;
  const d = CELL_R * Math.sqrt(3) + 0.013;
  // Axial hex grid, two rings around the centre (19 cells).
  const cells: [number, number][] = [];
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      if (Math.abs(q + r) <= 2) cells.push([d * (q + r / 2), d * r * (Math.sqrt(3) / 2)]);
    }
  }
  const glowing = new Set([3, 9, 14]);
  return (
    <group rotation={[0, 0.2, 0]}>
      <Cyl args={[SLAB_R, SLAB_R - 0.01, SLAB_H, 6]} position={[0, SLAB_H / 2, 0]} color={C.wax} roughness={0.75} />
      {cells.map(([x, z], i) => (
        <Cyl
          key={i}
          args={[CELL_R, CELL_R, 0.012, 6]}
          position={[x, SLAB_H - 0.005, z]}
          {...(glowing.has(i) ? glow(a) : { color: C.honeyDark, roughness: 0.4 })}
        />
      ))}
      {/* the bee */}
      <group position={[0.07, SLAB_H + 0.02, -0.06]} rotation={[0, 0.6, 0]}>
        <Box args={[0.06, 0.034, 0.036]} color={C.bee} roughness={0.6} />
        {[-0.01, 0.014].map((x) => (
          <Box key={x} args={[0.009, 0.036, 0.038]} position={[x, 0, 0]} color={C.chip} />
        ))}
        <Box args={[0.02, 0.026, 0.028]} position={[0.038, 0.002, 0]} color={C.chip} />
        {[-1, 1].map((side) => (
          <Box
            key={side}
            args={[0.034, 0.004, 0.028]}
            position={[-0.004, 0.022, side * 0.022]}
            rotation={[side * 0.35, 0, 0]}
            color={C.wing}
            roughness={0.3}
          />
        ))}
      </group>
    </group>
  );
}

/** Auto Trader: a stack of coins beside two candlesticks, the rising one aglow. */
function AutoTrader() {
  const a = RELICS.autoTrader.accent;
  const coin = (y: number, x: number, z: number, k: number) => (
    <Cyl key={k} args={[0.065, 0.065, 0.02, 10]} position={[x, y, z]} color={C.coin} metalness={0.55} roughness={0.35} />
  );
  return (
    <group rotation={[0, -0.3, 0]}>
      <Box args={[0.3, 0.02, 0.17]} position={[0, 0.01, 0]} color={C.substrate} />
      {[0, 1, 2, 3, 4, 5].map((i) => coin(0.03 + i * 0.021, -0.075 + Math.sin(i * 1.7) * 0.006, Math.cos(i * 2.1) * 0.006, i))}
      {/* falling candle, then the rising one */}
      <Box args={[0.006, 0.12, 0.006]} position={[0.04, 0.1, 0]} color={C.candleDown} />
      <Box args={[0.034, 0.06, 0.034]} position={[0.04, 0.09, 0]} color={C.candleDown} />
      <Box args={[0.006, 0.2, 0.006]} position={[0.1, 0.13, 0]} color={a} />
      <Box args={[0.034, 0.12, 0.034]} position={[0.1, 0.14, 0]} {...glow(a)} />
    </group>
  );
}

/** Interqu: a stand microphone with a speech bubble beside it, typing. */
function Interqu() {
  const a = RELICS.interqu.accent;
  return (
    <group rotation={[0, 0.45, 0]}>
      <Cyl args={[0.075, 0.085, 0.02, 8]} position={[-0.05, 0.01, 0]} color={C.chip} />
      <Cyl args={[0.01, 0.01, 0.12, 6]} position={[-0.05, 0.08, 0]} color={C.ironTip} metalness={0.5} roughness={0.4} />
      <group position={[-0.05, 0.14, 0]} rotation={[0.25, 0, 0]}>
        <Cyl args={[0.028, 0.02, 0.06, 8]} position={[0, 0.03, 0]} color={C.drone} />
        <Cyl args={[0.044, 0.044, 0.012, 8]} position={[0, 0.066, 0]} {...glow(a)} />
        <mesh position={[0, 0.105, 0]} castShadow receiveShadow>
          <icosahedronGeometry args={[0.048, 0]} />
          <Mat color={C.micGrille} metalness={0.5} roughness={0.45} />
        </mesh>
      </group>
      {/* speech bubble */}
      <group position={[0.1, 0.22, 0.01]}>
        <Box args={[0.15, 0.09, 0.03]} color={PALETTE.paper} roughness={0.7} />
        <mesh position={[-0.05, -0.058, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.025, 0, 0.04, 3]} />
          <Mat color={PALETTE.paper} roughness={0.7} />
        </mesh>
        {[-0.04, 0, 0.04].map((x) => (
          <Box key={x} args={[0.02, 0.02, 0.008]} position={[x, 0, 0.016]} {...glow(a)} />
        ))}
      </group>
    </group>
  );
}

const MODELS: Record<ItemId, () => ReactNode> = {
  notebook: Notebook,
  driveUnit: DriveUnit,
  keyboard: Keyboard,
  fpgaChip: FpgaChip,
  solderingIron: SolderingIron,
  serverRack: ServerRack,
  coffeeMug: CoffeeMug,
  accelerator: Accelerator,
  drone: FpvDrone,
  mediaStack: MediaStack,
  sdxlLora: SdxlLora,
  hiveHq: HiveHq,
  autoTrader: AutoTrader,
  interqu: Interqu,
};

export { MODEL_SCALE } from "@/lib/altar/itemColliders";

export default function ItemModel({ id }: { id: ItemId }) {
  const Model = MODELS[id];
  return <Model />;
}

export type ItemId =
  | "notebook"
  | "driveUnit"
  | "keyboard"
  | "fpgaChip"
  | "solderingIron"
  | "serverRack"
  | "coffeeMug"
  // Project relics (see relics.ts): each one, dropped in alone, opens its project.
  | "accelerator"
  | "drone"
  | "mediaStack"
  | "sdxlLora"
  | "hiveHq"
  | "autoTrader"
  | "interqu";

export interface Item {
  id: ItemId;
  /** Full ROR2-style name, shown on hover. */
  name: string;
  /** Plain label for the recipe board and logbook; always a part of `name`. */
  short: string;
  flavor: string;
}

export const ITEMS: Record<ItemId, Item> = {
  notebook: {
    id: "notebook",
    name: "Dog-Eared Notebook",
    short: "Notebook",
    flavor: "Contains 40% lecture notes, 60% half-finished plans.",
  },
  driveUnit: {
    id: "driveUnit",
    name: "Warehouse Drive Unit",
    short: "Drive Unit",
    flavor: "Carries a thousand shelves. Never once asked why.",
  },
  keyboard: {
    id: "keyboard",
    name: "Well-Worn Keyboard",
    short: "Keyboard",
    flavor: "Three keys are fading. They are, of course, the good ones.",
  },
  fpgaChip: {
    id: "fpgaChip",
    name: "Reconfigurable FPGA Chip",
    short: "FPGA Chip",
    flavor: "Teaches itself to think faster. Gets warm about it.",
  },
  solderingIron: {
    id: "solderingIron",
    name: "Temperamental Soldering Iron",
    short: "Soldering Iron",
    flavor: "Joins what was broken. Burns what was nearby.",
  },
  serverRack: {
    id: "serverRack",
    name: "Closet Server Rack",
    short: "Server Rack",
    flavor: "Hums at 3 a.m. so your movies never buffer.",
  },
  coffeeMug: {
    id: "coffeeMug",
    name: "Bottomless Coffee Mug",
    short: "Coffee Mug",
    flavor: "Converts deadlines into code. Side effects include optimism.",
  },
  accelerator: {
    id: "accelerator",
    name: "Systolic LLM Accelerator",
    short: "LLM Accelerator",
    flavor: "Multiplies matrices in perfect lockstep. Thinks in eight bits.",
  },
  drone: {
    id: "drone",
    name: "Self-Built Drone",
    short: "Drone",
    flavor: "GPS, compass and custom firmware. Still prefers to improvise.",
  },
  mediaStack: {
    id: "mediaStack",
    name: "Self-Hosted Media Stack",
    short: "Media Stack",
    flavor: "A dozen containers behind one login. The couch never knows.",
  },
  sdxlLora: {
    id: "sdxlLora",
    name: "Fine-Tuned SDXL LoRA",
    short: "SDXL LoRA",
    flavor: "Paints beaches it has never seen. Counts fingers most of the time.",
  },
  hiveHq: {
    id: "hiveHq",
    name: "Hackathon Hive of HIVE-HQ",
    short: "HIVE-HQ",
    flavor: "Built in a weekend to keep the whole hive safe.",
  },
  autoTrader: {
    id: "autoTrader",
    name: "Tireless Auto Trader",
    short: "Auto Trader",
    flavor: "Buys here, sells there, sleeps never.",
  },
  interqu: {
    id: "interqu",
    name: "Interqu's Patient Microphone",
    short: "Interqu",
    flavor: "Asks the hard questions, so the real ones feel easy.",
  },
};

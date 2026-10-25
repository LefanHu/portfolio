export type ItemId =
  | "tool"
  | "notebook"
  | "driveUnit"
  | "keyboard"
  | "fpgaChip"
  | "solderingIron"
  | "serverRack"
  | "chalkBag"
  | "fpvDrone"
  | "coffeeMug";

export interface Item {
  id: ItemId;
  /** Full ROR2-style name, shown on hover. */
  name: string;
  /** Plain label for the recipe board and logbook; always a part of `name`. */
  short: string;
  flavor: string;
}

export const ITEMS: Record<ItemId, Item> = {
  tool: {
    id: "tool",
    name: "Oversized Wrench",
    short: "Wrench",
    flavor: "Fixes everything it touches. Leaves a few things dented.",
  },
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
  chalkBag: {
    id: "chalkBag",
    name: "Chalk Bag of Questionable Grip",
    short: "Chalk Bag",
    flavor: "Dust to the hands, courage to the heart. Mostly dust.",
  },
  fpvDrone: {
    id: "fpvDrone",
    name: "Rebuilt FPV Quadcopter",
    short: "FPV Quadcopter",
    flavor: "Crashes are just unscheduled rapid disassembly.",
  },
  coffeeMug: {
    id: "coffeeMug",
    name: "Bottomless Coffee Mug",
    short: "Coffee Mug",
    flavor: "Converts deadlines into code. Side effects include optimism.",
  },
};

import type { ItemId } from "./items";

export type { ItemId };

export type SectionId = "about" | "experience" | "projects" | "skills" | "interests" | "contact";

export interface Recipe {
  section: SectionId;
  items: [ItemId, ItemId];
  artifact: { name: string; accent: string };
  title: string;
}

export const RECIPES: Recipe[] = [
  {
    section: "about",
    items: ["tool", "notebook"],
    artifact: { name: "Artifact of Foundations", accent: "#ffb347" },
    title: "About & Education",
  },
  {
    section: "experience",
    items: ["driveUnit", "keyboard"],
    artifact: { name: "Artifact of Throughput", accent: "#ff6b4a" },
    title: "Experience",
  },
  {
    section: "projects",
    items: ["fpgaChip", "solderingIron"],
    artifact: { name: "Artifact of Tinkering", accent: "#b78cff" },
    title: "Projects",
  },
  {
    section: "skills",
    items: ["serverRack", "keyboard"],
    artifact: { name: "Artifact of Uptime", accent: "#7dff8a" },
    title: "Skills",
  },
  {
    section: "interests",
    items: ["chalkBag", "fpvDrone"],
    artifact: { name: "Artifact of Altitude", accent: "#ff5ca8" },
    title: "Interests",
  },
  {
    section: "contact",
    items: ["coffeeMug", "notebook"],
    artifact: { name: "Artifact of Correspondence", accent: "#ffe45c" },
    title: "Resume & Contact",
  },
];

export type MatchResult =
  | { kind: "empty" }
  | { kind: "partial" }
  | { kind: "match"; recipe: Recipe }
  | { kind: "invalid" };

const key = (a: ItemId, b: ItemId) => [a, b].sort().join("+");

export function matchRecipe(contents: readonly ItemId[]): MatchResult {
  if (contents.length === 0) return { kind: "empty" };
  if (contents.length === 1) return { kind: "partial" };
  if (contents.length > 2) return { kind: "invalid" };
  const k = key(contents[0], contents[1]);
  const recipe = RECIPES.find((r) => key(r.items[0], r.items[1]) === k);
  return recipe ? { kind: "match", recipe } : { kind: "invalid" };
}

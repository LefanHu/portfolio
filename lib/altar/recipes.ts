import type { ItemId } from "./items";
import { isRelic, type RelicId } from "./relics";

export type { ItemId };

/** The main site's sections that have a recipe. Each one is an anchor on `/` (SITE_ANCHORS). */
export type SectionId = "projects" | "experience" | "coding" | "contact";

export interface Recipe {
  section: SectionId;
  items: [ItemId, ItemId];
  artifact: { name: string; accent: string };
  title: string;
}

export const RECIPES: Recipe[] = [
  {
    section: "projects",
    items: ["fpgaChip", "solderingIron"],
    artifact: { name: "Artifact of Tinkering", accent: "#b78cff" },
    title: "Projects",
  },
  {
    section: "experience",
    items: ["driveUnit", "keyboard"],
    artifact: { name: "Artifact of Throughput", accent: "#ff6b4a" },
    title: "Experience",
  },
  {
    section: "coding",
    items: ["serverRack", "keyboard"],
    artifact: { name: "Artifact of Uptime", accent: "#7dff8a" },
    title: "Coding Stats",
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
  /** Exactly one relic and nothing else: it opens its project. */
  | { kind: "relic"; relic: RelicId }
  | { kind: "invalid" };

const key = (a: ItemId, b: ItemId) => [a, b].sort().join("+");

export function matchRecipe(contents: readonly ItemId[]): MatchResult {
  if (contents.length === 0) return { kind: "empty" };
  if (contents.length === 1) return isRelic(contents[0]) ? { kind: "relic", relic: contents[0] } : { kind: "partial" };
  // Relics belong to no recipe: any pair that includes one is wrong.
  if (contents.length > 2 || contents.some(isRelic)) return { kind: "invalid" };
  const k = key(contents[0], contents[1]);
  const recipe = RECIPES.find((r) => key(r.items[0], r.items[1]) === k);
  return recipe ? { kind: "match", recipe } : { kind: "invalid" };
}

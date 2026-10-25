import type { ProjectSlug } from "@/lib/portfolioProjects";
import type { ItemId } from "./items";

/** The project relics: physics items on the relic stand, one per portfolio project. */
export type RelicId = "accelerator" | "drone" | "mediaStack" | "sdxlLora" | "hiveHq" | "autoTrader" | "interqu";

/**
 * Each relic's project and accent (its plinth rune and glowing parts).
 * Key order is the stand's order, from the desk side round to the cauldron's front.
 */
export const RELICS: Record<RelicId, { slug: ProjectSlug; accent: string }> = {
  accelerator: { slug: "llm-accelerator", accent: "#4cc9ff" },
  drone: { slug: "drone", accent: "#ff4f6d" },
  mediaStack: { slug: "media-stack", accent: "#ff9f1c" },
  sdxlLora: { slug: "stable-diffusion", accent: "#e86bff" },
  hiveHq: { slug: "hive-hq", accent: "#ffd23f" },
  autoTrader: { slug: "auto-trader", accent: "#3ddc84" },
  interqu: { slug: "interqu", accent: "#8f7bff" },
};

export function isRelic(id: ItemId): id is RelicId {
  return Object.hasOwn(RELICS, id);
}

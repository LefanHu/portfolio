import {
  acceleratorProject,
  projectCardId,
  projects,
  SITE_ANCHORS,
  type ProjectSlug,
} from "@/lib/portfolioProjects";
import { RECIPES, type SectionId } from "./recipes";
import { RELICS } from "./relics";

/** Anything the altar can project: a main-site section (a recipe) or a project (a relic). */
export type ViewId = SectionId | ProjectSlug;

const SECTION_VIEWS = RECIPES.map((r) => r.section);
const PROJECT_VIEWS = Object.values(RELICS).map((r) => r.slug);

/** Sections first (recipe order), then projects (relic stand order). */
export const ALL_VIEWS: ViewId[] = [...SECTION_VIEWS, ...PROJECT_VIEWS];

const PROJECT_BY_SLUG = new Map<ProjectSlug, { name: string; href: string }>(
  [...projects, acceleratorProject].map((p) => [p.slug, p]),
);
const ACCENT_BY_SLUG = new Map<ProjectSlug, string>(Object.values(RELICS).map((r) => [r.slug, r.accent]));

const recipeOf = (section: SectionId) => RECIPES.find((r) => r.section === section);
const isSection = (id: ViewId): id is SectionId => SECTION_VIEWS.includes(id as SectionId);

/** Where on the real site a view lives: a page, and an element id to scroll to (null: the top). */
export function viewTarget(id: ViewId): { path: string; anchor: string | null } {
  if (isSection(id)) return { path: "/", anchor: SITE_ANCHORS[id] };
  const { href } = PROJECT_BY_SLUG.get(id)!;
  // Internal projects have their own page; external ones are cards in the gallery.
  return href.startsWith("/") ? { path: href, anchor: null } : { path: "/project-gallery", anchor: projectCardId(id) };
}

export function viewTitle(id: ViewId): string {
  return isSection(id) ? recipeOf(id)!.title : PROJECT_BY_SLUG.get(id)!.name;
}

export function viewAccent(id: ViewId): string {
  return isSection(id) ? recipeOf(id)!.artifact.accent : ACCENT_BY_SLUG.get(id)!;
}

/** The small line above the title: the artifact's name for a section, "Relic" for a project. */
export function viewKicker(id: ViewId): string {
  return isSection(id) ? recipeOf(id)!.artifact.name : "Relic";
}

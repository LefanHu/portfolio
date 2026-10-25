import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RECIPES } from "@/lib/altar/recipes";
import { RELICS } from "@/lib/altar/relics";
import { ALL_VIEWS, viewAccent, viewKicker, viewTarget, viewTitle } from "@/lib/altar/views";
import { acceleratorProject, projects } from "@/lib/portfolioProjects";

describe("viewTarget", () => {
  it("sends a section to its anchor on the main page", () => {
    expect(viewTarget("experience")).toEqual({ path: "/", anchor: "experience" });
    expect(viewTarget("coding")).toEqual({ path: "/", anchor: "coding" });
  });

  it("sends an internal project to its own page", () => {
    expect(viewTarget("drone")).toEqual({ path: "/projects/drone", anchor: null });
    expect(viewTarget("llm-accelerator")).toEqual({ path: "/projects/llm-accelerator", anchor: null });
  });

  it("every internal project link has a page on disk", () => {
    const internal = [...projects, acceleratorProject].filter((p) => p.href.startsWith("/"));
    expect(internal.length).toBeGreaterThan(0);
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    for (const { href } of internal) {
      const page = path.join(root, "app/(portfolio)/projects", href.split("/").pop()!, "page.tsx");
      expect(existsSync(page), href).toBe(true);
    }
  });

  it("sends an external project to its card in the gallery", () => {
    expect(viewTarget("hive-hq")).toEqual({ path: "/project-gallery", anchor: "project-hive-hq" });
    expect(viewTarget("interqu")).toEqual({ path: "/project-gallery", anchor: "project-interqu" });
  });
});

describe("ALL_VIEWS", () => {
  it("lists the four sections first, then every relic's project", () => {
    expect(ALL_VIEWS.slice(0, 4)).toEqual(RECIPES.map((r) => r.section));
    expect(ALL_VIEWS.slice(4).sort()).toEqual(Object.values(RELICS).map((r) => r.slug).sort());
  });

  it("never collides a section id with a project slug", () => {
    expect(new Set(ALL_VIEWS).size).toBe(ALL_VIEWS.length);
    const slugs = [...projects.map((p) => p.slug), acceleratorProject.slug];
    for (const r of RECIPES) expect(slugs).not.toContain(r.section);
  });
});

describe("view labels", () => {
  it("titles and tints a section by its recipe", () => {
    const coding = RECIPES.find((r) => r.section === "coding")!;
    expect(viewTitle("coding")).toBe("Coding Stats");
    expect(viewAccent("coding")).toBe(coding.artifact.accent);
    expect(viewKicker("coding")).toBe(coding.artifact.name);
  });

  it("titles a project by its name and tints it by its relic", () => {
    expect(viewTitle("hive-hq")).toBe("HIVE-HQ");
    expect(viewTitle("llm-accelerator")).toBe(acceleratorProject.name);
    expect(viewAccent("hive-hq")).toBe(RELICS.hiveHq.accent);
    expect(viewKicker("hive-hq")).toBe("Relic");
  });

  it("labels every view", () => {
    for (const v of ALL_VIEWS) {
      expect(viewTitle(v), v).not.toBe("");
      expect(viewAccent(v), v).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

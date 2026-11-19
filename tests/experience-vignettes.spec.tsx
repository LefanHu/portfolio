import React from "react";
import * as THREE from "three";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import Vignette from "@/components/portfolio/vignettes/Vignette";
import { isVignetteId, VIGNETTE_CAPTIONS, type VignetteId } from "@/components/portfolio/vignettes/captions";
import { hash, loop, ride, route } from "@/components/portfolio/vignettes/kit";
import { setMotionPaused } from "@/components/portfolio/vignettes/motion";
import { createPalette, parseCssColor, readPalette } from "@/components/portfolio/vignettes/palette";
import { SCENES } from "@/components/portfolio/vignettes/scenes";
import type { Palette } from "@/components/portfolio/vignettes/types";
import { experienceRoles } from "@/lib/portfolio/experience";

const ids = Object.keys(VIGNETTE_CAPTIONS) as VignetteId[];

/** A palette of distinct colours; scenes are built without a renderer. */
function testPalette(): Palette {
  const palette = createPalette();
  Object.values(palette).forEach((color, index) => color.setHSL(index / 12, 0.6, 0.5));
  return palette;
}

/** Everything `update` can change that affects the picture, as plain numbers. */
function pose(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const values: number[] = [];
  root.traverse((object) => {
    values.push(...object.matrixWorld.elements, object.visible ? 1 : 0);
    if (object instanceof THREE.InstancedMesh) {
      values.push(object.count, ...object.instanceMatrix.array, ...(object.instanceColor?.array ?? []));
    }
    const { material } = object as Partial<THREE.Mesh>;
    for (const item of Array.isArray(material) ? material : material ? [material] : []) {
      values.push(item.opacity, item.visible ? 1 : 0);
      const { color } = item as Partial<THREE.MeshBasicMaterial>;
      if (color) values.push(color.r, color.g, color.b);
    }
  });
  return values;
}

describe("vignette captions", () => {
  it("has one for every role, and none for a role that does not exist", () => {
    expect([...ids].sort()).toEqual(experienceRoles.map((role) => role.id).sort());
    expect(isVignetteId("nowhere")).toBe(false);
  });

  it("keeps each to one short line with no full stop", () => {
    for (const caption of Object.values(VIGNETTE_CAPTIONS)) {
      expect(caption.length).toBeLessThanOrEqual(60);
      expect(caption).not.toMatch(/[.!]$/);
    }
  });
});

describe.each(ids)("the %s scene", (id) => {
  it("draws something", () => {
    const { root } = SCENES[id](testPalette());
    let drawn = 0;
    root.traverse((object) => {
      if ((object as Partial<THREE.Mesh>).geometry) drawn += 1;
    });
    expect(drawn).toBeGreaterThan(0);
  });

  it("poses with finite numbers at any time", () => {
    const vignette = SCENES[id](testPalette());
    for (const t of [0, vignette.still ?? 0, 0.016, 3.7, 59.99, 1234.5]) {
      vignette.update(t);
      expect(pose(vignette.root).every(Number.isFinite)).toBe(true);
    }
  });

  it("is a pure function of time: a moment looks the same whenever it is visited", () => {
    const vignette = SCENES[id](testPalette());
    vignette.update(5.3);
    const first = pose(vignette.root);
    for (const t of [0, 41.7, 9.1, 300]) vignette.update(t);
    vignette.update(5.3);
    expect(pose(vignette.root)).toEqual(first);

    // And the same on a scene built afresh, as after a theme switch.
    const rebuilt = SCENES[id](testPalette());
    rebuilt.update(5.3);
    expect(pose(rebuilt.root)).toEqual(first);
  });

  it("moves", () => {
    const vignette = SCENES[id](testPalette());
    vignette.update(1);
    const before = pose(vignette.root);
    vignette.update(2.3);
    expect(pose(vignette.root)).not.toEqual(before);
  });
});

describe("palette", () => {
  it("reads the colour forms a browser reports", () => {
    expect(parseCssColor("#ff8000")).toEqual([1, 128 / 255, 0, 1]);
    expect(parseCssColor(" #6FE6FF33 ")).toEqual([111 / 255, 230 / 255, 1, 0.2]);
    expect(parseCssColor("#f00")).toEqual([1, 0, 0, 1]);
    expect(parseCssColor("rgb(255, 0, 51)")).toEqual([1, 0, 0.2, 1]);
    expect(parseCssColor("rgba(0, 0, 0, 0.5)")).toEqual([0, 0, 0, 0.5]);
    expect(parseCssColor("rgb(0 0 0 / 25%)")).toEqual([0, 0, 0, 0.25]);
    expect(parseCssColor("color(srgb 1 0.5 0 / 0.5)")).toEqual([1, 0.5, 0, 0.5]);
    expect(parseCssColor("")).toBeNull();
    expect(parseCssColor("tomato")).toBeNull();
    expect(parseCssColor("#12345")).toBeNull();
  });

  it("flattens a translucent token onto the surface", () => {
    const element = document.createElement("div");
    element.style.setProperty("--pane-raise", "#000000");
    element.style.setProperty("--line", "#ffffff80");
    element.style.setProperty("--ink", "#ff0000");
    document.body.append(element);
    const palette = createPalette();
    readPalette(palette, element);
    element.remove();

    expect(palette.ink.getHexString()).toBe("ff0000");
    expect(palette.line.getHexString()).toBe("808080");
    // A token that cannot be read falls back to the surface, so it draws nothing rather than black.
    expect(palette.rune.getHexString()).toBe("000000");
  });
});

describe("kit", () => {
  it("wraps a loop in both directions", () => {
    expect(loop(2.5, 2)).toBeCloseTo(0.25);
    expect(loop(-0.5, 2)).toBeCloseTo(0.75);
    expect(loop(0, 2, 0.4)).toBeCloseTo(0.4);
  });

  it("gives the same pseudo-random number for the same index", () => {
    expect(hash(7)).toBe(hash(7));
    expect(hash(7)).not.toBe(hash(8));
    expect(hash(7)).toBeGreaterThanOrEqual(0);
    expect(hash(7)).toBeLessThan(1);
  });

  it("walks a route by distance and drives it corner to corner", () => {
    const square = route([[0, 0, 0], [2, 0, 0], [2, 0, 1], [0, 0, 1]], true);
    expect(square.length).toBe(6);
    expect(square.legs).toBe(4);
    const point = new THREE.Vector3();
    expect(square.at(0.5, point).toArray()).toEqual([2, 0, 1]);
    expect(square.at(1.25, point).toArray()).toEqual([1.5, 0, 0]);
    expect(square.heading(0)).toBeCloseTo(Math.PI / 2);
    expect(square.heading(-1)).toBeCloseTo(Math.PI);

    const start = ride(square, 0, point);
    expect(point.toArray()).toEqual([0, 0, 0]);
    expect(start.along).toBe(0);
    const end = ride(square, 0.999999, point);
    expect(end.along).toBeCloseTo(1);
    expect(point.distanceTo(new THREE.Vector3(0, 0, 0))).toBeLessThan(1e-3);
  });
});

describe("vignette figure", () => {
  it("is a figure with its caption, and the canvas hidden from assistive technology", () => {
    const { container } = render(<Vignette id="telus" caption={VIGNETTE_CAPTIONS.telus} />);

    const figure = screen.getByRole("figure");
    expect(within(figure).getByText(VIGNETTE_CAPTIONS.telus).tagName).toBe("FIGCAPTION");
    expect(figure).toHaveAttribute("data-state", "waiting");
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
  });

  it("sits on every role's card", () => {
    render(<Experiences />);

    for (const role of experienceRoles) {
      const card = screen.getByRole("article", { name: role.title });
      expect(within(card).getByRole("figure")).toHaveTextContent(VIGNETTE_CAPTIONS[role.id as VignetteId]);
    }
  });
});

describe("pausing the vignettes", () => {
  afterEach(() => setMotionPaused(false));

  it("has one button for the section that pauses and plays them all", () => {
    render(<Experiences />);

    fireEvent.click(screen.getByRole("button", { name: "Pause animations" }));
    expect(screen.queryByRole("button", { name: "Pause animations" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Play animations" }));
    expect(screen.getByRole("button", { name: "Pause animations" })).toBeInTheDocument();
  });

  it("starts paused for a visitor who asks for reduced motion", async () => {
    vi.resetModules();
    const matchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: query.includes("reduce") })) as unknown as typeof window.matchMedia;
    try {
      const fresh = await import("@/components/portfolio/vignettes/motion");
      expect(fresh.motionPaused()).toBe(true);
      fresh.setMotionPaused(false);
      expect(fresh.motionPaused()).toBe(false);
    } finally {
      window.matchMedia = matchMedia;
    }
  });
});

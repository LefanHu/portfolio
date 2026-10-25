import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import RecipeBoard from "@/components/altar/ui/RecipeBoard";
import Overlay from "@/components/altar/ui/Overlay";
import { boardLayout } from "@/lib/altar/board";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { CAMERA_HOME } from "@/lib/altar/layout";
import { RECIPES } from "@/lib/altar/recipes";
import { useAltarStore } from "@/lib/altar/store";
import { CAMERA } from "@/lib/altar/theme";

beforeEach(() => {
  sessionStorage.clear();
  useAltarStore.setState({
    phase: "idle",
    activeSection: null,
    contents: [],
    unlocked: [],
    theme: "dark",
  });
});

const setPhase = (phase: "idle" | "revealing" | "viewing" | "returning") =>
  act(() => useAltarStore.setState({ phase, activeSection: phase === "idle" ? null : "projects" }));

const pressEscape = () => act(() => void fireEvent.keyDown(window, { key: "Escape" }));

describe("ITEMS short names", () => {
  it("every item has a short label that appears in its full name", () => {
    for (const id of Object.keys(ITEMS) as ItemId[]) {
      expect(ITEMS[id].short.length).toBeGreaterThan(0);
      expect(ITEMS[id].name).toContain(ITEMS[id].short);
    }
  });
});

describe("RecipeBoard", () => {
  it("lists all six recipes as item + item → title", () => {
    render(<RecipeBoard />);
    const entries = screen.getAllByRole("listitem");
    expect(entries).toHaveLength(6);
    RECIPES.forEach((r, i) => {
      expect(entries[i]).toHaveTextContent(r.title);
      expect(entries[i]).toHaveTextContent(ITEMS[r.items[0]].short);
      expect(entries[i]).toHaveTextContent(ITEMS[r.items[1]].short);
    });
    const experience = entries[RECIPES.findIndex((r) => r.section === "experience")];
    expect(within(experience).getByText(/Drive Unit/)).toBeInTheDocument();
    expect(within(experience).getByText(/Keyboard/)).toBeInTheDocument();
  });

  it("marks unlocked entries and counts them", () => {
    useAltarStore.setState({ unlocked: ["experience", "skills"] });
    render(<RecipeBoard />);
    const entries = screen.getAllByRole("listitem");
    const marked = entries.filter((e) => e.getAttribute("data-unlocked") === "true");
    expect(marked.map((e) => e.getAttribute("data-section")).sort()).toEqual(["experience", "skills"]);
    for (const e of marked) expect(within(e).getByText("Unlocked")).toBeInTheDocument();
    const locked = entries.find((e) => e.getAttribute("data-section") === "projects")!;
    expect(within(locked).queryByText("Unlocked")).toBeNull();
    expect(screen.getByText(/2 of 6 unlocked/i)).toBeInTheDocument();
  });

  it("hides itself while a section is open", () => {
    const { container } = render(<RecipeBoard />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-visible", "true");
    expect(root).not.toHaveAttribute("aria-hidden");
    setPhase("viewing");
    expect(root).toHaveAttribute("data-visible", "false");
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("follows the theme", () => {
    const { container } = render(<RecipeBoard />);
    expect(container.firstElementChild).toHaveAttribute("data-theme", "dark");
    act(() => useAltarStore.getState().toggleTheme());
    expect(container.firstElementChild).toHaveAttribute("data-theme", "light");
  });
});

describe("Overlay", () => {
  const logbookButton = () => screen.getByRole("button", { name: "Logbook" });
  const drawer = () => screen.getByRole("dialog", { name: /logbook/i });

  it("opens a section from the logbook and closes the drawer", () => {
    render(<Overlay />);
    fireEvent.click(logbookButton());
    fireEvent.click(within(drawer()).getByRole("button", { name: /Projects/ }));
    const s = useAltarStore.getState();
    expect(s.phase).toBe("revealing");
    expect(s.activeSection).toBe("projects");
    expect(screen.queryByRole("dialog")).toBeNull();
    // the opener is now compact; focus lands on the new section's Back button
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /back/i }));
  });

  it("lists all six sections with their artifacts, unlocked ones marked", () => {
    useAltarStore.setState({ unlocked: ["about"] });
    render(<Overlay />);
    fireEvent.click(logbookButton());
    const entries = within(drawer()).getAllByRole("listitem");
    expect(entries).toHaveLength(6);
    RECIPES.forEach((r, i) => {
      expect(entries[i]).toHaveTextContent(r.title);
      expect(entries[i]).toHaveTextContent(r.artifact.name);
    });
    const about = entries.find((e) => e.getAttribute("data-section") === "about")!;
    expect(about).toHaveAttribute("data-unlocked", "true");
    expect(within(about).getByText("Unlocked")).toBeInTheDocument();
    const contact = entries.find((e) => e.getAttribute("data-section") === "contact")!;
    expect(contact).toHaveAttribute("data-unlocked", "false");
  });

  it("disables logbook entries unless idle", () => {
    render(<Overlay />);
    fireEvent.click(logbookButton());
    const buttons = () => within(drawer()).getAllByRole("button", { name: /Artifact of/ });
    expect(buttons()).toHaveLength(6);
    for (const b of buttons()) expect(b).toBeEnabled();
    setPhase("viewing");
    for (const b of buttons()) expect(b).toBeDisabled();
    fireEvent.click(buttons()[0]);
    expect(useAltarStore.getState().activeSection).toBe("projects");
  });

  it("moves focus into the drawer and back to the Logbook button", () => {
    render(<Overlay />);
    const opener = logbookButton();
    opener.focus();
    fireEvent.click(opener);
    expect(drawer()).toContainElement(document.activeElement as HTMLElement);
    fireEvent.click(within(drawer()).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(logbookButton());
  });

  it("Escape closes the drawer (and only the drawer)", () => {
    render(<Overlay />);
    fireEvent.click(logbookButton());
    pressEscape();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(logbookButton());
    expect(useAltarStore.getState().phase).toBe("idle");
  });

  it("ignores auto-repeated Escape", () => {
    setPhase("viewing");
    render(<Overlay />);
    fireEvent.click(logbookButton());
    act(() => void fireEvent.keyDown(window, { key: "Escape", repeat: true }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(useAltarStore.getState().phase).toBe("viewing");
    pressEscape();
    act(() => void fireEvent.keyDown(window, { key: "Escape", repeat: true }));
    expect(useAltarStore.getState().phase).toBe("viewing");
  });

  it("links to the classic site while idle only", () => {
    render(<Overlay />);
    expect(screen.getByRole("link", { name: /classic site/i }).getAttribute("href")).toBe("/");
    setPhase("viewing");
    expect(screen.queryByRole("link", { name: /classic site/i })).toBeNull();
  });

  it("Escape with the drawer open while viewing closes just the drawer", () => {
    setPhase("viewing");
    render(<Overlay />);
    fireEvent.click(logbookButton());
    pressEscape();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useAltarStore.getState().phase).toBe("viewing");
    expect(document.activeElement).toBe(logbookButton());
    pressEscape();
    expect(useAltarStore.getState().phase).toBe("returning");
  });

  it("keeps Tab inside the open drawer", () => {
    render(<Overlay />);
    fireEvent.click(logbookButton());
    const focusables = within(drawer()).getAllByRole("button");
    const last = focusables[focusables.length - 1];
    last.focus();
    fireEvent.keyDown(drawer(), { key: "Tab" });
    expect(document.activeElement).toBe(focusables[0]);
    fireEvent.keyDown(drawer(), { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("shows no Back button while idle", () => {
    render(<Overlay />);
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });

  it("shows Back while viewing; Escape returns", () => {
    setPhase("viewing");
    render(<Overlay />);
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    pressEscape();
    expect(useAltarStore.getState().phase).toBe("returning");
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });

  it("Back also works while the reveal is still running", () => {
    setPhase("revealing");
    render(<Overlay />);
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(useAltarStore.getState().phase).toBe("returning");
  });

  it("Escape does nothing while idle", () => {
    render(<Overlay />);
    pressEscape();
    expect(useAltarStore.getState().phase).toBe("idle");
  });

  it("the theme button flips the theme and its label", () => {
    render(<Overlay />);
    const btn = screen.getByRole("button", { name: "Switch to light theme" });
    fireEvent.click(btn);
    expect(useAltarStore.getState().theme).toBe("light");
    expect(btn).toHaveAccessibleName("Switch to dark theme");
    fireEvent.click(btn);
    expect(useAltarStore.getState().theme).toBe("dark");
  });

  it("shows a first-visit hint that can open the logbook or be dismissed", () => {
    render(<Overlay />);
    const hint = screen.getByRole("note");
    expect(hint).toHaveTextContent(/drag two items/i);
    fireEvent.click(within(hint).getByRole("button", { name: /logbook/i }));
    expect(drawer()).toBeInTheDocument();
    pressEscape();
    fireEvent.click(within(screen.getByRole("note")).getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("drops the hint after the first unlock", () => {
    const { rerender } = render(<Overlay />);
    expect(screen.getByRole("note")).toBeInTheDocument();
    act(() => useAltarStore.setState({ unlocked: ["about"] }));
    rerender(<Overlay />);
    expect(screen.queryByRole("note")).toBeNull();
  });
});

describe("boardLayout", () => {
  const fov = CAMERA.fov;
  const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]);
  const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
  const len = (a: number[]) => Math.hypot(...a);

  /** Project a world point with the home camera to CSS px. */
  function project(p: number[], vw: number, vh: number) {
    const f = sub(CAMERA_HOME.target, CAMERA_HOME.position).map((v, _, a) => v / len(a));
    const r = [-f[2], 0, f[0]].map((v, _, a) => v / len(a));
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const d = sub(p, CAMERA_HOME.position);
    const z = dot(d, f);
    const k = vh / (2 * z * Math.tan((fov * Math.PI) / 360));
    return { x: vw / 2 + dot(d, r) * k, y: vh / 2 - dot(d, u) * k, scale: k };
  }

  it.each([
    [1280, 720],
    [1600, 900],
    [1440, 900],
    [2560, 1440],
  ])("sits left of the island, on screen, at 1:1 scale (%i×%i)", (vw, vh) => {
    const b = boardLayout({ width: vw, height: vh });
    const c = project(b.position, vw, vh);
    // centre lands where the layout asked for it
    expect(c.x).toBeCloseTo(b.screen.x, 3);
    expect(c.y).toBeCloseTo(b.screen.y, 3);
    // left edge on screen, right edge in the left quarter-ish of the view
    expect(c.x - b.cssWidth / 2).toBeGreaterThanOrEqual(16);
    expect(c.x + b.cssWidth / 2).toBeLessThanOrEqual(vw * 0.27);
    // 1 CSS px renders as 1 screen px at the home camera
    const worldPerCssPx = b.distanceFactor / 400;
    expect(worldPerCssPx * c.scale).toBeCloseTo(1, 6);
    // legible base font
    expect(b.fontSize).toBeGreaterThanOrEqual(13.5);
  });

  it("gives the same pose in camera space, at the home target's depth", () => {
    const b = boardLayout({ width: 1600, height: 900 });
    const depth = len(sub(CAMERA_HOME.target, CAMERA_HOME.position));
    expect(b.local[2]).toBeCloseTo(-depth, 6);
    const c = project(b.position, 1600, 900);
    expect(b.local[0] * c.scale).toBeCloseTo(c.x - 800, 3);
    expect(b.local[1] * c.scale).toBeCloseTo(450 - c.y, 3);
  });

  it("faces the home camera squarely", () => {
    const b = boardLayout({ width: 1600, height: 900 });
    const [tilt, yaw] = b.rotation;
    const n = [Math.cos(tilt) * Math.sin(yaw), -Math.sin(tilt), Math.cos(tilt) * Math.cos(yaw)];
    const toCam = sub(CAMERA_HOME.position, CAMERA_HOME.target).map((v, _, a) => v / len(a));
    expect(dot(n, toCam)).toBeCloseTo(1, 6);
  });
});

import fs from "node:fs";
import path from "node:path";
import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import PlaygroundPage, { metadata } from "@/app/(portfolio)/js/page";
import Playground from "@/components/playground/Playground";
import ScriptRunner from "@/components/playground/ScriptRunner";
import {
  DEFAULT_EXPERIMENT,
  EXPERIMENTS,
  experimentHref,
  findExperiment,
  neighbour,
} from "@/components/playground/experiments";

const sceneTestIds: Record<string, string> = {
  VoxelFunctionField3D: "voxel-function-field-3d",
  NeonTunnel3D: "neon-tunnel-3d",
  ParticleWave3D: "particle-wave-3d",
  OrbitalNodes3D: "orbital-nodes-3d",
  CrystalLattice3D: "crystal-lattice-3d",
};

// The real scenes need WebGL; stand-ins that record how the stage drives them.
vi.mock("@/components/portfolio/js/VoxelFunctionField3D", () => ({
  default: (props: { paused?: boolean }) => <div data-testid="voxel-function-field-3d" data-paused={String(props.paused)} />,
}));
vi.mock("@/components/portfolio/js/NeonTunnel3D", () => ({
  default: (props: { paused?: boolean }) => <div data-testid="neon-tunnel-3d" data-paused={String(props.paused)} />,
}));
vi.mock("@/components/portfolio/js/ParticleWave3D", () => ({
  default: (props: { paused?: boolean }) => <div data-testid="particle-wave-3d" data-paused={String(props.paused)} />,
}));
vi.mock("@/components/portfolio/js/OrbitalNodes3D", () => ({
  default: (props: { paused?: boolean }) => <div data-testid="orbital-nodes-3d" data-paused={String(props.paused)} />,
}));
vi.mock("@/components/portfolio/js/CrystalLattice3D", () => ({
  default: (props: { paused?: boolean }) => <div data-testid="crystal-lattice-3d" data-paused={String(props.paused)} />,
}));

const scriptsDir = path.join(process.cwd(), "public", "scripts");
const scenesDir = path.join(process.cwd(), "components", "portfolio", "js");

function visit(search: string) {
  window.history.replaceState(null, "", `/js${search}`);
}

function picker() {
  return screen.getByRole("navigation", { name: "Experiments" });
}

function currentItems() {
  return within(picker())
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "true");
}

/** The frame of the experiment on top of the stage. */
function topFrame(title: string) {
  const frames = screen.getAllByTitle(`${title}: canvas experiment`);
  return frames[frames.length - 1] as HTMLIFrameElement;
}

/** What the sandboxed harness sends once its script has loaded. */
function announceReady(frame: HTMLIFrameElement, source: MessageEventSource | null = frame.contentWindow) {
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { data: { source: "playground-frame", ready: true }, source }));
  });
}

function preferReducedMotion() {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

const defaultMatchMedia = vi.mocked(window.matchMedia).getMockImplementation();

beforeEach(() => {
  visit("");
  // jsdom has no layout, and so no element scrolling.
  Element.prototype.scrollBy = vi.fn();
});

afterEach(() => {
  vi.mocked(window.matchMedia).mockImplementation(defaultMatchMedia!);
});

describe("playground catalogue", () => {
  it("gives every experiment a unique id, a title and a description", () => {
    const ids = EXPERIMENTS.map((experiment) => experiment.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(EXPERIMENTS.map((experiment) => experiment.title)).size).toBe(EXPERIMENTS.length);

    for (const experiment of EXPERIMENTS) {
      expect(experiment.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(experiment.title.length).toBeGreaterThan(0);
      expect(experiment.title).not.toMatch(/\.(js|tsx)$/);
      expect(experiment.description.length).toBeGreaterThan(20);
    }
  });

  it("points every script experiment at a file in public/scripts, and lists every file there", () => {
    const listed = EXPERIMENTS.filter((experiment) => experiment.kind === "script").map((experiment) => experiment.file);
    for (const file of listed) {
      expect(fs.existsSync(path.join(scriptsDir, file)), `${file} exists`).toBe(true);
    }

    const onDisk = fs.readdirSync(scriptsDir).filter((file) => file.endsWith(".js"));
    expect([...listed].sort()).toEqual(onDisk.sort());
  });

  it("points every scene experiment at a component file", () => {
    const scenes = EXPERIMENTS.filter((experiment) => experiment.kind === "scene");
    expect(scenes).toHaveLength(Object.keys(sceneTestIds).length);
    for (const scene of scenes) {
      expect(scene.file).toBe(`${scene.scene}.tsx`);
      expect(fs.existsSync(path.join(scenesDir, scene.file)), `${scene.file} exists`).toBe(true);
    }
  });

  it("resolves ids, and the file names that links used before the redesign", () => {
    expect(findExperiment("starfield-warp")?.title).toBe("Starfield warp");
    expect(findExperiment("starfield_warp.js")?.id).toBe("starfield-warp");
    expect(findExperiment("neon_tunnel_3d.js")?.id).toBe("neon-tunnel-3d");
    expect(findExperiment("voxel_function_field.js")?.kind).toBe("scene");
    expect(findExperiment("nope")).toBeUndefined();
    expect(findExperiment(null)).toBeUndefined();
  });

  it("steps through the list in both directions, wrapping at the ends", () => {
    const first = EXPERIMENTS[0];
    const last = EXPERIMENTS[EXPERIMENTS.length - 1];
    expect(neighbour(first, 1)).toBe(EXPERIMENTS[1]);
    expect(neighbour(first, -1)).toBe(last);
    expect(neighbour(last, 1)).toBe(first);
  });

  it("opens on a piece that runs by itself", () => {
    expect(DEFAULT_EXPERIMENT.file).not.toBe("balls.js");
    expect(DEFAULT_EXPERIMENT.kind).toBe("script");
  });
});

describe("sandboxed script runner", () => {
  it("runs the script in a frame that can execute scripts and nothing else", () => {
    render(<ScriptRunner scriptSrc="/scripts/balls.js" title="Bouncing balls: canvas experiment" />);

    const frame = screen.getByTitle("Bouncing balls: canvas experiment");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(frame.getAttribute("srcdoc")).toContain("/scripts/balls.js");
    expect(frame.getAttribute("srcdoc")).toContain('id="jsCanvas"');
    expect(frame.getAttribute("srcdoc")).toContain('id="canvasContainer"');
  });

  it("gates the script's animation loop on visibility, the pause message and reduced motion", () => {
    render(<ScriptRunner scriptSrc="/scripts/balls.js" title="Balls" />);
    const harness = screen.getByTitle("Balls").getAttribute("srcdoc") ?? "";

    expect(harness.indexOf("window.requestAnimationFrame = ")).toBeGreaterThan(-1);
    expect(harness.indexOf("window.requestAnimationFrame = ")).toBeLessThan(harness.indexOf("/scripts/balls.js"));
    expect(harness).toContain("document.hidden");
    expect(harness).toContain("visibilitychange");
    expect(harness).toContain("prefers-reduced-motion: reduce");
  });

  it("reports ready once and tells the frame whether to animate", () => {
    const onReady = vi.fn();
    const { rerender } = render(<ScriptRunner scriptSrc="/scripts/balls.js" title="Balls" onReady={onReady} />);
    const frame = screen.getByTitle("Balls") as HTMLIFrameElement;
    const post = vi.spyOn(frame.contentWindow!, "postMessage").mockImplementation(() => {});

    // A message from anywhere but the frame itself is ignored.
    announceReady(frame, window);
    expect(onReady).not.toHaveBeenCalled();

    announceReady(frame);
    announceReady(frame);
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenLastCalledWith({ source: "playground", running: true, initial: true }, "*");

    rerender(<ScriptRunner scriptSrc="/scripts/balls.js" title="Balls" onReady={onReady} running={false} />);
    expect(post).toHaveBeenLastCalledWith({ source: "playground", running: false, initial: false }, "*");
  });
});

describe("playground page", () => {
  it("has a title, a description and a single top-level heading", () => {
    expect(metadata.title).toBe("Playground");
    expect(String(metadata.description).length).toBeGreaterThan(40);

    render(<PlaygroundPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Playground" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("opens on the default experiment and lists every experiment by its title", () => {
    render(<Playground />);

    expect(screen.getByRole("heading", { level: 2, name: DEFAULT_EXPERIMENT.title })).toBeInTheDocument();
    expect(topFrame(DEFAULT_EXPERIMENT.title).getAttribute("srcdoc")).toContain(`/scripts/${DEFAULT_EXPERIMENT.file}`);

    const links = within(picker()).getAllByRole("link");
    expect(links).toHaveLength(EXPERIMENTS.length);
    EXPERIMENTS.forEach((experiment, index) => {
      expect(links[index]).toHaveAttribute("href", experimentHref(experiment.id));
      expect(links[index]).toHaveTextContent(experiment.title);
    });

    expect(currentItems()).toHaveLength(1);
    expect(currentItems()[0]).toHaveTextContent(DEFAULT_EXPERIMENT.title);
  });

  it.each(EXPERIMENTS.map((experiment) => [experiment.id, experiment] as const))(
    "shows %s when the URL asks for it",
    async (id, experiment) => {
      visit(`?script=${id}`);
      render(<Playground />);

      expect(screen.getByRole("heading", { level: 2, name: experiment.title })).toBeInTheDocument();
      expect(screen.getByText(experiment.description, { selector: "h2 ~ p" })).toBeInTheDocument();
      expect(currentItems()[0]).toHaveTextContent(experiment.title);
      expect(window.location.search).toBe(`?script=${id}`);

      if (experiment.kind === "scene") {
        expect(await screen.findByTestId(sceneTestIds[experiment.scene])).toBeInTheDocument();
        expect(document.querySelector("iframe")).toBeNull();
        expect(screen.queryByRole("link", { name: /view source/i })).not.toBeInTheDocument();
        return;
      }

      const frame = topFrame(experiment.title);
      expect(frame).toHaveAttribute("sandbox", "allow-scripts");
      expect(frame.getAttribute("srcdoc")).toContain(`/scripts/${experiment.file}`);

      const source = screen.getByRole("link", { name: `View source: ${experiment.file} (opens in a new tab)` });
      expect(source).toHaveAttribute("href", `/scripts/${experiment.file}`);
      expect(source).toHaveAttribute("target", "_blank");
    },
  );

  it("switches experiment from the list: the URL, the marker, the stage and the announcement follow", () => {
    render(<Playground />);

    fireEvent.click(within(picker()).getByRole("link", { name: /Hue trail/ }));

    expect(window.location.pathname).toBe("/js");
    expect(window.location.search).toBe("?script=hue-effect");
    expect(currentItems()).toHaveLength(1);
    expect(currentItems()[0]).toHaveTextContent("Hue trail");
    expect(screen.getByRole("heading", { level: 2, name: "Hue trail" })).toBeInTheDocument();
    expect(topFrame("Hue trail").getAttribute("srcdoc")).toContain("/scripts/hue_effect.js");
    expect(screen.getByRole("status")).toHaveTextContent("Showing Hue trail");
  });

  it("leaves modified clicks to the browser, so a link can open in a new tab", () => {
    render(<Playground />);

    // Stands in for the browser (jsdom cannot open a tab) and notes whether the click was left alone.
    let leftAlone: boolean | undefined;
    const browser = (event: MouseEvent) => {
      leftAlone = !event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener("click", browser);
    fireEvent.click(within(picker()).getByRole("link", { name: /Hue trail/ }), { ctrlKey: true });
    document.removeEventListener("click", browser);

    expect(leftAlone).toBe(true);
    expect(window.location.search).toBe("");
    expect(screen.getByRole("heading", { level: 2, name: DEFAULT_EXPERIMENT.title })).toBeInTheDocument();
  });

  it("steps to the next and previous experiment from the stage", () => {
    visit("?script=starfield-warp");
    render(<Playground />);
    const starfield = findExperiment("starfield-warp")!;

    fireEvent.click(screen.getByRole("link", { name: `Next experiment: ${neighbour(starfield, 1).title}` }));
    expect(window.location.search).toBe(`?script=${neighbour(starfield, 1).id}`);

    fireEvent.click(screen.getByRole("link", { name: `Previous experiment: ${starfield.title}` }));
    fireEvent.click(screen.getByRole("link", { name: `Previous experiment: ${neighbour(starfield, -1).title}` }));
    expect(window.location.search).toBe(`?script=${neighbour(starfield, -1).id}`);
    expect(screen.getByRole("heading", { level: 2, name: neighbour(starfield, -1).title })).toBeInTheDocument();
  });

  it("falls back to the default for an unknown ?script= and drops it from the URL", () => {
    visit("?script=does-not-exist");
    render(<Playground />);

    expect(screen.getByRole("heading", { level: 2, name: DEFAULT_EXPERIMENT.title })).toBeInTheDocument();
    expect(currentItems()[0]).toHaveTextContent(DEFAULT_EXPERIMENT.title);
    expect(window.location.pathname).toBe("/js");
    expect(window.location.search).toBe("");
  });

  it("still honours an old file-name link and rewrites it to the new id", () => {
    visit("?script=neon_tunnel_3d.js");
    render(<Playground />);

    expect(screen.getByRole("heading", { level: 2, name: "Neon tunnel" })).toBeInTheDocument();
    expect(window.location.search).toBe("?script=neon-tunnel-3d");
  });

  it("follows the URL when the browser's history moves", () => {
    render(<Playground />);

    act(() => {
      visit("?script=lava-lamp");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByRole("heading", { level: 2, name: "Lava lamp" })).toBeInTheDocument();
  });

  it("keeps the outgoing experiment on stage until the incoming one is ready, then removes it", () => {
    vi.useFakeTimers();
    try {
      render(<Playground />);
      const outgoing = topFrame(DEFAULT_EXPERIMENT.title);
      announceReady(outgoing);
      expect(outgoing.closest("[aria-busy]")).toHaveAttribute("aria-busy", "false");

      fireEvent.click(within(picker()).getByRole("link", { name: /Starfield warp/ }));
      const incoming = topFrame("Starfield warp");
      expect(outgoing).toBeInTheDocument();
      expect(incoming.closest("[aria-busy]")).toHaveAttribute("aria-busy", "true");
      expect(outgoing.parentElement).toHaveAttribute("inert");

      announceReady(incoming);
      expect(incoming.closest("[aria-busy]")).toHaveAttribute("aria-busy", "false");
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(outgoing).not.toBeInTheDocument();
      expect(incoming).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("restarts the current experiment in a fresh frame", () => {
    render(<Playground />);
    const before = topFrame(DEFAULT_EXPERIMENT.title);

    fireEvent.click(screen.getByRole("button", { name: "Restart" }));

    const after = topFrame(DEFAULT_EXPERIMENT.title);
    expect(after).not.toBe(before);
    expect(after.getAttribute("srcdoc")).toContain(`/scripts/${DEFAULT_EXPERIMENT.file}`);
    expect(window.location.search).toBe("");
  });

  it("pauses and resumes a script through its frame", () => {
    render(<Playground />);
    const frame = topFrame(DEFAULT_EXPERIMENT.title);
    const post = vi.spyOn(frame.contentWindow!, "postMessage").mockImplementation(() => {});
    announceReady(frame);

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(post).toHaveBeenLastCalledWith({ source: "playground", running: false, initial: false }, "*");
    expect(screen.getByText("Paused")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(post).toHaveBeenLastCalledWith({ source: "playground", running: true, initial: false }, "*");
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("pauses and resumes a scene", async () => {
    visit("?script=crystal-lattice-3d");
    render(<Playground />);
    const scene = await screen.findByTestId("crystal-lattice-3d");
    expect(scene).toHaveAttribute("data-paused", "false");
    expect(screen.getByText("Drag to orbit, scroll or pinch to zoom")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByTestId("crystal-lattice-3d")).toHaveAttribute("data-paused", "true");
  });

  it("starts paused for visitors who ask for reduced motion, and plays when they say so", async () => {
    preferReducedMotion();
    visit("?script=particle-wave-3d");
    render(<Playground />);

    expect(await screen.findByTestId("particle-wave-3d")).toHaveAttribute("data-paused", "true");
    expect(screen.getByText(/Paused for reduced motion/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByTestId("particle-wave-3d")).toHaveAttribute("data-paused", "false");
  });

  it("offers fullscreen only where the browser supports it", () => {
    const { unmount } = render(<Playground />);
    expect(screen.queryByRole("button", { name: /fullscreen/i })).not.toBeInTheDocument();
    unmount();

    Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: true });
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Element.prototype.requestFullscreen = requestFullscreen;
    try {
      render(<Playground />);
      fireEvent.click(screen.getByRole("button", { name: "Enter fullscreen" }));
      expect(requestFullscreen).toHaveBeenCalledTimes(1);
      // The whole stage goes fullscreen, controls included.
      expect(requestFullscreen.mock.contexts[0]).toBe(screen.getByRole("region", { name: DEFAULT_EXPERIMENT.title }));
    } finally {
      Reflect.deleteProperty(document, "fullscreenEnabled");
      Reflect.deleteProperty(Element.prototype, "requestFullscreen");
    }
  });

  it("gives every control an accessible name", () => {
    render(<Playground />);
    const stage = screen.getByRole("region", { name: DEFAULT_EXPERIMENT.title });

    for (const control of [...within(stage).getAllByRole("button"), ...within(stage).getAllByRole("link")]) {
      expect(control).toHaveAccessibleName();
    }
  });
});

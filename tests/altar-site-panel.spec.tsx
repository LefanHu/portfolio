import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import SitePanel, { REVEAL_ANYWAY_MS, type PanelStage } from "@/components/altar/projection/SitePanel";
import { frameNavigation } from "@/components/altar/projection/siteFrame";
import { contact } from "@/lib/portfolio/contact";
import { RELICS } from "@/lib/altar/relics";
import { THEMES } from "@/lib/altar/theme";
import type { Theme } from "@/lib/altar/store";
import type { ViewId } from "@/lib/altar/views";

/** A stand-in for the real site: what the frame would load at `/`. */
const FIXTURE = `
  <nav><a id="home" href="/">Home</a><button id="site-toggle" data-theme-toggle>Theme</button></nav>
  <main>
    <h1>Lefan's Portfolio</h1>
    <a id="altar" href="/altar">Try the 3D version</a>
    <section id="projects">
      <h2>Favorite Projects</h2>
      <div class="rounded-2xl"><p>Card</p></div>
      <a id="drone" href="/projects/drone">Drone</a>
      <a id="drone-tab" href="/projects/drone" target="_blank">Drone (new tab)</a>
      <a id="hash" href="#experience">To experience</a>
    </section>
    <section id="experience"><h2>Experience</h2><p id="roles">Roles</p></section>
    <div id="scroller" style="overflow-y: auto"><p id="inside">Long list</p></div>
    <a id="github" href="https://github.com/LefanHu">GitHub</a>
    <a id="mail" href="mailto:l2hu@uwaterloo.ca">Mail</a>
  </main>
`;

let rendered: ReturnType<typeof render> | null = null;

function mount(view: ViewId = "experience", stage: PanelStage = "wire", theme?: Theme) {
  rendered = render(<SitePanel view={view} stage={stage} theme={theme} />);
  const frame = rendered.container.querySelector("iframe")!;
  const win = frame.contentWindow as Window & typeof globalThis;
  const doc = frame.contentDocument!;
  // the iframe is its own realm: mock layout on its Element, not the parent's
  const scrollIntoView = vi.fn();
  win.Element.prototype.scrollIntoView = scrollIntoView;
  win.Element.prototype.getBoundingClientRect = () =>
    ({ top: 0, left: 0, right: 100, bottom: 20, width: 100, height: 20, x: 0, y: 0 }) as DOMRect;
  // jsdom doesn't load the frame's src: give its (empty) document the fixture
  const html = doc.createElement("html");
  html.append(doc.createElement("head"), doc.createElement("body"));
  doc.append(html);
  doc.body.innerHTML = FIXTURE;
  return { ...rendered, frame, win, doc, scrollIntoView };
}

/**
 * Click `el` in the frame and report whether the panel prevented the default. A
 * listener on `el` itself (after the panel's capture handler) then cancels it,
 * so jsdom doesn't try to navigate; it doesn't run if the panel stopped the event.
 */
function clickPrevented(el: Element, init: MouseEventInit = {}): boolean {
  const win = el.ownerDocument.defaultView as Window & typeof globalThis;
  let seen: boolean | null = null;
  const last = (e: Event) => {
    seen = e.defaultPrevented;
    e.preventDefault();
  };
  el.addEventListener("click", last);
  const ev = new win.MouseEvent("click", { bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(ev);
  el.removeEventListener("click", last);
  return seen ?? ev.defaultPrevented;
}

/** Let the frame's pending idle work run (jsdom has no requestIdleCallback: a timeout stands in). */
const idle = (win: Window) => new Promise((resolve) => win.setTimeout(resolve, 5));

/** Records Escape keydowns that reach the parent window (where the Overlay listens). */
function parentEscapes() {
  const keys: string[] = [];
  const onKey = (e: KeyboardEvent) => keys.push(e.key);
  window.addEventListener("keydown", onKey);
  return { keys, stop: () => window.removeEventListener("keydown", onKey) };
}

describe("SitePanel", () => {
  let open: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    open = vi.spyOn(window, "open").mockImplementation(() => null);
  });
  afterEach(() => {
    rendered?.unmount();
    rendered = null;
    open.mockRestore();
  });

  it("frames the real site at the view's page, under a title that survives in-frame navigation", () => {
    const { frame } = mount("experience");
    expect(frame.getAttribute("src")).toBe("/");
    expect(frame.getAttribute("title")).toBe("Lefan's website (live)");
  });

  it("an external project frames the gallery; an internal one its own page", () => {
    const { frame, unmount } = mount("hive-hq");
    expect(frame.getAttribute("src")).toBe("/project-gallery");
    unmount();
    rendered = null;
    expect(mount("drone").frame.getAttribute("src")).toBe("/projects/drone");
  });

  it("scrolls the view's anchor to the top on load", () => {
    const { frame, doc, scrollIntoView } = mount("experience");
    fireEvent.load(frame);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(doc.getElementById("experience"));
    expect(scrollIntoView.mock.calls[0][0]).toMatchObject({ block: "start" });
    // a later page in the frame (an in-frame navigation) is not pulled to the view's anchor
    fireEvent.load(frame);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("scrolling to the anchor leaves the altar page's own scroll offsets alone", () => {
    const { frame, container, scrollIntoView } = mount("experience");
    // a browser without scrollIntoView's `container` option scrolls the frame's ancestors too
    let top = 0;
    Object.defineProperty(container, "scrollTop", { configurable: true, get: () => top, set: (v) => (top = v) });
    container.scrollTo = ((o: ScrollToOptions) => (top = o.top ?? top)) as typeof container.scrollTo;
    scrollIntoView.mockImplementation(() => (top = 900));
    fireEvent.load(frame);
    expect(scrollIntoView).toHaveBeenCalled();
    expect(top).toBe(0);
  });

  it("injects the wire stylesheet once across loads", () => {
    const { frame, doc } = mount();
    fireEvent.load(frame);
    fireEvent.load(frame);
    expect(doc.querySelectorAll("style#ap-wire")).toHaveLength(1);
  });

  it("wire at load: marks the stage, then tags the visible blocks once the frame is idle", async () => {
    const { frame, doc, win } = mount("experience", "wire");
    fireEvent.load(frame);
    expect(doc.documentElement.dataset.apStage).toBe("wire");
    // not before: the site may still be hydrating
    expect(doc.querySelectorAll("[data-wire]")).toHaveLength(0);
    await idle(win);
    expect(doc.querySelectorAll("[data-wire]").length).toBeGreaterThanOrEqual(3);
  });

  it("filled at load: no wire blocks", async () => {
    const { frame, doc, win } = mount("experience", "filled");
    fireEvent.load(frame);
    await idle(win);
    expect(doc.documentElement.dataset.apStage).toBe("filled");
    expect(doc.querySelectorAll("[data-wire]")).toHaveLength(0);
  });

  it("no tagging once the stage has moved on before the frame is idle", async () => {
    const { frame, doc, win, rerender } = mount("experience", "wire");
    fireEvent.load(frame);
    rerender(<SitePanel view="experience" stage="filled" />);
    await idle(win);
    expect(doc.querySelectorAll("[data-wire]")).toHaveLength(0);
  });

  it("stage changes after load reach the frame's document", () => {
    const { frame, doc, rerender } = mount("experience", "wire");
    fireEvent.load(frame);
    rerender(<SitePanel view="experience" stage="filled" />);
    expect(doc.documentElement.dataset.apStage).toBe("filled");
    rerender(<SitePanel view="experience" stage="dissolve" />);
    expect(doc.documentElement.dataset.apStage).toBe("dissolve");
  });

  describe("theme", () => {
    afterEach(() => localStorage.clear());

    it("the framed site is put in the altar's theme at load, and follows a later switch", () => {
      const { frame, doc, rerender } = mount("experience", "filled", "light");
      fireEvent.load(frame);
      expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
      rerender(<SitePanel view="experience" stage="filled" theme="dark" />);
      expect(doc.documentElement.getAttribute("data-theme")).toBe("dark");
      // the stage attribute is untouched by it
      expect(doc.documentElement.dataset.apStage).toBe("filled");
    });

    it("overrides the theme the site picked for itself (an unsaved ?theme= on the altar)", () => {
      localStorage.setItem("theme", "dark");
      const { frame, doc, win } = mount("experience", "wire", "light");
      doc.documentElement.setAttribute("data-theme", "dark");
      const storage = vi.fn();
      win.addEventListener("storage", storage);
      fireEvent.load(frame);
      expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
      // nothing saved says light: the site's own theme module is not asked
      expect(storage).not.toHaveBeenCalled();
    });

    it("hands a saved switch to the site's own theme module, as the storage event it listens for", () => {
      const { frame, doc, win, rerender } = mount("experience", "filled", "dark");
      fireEvent.load(frame);
      // the site's module (lib/theme.ts) re-reads the saved choice on a storage event
      const keys: (string | null)[] = [];
      win.addEventListener("storage", (e) => {
        keys.push((e as StorageEvent).key);
        doc.documentElement.setAttribute("data-theme", localStorage.getItem("theme")!);
      });
      localStorage.setItem("theme", "light");
      rerender(<SitePanel view="experience" stage="filled" theme="light" />);
      expect(keys).toEqual(["theme"]);
      expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("a saved switch still lands when the site is not listening (not hydrated yet)", () => {
      const { frame, doc, rerender } = mount("experience", "filled", "dark");
      fireEvent.load(frame);
      localStorage.setItem("theme", "light");
      rerender(<SitePanel view="experience" stage="filled" theme="light" />);
      expect(doc.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("while framed, the site's own theme toggle is hidden (the altar's switch is beside the pane)", () => {
      const { frame, doc, win } = mount("experience", "filled");
      const toggle = doc.getElementById("site-toggle")!;
      expect(win.getComputedStyle(toggle).display).not.toBe("none");
      fireEvent.load(frame);
      expect(win.getComputedStyle(toggle).display).toBe("none");
    });

    it("the wire is drawn in the theme's own line colour", () => {
      const { frame, doc, win, rerender } = mount("experience", "wire", "dark");
      fireEvent.load(frame);
      const wire = () => win.getComputedStyle(doc.documentElement).getPropertyValue("--ap-wire").trim();
      expect(wire()).toBe(THEMES.dark.projection.line);
      rerender(<SitePanel view="experience" stage="wire" theme="light" />);
      expect(wire()).toBe(THEMES.light.projection.line);
    });
  });

  it("the frame is hidden and unclickable until its first load", () => {
    const { frame } = mount();
    expect(frame).not.toBeVisible();
    expect(frame.style.pointerEvents).toBe("none");
    fireEvent.load(frame);
    expect(frame).toBeVisible();
    expect(frame.style.pointerEvents).toBe("");
  });

  describe("while the first page loads", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
    });
    afterEach(() => vi.useRealTimers());

    it("the header says Loading… (politely, to assistive tech) until the frame is ready", () => {
      const { frame } = mount("projects", "filled");
      const status = screen.getByText("Loading…");
      expect(status.closest(".ap-head")).not.toBeNull();
      expect(status).toHaveClass("ap-eyebrow");
      expect(status).toHaveAttribute("aria-live", "polite");
      act(() => void vi.advanceTimersByTime(REVEAL_ANYWAY_MS / 2));
      expect(status).toHaveTextContent("Loading…");
      fireEvent.load(frame);
      expect(screen.queryByText("Loading…")).toBeNull();
    });

    it(`a frame still not ready after ${REVEAL_ANYWAY_MS / 1000} s is shown and clickable anyway`, () => {
      const { frame } = mount("projects", "filled");
      act(() => void vi.advanceTimersByTime(REVEAL_ANYWAY_MS - 1));
      expect(frame).not.toBeVisible();
      expect(frame.style.pointerEvents).toBe("none");
      act(() => void vi.advanceTimersByTime(1));
      expect(frame).toBeVisible();
      expect(frame.style.pointerEvents).toBe("");
      // still loading, and says so
      expect(screen.getByText("Loading…")).toBeInTheDocument();
    });
  });

  describe("a new page in the frame (an in-frame navigation)", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
    });
    afterEach(() => vi.useRealTimers());

    /** Swap the frame onto a fresh document (still parsing) as the browser does on navigation. */
    function navigate(frame: HTMLIFrameElement, win: Window & typeof globalThis) {
      const next = win.document.implementation.createHTMLDocument("");
      next.body.innerHTML = FIXTURE;
      let readyState: DocumentReadyState = "loading";
      Object.defineProperty(next, "readyState", { configurable: true, get: () => readyState });
      win.dispatchEvent(new win.Event("pagehide"));
      Object.defineProperty(frame, "contentDocument", { configurable: true, get: () => next });
      return { next, setReadyState: (s: DocumentReadyState) => (readyState = s) };
    }
    const frames = (n: number) => act(() => void vi.advanceTimersByTime(n * 16));

    it("is prepared once its document is interactive, before its load, and only once", () => {
      const { frame, win, scrollIntoView } = mount("projects", "filled");
      fireEvent.load(frame);
      const { next, setReadyState } = navigate(frame, win);
      frames(5);
      // still parsing: not yet
      expect(next.querySelectorAll("style#ap-wire")).toHaveLength(0);
      setReadyState("interactive");
      frames(1);
      expect(next.querySelectorAll("style#ap-wire")).toHaveLength(1);
      // its load comes later and changes nothing
      fireEvent.load(frame);
      frames(5);
      expect(next.querySelectorAll("style#ap-wire")).toHaveLength(1);
      const esc = parentEscapes();
      win.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape" }));
      esc.stop();
      expect(esc.keys).toEqual(["Escape"]);
      // a later page starts at its top: the view's anchor was for the first page only
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    it("starts in the altar's theme", () => {
      const { frame, win } = mount("projects", "filled", "light");
      fireEvent.load(frame);
      const { next, setReadyState } = navigate(frame, win);
      next.documentElement.setAttribute("data-theme", "dark");
      setReadyState("interactive");
      frames(1);
      expect(next.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("stops watching after a while; load still prepares it", () => {
      const { frame, win } = mount("projects", "filled");
      fireEvent.load(frame);
      const { next, setReadyState } = navigate(frame, win);
      act(() => void vi.advanceTimersByTime(10_000));
      setReadyState("interactive");
      frames(5);
      expect(next.querySelectorAll("style#ap-wire")).toHaveLength(0);
      fireEvent.load(frame);
      expect(next.querySelectorAll("style#ap-wire")).toHaveLength(1);
    });

    it("a page at /altar closes the projection instead of showing the altar inside itself", () => {
      const { frame, win } = mount("projects", "filled");
      fireEvent.load(frame);
      const { next, setReadyState } = navigate(frame, win);
      Object.defineProperty(next, "URL", { configurable: true, get: () => "http://localhost:3000/altar" });
      const esc = parentEscapes();
      setReadyState("interactive");
      frames(1);
      esc.stop();
      expect(esc.keys).toEqual(["Escape"]);
      expect(next.querySelectorAll("style#ap-wire")).toHaveLength(0);
    });
  });

  it("a first page at /altar closes the projection too", () => {
    const { frame, doc } = mount("projects", "filled");
    Object.defineProperty(doc, "URL", { configurable: true, get: () => "http://localhost:3000/altar" });
    const esc = parentEscapes();
    fireEvent.load(frame);
    esc.stop();
    expect(esc.keys).toEqual(["Escape"]);
    expect(doc.querySelectorAll("style#ap-wire")).toHaveLength(0);
  });

  it("external links open in a new tab", () => {
    const { frame, doc } = mount("contact", "filled");
    fireEvent.load(frame);
    expect(clickPrevented(doc.getElementById("github")!)).toBe(true);
    expect(open).toHaveBeenCalledWith(contact.github, "_blank", "noopener,noreferrer");
  });

  it("links back to /altar close the view instead of nesting the altar", () => {
    const { frame, doc } = mount("projects", "filled");
    fireEvent.load(frame);
    const esc = parentEscapes();
    expect(clickPrevented(doc.getElementById("altar")!)).toBe(true);
    esc.stop();
    expect(esc.keys).toEqual(["Escape"]);
  });

  describe("internal links", () => {
    // the frame realm's Location is unforgeable (jsdom can't spy on its replace): spy the seam
    let replace: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      replace = vi.spyOn(frameNavigation, "replace").mockImplementation(() => {});
    });
    afterEach(() => replace.mockRestore());

    it("navigate the frame in place, adding no history entry", () => {
      const { frame, doc, win } = mount("projects", "filled");
      fireEvent.load(frame);
      const esc = parentEscapes();
      expect(clickPrevented(doc.getElementById("drone")!)).toBe(true);
      esc.stop();
      expect(replace).toHaveBeenCalledWith(win, "http://localhost:3000/projects/drone");
      expect(esc.keys).toEqual([]);
      expect(open).not.toHaveBeenCalled();
    });

    it("leave modified and non-primary clicks, new-tab links, same-page hashes and mailto: to the browser", () => {
      const { frame, doc } = mount("projects", "filled");
      fireEvent.load(frame);
      const drone = doc.getElementById("drone")!;
      expect(clickPrevented(drone, { ctrlKey: true })).toBe(false);
      expect(clickPrevented(drone, { metaKey: true })).toBe(false);
      expect(clickPrevented(drone, { button: 1 })).toBe(false);
      expect(clickPrevented(doc.getElementById("drone-tab")!)).toBe(false);
      expect(clickPrevented(doc.getElementById("hash")!)).toBe(false);
      expect(clickPrevented(doc.getElementById("mail")!)).toBe(false);
      expect(replace).not.toHaveBeenCalled();
      expect(open).not.toHaveBeenCalled();
    });
  });

  it("Escape inside the frame reaches the parent once, however many loads", () => {
    const { frame, win } = mount("projects", "filled");
    fireEvent.load(frame);
    fireEvent.load(frame);
    const esc = parentEscapes();
    win.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape" }));
    win.dispatchEvent(new win.KeyboardEvent("keydown", { key: "a" }));
    esc.stop();
    expect(esc.keys).toEqual(["Escape"]);
  });

  it("after unmount the frame's listeners are gone", () => {
    const { frame, win, unmount } = mount("projects", "filled");
    fireEvent.load(frame);
    unmount();
    rendered = null;
    const esc = parentEscapes();
    win.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape" }));
    esc.stop();
    expect(esc.keys).toEqual([]);
  });

  it("a wheel in the frame scrolls the nearest scrollable box (in JS) and is prevented", async () => {
    const { frame, doc, win } = mount("experience", "filled");
    fireEvent.load(frame);
    const box = doc.getElementById("scroller")!;
    let top = 0;
    Object.defineProperties(box, {
      scrollHeight: { configurable: true, get: () => 1000 },
      clientHeight: { configurable: true, get: () => 100 },
      scrollTop: { configurable: true, get: () => top, set: (v: number) => (top = v) },
    });
    const ev = new win.WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true });
    doc.getElementById("inside")!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(top).toBe(120));
  });

  it("wire: blocks off the frame's viewport stay untagged", async () => {
    const { frame, doc, win } = mount("experience", "wire");
    const roles = doc.getElementById("roles")!;
    roles.getBoundingClientRect = () =>
      ({ top: 4000, left: 0, right: 100, bottom: 4020, width: 100, height: 20, x: 0, y: 4000 }) as DOMRect;
    fireEvent.load(frame);
    await idle(win);
    expect(roles.hasAttribute("data-wire")).toBe(false);
    expect(doc.querySelector("#experience h2")!.getAttribute("data-wire")).toBe("text");
  });

  it("contact keeps the résumé action in the header", () => {
    mount("contact", "filled");
    const resume = screen.getByRole("link", { name: "Download résumé" });
    expect(resume.getAttribute("href")).toBe(contact.resumeHref);
    expect(resume.getAttribute("target")).toBe("_blank");
    expect(resume.closest(".ap-head")).not.toBeNull();
  });

  it("a project view: relic kicker, project name, relic accent", () => {
    const { container } = mount("hive-hq", "filled");
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--proj-accent")).toBe(RELICS.hiveHq.accent);
    expect(within(root).getByText("Relic")).toBeInTheDocument();
    expect(within(root).getByRole("heading", { level: 2, name: "HIVE-HQ" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Download résumé" })).toBeNull();
  });

  it("is inert until filled", () => {
    for (const stage of ["wire", "dissolve"] as const) {
      const { container, unmount } = render(<SitePanel view="contact" stage={stage} />);
      expect((container.firstElementChild as HTMLElement).hasAttribute("inert")).toBe(true);
      unmount();
    }
    const { container } = mount("contact", "filled");
    expect((container.firstElementChild as HTMLElement).hasAttribute("inert")).toBe(false);
  });

  it("wheel over the frame chrome never reaches the canvas", () => {
    const outer = vi.fn();
    const { container } = render(
      <div onWheel={outer}>
        <SitePanel view="experience" stage="filled" />
      </div>,
    );
    const ev = new WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true });
    container.querySelector(".ap-head")!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
  });
});

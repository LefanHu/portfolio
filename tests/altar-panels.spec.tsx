import React from "react";
import { render, screen, within } from "@testing-library/react";
import { getImageProps } from "next/image";
import SectionPanel from "@/components/altar/projection/SectionPanel";
import { experienceBranches } from "@/lib/portfolio/experience";
import { contact } from "@/lib/portfolio/contact";
import { acceleratorProject, projects } from "@/lib/portfolioProjects";
import { RECIPES, type SectionId } from "@/lib/altar/recipes";

const SECTIONS: SectionId[] = ["about", "experience", "projects", "skills", "interests", "contact"];

function linkFor(text: string): HTMLAnchorElement {
  const a = screen.getByText(text).closest("a");
  if (!a) throw new Error(`no link around "${text}"`);
  return a;
}

describe("SectionPanel", () => {
  it("experience shows all five role titles", () => {
    render(<SectionPanel section="experience" stage="filled" />);
    const titles = experienceBranches.flatMap((b) => b.roles.map((r) => r.title));
    expect(titles).toHaveLength(5);
    for (const t of titles) expect(screen.getByRole("heading", { name: t })).toBeInTheDocument();
  });

  it("projects shows every project plus the accelerator, with correct links", () => {
    render(<SectionPanel section="projects" stage="filled" />);
    for (const p of [...projects, acceleratorProject]) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
      const a = linkFor(p.name);
      expect(a.getAttribute("href")).toBe(p.href);
      if (p.href.startsWith("/")) {
        // internal pages navigate in the same tab
        expect(a.getAttribute("target")).toBeNull();
      } else {
        expect(a.getAttribute("target")).toBe("_blank");
        expect(a.getAttribute("rel")).toBe("noopener noreferrer");
      }
    }
    expect(screen.getByText("LLM Inference Accelerator")).toBeInTheDocument();
  });

  it("skills shows SystemVerilog", () => {
    render(<SectionPanel section="skills" stage="filled" />);
    expect(screen.getByText("SystemVerilog")).toBeInTheDocument();
  });

  it("contact links email, GitHub, LinkedIn and the resume", () => {
    render(<SectionPanel section="contact" stage="filled" />);
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toContain("mailto:l2hu@uwaterloo.ca");
    expect(links).toContain(contact.github);
    expect(links).toContain(contact.linkedin);
    expect(links).toContain(contact.resumeHref);
    for (const a of screen.getAllByRole("link")) {
      if (a.getAttribute("href")?.startsWith("mailto:")) continue;
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("about shows the University of Waterloo", () => {
    render(<SectionPanel section="about" stage="filled" />);
    expect(screen.getAllByText(/University of Waterloo/).length).toBeGreaterThan(0);
  });

  it("interests shows Rock Climbing", () => {
    render(<SectionPanel section="interests" stage="filled" />);
    expect(screen.getByText("Rock Climbing")).toBeInTheDocument();
  });

  it("wire stage sets data-stage on the root", () => {
    const { container } = render(<SectionPanel section="about" stage="wire" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-stage")).toBe("wire");
  });

  it.each(SECTIONS)("%s: titled by its recipe, accent-tinted, with wire blocks", (section) => {
    const recipe = RECIPES.find((r) => r.section === section)!;
    const { container } = render(<SectionPanel section={section} stage="filled" theme="light" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-stage")).toBe("filled");
    expect(root.getAttribute("data-theme")).toBe("light");
    expect(root.style.getPropertyValue("--proj-accent")).toBe(recipe.artifact.accent);
    expect(root.style.getPropertyValue("--proj-line")).not.toBe("");
    expect(within(root).getByRole("heading", { level: 2, name: recipe.title })).toBeInTheDocument();
    expect(root.querySelectorAll("[data-wire]").length).toBeGreaterThan(3);
  });

  it("images are wire frames that load lazily", () => {
    const { container } = render(<SectionPanel section="projects" stage="wire" />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(projects.length);
    for (const img of imgs) {
      expect(img.getAttribute("loading")).toBe("lazy");
      expect(img.closest("[data-wire='img']")).not.toBeNull();
    }
  });

  it("wheel is contained: default prevented, never reaches the canvas; ctrl+wheel keeps its default", () => {
    const outer = vi.fn();
    const { container } = render(
      <div onWheel={outer}>
        <SectionPanel section="experience" stage="filled" />
      </div>,
    );
    const parentSpy = vi.fn();
    container.addEventListener("wheel", parentSpy);
    const target = container.querySelector(".ap-card")!;
    const ev = new WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true });
    target.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    const pinch = new WheelEvent("wheel", { deltaY: 40, ctrlKey: true, bubbles: true, cancelable: true });
    target.dispatchEvent(pinch);
    expect(pinch.defaultPrevented).toBe(false);
    expect(parentSpy).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  it("the scroll area is keyboard-focusable", () => {
    const { container } = render(<SectionPanel section="experience" stage="filled" />);
    expect(container.querySelector(".ap-scroll")!.getAttribute("tabindex")).toBe("0");
  });

  it("is inert (no focusable links) until filled", () => {
    for (const stage of ["wire", "dissolve"] as const) {
      const { container, unmount } = render(<SectionPanel section="contact" stage={stage} />);
      expect((container.firstElementChild as HTMLElement).hasAttribute("inert")).toBe(true);
      unmount();
    }
    const { container } = render(<SectionPanel section="contact" stage="filled" />);
    expect((container.firstElementChild as HTMLElement).hasAttribute("inert")).toBe(false);
  });

  it("images use next/image's getImageProps (build-time image config)", () => {
    const spy = vi.mocked(getImageProps);
    spy.mockClear();
    const { container } = render(<SectionPanel section="projects" stage="filled" />);
    expect(spy).toHaveBeenCalledTimes(projects.length);
    projects.forEach((p, i) => {
      const { props } = spy.mock.results[i].value as ReturnType<typeof getImageProps>;
      const img = container.querySelectorAll("img")[i];
      expect(spy.mock.calls[i][0]).toMatchObject({ src: p.imgSrc, sizes: expect.any(String) });
      expect(img.getAttribute("src")).toBe(props.src);
      expect(img.getAttribute("srcset")).toBe(props.srcSet ?? null);
      expect(img.getAttribute("sizes")).toBe(props.sizes ?? null);
    });
    // raster photos get an optimizer srcset; SVGs are served as-is
    const drone = spy.mock.results[projects.findIndex((p) => p.name === "Drone")].value.props;
    expect(drone.srcSet).toContain("/_next/image?url=%2Fimages%2Fdrone.jpg");
    const svg = spy.mock.results[projects.findIndex((p) => p.imgSrc.endsWith(".svg"))].value.props;
    expect(svg.srcSet).toBeUndefined();
  });
});

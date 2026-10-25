import React from "react";
import { render, screen, within } from "@testing-library/react";
import SectionPanel from "@/components/altar/projection/SectionPanel";
import { experienceBranches } from "@/lib/portfolio/experience";
import { contact } from "@/lib/portfolio/contact";
import { acceleratorProject } from "@/lib/portfolioProjects";
import { RECIPES, type SectionId } from "@/lib/altar/recipes";

const SECTIONS: SectionId[] = ["about", "experience", "projects", "skills", "interests", "contact"];

/**
 * Click `el` and report whether the panel itself prevented the default. A
 * last-in-line listener then cancels it, so jsdom doesn't try to navigate.
 */
function clickPrevented(el: Element): boolean {
  let prevented = false;
  const last = (e: Event) => {
    prevented = e.defaultPrevented;
    e.preventDefault();
  };
  document.addEventListener("click", last);
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  document.removeEventListener("click", last);
  return prevented;
}

describe("SectionPanel", () => {
  it("experience shows all five role titles", () => {
    render(<SectionPanel section="experience" stage="filled" />);
    const titles = experienceBranches.flatMap((b) => b.roles.map((r) => r.title));
    expect(titles).toHaveLength(5);
    for (const t of titles) expect(screen.getByRole("heading", { name: t })).toBeInTheDocument();
  });

  it("projects shows the main site's Favorite Projects, linking the accelerator", () => {
    render(<SectionPanel section="projects" stage="filled" />);
    expect(screen.getByRole("heading", { name: "Favorite Projects" })).toBeInTheDocument();
    const link = screen.getByText("LLM Inference Accelerator").closest("a");
    expect(link?.getAttribute("href")).toBe(acceleratorProject.href);
  });

  it("skills shows only Technical Skills", () => {
    render(<SectionPanel section="skills" stage="filled" />);
    expect(screen.getByText("Technical Skills")).toBeInTheDocument();
    expect(screen.getByText("SystemVerilog")).toBeInTheDocument();
    expect(screen.queryByText("Research")).not.toBeInTheDocument();
  });

  it("about shows the summary and education", () => {
    render(<SectionPanel section="about" stage="filled" />);
    expect(screen.getByText("About Me")).toBeInTheDocument();
    expect(screen.getAllByText(/University of Waterloo/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Technical Skills")).not.toBeInTheDocument();
  });

  it("interests shows Rock Climbing", () => {
    render(<SectionPanel section="interests" stage="filled" />);
    expect(screen.getByText("Rock Climbing")).toBeInTheDocument();
  });

  it("contact links email, GitHub and LinkedIn, with the resume in the header", () => {
    render(<SectionPanel section="contact" stage="filled" />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("mailto:l2hu@uwaterloo.ca");
    expect(hrefs).toContain(contact.github);
    expect(hrefs).toContain(contact.linkedin);
    const resume = screen.getByRole("link", { name: "Download résumé" });
    expect(resume.getAttribute("href")).toBe(contact.resumeHref);
    expect(resume.getAttribute("target")).toBe("_blank");
    expect(resume.closest(".ap-head")).not.toBeNull();
  });

  it.each(SECTIONS)("%s: tags the site's own markup as wire blocks", (section) => {
    const { container } = render(<SectionPanel section={section} stage="wire" />);
    const scroll = container.querySelector(".ap-scroll")!;
    expect(scroll.querySelectorAll("[data-wire]").length).toBeGreaterThanOrEqual(3);
  });

  describe("external links", () => {
    let open: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      open = vi.spyOn(window, "open").mockImplementation(() => null);
    });
    afterEach(() => open.mockRestore());

    it("open in a new tab, through the delegated handler", () => {
      render(<SectionPanel section="contact" stage="filled" />);
      const github = screen.getByRole("link", { name: "GitHub" });
      expect(clickPrevented(github)).toBe(true);
      expect(open).toHaveBeenCalledWith(contact.github, "_blank", "noopener,noreferrer");
    });

    it("leave internal links to navigate in place", () => {
      render(<SectionPanel section="projects" stage="filled" />);
      const link = screen.getByText("LLM Inference Accelerator").closest("a")!;
      expect(clickPrevented(link)).toBe(false);
      expect(open).not.toHaveBeenCalled();
    });

    it("leave mailto: links alone", () => {
      render(<SectionPanel section="contact" stage="filled" />);
      const mail = screen.getAllByRole("link").find((a) => a.getAttribute("href")?.startsWith("mailto:"))!;
      expect(clickPrevented(mail)).toBe(false);
      expect(open).not.toHaveBeenCalled();
    });
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

  it("wheel is contained: default prevented, never reaches the canvas; ctrl+wheel keeps its default", () => {
    const outer = vi.fn();
    const { container } = render(
      <div onWheel={outer}>
        <SectionPanel section="experience" stage="filled" />
      </div>,
    );
    const parentSpy = vi.fn();
    container.addEventListener("wheel", parentSpy);
    const target = container.querySelector(".ap-site")!;
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
});

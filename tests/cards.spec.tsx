import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import PortfolioProjects from "@/components/portfolio/PortfolioProjects";
import ProjectShowcase from "@/components/portfolio/ProjectShowcase";
import { acceleratorProject, allProjects, type PortfolioProject } from "@/lib/portfolioProjects";

const cards: PortfolioProject[] = [
  {
    slug: "drone",
    name: "Drone",
    imgSrc: "/drone.jpg",
    description: "A quadcopter",
    href: "/projects/drone",
    period: "2024",
    location: "Waterloo, ON",
    technologies: ["Betaflight", "GPS"],
  },
  {
    slug: "interqu",
    name: "Interqu",
    imgSrc: "/interqu.svg",
    description: "Interview practice",
    href: "https://github.com/Interqu/interqu-sam",
  },
  {
    slug: "hive-hq",
    name: "HIVE-HQ",
    imgSrc: "/hive.png",
    description: "Safety planner",
    href: "https://devpost.com/software/hive-hq",
  },
];

function card(name: string): HTMLElement {
  const item = screen.getByRole("heading", { level: 3, name }).closest("li");
  if (!item) throw new Error(`no card for ${name}`);
  return item;
}

function isOpen(name: string): boolean {
  return card(name).hasAttribute("data-open");
}

// jsdom has no PointerEvent, and the showcase needs `pointerType` to tell a
// mouse from a finger.
class PointerEventStub extends MouseEvent {
  readonly pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

describe("project showcase", () => {
  beforeEach(() => {
    vi.stubGlobal("PointerEvent", PointerEventStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows every project's name, description and optional facts", () => {
    render(<ProjectShowcase projects={cards} />);

    for (const project of cards) {
      expect(screen.getAllByRole("heading", { name: project.name })).toHaveLength(1);
      expect(screen.getByText(project.description)).toBeInTheDocument();
    }
    expect(screen.getByText("2024 · Waterloo, ON")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Drone technologies" })).toHaveTextContent("Betaflight");
    // Projects without technologies get no empty chip list.
    expect(screen.queryByRole("list", { name: "Interqu technologies" })).toBeNull();
  });

  it("names the first technologies of a long list and counts the rest", () => {
    const technologies = ["A", "B", "C", "D", "E", "F", "G", "H"];
    render(<ProjectShowcase projects={[{ ...cards[0], technologies }]} />);

    const chips = within(screen.getByRole("list", { name: "Drone technologies" })).getAllByRole("listitem");
    expect(chips.map((chip) => chip.textContent)).toEqual(["A", "B", "C", "D", "E", "+3 more"]);
  });

  it("links a project with its own page in the same tab", () => {
    render(<ProjectShowcase projects={cards} />);

    const link = screen.getByRole("link", { name: /^Read the write-up\s*: Drone$/ });
    expect(link).toHaveAttribute("href", "/projects/drone");
    expect(link).not.toHaveAttribute("target");
  });

  it("says where external links go and opens them in a new tab", () => {
    render(<ProjectShowcase projects={cards} />);

    const github = screen.getByRole("link", { name: /^View on GitHub\s*: Interqu/ });
    expect(github).toHaveAttribute("href", "https://github.com/Interqu/interqu-sam");
    const devpost = screen.getByRole("link", { name: /^View on Devpost\s*: HIVE-HQ/ });
    expect(devpost).toHaveAttribute("href", "https://devpost.com/software/hive-hq");
    for (const link of [github, devpost]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAccessibleName(/opens in a new tab/);
    }
  });

  it("opens the first card on load and only that one", () => {
    render(<ProjectShowcase projects={cards} />);

    expect(cards.map((project) => isOpen(project.name))).toEqual([true, false, false]);
  });

  it("opens a card when the mouse enters it", () => {
    render(<ProjectShowcase projects={cards} />);

    fireEvent.pointerEnter(card("Interqu"), { pointerType: "mouse" });

    expect(cards.map((project) => isOpen(project.name))).toEqual([false, true, false]);
  });

  it("does not treat a touch as a hover, and opens the card on the tap's click", () => {
    render(<ProjectShowcase projects={cards} />);

    fireEvent.pointerEnter(card("HIVE-HQ"), { pointerType: "touch" });
    expect(isOpen("HIVE-HQ")).toBe(false);

    fireEvent.click(card("HIVE-HQ"));
    expect(cards.map((project) => isOpen(project.name))).toEqual([false, false, true]);
  });

  it("keeps every card's link in the tab order and opens the card it is focused in", () => {
    render(<ProjectShowcase projects={cards} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(cards.length);
    for (const link of links) {
      expect(link).not.toHaveAttribute("tabindex", "-1");
      expect(link.closest("[aria-hidden='true'], [inert]")).toBeNull();
    }

    fireEvent.focus(links[2]);

    expect(cards.map((project) => isOpen(project.name))).toEqual([false, false, true]);
  });
});

describe("projects section", () => {
  it("is the labelled projects region with a link to the full gallery", () => {
    const { container } = render(<PortfolioProjects />);

    const section = container.querySelector("#projects");
    expect(section?.tagName).toBe("SECTION");
    expect(screen.getByRole("region", { name: "Projects" })).toBe(section);
    expect(screen.getByRole("link", { name: "All projects" })).toHaveAttribute("href", "/project-gallery");
  });

  it("features the accelerator as one link built from the project data", () => {
    render(<PortfolioProjects />);

    const link = screen.getByRole("link", { name: `${acceleratorProject.name} Read the write-up` });
    expect(link).toHaveAttribute("href", acceleratorProject.href);
    expect(link).toHaveTextContent(acceleratorProject.description);
    for (const technology of acceleratorProject.technologies ?? []) {
      expect(link).toHaveTextContent(technology);
    }
  });

  it("names every project exactly once", () => {
    render(<PortfolioProjects />);

    for (const project of allProjects) {
      expect(screen.getAllByRole("heading", { level: 3, name: project.name })).toHaveLength(1);
    }
  });
});

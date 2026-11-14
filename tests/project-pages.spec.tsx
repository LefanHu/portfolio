import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";
import MediaGallery from "@/components/projects/MediaGallery";
import ProjectGallery, { metadata as galleryMetadata } from "@/app/(portfolio)/project-gallery/page";
import * as acceleratorPage from "@/app/(portfolio)/projects/llm-accelerator/page";
import * as dronePage from "@/app/(portfolio)/projects/drone/page";
import * as mediaStackPage from "@/app/(portfolio)/projects/media-stack/page";
import * as sdxlPage from "@/app/(portfolio)/projects/stable-diffusion/page";
import * as threejsPage from "@/app/(portfolio)/projects/threejs/page";
import {
  allProjects,
  extraWriteups,
  isExternalHref,
  projectCardId,
  projectLinkLabel,
  projectPage,
  projectPages,
} from "@/lib/portfolioProjects";

const PAGES: Record<string, { default: () => React.JSX.Element; metadata: Metadata }> = {
  "llm-accelerator": acceleratorPage,
  "stable-diffusion": sdxlPage,
  drone: dronePage,
  "media-stack": mediaStackPage,
  threejs: threejsPage,
};

describe("project data", () => {
  it("has a page module for every internal entry, in gallery order", () => {
    expect(projectPages.map((entry) => entry.slug)).toEqual(Object.keys(PAGES));
  });

  it("says where a project link goes", () => {
    expect(projectLinkLabel("/projects/drone")).toBe("Read the write-up");
    expect(projectLinkLabel("https://github.com/LefanHu/OARB")).toBe("View on GitHub");
    expect(projectLinkLabel("https://devpost.com/software/hive-hq")).toBe("View on Devpost");
    expect(projectLinkLabel("https://www.example.org/x")).toBe("View on example.org");
  });

  it("keeps the write-up that is not a portfolio project out of the seven", () => {
    expect(allProjects).toHaveLength(7);
    expect(allProjects.map((project) => project.slug as string)).not.toContain(extraWriteups[0].slug);
  });
});

describe.each(Object.keys(PAGES))("/projects/%s", (slug) => {
  const { default: Page, metadata } = PAGES[slug];
  const project = projectPage(slug);

  it("has exactly one h1, the project's name from the data", () => {
    render(<Page />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(project.name);
  });

  it("outlines its sections under the title without skipping a level", () => {
    const { container } = render(<Page />);
    const levels = [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    expect(levels.filter((level) => level === 2).length).toBeGreaterThan(0);
    levels.reduce((previous, level) => {
      expect(level - previous).toBeLessThanOrEqual(1);
      return level;
    });
  });

  it("links back to the gallery before the title and again at the end", () => {
    render(<Page />);
    const links = screen.getAllByRole("link", { name: "All projects" });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/project-gallery");
  });

  it("offers the neighbouring write-ups", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "More projects" });
    const position = projectPages.indexOf(project);
    const neighbours = [projectPages[position - 1], projectPages[position + 1]].filter(Boolean);
    expect(neighbours.length).toBeGreaterThan(0);
    for (const neighbour of neighbours) {
      expect(within(nav).getByRole("link", { name: new RegExp(neighbour.name) })).toHaveAttribute(
        "href",
        neighbour.href,
      );
    }
  });

  it("lists the project's technologies", () => {
    render(<Page />);
    const list = screen.getByRole("list", { name: "Technologies" });
    expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual(project.technologies);
  });

  it("exports metadata built from the data", () => {
    // The root layout appends the site name, so the page title must not carry it.
    expect(metadata.title).toBe(project.name);
    expect(String(metadata.description).length).toBeGreaterThan(20);
    expect(metadata.alternates?.canonical).toBe(project.href);
    expect(metadata.openGraph?.title).toBe(project.name);
  });

  it("gives every picture a description", () => {
    const { container } = render(<Page />);
    for (const image of container.querySelectorAll("img")) {
      expect(image.getAttribute("alt")?.length ?? 0).toBeGreaterThan(10);
    }
  });
});

describe("project page content", () => {
  it("marks the retired SDXL generator as archived and its pictures as AI-generated", () => {
    render(<sdxlPage.default />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
    const pictures = screen.getAllByRole("img");
    expect(pictures).toHaveLength(8);
    for (const picture of pictures) expect(picture).toHaveAccessibleName(/^AI-generated/);
    expect(screen.getAllByText("AI-generated sample")).toHaveLength(8);
  });

  it("links the Three.js write-up to the 3D site itself", () => {
    render(<threejsPage.default />);
    expect(screen.getByRole("link", { name: "Open the original 3D room" })).toHaveAttribute("href", "/home");
  });

  it("shows each compose file once, under a label that matches its services", () => {
    render(<mediaStackPage.default />);
    const samples = screen
      .getAllByRole("region")
      .map((region) => region.getAttribute("aria-label"))
      .filter((name) => name?.endsWith(": code"));
    expect(samples).toEqual([
      "SWAG reverse proxy: code",
      "Authelia: code",
      "Sonarr and Jackett: code",
      "Jupyter: code",
    ]);
    expect(screen.getByRole("region", { name: "Sonarr and Jackett: code" })).toHaveTextContent("jackett:");
  });

  it("uses the project's picture for link previews, or the site's share image when it has none", () => {
    expect(dronePage.metadata.openGraph?.images).toEqual([{ url: "/images/fpvdrone/2.jpg" }]);
    expect(acceleratorPage.metadata.openGraph?.images).toEqual([{ url: "/images/altar/island-night.webp" }]);
  });
});

describe("/project-gallery", () => {
  it("is titled Projects and has its own metadata", () => {
    render(<ProjectGallery />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
    expect(galleryMetadata.title).toBe("Projects");
    expect(galleryMetadata.alternates?.canonical).toBe("/project-gallery");
  });

  it("renders one card per project and write-up, each a single link named after it", () => {
    render(<ProjectGallery />);
    const entries = [...allProjects, ...extraWriteups];
    expect(screen.getAllByRole("link")).toHaveLength(entries.length);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(
      entries.map((entry) => entry.name),
    );
    for (const entry of entries) {
      const destination = projectLinkLabel(entry.href);
      const link = screen.getByRole("link", { name: new RegExp(`^${entry.name} ${destination}`) });
      expect(link).toHaveAttribute("href", entry.href);
      expect(link).toHaveAccessibleDescription(entry.description);
    }
  });

  it("opens projects that live elsewhere in a new tab, and says so", () => {
    render(<ProjectGallery />);
    const external = allProjects.filter((project) => isExternalHref(project.href));
    expect(external.map((project) => project.slug)).toEqual(["hive-hq", "auto-trader", "interqu"]);
    for (const project of external) {
      const link = document.getElementById(projectCardId(project.slug))!;
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link).toHaveAccessibleName(/opens in a new tab/);
    }
  });

  it("keeps write-ups in the same tab", () => {
    render(<ProjectGallery />);
    for (const entry of projectPages) {
      const link = screen.getByRole("link", { name: new RegExp(`^${entry.name} Read the write-up$`) });
      expect(link).not.toHaveAttribute("target");
    }
  });

  it("puts the altar's anchor on the card itself for the seven projects only", () => {
    const { container } = render(<ProjectGallery />);
    for (const project of allProjects) {
      expect(container.querySelector(`a#${projectCardId(project.slug)}`)).not.toBeNull();
    }
    expect(container.querySelectorAll("a[id^='project-']")).toHaveLength(7);
  });

  it("shows at most three technologies on a normal card", () => {
    render(<ProjectGallery />);
    const card = document.getElementById(projectCardId("media-stack"))!;
    expect(within(card).getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("CodeBlock", () => {
  const short = "a: 1\nb: 2";
  const long = Array.from({ length: 30 }, (_, index) => `key${index}: "value" # note`).join("\n");
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the code as text in a named, focusable region under its caption", () => {
    render(<CodeBlock label="Example" code={short} language="yaml" />);
    const region = screen.getByRole("region", { name: "Example: code" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region.querySelector("pre code")?.textContent).toBe(short);
    expect(screen.getByRole("figure")).toHaveTextContent("Example");
  });

  it("keeps every character of tinted YAML", () => {
    const yaml = `---\nservices:\n  app:\n    ports:\n      - "80:80"\n      - 9091:9091\n    image: a/b:latest #optional\n    TOKEN: ""`;
    render(<CodeBlock label="Compose" code={yaml} language="yaml" />);
    expect(screen.getByRole("region").querySelector("code")?.textContent).toBe(yaml);
  });

  it("copies the whole sample and confirms it, then resets", async () => {
    vi.useFakeTimers();
    render(<CodeBlock label="Example" code={long} language="yaml" />);
    const button = screen.getByRole("button", { name: /^Copy/ });

    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledWith(long);
    expect(button).toHaveTextContent("Copied");
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Example copied to the clipboard");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveTextContent(/^Copy/);
    expect(button).not.toHaveTextContent("Copied");
    expect(status).toBeEmptyDOMElement();
  });

  it("says so when the clipboard is not available", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<CodeBlock label="Example" code={short} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Copy/ }));
    });
    expect(screen.getByRole("status")).toHaveTextContent("Copying failed");
  });

  it("does not offer to expand a short sample", () => {
    render(<CodeBlock label="Example" code={short} />);
    expect(screen.queryByRole("button", { name: /Show/ })).toBeNull();
  });

  it("collapses a long sample and expands it in place", () => {
    render(<CodeBlock label="Example" code={long} language="yaml" />);
    const toggle = screen.getByRole("button", { name: "Show all 30 lines" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const rest = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(rest).toHaveTextContent("key29");
    expect(rest).not.toHaveTextContent("key0:");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Show fewer lines");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("Show all 30 lines");
  });
});

describe("MediaGallery lightbox", () => {
  const images = [
    { src: "/a.jpg", width: 800, height: 600, alt: "First picture, described", caption: "First" },
    { src: "/b.jpg", width: 800, height: 600, alt: "Second picture, described", caption: "Second" },
    { src: "/c.jpg", width: 800, height: 600, alt: "Third picture, described" },
  ];
  const prototype = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  const original = { showModal: prototype.showModal, close: prototype.close };

  beforeEach(() => {
    // jsdom has the element but not the modal API.
    prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    });
  });

  afterEach(() => {
    Object.assign(prototype, original);
  });

  const dialog = () => document.querySelector("dialog")!;

  it("shows a thumbnail button per picture and nothing in the dialog until one is opened", () => {
    render(<MediaGallery images={images} label="Photos" />);
    expect(screen.getAllByRole("button", { name: /view larger/ })).toHaveLength(3);
    expect(dialog()).toBeEmptyDOMElement();
    expect(prototype.showModal).not.toHaveBeenCalled();
  });

  it("opens the picture that was clicked as a modal, with its caption and position", () => {
    render(<MediaGallery images={images} label="Photos" />);
    fireEvent.click(screen.getByRole("button", { name: /Second picture/ }));
    expect(prototype.showModal).toHaveBeenCalledTimes(1);
    expect(dialog()).toHaveAttribute("aria-label", "Photos: picture 2 of 3");
    expect(within(dialog()).getByRole("img")).toHaveAttribute("src", "/b.jpg");
    expect(dialog().querySelector("figcaption")).toHaveTextContent("Second");
    expect(within(dialog()).getByText(/2 of 3/)).toBeInTheDocument();
  });

  it("moves between pictures with the arrow keys and buttons, wrapping at the ends", () => {
    render(<MediaGallery images={images} label="Photos" />);
    fireEvent.click(screen.getByRole("button", { name: /First picture/ }));
    const current = () => within(dialog()).getByRole("img").getAttribute("src");

    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    expect(current()).toBe("/b.jpg");
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    expect(current()).toBe("/c.jpg");
    fireEvent.click(within(dialog()).getByRole("button", { name: "Next picture" }));
    expect(current()).toBe("/a.jpg");
    fireEvent.click(within(dialog()).getByRole("button", { name: "Previous picture" }));
    expect(current()).toBe("/c.jpg");
    // Stepping does not re-open the dialog.
    expect(prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it("closes from the close button and from a click on the backdrop", () => {
    render(<MediaGallery images={images} label="Photos" />);
    fireEvent.click(screen.getByRole("button", { name: /First picture/ }));
    fireEvent.click(within(dialog()).getByRole("button", { name: "Close" }));
    expect(prototype.close).toHaveBeenCalledTimes(1);
    expect(dialog()).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: /First picture/ }));
    // A click inside the picture is not a click on the backdrop.
    fireEvent.click(within(dialog()).getByRole("img"));
    expect(prototype.close).toHaveBeenCalledTimes(1);
    fireEvent.click(dialog());
    expect(prototype.close).toHaveBeenCalledTimes(2);
    expect(dialog()).toBeEmptyDOMElement();
  });

  it("has no previous or next for a single picture", () => {
    render(<MediaGallery images={images.slice(0, 1)} label="Photos" />);
    fireEvent.click(screen.getByRole("button", { name: /First picture/ }));
    expect(within(dialog()).queryByRole("button", { name: "Next picture" })).toBeNull();
  });
  it("keeps Escape to itself, so the altar's framed view does not close as well", () => {
    render(<MediaGallery images={images} label="Photos" />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    const onWindowKey = vi.fn();
    window.addEventListener("keydown", onWindowKey);

    fireEvent.keyDown(screen.getByRole("dialog", { hidden: true }), { key: "Escape" });

    expect(onWindowKey).not.toHaveBeenCalled();
    window.removeEventListener("keydown", onWindowKey);
  });
});

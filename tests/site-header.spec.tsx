import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import SiteHeader from "@/components/site/SiteHeader";
import { THEME_KEY } from "@/lib/theme";

// The header only needs the path; tests move it to stand in for a navigation.
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

describe("site header", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    route.pathname = "/";
    window.history.replaceState(null, "", "/");
  });

  it("links to the four home sections, the playground and the 3D altar", () => {
    render(<SiteHeader />);
    const nav = screen.getAllByRole("navigation", { name: "Main", hidden: true })[0];

    for (const [name, href] of [
      ["Projects", "/#projects"],
      ["Experience", "/#experience"],
      ["Coding", "/#coding"],
      ["Contact", "/#contact"],
      ["Playground", "/js"],
    ] as const) {
      expect(within(nav).getByRole("link", { name, hidden: true })).toHaveAttribute("href", href);
    }
    expect(screen.getAllByRole("link", { name: "3D altar" })[0]).toHaveAttribute("href", "/altar");
  });

  it("never nests one link inside another", () => {
    const { container } = render(<SiteHeader />);
    expect(container.querySelector("a a")).toBeNull();
  });

  it("opens a menu with every destination on small screens and closes it again", () => {
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: "Open menu" });
    const menu = document.getElementById(button.getAttribute("aria-controls")!)!;
    expect(menu).toHaveAttribute("hidden");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAccessibleName("Close menu");
    expect(menu).not.toHaveAttribute("hidden");
    for (const name of ["Projects", "Experience", "Coding", "Contact", "Playground"]) {
      expect(within(menu).getByRole("link", { name })).toBeInTheDocument();
    }

    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu).toHaveAttribute("hidden");
  });

  it("closes the menu when a destination is chosen", () => {
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: "Open menu" });
    const menu = document.getElementById(button.getAttribute("aria-controls")!)!;

    fireEvent.click(button);
    fireEvent.click(within(menu).getByRole("link", { name: "Experience" }));

    expect(menu).toHaveAttribute("hidden");
  });

  it("does not come back open when the visitor returns to the page it was opened on", () => {
    route.pathname = "/js";
    const { rerender } = render(<SiteHeader />);
    const button = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Back to the home page, then Forward again.
    route.pathname = "/";
    rerender(<SiteHeader />);
    expect(button).toHaveAttribute("aria-expanded", "false");
    route.pathname = "/js";
    rerender(<SiteHeader />);

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the menu when the keyboard moves on into the page", () => {
    render(
      <>
        <SiteHeader />
        <a href="#after">After the header</a>
      </>,
    );
    const button = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(button);
    const menu = document.getElementById(button.getAttribute("aria-controls")!)!;

    act(() => within(menu).getByRole("link", { name: "Playground" }).focus());
    expect(button).toHaveAttribute("aria-expanded", "true");

    act(() => screen.getByRole("link", { name: "After the header" }).focus());
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  describe("current section", () => {
    const tops: Record<string, number> = {};
    let scrollHeight = 5000;

    beforeEach(() => {
      for (const id of ["projects", "experience", "coding", "contact"]) {
        const section = document.createElement("section");
        section.id = id;
        section.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
        document.body.appendChild(section);
      }
      Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
      Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, get: () => scrollHeight });
    });

    afterEach(() => {
      document.querySelectorAll("body > section").forEach((section) => section.remove());
      Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    });

    const scrollTo = (y: number, sectionTops: number[]) => {
      ["projects", "experience", "coding", "contact"].forEach((id, index) => (tops[id] = sectionTops[index]));
      Object.defineProperty(window, "scrollY", { configurable: true, value: y });
      fireEvent.scroll(window);
    };

    const currentLink = () =>
      screen
        .getAllByRole("navigation", { name: "Main", hidden: true })[0]
        .querySelector('a[aria-current="location"]');

    it("marks the section the reader is in, and none above the first", async () => {
      render(<SiteHeader />);

      scrollTo(0, [700, 1900, 4300, 5700]);
      await waitFor(() => expect(currentLink()).toBeNull());

      // Experience has passed the reading line; Coding has not.
      scrollTo(1800, [-1100, 100, 2500, 3900]);
      await waitFor(() => expect(currentLink()).toHaveTextContent("Experience"));

      // Between two sections the one just read stays current.
      scrollTo(4000, [-3300, -2100, 320, 1700]);
      await waitFor(() => expect(currentLink()).toHaveTextContent("Experience"));
    });

    it("marks the last section at the bottom of the page, where it cannot reach the reading line", async () => {
      render(<SiteHeader />);
      scrollHeight = 5000;

      scrollTo(4100, [-3400, -2200, -900, 369]);

      await waitFor(() => expect(currentLink()).toHaveTextContent("Contact"));
    });

    it("gives a short section near the end its turn before the last one", async () => {
      render(<SiteHeader />);
      scrollHeight = 5000;

      // 300px from the bottom: the reading line has sunk to 600, past Coding but not Contact.
      scrollTo(3800, [-3100, -1900, 500, 700]);
      await waitFor(() => expect(currentLink()).toHaveTextContent("Coding"));

      scrollTo(4100, [-3400, -2200, 200, 400]);
      await waitFor(() => expect(currentLink()).toHaveTextContent("Contact"));
    });

    it("keeps the section the address asks for while its heading is on screen", async () => {
      render(<SiteHeader />);
      scrollHeight = 5000;
      window.history.replaceState(null, "", "/#coding");

      // A tall window at the bottom of the page: Coding and Contact are both in view.
      scrollTo(4100, [-3400, -2200, 200, 400]);
      await waitFor(() => expect(currentLink()).toHaveTextContent("Coding"));

      // Picking Contact from there moves nothing; only the address changes.
      window.history.replaceState(null, "", "/#contact");
      fireEvent(window, new HashChangeEvent("hashchange"));
      await waitFor(() => expect(currentLink()).toHaveTextContent("Contact"));

      // Once the asked-for heading has scrolled away, the reading line decides again.
      window.history.replaceState(null, "", "/#experience");
      scrollTo(4100, [-3400, -2200, 200, 400]);
      await waitFor(() => expect(currentLink()).toHaveTextContent("Contact"));
    });
  });

  it("switches the theme for the whole document and remembers the choice", () => {
    // Under test the system preference reads as light (matchMedia is mocked to not match).
    render(<SiteHeader />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });
});

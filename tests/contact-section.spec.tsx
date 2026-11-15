import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import ContactForm from "@/components/ContactForm";
import { contact } from "@/lib/portfolio/contact";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
}

async function clickCopy() {
  // The copy is async: let the clipboard promise settle inside act.
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy address" }));
  });
}

describe("contact section", () => {
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, "clipboard");
  });

  it("is the labelled contact region and shows the address as text", () => {
    const { container } = render(<ContactForm />);

    const section = container.querySelector("#contact");
    expect(section?.tagName).toBe("SECTION");
    expect(screen.getByRole("region", { name: "Contact" })).toBe(section);
    expect(screen.getByText(contact.email)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email me" })).toHaveAttribute("href", `mailto:${contact.email}`);
  });

  it("links the profiles and the résumé in a new tab", () => {
    render(<ContactForm />);

    const expected: [RegExp, string][] = [
      [/^GitHub/, contact.github],
      [/^LinkedIn/, contact.linkedin],
      [/^Instagram/, contact.instagram],
      [/^Résumé \(PDF\)/, contact.resumeHref],
    ];
    for (const [name, href] of expected) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("copies the address and confirms it for a moment", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ContactForm />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();

    await clickCopy();

    expect(writeText).toHaveBeenCalledWith(contact.email);
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    // The button keeps its name, so it can be found and pressed again.
    expect(screen.getByRole("button", { name: "Copy address" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("says so when the clipboard refuses, and keeps the address on the page to select", async () => {
    vi.useFakeTimers();
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<ContactForm />);

    await clickCopy();

    expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
    expect(screen.getByRole("button", { name: "Copy address" })).toBeInTheDocument();
    expect(screen.getByText(contact.email)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("says so when there is no clipboard", async () => {
    render(<ContactForm />);

    await clickCopy();

    expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
  });
});

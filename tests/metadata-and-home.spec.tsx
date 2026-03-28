import React from "react";
import { render, screen } from "@testing-library/react";
import { metadata } from "@/app/layout";
import HomePage from "@/app/(portfolio)/page";

vi.mock("@/components/portfolio/PortfolioProjects", () => ({
  default: () => <div data-testid="fav-projects">projects</div>,
}));

vi.mock("@/components/portfolio/HomeDeferredSections", () => ({
  default: () => <div data-testid="deferred-sections">deferred</div>,
}));

vi.mock("@/components/ContactForm", () => ({
  default: () => <div data-testid="contact-form">contact</div>,
}));

describe("root metadata", () => {
  it("exposes the expected title and icons", () => {
    expect(metadata.title).toBe("Lefan's Website");
    expect(metadata.icons).toEqual({
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/apple-icon.png",
    });
  });
});

describe("home page structure", () => {
  it("renders the primary homepage sections", () => {
    render(<HomePage />);

    expect(screen.getByText("Lefan's Portfolio")).toBeInTheDocument();
    expect(screen.getByTestId("fav-projects")).toBeInTheDocument();
    expect(screen.getByTestId("deferred-sections")).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.queryByText("Resume")).not.toBeInTheDocument();
  });
});

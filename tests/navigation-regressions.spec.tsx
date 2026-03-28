import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("navbar regressions", () => {
  it("does not render nested anchors when a flyout menu opens", () => {
    const { container } = render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));

    expect(screen.getByRole("link", { name: /about me/i })).toHaveAttribute(
      "href",
      "/"
    );
    expect(container.querySelector("a a")).toBeNull();
  });

  it("renders the three.js flyout entries as links", () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: "Three.js" }));

    expect(
      screen.getByRole("link", { name: /alternate portfolio/i })
    ).toHaveAttribute("href", "/projects/threejs");
  });
});

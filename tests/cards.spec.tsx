import React from "react";
import { render, screen } from "@testing-library/react";
import Carousel from "@/components/Carousel";
import SlidingCards from "@/components/SlidingCards";

describe("project cards", () => {
  it("does not wrap a SlidingCards card without href in a link", () => {
    render(
      <SlidingCards
        cards={[{ name: "No link", description: "d", imgSrc: "/a.png" }]}
      />
    );

    expect(screen.getByAltText("No link").closest("a")).toBeNull();
  });

  it("gives Carousel images their own width and height", () => {
    render(
      <Carousel
        imageList={[{ src: "/wide.png", alt: "wide", width: 1024, height: 720 }]}
      />
    );

    const img = screen.getAllByAltText("wide")[0];
    expect(img).toHaveAttribute("width", "1024");
    expect(img).toHaveAttribute("height", "720");
    expect(img.closest("a")).toBeNull();
  });
});

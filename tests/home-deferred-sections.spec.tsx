import React from "react";
import { render, screen } from "@testing-library/react";
import HomeDeferredSections from "@/components/portfolio/HomeDeferredSections";
import { LEETCODE_PROFILE_URL } from "@/components/portfolio/lt/profile";

// The section's code is fetched separately; here that fetch has failed, which
// reaches React as an error thrown while rendering the lazy component.
vi.mock("next/dynamic", () => ({
  default: () =>
    function FailedChunk() {
      throw new Error("ChunkLoadError: Failed to load chunk");
    },
}));

describe("the Coding section when its code cannot be fetched", () => {
  it("keeps its place on the page and says what to do, instead of taking the page down", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(<HomeDeferredSections />);

    const section = container.querySelector("section#coding");
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Coding" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Unavailable");
    expect(section).toHaveTextContent("This section did not load. Reloading the page usually brings it back.");
    expect(screen.getByRole("link", { name: /my leetcode profile/i })).toHaveAttribute("href", LEETCODE_PROFILE_URL);
    errors.mockRestore();
  });
});

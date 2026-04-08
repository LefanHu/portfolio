import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import JSCanvas from "@/components/jsCanvas";
import JSPage from "@/app/(portfolio)/js/page";

const searchParamsState = {
  script: null as string | null,
};

const mockSearchParams = {
  get: (key: string) => (key === "script" ? searchParamsState.script : null),
};

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("js experiments", () => {
  afterEach(() => {
    searchParamsState.script = null;
  });

  it("renders the selected experiment inside an isolated iframe", () => {
    render(<JSCanvas className="h-full w-full" scriptSrc="/scripts/balls.js" />);

    const frame = screen.getByTitle(/js canvas experiment/i);
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(frame).toHaveAttribute("srcdoc");
    expect(frame.getAttribute("srcdoc")).toContain('/scripts/balls.js');
    expect(frame.getAttribute("srcdoc")).toContain('id="jsCanvas"');
  });

  it("uses the query string script when loading the JS experiments page", () => {
    searchParamsState.script = "hue_effect.js";

    render(<JSPage />);

    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(
      screen.getByText("hue_effect.js", { selector: "span" })
    ).toBeInTheDocument();

    const frame = screen.getByTitle(/js canvas experiment/i);
    expect(frame.getAttribute("srcdoc")).toContain('/scripts/hue_effect.js');
  });

  it("switches experiments when clicking a different script", () => {
    render(<JSPage />);

    expect(
      screen.getByText("balls.js", { selector: "span" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hue_effect\.js/i }));

    return waitFor(() => {
      const frame = screen.getByTitle(/js canvas experiment/i);
      expect(frame.getAttribute("srcdoc")).toContain('/scripts/hue_effect.js');
      expect(
        screen.getByText("hue_effect.js", { selector: "span" })
      ).toBeInTheDocument();
    });
  });
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import JSCanvas from "@/components/jsCanvas";
import JSPage from "@/app/(portfolio)/js/page";

const allScripts = [
  "balls.js",
  "hue_effect.js",
  "starfield_warp.js",
  "matrix_rain.js",
  "orbit_trails.js",
  "lava_lamp.js",
  "sunset_waves.js",
  "plasma_field.js",
  "fireflies.js",
  "kaleidoscope_lines.js",
  "tunnel_rings.js",
  "equalizer_bars.js",
  "sort_visualizer.js",
];

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
    searchParamsState.script = "starfield_warp.js";

    render(<JSPage />);

    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(
      screen.getByText("starfield_warp.js", { selector: "span" })
    ).toBeInTheDocument();

    const frame = screen.getByTitle(/js canvas experiment/i);
    expect(frame.getAttribute("srcdoc")).toContain('/scripts/starfield_warp.js');
  });

  it.each(allScripts)(
    "loads %s from the query string into the iframe runner",
    (scriptName) => {
      searchParamsState.script = scriptName;

      render(<JSPage />);

      const frame = screen.getByTitle(/js canvas experiment/i);
      expect(frame.getAttribute("srcdoc")).toContain(`/scripts/${scriptName}`);
      expect(
        screen.getByText(scriptName, { selector: "span" })
      ).toBeInTheDocument();
    }
  );

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

  it("renders every registered experiment in the sidebar", () => {
    render(<JSPage />);

    allScripts.forEach((scriptName) => {
      expect(
        screen.getByRole("button", {
          name: new RegExp(scriptName.replace(".", "\\."), "i"),
        })
      ).toBeInTheDocument();
    });
  });
});

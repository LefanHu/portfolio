import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  "voxel_function_field.js",
  "neon_tunnel_3d.js",
  "particle_wave_3d.js",
  "orbital_nodes_3d.js",
  "crystal_lattice_3d.js",
];

const threeScripts = new Set([
  "voxel_function_field.js",
  "neon_tunnel_3d.js",
  "particle_wave_3d.js",
  "orbital_nodes_3d.js",
  "crystal_lattice_3d.js",
]);

const searchParamsState = {
  script: null as string | null,
};

const mockSearchParams = {
  get: (key: string) => (key === "script" ? searchParamsState.script : null),
};

vi.mock("@/components/portfolio/js/VoxelFunctionField3D", () => ({
  default: (props: { className?: string }) => (
    <div
      className={props.className}
      data-testid="voxel-function-field-3d"
    />
  ),
}));

vi.mock("@/components/portfolio/js/NeonTunnel3D", () => ({
  default: (props: { className?: string }) => (
    <div className={props.className} data-testid="neon-tunnel-3d" />
  ),
}));

vi.mock("@/components/portfolio/js/ParticleWave3D", () => ({
  default: (props: { className?: string }) => (
    <div className={props.className} data-testid="particle-wave-3d" />
  ),
}));

vi.mock("@/components/portfolio/js/OrbitalNodes3D", () => ({
  default: (props: { className?: string }) => (
    <div className={props.className} data-testid="orbital-nodes-3d" />
  ),
}));

vi.mock("@/components/portfolio/js/CrystalLattice3D", () => ({
  default: (props: { className?: string }) => (
    <div className={props.className} data-testid="crystal-lattice-3d" />
  ),
}));

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

      expect(
        screen.getByText(scriptName, { selector: "span" })
      ).toBeInTheDocument();

      if (threeScripts.has(scriptName)) {
        const expectedTestId =
          scriptName === "voxel_function_field.js"
            ? "voxel-function-field-3d"
            : scriptName === "neon_tunnel_3d.js"
              ? "neon-tunnel-3d"
              : scriptName === "particle_wave_3d.js"
                ? "particle-wave-3d"
                : scriptName === "orbital_nodes_3d.js"
                  ? "orbital-nodes-3d"
                  : "crystal-lattice-3d";

        expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
        expect(
          screen.queryByTitle(/js canvas experiment/i)
        ).not.toBeInTheDocument();
        return;
      }

      const frame = screen.getByTitle(/js canvas experiment/i);
      expect(frame.getAttribute("srcdoc")).toContain(`/scripts/${scriptName}`);
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

  it("renders the voxel experiment through the three renderer path", () => {
    searchParamsState.script = "voxel_function_field.js";

    render(<JSPage />);

    expect(screen.getByTestId("voxel-function-field-3d")).toBeInTheDocument();
    expect(screen.queryByTitle(/js canvas experiment/i)).not.toBeInTheDocument();
  });

  it("renders the new three experiments through dedicated renderer components", () => {
    searchParamsState.script = "neon_tunnel_3d.js";
    render(<JSPage />);

    expect(screen.getByTestId("neon-tunnel-3d")).toBeInTheDocument();
    expect(screen.queryByTitle(/js canvas experiment/i)).not.toBeInTheDocument();

    cleanup();
    searchParamsState.script = "particle_wave_3d.js";
    render(<JSPage />);
    expect(screen.getByTestId("particle-wave-3d")).toBeInTheDocument();

    cleanup();
    searchParamsState.script = "orbital_nodes_3d.js";
    render(<JSPage />);
    expect(screen.getByTestId("orbital-nodes-3d")).toBeInTheDocument();

    cleanup();
    searchParamsState.script = "crystal_lattice_3d.js";
    render(<JSPage />);
    expect(screen.getByTestId("crystal-lattice-3d")).toBeInTheDocument();
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

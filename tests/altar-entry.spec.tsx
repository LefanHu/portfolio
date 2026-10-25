import React from "react";
import { render, screen } from "@testing-library/react";
import DesktopOnly from "@/components/altar/DesktopOnly";
import AltarEntry from "@/components/altar/AltarEntry";

const mocks = vi.hoisted(() => ({ detectSupport: vi.fn(), readSupportEnv: vi.fn() }));
const experience = vi.hoisted(() => ({ crash: false }));
vi.mock("@/lib/altar/support", () => mocks);
vi.mock("@/components/altar/AltarExperience", () => ({
  default: () => {
    if (experience.crash) throw new Error("webgl exploded");
    return <div data-testid="experience" />;
  },
}));
vi.mock("@/components/three/LoaderSceen", () => ({ LoaderScreen: () => <div /> }));

describe("DesktopOnly", () => {
  it("links to the regular portfolio", () => {
    render(<DesktopOnly />);
    expect(screen.getByRole("heading", { name: /built for desktop/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /regular portfolio/i }).getAttribute("href")).toBe("/");
  });
  it.each([
    ["phone", /built for desktop/i],
    ["no-webgl", /can't run the 3D scene/i],
    ["error", /couldn't start/i],
  ] as const)("explains the %s case", (reason, heading) => {
    render(<DesktopOnly reason={reason} />);
    expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    expect(screen.getByRole("link", { name: /regular portfolio/i }).getAttribute("href")).toBe("/");
  });
});

describe("AltarEntry", () => {
  it("shows the fallback when unsupported", async () => {
    mocks.readSupportEnv.mockReturnValue({});
    mocks.detectSupport.mockReturnValue({ ok: false, reason: "phone" });
    render(<AltarEntry />);
    expect(await screen.findByRole("link", { name: /regular portfolio/i })).toBeTruthy();
  });
  it("tells a desktop without WebGL 2 why", async () => {
    mocks.readSupportEnv.mockReturnValue({});
    mocks.detectSupport.mockReturnValue({ ok: false, reason: "no-webgl" });
    render(<AltarEntry />);
    expect(await screen.findByRole("heading", { name: /can't run the 3D scene/i })).toBeTruthy();
  });
  it("falls back to the regular portfolio when the scene throws", async () => {
    mocks.readSupportEnv.mockReturnValue({});
    mocks.detectSupport.mockReturnValue({ ok: true });
    experience.crash = true;
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(<AltarEntry />);
      expect(await screen.findByRole("heading", { name: /couldn't start/i })).toBeTruthy();
      expect(screen.getByRole("link", { name: /regular portfolio/i }).getAttribute("href")).toBe("/");
    } finally {
      experience.crash = false;
      log.mockRestore();
    }
  });
  it("loads the experience when supported", async () => {
    mocks.readSupportEnv.mockReturnValue({});
    mocks.detectSupport.mockReturnValue({ ok: true });
    render(<AltarEntry />);
    expect(await screen.findByTestId("experience")).toBeTruthy();
  });
});

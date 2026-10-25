import { detectSupport, readSupportEnv } from "@/lib/altar/support";

describe("detectSupport", () => {
  it("rejects phones", () => {
    expect(detectSupport({ coarsePointer: true, minScreenSide: 390, hasWebGL2: true })).toEqual({
      ok: false,
      reason: "phone",
    });
  });
  it("allows tablets", () => {
    expect(detectSupport({ coarsePointer: true, minScreenSide: 820, hasWebGL2: true })).toEqual({ ok: true });
  });
  it("allows small fine-pointer windows", () => {
    expect(detectSupport({ coarsePointer: false, minScreenSide: 390, hasWebGL2: true })).toEqual({ ok: true });
  });
  it("rejects desktop without webgl2", () => {
    expect(detectSupport({ coarsePointer: false, minScreenSide: 1080, hasWebGL2: false })).toEqual({
      ok: false,
      reason: "no-webgl",
    });
  });
});

describe("readSupportEnv", () => {
  it("releases the probe's WebGL context", () => {
    const loseContext = vi.fn();
    const getExtension = vi.fn((name: string) => (name === "WEBGL_lose_context" ? { loseContext } : null));
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext") as unknown as {
      mockReturnValue(v: unknown): void;
      mockRestore(): void;
    };
    getContext.mockReturnValue({ getExtension });
    try {
      expect(readSupportEnv().hasWebGL2).toBe(true);
      expect(loseContext).toHaveBeenCalledTimes(1);
    } finally {
      getContext.mockRestore();
    }
  });
  it("reports no WebGL 2 when the context is unavailable", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    try {
      expect(readSupportEnv().hasWebGL2).toBe(false);
    } finally {
      getContext.mockRestore();
    }
  });
});

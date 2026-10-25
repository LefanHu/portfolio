export type SupportEnv = {
  coarsePointer: boolean;
  minScreenSide: number;
  hasWebGL2: boolean;
};

export type SupportResult = { ok: true } | { ok: false; reason: "phone" | "no-webgl" };

export function detectSupport(env: SupportEnv): SupportResult {
  if (env.coarsePointer && env.minScreenSide < 768) return { ok: false, reason: "phone" };
  if (!env.hasWebGL2) return { ok: false, reason: "no-webgl" };
  return { ok: true };
}

export function readSupportEnv(): SupportEnv {
  let hasWebGL2 = false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    hasWebGL2 = gl !== null;
    // Release the probe now; it would otherwise count toward the context cap until GC.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    hasWebGL2 = false;
  }
  return {
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    minScreenSide: Math.min(window.screen.width, window.screen.height),
    hasWebGL2,
  };
}

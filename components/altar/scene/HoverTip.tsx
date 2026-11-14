"use client";

import { Html } from "@react-three/drei";
import { useAltarStore } from "@/lib/altar/store";
import { THEMES } from "@/lib/altar/theme";

/** Gap (px) between a lifted tag and the one it clears. */
const LIFT_GAP_PX = 6;

/**
 * Name + flavor tooltip anchored at its parent's origin, floating above it.
 * `compact` is a name-only tag (no flavor), with an `accent` dot if given;
 * `lift` raises it by one more tag height, so a neighbour's tag can sit below.
 */
export default function HoverTip({
  name,
  flavor,
  compact = false,
  lift = false,
  accent,
}: {
  name: string;
  flavor?: string;
  compact?: boolean;
  lift?: boolean;
  accent?: string;
}) {
  const theme = useAltarStore((s) => s.theme);
  const colors = THEMES[theme].projection;
  return (
    <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          transform: lift ? `translateY(calc(-200% - ${LIFT_GAP_PX}px))` : "translateY(-100%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "max-content",
          maxWidth: 230,
          padding: compact ? "4px 8px" : "8px 11px",
          borderRadius: 6,
          background: `color-mix(in srgb, ${colors.fill} ${theme === "dark" ? 88 : 92}%, transparent)`,
          border: `1px solid color-mix(in srgb, ${colors.line} 55%, transparent)`,
          boxShadow: `0 0 14px color-mix(in srgb, ${colors.line} ${theme === "dark" ? 35 : 12}%, transparent)`,
          color: colors.text,
          // the site's title face (next/font variable on <html>), then the old stack
          fontFamily: "var(--font-heading), Georgia, 'Iowan Old Style', serif",
          lineHeight: 1.3,
          userSelect: "none",
        }}
      >
        {accent && (
          <span
            aria-hidden="true"
            style={{ width: 7, height: 7, borderRadius: "50%", flex: "none", background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
        )}
        <div>
          <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, letterSpacing: "0.02em" }}>{name}</div>
          {!compact && flavor && (
            <div style={{ fontSize: 12, fontStyle: "italic", opacity: 0.85, marginTop: 3 }}>{flavor}</div>
          )}
        </div>
      </div>
    </Html>
  );
}

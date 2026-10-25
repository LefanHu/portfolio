"use client";

import { Html } from "@react-three/drei";
import { useAltarStore } from "@/lib/altar/store";
import { THEMES } from "@/lib/altar/theme";

/** Name + flavor tooltip anchored at its parent's origin, floating above it. */
export default function HoverTip({ name, flavor }: { name: string; flavor: string }) {
  const theme = useAltarStore((s) => s.theme);
  const colors = THEMES[theme].projection;
  return (
    <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          transform: "translateY(-100%)",
          width: "max-content",
          maxWidth: 230,
          padding: "8px 11px",
          borderRadius: 6,
          background: `color-mix(in srgb, ${colors.fill} ${theme === "dark" ? 88 : 92}%, transparent)`,
          border: `1px solid color-mix(in srgb, ${colors.line} 55%, transparent)`,
          boxShadow: `0 0 14px color-mix(in srgb, ${colors.line} ${theme === "dark" ? 35 : 12}%, transparent)`,
          color: colors.text,
          fontFamily: "Georgia, 'Iowan Old Style', serif",
          lineHeight: 1.3,
          userSelect: "none",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>{name}</div>
        <div style={{ fontSize: 12, fontStyle: "italic", opacity: 0.85, marginTop: 3 }}>{flavor}</div>
      </div>
    </Html>
  );
}

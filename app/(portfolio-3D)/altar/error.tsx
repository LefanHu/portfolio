"use client";

import { useEffect } from "react";
import DesktopOnly from "@/components/altar/DesktopOnly";

// Backstop for anything that escapes AltarEntry's own boundary.
export default function AltarError({ error }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <DesktopOnly reason="error" />;
}

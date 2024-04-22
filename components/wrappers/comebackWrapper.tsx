"use client";

import { ReactNode, useEffect, useState } from "react";

export default function ComeBackWrapper({ children }: { children: ReactNode }) {
  const [docTitle, setDocTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!docTitle) {
      setDocTitle(document.title);
      return;
    }

    window.addEventListener("blur", () => {
      document.title = "Come back silly goose ;-;";
    });

    window.addEventListener("focus", () => {
      document.title = docTitle!;
    });
  }, [docTitle]);

  return <>{children}</>;
}

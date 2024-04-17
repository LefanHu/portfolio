"use client";

import { ReactNode, useEffect } from "react";

export default function ComeBackWrapper({ children }: { children: ReactNode }) {
  const docTitle = document.title;
  useEffect(() => {
    window.addEventListener("blur", () => {
      document.title = "Come back silly goose ;-;";
    });

    window.addEventListener("focus", () => {
      document.title = docTitle;
    });
  });

  return <>{children}</>;
}

/// <reference types="vitest/globals" />
import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/image")>();
  return {
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
      React.createElement("img", props),
    // the real function (pure, config-driven), spied on
    getImageProps: vi.fn(actual.getImageProps),
  };
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement("a", { href, ...props }, children),
}));

// next/font is resolved by the Next compiler; under Vitest it is a plain stub.
vi.mock("next/font/google", () => {
  const font = () => ({ className: "font-mock", variable: "font-mock-variable", style: { fontFamily: "mock" } });
  return { Alegreya: font, Alegreya_Sans: font };
});

vi.mock("next/script", () => ({
  default: () => null,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  root = null;
  rootMargin = "";
  thresholds = [];
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

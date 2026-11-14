"use client";

import { useEffect, useRef } from "react";

// The home page's sky: drifting points joined into loose constellations that
// lean away from the pointer. Stars at night, faint ink dots by day (the colour
// is the --star token). It sits behind the page, thins out once the reader has
// scrolled past the first screen, stops when the tab is hidden, and holds still
// for visitors who prefer reduced motion.

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const LINK_DISTANCE = 140;
const POINTER_RADIUS = 130;
const MAX_STARS = 90;
/** Past this scroll offset the sky is at its faintest and the loop slows down. */
const DEEP_SCROLL = 900;

export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let tick = 0;
    let idle = 0;
    let color = "rgba(188, 210, 255, 0.55)";
    const pointer = { x: -9999, y: -9999 };

    const readColor = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue("--star").trim();
      if (value) color = value;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const widthChanged = window.innerWidth !== width;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Phones fire resize whenever the address bar slides in or out. Only a
      // change of width is a new layout; otherwise the sky must not jump.
      if (!widthChanged && stars.length > 0) return;
      const count = Math.min(MAX_STARS, Math.round((width * height) / 16000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.7 + Math.random() * 1.3,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.strokeStyle = color;
      context.lineWidth = 0.6;
      for (let i = 0; i < stars.length; i += 1) {
        const a = stars[i];
        context.globalAlpha = 1;
        context.beginPath();
        context.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        context.fill();
        for (let j = i + 1; j < stars.length; j += 1) {
          const b = stars[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > LINK_DISTANCE) continue;
          context.globalAlpha = (1 - distance / LINK_DISTANCE) * 0.5;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    };

    const step = () => {
      tick += 1;
      // The theme can change (and cross-fade) at any time; re-reading is cheap.
      if (tick % 12 === 0) readColor();
      for (const star of stars) {
        const dx = star.x - pointer.x;
        const dy = star.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < POINTER_RADIUS && distance > 0.01) {
          const push = ((POINTER_RADIUS - distance) / POINTER_RADIUS) * 1.6;
          star.x += (dx / distance) * push;
          star.y += (dy / distance) * push;
        }
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < -10) star.x = width + 10;
        else if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        else if (star.y > height + 10) star.y = -10;
      }
      draw();
      // A flourish for the top of the page, not a texture behind the résumé.
      canvas.style.opacity = String(Math.max(0.3, 1 - window.scrollY / 900));
      // Deep in the page it is barely visible: drop to a few frames a second.
      if (window.scrollY > DEEP_SCROLL) idle = window.setTimeout(() => (frame = requestAnimationFrame(step)), 180);
      else frame = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      if (reduceMotion) {
        // No loop means no scroll fade either: keep the still sky at its faintest.
        canvas.style.opacity = "0.4";
        readColor();
        draw();
      } else if (!document.hidden) {
        frame = requestAnimationFrame(step);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      // A finger has no hover: following it would leave a hole where it last touched.
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onResize = () => {
      resize();
      start();
    };
    // In reduced-motion mode there is no loop, so follow the theme explicitly.
    const themeObserver = new MutationObserver(() => {
      if (reduceMotion) start();
    });

    readColor();
    resize();
    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", start);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", start);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-constellation
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-1 h-full w-full"
    />
  );
}

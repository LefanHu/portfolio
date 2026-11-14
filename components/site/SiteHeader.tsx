"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { CloseIcon, CubeIcon, MenuIcon } from "@/components/ui/icons";
import { CONTAINER } from "@/components/ui/layout";
import Sigil, { type SectionKey } from "@/components/ui/Sigil";
import ThemeToggle from "./ThemeToggle";

// The four home sections, in page order. They are the altar's four recipes,
// so each link wears its recipe's sigil; the sigil fills for the section in view.
const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "coding", label: "Coding" },
  { key: "contact", label: "Contact" },
];

const PLAYGROUND = { href: "/js", label: "Playground" };
const ALTAR = { href: "/altar", label: "3D altar" };

/**
 * Which home section the reader is in: the last one whose top has passed a
 * reading line a third of the way down the viewport. The final section can
 * never scroll that high, so reaching the bottom of the page selects it. Null
 * above the first section and off the home page.
 */
function useActiveSection(enabled: boolean): SectionKey | null {
  const [active, setActive] = useState<SectionKey | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.34;
      let current: SectionKey | null = null;
      let last: SectionKey | null = null;
      for (const { key } of SECTIONS) {
        const element = document.getElementById(SITE_ANCHORS[key]);
        if (!element) continue;
        last = key;
        if (element.getBoundingClientRect().top <= line) current = key;
      }
      const scrolled = window.scrollY > 0;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      setActive(scrolled && atBottom ? last : current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    // Sections change height after load (live data, fonts, images).
    window.addEventListener("resize", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
    };
  }, [enabled]);

  return enabled ? active : null;
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/";
  const inProjects = pathname.startsWith("/projects") || pathname.startsWith("/project-gallery");
  const activeSection = useActiveSection(onHome);
  // The menu belongs to the page it was opened on, so any navigation (a link,
  // Back, Forward) closes it without an effect.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);

  const current: SectionKey | null = onHome ? activeSection : inProjects ? "projects" : null;

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Inside the altar's framed view, an unhandled Escape closes the projection.
      event.preventDefault();
      event.stopPropagation();
      setMenuOpenOn(null);
      headerRef.current?.querySelector<HTMLElement>("[data-menu-button]")?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpenOn(null);
    };
    // The menu only exists below the desktop breakpoint; don't leave it open behind the full nav.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onDesktop = () => {
      if (desktop.matches) setMenuOpenOn(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener?.("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener?.("change", onDesktop);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpenOn(null);

  return (
    <header
      ref={headerRef}
      data-site-header
      className="sticky top-0 z-40 border-b border-line bg-sky/80 backdrop-blur-md"
    >
      <div className={`${CONTAINER} flex h-(--nav-h) items-center gap-3`}>
        <Link
          href="/"
          onClick={closeMenu}
          aria-current={onHome && !activeSection ? "page" : undefined}
          className="mr-auto inline-flex min-h-11 shrink-0 items-center whitespace-nowrap font-display text-[1.4rem] font-extrabold leading-none tracking-tight text-ink no-underline hover:text-rune lg:mr-4"
        >
          Lefan Hu
        </Link>

        <nav aria-label="Main" className="mr-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map(({ key, label }) => (
              <li key={key}>
                <Link
                  href={`/#${SITE_ANCHORS[key]}`}
                  aria-current={current === key ? (onHome ? "location" : "true") : undefined}
                  className="group inline-flex h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-body no-underline hover:bg-rune-wash hover:text-ink aria-[current]:text-ink"
                >
                  <Sigil section={key} filled={current === key} />
                  {label}
                </Link>
              </li>
            ))}
            <li aria-hidden="true" className="mx-2 h-5 w-px bg-line-strong" />
            <li>
              <Link
                href={PLAYGROUND.href}
                aria-current={pathname === PLAYGROUND.href ? "page" : undefined}
                className="inline-flex h-11 items-center rounded-control px-3 text-sm font-medium text-body no-underline hover:bg-rune-wash hover:text-ink aria-[current]:text-ink aria-[current]:underline aria-[current]:decoration-rune aria-[current]:decoration-2 aria-[current]:underline-offset-8"
              >
                {PLAYGROUND.label}
              </Link>
            </li>
          </ul>
        </nav>

        {/* The altar needs a pointer and a wide screen, so the shortcut hides on phones. */}
        <div className="hidden shrink-0 sm:block">
          <Link href={ALTAR.href} className={buttonClasses("secondary", "whitespace-nowrap")}>
            <CubeIcon />
            {ALTAR.label}
          </Link>
        </div>
        <ThemeToggle />
        <button
          type="button"
          data-menu-button
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-pane text-ink hover:border-rune hover:text-rune lg:hidden"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav
        id={menuId}
        aria-label="Menu"
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--nav-h))] animate-drop overflow-y-auto overscroll-contain border-b border-line bg-pane shadow-lift lg:hidden"
      >
        <ul className={`${CONTAINER} divide-y divide-line py-2`}>
          {SECTIONS.map(({ key, label }) => (
            <li key={key}>
              <Link
                href={`/#${SITE_ANCHORS[key]}`}
                onClick={closeMenu}
                aria-current={current === key ? (onHome ? "location" : "true") : undefined}
                className="flex min-h-12 items-center gap-3 text-base font-medium text-ink no-underline"
              >
                <Sigil section={key} filled={current === key} />
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={PLAYGROUND.href}
              onClick={closeMenu}
              aria-current={pathname === PLAYGROUND.href ? "page" : undefined}
              className="flex min-h-12 items-center text-base font-medium text-ink no-underline"
            >
              {PLAYGROUND.label}
            </Link>
          </li>
          <li>
            <Link
              href={ALTAR.href}
              onClick={closeMenu}
              className="flex min-h-12 items-center gap-3 text-base font-medium text-ink no-underline"
            >
              <CubeIcon />
              {ALTAR.label}
              <span className="text-sm font-normal text-mute">best on a desktop</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

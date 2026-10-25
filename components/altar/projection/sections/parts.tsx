import type { ReactNode } from "react";
import { getImageProps } from "next/image";

// Building blocks shared by the section panels. `data-wire` marks what the
// wire stage draws: "box" outlines, "text" skeleton bars, "img" crossed frames.

/** Site pages navigate in the same tab; everything else (external, files) opens a new one. */
export function linkTarget(href: string) {
  const isPage = href.startsWith("/") && !/\.[a-z0-9]+$/i.test(href);
  return isPage ? {} : { target: "_blank", rel: "noopener noreferrer" };
}

/**
 * A photo that is a crossed wire frame until the content fills in. Props come
 * from next/image's getImageProps (srcset through the optimizer per the build's
 * image config; SVGs as-is); a plain <img> because panels render in drei's own
 * React root. The intrinsic size only sets the aspect hint: CSS sizes the image.
 */
export function WireImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const { props } = getImageProps({ src, alt, width: 640, height: 400, sizes: "26vw" });
  return (
    <div className={`ap-img ${className}`} data-wire="img">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...props} />
    </div>
  );
}

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="ap-chips">
      {items.map((t) => (
        <li key={t} className="ap-chip" data-wire="box">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="ap-label" data-wire="text">
      {children}
    </p>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/ui/icons";
import styles from "./MediaGallery.module.css";

export interface GalleryImage {
  src: string;
  /** Intrinsic size of the file, so space is reserved at the picture's real shape. */
  width: number;
  height: number;
  alt: string;
  /** Shown under the thumbnail and in the lightbox. */
  caption?: string;
}

// Two columns on phones in both layouts; an odd set of three leads with a wide first picture.
const LAYOUT = {
  3: {
    grid: "grid-cols-2 sm:grid-cols-3",
    lead: "first:col-span-2 sm:first:col-span-1",
    sizes: "(min-width: 1152px) 340px, (min-width: 640px) 30vw, 92vw",
  },
  4: {
    grid: "grid-cols-2 md:grid-cols-4",
    lead: "",
    sizes: "(min-width: 1152px) 250px, (min-width: 768px) 22vw, 45vw",
  },
} as const;

const CONTROL =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-body hover:bg-rune-wash hover:text-rune";

/**
 * Thumbnails that open in a lightbox. The lightbox is a native modal
 * <dialog>, which brings the focus trap, Esc to close and focus returning to
 * the thumbnail; this component adds backdrop-click, arrow keys and the
 * previous/next buttons.
 */
export default function MediaGallery({
  images,
  label,
  columns = 4,
}: {
  images: readonly GalleryImage[];
  /** What the pictures are, e.g. "Build photos". Names the lightbox for assistive technology. */
  label: string;
  columns?: 3 | 4;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layout = LAYOUT[columns];
  const current = openIndex === null ? null : images[openIndex];
  const many = images.length > 1;

  // The dialog is shown only after its content has rendered, so it opens at its final size.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && openIndex !== null && !dialog.open) dialog.showModal();
  }, [openIndex]);

  const step = (delta: number) =>
    setOpenIndex((index) => (index === null ? index : (index + delta + images.length) % images.length));

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    // The dialog closes itself on Escape. Stop the key there: inside the
    // altar's framed view of the site, an Escape that travels on closes the
    // whole projection as well.
    if (event.key === "Escape") {
      event.stopPropagation();
      return;
    }
    if (!many) return;
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else return;
    event.preventDefault();
  };

  // A click that lands on the dialog element itself is a click on the backdrop.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  return (
    <>
      <ul className={`grid gap-3 sm:gap-4 ${layout.grid}`}>
        {images.map((image, index) => (
          <li key={image.src} className={images.length % 2 === 1 ? layout.lead : ""}>
            <figure>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setOpenIndex(index)}
                className="group block w-full cursor-zoom-in overflow-hidden rounded-control border border-line bg-pane-raise hover:border-rune"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes={layout.sizes}
                  className="h-auto w-full transition-transform duration-300 ease-swift group-hover:scale-[1.03]"
                />
                <span className="sr-only"> (view larger)</span>
              </button>
              {image.caption ? <figcaption className="mt-2 text-xs text-mute">{image.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? `${label}: picture ${openIndex! + 1} of ${images.length}` : label}
        onClose={() => setOpenIndex(null)}
        onClick={onBackdropClick}
        onKeyDown={onKeyDown}
        className={`${styles.lightbox} m-auto max-h-[calc(100dvh-1.5rem)] max-w-none overflow-x-hidden rounded-card border border-line bg-pane p-0 text-body shadow-lift`}
      >
        {current ? (
          <figure
            // The picture's shape at the largest size that fits the viewport
            // (never above the file's own width). Set here rather than left to
            // the image, so the dialog has its final size before the file loads.
            style={{
              width: `min(calc(100vw - 1.5rem), ${current.width}px, calc((100dvh - 9.5rem) * ${current.width / current.height}))`,
            }}
            className="flex flex-col"
          >
            <div className="flex items-center justify-between gap-4 py-1 pl-4 pr-1">
              <p aria-live="polite" aria-atomic="true" className="text-sm text-mute">
                {openIndex! + 1} of {images.length}
                {current.caption ? <span className="sr-only">: {current.caption}</span> : null}
              </p>
              <button type="button" onClick={() => dialogRef.current?.close()} className={CONTROL}>
                <CloseIcon />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div
              style={{ aspectRatio: `${current.width} / ${current.height}` }}
              className="w-full border-y border-line bg-pane-raise"
            >
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="100vw"
                className={`${styles.frame} h-full w-full`}
              />
            </div>
            <div className="flex min-h-13 items-center gap-2 p-1">
              {many ? (
                <button type="button" onClick={() => step(-1)} className={CONTROL}>
                  <ArrowLeftIcon />
                  <span className="sr-only">Previous picture</span>
                </button>
              ) : null}
              <figcaption className="min-w-0 flex-1 px-3 text-center text-sm text-body">{current.caption}</figcaption>
              {many ? (
                <button type="button" onClick={() => step(1)} className={CONTROL}>
                  <ArrowRightIcon />
                  <span className="sr-only">Next picture</span>
                </button>
              ) : null}
            </div>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}

/** First stop for the keyboard on every page: jumps past the header to `<main id="main">`. */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-control focus:bg-rune focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-rune-ink"
    >
      Skip to content
    </a>
  );
}

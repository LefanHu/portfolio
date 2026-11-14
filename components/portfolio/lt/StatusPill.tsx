import { CloseIcon } from "@/components/ui/icons";

export type FetchStatus = "loading" | "ready" | "error";

const LABEL: Record<FetchStatus, string> = {
  loading: "Loading",
  ready: "Live",
  error: "Unavailable",
};

/** Each state has its own mark as well as its own word, so it never rests on colour. */
function Mark({ status }: { status: FetchStatus }) {
  if (status === "error") {
    return <CloseIcon className="text-bad" width="0.95em" height="0.95em" strokeWidth={2.5} />;
  }
  if (status === "loading") {
    return <span aria-hidden="true" className="h-2 w-2 rounded-full border border-mute" />;
  }
  return (
    <span aria-hidden="true" className="relative flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
      <span className="relative h-2 w-2 rounded-full bg-ok" />
    </span>
  );
}

/**
 * Whether the numbers below are live. A polite live region: the change from
 * "Loading" is announced once, with the section's name for context.
 */
export default function StatusPill({ status }: { status: FetchStatus }) {
  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex items-center gap-2 rounded-chip border border-line-strong bg-rune-wash px-3 py-1.5 text-sm font-medium text-ink"
    >
      <Mark status={status} />
      <span className="sr-only">LeetCode statistics: </span>
      {LABEL[status]}
    </p>
  );
}

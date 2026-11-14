"use client";

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";

/** Lines shown before a long block is cut off behind "Show all N lines". */
const COLLAPSED_LINES = 12;
/** A block only collapses when that hides more than a couple of lines. */
const MIN_HIDDEN_LINES = 3;
const COPIED_MS = 1600;

const LANGUAGE_NAMES = { yaml: "YAML", text: "" } as const;

/**
 * Just enough YAML colouring to make structure visible: `key:`, quoted strings
 * and `# comments`. It is not a parser (a `#` inside quotes would be read as a
 * comment); anything it does not recognise stays plain.
 */
function tintYaml(line: string): ReactNode {
  const hash = /(?:^|\s)#/.exec(line);
  const commentAt = hash ? hash.index + hash[0].length - 1 : line.length;
  const text = line.slice(0, commentAt);
  const key = /^(\s*(?:-\s+)?)([\w.-]+)(?=:(?:\s|$))/.exec(text);
  const rest = key ? text.slice(key[0].length) : text;
  return (
    <>
      {key ? (
        <>
          {key[1]}
          <span className="text-rune">{key[2]}</span>
        </>
      ) : null}
      {rest.split(/("[^"]*"|'[^']*')/).map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="text-ember">
            {part}
          </span>
        ) : (
          part
        ),
      )}
      {hash ? <span className="text-mute">{line.slice(commentAt)}</span> : null}
    </>
  );
}

function Lines({ lines, language }: { lines: readonly string[]; language: keyof typeof LANGUAGE_NAMES }) {
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? "\n" : null}
      {language === "yaml" ? tintYaml(line) : line}
    </Fragment>
  ));
}

/**
 * A code sample: a captioned figure with a copy button. The code is real text
 * (selectable, monospaced, scrolled sideways rather than wrapped, since
 * indentation carries meaning) and follows the theme through the tokens. Long
 * samples start collapsed and open in place.
 */
export default function CodeBlock({
  code,
  label,
  language = "text",
  collapsedLines = COLLAPSED_LINES,
}: {
  code: string;
  /** What the sample is, e.g. "Authelia". Shown as the caption, and names the copy button and the scroll region. */
  label: string;
  language?: keyof typeof LANGUAGE_NAMES;
  collapsedLines?: number;
}) {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const [expanded, setExpanded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restId = useId();

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const lines = code.replace(/\n+$/, "").split("\n");
  const collapsible = lines.length >= collapsedLines + MIN_HIDDEN_LINES;
  const head = collapsible ? lines.slice(0, collapsedLines) : lines;
  const rest = collapsible ? lines.slice(collapsedLines) : [];

  const onCopy = async () => {
    let result: "copied" | "failed" = "copied";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // No clipboard access (an insecure origin, or a frame without permission).
      result = "failed";
    }
    setCopy(result);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopy("idle"), COPIED_MS);
  };

  return (
    <figure className="min-w-0 overflow-hidden rounded-control border border-line bg-pane-raise">
      <figcaption className="flex items-center gap-3 border-b border-line py-0.5 pl-4 pr-1">
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{label}</span>
        {/* Dropped on phones, where the caption needs the room. */}
        {LANGUAGE_NAMES[language] ? (
          <span className="hidden text-xs text-mute sm:inline">{LANGUAGE_NAMES[language]}</span>
        ) : null}
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-11 min-w-22 items-center justify-center gap-1.5 whitespace-nowrap rounded-control px-2 text-xs font-medium text-body hover:bg-rune-wash hover:text-rune"
        >
          {copy === "copied" ? <CheckIcon className="text-ok" /> : <CopyIcon />}
          {copy === "copied" ? "Copied" : copy === "failed" ? "Copy failed" : "Copy"}
          <span className="sr-only">: {label}</span>
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copy === "copied" ? `${label} copied to the clipboard` : copy === "failed" ? "Copying failed" : ""}
        </span>
      </figcaption>

      <div className="relative">
        {/* Focusable so the sideways scroll can be reached and driven from the keyboard. */}
        <div role="region" aria-label={`${label}: code`} tabIndex={0} className="overflow-x-auto">
          <pre className="w-max min-w-full px-4 py-3 font-mono text-xs leading-[1.6] text-body [tab-size:2]">
            <code>
              <span className="block">
                <Lines lines={head} language={language} />
              </span>
              {collapsible ? (
                // 0fr → 1fr animates the height of content whose size is not known
                // in advance; `invisible` keeps the closed part out of the
                // accessibility tree and out of find-in-page and selection.
                <span
                  id={restId}
                  className={`grid transition-[grid-template-rows,visibility] duration-300 ease-swift ${
                    expanded ? "grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                  }`}
                >
                  <span className="block min-h-0 overflow-hidden">
                    <Lines lines={rest} language={language} />
                  </span>
                </span>
              ) : null}
            </code>
          </pre>
        </div>
        {collapsible ? (
          // Says "there is more below" while collapsed; a real element because it has to fade out.
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-pane-raise to-transparent transition-opacity duration-300 ease-swift ${
              expanded ? "opacity-0" : ""
            }`}
          />
        ) : null}
      </div>

      {collapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={restId}
          onClick={() => setExpanded((open) => !open)}
          className="flex min-h-11 w-full items-center justify-center border-t border-line px-4 text-sm font-bold text-rune hover:bg-rune-wash hover:text-rune-strong"
        >
          {expanded ? "Show fewer lines" : `Show all ${lines.length} lines`}
        </button>
      ) : null}
    </figure>
  );
}

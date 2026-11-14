import Panel from "@/components/ui/Panel";
import Tag from "@/components/ui/Tag";
import { ExternalIcon } from "@/components/ui/icons";
import { RECENT_LIMIT, problemUrl, type SolvedProblem } from "./profile";

// Two newspaper columns from `sm` up: the list reads down the first, then the second.
const LIST = "mt-3 gap-x-10 sm:columns-2";
const ROW =
  "grid min-h-11 break-inside-avoid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 border-t border-line";
const DATE = "min-w-12 text-right text-xs text-mute lining-nums tabular-nums";

// Placeholder title widths, so the loading list does not look like a table of identical bars.
const PLACEHOLDER_WIDTHS = ["w-3/5", "w-2/5", "w-1/2", "w-2/3", "w-1/3", "w-1/2"];

/**
 * The latest problems with an accepted submission, one row each. Without
 * `problems` it renders placeholder rows of the same height.
 */
export default function RecentlySolved({ problems }: { problems?: SolvedProblem[] }) {
  return (
    <Panel as="section" aria-labelledby="lt-recent-title" className="p-4 sm:p-6">
      <h3 id="lt-recent-title" className="text-heading font-bold">
        Recently solved
      </h3>
      {problems === undefined ? (
        <ul aria-hidden="true" className={LIST}>
          {PLACEHOLDER_WIDTHS.slice(0, RECENT_LIMIT).map((width, index) => (
            <li key={index} className={ROW}>
              <span className="flex min-h-11 items-center">
                <span className={`skeleton block h-3.5 ${width}`} />
              </span>
              <span className="skeleton block h-6 w-14" />
              <span className="flex min-w-12 justify-end">
                <span className="skeleton block h-3 w-10" />
              </span>
            </li>
          ))}
        </ul>
      ) : problems.length === 0 ? (
        <p className="mt-3 text-sm text-mute">No accepted submissions in the latest activity.</p>
      ) : (
        <ul className={LIST}>
          {problems.map((problem) => (
            <li key={problem.slug} className={ROW}>
              <a
                href={problemUrl(problem.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center py-2 text-sm font-medium leading-snug text-ink underline-offset-4 hover:text-rune hover:underline"
              >
                <span className="min-w-0">
                  {problem.title}
                  <ExternalIcon className="ml-1.5 inline align-[-0.1em] text-mute" width="0.9em" height="0.9em" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
              {problem.language ? <Tag>{problem.language}</Tag> : <span />}
              {problem.dateTime && problem.dateLabel ? (
                <time dateTime={problem.dateTime} className={DATE}>
                  {problem.dateLabel}
                </time>
              ) : (
                <span className="min-w-12" />
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

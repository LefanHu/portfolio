"use client";

import { cloneElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActivityCalendar, type Props as CalendarProps } from "react-activity-calendar";
import Panel from "@/components/ui/Panel";
import { useTheme } from "@/lib/useTheme";
import styles from "./lt.module.css";
import { formatCount, formatDay, type SubmissionYear } from "./profile";

// One palette for both schemes: the variables (lt.module.css) change with the theme.
const LEVELS = ["var(--cal-0)", "var(--cal-1)", "var(--cal-2)", "var(--cal-3)", "var(--cal-4)"];
const CALENDAR_THEME = { light: LEVELS, dark: LEVELS };
const BLOCK_RADIUS = 3;

// A native tooltip per day: no extra script or stylesheet, and it follows the theme by itself.
const renderBlock: NonNullable<CalendarProps["renderBlock"]> = (block, activity) =>
  cloneElement(
    block,
    {},
    <title>
      {activity.count === 0
        ? `No submissions on ${formatDay(activity.date)}`
        : `${formatCount(activity.count)} ${activity.count === 1 ? "submission" : "submissions"} on ${formatDay(activity.date)}`}
    </title>,
  );

function Heatmap({ year }: { year: SubmissionYear }) {
  const theme = useTheme();
  const scroller = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  // The year ends today: on a narrow screen start at the recent end, not last winter.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => setOverflowing(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <p id="lt-calendar-summary" className="mt-1 text-sm text-mute lining-nums">
        {formatCount(year.total)} {year.total === 1 ? "submission" : "submissions"} in the past year, on{" "}
        {formatCount(year.activeDays)} {year.activeDays === 1 ? "day" : "days"}.
      </p>
      {/* The grid is a picture of the sentence above; the days themselves are not exposed one by one. */}
      <div
        ref={scroller}
        role="group"
        aria-label="Submission calendar, past year"
        aria-describedby="lt-calendar-summary"
        tabIndex={0}
        className={`${styles.scroller} mt-4 rounded-chip text-mute`}
      >
        <div aria-hidden="true">
          <ActivityCalendar
            data={year.days}
            theme={CALENDAR_THEME}
            colorScheme={theme}
            blockRadius={BLOCK_RADIUS}
            fontSize={12}
            showTotalCount={false}
            showColorLegend={false}
            renderBlock={renderBlock}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-mute">
        {overflowing ? <p>Scroll sideways for earlier months.</p> : null}
        <p className="ml-auto flex items-center gap-1.5">
          Fewer
          <span aria-hidden="true" className="flex gap-1">
            {LEVELS.map((colour) => (
              <svg key={colour} width={12} height={12}>
                <rect width={12} height={12} rx={BLOCK_RADIUS} fill={colour} />
              </svg>
            ))}
          </span>
          More
        </p>
      </div>
    </>
  );
}

/**
 * A year of submissions as a heat-map. `year` is undefined while loading and
 * null when the API sent no usable calendar. The library throws on an empty
 * list, so a year without submissions gets a sentence instead of a grid.
 */
export default function SubmissionCalendar({ year }: { year: SubmissionYear | null | undefined }) {
  return (
    <Panel as="section" aria-labelledby="lt-calendar-title" className={`${styles.calendar} p-4 sm:p-6`}>
      <h3 id="lt-calendar-title" className="text-heading font-bold">
        Submission calendar
      </h3>
      {year === undefined ? (
        <div aria-hidden="true">
          <span className="mt-1 flex h-[1lh] items-center text-sm">
            <span className="skeleton block h-[0.7em] w-64 max-w-full" />
          </span>
          <div className="mt-4 overflow-hidden">
            <div className={`skeleton ${styles.placeholder}`} />
          </div>
          <span className="mt-3 flex h-[1lh] items-center justify-end text-xs">
            <span className="skeleton block h-3 w-36" />
          </span>
        </div>
      ) : year === null ? (
        <p className="mt-1 text-sm text-mute">The submission calendar is unavailable right now.</p>
      ) : year.days.length === 0 ? (
        <p className="mt-1 text-sm text-mute">No submissions in the past year.</p>
      ) : (
        <Heatmap year={year} />
      )}
    </Panel>
  );
}

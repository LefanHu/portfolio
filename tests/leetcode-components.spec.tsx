import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import LeetcodeStats from "@/components/portfolio/LeetcodeStats";
import AnimatedCounter, { REVEAL_MS } from "@/components/portfolio/lt/AnimatedCounter";
import SubmissionCalendar from "@/components/portfolio/lt/SubmissionCalendar";
import {
  LEETCODE_PROFILE_URL,
  toProfileView,
  toSubmissionYear,
  type SubmissionYear,
} from "@/components/portfolio/lt/profile";

type CalendarProps = import("react-activity-calendar").Props;

const activityCalendarMock = vi.fn<(props: CalendarProps) => React.JSX.Element>();

vi.mock("react-activity-calendar", () => ({
  ActivityCalendar: (props: CalendarProps) => activityCalendarMock(props),
}));

const NOW = Date.UTC(2026, 10, 14, 12);
const day = (year: number, month: number, date: number) => String(Date.UTC(year, month - 1, date) / 1000);

const accepted = (title: string, titleSlug: string, timestamp: string, lang = "cpp") => ({
  title,
  titleSlug,
  timestamp,
  statusDisplay: "Accepted",
  lang,
});

const profilePayload = {
  data: {
    allQuestionsCount: [
      { difficulty: "All", count: 4110 },
      { difficulty: "Easy", count: 975 },
      { difficulty: "Medium", count: 2146 },
      { difficulty: "Hard", count: 989 },
    ],
    matchedUser: {
      submitStatsGlobal: {
        acSubmissionNum: [
          { difficulty: "All", count: 792 },
          { difficulty: "Easy", count: 264 },
          { difficulty: "Medium", count: 446 },
          { difficulty: "Hard", count: 82 },
        ],
      },
      problemsSolvedBeatsStats: [
        { difficulty: "Easy", percentage: 98.74 },
        { difficulty: "Medium", percentage: 98.75 },
        { difficulty: "Hard", percentage: 95.88 },
      ],
      submissionCalendar: JSON.stringify({
        [day(2026, 3, 1)]: 1,
        [day(2026, 6, 20)]: 2,
        [day(2026, 11, 7)]: 16,
      }),
      tagProblemCounts: {
        fundamental: [
          { tagName: "Two Pointers", tagSlug: "two-pointers", problemsSolved: 70 },
          { tagName: "Array", tagSlug: "array", problemsSolved: 474 },
        ],
        intermediate: Array.from({ length: 10 }, (_, index) => ({
          tagName: `Topic ${index + 1}`,
          tagSlug: `topic-${index + 1}`,
          problemsSolved: 100 - index,
        })),
        advanced: [{ tagName: "Trie", tagSlug: "trie", problemsSolved: 19 }],
      },
    },
    recentSubmissionList: [
      accepted("Sum of Squares of Special Elements ", "sum-of-squares-of-special-elements", "1794031580"),
      accepted("Sum of Squares of Special Elements ", "sum-of-squares-of-special-elements", "1794031552"),
      accepted("Sum of Squares of Special Elements ", "sum-of-squares-of-special-elements", "1794031487"),
      { ...accepted("Never Solved", "never-solved", "1794031402"), statusDisplay: "Wrong Answer" },
      accepted("Number of Changing Keys", "number-of-changing-keys", "1794028467", "python3"),
      ...Array.from({ length: 6 }, (_, index) => accepted(`Older ${index + 1}`, `older-${index + 1}`, "1791000000")),
    ],
  },
};

function stubFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const json = vi.fn(async () => body);
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json,
  }));
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, json };
}

function section() {
  const element = document.getElementById("coding");
  if (!element) throw new Error("no #coding section");
  return element;
}

async function renderReady(body: unknown = profilePayload) {
  stubFetch(body);
  render(<LeetcodeStats />);
  await screen.findByText("Live");
}

// Never report anything: nothing is ever "in view" and nothing is ever measured.
class InertObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  // Only the clock is faked; timers stay real so async rendering works as usual.
  vi.useFakeTimers({ toFake: ["Date"], now: NOW });
  // Re-stubbed per test because unstubAllGlobals() also removes the ones from tests/setup.ts.
  vi.stubGlobal("IntersectionObserver", InertObserver);
  vi.stubGlobal("ResizeObserver", InertObserver);
  activityCalendarMock.mockImplementation(() => <div data-testid="activity-calendar" />);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  activityCalendarMock.mockReset();
});

describe("LeetcodeStats heading and status", () => {
  it("keeps one fixed heading and reports the state in a polite status", async () => {
    stubFetch(profilePayload);
    render(<LeetcodeStats />);

    const heading = screen.getByRole("heading", { level: 2, name: "Coding" });
    expect(section()).toHaveAttribute("aria-labelledby", heading.id);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("LeetCode statistics: Loading");

    await waitFor(() => expect(status).toHaveTextContent("LeetCode statistics: Live"));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/^Coding$/);
  });

  it("links to the profile and the solutions with descriptive text in every state", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<LeetcodeStats />);

    expect(screen.getByRole("link", { name: /my leetcode profile/i })).toHaveAttribute("href", LEETCODE_PROFILE_URL);
    expect(screen.getByRole("link", { name: /my favourite problems on github/i })).toHaveAttribute(
      "href",
      "https://github.com/LefanHu/leetcode/tree/main",
    );
    expect(screen.queryByRole("link", { name: /^here$/i })).not.toBeInTheDocument();
  });
});

describe("LeetcodeStats loading", () => {
  it("shows placeholders, never numbers that look real", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<LeetcodeStats />);

    expect(section().textContent).not.toMatch(/\d/);
    expect(screen.queryByText(/beats/i)).not.toBeInTheDocument();
    expect(section().querySelector("[aria-busy='true']")).not.toBeNull();
    expect(section().querySelectorAll(".skeleton").length).toBeGreaterThan(10);
    expect(activityCalendarMock).not.toHaveBeenCalled();
  });

  it("aborts the request when it unmounts", () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(<LeetcodeStats />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/leetcode/profile");
    const signal = fetchMock.mock.calls[0][1]?.signal;
    expect(signal?.aborted).toBe(false);

    unmount();
    expect(signal?.aborted).toBe(true);
  });
});

describe("LeetcodeStats with data", () => {
  it("shows the real totals, each with its share and percentile", async () => {
    await renderReady();

    const tile = (term: string) => {
      const group = screen.getByText(term, { selector: "dt" }).parentElement;
      if (!group) throw new Error(`no tile for ${term}`);
      return within(group);
    };

    expect(tile("Total solved").getByText("792")).toBeInTheDocument();
    expect(tile("Total solved").getByText("of 4,110")).toBeInTheDocument();
    expect(tile("Total solved").queryByText(/beats/)).not.toBeInTheDocument();

    expect(tile("Easy").getByText("264")).toBeInTheDocument();
    expect(tile("Easy").getByText("of 975")).toBeInTheDocument();
    expect(tile("Easy").getByText("beats 98.7%")).toBeInTheDocument();
    expect(tile("Medium").getByText("446")).toBeInTheDocument();
    expect(tile("Hard").getByText("82")).toBeInTheDocument();
    expect(tile("Hard").getByText("beats 95.9%")).toBeInTheDocument();

    expect(section().querySelector("[aria-busy='true']")).toBeNull();
    expect(section().querySelector(".skeleton")).toBeNull();
  });

  it("lists each recently solved problem once, newest first, at most six", async () => {
    await renderReady();

    const list = within(screen.getByRole("region", { name: "Recently solved" }));
    const links = list.getAllByRole("link");
    expect(links).toHaveLength(6);

    expect(links[0]).toHaveTextContent("Sum of Squares of Special Elements");
    expect(links[0]).toHaveAttribute("href", "https://leetcode.com/problems/sum-of-squares-of-special-elements/");
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(links[0]).toHaveAccessibleName(/opens in a new tab/);
    expect(list.getAllByText(/Sum of Squares of Special Elements/)).toHaveLength(1);

    expect(links[1]).toHaveTextContent("Number of Changing Keys");
    expect(list.queryByText("Never Solved")).not.toBeInTheDocument();
    expect(list.queryByText(/accepted/i)).not.toBeInTheDocument();

    const rows = list.getAllByRole("listitem");
    expect(within(rows[0]).getByText("C++")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Python")).toBeInTheDocument();
    // A fixed locale and UTC: the same text wherever it renders.
    const time = within(rows[0]).getByText("Nov 7");
    expect(time).toHaveAttribute("datetime", "2026-11-07T06:06:20.000Z");
  });

  it("names skills by topic, most solved first, and tucks the long tail into a disclosure", async () => {
    await renderReady();

    const skills = within(screen.getByRole("region", { name: "Skills by level" }));
    const fundamental = skills.getByText("Fundamental", { selector: "dt" }).nextElementSibling as HTMLElement;
    const chips = within(fundamental).getAllByRole("listitem");
    expect(chips.map((chip) => chip.textContent)).toEqual(["Array474", "Two Pointers70"]);
    expect(within(fundamental).queryByText(/show all/i)).not.toBeInTheDocument();
    expect(skills.queryByText("two-pointers")).not.toBeInTheDocument();

    const intermediate = skills.getByText("Intermediate", { selector: "dt" }).nextElementSibling as HTMLElement;
    const details = intermediate.querySelector("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(details?.querySelector("summary")).toHaveTextContent("Show all 10");
    // Eight up front, the other two inside the disclosure.
    expect(within(intermediate).getAllByRole("listitem", { hidden: true })).toHaveLength(10);
    expect(within(details as HTMLElement).getAllByRole("listitem", { hidden: true })).toHaveLength(2);
  });

  it("gives the calendar the whole past year and a caption in words", async () => {
    await renderReady();

    expect(screen.getByText("19 submissions in the past year, on 3 days.")).toBeInTheDocument();
    expect(activityCalendarMock).toHaveBeenCalled();
    const props = activityCalendarMock.mock.calls[0][0];
    expect(props.data[0]).toEqual({ date: "2025-11-14", count: 0, level: 0 });
    expect(props.data.at(-1)).toEqual({ date: "2026-11-14", count: 0, level: 0 });
    expect(props.data).toContainEqual({ date: "2026-11-07", count: 16, level: 4 });
  });

  it("survives a profile without tag counts", async () => {
    await renderReady({
      data: {
        ...profilePayload.data,
        matchedUser: { ...profilePayload.data.matchedUser, tagProblemCounts: null },
      },
    });

    expect(screen.getByText("792")).toBeInTheDocument();
    expect(screen.getByText("The topic breakdown is unavailable right now.")).toBeInTheDocument();
    expect(screen.queryByText("Fundamental")).not.toBeInTheDocument();
  });

  it("survives a profile with holes: no totals, no percentiles, no recent list", async () => {
    await renderReady({
      data: {
        allQuestionsCount: null,
        matchedUser: {
          submitStatsGlobal: profilePayload.data.matchedUser.submitStatsGlobal,
          problemsSolvedBeatsStats: null,
          submissionCalendar: null,
          tagProblemCounts: { fundamental: null },
        },
        recentSubmissionList: null,
      },
    });

    expect(screen.getByText("792")).toBeInTheDocument();
    expect(screen.queryByText(/^of /)).not.toBeInTheDocument();
    expect(screen.queryByText(/beats/)).not.toBeInTheDocument();
    expect(screen.getByText("No accepted submissions in the latest activity.")).toBeInTheDocument();
    expect(screen.getByText("The submission calendar is unavailable right now.")).toBeInTheDocument();
    expect(activityCalendarMock).not.toHaveBeenCalled();
  });

  it.each([
    ["an empty calendar", "{}", "No submissions in the past year."],
    ["a null calendar", "null", "The submission calendar is unavailable right now."],
    ["malformed calendar JSON", "not json", "The submission calendar is unavailable right now."],
    ["a calendar older than a year", JSON.stringify({ [day(2024, 1, 1)]: 5 }), "No submissions in the past year."],
  ])("never hands the calendar library an empty list: %s", async (_name, submissionCalendar, notice) => {
    await renderReady({
      data: {
        ...profilePayload.data,
        matchedUser: { ...profilePayload.data.matchedUser, submissionCalendar },
      },
    });

    expect(screen.getByText(notice)).toBeInTheDocument();
    expect(activityCalendarMock).not.toHaveBeenCalled();
    expect(screen.getByText("792")).toBeInTheDocument();
  });
});

describe("LeetcodeStats when the data is unavailable", () => {
  const expectSingleNotice = async () => {
    await screen.findByText("Unavailable");
    expect(screen.getByRole("status")).toHaveTextContent("LeetCode statistics: Unavailable");
    expect(screen.getAllByText(/unavailable right now/i)).toHaveLength(1);
    expect(screen.getByText("LeetCode statistics are unavailable right now.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /my leetcode profile/i })).toHaveAttribute("href", LEETCODE_PROFILE_URL);
    // No zeros, no placeholders, no empty sub-panels.
    expect(section().textContent).not.toMatch(/\d/);
    expect(section().querySelector(".skeleton")).toBeNull();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(activityCalendarMock).not.toHaveBeenCalled();
    expect(document.querySelectorAll("#coding")).toHaveLength(1);
  };

  it("collapses to one notice on an error status, without parsing the body as a profile", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { json } = stubFetch({ error: "LeetCode profile is currently unavailable." }, { ok: false, status: 503 });
    render(<LeetcodeStats />);

    await expectSingleNotice();
    expect(json).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("collapses to one notice when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    render(<LeetcodeStats />);
    await expectSingleNotice();
  });

  it("collapses to one notice when the reply has no user", async () => {
    stubFetch({ data: { matchedUser: null, recentSubmissionList: [] } });
    render(<LeetcodeStats />);
    await expectSingleNotice();
  });

  it("collapses to one notice when the reply is not a profile at all", async () => {
    stubFetch(null);
    render(<LeetcodeStats />);
    await expectSingleNotice();
  });
});

describe("toSubmissionYear", () => {
  it("grades active days by quartile instead of a fixed count", () => {
    const counts = [1, 1, 1, 2, 2, 3, 5, 30];
    const calendar = Object.fromEntries(counts.map((count, index) => [day(2026, 5, index + 1), count]));
    const year = toSubmissionYear(JSON.stringify(calendar), NOW) as SubmissionYear;

    const active = year.days.filter((entry) => entry.count > 0);
    expect(active.map((entry) => entry.level)).toEqual([1, 1, 1, 2, 2, 3, 4, 4]);
    expect(year.total).toBe(45);
    expect(year.activeDays).toBe(8);
    for (const entry of year.days) {
      expect(Number.isInteger(entry.level)).toBe(true);
      expect(entry.level).toBeGreaterThanOrEqual(0);
      expect(entry.level).toBeLessThanOrEqual(4);
    }
  });

  it("merges timestamps on the same UTC day and ignores junk entries", () => {
    const noon = String(Number(day(2026, 5, 1)) + 12 * 3600);
    const year = toSubmissionYear(
      JSON.stringify({ [day(2026, 5, 1)]: 2, [noon]: 3, [day(2026, 5, 2)]: "4", nonsense: 9, [day(2026, 5, 3)]: 0 }),
      NOW,
    ) as SubmissionYear;

    expect(year.days.filter((entry) => entry.count > 0)).toEqual([{ date: "2026-05-01", count: 5, level: 1 }]);
    expect(year.total).toBe(5);
  });

  it("does not pad a year that already starts and ends on its bounds", () => {
    const year = toSubmissionYear(JSON.stringify({ [day(2025, 11, 14)]: 1, [day(2026, 11, 14)]: 1 }), NOW);
    expect(year?.days.map((entry) => entry.date)).toEqual(["2025-11-14", "2026-11-14"]);
  });
});

describe("toProfileView", () => {
  it("writes the year once a solved date is not from this year", () => {
    const view = toProfileView(
      {
        data: {
          ...profilePayload.data,
          recentSubmissionList: [accepted("Old One", "old-one", day(2025, 12, 31)), accepted("No Date", "no-date", "")],
        },
      },
      NOW,
    );

    expect(view?.recent.map((problem) => problem.dateLabel)).toEqual(["Dec 31, 2025", null]);
  });
});

describe("SubmissionCalendar", () => {
  const year = toSubmissionYear(profilePayload.data.matchedUser.submissionCalendar, NOW) as SubmissionYear;

  it("is a named, keyboard-focusable region that scrolls to the recent end", () => {
    const scrollWidth = vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(800);
    render(<SubmissionCalendar year={year} />);

    const region = screen.getByRole("group", { name: "Submission calendar, past year" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAccessibleDescription("19 submissions in the past year, on 3 days.");
    expect(region.scrollLeft).toBe(800);
    scrollWidth.mockRestore();
  });

  it("follows the site theme and takes its colours from CSS variables", () => {
    document.documentElement.setAttribute("data-theme", "light");
    render(<SubmissionCalendar year={year} />);
    document.documentElement.removeAttribute("data-theme");

    const props = activityCalendarMock.mock.calls[0][0];
    expect(props.colorScheme).toBe("light");
    expect(props.theme?.light).toHaveLength(5);
    expect(props.theme?.light).toEqual(props.theme?.dark);
    for (const colour of props.theme?.light ?? []) expect(colour).toMatch(/^var\(--/);
    // Our caption replaces the library's "N activities in 2025".
    expect(props.showTotalCount).toBe(false);
  });

  it("renders with the real library: every day of the year, each with a text tooltip", async () => {
    const actual = await vi.importActual<typeof import("react-activity-calendar")>("react-activity-calendar");
    activityCalendarMock.mockImplementation((props) => <actual.ActivityCalendar {...props} />);
    // jsdom has no CSS.supports, which the library uses to validate colours.
    vi.stubGlobal("CSS", { supports: () => true });

    const { container } = render(<SubmissionCalendar year={year} />);

    expect(container.querySelectorAll("rect[data-date]")).toHaveLength(366);
    const busiest = container.querySelector("rect[data-date='2026-11-07']");
    expect(busiest).toHaveAttribute("data-level", "4");
    expect(busiest).toHaveAttribute("fill", "var(--cal-4)");
    expect(busiest?.querySelector("title")).toHaveTextContent("16 submissions on Nov 7, 2026");
    expect(container.querySelector("rect[data-date='2026-11-14'] title")).toHaveTextContent(
      "No submissions on Nov 14, 2026",
    );
    expect(container.textContent).not.toMatch(/activities in/);
  });

  it("shows a placeholder while loading and a sentence when there is nothing to draw", () => {
    const { container, rerender } = render(<SubmissionCalendar year={undefined} />);
    expect(container.querySelector(".skeleton")).not.toBeNull();

    rerender(<SubmissionCalendar year={{ days: [], total: 0, activeDays: 0 }} />);
    expect(screen.getByText("No submissions in the past year.")).toBeInTheDocument();
    expect(activityCalendarMock).not.toHaveBeenCalled();
  });
});

describe("AnimatedCounter", () => {
  // tests/setup.ts installs matchMedia as a mock that never matches.
  const matchMedia = vi.mocked(window.matchMedia);
  const neverMatches = matchMedia.getMockImplementation();
  const reduceMotion = (reduce: boolean) =>
    matchMedia.mockImplementation(
      (query: string) => ({ matches: reduce && query.includes("prefers-reduced-motion"), media: query }) as MediaQueryList,
    );

  afterEach(() => {
    matchMedia.mockImplementation(neverMatches as typeof window.matchMedia);
  });

  it("shows the real value until it is told to play", () => {
    render(<AnimatedCounter value={4110} play={false} />);
    expect(screen.getByText("4,110")).toBeInTheDocument();
  });

  it("shows the real value at once under reduced motion", () => {
    reduceMotion(true);
    render(<AnimatedCounter value={792} play />);
    expect(screen.getByText("792")).toBeInTheDocument();
  });

  it("counts up from zero and lands on the exact value within the reveal time", async () => {
    reduceMotion(false);
    const { container } = render(<AnimatedCounter value={792} play />);
    const counter = container.querySelector("span") as HTMLSpanElement;

    // Zero before the first paint, never a flash of the final number.
    expect(counter).toHaveTextContent(/^0$/);

    const seen: number[] = [];
    const observer = new MutationObserver(() => seen.push(Number(counter.textContent)));
    observer.observe(counter, { childList: true, characterData: true, subtree: true });

    const started = performance.now();
    await waitFor(() => expect(counter).toHaveTextContent(/^792$/), { timeout: REVEAL_MS + 1500 });
    observer.disconnect();

    expect(performance.now() - started).toBeLessThan(REVEAL_MS + 1000);
    expect(seen.length).toBeGreaterThan(1);
    expect(Math.max(...seen)).toBe(792);
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
  });

  it("restores the real value if it unmounts mid-count", () => {
    reduceMotion(false);
    const { container, unmount } = render(<AnimatedCounter value={792} play />);
    const counter = container.querySelector("span") as HTMLSpanElement;
    expect(counter).toHaveTextContent(/^0$/);
    unmount();
    expect(counter).toHaveTextContent(/^792$/);
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import LeetcodeStats from "@/components/portfolio/LeetcodeStats";
import LTActivityCalendar from "@/components/LTActivityCalendar";
import ProgressCircles from "@/components/portfolio/lt/ProgressCircles";

const activityCalendarMock = vi.fn<(props: unknown) => React.JSX.Element>(
  () => <div data-testid="activity-calendar" />
);

vi.mock("react-activity-calendar", () => ({
  ActivityCalendar: (props: unknown) => activityCalendarMock(props),
}));

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const profilePayload = {
  data: {
    matchedUser: {
      submitStatsGlobal: {
        acSubmissionNum: [
          { difficulty: "All", count: 100 },
          { difficulty: "Easy", count: 40 },
          { difficulty: "Medium", count: 45 },
          { difficulty: "Hard", count: 15 },
        ],
      },
      problemsSolvedBeatsStats: [
        { difficulty: "Easy", percentage: 91.2 },
        { difficulty: "Medium", percentage: 82.5 },
        { difficulty: "Hard", percentage: 73.1 },
      ],
      submissionCalendar: JSON.stringify({
        1743206400: 1,
        1743292800: 16,
      }),
      tagProblemCounts: {
        fundamental: [{ tagName: "Array", tagSlug: "array", problemsSolved: 12 }],
        intermediate: [
          { tagName: "Graph", tagSlug: "graph", problemsSolved: 7 },
        ],
        advanced: [{ tagName: "Trie", tagSlug: "trie", problemsSolved: 3 }],
      },
    },
    recentSubmissionList: [
      {
        title: "Two Sum",
        titleSlug: "two-sum",
        timestamp: "1743206400",
        statusDisplay: "Accepted",
        lang: "cpp",
      },
      {
        title: "Bad Submission",
        titleSlug: "bad-submission",
        timestamp: "1743206400",
        statusDisplay: "Wrong Answer",
        lang: "cpp",
      },
    ],
  },
};

describe("leetcode UI regressions", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    activityCalendarMock.mockClear();
  });

  it("renders live stats from the API payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => profilePayload,
      })
    );

    render(
      <MantineProvider>
        <LeetcodeStats />
      </MantineProvider>
    );

    expect(screen.getByText(/\.\.\.Loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/\(Live\!\) Leetcode Statistics/i)).toBeInTheDocument()
    );

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText(/fundamental skills/i)).toBeInTheDocument();
    expect(screen.getByText(/array/i)).toBeInTheDocument();
    expect(screen.queryByText("Bad Submission")).not.toBeInTheDocument();
  });

  it("shows an unavailable state when the API payload is missing matchedUser", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            recentSubmissionList: [],
          },
        }),
      })
    );

    render(
      <MantineProvider>
        <LeetcodeStats />
      </MantineProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/\(Unavailable!\) Leetcode Statistics/i)
      ).toBeInTheDocument()
    );

    expect(
      screen.getByText(/Submission calendar is unavailable right now./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Skill breakdown is unavailable right now./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recent accepted submissions are unavailable right now./i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/fundamental skills/i)).not.toBeInTheDocument();
    expect(activityCalendarMock).not.toHaveBeenCalled();
  });

  it("maps submission counts into integer activity levels", () => {
    render(
      <LTActivityCalendar
        calendarstring={JSON.stringify({
          1743206400: 1,
          1743292800: 16,
        })}
      />
    );

    expect(screen.getByTestId("activity-calendar")).toBeInTheDocument();
    expect(activityCalendarMock).toHaveBeenCalled();

    const props = activityCalendarMock.mock.calls[0][0] as {
      data: { count: number; level: number; date: string }[];
    };

    expect(props.data).toEqual([
      { count: 1, date: "2025-03-29", level: 1 },
      { count: 16, date: "2025-03-30", level: 4 },
    ]);
  });

  it("shows the empty state when no recent submission is accepted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            ...profilePayload.data,
            recentSubmissionList: [profilePayload.data.recentSubmissionList[1]],
          },
        }),
      })
    );

    render(
      <MantineProvider>
        <LeetcodeStats />
      </MantineProvider>
    );

    await waitFor(() =>
      expect(screen.getByText(/\(Live\!\) Leetcode Statistics/i)).toBeInTheDocument()
    );

    expect(
      screen.getByText(/Recent accepted submissions are unavailable right now./i)
    ).toBeInTheDocument();
  });

  it("does not leak calendarstring onto the DOM", () => {
    const { container } = render(
      <LTActivityCalendar calendarstring="{}" className="calendar" />
    );

    const wrapper = container.querySelector(".calendar");
    expect(wrapper).not.toBeNull();
    expect(wrapper).not.toHaveAttribute("calendarstring");
  });

  it("renders an empty calendar for malformed calendar JSON", () => {
    render(<LTActivityCalendar calendarstring="not json" />);

    const props = activityCalendarMock.mock.calls[0][0] as { data: unknown[] };
    expect(props.data).toEqual([]);
  });

  it("renders an empty calendar when the calendar JSON is null", () => {
    render(<LTActivityCalendar calendarstring="null" />);

    const props = activityCalendarMock.mock.calls[0][0] as { data: unknown[] };
    expect(props.data).toEqual([]);
  });

  it("tolerates missing beats stats", () => {
    render(
      <MantineProvider>
        <ProgressCircles
          progress={profilePayload.data.matchedUser.submitStatsGlobal.acSubmissionNum}
          beats={null}
        />
      </MantineProvider>
    );

    expect(screen.getByText("Easy - beats 0%")).toBeInTheDocument();
    expect(screen.getByText("Hard - beats 0%")).toBeInTheDocument();
  });
});

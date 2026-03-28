import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import LeetcodeStats from "@/components/portfolio/LeetcodeStats";
import LTActivityCalendar from "@/components/LTActivityCalendar";

const activityCalendarMock = vi.fn(() => <div data-testid="activity-calendar" />);

vi.mock("react-activity-calendar", () => ({
  ActivityCalendar: (props: unknown) => activityCalendarMock(props),
}));

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
});

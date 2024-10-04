/*
[
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728010082",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728010050",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728009692",
        "statusDisplay": "Wrong Answer",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728009457",
        "statusDisplay": "Runtime Error",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728009340",
        "statusDisplay": "Wrong Answer",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728009282",
        "statusDisplay": "Wrong Answer",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Divide Players Into Teams of Equal Skill",
        "titleSlug": "divide-players-into-teams-of-equal-skill",
        "timestamp": "1728009161",
        "statusDisplay": "Runtime Error",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727929187",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727927423",
        "statusDisplay": "Time Limit Exceeded",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727927351",
        "statusDisplay": "Time Limit Exceeded",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727927249",
        "statusDisplay": "Wrong Answer",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727927221",
        "statusDisplay": "Runtime Error",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727926701",
        "statusDisplay": "Wrong Answer",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Make Sum Divisible by P",
        "titleSlug": "make-sum-divisible-by-p",
        "timestamp": "1727925522",
        "statusDisplay": "Runtime Error",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Rank Transform of an Array",
        "titleSlug": "rank-transform-of-an-array",
        "timestamp": "1727828295",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Rank Transform of an Array",
        "titleSlug": "rank-transform-of-an-array",
        "timestamp": "1727828287",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Rank Transform of an Array",
        "titleSlug": "rank-transform-of-an-array",
        "timestamp": "1727828088",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Check If Array Pairs Are Divisible by k",
        "titleSlug": "check-if-array-pairs-are-divisible-by-k",
        "timestamp": "1727823599",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Check If Array Pairs Are Divisible by k",
        "titleSlug": "check-if-array-pairs-are-divisible-by-k",
        "timestamp": "1727823589",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    },
    {
        "title": "Edit Distance",
        "titleSlug": "edit-distance",
        "timestamp": "1727819647",
        "statusDisplay": "Accepted",
        "lang": "cpp",
        "__typename": "SubmissionDumpNode"
    }
]
*/

export interface LTSubmissionStatResponse {
  data: {
    matchedUser: {
      username: string;
      submitStats: {
        acSubmissionNum: {
          difficulty: string;
          count: number;
          submissions: number;
        }[];
      };
    };
  };
}

export interface LTProfileResponse {
  data: {
    allQuestionsCount: {
      difficulty: string;
      count: number;
    }[];
    matchedUser: {
      contributions: {
        points: number;
      };
      problemsSolvedBeatsStats: {
        difficulty: string;
        percentage: number;
      }[];
      profile: {
        reputation: number;
        ranking: number;
      };
      submissionCalendar: string;
      submitStats: {
        acSubmissionNum: {
          difficulty: string;
          count: number;
          submissions: number;
        }[];
        totalSubmissionNum: {
          difficulty: string;
          count: number;
          submissions: number;
        }[];
      };
      submitStatsGlobal: {
        acSubmissionNum: {
          difficulty: string;
          count: number;
        }[];
      };
      tagProblemCounts: {
        advanced: {
          tagName: string;
          tagSlug: string;
          problemsSolved: number;
        }[];
        intermediate: {
          tagName: string;
          tagSlug: string;
          problemsSolved: number;
        }[];
        fundamental: {
          tagName: string;
          tagSlug: string;
          problemsSolved: number;
        }[];
      };
      userCalendar: {
        activeYears: number[];
        streak: number;
        totalActiveDays: number;
        dccBadges: {
          timestamp: number;
          badge: {
            name: string;
            icon: string;
          };
        }[];
      };
    };
    recentSubmissionList: {
      title: string;
      titleSlug: string;
      timestamp: string;
      statusDisplay: string;
      lang: string;
    }[];
  };
}

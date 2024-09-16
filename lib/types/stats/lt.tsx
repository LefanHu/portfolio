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
  };
}

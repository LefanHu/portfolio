// What GET /api/leetcode/profile returns: LeetCode's GraphQL reply, limited to
// the fields the home page reads. The upstream API is unofficial and changes
// without notice, so every level is optional; components/portfolio/lt/profile.ts
// turns this into the checked shape the components render.

export type LTDifficulty = "All" | "Easy" | "Medium" | "Hard";

export type LTSkillLevel = "fundamental" | "intermediate" | "advanced";

export interface LTCount {
  difficulty?: string | null;
  count?: number | null;
}

export interface LTBeats {
  difficulty?: string | null;
  percentage?: number | null;
}

export interface LTSkill {
  tagName?: string | null;
  tagSlug?: string | null;
  problemsSolved?: number | null;
}

export interface LTSubmission {
  title?: string | null;
  titleSlug?: string | null;
  /** Unix seconds, as a string. */
  timestamp?: string | null;
  statusDisplay?: string | null;
  lang?: string | null;
}

export interface LTProfileResponse {
  data?: {
    /** Problems that exist on LeetCode, per difficulty. */
    allQuestionsCount?: LTCount[] | null;
    matchedUser?: {
      /** JSON object: unix seconds (UTC midnight) -> submissions that day, for the past year. */
      submissionCalendar?: string | null;
      tagProblemCounts?: Partial<Record<LTSkillLevel, LTSkill[] | null>> | null;
      /** Share of LeetCode users who solved fewer problems, per difficulty. */
      problemsSolvedBeatsStats?: LTBeats[] | null;
      submitStatsGlobal?: {
        acSubmissionNum?: LTCount[] | null;
      } | null;
    } | null;
    recentSubmissionList?: LTSubmission[] | null;
  } | null;
}

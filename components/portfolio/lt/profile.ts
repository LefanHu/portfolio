import type { LTDifficulty, LTProfileResponse, LTSkillLevel } from "@/lib/types/stats/lt";

// Turns the API reply into exactly what the section renders. Everything that
// depends on the clock, the locale or the upstream shape is decided here, once,
// when the data arrives, so the components stay pure and cannot crash on a
// missing field.

export const LEETCODE_PROFILE_URL = "https://leetcode.com/u/Lefanhu/";
export const LEETCODE_SOLUTIONS_URL = "https://github.com/LefanHu/leetcode/tree/main";

export function problemUrl(slug: string) {
  return `https://leetcode.com/problems/${encodeURIComponent(slug)}/`;
}

export interface DifficultyStat {
  difficulty: LTDifficulty;
  solved: number;
  /** Problems that exist at this difficulty; null when the API did not say. */
  total: number | null;
  /** Percentile among LeetCode users (0-100); null when the API did not say. */
  beats: number | null;
}

export interface SolvedProblem {
  slug: string;
  title: string;
  language: string;
  /** Machine-readable date for <time>, or null when the timestamp was unusable. */
  dateTime: string | null;
  dateLabel: string | null;
}

export interface Skill {
  slug: string;
  name: string;
  solved: number;
}

export interface SkillGroup {
  level: LTSkillLevel;
  label: string;
  skills: Skill[];
}

export interface CalendarDay {
  /** yyyy-MM-dd (UTC, like LeetCode's own calendar). */
  date: string;
  count: number;
  /** 0 (none) to 4 (most). */
  level: number;
}

export interface SubmissionYear {
  /** Days with submissions, padded so the first and last entries span the whole year. Empty when there were none. */
  days: CalendarDay[];
  total: number;
  activeDays: number;
}

export interface ProfileView {
  stats: DifficultyStat[];
  recent: SolvedProblem[];
  skills: SkillGroup[];
  /** null when the calendar was missing or unreadable. */
  year: SubmissionYear | null;
}

export const RECENT_LIMIT = 6;

const DIFFICULTIES: readonly LTDifficulty[] = ["All", "Easy", "Medium", "Hard"];

const SKILL_LEVELS: readonly { level: LTSkillLevel; label: string }[] = [
  { level: "fundamental", label: "Fundamental" },
  { level: "intermediate", label: "Intermediate" },
  { level: "advanced", label: "Advanced" },
];

// LeetCode's language slugs, as people write the languages.
const LANGUAGES: Record<string, string> = {
  c: "C",
  cpp: "C++",
  csharp: "C#",
  dart: "Dart",
  golang: "Go",
  java: "Java",
  javascript: "JavaScript",
  kotlin: "Kotlin",
  mysql: "MySQL",
  python: "Python",
  python3: "Python",
  ruby: "Ruby",
  rust: "Rust",
  scala: "Scala",
  swift: "Swift",
  typescript: "TypeScript",
};

const DAY_MS = 86_400_000;

// A fixed locale and time zone: the same text for every visitor and on any
// renderer, so these strings can never cause a hydration mismatch.
const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthDayYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const wholeNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatCount(value: number) {
  return wholeNumber.format(value);
}

/** "98.7%"; whole numbers lose the ".0". */
export function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

/** "Nov 7, 2026" from a yyyy-MM-dd date. */
export function formatDay(isoDate: string) {
  const time = Date.parse(`${isoDate}T00:00:00Z`);
  return Number.isFinite(time) ? monthDayYear.format(time) : isoDate;
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function records<T extends object>(value: readonly (T | null)[] | null | undefined): T[] {
  return Array.isArray(value) ? value.filter((entry): entry is T => typeof entry === "object" && entry !== null) : [];
}

type Data = NonNullable<LTProfileResponse["data"]>;
type User = NonNullable<Data["matchedUser"]>;

function toStats(data: Data, user: User): DifficultyStat[] {
  const solved = records(user.submitStatsGlobal?.acSubmissionNum);
  const totals = records(data.allQuestionsCount);
  const beats = records(user.problemsSolvedBeatsStats);

  return DIFFICULTIES.flatMap((difficulty) => {
    const count = finite(solved.find((entry) => entry.difficulty === difficulty)?.count);
    if (count === null || count < 0) return [];
    const total = finite(totals.find((entry) => entry.difficulty === difficulty)?.count);
    const percentile = finite(beats.find((entry) => entry.difficulty === difficulty)?.percentage);
    return [
      {
        difficulty,
        solved: count,
        total: total !== null && total > 0 ? total : null,
        beats: percentile !== null && percentile >= 0 && percentile <= 100 ? percentile : null,
      },
    ];
  });
}

/** Accepted submissions, newest first, one row per problem. */
function toRecent(data: Data, now: number): SolvedProblem[] {
  const seen = new Set<string>();
  const recent: SolvedProblem[] = [];
  const thisYear = new Date(now).getUTCFullYear();

  for (const submission of records(data.recentSubmissionList)) {
    const { title, titleSlug } = submission;
    if (submission.statusDisplay !== "Accepted") continue;
    if (typeof titleSlug !== "string" || titleSlug === "" || seen.has(titleSlug)) continue;
    if (typeof title !== "string" || title.trim() === "") continue;
    seen.add(titleSlug);

    const time = Number(submission.timestamp) * 1000;
    const dated = submission.timestamp != null && Number.isFinite(time) && time > 0;
    const date = dated ? new Date(time) : null;
    const lang = typeof submission.lang === "string" ? submission.lang : "";

    recent.push({
      slug: titleSlug,
      title: title.trim(),
      language: LANGUAGES[lang] ?? lang,
      dateTime: date ? date.toISOString() : null,
      // The year only appears once it stops being obvious.
      dateLabel: date ? (date.getUTCFullYear() === thisYear ? monthDay : monthDayYear).format(date) : null,
    });
    if (recent.length === RECENT_LIMIT) break;
  }
  return recent;
}

function toSkills(user: User): SkillGroup[] {
  const counts = user.tagProblemCounts;
  if (!counts || typeof counts !== "object") return [];

  return SKILL_LEVELS.flatMap(({ level, label }) => {
    const skills = records(counts[level])
      .flatMap((tag): Skill[] => {
        const solved = finite(tag.problemsSolved);
        if (typeof tag.tagName !== "string" || tag.tagName === "" || solved === null || solved <= 0) return [];
        return [{ slug: tag.tagSlug || tag.tagName, name: tag.tagName, solved }];
      })
      .sort((a, b) => b.solved - a.solved || a.name.localeCompare(b.name, "en"));
    return skills.length > 0 ? [{ level, label, skills }] : [];
  });
}

/**
 * The past year of submissions. Levels come from the quartiles of the active
 * days, not from fixed counts: most days hold one or two submissions, and a
 * fixed scale would paint nearly all of them in the faintest colour.
 */
export function toSubmissionYear(calendar: unknown, now: number = Date.now()): SubmissionYear | null {
  if (typeof calendar !== "string") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(calendar);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

  const today = Math.floor(now / DAY_MS) * DAY_MS;
  const start = today - 365 * DAY_MS;
  const perDay = new Map<number, number>();
  for (const [seconds, value] of Object.entries(parsed)) {
    const count = finite(value);
    const day = Math.floor((Number(seconds) * 1000) / DAY_MS) * DAY_MS;
    if (count === null || count <= 0 || !Number.isFinite(day) || day < start) continue;
    perDay.set(day, (perDay.get(day) ?? 0) + count);
  }
  if (perDay.size === 0) return { days: [], total: 0, activeDays: 0 };

  const active = [...perDay].sort(([a], [b]) => a - b);
  const sorted = active.map(([, count]) => count).sort((a, b) => a - b);
  const quartile = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  const thresholds = [quartile(0.25), quartile(0.5), quartile(0.75)];

  const isoDate = (day: number) => new Date(day).toISOString().slice(0, 10);
  const days: CalendarDay[] = active.map(([day, count]) => ({
    date: isoDate(day),
    count,
    level: 1 + thresholds.filter((threshold) => count > threshold).length,
  }));

  // Empty first and last entries make the calendar span the whole year instead
  // of starting and ending at the nearest submission.
  const first = active[0][0];
  const last = active[active.length - 1][0];
  if (first > start) days.unshift({ date: isoDate(start), count: 0, level: 0 });
  if (last < today) days.push({ date: isoDate(today), count: 0, level: 0 });

  return {
    days,
    total: sorted.reduce((sum, count) => sum + count, 0),
    activeDays: active.length,
  };
}

/** The render-ready profile, or null when the reply has no usable solved counts. */
export function toProfileView(response: unknown, now: number = Date.now()): ProfileView | null {
  const data = (response as LTProfileResponse | null | undefined)?.data;
  const user = data?.matchedUser;
  if (!data || typeof data !== "object" || !user || typeof user !== "object") return null;

  const stats = toStats(data, user);
  // The headline number is the point of the section: without it there is nothing to show.
  if (!stats.some((stat) => stat.difficulty === "All")) return null;

  return {
    stats,
    recent: toRecent(data, now),
    skills: toSkills(user),
    year: toSubmissionYear(user.submissionCalendar, now),
  };
}

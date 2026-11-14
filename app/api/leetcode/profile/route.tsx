// GET /api/leetcode/profile: the LeetCode numbers shown on the home page.
//
// LeetCode has no public API; this proxies its GraphQL endpoint and keeps the
// reply in memory so visitors do not each cost an upstream request:
//   fresh cache (15 min)            200, X-Cache: HIT
//   refetched                       200, X-Cache: MISS
//   upstream failed, old copy kept  200, X-Cache: STALE
//   upstream failed, nothing kept   503 { error }
//   LEETCODE_USERNAME not set       500 { error }
// After a failure the upstream is left alone for a minute.

const ENDPOINT = "https://leetcode.com/graphql";
const CACHE_TTL_MS = 1000 * 60 * 15;
const FAILURE_TTL_MS = 1000 * 60;
const UPSTREAM_TIMEOUT_MS = 5000;

// Only the fields components/portfolio/lt/profile.ts reads (lib/types/stats/lt.tsx).
const QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submissionCalendar
      tagProblemCounts {
        advanced {
          tagName
          tagSlug
          problemsSolved
        }
        intermediate {
          tagName
          tagSlug
          problemsSolved
        }
        fundamental {
          tagName
          tagSlug
          problemsSolved
        }
      }
      problemsSolvedBeatsStats {
        difficulty
        percentage
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    recentSubmissionList(username: $username) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }`;

/** A failure with the status and message the client should get. */
class ProfileError extends Error {
  constructor(
    message: string,
    readonly status: 500 | 503,
    readonly publicMessage: string,
  ) {
    super(message);
  }
}

let cachedProfile: { expiresAt: number; payload: string } | undefined;

// Concurrent cache misses share one upstream request.
let inflightProfile: Promise<string> | undefined;

// Set when the upstream fails: no new upstream request before this time.
let lastFailure: { retryAt: number; error: ProfileError } | undefined;

function profileResponse(payload: string, cacheStatus: "HIT" | "MISS" | "STALE") {
  return new Response(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Cache": cacheStatus,
      // A stale copy is better than nothing, but a CDN should ask again soon.
      "Cache-Control":
        cacheStatus === "STALE"
          ? "public, s-maxage=60"
          : "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}

function errorResponse(error: ProfileError) {
  return Response.json(
    { error: error.publicMessage },
    {
      status: error.status,
      headers: {
        "Cache-Control": "no-store",
        ...(error.status === 503 ? { "Retry-After": String(FAILURE_TTL_MS / 1000) } : {}),
      },
    },
  );
}

function unavailable(reason: string) {
  return new ProfileError(reason, 503, "LeetCode profile is currently unavailable.");
}

async function fetchProfile(): Promise<string> {
  const username = process.env.LEETCODE_USERNAME;
  if (!username) {
    throw new ProfileError("LEETCODE_USERNAME is not set", 500, "LeetCode profile is not configured.");
  }

  let upstream: Response;
  try {
    upstream = await fetch(ENDPOINT, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
    });
  } catch (cause) {
    throw unavailable(`request failed: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
  if (!upstream.ok) {
    throw unavailable(`upstream answered ${upstream.status}`);
  }

  let parsed: { data?: { matchedUser?: unknown } | null; errors?: unknown };
  try {
    parsed = await upstream.json();
  } catch {
    throw unavailable("upstream reply was not JSON");
  }
  // GraphQL can report errors for one field and still answer the rest, so the
  // reply is judged by whether the profile is there. A wrong username answers
  // 200 with matchedUser: null; caching that would hide the mistake.
  if (!parsed?.data || typeof parsed.data.matchedUser !== "object" || parsed.data.matchedUser === null) {
    const reported =
      Array.isArray(parsed?.errors) && parsed.errors.length > 0
        ? `; upstream reported: ${JSON.stringify(parsed.errors).slice(0, 300)}`
        : "";
    throw unavailable(`upstream reply has no matchedUser (check LEETCODE_USERNAME)${reported}`);
  }

  const payload = JSON.stringify({ data: parsed.data });
  cachedProfile = { expiresAt: Date.now() + CACHE_TTL_MS, payload };
  return payload;
}

/** The refreshed profile; every caller waiting on the same refresh shares its result and its log line. */
function refreshProfile(): Promise<string> {
  inflightProfile ??= fetchProfile()
    .then((payload) => {
      lastFailure = undefined;
      return payload;
    })
    .catch((cause: unknown) => {
      const error = cause instanceof ProfileError ? cause : unavailable(String(cause));
      lastFailure = { retryAt: Date.now() + FAILURE_TTL_MS, error };
      console.error(
        `[api/leetcode/profile] ${error.message}; ${cachedProfile ? "serving the cached copy" : `answering ${error.status}`}`,
      );
      throw error;
    })
    .finally(() => {
      inflightProfile = undefined;
    });
  return inflightProfile;
}

export async function GET() {
  if (cachedProfile && cachedProfile.expiresAt > Date.now()) {
    return profileResponse(cachedProfile.payload, "HIT");
  }

  let failure: ProfileError;
  if (lastFailure && lastFailure.retryAt > Date.now()) {
    failure = lastFailure.error;
  } else {
    try {
      return profileResponse(await refreshProfile(), "MISS");
    } catch (error) {
      failure = error as ProfileError;
    }
  }

  return cachedProfile ? profileResponse(cachedProfile.payload, "STALE") : errorResponse(failure);
}

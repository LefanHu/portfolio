const CACHE_TTL_MS = 1000 * 60 * 15;
const UPSTREAM_TIMEOUT_MS = 5000;

let cachedProfile:
  | {
      expiresAt: number;
      payload: string;
    }
  | undefined;

function jsonResponse(payload: string, cacheStatus: "HIT" | "MISS" | "STALE") {
  return new Response(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Cache": cacheStatus,
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}

// Concurrent cache misses share one upstream request.
let inflightProfile: Promise<string> | undefined;

async function fetchProfile(): Promise<string> {
  const endpoint = "https://leetcode.com/graphql";
  const currYear = new Date().getFullYear();
  const query = `
    query getUserProfile($username: String!, $year: Int!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {  
        contributions {
          points
        }
        profile {
          reputation
          ranking
        }
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
        userCalendar(year: $year) {
          activeYears
          streak
          totalActiveDays
          dccBadges {
            timestamp
            badge {
              name
              icon
            }
          }
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
      recentSubmissionList(username: $username) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
        __typename
      }
    }`;

  if (!process.env.LEETCODE_USERNAME) {
    throw new Error("LEETCODE_USERNAME is not configured");
  }

  const content = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query: query,
      variables: {
        username: process.env.LEETCODE_USERNAME,
        year: currYear,
      },
    }),
  });

  if (!content.ok) {
    throw new Error(`leetcode upstream returned ${content.status}`);
  }

  const parsed = (await content.json()) as {
    data?: unknown;
    errors?: unknown;
  };

  if (!parsed.data || parsed.errors) {
    throw new Error("leetcode response was missing data");
  }

  const payload = JSON.stringify(parsed);

  cachedProfile = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    payload,
  };

  return payload;
}

export async function GET() {
  if (cachedProfile && cachedProfile.expiresAt > Date.now()) {
    return jsonResponse(cachedProfile.payload, "HIT");
  }

  try {
    inflightProfile ??= fetchProfile().finally(() => {
      inflightProfile = undefined;
    });
    return jsonResponse(await inflightProfile, "MISS");
  } catch {
    if (cachedProfile) {
      return jsonResponse(cachedProfile.payload, "STALE");
    }

    return Response.json(
      {
        error: "LeetCode profile is currently unavailable.",
      },
      {
        status: 503,
      }
    );
  }
}

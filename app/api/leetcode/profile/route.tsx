const CACHE_TTL_MS = 1000 * 60 * 15;

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
    },
  });
}

export async function GET(req: Request) {
  if (cachedProfile && cachedProfile.expiresAt > Date.now()) {
    return jsonResponse(cachedProfile.payload, "HIT");
  }

  try {
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

    return jsonResponse(payload, "MISS");
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
  } finally {
    void req;
  }
}

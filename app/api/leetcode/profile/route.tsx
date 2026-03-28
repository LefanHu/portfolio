const CACHE_TTL_MS = 1000 * 60 * 15;

let cachedProfile:
  | {
      expiresAt: number;
      payload: string;
    }
  | undefined;

export async function GET(req: Request) {
  if (cachedProfile && cachedProfile.expiresAt > Date.now()) {
    return new Response(cachedProfile.payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
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

    const payload = JSON.stringify(await content.json());

    cachedProfile = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    };

    return new Response(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    if (cachedProfile) {
      return new Response(cachedProfile.payload, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "STALE",
        },
      });
    }

    return new Response(`something went wrong ${error}`, {
      status: 400,
    });
  }
}

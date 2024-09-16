export async function GET(req: Request) {
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

    return new Response(JSON.stringify(await content.json()), {
      status: 200,
    });
  } catch (error) {
    // console.log(error);
    return new Response(`something went wrong ${error}`, {
      status: 400,
    });
  }
}

export async function GET(req: Request) {
  try {
    const endpoint = "https://leetcode.com/graphql";
    const query = `
      query getUserProfile($username: String!) {
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
        matchedUserStats: matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
              __typename
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
              __typename
            }
            __typename
          }
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
        variables: { username: process.env.LEETCODE_USERNAME },
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

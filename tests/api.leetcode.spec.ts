const profile = (marker: string) => ({ data: { matchedUser: { submissionCalendar: marker }, recentSubmissionList: [] } });

const upstreamReply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function loadRoute() {
  const { GET } = await import("@/app/api/leetcode/profile/route");
  return GET;
}

describe("leetcode profile route", () => {
  let errorLog: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00Z"));
    process.env.LEETCODE_USERNAME = "leaf";
    errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns MISS then HIT while cache is warm", async () => {
    const fetchMock = vi.fn().mockResolvedValue(upstreamReply(profile("fresh")));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    const miss = await GET();
    const hit = await GET();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(miss.status).toBe(200);
    expect(miss.headers.get("X-Cache")).toBe("MISS");
    expect(hit.headers.get("X-Cache")).toBe("HIT");
    await expect(miss.json()).resolves.toEqual(profile("fresh"));
    await expect(hit.json()).resolves.toEqual(profile("fresh"));
    expect(errorLog).not.toHaveBeenCalled();
  });

  it("asks LeetCode for the configured user and only the fields the page reads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(upstreamReply(profile("fresh")));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();
    await GET();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://leetcode.com/graphql");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body) as { query: string; variables: Record<string, unknown> };
    expect(body.variables).toEqual({ username: "leaf" });
    for (const field of [
      "allQuestionsCount",
      "submissionCalendar",
      "tagProblemCounts",
      "problemsSolvedBeatsStats",
      "submitStatsGlobal",
      "recentSubmissionList",
    ]) {
      expect(body.query).toContain(field);
    }
    for (const unused of ["contributions", "reputation", "userCalendar", "dccBadges", "totalSubmissionNum"]) {
      expect(body.query).not.toContain(unused);
    }
  });

  it("forwards only the data of the upstream reply", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(upstreamReply({ ...profile("fresh"), extensions: { cost: 1 } })),
    );
    const GET = await loadRoute();

    await expect((await GET()).json()).resolves.toEqual(profile("fresh"));
  });

  it("returns stale cached data when refresh fails after ttl expiry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(upstreamReply(profile("fresh")))
      .mockRejectedValueOnce(new Error("upstream down"));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    await GET();
    vi.setSystemTime(new Date("2026-03-28T12:16:00Z"));
    const stale = await GET();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(stale.status).toBe(200);
    expect(stale.headers.get("X-Cache")).toBe("STALE");
    // A stale copy must not sit in a CDN for another quarter of an hour.
    expect(stale.headers.get("Cache-Control")).toBe("public, s-maxage=60");
    await expect(stale.json()).resolves.toEqual(profile("fresh"));
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog.mock.calls[0][0]).toContain("upstream down");
  });

  it.each([
    ["an error status", () => upstreamReply({ errors: [{ message: "bad upstream" }] }, 502), "502"],
    ["GraphQL errors", () => upstreamReply({ data: { matchedUser: null }, errors: [{ message: "no such user" }] }), "no such user"],
    ["a missing user", () => upstreamReply({ data: { matchedUser: null } }), "matchedUser"],
    ["a body that is not JSON", () => new Response("<html>blocked</html>", { status: 200 }), "not JSON"],
  ])("answers 503 with a JSON error and logs why on %s", async (_name, reply, logged) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply()));
    const GET = await loadRoute();

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Retry-After")).toBe("60");
    await expect(response.json()).resolves.toEqual({ error: "LeetCode profile is currently unavailable." });
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog.mock.calls[0][0]).toContain(logged);
  });

  it("answers 503 when the upstream request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket hang up")));
    const GET = await loadRoute();

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "LeetCode profile is currently unavailable." });
    expect(errorLog.mock.calls[0][0]).toContain("socket hang up");
  });

  it("answers 500 without calling LeetCode when the username is not configured", async () => {
    delete process.env.LEETCODE_USERNAME;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "LeetCode profile is not configured." });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorLog.mock.calls[0][0]).toContain("LEETCODE_USERNAME");
  });

  it("leaves a failing upstream alone for a minute, then tries again", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("upstream down"))
      .mockResolvedValueOnce(upstreamReply(profile("recovered")));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    expect((await GET()).status).toBe(503);
    vi.setSystemTime(new Date("2026-03-28T12:00:30Z"));
    expect((await GET()).status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errorLog).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-03-28T12:01:01Z"));
    const recovered = await GET();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(recovered.status).toBe(200);
    expect(recovered.headers.get("X-Cache")).toBe("MISS");
    await expect(recovered.json()).resolves.toEqual(profile("recovered"));
  });

  it("lets the CDN cache successful responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(upstreamReply(profile("fresh"))));
    const GET = await loadRoute();
    const res = await GET();

    expect(res.headers.get("Cache-Control")).toBe("public, s-maxage=900, stale-while-revalidate=3600");
  });

  it("shares one upstream request between concurrent cache misses", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => upstreamReply(profile("fresh")));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    const [a, b] = await Promise.all([GET(), GET()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });

  it("shares one failure, and one log line, between concurrent cache misses", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("upstream down"));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();

    const [a, b] = await Promise.all([GET(), GET()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a.status).toBe(503);
    expect(b.status).toBe(503);
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it("times out the upstream request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(upstreamReply(profile("fresh")));
    vi.stubGlobal("fetch", fetchMock);
    const GET = await loadRoute();
    await GET();

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
});

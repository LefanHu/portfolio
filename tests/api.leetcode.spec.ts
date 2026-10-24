describe("leetcode profile route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns MISS then HIT while cache is warm", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    vi.stubGlobal("fetch", fetchMock);
    process.env.LEETCODE_USERNAME = "leaf";

    const { GET } = await import("@/app/api/leetcode/profile/route");

    const miss = await GET();
    const hit = await GET();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(miss.headers.get("X-Cache")).toBe("MISS");
    expect(hit.headers.get("X-Cache")).toBe("HIT");
    await expect(miss.json()).resolves.toEqual({ data: { ok: true } });
    await expect(hit.json()).resolves.toEqual({ data: { ok: true } });
  });

  it("returns stale cached data when refresh fails after ttl expiry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ok: "fresh" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockRejectedValueOnce(new Error("upstream down"));

    vi.stubGlobal("fetch", fetchMock);
    process.env.LEETCODE_USERNAME = "leaf";

    const { GET } = await import("@/app/api/leetcode/profile/route");

    await GET();

    vi.setSystemTime(new Date("2026-03-28T12:16:00Z"));

    const stale = await GET();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(stale.headers.get("X-Cache")).toBe("STALE");
    await expect(stale.json()).resolves.toEqual({ data: { ok: "fresh" } });
  });

  it("returns a 503 error when upstream fails before cache is populated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: "bad upstream" }] }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    process.env.LEETCODE_USERNAME = "leaf";

    const { GET } = await import("@/app/api/leetcode/profile/route");

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "LeetCode profile is currently unavailable.",
    });
  });

  it("lets the CDN cache successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
      )
    );
    process.env.LEETCODE_USERNAME = "leaf";

    const { GET } = await import("@/app/api/leetcode/profile/route");
    const res = await GET();

    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=900, stale-while-revalidate=3600"
    );
  });

  it("shares one upstream request between concurrent cache misses", async () => {
    const fetchMock = vi.fn().mockImplementation(
      async () => new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    process.env.LEETCODE_USERNAME = "leaf";

    const { GET } = await import("@/app/api/leetcode/profile/route");
    const [a, b] = await Promise.all([GET(), GET()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });

  it("times out the upstream request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    process.env.LEETCODE_USERNAME = "leaf";

    const { GET } = await import("@/app/api/leetcode/profile/route");
    await GET();

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
});

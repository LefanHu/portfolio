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

    const miss = await GET(new Request("http://localhost/api/leetcode/profile"));
    const hit = await GET(new Request("http://localhost/api/leetcode/profile"));

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

    await GET(new Request("http://localhost/api/leetcode/profile"));

    vi.setSystemTime(new Date("2026-03-28T12:16:00Z"));

    const stale = await GET(new Request("http://localhost/api/leetcode/profile"));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(stale.headers.get("X-Cache")).toBe("STALE");
    await expect(stale.json()).resolves.toEqual({ data: { ok: "fresh" } });
  });
});

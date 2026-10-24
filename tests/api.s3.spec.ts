const sendMock = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = sendMock;
  },
  ListObjectsV2Command: class {
    constructor(public input: unknown) {}
  },
}));

function request(bucket: string) {
  return [
    new Request(`http://localhost/api/s3/buckets/${bucket}/files`),
    { params: Promise.resolve({ bucket }) },
  ] as const;
}

describe("s3 bucket files route", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.AWS_SNEAK_ATTACS_BUCKET = "allowed-bucket";
    process.env.AWS_BUCKET_NAME = "other-allowed-bucket";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refuses buckets that are not configured", async () => {
    const { GET } = await import("@/app/api/s3/buckets/[bucket]/files/route");
    const res = await GET(...request("someone-elses-bucket"));

    expect(res.status).toBe(403);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("lists objects for a configured bucket", async () => {
    sendMock.mockResolvedValue({ Contents: [{ Key: "a.png" }] });

    const { GET } = await import("@/app/api/s3/buckets/[bucket]/files/route");
    const res = await GET(...request("allowed-bucket"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ Key: "a.png" }]);
  });

  it("hides upstream error details", async () => {
    sendMock.mockRejectedValue(new Error("AccessDenied: arn:aws:iam::123"));

    const { GET } = await import("@/app/api/s3/buckets/[bucket]/files/route");
    const res = await GET(...request("other-allowed-bucket"));

    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("AccessDenied");
  });
});

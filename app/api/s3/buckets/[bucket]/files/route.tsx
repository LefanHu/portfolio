import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({});

// Only buckets this site is configured for may be listed.
function isAllowedBucket(bucket: string) {
  return [process.env.AWS_SNEAK_ATTACS_BUCKET, process.env.AWS_BUCKET_NAME]
    .filter(Boolean)
    .includes(bucket);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bucket: string }> }
) {
  const { bucket } = await params;

  if (!isAllowedBucket(bucket)) {
    return new Response("bucket not allowed", { status: 403 });
  }

  console.log(
    `sneak attacs requested!!! ${new Date().toString()} from ip ${req.headers.get(
      "cf-connecting-ip"
    )}`
  );
  const command = new ListObjectsV2Command({
    Bucket: bucket,
  });

  try {
    // default truncation is 1000 keys, which we are not reaching
    const { Contents } = await client.send(command);
    return new Response(JSON.stringify(Contents), {
      status: 200,
    });
  } catch (error) {
    console.error(`failed to list bucket ${bucket}: ${error}`);
    return new Response("something went wrong", {
      status: 500,
    });
  }
}

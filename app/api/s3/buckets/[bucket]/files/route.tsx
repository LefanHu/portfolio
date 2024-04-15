import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({});

export async function GET(req: Request, { params }: { params: { bucket: string } }) {
  console.log(`sneak attacs requested!!! ${new Date().toString()}`);
  const command = new ListObjectsV2Command({
    Bucket: params.bucket,
  });

  try {
    // default truncation is 1000 keys, which we are not reaching
    const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
    return new Response(JSON.stringify(Contents), {
      status: 200,
    });
  } catch (error) {
    return new Response(`something went wrong ${error}`, {
      status: 400,
    });
  }
}

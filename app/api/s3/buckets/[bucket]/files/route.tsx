import AWS from "aws-sdk";
// import * as AWS from "@aws-sdk/client-s3";
// const client = new AWS.S3({ region: "REGION" });

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export async function GET(req: Request, { params }: { params: { bucket: string } }) {
  try {
    const options = {
      Bucket: params.bucket,
    };

    // Fetch the list of files from the specified bucket
    const data = await s3.listObjectsV2(options).promise();
    return new Response(JSON.stringify(data.Contents), {
      status: 200,
    });
  } catch (error) {
    return new Response(`something went wrong ${error}`, {
      status: 400,
    });
  }
}

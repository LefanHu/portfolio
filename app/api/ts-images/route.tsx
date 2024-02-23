import dbConnect from "@/app/lib/dbConnect";
import TaylorImage from "@/models/TaylorImage";

interface TaylorImageDocument {
  _id: string;
  prompt: string;
  date_created: string;
  image_url: string;
  tags?: string;
}

export async function POST(req: Request) {
  const newDocument: TaylorImageDocument = await req.json();
  newDocument.image_url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${newDocument._id}.jpeg`;
  await dbConnect();
  try {
    const taylorImage = await TaylorImage.create(
      newDocument
    ); /* create a new model in the database */
    return new Response("Image created in db!", {
      status: 200,
    });
  } catch (error) {
    return new Response(`Database operation failed with error: ${error}!`, {
      status: 400,
    });
  }
}

export async function GET() {
  await dbConnect();
  try {
    const taylorImages = await TaylorImage.find({});
    return new Response(JSON.stringify(taylorImages), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(`DB query failed with error: ${error}!`, {
      status: 400,
    });
  }
}

import dbConnect from "@/app/lib/dbConnect";
import TaylorImage from "@/models/TaylorImage";

export async function POST(req: Request) {
  const res = await req.json()
  await dbConnect();
  try {
    const taylorImage = await TaylorImage.create(
      res
    ); /* create a new model in the database */
    return new Response("Image created in db!", {
      status: 200
    })
  } catch (error) {
    return new Response(`Database operation failed with error: ${error}!`, {
      status: 400
    })
  }
}

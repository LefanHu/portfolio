import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/app/lib/dbConnect";
import TaylorImage from "@/models/TaylorImage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const taylorImages = await TaylorImage.find({}); /* find all the data in our database */
        res.status(200).json({ success: true, data: taylorImages });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      try {
        const taylorImage = await TaylorImage.create(
          req.body,
        ); /* create a new model in the database */
        res.status(201).json({ success: true, data: taylorImage });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
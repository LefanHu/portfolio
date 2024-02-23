import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/app/lib/dbConnect";
import TaylorImage from "@/models/TaylorImage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case "GET" /* Get an image by its ID */:
      try {
        const taylorImage = await TaylorImage.findById(id);
        if (!taylorImage) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: taylorImage });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "PUT" /* Edit an image by its ID */:
      try {
        const taylorImage = await TaylorImage.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!taylorImage) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: taylorImage });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "DELETE" /* Delete an image by its ID */:
      try {
        const deletedTaylorImage = await TaylorImage.deleteOne({ _id: id });
        if (!deletedTaylorImage) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}

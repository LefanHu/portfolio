import mongoose from "mongoose";

export interface TaylorImages extends mongoose.Document {
  _id: string;
  prompt: string;
  date_created: string;
  tags: string[];
  image_url: string;
}

const TaylorImageSchema = new mongoose.Schema<TaylorImages>({
  _id: {
    /* typically just the datetime string */

    type: String,
    required: [true, "Please provide the datetime string as id"],
    maxlength: [1000, "datetime string cannot be more than 1000 characters"],
  },
  prompt: {
    /* The name of this pet */

    type: String,
    required: [true, "Please provide the prompt used to generate this image."],
    maxlength: [1000, "Prompt cannot be more than 1000 characters"],
  },
  date_created: {
    /* The owner of this pet */

    type: String,
    required: [
      true,
      "Please provide datetime string of creation of this image",
    ],
    maxlength: [60, "datetime string cannot be more than 60 characters"],
  },
  tags: {
    /* List of dietary needs, if applicable */

    type: [String],
    required: false,
  },
  image_url: {
    /* Url to taylor image in s3 */

    required: [true, "Please provide an image url for this image."],
    type: String,
  },
});

export default mongoose.models.TaylorImage ||
  mongoose.model<TaylorImages>("TaylorImage", TaylorImageSchema);

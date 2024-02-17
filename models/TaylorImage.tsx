import mongoose from "mongoose";

export interface TaylorImages extends mongoose.Document {
  prompt: string;
  date_created: string;
  tags: string[];
  image_url: string;
}

const TaylorImageSchema = new mongoose.Schema<TaylorImages>({
    prompt: {
    /* The name of this pet */

    type: String,
    required: [true, "Please provide the prompt used to generate this image."],
    maxlength: [1000, "Prompt cannot be more than 1000 characters"],
  },
  date_created: {
    /* The owner of this pet */

    type: String,
    required: [true, "Please provide datetime string of creation of this image"],
    maxlength: [60, "datetime string cannot be more than 60 characters"],
  },
  tags: {
    /* List of dietary needs, if applicable */

    type: [String],
  },
  image_url: {
    /* Url to taylor image in s3 */

    required: [true, "Please provide an image url for this iamge."],
    type: String,
  },
});

export default mongoose.models.Pet || mongoose.model<TaylorImages>("TaylorImage", TaylorImageSchema);
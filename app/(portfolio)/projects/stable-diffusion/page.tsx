import MediaGallery, { type GalleryImage } from "@/components/projects/MediaGallery";
import ProjectPage, { Points, ProjectSection, Prose } from "@/components/projects/ProjectPage";
import { projectMetadata } from "@/components/projects/metadata";

const SLUG = "stable-diffusion";

export const metadata = projectMetadata(SLUG);

const SAMPLE = { width: 1024, height: 1024, caption: "AI-generated sample" };

// Every picture is model output, and both the alt text and the caption say so.
const samples: GalleryImage[] = [
  { src: "/images/swift-beach.jpg", alt: "AI-generated image of Taylor Swift on a beach at sunset" },
  { src: "/images/swift-castle.jpg", alt: "AI-generated image of Taylor Swift in front of a castle" },
  { src: "/images/taylor-sand.jpg", alt: "AI-generated image of Taylor Swift lying in wet sand" },
  { src: "/images/swift-wine.jpg", alt: "AI-generated image of Taylor Swift holding a glass of red wine" },
  { src: "/images/bucket-swift.jpg", alt: "AI-generated illustration of Taylor Swift sitting in a metal bucket of water" },
  { src: "/images/taylor-model.jpg", alt: "AI-generated portrait of Taylor Swift with her hands clasped under her chin" },
  { src: "/images/taylor-artsy.jpg", alt: "AI-generated portrait of Taylor Swift with short curly hair" },
  { src: "/images/swift-majestic.jpeg", alt: "AI-generated image of Taylor Swift with wings, in front of a glowing moon" },
].map((sample) => ({ ...sample, ...SAMPLE }));

export default function SdxlLoraProjectPage() {
  return (
    <ProjectPage
      slug={SLUG}
      summary="A React web app that generated celebrity images from text prompts, powered by a custom LoRA adapter for Stable Diffusion XL. The interactive generator has been retired; this page is an archive with sample outputs."
    >
      <ProjectSection title="Overview">
        <Points
          items={[
            "Collected a dataset of Taylor Swift images with Scrapy.",
            "Fine-tuned a custom LoRA adapter for SDXL on an AWS G4DN GPU instance using Hugging Face Accelerate.",
            "Deployed through Hugging Face Serverless Inference to optimize cost and eliminate idle resource usage.",
            "Built a Next.js frontend that generated a photo of Taylor Swift from the prompt entered.",
            "Hosted images in an S3 bucket.",
            "Originally inspired by someone who loves all things Taylor Swift.",
          ]}
        />
      </ProjectSection>
      <ProjectSection title="Sample outputs">
        <Prose className="mb-5">
          <p>These pictures were produced by the fine-tuned model. They are AI-generated, not photographs.</p>
        </Prose>
        <MediaGallery images={samples} label="Sample outputs" />
      </ProjectSection>
    </ProjectPage>
  );
}

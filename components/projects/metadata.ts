import type { Metadata } from "next";
import { projectPage } from "@/lib/portfolioProjects";

/**
 * Metadata for `/projects/<slug>`, built from the project data so the tab
 * title, the description and the link preview agree with the page.
 * The root layout adds the site name to the title.
 */
export function projectMetadata(
  slug: string,
  overrides: {
    /** When the card description is not the best summary of the page. */
    description?: string;
    /** A picture that shows the project better than its card image (for example a logo). */
    image?: string;
  } = {},
): Metadata {
  const project = projectPage(slug);
  const description = overrides.description ?? project.description;
  // A page's openGraph replaces the root layout's, so a project without a
  // picture of its own falls back to the site's share image.
  const image = overrides.image ?? project.imgSrc ?? "/images/altar/island-night.webp";

  return {
    title: project.name,
    description,
    alternates: { canonical: project.href },
    // A page's openGraph replaces the root layout's, so the site name is repeated here.
    openGraph: {
      type: "article",
      siteName: "Lefan Hu",
      title: project.name,
      description,
      url: project.href,
      images: [{ url: image }],
    },
  };
}

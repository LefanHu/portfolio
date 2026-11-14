import MediaGallery, { type GalleryImage } from "@/components/projects/MediaGallery";
import ProjectPage, { Notes, Points, ProjectSection } from "@/components/projects/ProjectPage";
import { projectMetadata } from "@/components/projects/metadata";
import { CubeIcon } from "@/components/ui/icons";

const SLUG = "threejs";

export const metadata = projectMetadata(SLUG);

const SCREENSHOT = { width: 1920, height: 1080 };

const screenshots: GalleryImage[] = [
  {
    src: "/images/threejsPortfolio/0.png",
    alt: "A 3D living room: sofas around a low table with a small drone model on it, and a guitar leaning against a screen",
    caption: "The scene",
  },
  {
    src: "/images/threejsPortfolio/1.png",
    alt: "The scene from another angle: a screen showing a submission calendar above a row of navigation buttons, beside a guitar",
    caption: "Navigation and the in-scene screen",
  },
  {
    src: "/images/threejsPortfolio/2.png",
    alt: "Close-up of the in-scene screen showing the site's Experiences page, with a small astronaut figure beside it",
    caption: "A page of the site on the in-scene screen",
  },
].map((screenshot) => ({ ...screenshot, ...SCREENSHOT }));

export default function ThreeJSProjectPage() {
  return (
    <ProjectPage
      slug={SLUG}
      summary="An experiment in building a portfolio as a 3D scene with Three.js."
      actions={[{ href: "/home", label: "Open the original 3D room", icon: <CubeIcon /> }]}
    >
      <ProjectSection title="Overview">
        <Points
          items={["Camera rotation is tracked with quaternion calculations.", "Hosted on Oracle Cloud."]}
        />
      </ProjectSection>
      <ProjectSection title="Trade-offs">
        <Notes
          notes={[
            {
              title: "Performance",
              body: "The scene ran at 60 fps on most computers, but its performance optimizations were not enough for phones and older laptops, where the experience was suboptimal.",
            },
            {
              title: "Blurry embedded pages",
              body: "A web page shown through an iframe inside the HTML component is limited in resolution, so it looks zoomed in and blurry. CSS scaling mitigates this, but does not fully make up for it.",
            },
          ]}
        />
      </ProjectSection>
      <ProjectSection title="Screenshots">
        <MediaGallery images={screenshots} label="Screenshots" columns={3} />
      </ProjectSection>
    </ProjectPage>
  );
}

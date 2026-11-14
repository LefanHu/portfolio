import MediaGallery, { type GalleryImage } from "@/components/projects/MediaGallery";
import ProjectPage, { Points, ProjectSection } from "@/components/projects/ProjectPage";
import { projectMetadata } from "@/components/projects/metadata";

const SLUG = "drone";

export const metadata = projectMetadata(SLUG);

// The photos are 1205×1600 re-encodes with no metadata (the originals carried GPS positions).
const PHOTO = { width: 1205, height: 1600 };

const photos: GalleryImage[] = [
  {
    src: "/images/fpvdrone/1.jpg",
    alt: "Bare carbon-fibre drone frame on a desk, with four motors mounted and the flight-controller stack in the centre",
    caption: "Frame, motors and flight-controller stack",
  },
  {
    src: "/images/fpvdrone/2.jpg",
    alt: "The frame seen from above, with the flight-controller stack wired up and the battery lead attached",
    caption: "Stack wired, battery lead attached",
  },
  {
    src: "/images/fpvdrone/3.jpg",
    alt: "The assembled drone held in one hand: green three-blade propellers fitted and the camera at the front",
    caption: "Assembled, with propellers and camera",
  },
  {
    src: "/images/fpvdrone/4.jpg",
    alt: "Side view of the assembled drone, with the battery strap on top and a yellow mount at the tail",
    caption: "Side view with the tail mount",
  },
  {
    src: "/images/fpvdrone/5.jpg",
    alt: "The carbon-fibre top plate of the frame, marked SpeedyBee, with the battery strap threaded through it",
    caption: "Top plate and battery strap",
  },
  {
    src: "/images/fpvdrone/6.jpg",
    alt: "A BZ-181 GPS module held between two fingers above the drone's yellow tail mount",
    caption: "GPS module",
  },
  {
    src: "/images/fpvdrone/7.jpg",
    alt: "The drone with a battery strapped on top and plugged in, its status lights glowing",
    caption: "Battery connected, powered on",
  },
  {
    src: "/images/fpvdrone/8.jpg",
    alt: "Close-up of the tail of the drone with a module seated in the yellow mount, next to a green propeller",
    caption: "Tail mount, close up",
  },
].map((photo) => ({ ...photo, ...PHOTO }));

export default function FPVDroneProjectPage() {
  return (
    <ProjectPage
      slug={SLUG}
      summary="A custom-built FPV drone with GPS and a compass. Custom firmware for autonomous flight is in progress."
    >
      <ProjectSection title="Overview">
        <Points
          items={[
            "Flight controller: SpeedyBee F405.",
            "Top speed: 200+ km/h.",
            "GPS and a compass on board.",
            "Custom firmware for autonomous flight is in progress.",
          ]}
        />
      </ProjectSection>
      <ProjectSection title="Build photos">
        <MediaGallery images={photos} label="Build photos" />
      </ProjectSection>
    </ProjectPage>
  );
}

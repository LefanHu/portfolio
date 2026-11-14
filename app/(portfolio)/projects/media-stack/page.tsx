import CodeBlock from "@/components/CodeBlock";
import MediaGallery, { type GalleryImage } from "@/components/projects/MediaGallery";
import ProjectPage, { Points, ProjectSection, Prose } from "@/components/projects/ProjectPage";
import { projectMetadata } from "@/components/projects/metadata";

const SLUG = "media-stack";

// The card image is the Plex logo; a link preview is better served by the stack itself.
export const metadata = projectMetadata(SLUG, { image: "/images/media-stack/0.png" });

const SCREENSHOT = { width: 1920, height: 1080 };

const screenshots: GalleryImage[] = [
  {
    src: "/images/media-stack/0.png",
    alt: "Plex showing a TV-show library as a grid of posters",
    caption: "Plex library",
  },
  {
    src: "/images/media-stack/1.png",
    alt: "Sonarr listing series as a grid of posters, each marked monitored or unmonitored",
    caption: "Sonarr series",
  },
  {
    src: "/images/media-stack/2.png",
    alt: "The Jackett dashboard with its list of configured indexers; the API key is covered",
    caption: "Jackett indexers",
  },
].map((screenshot) => ({ ...screenshot, ...SCREENSHOT }));

const composeFiles = [
  {
    label: "SWAG reverse proxy",
    code: `---
version: "3.8"

services:
  swag:
    container_name: swag
    image: lscr.io/linuxserver/swag:latest
    stdin_open: true
    tty: true
    cap_add:
      - NET_ADMIN
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - \${PWD}/data/nginx/snippets:/config/nginx/snippet
      - \${PWD}/data/nginx/site-confs:/config/nginx/site-confs
      - \${PWD}/config:/config
    environment:
      TZ: "America/New_York"
      DOCKER_MODS: "linuxserver/mods:nginx-proxy-confs"
      PUID: 1000
      PGID: 1000
      URL: lefan.ca
      VALIDATION: dns
      DNSPLUGIN: cloudflare
      SUBDOMAINS: wildcard

networks:
  default:
    name: swag
    external: true`,
  },
  {
    label: "Authelia",
    code: `---
version: "3.8"
services:
  authelia:
    container_name: authelia
    image: authelia/authelia:latest
    restart: unless-stopped
    ports:
      - 9091:9091
    volumes:
      - \${PWD}/data/authelia/config:/config
    environment:
      TZ: "America/New_York"

networks:
  default:
    name: swag
    external: true`,
  },
  {
    label: "Sonarr and Jackett",
    code: `version: "2.1"
services:
  sonarr:
    image: lscr.io/linuxserver/sonarr:latest
    container_name: sonarr
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/London
    volumes:
      - ~/sonarr/config:/config
      - ~/plex/tv:/tv #optional
      - ~/plex/movies/:/movies
      - ~/plex/downloads:/downloads #optional
    restart: unless-stopped

  jackett:
    image: lscr.io/linuxserver/jackett:latest
    container_name: jackett
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/London
      - AUTO_UPDATE=true #optional
      - RUN_OPTS=<run options here> #optional
    volumes:
      - ./jackett/config:/config
      - ./jackett/downloads:/downloads
    ports:
      - 9117:9117
    restart: unless-stopped

networks:
  default:
    name: swag
    external: true`,
  },
  {
    label: "Jupyter",
    code: `---
version: "3.8"

services:
  jupyter:
    image: jupyter/datascience-notebook:latest
    container_name: jupyter
    stdin_open: true
    tty: true
    environment:
      JUPYTER_ENABLE_LAB: true
      JUPYTER_TOKEN: ""
    volumes:
      - ./work:/home/jovyan/work:rw

networks:
  default:
    name: swag
    external: true`,
  },
];

export default function MediaStackProjectPage() {
  return (
    <ProjectPage
      slug={SLUG}
      summary="A self-hosted media server for watching and managing shows and anime: Plex, Sonarr and Jackett in Docker containers behind an Nginx reverse proxy, with Authelia in front of every exposed service."
    >
      <ProjectSection title="Overview">
        <Points
          items={[
            "Hosted on Oracle Cloud.",
            "Services are proxied through Cloudflare.",
            "Sonarr works with Jackett as its indexer.",
            "WireGuard traffic goes through a Pi-hole container, a DNS sinkhole, for ad blocking.",
            "Plex manages the media library.",
            "Every service runs in a Docker container, all on a single machine.",
            "Every exposed service is secured with Authelia.",
          ]}
        />
      </ProjectSection>
      <ProjectSection title="Screenshots">
        <MediaGallery images={screenshots} label="Screenshots" columns={3} />
      </ProjectSection>
      <ProjectSection title="Configuration">
        <Prose>
          <p>
            Docker Compose files for some of the services. The full network configuration is not published.
          </p>
        </Prose>
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
          {composeFiles.map((file) => (
            <CodeBlock key={file.label} label={file.label} code={file.code} language="yaml" />
          ))}
        </div>
      </ProjectSection>
    </ProjectPage>
  );
}

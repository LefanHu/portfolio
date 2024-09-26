"use client";
import SimpleCodelock from "@/components/CodeBlock";
import TechnologyBadge from "@/components/portfolio/TechnologyBadge";
import { List } from "@mantine/core";
import Image from "next/image";

export default function MediaStackProjectPage() {
  const technologies = [
    "Docker",
    "Docker Networks",
    "Oracle Cloud",
    "Cloudflare",
    "Nginx Reverse Proxy",
    "Wireguard",
    "PiHole",
    "Sonarr",
    "Plex",
    "Jackett",
    "Transmission",
    "Authelia",
  ];

  const overviewPoints = [
    "Hosted on oracle cloud",
    "Services proxies through Cloudflare",
    "Sonarr indexer in conjunction with Jackett",
    "Wireguard traffic through DNS sinkhole (Pi-hole) container for adblocking",
    "Plex for media management",
    "All services are containerized using Docker and running on single machine",
    "All exposed services secured with Authelia",
  ];

  const numImages = 3;

  const composeFiles = [
    `---
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
    `version: "2.1"
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
    `---
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
    `---
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
    `---
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
  ];

  const composeLabels = ["Authelia", "Sonarr", "Jupyter", "Swag", "Jupyter"];

  return (
    <div className="flex-1 overflow-auto no-scrollbar bg-black">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-8 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-6xl">
            Home Media Stack
          </h2>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          {/* technologies */}
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {technologies.map((tech) => TechnologyBadge(tech))}
          </div>
          <p className="mt-4 text-gray-300 mb-5">
            A home media stack project to make life easier. As I enjoy shows and
            anime, I&apos;ve set up a home media stack to make it easier to
            watch and manage everything.
          </p>

          <div className="grid grid-cols-1 gap-4 p-4 bg-gray-800 bg-opacity-90 rounded-2xl">
            <div className="rounded-xl p-5 bg-gray-700">
              <h3 className="text-2xl text-white font-bold">
                Project Overview
              </h3>
              <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              <List size="md" listStyleType="disc">
                {overviewPoints.map((point) => (
                  <List.Item key={point} className="w-[95%]">
                    {point}
                  </List.Item>
                ))}
              </List>
            </div>
            <div className="p-5 gap-y-2 rounded-xl bg-gray-700">
              <h3 className="text-2xl text-white font-bold">Sample Images</h3>
              <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              <div className="mt-2 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: numImages }, (_, i) => (
                  <a key={i} href={`/images/media-stack/${i}.png`}>
                    <Image
                      src={`/images/media-stack/${i}.png`}
                      alt={`home media stack ${i}`}
                      width={1024}
                      height={720}
                      className="rounded-lg border-2 border-white object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-800 bg-opacity-90 rounded-2xl">
          <div className="p-5 gap-y-2 rounded-xl bg-gray-700">
            <h3 className="text-2xl text-white font-bold">My Configurations</h3>
            <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {composeFiles.map((file, indx) => (
                <div key={indx} className="rounded-md p-2 gap-2 items-start">
                  <h4 className="text-xl text-white font-bold">
                    {composeLabels[indx] + " Compose File"}
                  </h4>
                  <SimpleCodelock
                    code={composeFiles[indx]}
                    language="yaml"
                    showLineNumbers={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

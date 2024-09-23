"use client";

import { useEffect, useState } from "react";
import SlidingCards from "../SlidingCards";
import Carousel from "../Carousel";

const projects = [
  {
    name: "Stable Diffusion",
    imgSrc: "/images/swift-beach.jpg",
    description:
      "Taylor swift image generator. Trained LORA adapter for stablediffusion-XL using AWS GPU instance",
  },
  {
    name: "Drone",
    imgSrc: "/images/drone.jpg",
    description:
      "Custom FPV drone with, GPS, Compass... custom firmware in progress!",
  },
  {
    name: "Plex, Sonarr, Jackett - Stack",
    imgSrc: "/images/plex.png",
    description:
      "Home media server stack built using docker, authelia, nginx proxy",
  },
  {
    name: "HIVE-HQ",
    imgSrc: "/images/hivehq.png",
    description: "2022 HTN submission. AI powered Covid safety planner",
  },
  {
    name: "Auto Trader - Arbitrage",
    imgSrc: "/images/stonks.jpg",
    description: "Arbitration bot for the Oanda API",
  },
  // {
  //   name: "Drawbot",
  //   imgSrc: "/images/drawbot-logo.png",
  //   description: "2023 HTN submission. AI powered drawing robot",
  // },
  {
    name: "Interqu",
    imgSrc: "/images/interqu.svg",
    description: "AI interview platform built using AWS SAM",
  },
];

export default function FavProjects() {
  const [windowSize, setWindowSize] = useState<number>(-1);

  // change component to carousel if screen size too small
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
    };

    // check screen size immediately
    handleResize();

    // add listener window size listener
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  var displayedComponent = <SlidingCards cards={projects} />;
  if (windowSize < 900) {
    displayedComponent = (
      <Carousel
        imageList={projects.map((project) => ({
          src: project.imgSrc,
          alt: project.name,
          label: project.name,
          description: project.description,
          width: 1024,
          height: 1024,
        }))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
          Favorite Projects
        </h2>
        <p className="mt-4 text-gray-300 mb-5">
          Below are some of my personal interests that I enjoy doing in my free
          time. Although not everything is listed here, but it does highlight
          some of my personal favorites.
        </p>
        <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
      </div>
      {displayedComponent}
      <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
    </div>
  );
}

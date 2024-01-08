/* eslint-disable react/jsx-key */
'use client'

import { ReactElement } from "react";
import HoverTiltCard from "../components/hoverTiltCard"
import FlyoutMenu from "../components/flyoutmenu";
import { LightBulbIcon, PuzzlePieceIcon, WindowIcon } from "@heroicons/react/24/outline";

const components: ReactElement[] = [
  <HoverTiltCard className="h-auto max-w-full rounded-lg" />,
  <FlyoutMenu
    title="example"
    entries={[
      {
        name: "Algorithm Gallery",
        description: "some description",
        href: "/algo",
        icon: PuzzlePieceIcon
      },
      {
        name: "JS Canvas",
        description: "A collection of weird and playful experiments with JS canvas",
        href: "/js",
        icon: LightBulbIcon
      },
      {
        name: "CSS",
        description: "A collection of react components that I've written",
        href: "/component-library",
        icon: WindowIcon
      },
    ]}
    className="h-auto max-w-full rounded-lg bg-white"
  />
]

export default function ComponentLibrary() {
  const grids = Math.ceil(components.length / 3);


  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="grid gap-4">
        <div className="h-auto max-w-full rounded-lg">
          <HoverTiltCard />
          {/* <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg" alt="" /> */}
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg" alt="" />
        </div>
      </div>
      <div className="grid gap-4">
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg" alt="" />
        </div>
      </div>
      <div className="grid gap-4">
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-7.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-8.jpg" alt="" />
        </div>
      </div>
      <div className="grid gap-4">
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-9.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-10.jpg" alt="" />
        </div>
        <div>
          <img className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-11.jpg" alt="" />
        </div>
      </div>
    </div >
  )
}

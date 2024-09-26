"use client";

import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  AcademicCapIcon,
  Bars3Icon,
  BellIcon,
  DocumentTextIcon,
  HeartIcon,
  RocketLaunchIcon,
  TvIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FlyoutMenu from "./flyoutmenu";
import Image from "next/image";

const nav = [
  {
    title: "Home",
    entries: [
      {
        name: "About Me (Home Page)",
        description: "Who am I?",
        href: "/",
        icon: AcademicCapIcon,
      },
      {
        name: "Resume",
        description: "Current resume",
        href: "/resume-page",
        icon: DocumentTextIcon,
      },
    ],
  },
  {
    title: "Projects",
    entries: [
      {
        name: "Stable Diffusion Image Generator",
        description: "Generates images of Taylor Swift",
        href: "/projects/stable-diffusion",
        icon: HeartIcon,
      },
      {
        name: "Custom Drone",
        description: "Custom FPV drone built from scratch",
        href: "/projects/drone",
        icon: RocketLaunchIcon,
      },
      {
        name: "Home Media Stack",
        description: "Sonarr, Jackeet, Plex Stack",
        href: "/projects/media-stack",
        icon: TvIcon,
      },
    ],
  },
  // {
  //   title: "Fun Stuff",
  //   entries: [
  //     {
  //       name: "Algorithm Gallery",
  //       description: "some description",
  //       href: "/algo",
  //       icon: PuzzlePieceIcon,
  //     },
  //     {
  //       name: "JS Canvas",
  //       description:
  //         "A collection of weird and playful experiments with JS canvas",
  //       href: "/js",
  //       icon: LightBulbIcon,
  //     },
  //     {
  //       name: "CSS",
  //       description: "A collection of react components that I've written",
  //       href: "/in-complete",
  //       icon: WindowIcon,
  //     },
  //   ],
  // },
];

function classNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <RocketLaunchIcon className="h-8 w-auto" />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {nav.map((entry) => (
                      <a key={entry.title}>
                        <FlyoutMenu
                          title={entry.title}
                          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                          entries={entry.entries}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <Image
                        className="h-8 w-8 rounded-full"
                        width={50}
                        height={50}
                        src="/images/profilepic.jpeg"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="mailto:lefanhu1@gmail.com"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Contact Me
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}

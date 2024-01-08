'use client'

import Image from "next/image"
// import { LoremIpsum } from "lorem-ipsum";

// const lorem = new LoremIpsum({
//   sentencesPerParagraph: {
//     max: 8,
//     min: 4
//   },
//   wordsPerSentence: {
//     max: 16,
//     min: 4
//   }
// });

export default function Highlights() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-6 text-center md:px-12">
        <div className="mb-16">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white md:text-4xl">
            2-nd Year Computer Engineer @ University of Waterloo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 lg:mx-auto lg:w-8/12">
            Please explore some of my previous projects and experiences on this website, below are a few projects I&apos;ve worked on (not limited to):
          </p>
        </div>
        <div className="grid gap-28 py-20 md:grid-cols-3 md:gap-12">
          <div className="group space-y-8 border-t-4 border-gray-100 dark:border-white-800">
            <div className="mx-auto -mt-16 h-32 w-32 overflow-hidden rounded-[2rem]">
              <Image
                className="mx-auto h-full w-full object-cover transition duration-300 group-hover:scale-[1.1] bg-white"
                src="/images/interqu.svg"
                width={500}
                height={500}
                alt="oni"
              />
            </div>
            <div className="space-y-4 text-center">
              <div>
                <h4 className="text-2xl text-gray-700 dark:text-white">Interqu</h4>
                <span className="block text-sm text-gray-500">AI interview practice platform</span>
              </div>
              <a href="https://interqu.lefan.ca" className="mx-auto block w-max text-primary">View Project</a>
            </div>
          </div>

          <div className="group space-y-8 border-t-4 border-gray-100 dark:border-white-800">
            <div className="mx-auto -mt-16 h-32 w-32  overflow-hidden rounded-[2rem]">
              <Image
                className="mx-auto h-full w-full object-cover transition duration-300 group-hover:scale-[1.1]"
                src="/images/hivehq.png"
                width={500}
                height={500}
                alt="oni"
              />
            </div>
            <div className="space-y-4 text-center">
              <div>
                <h4 className="text-2xl text-gray-700 dark:text-white">Hive-HQ</h4>
                <span className="block text-sm text-gray-500">2021 Hack The North</span>
              </div>
              <a href="https://devpost.com/software/hive-hq" className="mx-auto block w-max text-primary">View Project</a>
            </div>
          </div>

          <div className="group space-y-8 border-t-4 border-gray-100 dark:border-white-800">
            <div className="mx-auto -mt-16 h-32 w-32  overflow-hidden rounded-[2rem]">
              <Image
                className="mx-auto h-full w-full scale-150 object-cover transition duration-300 group-hover:scale-[1.6]"
                src="/images/drawbot-logo.png"
                width={500}
                height={500}
                alt="oni"
              />
            </div>
            <div className="space-y-4 text-center">
              <div>
                <h4 className="text-2xl text-gray-700 dark:text-white">DrawBot</h4>
                <span className="block text-sm text-gray-500">2022 Hack The North</span>
              </div>
              <a href="https://devpost.com/software/drawbot-ulof5z" className="mx-auto block w-max text-primary">View Project</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

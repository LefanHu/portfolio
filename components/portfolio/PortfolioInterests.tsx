import Image from "next/image";
import { interestImages, interests } from "@/lib/portfolio/interests";

export default function Interests() {
  return (
    <div className="mx-auto grid grid-cols-1 items-center gap-4 px-4 py-4 lg:grid-cols-2 bg-gray-900/90 rounded-2xl">
      <div className="h-full bg-gray-600/50 rounded-xl p-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
          Personal Interests
        </h2>
        <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
        <p className="mt-4 text-gray-300">
          Below are some of my personal interests that I enjoy doing in my free
          time. These are not all that I do in my free time, but highlights
          quite a few of my personal favorites time-passers and areas of
          interest.
        </p>

        <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
          {interests.map((interest) => (
            <div key={interest.name} className="border-t border-gray-200 pt-4">
              <dt className="font-medium text-gray-200 underline">
                {interest.name}
              </dt>
              <dd className="mt-2 text-sm text-gray-300">
                {interest.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        {interestImages.map((image, index) => (
          <Image
            src={image.src}
            alt={image.alt}
            width={500}
            height={500}
            className="rounded-lg border-2 border-gray-200 object-cover w-full h-full"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

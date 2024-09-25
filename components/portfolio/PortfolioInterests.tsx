import Image from "next/image";

const features = [
  {
    name: "Rock Climbing",
    description:
      "Rock climbing is my go-to activity for stress relief as well as physical exercise... Nothing quite like the feeling of hard rocks in your hand.",
  },
  {
    name: "Drones",
    description:
      "Building fpv drones and flying them either autonomously or in fpv mode. Ardupilot, Betaflight, iNav, etc, are all really cool open source projects.",
  },
  {
    name: "AI & Machine Learning",
    description:
      "Generative AI has always been an interest of mine in the sense that machines can have such a thing as 'creativity'",
  },
  {
    name: "Computer Infrastructure",
    description:
      "As someone who grew up with a potato computer, I've always liked the idea of IaaS... AWS, AZURE, GCP, etc.",
  },
  {
    name: "Games & Anime",
    description:
      "Due to my interest for servers & infrastructure, I've always been the one to set up game / streaming servers for my friends.",
  },
  {
    name: "Gym",
    description:
      "Working out and staying healthy is also a passion of mine :) Goodlife fitness saunas are quite nice.",
  },
];

const interestImages = [
  {
    src: "/images/rock-climbing.jpg",
    alt: "rock climbing gym",
  },
  {
    src: "/images/drone.jpg",
    alt: "fpv drone",
  },
  {
    src: "/images/swift-beach.jpg",
    alt: "taylor swift on the beach",
  },
  {
    src: "/images/drone2.jpg",
    alt: "fpv drone",
  },
];

export default function Interests() {
  return (
    <div className="mx-auto grid grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 bg-gray-600 bg-opacity-50 rounded-2xl">
      <div>
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
          {features.map((interest) => (
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
      <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
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

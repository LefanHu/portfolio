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
  { name: "", description: "" },
];

export default function Interests() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
          Personal Interests
        </h2>
        <p className="mt-4 text-gray-300">
          Below are some of my personal interests that I enjoy doing in my free
          time. These are not all that I do in my free time, but highlights
          quite a few of my personal favorites time-passers and areas of
          interest.
        </p>

        <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="border-t border-gray-200 pt-4">
              <dt className="font-medium text-gray-200 underline">
                {feature.name}
              </dt>
              <dd className="mt-2 text-sm text-gray-300">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
        <Image
          src="/images/rock-climbing.jpg"
          alt="Walnut card tray with white powder coated steel divider and 3 punchout holes."
          width={500}
          height={500}
          className="rounded-lg bg-gray-100 aspect-square object-cover"
        />
        <Image
          src="/images/drone.jpg"
          alt="Top down view of walnut card tray with embedded magnets and card groove."
          width={500}
          height={500}
          className="rounded-lg bg-gray-100 aspect-square object-cover"
        />
        <Image
          src="/images/swift-beach.jpg"
          alt="Side of walnut card tray with card groove and recessed card area."
          width={500}
          height={500}
          className="rounded-lg bg-gray-100 aspect-square object-cover"
        />
        <Image
          src="/images/drone.jpg"
          alt="Walnut card tray filled with cards and card angled in dedicated groove."
          width={500}
          height={500}
          className="rounded-lg bg-gray-100 aspect-square object-cover"
        />
      </div>
    </div>
  );
}

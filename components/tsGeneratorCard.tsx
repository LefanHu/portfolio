"use client";

import Image from "next/image";

interface ImageDescription {
  prompt?: string;
  keywords?: string[];
}

export default function TaylorGeneratorImageCard({
  prompt = "Some random prompt",
  keywords = ["taylor swift", "meilin"],
}: ImageDescription) {
  return (
    <div className="p-2 max-w-sm rounded-lg overflow-hidden shadow-lg border-solid border-2 border-blue-900 bg-white">
      <Image
        className="w-full rounded-lg aspect-square"
        src="/images/card-top.jpg"
        alt="Sunset in the mountains"
        width={500}
        height={500}
      />
      <div className="px-6 py-4">
        {/* <div className="font-bold text-xl mb-2">The Coldest Sunset</div> */}
        <p className="text-gray-700 text-base text-center">{prompt}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        {keywords.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

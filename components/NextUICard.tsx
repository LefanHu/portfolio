import React from "react";
import Image from "next/image";

export default function NextUICard() {
  return (
    <div className="rounded-md bg-gray-400 py-4 shadow-sm">
      <div className="flex flex-col items-start px-4 pb-0 pt-2">
        <p className="text-tiny uppercase font-bold">Daily Mix</p>
        <small className="text-default-500">12 Tracks</small>
        <h4 className="font-bold text-large">Frontend Radio</h4>
      </div>
      <div className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src="/images/bucket-swift.jpg"
          width={270}
          height={200}
        />
      </div>
    </div>
  );
}

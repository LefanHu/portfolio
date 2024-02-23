import { useState } from "react";
import Image from "next/image";

interface BlurredImageData {
  src: string;
  caption: string;
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function BlurredImage(props: BlurredImageData) {
  const [isLoading, setLoading] = useState(true);

  if (props.caption.length > 100) {
    props.caption = props.caption.slice(0, 97) + "...";
  }

  // TODO: add button to copy full prompt

  return (
    <a href="#" className="group">
      <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
        <Image
          alt=""
          src={props.src}
          layout="fill"
          objectFit="cover"
          className={cn(
            "group-hover:opacity-75 duration-700 ease-in-out",
            isLoading
              ? "grayscale blur-2xl scale-110"
              : "grayscale-0 blur-0 scale-100"
          )}
          onLoadingComplete={() => setLoading(false)}
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{props.caption}</h3>
    </a>
  );
}

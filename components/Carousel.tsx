import Image from "next/image";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ImageData {
  src: string;
  alt: string;
  label?: string;
  description?: string;
  width: number;
  height: number;
}

interface CarouselProps {
  className?: string;
  imageList?: ImageData[];
}

export default function Carousel({
  className = "",
  imageList = [
    {
      src: "/images/bucket-swift.jpg",
      alt: "taylor swift in a bucket",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/bucket-swift.jpg",
      alt: "taylor swift in a bucket",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/bucket-swift.jpg",
      alt: "taylor swift in a bucket",
      width: 1024,
      height: 1024,
    },
  ],
}: CarouselProps) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  return (
    <div className={className}>
      <Slider {...settings}>
        {imageList.map((entry) => (
          <div key={entry.alt} className="relative">
            {entry.label && (
              <h3 className="absolute top-0 left-0 z-10 p-2 text-white bg-black bg-opacity-50">
                {entry.label}
              </h3>
            )}
            {entry.description && (
              <p className="absolute bottom-0 left-0 z-10 p-2 text-white bg-black bg-opacity-50">
                {entry.description}{" "}
              </p>
            )}
            <Image
              className="rounded-lg aspect-square"
              src={entry.src}
              alt={entry.alt}
              width={entry.height}
              height={entry.width}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

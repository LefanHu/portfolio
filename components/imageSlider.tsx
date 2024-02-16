import Image from "next/image";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ImageSliderProps {
  className?: string;
  imageList: ImageData[];
}

export default function ImageSlider({
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
}: ImageSliderProps) {
  const settings = {
    dots: true,
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
          <div key={entry.alt}>
            <Image
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

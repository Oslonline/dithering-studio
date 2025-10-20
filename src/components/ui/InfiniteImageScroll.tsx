import React, { useEffect, useState, useRef } from "react";

const InfiniteImageScroll: React.FC = () => {
  const NUM_IMAGES = 12;
  const [images, setImages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const imageArray: string[] = [];
    for (let i = 1; i <= NUM_IMAGES; i++) {
      imageArray.push(`/hero/hero-${i}.webp`);
    }
    for (let i = imageArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imageArray[i], imageArray[j]] = [imageArray[j], imageArray[i]];
    }
    setImages(imageArray);

    const container = containerRef.current;
    const scrollSpeed = 1.5;
    const scroll = () => {
      if (container) {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
    };

    const scrollInterval = setInterval(scroll, 20);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="w-full overflow-hidden" ref={containerRef}>
      <div className="flex space-x-3 sm:space-x-4">
        {images.map((src, index) => (
          <img key={index} src={src} alt="" role="presentation" className="h-40 w-auto flex-shrink-0 object-cover sm:h-44 md:h-48 xl:h-52 2xl:h-52" loading="lazy" />
        ))}
        {images.map((src, index) => (
          <img key={`repeat-${index}`} src={src} alt="" role="presentation" className="h-40 w-auto flex-shrink-0 object-cover sm:h-44 md:h-48 xl:h-52 2xl:h-52" loading="lazy" />
        ))}
      </div>
    </div>
  );
};

export default InfiniteImageScroll;

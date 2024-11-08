import React, { useEffect, useState, useRef } from "react";

const InfiniteImageScroll: React.FC = () => {
  const NUM_IMAGES = 8;
  const [images, setImages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const imageArray: string[] = [];
    for (let i = 1; i <= NUM_IMAGES; i++) {
      imageArray.push(`/hero/hero-${i}.webp`);
    }
    setImages(imageArray);

    const container = containerRef.current;
    const scrollSpeed = 1;
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
      <div className="flex space-x-4">
        {images.map((src, index) => (
          <img key={index} src={src} alt={`hero-${index + 1}`} className="h-72 object-cover md:h-96 xl:h-[425px]" />
        ))}
        {/* Repeat the images for continuous scrolling */}
        {images.map((src, index) => (
          <img key={`repeat-${index}`} src={src} alt={`repeat-hero-${index + 1}`} className="h-72 object-cover md:h-96 xl:h-[425px]" />
        ))}
      </div>
    </div>
  );
};

export default InfiniteImageScroll;

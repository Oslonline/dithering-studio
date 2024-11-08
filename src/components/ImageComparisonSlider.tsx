import React, { useState, useRef, MouseEvent, TouchEvent } from "react";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPosition = (offsetX / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(newPosition, 0), 100));
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const newPosition = (touchX / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(newPosition, 0), 100));
  };

  return (
    <div className="relative h-64 w-full overflow-hidden" ref={containerRef} onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
      {/* Before Image */}
      <img src={beforeImage} alt="Before" className="absolute h-full w-full object-cover" />

      {/* After Image */}
      <div className="absolute left-0 top-0 h-full" style={{ width: `${sliderPosition}%` }}>
        <img src={afterImage} alt="After" className="h-full w-full object-cover" />
      </div>

      {/* Slider Bar */}
      <div className="absolute top-0" style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}>
        <div className="h-full w-1 bg-gray-500" />
        <div className="absolute top-1/2 h-6 w-6 -translate-y-1/2 transform cursor-pointer rounded-full border bg-white" />
      </div>
    </div>
  );
};

export default ImageComparisonSlider;

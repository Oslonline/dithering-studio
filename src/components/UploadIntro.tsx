import React from "react";

interface UploadIntroProps { mode: 'image' | 'video'; }

const UploadIntro: React.FC<UploadIntroProps> = ({ mode }) => {
  const isVideo = mode === 'video';
  return (
    <div className="min-panel relative space-y-3 p-4">
      <h2 className="font-anton text-xl leading-tight">Dithering Studio — {isVideo ? 'Video' : 'Image'}</h2>
      {isVideo ? (
        <p className="text-[11px] leading-relaxed text-gray-400">Drop or select a short video to begin. Processing happens locally frame by frame.</p>
      ) : (
        <p className="text-[11px] leading-relaxed text-gray-400">Drop or select an image in the main area to begin. Your picture never leaves this window.</p>
      )}
      <ul className="ml-4 list-disc space-y-1 text-[10px] text-gray-500">
        <li>Choose algorithm & tweak threshold.</li>
        {isVideo ? (
          <li>Adjust working resolution (scales longer side).</li>
        ) : (
          <li>Adjust working resolution (internal quality).</li>
        )}
        {isVideo ? (
          <li>Palette & binary modes supported.</li>
        ) : (
          <li>Invert or enable serpentine scanning.</li>
        )}
        {isVideo ? (
          <li>Download any frame instantly.</li>
        ) : (
          <li>Download instantly as PNG or JPEG.</li>
        )}
      </ul>
    </div>
  );
};

export default UploadIntro;

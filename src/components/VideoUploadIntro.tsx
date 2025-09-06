import React from 'react';

const VideoUploadIntro: React.FC = () => (
  <div className="min-panel relative space-y-3 p-4">
    <h2 className="font-anton text-xl leading-tight">Dithering Studio — Video</h2>
    <p className="text-[11px] leading-relaxed text-gray-400">Drop or select a short video to begin. Processing happens locally frame by frame.</p>
    <ul className="ml-4 list-disc space-y-1 text-[10px] text-gray-500">
      <li>Choose algorithm & tweak threshold.</li>
      <li>Adjust working resolution (scales longer side).</li>
      <li>Palette & binary modes supported.</li>
      <li>Download any frame instantly.</li>
    </ul>
  </div>
);

export default VideoUploadIntro;

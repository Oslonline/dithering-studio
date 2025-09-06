import React from "react";

const UploadIntro: React.FC = () => (
  <div className="min-panel relative space-y-3 p-4">
    <h2 className="font-anton text-xl leading-tight">Dithering Studio — Image</h2>
    <p className="text-[11px] leading-relaxed text-gray-400">Drop or select an image in the main area to begin. Your picture never leaves this window.</p>
    <ul className="ml-4 list-disc space-y-1 text-[10px] text-gray-500">
      <li>Choose algorithm & tweak threshold.</li>
      <li>Adjust working resolution (internal quality).</li>
      <li>Invert or enable serpentine scanning.</li>
      <li>Download instantly as PNG or JPEG.</li>
    </ul>
  </div>
);

export default UploadIntro;

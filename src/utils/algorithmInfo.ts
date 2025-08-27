// Extended algorithm information for educational / technical reference.
// Each entry optionally provides: kernel (for diffusion), matrix (ordered), notes on complexity, artifacts, and use cases.
export interface AlgorithmDetail {
  id: number;
  name: string;
  category: string;
  overview: string;
  kernel?: number[][];        // Error diffusion kernel (rows below current pixel)
  kernelDivisor?: number;     // Sum of weights for normalization
  orderedMatrixSize?: string; // e.g. "4x4", "8x8"
  characteristics: string[];  // Bullet list of traits
  artifacts: string[];        // Typical artifacts
  bestFor: string[];          // Suggested usage contexts
  complexity: string;         // Big-O and practical remarks
  reference?: string;         // Short historical note or origin
}

export const algorithmDetails: AlgorithmDetail[] = [
  {
    id: 1,
    name: "Floyd–Steinberg",
    category: "Error Diffusion",
    overview: "Classic diffusion distributing quantization error to 4 forward neighbors (7/16,3/16,5/16,1/16). Balanced quality vs speed.",
    kernel: [ [0, 0, 7], [3, 5, 1] ],
    kernelDivisor: 16,
    characteristics: ["Good preservation of gradients", "Fine grain texture", "Widely adopted baseline"],
    artifacts: ["Minor diagonal peppering", "Can accentuate noise"],
    bestFor: ["General grayscale / palette reduction", "Photographs", "Retro look"],
    complexity: "O(N) passes; constant extra memory (1 luminance buffer).",
    reference: "Floyd & Steinberg, 1976 – 'An Adaptive Algorithm for Spatial Grey Scale.'"
  },
  {
    id: 3,
    name: "Atkinson",
    category: "Error Diffusion",
    overview: "Light-weight diffusion from early Macintosh printers; produces lighter mid-tones by dropping some error (non-conserving).",
    kernel: [ [0, 0, 1, 1], [1, 1, 1, 0], [0, 1, 0, 0] ],
    kernelDivisor: 8,
    characteristics: ["Soft, airy look", "Lighter overall brightness", "Simpler kernel"],
    artifacts: ["Can wash dark regions", "Slight directional bias"],
    bestFor: ["Stylistic pixel-art", "Light UI glyph rendering"],
    complexity: "O(N); minimal arithmetic per pixel.",
    reference: "Bill Atkinson – Apple Macintosh dithering patterns."
  },
  { id: 4, name: "Burkes", category: "Error Diffusion", overview: "Balanced Stucki-like kernel without last row.", kernel: [[0,0,0,8,4],[2,4,8,4,2]], kernelDivisor:32, characteristics:["Smoother than FS","Less costly than Stucki"], artifacts:["Slight horizontal banding when over-thresholded"], bestFor:["Mid-size images","Photos"], complexity:"O(N) with moderate extra ops", reference:"Burkes kernel (variant of Stucki)." },
  { id: 5, name: "Stucki", category: "Error Diffusion", overview: "Larger kernel for smoother gradients.", kernel:[[0,0,0,8,4],[2,4,8,4,2],[1,2,4,2,1]], kernelDivisor:42, characteristics:["Smooth gradients","Reduced noise"], artifacts:["Softness / blur tendency"], bestFor:["High-res photos"], complexity:"Higher constant factor than FS", reference:"Stucki (1981)." },
  { id: 6, name: "Sierra", category: "Error Diffusion", overview: "Quality similar to Stucki, slightly different weights.", kernel:[[0,0,0,5,3],[2,4,5,4,2],[0,2,3,2,0]], kernelDivisor:32, characteristics:["Good compromise","Balanced sharpness"], artifacts:["Occasional subtle worm patterns"], bestFor:["Photos","Retro conversions"], complexity:"O(N)" },
  { id: 12, name: "Sierra Lite", category: "Error Diffusion", overview: "Reduced Sierra kernel for speed.", kernel:[[0,0,2],[1,1,0]], kernelDivisor:4, characteristics:["Fast","Acceptable quality"], artifacts:["More visible grain"], bestFor:["Previews","Low-power devices"], complexity:"Lower constant factor" },
  { id: 13, name: "Two-Row Sierra", category: "Error Diffusion", overview: "Two row variant compromise.", kernel:[[0,0,0,4,3],[1,2,3,2,1]], kernelDivisor:16, characteristics:["Balance of speed & smoothness"], artifacts:["Some directional bias"], bestFor:["Medium resolutions"], complexity:"O(N) moderate" },
  { id: 14, name: "Stevenson–Arce", category: "Error Diffusion", overview: "Sparse long-range diffusion promoting blue-noise-like texture.", kernel:[[0,0,0,0,0,32,0,0,0,0,0],[12,0,26,0,30,0,30,0,26,0,12],[0,12,0,26,0,12,0,26,0,12,0]], kernelDivisor:200, characteristics:["Organic texture","Reduced directional artifacts"], artifacts:["Higher computation","Potential speckling"], bestFor:["Artistic renders","Large images"], complexity:"O(N) higher cost due to sparse wide kernel" },
  { id: 7, name: "Jarvis–Judice–Ninke", category: "Error Diffusion", overview: "Large, high-quality kernel producing smooth gradients.", kernel:[[0,0,0,7,5],[3,5,7,5,3],[1,3,5,3,1]], kernelDivisor:48, characteristics:["Very smooth","Good tonal fidelity"], artifacts:["Slight softness"], bestFor:["High-quality prints"], complexity:"Above FS / Stucki constant" },
  { id: 2, name: "Bayer 4×4", category: "Ordered", overview: "Deterministic threshold matrix giving a structured pattern.", orderedMatrixSize:"4x4", characteristics:["Predictable pattern","Fast"], artifacts:["Visible matrix tiling"], bestFor:["Pixel-art filters","Icons"], complexity:"O(N) simple lookup" },
  { id: 8, name: "Bayer 8×8", category: "Ordered", overview: "Larger matrix for smoother gradients with less harsh pattern.", orderedMatrixSize:"8x8", characteristics:["Subtler pattern","Still deterministic"], artifacts:["Low-frequency tiling"], bestFor:["Gradients","UI backgrounds"], complexity:"O(N)" },
  { id: 16, name: "Bayer 2×2", category: "Ordered", overview: "Minimal matrix producing coarse checker pattern.", orderedMatrixSize:"2x2", characteristics:["Very strong pattern","Tiny memory"], artifacts:["Harsh blockiness"], bestFor:["Stylized effects"], complexity:"O(N)" },
  { id: 17, name: "Blue Noise Mask (64×64)", category: "Ordered", overview: "Pseudo blue-noise shuffled mask approximating less structured noise.", orderedMatrixSize:"64x64", characteristics:["Reduced pattern repetition","Good gradient quality"], artifacts:["Not a true blue-noise","Potential tile seams"], bestFor:["General dithering","Artistic"], complexity:"O(N) mask lookup" },
  { id: 15, name: "Binary Threshold", category: "Other", overview: "Single global cutoff – highest contrast.", characteristics:["Crisp edges","Simple"], artifacts:["Massive banding","Loss of mid-tones"], bestFor:["Logos","High-contrast glyphs"], complexity:"O(N)" },
  { id: 9, name: "Halftone (Experimental)", category: "Other", overview: "Block-based dot sizing emulating analog halftone.", characteristics:["Retro print feel","Adjustable dot blocks"], artifacts:["Moiré at certain scales","Block boundaries"], bestFor:["Posters","Stylized print look"], complexity:"O(N * blockArea / blockStride) ~ O(N)" },
  { id: 10, name: "Random Threshold", category: "Other", overview: "Per-pixel random threshold; noisy texture.", characteristics:["Grainy aesthetic","Breaks banding"], artifacts:["High noise","Inconsistent reproduction"], bestFor:["Noise overlays","Experimental art"], complexity:"O(N)" },
  { id: 11, name: "Dot Diffusion (Simple)", category: "Other", overview: "Simplified checker-based dot diffusion placeholder.", characteristics:["Even-ish distribution","Toy example"], artifacts:["Not full dot diffusion","Grid artifacts"], bestFor:["Demonstration","Prototype"], complexity:"O(N)" }
];

export const getAlgorithmDetail = (id: number) => algorithmDetails.find(a => a.id === id);

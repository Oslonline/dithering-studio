import { AlgorithmMeta } from './types';
import {
  runFloydSteinberg as runFS,
  runAtkinson,
  runSierraLite,
  runBurkes,
  runStucki,
  runSierra,
  runJJN,
  runTwoRowSierra,
  runStevensonArce,
  runSierra24A,
  runFalseFloydSteinberg,
  runAdaptiveOstromoukhov,
  runAdaptiveFS3,
  runAdaptiveFS7,
  runCustomKernel
} from './errorDiffusion';
import { runBlueNoise, runBinaryThreshold, runRandomThreshold, runDotDiffusionSimple, runHalftone } from './orderedAndOther';
import { runBayer2, runBayer4, runBayer8, runBayer16, runBayer32 } from './bayer';
import runAsciiMosaic from './asciiMosaic';

// Raw registry (unsorted). Maintain new entries here; ordering handled by helpers.
const registry: AlgorithmMeta[] = [
  { id: 1, name: 'Floyd–Steinberg', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:fs:1', run: (ctx) => runFS(ctx) },
  { id: 19, name: 'False Floyd–Steinberg', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:false-fs:2', run: (ctx) => runFalseFloydSteinberg(ctx) },
  { id: 3, name: 'Atkinson', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'error:atkinson:3', run: (ctx) => runAtkinson(ctx) },
  { id: 12, name: 'Sierra Lite', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:sierra-lite:4', run: (ctx) => runSierraLite(ctx) },
  { id: 4, name: 'Burkes', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:burkes:5', run: (ctx) => runBurkes(ctx) },
  { id: 5, name: 'Stucki', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:stucki:6', run: (ctx) => runStucki(ctx) },
  { id: 6, name: 'Sierra', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:sierra:7', run: (ctx) => runSierra(ctx) },
  { id: 7, name: 'Jarvis–Judice–Ninke', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:jjn:8', run: (ctx) => runJJN(ctx) },
  { id: 13, name: 'Two-Row Sierra', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:two-row-sierra:9', run: (ctx) => runTwoRowSierra(ctx) },
  { id: 14, name: 'Stevenson–Arce', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:stevenson-arce:10', run: (ctx) => runStevensonArce(ctx) },
  { id: 18, name: 'Ostromoukhov', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: false, supportsSerpentine: true, orderKey: 'error:ostro:11', run: (ctx) => runAdaptiveOstromoukhov(ctx) },
  { id: 21, name: 'Adaptive FS 3×3', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:afs3:12', run: (ctx) => runAdaptiveFS3(ctx) },
  { id: 22, name: 'Adaptive FS 7×7', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:afs7:13', run: (ctx) => runAdaptiveFS7(ctx) },
  { id: 23, name: 'Sierra 2-4A', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:sierra-24a:14', run: runSierra24A },
  { id: 26, name: 'Custom Kernel', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, supportsSerpentine: true, orderKey: 'error:custom:15', run: (ctx) => runCustomKernel(ctx) },

  { id: 16, name: 'Bayer 2×2', category: 'Ordered', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'ordered:bayer:2', run: (ctx) => runBayer2(ctx) },
  { id: 2, name: 'Bayer 4×4', category: 'Ordered', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'ordered:bayer:4', run: (ctx) => runBayer4(ctx) },
  { id: 8, name: 'Bayer 8×8', category: 'Ordered', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'ordered:bayer:8', run: (ctx) => runBayer8(ctx) },
  { id: 20, name: 'Bayer 16×16', category: 'Ordered', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'ordered:bayer:16', run: (ctx) => runBayer16(ctx) },
  { id: 24, name: 'Bayer 32×32', category: 'Ordered', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'ordered:bayer:32', run: (ctx) => runBayer32(ctx) },
  { id: 17, name: 'Blue Noise 64×64', category: 'Ordered', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'ordered:bluenoise:64', run: (ctx) => runBlueNoise(ctx) },

  { id: 15, name: 'Binary Threshold', category: 'Other', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'other:binary:1', run: (ctx) => runBinaryThreshold(ctx) },
  { id: 9, name: 'Halftone', category: 'Other', supportsThreshold: true, supportsPalette: false, supportsSerpentine: false, orderKey: 'other:halftone:2', run: (ctx) => runHalftone(ctx) },
  { id: 10, name: 'Random Threshold', category: 'Other', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'other:random:3', run: (ctx) => runRandomThreshold(ctx) },
  { id: 11, name: 'Dot Diffusion (Simple)', category: 'Other', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'other:dotdiff:4', run: (ctx) => runDotDiffusionSimple(ctx) },
  { id: 25, name: 'ASCII Mosaic', category: 'Other', supportsThreshold: true, supportsPalette: true, supportsSerpentine: false, orderKey: 'other:ascii:5', run: (ctx) => runAsciiMosaic(ctx) },
];

// Export a consistently sorted list (category group order defined here)
const CATEGORY_ORDER = ['Error Diffusion', 'Ordered', 'Other'];
export const algorithms: AlgorithmMeta[] = registry
  .slice()
  .sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category); const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    if (a.orderKey && b.orderKey && a.orderKey !== b.orderKey) return a.orderKey.localeCompare(b.orderKey, undefined, { numeric: true });
    return a.id - b.id;
  });

export function getAlgorithmsByCategory() {
  const map: Record<string, AlgorithmMeta[]> = {};
  for (const a of algorithms) { (map[a.category] ||= []).push(a); }
  return map;
}

export function findAlgorithm(id: number): AlgorithmMeta | undefined { return algorithms.find(a => a.id === id); }

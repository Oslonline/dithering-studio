import { AlgorithmMeta } from './types';
import runFS from './floydSteinberg';
import runAtkinson from './atkinson';
import runBayer4 from './orderedBayer4';
import { createErrorDiffusionKernelRunner } from './errorDiffusionKernels';
import { createAdaptiveFSDiffusion } from './adaptiveThreshold';
import { runBayer2, runBayer8, runBlueNoise, runBinaryThreshold, runRandomThreshold, runDotDiffusionSimple, runHalftone, runFalseFloydSteinberg, runBayer16, runAdaptiveOstromoukhov } from './orderedAndOther';

// Predefined diffusion kernels (matrix centered horizontally) matching legacy PatternDrawer patterns
const burkes = createErrorDiffusionKernelRunner([[0,0,0,8,4],[2,4,8,4,2]], 32, true); // 4
const stucki = createErrorDiffusionKernelRunner([[0,0,0,8,4],[2,4,8,4,2],[1,2,4,2,1]], 42, true); //5
const sierra = createErrorDiffusionKernelRunner([[0,0,0,5,3],[2,4,5,4,2],[0,2,3,2,0]], 32, true); //6
const jjn = createErrorDiffusionKernelRunner([[0,0,0,7,5],[3,5,7,5,3],[1,3,5,3,1]], 48, true); //7
const sierraLite = createErrorDiffusionKernelRunner([[0,0,2],[1,1,0]],4,true); //12
const twoRowSierra = createErrorDiffusionKernelRunner([[0,0,0,4,3],[1,2,3,2,1]],16,true); //13
const stevensonArce = createErrorDiffusionKernelRunner([[0,0,0,0,0,32,0,0,0,0,0],[12,0,26,0,30,0,30,0,26,0,12],[0,12,0,26,0,12,0,26,0,12,0]],200,false); //14

// Raw registry (unsorted). Maintain new entries here; ordering handled by helpers.
const registry: AlgorithmMeta[] = [
  { id: 1, name: 'Floyd–Steinberg', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, orderKey: 'error:fs:1', run: (ctx)=> runFS(ctx) },
  { id: 19, name: 'False Floyd–Steinberg', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: false, orderKey: 'error:false-fs:2', run: (ctx)=> runFalseFloydSteinberg(ctx) },
  { id: 3, name: 'Atkinson', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:atkinson:3', run: (ctx)=> runAtkinson(ctx) },
  { id: 12, name: 'Sierra Lite', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:sierra-lite:4', run: sierraLite },
  { id: 4, name: 'Burkes', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:burkes:5', run: burkes },
  { id: 5, name: 'Stucki', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:stucki:6', run: stucki },
  { id: 6, name: 'Sierra', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:sierra:7', run: sierra },
  { id: 7, name: 'Jarvis–Judice–Ninke', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:jjn:8', run: jjn },
  { id: 13, name: 'Two-Row Sierra', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:two-row-sierra:9', run: twoRowSierra },
  { id: 14, name: 'Stevenson–Arce', category: 'Error Diffusion', supportsThreshold: true, orderKey: 'error:stevenson-arce:10', run: stevensonArce },
  { id: 18, name: 'Ostromoukhov', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: false, orderKey: 'error:ostro:11', run: (ctx)=> runAdaptiveOstromoukhov(ctx) },
  { id: 21, name: 'Adaptive FS 3×3', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, orderKey: 'error:afs3:12', run: createAdaptiveFSDiffusion(1) },
  { id: 22, name: 'Adaptive FS 7×7', category: 'Error Diffusion', supportsThreshold: true, supportsPalette: true, orderKey: 'error:afs7:13', run: createAdaptiveFSDiffusion(3) },

  { id: 16, name: 'Bayer 2×2', category: 'Ordered', supportsThreshold: true, supportsPalette: true, orderKey: 'ordered:bayer:2', run: (ctx)=> runBayer2(ctx) },
  { id: 2, name: 'Bayer 4×4', category: 'Ordered', supportsThreshold: true, supportsPalette: true, orderKey: 'ordered:bayer:4', run: (ctx)=> runBayer4(ctx) },
  { id: 8, name: 'Bayer 8×8', category: 'Ordered', supportsThreshold: true, supportsPalette: true, orderKey: 'ordered:bayer:8', run: (ctx)=> runBayer8(ctx) },
  { id: 20, name: 'Bayer 16×16', category: 'Ordered', supportsThreshold: true, supportsPalette: true, orderKey: 'ordered:bayer:16', run: (ctx)=> runBayer16(ctx) },
  { id: 17, name: 'Blue Noise 64×64', category: 'Ordered', supportsThreshold: true, supportsPalette: true, orderKey: 'ordered:bluenoise:64', run: (ctx)=> runBlueNoise(ctx) },

  { id: 15, name: 'Binary Threshold', category: 'Other', supportsThreshold: true, supportsPalette: true, orderKey: 'other:binary:1', run: (ctx)=> runBinaryThreshold(ctx) },
  { id: 9, name: 'Halftone', category: 'Other', supportsThreshold: true, supportsPalette: false, orderKey: 'other:halftone:2', run: (ctx)=> runHalftone(ctx) },
  { id: 10, name: 'Random Threshold', category: 'Other', supportsThreshold: true, supportsPalette: true, orderKey: 'other:random:3', run: (ctx)=> runRandomThreshold(ctx) },
  { id: 11, name: 'Dot Diffusion (Simple)', category: 'Other', supportsThreshold: true, supportsPalette: true, orderKey: 'other:dotdiff:4', run: (ctx)=> runDotDiffusionSimple(ctx) },
];

// Export a consistently sorted list (category group order defined here)
const CATEGORY_ORDER = ['Error Diffusion','Ordered','Other'];
export const algorithms: AlgorithmMeta[] = registry
  .slice()
  .sort((a,b) => {
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

export function findAlgorithm(id: number): AlgorithmMeta | undefined { return algorithms.find(a=>a.id===id); }

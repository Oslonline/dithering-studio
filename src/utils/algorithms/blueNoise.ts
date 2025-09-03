import { mulberry32 } from '../prng';

export const BLUE_NOISE_SIZE = 64;
const TOTAL = BLUE_NOISE_SIZE * BLUE_NOISE_SIZE;

function buildBlueNoiseRanking(): Uint16Array {
  const rng = mulberry32(0xB1);
  const coordsX = new Uint16Array(TOTAL);
  const coordsY = new Uint16Array(TOTAL);
  for (let i = 0; i < TOTAL; i++) { coordsX[i] = i % BLUE_NOISE_SIZE; coordsY[i] = (i / BLUE_NOISE_SIZE) | 0; }
  const order: number[] = [];
  const chosen = new Uint8Array(TOTAL);
  let first = (rng() * TOTAL) | 0;
  chosen[first] = 1; order.push(first);
  const tmpMinDist = new Float32Array(TOTAL); tmpMinDist.fill(1e9);
  const size = BLUE_NOISE_SIZE;
  function updateDistances(pIdx: number) {
    const px = coordsX[pIdx]; const py = coordsY[pIdx];
    for (let i = 0; i < TOTAL; i++) {
      if (chosen[i]) continue;
      const dx = px - coordsX[i]; const dy = py - coordsY[i];
      const wx = dx > size / 2 ? dx - size : (dx < -size / 2 ? dx + size : dx);
      const wy = dy > size / 2 ? dy - size : (dy < -size / 2 ? dy + size : dy);
      const d2 = wx * wx + wy * wy; if (d2 < tmpMinDist[i]) tmpMinDist[i] = d2;
    }
  }
  updateDistances(first);
  for (let k = 1; k < TOTAL; k++) {
    let best = -1; let bestScore = -1;
    for (let i = 0; i < TOTAL; i++) { if (chosen[i]) continue; const score = tmpMinDist[i]; if (score > bestScore) { bestScore = score; best = i; } }
    chosen[best] = 1; order.push(best); updateDistances(best);
  }
  const ranking = new Uint16Array(TOTAL);
  for (let i = 0; i < order.length; i++) ranking[order[i]] = i;
  return ranking;
}

export const blueNoiseMask: Uint16Array = buildBlueNoiseRanking();
export function blueNoiseThreshold(x: number, y: number): number {
  const v = blueNoiseMask[(y % BLUE_NOISE_SIZE) * BLUE_NOISE_SIZE + (x % BLUE_NOISE_SIZE)];
  return v / (TOTAL - 1);
}

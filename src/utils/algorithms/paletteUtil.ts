export type RGB = [number, number, number];

// Clamp helper
const clamp255 = (v: number) => v < 0 ? 0 : (v > 255 ? 255 : v);

// Quantize a single pixel to nearest palette color (Euclidean) with optional bias added uniformly.
export function quantizeToPalette(r: number, g: number, b: number, palette: RGB[], bias: number = 0): RGB {
  if (!palette || palette.length === 0) return [clamp255(r), clamp255(g), clamp255(b)];
  r = clamp255(r + bias); g = clamp255(g + bias); b = clamp255(b + bias);
  let best = 0; let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const pr = palette[i][0], pg = palette[i][1], pb = palette[i][2];
    const dr = r - pr, dg = g - pg, db = b - pb; const d = dr * dr + dg * dg + db * db;
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return palette[best];
}

// Map gray (0..255) to a palette index using adjusted ordered cell value.
export function mapGrayWithCell(gray: number, cell: number, palette: RGB[], bias: number): RGB {
  const palSize = palette.length;
  const base = Math.max(0, Math.min(1, (gray / 255) + bias));
  const adj = base + (cell - 0.5) / palSize;
  let pi = Math.round(adj * (palSize - 1));
  if (pi < 0) pi = 0; else if (pi >= palSize) pi = palSize - 1;
  return palette[pi];
}

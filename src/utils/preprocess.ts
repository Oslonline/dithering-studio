export interface ToneParams {
  contrast: number;   // -100..100 (0 neutral)
  midtones: number;   // gamma 0.5..2.0 (1 neutral)
  highlights: number; // 0..100 (0 off)
}

export function clamp01(x: number) { return x < 0 ? 0 : x > 1 ? 1 : x; }
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function applyLuminancePreprocess(data: Uint8ClampedArray, { contrast, midtones, highlights }: ToneParams) {
  const cFactor = 1 + (isFinite(contrast) ? Math.max(-100, Math.min(100, contrast)) : 0) / 100;
  const gamma = isFinite(midtones) ? Math.max(0.5, Math.min(2, midtones)) : 1.0;
  const hAmt = (isFinite(highlights) ? Math.max(0, Math.min(100, highlights)) : 0) / 100;
  if (Math.abs(cFactor - 1) < 1e-3 && Math.abs(gamma - 1) < 1e-3 && hAmt < 1e-3) return; // no-op

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Rec. 601 luminance
    const L = 0.299 * r + 0.587 * g + 0.114 * b;
    const l0 = L / 255;
    // Contrast around mid-gray 0.5
    let l = 0.5 + (l0 - 0.5) * cFactor;
    l = clamp01(l);
    // Midtones via gamma (gamma>1 darkens; <1 brightens)
    l = Math.pow(l, gamma);
    // Highlights compression near the top end
    if (hAmt > 0) {
      const t = smoothstep(0.6, 1.0, l);
      const target = Math.pow(l, 1 + 1.5 * hAmt);
      l = l * (1 - t) + target * t;
    }
    const Lp = l * 255;
    const scale = L > 0.0001 ? (Lp / L) : 0;
    let nr = r * scale, ng = g * scale, nb = b * scale;
    if (nr < 0) nr = 0; else if (nr > 255) nr = 255;
    if (ng < 0) ng = 0; else if (ng > 255) ng = 255;
    if (nb < 0) nb = 0; else if (nb > 255) nb = 255;
    data[i] = nr; data[i + 1] = ng; data[i + 2] = nb; // alpha preserved
  }
}

import { AlgorithmRunContext } from './types';
import { quantizeToPalette } from './paletteUtil';
import { DEFAULT_ASCII_CELL_SIZE, normalizeAsciiCellSize } from './asciiPresets';

export const DEFAULT_ASCII_RAMP = '@%#*+=-:. ';

/**
 * Glyphs are vector text rasterized at this scale, then downsampled to output size.
 * Same idea as Figma: small on-canvas footprint, high-res glyph source.
 */
export const ASCII_GLYPH_SUPERSAMPLE = 8;

/** Monospace stack used for metrics + rendering (must match). */
const FONT_STACK = '"Courier New", Courier, "Liberation Mono", monospace';

const fontMetricsCache = new Map<number, number>();

function getCharWidth(fontSize: number): number {
  const cached = fontMetricsCache.get(fontSize);
  if (cached !== undefined) return cached;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return fontSize * 0.6;
  ctx.font = `${fontSize}px ${FONT_STACK}`;
  const w = ctx.measureText('M').width;
  fontMetricsCache.set(fontSize, w);
  return w;
}

function sampleLuminance(data: Uint8ClampedArray, offset: number): number {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rampIndexFromLuminance(
  lum: number,
  rampLen: number,
  bias: number,
  invert: boolean
): number {
  let L = lum;
  L = Math.max(0, Math.min(255, L + bias));
  const t = invert ? L / 255 : 1 - L / 255;
  return Math.min(rampLen - 1, Math.max(0, Math.round(t * (rampLen - 1))));
}

function averageLuminanceInRect(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number {
  let sum = 0;
  let count = 0;
  const xa = Math.max(0, Math.min(width, x0));
  const xb = Math.max(0, Math.min(width, x1));
  const ya = Math.max(0, Math.min(height, y0));
  const yb = Math.max(0, Math.min(height, y1));
  for (let y = ya; y < yb; y++) {
    for (let x = xa; x < xb; x++) {
      sum += sampleLuminance(srcData, (y * width + x) * 4);
      count++;
    }
  }
  return count ? sum / count : 0;
}

function configureTextContext(g: CanvasRenderingContext2D, fontSize: number) {
  g.font = `${fontSize}px ${FONT_STACK}`;
  g.textBaseline = 'top';
  g.textAlign = 'left';
  if ('letterSpacing' in g) {
    (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  }
  if ('fontKerning' in g) {
    (g as CanvasRenderingContext2D & { fontKerning: CanvasFontKerning }).fontKerning = 'none';
  }
}

// Measure relative darkness of glyphs to auto-order a ramp (returns dark->light order)
export function orderRampDarkToLight(raw: string): string {
  const unique = Array.from(new Set(raw.split('').filter((ch) => ch && ch !== '\n' && ch !== '\r')));
  if (unique.length <= 1) return unique.join('');
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return unique.join('');
  const metrics: { ch: string; d: number }[] = [];
  for (const ch of unique) {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';
    ctx.font = `bold ${size - 4}px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, size / 2, size / 2);
    const data = ctx.getImageData(0, 0, size, size).data;
    let dark = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 250) dark++;
    }
    metrics.push({ ch, d: dark / (size * size) });
  }
  metrics.sort((a, b) => b.d - a.d || a.ch.localeCompare(b.ch));
  return metrics.map((m) => m.ch).join('');
}

function renderAscii(
  g: CanvasRenderingContext2D,
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  ramp: string,
  rampLen: number,
  fontSize: number,
  charWidth: number,
  cols: number,
  rows: number,
  bias: number,
  invert: boolean,
  bg: string,
  monoFg: string,
  pal?: [number, number, number][]
) {
  const colBounds: number[] = [];
  for (let c = 0; c <= cols; c++) {
    colBounds.push(Math.min(width, Math.round(c * charWidth)));
  }
  const rowBounds: number[] = [];
  for (let r = 0; r <= rows; r++) {
    rowBounds.push(Math.min(height, r * fontSize));
  }

  g.fillStyle = bg;
  g.fillRect(0, 0, width, height);
  configureTextContext(g, fontSize);

  if (!pal || !pal.length) {
    for (let row = 0; row < rows; row++) {
      let line = '';
      for (let col = 0; col < cols; col++) {
        const lum = averageLuminanceInRect(
          srcData,
          width,
          height,
          colBounds[col],
          rowBounds[row],
          colBounds[col + 1],
          rowBounds[row + 1]
        );
        const idx = rampIndexFromLuminance(lum, rampLen, bias, invert);
        line += ramp[idx];
      }
      g.fillStyle = monoFg;
      g.fillText(line, 0, rowBounds[row]);
    }
    return;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lum = averageLuminanceInRect(
        srcData,
        width,
        height,
        colBounds[col],
        rowBounds[row],
        colBounds[col + 1],
        rowBounds[row + 1]
      );
      const idx = rampIndexFromLuminance(lum, rampLen, bias, invert);
      const ch = ramp[idx];
      if (ch === ' ' || ch === '\u00a0') continue;
      const bVal = 255 - (idx / Math.max(1, rampLen - 1)) * 255;
      const q = quantizeToPalette(bVal, bVal, bVal, pal, 0);
      g.fillStyle = `rgb(${q[0] | 0},${q[1] | 0},${q[2] | 0})`;
      g.fillText(ch, colBounds[col], rowBounds[row]);
    }
  }
}

export function runAsciiMosaic(ctx: AlgorithmRunContext) {
  const { srcData, width, height, params } = ctx;
  const ramp =
    params.asciiRamp && params.asciiRamp.length >= 2 ? params.asciiRamp : DEFAULT_ASCII_RAMP;
  const rampLen = ramp.length;
  const thresh = params.threshold ?? 128;
  const bias = ((thresh - 128) / 255) * 64;
  const pal = params.palette;
  const fontSize = normalizeAsciiCellSize(params.asciiCellSize ?? DEFAULT_ASCII_CELL_SIZE);
  const charWidth = getCharWidth(fontSize);
  const cols = Math.max(1, Math.floor(width / charWidth));
  const rows = Math.max(1, Math.floor(height / fontSize));
  const invert = !!params.invert;
  const bg = invert ? '#ffffff' : '#000000';
  const monoFg = invert ? '#000000' : '#ffffff';
  const ss = ASCII_GLYPH_SUPERSAMPLE;

  const hi = document.createElement('canvas');
  hi.width = width * ss;
  hi.height = height * ss;
  const hg = hi.getContext('2d');
  if (!hg) return new Uint8ClampedArray(srcData);

  hg.scale(ss, ss);
  renderAscii(
    hg,
    srcData,
    width,
    height,
    ramp,
    rampLen,
    fontSize,
    charWidth,
    cols,
    rows,
    bias,
    invert,
    bg,
    monoFg,
    pal
  );

  return hg.getImageData(0, 0, width * ss, height * ss);
}

export default runAsciiMosaic;

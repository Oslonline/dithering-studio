import { AlgorithmRunContext } from './types';
import { quantizeToPalette } from './paletteUtil';

export const DEFAULT_ASCII_RAMP = '@%#*+=-:. ';

// Measure relative darkness of glyphs to auto-order a ramp (returns dark->light order)
export function orderRampDarkToLight(raw: string): string {
    const unique = Array.from(new Set(raw.split('').filter(ch => ch && ch !== '\n' && ch !== '\r')));
    if (unique.length <= 1) return unique.join('');
    // Canvas to measure fill ratio
    const size = 24;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return unique.join('');
    const metrics: { ch: string; d: number }[] = [];
    for (const ch of unique) {
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000';
        ctx.font = `${size - 2}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch, size / 2, size / 2 + 0.5);
        const data = ctx.getImageData(0, 0, size, size).data;
        let dark = 0; let total = 0;
        for (let i = 0; i < data.length; i += 4) {
            const v = data[i];
            if (v < 250) dark++;
            total++;
        }
        const density = dark / total;
        metrics.push({ ch, d: density });
    }
    metrics.sort((a, b) => b.d - a.d || a.ch.localeCompare(b.ch));
    return metrics.map(m => m.ch).join('');
}

const CELL_SIZE = 10; // character cell size (px)

export function runAsciiMosaic(ctx: AlgorithmRunContext) {
    const { srcData, width, height, params } = ctx;
    const ramp = (params.asciiRamp && params.asciiRamp.length >= 2 ? params.asciiRamp : DEFAULT_ASCII_RAMP);
    const rampLen = ramp.length;
    const thresh = params.threshold ?? 128;
    const bias = ((thresh - 128) / 255) * 64;
    const pal = params.palette;
    const cols = Math.ceil(width / CELL_SIZE);
    const rows = Math.ceil(height / CELL_SIZE);

    const off = document.createElement('canvas');
    off.width = width; off.height = height;
    const g = off.getContext('2d');
    if (!g) return new Uint8ClampedArray(srcData);
    g.fillStyle = params.invert ? '#fff' : '#000';
    g.fillRect(0, 0, width, height);
    g.font = `${CELL_SIZE}px monospace`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const bx = c * CELL_SIZE;
            const by = r * CELL_SIZE;
            let sum = 0; let count = 0;
            for (let y = 0; y < CELL_SIZE; y++) {
                const ny = by + y; if (ny >= height) break;
                for (let x = 0; x < CELL_SIZE; x++) {
                    const nx = bx + x; if (nx >= width) break;
                    const i = (ny * width + nx) * 4;
                    sum += srcData[i];
                    count++;
                }
            }
            if (!count) continue;
            let avg = sum / count;
            if (params.invert) avg = 255 - avg;
            avg = Math.max(0, Math.min(255, avg + bias));
            const idx = Math.min(rampLen - 1, Math.max(0, Math.round(((255 - avg) / 255) * (rampLen - 1))));
            const ch = ramp[idx];
            if (pal && pal.length) {
                const bVal = 255 - (idx / (rampLen - 1)) * 255;
                const q = quantizeToPalette(bVal, bVal, bVal, pal, 0);
                g.fillStyle = `rgb(${q[0] | 0},${q[1] | 0},${q[2] | 0})`;
            } else {
                g.fillStyle = params.invert ? '#000' : '#fff';
            }
            g.fillText(ch, bx + CELL_SIZE / 2, by + CELL_SIZE / 2 + 0.5);
        }
    }
    const data = g.getImageData(0, 0, width, height).data;
    return new Uint8ClampedArray(data);
}

export default runAsciiMosaic;

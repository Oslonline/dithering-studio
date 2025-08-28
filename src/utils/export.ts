// Canvas export helpers (SVG run-length rectangles)

export interface CanvasToSVGOptions { mergeRuns?: boolean; maxElementsWarn?: number; }

export function canvasToSVG(canvas: HTMLCanvasElement, opts: CanvasToSVGOptions = {}): { svg: string; elements: number; } {
  const { mergeRuns = true, maxElementsWarn = 200000 } = opts;
  const w = canvas.width; const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  const id = ctx.getImageData(0,0,w,h);
  const d = id.data;
  let elements = 0;
  let body: string[] = [];
  for (let y=0; y<h; y++) {
    if (mergeRuns) {
      let runColor: string | null = null; let runStart = 0;
      const flush = (xEnd: number) => {
        if (runColor == null) return;
        const width = xEnd - runStart;
        body.push(`<rect x="${runStart}" y="${y}" width="${width}" height="1" fill="${runColor}" />`);
        elements++;
      };
      for (let x=0; x<w; x++) {
        const i = (y*w + x)*4;
        const a = d[i+3];
        if (a === 0) { // treat transparent as skip; flush current run
          if (runColor !== null) { flush(x); runColor = null; }
          continue;
        }
        const r = d[i]; const g = d[i+1]; const b = d[i+2];
        const col = rgbToHex(r,g,b);
        if (col !== runColor) {
          if (runColor !== null) flush(x);
          runColor = col; runStart = x;
        }
      }
      if (runColor !== null) flush(w);
    } else {
      for (let x=0; x<w; x++) {
        const i = (y*w + x)*4; const a = d[i+3]; if (a === 0) continue;
        const r = d[i]; const g = d[i+1]; const b = d[i+2];
        body.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${rgbToHex(r,g,b)}" />`);
        elements++;
      }
    }
  }
  if (elements > maxElementsWarn) {
    // eslint-disable-next-line no-console
    console.warn(`SVG export contains ${elements} elements which may be large.`);
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">\n${body.join('\n')}\n</svg>`;
  return { svg, elements };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + toHex(r) + toHex(g) + toHex(b);
}
function toHex(n: number): string { const s = n.toString(16); return s.length===1 ? '0'+s : s; }

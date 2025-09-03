import { AlgorithmRunContext } from './types';

// Generic error diffusion kernel runner (non-serpentine by default unless specified)
export function createErrorDiffusionKernelRunner(matrix: number[][], divisor: number, serpentineDefault = false) {
  return function runKernel({ srcData, width, height, params }: AlgorithmRunContext) {
    const out = new Uint8ClampedArray(srcData);
    const pal = params.palette;
    const palLums = pal ? pal.map(c=>0.299*c[0]+0.587*c[1]+0.114*c[2]) : null;
    // For palette mode, apply a scaled bias (similar magnitude to FS impl). For grayscale, threshold directly sets cut point.
    const paletteBias = ((params.threshold ?? 128) - 128) / 255 * 64; // roughly -32..+32
    const useSerpentine = params.serpentine ?? serpentineDefault;
    for (let y=0; y<height; y++) {
      const leftToRight = !useSerpentine || y % 2 === 0;
      for (let xi = leftToRight ? 0 : width-1; leftToRight ? xi < width : xi >= 0; leftToRight ? xi++ : xi--) {
        const x = xi;
        const idx = (y*width + x)*4;
        const oldLum = out[idx];
        let newLum:number; let r:number; let g:number; let b:number;
        if (pal && palLums) {
          const biased = Math.max(0, Math.min(255, oldLum + paletteBias));
          let bestI=0; let bestD=Infinity;
          for (let i=0;i<palLums.length;i++) { const d = Math.abs(palLums[i] - biased); if (d < bestD) { bestD = d; bestI = i; } }
          const c = pal[bestI]; r=c[0]; g=c[1]; b=c[2]; newLum = palLums[bestI];
        } else {
          newLum = oldLum < (params.threshold ?? 128) ? 0 : 255; r=g=b=newLum;
        }
        const err = oldLum - newLum;
        out[idx]=r; out[idx+1]=g; out[idx+2]=b;
        for (let j=0;j<matrix.length;j++) {
          for (let i=0;i<matrix[j].length;i++) {
            const w = matrix[j][i]; if (!w) continue;
            const dx = i - Math.floor(matrix[j].length/2);
            const dy = j;
            const nx = x + (leftToRight ? dx : -dx);
            const ny = y + dy;
            if (nx>=0 && nx<width && ny>=0 && ny<height) {
              const nIdx = (ny*width + nx)*4;
              const diff = (err * w)/divisor;
              out[nIdx] += diff; out[nIdx+1] += diff; out[nIdx+2] += diff;
            }
          }
        }
      }
    }
    if (params.invert && !pal) {
      for (let i=0;i<out.length;i+=4) { out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; }
    }
    return out;
  };
}

// Stevenson–Arce & similar need large sparse kernels; we just reuse the generic runner.

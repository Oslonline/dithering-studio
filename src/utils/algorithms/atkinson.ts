import { AlgorithmRunContext } from './types';

export default function runAtkinson({ srcData, width, height, params }: AlgorithmRunContext) {
  const out = new Uint8ClampedArray(srcData);
  const pal = params.palette;
  const palLums = pal ? pal.map(c => 0.299*c[0]+0.587*c[1]+0.114*c[2]) : null;
  const paletteBias = ((params.threshold ?? 128) - 128)/255 * 64; // mirror FS scaling
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pxIndex = (y * width + x) * 4;
      const origLum = out[pxIndex];
      let newLum: number; let setR: number; let setG: number; let setB: number;
      if (pal && palLums) {
        const biased = Math.max(0, Math.min(255, origLum + paletteBias));
        let bestI=0; let bestD=Infinity;
        for (let i=0;i<palLums.length;i++){ const d=Math.abs(palLums[i]-biased); if(d<bestD){bestD=d;bestI=i;} }
        const c=pal[bestI]; setR=c[0]; setG=c[1]; setB=c[2]; newLum=palLums[bestI];
      } else {
        newLum = origLum < (params.threshold ?? 128) ? 0 : 255; setR=setG=setB=newLum;
      }
      const error = (origLum - newLum) / 8; // diffuse error from original sample
      out[pxIndex]=setR; out[pxIndex+1]=setG; out[pxIndex+2]=setB;
      const coords = [ [x + 1, y], [x + 2, y], [x - 1, y + 1], [x, y + 1], [x + 1, y + 1], [x, y + 2] ];
      for (const [nx, ny] of coords) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = (ny * width + nx) * 4;
          out[nIdx] += error; out[nIdx + 1] += error; out[nIdx + 2] += error;
        }
      }
    }
  }
  if (params.invert) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = 255 - out[i]; out[i+1] = 255 - out[i+1]; out[i+2] = 255 - out[i+2];
    }
  }
  return out;
}

import { AlgorithmRunContext } from './types';

export default function runBayer4({ srcData, width, height, params }: AlgorithmRunContext) {
  const bayerMatrix = [ [0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5] ];
  const matrixSize = 4; const scaleFactor = 16; const out = new Uint8ClampedArray(srcData); const pal = params.palette; const userT = params.threshold ?? 128; const bias = ((userT)-128)/255*2;
  for (let y=0;y<height;y++) {
    for (let x=0;x<width;x++) {
      const idx=(y*width+x)*4; const brightness=out[idx];
      if (pal && pal.length) {
        const cell = bayerMatrix[y % matrixSize][x % matrixSize] / (scaleFactor - 1);
        const base = Math.max(0, Math.min(1, (brightness/255)+bias));
        const adj = base + (cell - 0.5) / pal.length;
        let pi = Math.round(adj * (pal.length - 1)); if (pi<0) pi=0; else if (pi>=pal.length) pi=pal.length-1;
        const c = pal[pi]; out[idx]=c[0]; out[idx+1]=c[1]; out[idx+2]=c[2];
      } else {
        const matrixT=(bayerMatrix[y%matrixSize][x%matrixSize]/scaleFactor)*255; let t = matrixT + (userT-128); if(t<0)t=0; else if(t>255)t=255; const v= brightness < t ? 0:255; out[idx]=out[idx+1]=out[idx+2]=v;
      }
      out[idx+3]=255;
    }
  }
  if (params.invert && !pal) { for (let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out;
}

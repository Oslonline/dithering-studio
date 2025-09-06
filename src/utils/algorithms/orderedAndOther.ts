import { AlgorithmRunContext } from './types';
import { blueNoiseThreshold } from './blueNoise';
import { mapGrayWithCell, quantizeToPalette } from './paletteUtil';

export function runBlueNoise(ctx: AlgorithmRunContext) {
  const { srcData,width,height,params }=ctx; const out=new Uint8ClampedArray(srcData); const pal=params.palette; const userT=params.threshold ?? 128; const bias=((userT)-128)/255*2;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){ const idx=(y*width+x)*4; const g=out[idx]; const cell=blueNoiseThreshold(x,y); if(pal&&pal.length){ const c=mapGrayWithCell(g,cell,pal,bias); out[idx]=c[0]; out[idx+1]=c[1]; out[idx+2]=c[2]; } else { const matrixT=cell*255; let t=matrixT + (userT-128); if(t<0)t=0; else if(t>255)t=255; const v=g<t?0:255; out[idx]=out[idx+1]=out[idx+2]=v; } out[idx+3]=255; }
  if (params.invert && !pal){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out;
}

export function runBinaryThreshold(ctx: AlgorithmRunContext) {
  const { srcData, params }=ctx; const out=new Uint8ClampedArray(srcData); let pal=params.palette; const thresh = params.threshold ?? 128;
  if (pal && pal.length >= 2) {
    if (pal.length > 2) pal = pal.slice(0,2);
    const c0 = pal[0]; const c1 = pal[1];
    for(let i=0;i<out.length;i+=4){ let v = out[i]; if(params.invert) v = 255 - v; const chooseFirst = v < thresh; const c = chooseFirst ? c0 : c1; out[i]=c[0]; out[i+1]=c[1]; out[i+2]=c[2]; out[i+3]=255; }
    return out;
  }
  for(let i=0;i<out.length;i+=4){ const v= out[i] < thresh ? 0:255; out[i]=out[i+1]=out[i+2]=v; out[i+3]=255; }
  if(params.invert){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out; }

export function runRandomThreshold(ctx: AlgorithmRunContext) {
  const { srcData,width,height,params }=ctx; const out=new Uint8ClampedArray(srcData); const userT=params.threshold ?? 128; let pal=params.palette;
  if (pal && pal.length >= 2) {
    if (pal.length > 2) pal = pal.slice(0,2);
    const c0 = pal[0]; const c1 = pal[1];
    const pivot = userT / 255; // 0..1
    for (let y=0;y<height;y++) for(let x=0;x<width;x++){
      const i=(y*width+x)*4; let g=out[i]; if(params.invert) g = 255 - g; const normalized = g/255; const r=Math.random(); const mix=(normalized + r)/2; const chooseFirst = mix < pivot; const c = chooseFirst ? c0 : c1; out[i]=c[0]; out[i+1]=c[1]; out[i+2]=c[2]; out[i+3]=255; }
    return out;
  }
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){ const i=(y*width+x)*4; let g=out[i]; if(params.invert) g=255-g; const pivot=userT/255; const r=Math.random(); const normalized=g/255; const mix=(normalized + r)/2; const bw = mix < pivot ? 0:255; out[i]=out[i+1]=out[i+2]=bw; out[i+3]=255; }
  if(params.invert){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out; }

export function runDotDiffusionSimple(ctx: AlgorithmRunContext) {
  const { srcData,width,height,params }=ctx; const out=new Uint8ClampedArray(srcData); const pal=params.palette; const t=params.threshold ?? 128;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){ const i=(y*width+x)*4; let g=out[i]; if(params.invert) g=255-g; const mask=((x&1)^(y&1))? t : 255-t; const bw= g < mask ? 0:255; if(pal&&pal.length){ const [r,gc,bc]=quantizeToPalette(bw,bw,bw,pal,0); out[i]=r; out[i+1]=gc; out[i+2]=bc; } else { out[i]=out[i+1]=out[i+2]=bw; } out[i+3]=255; }
  if(!pal||!pal.length){ if(params.invert){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } } }
  return out; }

export function runHalftone(ctx: AlgorithmRunContext) {
  const { srcData,width,height,params }=ctx; const out=new Uint8ClampedArray(srcData); const dotSize=6; const thresh=params.threshold ?? 128;
  for(let y=0;y<height;y+=dotSize){ for(let x=0;x<width;x+=dotSize){ let sum=0; let count=0; for(let dy=0;dy<dotSize;dy++) for(let dx=0;dx<dotSize;dx++){ const nx=x+dx; const ny=y+dy; if(nx<width && ny<height){ const i=(ny*width+nx)*4; sum+=out[i]; count++; } } const avg=sum/count; const isDot=avg < thresh; for(let dy=0;dy<dotSize;dy++) for(let dx=0;dx<dotSize;dx++){ const nx=x+dx; const ny=y+dy; if(nx<width && ny<height){ const i=(ny*width+nx)*4; const cx=dotSize/2-0.5; const cy=dotSize/2-0.5; const dist=Math.sqrt((dx-cx)**2+(dy-cy)**2); const radius=isDot? dotSize/2.2 : dotSize/3.5; const v= dist < radius ? 0:255; out[i]=out[i+1]=out[i+2]=v; out[i+3]=255; } } } }
  if(params.invert){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out; }

export function runFalseFloydSteinberg(ctx: AlgorithmRunContext) {
  const { srcData,width,height,params }=ctx; const out=new Uint8ClampedArray(srcData); const serp=!!params.serpentine; const thresh=params.threshold ?? 128;
  const distribute=(x:number,y:number,err:number,l2r:boolean)=>{ if(l2r){ if(x+1<width){ const i=(y*width+(x+1))*4; out[i]+= (err*3)/8; out[i+1]+= (err*3)/8; out[i+2]+=(err*3)/8; } if(y+1<height){ { const i=((y+1)*width+x)*4; out[i]+= (err*3)/8; out[i+1]+= (err*3)/8; out[i+2]+=(err*3)/8; } if(x+1<width){ const i=((y+1)*width+(x+1))*4; out[i]+= (err*2)/8; out[i+1]+= (err*2)/8; out[i+2]+=(err*2)/8; } } } else { if(x-1>=0){ const i=(y*width+(x-1))*4; out[i]+= (err*3)/8; out[i+1]+= (err*3)/8; out[i+2]+=(err*3)/8; } if(y+1<height){ { const i=((y+1)*width+x)*4; out[i]+= (err*3)/8; out[i+1]+= (err*3)/8; out[i+2]+=(err*3)/8; } if(x-1>=0){ const i=((y+1)*width+(x-1))*4; out[i]+= (err*2)/8; out[i+1]+= (err*2)/8; out[i+2]+=(err*2)/8; } } } };
  for(let y=0;y<height;y++){ const l2r = !serp || y%2===0; if(l2r){ for(let x=0;x<width;x++){ const idx=(y*width+x)*4; const oldV=out[idx]; const newV= oldV < thresh ? 0:255; const err=oldV-newV; out[idx]=out[idx+1]=out[idx+2]=newV; distribute(x,y,err,true);} } else { for(let x=width-1;x>=0;x--){ const idx=(y*width+x)*4; const oldV=out[idx]; const newV= oldV < thresh ? 0:255; const err=oldV-newV; out[idx]=out[idx+1]=out[idx+2]=newV; distribute(x,y,err,false);} } }
  if (params.invert){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out;
}

export function runAdaptiveOstromoukhov(ctx: AlgorithmRunContext) {
  const { srcData,width,height,params }=ctx; const out=new Uint8ClampedArray(srcData); const thresh=params.threshold ?? 128; const kernels:{w:number[]}[]=[ {w:[7,3,5,1]},{w:[5,3,3,1]},{w:[4,3,2,1]},{w:[3,2,2,1]},{w:[2,2,1,1]} ];
  for(let y=0;y<height;y++){ const serp=params.serpentine && (y%2===1); for(let xi=0; xi<width; xi++){ const x=serp? (width-1-xi):xi; const idx=(y*width+x)*4; const old=out[idx]; const neu= old < thresh ? 0:255; const err=old-neu; out[idx]=out[idx+1]=out[idx+2]=neu; const bucket=Math.min(4,Math.max(0,Math.floor(old/51))); const weights=kernels[bucket].w; const denom=weights.reduce((a,b)=>a+b,0); const coords=serp ? [[x-1,y],[x-2,y],[x,y+1],[x-1,y+1]] : [[x+1,y],[x+2,y],[x,y+1],[x+1,y+1]]; for(let c=0;c<coords.length;c++){ const [nx,ny]=coords[c]; if(nx>=0&&nx<width&&ny>=0&&ny<height){ const nIdx=(ny*width+nx)*4; const dif=(err*weights[c])/denom; out[nIdx]+=dif; out[nIdx+1]+=dif; out[nIdx+2]+=dif; } } } }
  if(params.invert){ for(let i=0;i<out.length;i+=4){ out[i]=255-out[i]; out[i+1]=255-out[i+1]; out[i+2]=255-out[i+2]; } }
  return out;
}

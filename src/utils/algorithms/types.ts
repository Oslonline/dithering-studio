export interface DitherParams {
  pattern: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  isErrorDiffusion: boolean;
  palette?: [number, number, number][];
}

export interface AlgorithmRunContext {
  srcData: Uint8ClampedArray;
  width: number;
  height: number;
  params: DitherParams;
}

export type AlgorithmRunner = (ctx: AlgorithmRunContext) => Uint8ClampedArray | ImageData;

export interface AlgorithmMeta {
  id: number;
  name: string;
  category: string;
  supportsThreshold: boolean;
  orderKey?: string;
  run: AlgorithmRunner;
}

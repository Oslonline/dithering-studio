export interface DitherParams {
  pattern: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  isErrorDiffusion: boolean;
  palette?: [number, number, number][];
}

export interface DitherRequestMessage {
  id: number;
  type: 'dither';
  width: number;
  height: number;
  data: ArrayBuffer; // RGBA Uint8ClampedArray buffer
  params: DitherParams;
}

export interface DitherCancelMessage {
  id: number; // job id to cancel (or last if matches current)
  type: 'cancel';
}

export interface DitherProgressMessage {
  id: number;
  type: 'progress';
  y: number;
  total: number;
}

export interface DitherResultMessage {
  id: number;
  type: 'result';
  width: number;
  height: number;
  data: ArrayBuffer; // RGBA data
  duration: number;
}

export type WorkerInbound = DitherRequestMessage | DitherCancelMessage;
export type WorkerOutbound = DitherProgressMessage | DitherResultMessage;

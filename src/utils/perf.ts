export interface PerfPhaseDurations { [label: string]: number; }
export interface PerfFrame { token: number; started: number; phases: PerfPhaseDurations; total?: number; seq: number; }
type Listener = (frames: PerfFrame[]) => void;

class PerfTracker {
  private frames: PerfFrame[] = [];
  private listeners: Set<Listener> = new Set();
  private activeFrame: PerfFrame | null = null;
  private phaseStarts: Map<string, number> = new Map();
  private seq = 0;
  private maxFrames = 40;
  newFrame(token: number) { this.flushActive(); this.activeFrame = { token, started: now(), phases: {}, seq: ++this.seq }; this.phaseStarts.clear(); }
  phaseStart(label: string) { if (!this.activeFrame) return; this.phaseStarts.set(label, now()); }
  phaseEnd(label: string) { if (!this.activeFrame) return; const s = this.phaseStarts.get(label); if (s==null) return; const dur = now()-s; this.activeFrame.phases[label] = (this.activeFrame.phases[label]||0)+dur; this.phaseStarts.delete(label);}  
  mark(label: string) { if (!this.activeFrame) return; this.activeFrame.phases[label] = this.activeFrame.phases[label] || 0; }
  endFrame() { this.flushActive(); }
  private flushActive() { if (this.activeFrame) { const nowTs = now(); for (const [l,s] of this.phaseStarts.entries()) { this.activeFrame.phases[l] = (this.activeFrame.phases[l]||0)+(nowTs - s); } this.phaseStarts.clear(); this.activeFrame.total = nowTs - this.activeFrame.started; this.frames.push(this.activeFrame); if (this.frames.length>this.maxFrames) this.frames.splice(0, this.frames.length - this.maxFrames); this.activeFrame = null; this.emit(); } }
  getFrames() { return this.frames.slice(); }
  subscribe(fn: Listener) { this.listeners.add(fn); try { fn(this.getFrames()); } catch {} return () => { this.listeners.delete(fn); }; }
  private emit() { for (const l of this.listeners) { try { l(this.getFrames()); } catch {} } }
  reset() { this.frames = []; this.activeFrame = null; this.phaseStarts.clear(); this.seq = 0; this.emit(); }
}

function now(): number { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }

const perfTracker = new PerfTracker();
export const perf = { newFrame: (t:number)=>perfTracker.newFrame(t), phaseStart:(l:string)=>perfTracker.phaseStart(l), phaseEnd:(l:string)=>perfTracker.phaseEnd(l), mark:(l:string)=>perfTracker.mark(l), endFrame:()=>perfTracker.endFrame(), subscribe:(fn:Listener)=>perfTracker.subscribe(fn), getFrames:()=>perfTracker.getFrames(), reset:()=>perfTracker.reset() };
export type { Listener as PerfListener };

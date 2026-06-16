export interface AsciiRampPreset {
  id: string;
  ramp: string;
}

export const ASCII_RAMP_PRESETS: AsciiRampPreset[] = [
  { id: "classic", ramp: "@%#*+=-:. " },
  { id: "minimal", ramp: "@#. " },
  { id: "blocks", ramp: "█▓▒░ " },
  { id: "binary", ramp: "@ " },
  {
    id: "dense",
    ramp: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft|()1{}[]?-_+~<>i!lI;:,\"^'. ",
  },
  { id: "dots", ramp: "●◐◑○· " },
  { id: "slashes", ramp: "#/\\|-_ " },
  { id: "numbers", ramp: "9876543210 " },
];

export const DEFAULT_ASCII_CELL_SIZE = 10;

export function normalizeAsciiCellSize(value?: number): number {
  const n = value ?? DEFAULT_ASCII_CELL_SIZE;
  return Math.max(4, Math.min(24, Math.round(n)));
}

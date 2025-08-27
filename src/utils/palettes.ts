// Predefined color palettes (RGB arrays)
export interface PaletteDef {
  id: string;
  name: string;
  colors: [number, number, number][]; // RGB triplets 0-255
}

export const predefinedPalettes: PaletteDef[] = [
  {
    id: "gb",
    name: "Game Boy (4)",
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  {
    id: "gray4",
    name: "Grayscale (4)",
    colors: [
      [0, 0, 0],
      [85, 85, 85],
      [170, 170, 170],
      [255, 255, 255],
    ],
  },
  {
    id: "gray8",
    name: "Grayscale (8)",
    colors: Array.from({ length: 8 }, (_, i) => {
      const v = Math.round((i / 7) * 255);
      return [v, v, v] as [number, number, number];
    }),
  },
  {
    id: "c64",
    name: "C64 (subset)",
    colors: [
      [0, 0, 0],
      [255, 255, 255],
      [136, 0, 0],
      [170, 255, 238],
      [204, 68, 204],
      [0, 204, 85],
      [0, 0, 170],
      [238, 238, 119],
      [221, 136, 85],
      [102, 68, 0],
      [255, 119, 119],
      [51, 51, 51],
      [119, 119, 119],
      [170, 255, 102],
      [0, 136, 255],
      [187, 187, 187],
    ],
  },
  {
    id: "websafe16",
    name: "Web Safe (16)",
    colors: [
      [0, 0, 0],
      [128, 0, 0],
      [0, 128, 0],
      [128, 128, 0],
      [0, 0, 128],
      [128, 0, 128],
      [0, 128, 128],
      [192, 192, 192],
      [128, 128, 128],
      [255, 0, 0],
      [0, 255, 0],
      [255, 255, 0],
      [0, 0, 255],
      [255, 0, 255],
      [0, 255, 255],
      [255, 255, 255],
    ],
  },
];

export const findPalette = (id: string | null): PaletteDef | null => {
  if (!id) return null;
  return predefinedPalettes.find((p) => p.id === id) || null;
};

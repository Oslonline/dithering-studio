import { describe, it, expect } from "vitest";
import {
  type PaletteDef,
  predefinedPalettes,
  findPalette,
} from "../../utils/palettes";

describe("Palettes Utility", () => {
  describe("predefinedPalettes", () => {
    it("should have at least 10 palettes", () => {
      expect(predefinedPalettes.length).toBeGreaterThanOrEqual(10);
    });

    it("should have all required properties on each palette", () => {
      predefinedPalettes.forEach((palette) => {
        expect(palette).toHaveProperty("id");
        expect(palette).toHaveProperty("name");
        expect(palette).toHaveProperty("colors");
        expect(typeof palette.id).toBe("string");
        expect(typeof palette.name).toBe("string");
        expect(Array.isArray(palette.colors)).toBe(true);
      });
    });

    it("should have unique IDs for all palettes", () => {
      const ids = predefinedPalettes.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have non-empty names for all palettes", () => {
      predefinedPalettes.forEach((palette) => {
        expect(palette.name.length).toBeGreaterThan(0);
      });
    });

    it("should have at least 2 colors in each palette", () => {
      predefinedPalettes.forEach((palette) => {
        expect(palette.colors.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should have valid RGB tuples in each palette", () => {
      predefinedPalettes.forEach((palette) => {
        palette.colors.forEach((color) => {
          expect(Array.isArray(color)).toBe(true);
          expect(color.length).toBe(3);

          const [r, g, b] = color;
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThanOrEqual(255);
          expect(g).toBeGreaterThanOrEqual(0);
          expect(g).toBeLessThanOrEqual(255);
          expect(b).toBeGreaterThanOrEqual(0);
          expect(b).toBeLessThanOrEqual(255);
        });
      });
    });
  });

  describe("Specific Palettes", () => {
    it("should have Game Boy palette with 4 colors", () => {
      const gb = findPalette("gb");
      expect(gb).not.toBeNull();
      expect(gb?.colors.length).toBe(4);
      expect(gb?.name).toContain("Game Boy");
    });

    it("should have NES palette with 56 colors", () => {
      const nes = findPalette("nes");
      expect(nes).not.toBeNull();
      expect(nes?.colors.length).toBe(56);
      expect(nes?.name).toContain("NES");
    });

    it("should have PICO-8 palette with 16 colors", () => {
      const pico8 = findPalette("pico8");
      expect(pico8).not.toBeNull();
      expect(pico8?.colors.length).toBe(16);
      expect(pico8?.name).toContain("PICO-8");
    });

    it("should have DawnBringer 16 palette", () => {
      const db16 = findPalette("db16");
      expect(db16).not.toBeNull();
      expect(db16?.colors.length).toBe(16);
      expect(db16?.name).toContain("DawnBringer 16");
    });

    it("should have DawnBringer 32 palette", () => {
      const db32 = findPalette("db32");
      expect(db32).not.toBeNull();
      expect(db32?.colors.length).toBe(32);
      expect(db32?.name).toContain("DawnBringer 32");
    });

    it("should have CGA palette with 16 colors", () => {
      const cga = findPalette("cga16");
      expect(cga).not.toBeNull();
      expect(cga?.colors.length).toBe(16);
      expect(cga?.name).toContain("CGA");
    });

    it("should have EGA palette with 16 colors", () => {
      const ega = findPalette("ega16");
      expect(ega).not.toBeNull();
      expect(ega?.colors.length).toBe(16);
      expect(ega?.name).toContain("EGA");
    });

    it("should have Solarized palette with 16 colors", () => {
      const solarized = findPalette("solarized");
      expect(solarized).not.toBeNull();
      expect(solarized?.colors.length).toBe(16);
      expect(solarized?.name).toContain("Solarized");
    });

    it("should have Grayscale 4 palette", () => {
      const gray4 = findPalette("gray4");
      expect(gray4).not.toBeNull();
      expect(gray4?.colors.length).toBe(4);
      expect(gray4?.name).toContain("Grayscale");

      // Verify it's actually grayscale (R=G=B for all colors)
      gray4?.colors.forEach((color) => {
        const [r, g, b] = color;
        expect(r).toBe(g);
        expect(g).toBe(b);
      });
    });

    it("should have Grayscale 8 palette", () => {
      const gray8 = findPalette("gray8");
      expect(gray8).not.toBeNull();
      expect(gray8?.colors.length).toBe(8);

      // Verify it's actually grayscale
      gray8?.colors.forEach((color) => {
        const [r, g, b] = color;
        expect(r).toBe(g);
        expect(g).toBe(b);
      });

      // Verify gradual progression from black to white
      const values = gray8?.colors.map((c) => c[0]) || [];
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });

    it("should have C64 palette with 16 colors", () => {
      const c64 = findPalette("c64");
      expect(c64).not.toBeNull();
      expect(c64?.colors.length).toBe(16);
      expect(c64?.name).toContain("C64");
    });

    it("should have Web Safe 16 palette", () => {
      const websafe = findPalette("websafe16");
      expect(websafe).not.toBeNull();
      expect(websafe?.colors.length).toBe(16);
      expect(websafe?.name).toContain("Web Safe");
    });
  });

  describe("Palette Color Validation", () => {
    it("should have Game Boy palette with correct classic colors", () => {
      const gb = findPalette("gb");
      expect(gb?.colors[0]).toEqual([15, 56, 15]); // Darkest green
      expect(gb?.colors[3]).toEqual([155, 188, 15]); // Lightest green
    });

    it("should have PICO-8 palette starting with black", () => {
      const pico8 = findPalette("pico8");
      expect(pico8?.colors[0]).toEqual([0, 0, 0]); // Black
    });

    it("should have Grayscale 4 with black and white extremes", () => {
      const gray4 = findPalette("gray4");
      expect(gray4?.colors[0]).toEqual([0, 0, 0]); // Black
      expect(gray4?.colors[3]).toEqual([255, 255, 255]); // White
    });

    it("should have no duplicate colors in small palettes", () => {
      const smallPalettes = ["gb", "gray4", "pico8"];

      smallPalettes.forEach((id) => {
        const palette = findPalette(id);
        const colorStrings = palette?.colors.map((c) => c.join(",")) || [];
        const uniqueColors = new Set(colorStrings);
        expect(uniqueColors.size).toBe(colorStrings.length);
      });
    });
  });

  describe("findPalette", () => {
    it("should return null for null input", () => {
      expect(findPalette(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(findPalette(undefined as any)).toBeNull();
    });

    it("should return null for non-existent palette ID", () => {
      expect(findPalette("non-existent-palette")).toBeNull();
      expect(findPalette("unknown")).toBeNull();
      expect(findPalette("")).toBeNull();
    });

    it("should find palette by exact ID match", () => {
      const gb = findPalette("gb");
      expect(gb).not.toBeNull();
      expect(gb?.id).toBe("gb");
    });

    it("should be case-sensitive", () => {
      expect(findPalette("GB")).toBeNull(); // Should not find "gb"
      expect(findPalette("PICO8")).toBeNull(); // Should not find "pico8"
    });

    it("should find all predefined palettes by ID", () => {
      predefinedPalettes.forEach((palette) => {
        const found = findPalette(palette.id);
        expect(found).not.toBeNull();
        expect(found?.id).toBe(palette.id);
        expect(found?.name).toBe(palette.name);
        expect(found?.colors).toEqual(palette.colors);
      });
    });

    it("should return reference to palette, not a copy", () => {
      const gb1 = findPalette("gb");
      const gb2 = findPalette("gb");
      expect(gb1).toBe(gb2); // Same reference
    });
  });

  describe("Palette Type Safety", () => {
    it("should satisfy PaletteDef interface", () => {
      const testPalette: PaletteDef = {
        id: "test",
        name: "Test Palette",
        colors: [
          [255, 0, 0],
          [0, 255, 0],
          [0, 0, 255],
        ],
      };

      expect(testPalette.id).toBe("test");
      expect(testPalette.name).toBe("Test Palette");
      expect(testPalette.colors.length).toBe(3);
    });

    it("should enforce RGB tuple structure", () => {
      predefinedPalettes.forEach((palette) => {
        palette.colors.forEach((color) => {
          // TypeScript enforces this at compile-time, but we verify at runtime
          const [r, g, b] = color;
          expect(typeof r).toBe("number");
          expect(typeof g).toBe("number");
          expect(typeof b).toBe("number");
        });
      });
    });
  });

  describe("Palette Size Variety", () => {
    it("should have palettes with different sizes", () => {
      const sizes = new Set(predefinedPalettes.map((p) => p.colors.length));
      expect(sizes.size).toBeGreaterThan(3); // At least 4 different sizes
    });

    it("should have at least one 4-color palette", () => {
      const has4Colors = predefinedPalettes.some((p) => p.colors.length === 4);
      expect(has4Colors).toBe(true);
    });

    it("should have at least one 16-color palette", () => {
      const has16Colors = predefinedPalettes.some((p) => p.colors.length === 16);
      expect(has16Colors).toBe(true);
    });

    it("should have largest palette with more than 16 colors", () => {
      const maxSize = Math.max(...predefinedPalettes.map((p) => p.colors.length));
      expect(maxSize).toBeGreaterThan(16);
    });
  });

  describe("Palette Color Range", () => {
    it("should have at least one palette with pure black", () => {
      const hasPureBlack = predefinedPalettes.some((palette) =>
        palette.colors.some((c) => c[0] === 0 && c[1] === 0 && c[2] === 0)
      );
      expect(hasPureBlack).toBe(true);
    });

    it("should have at least one palette with pure white", () => {
      const hasPureWhite = predefinedPalettes.some((palette) =>
        palette.colors.some((c) => c[0] === 255 && c[1] === 255 && c[2] === 255)
      );
      expect(hasPureWhite).toBe(true);
    });

    it("should have palettes with varied color ranges", () => {
      // Check that we have both dark and light colors across all palettes
      const allColors = predefinedPalettes.flatMap((p) => p.colors);
      const darkColors = allColors.filter((c) => {
        const brightness = (c[0] + c[1] + c[2]) / 3;
        return brightness < 85;
      });
      const lightColors = allColors.filter((c) => {
        const brightness = (c[0] + c[1] + c[2]) / 3;
        return brightness > 170;
      });

      expect(darkColors.length).toBeGreaterThan(10);
      expect(lightColors.length).toBeGreaterThan(10);
    });
  });

  describe("Grayscale Palettes", () => {
    it("should have gray8 with evenly distributed shades", () => {
      const gray8 = findPalette("gray8");
      expect(gray8).not.toBeNull();

      const values = gray8?.colors.map((c) => c[0]) || [];
      expect(values[0]).toBe(0); // Black
      expect(values[7]).toBe(255); // White

      // Check even distribution (allowing for rounding)
      for (let i = 0; i < values.length; i++) {
        const expected = Math.round((i / 7) * 255);
        expect(values[i]).toBe(expected);
      }
    });

    it("should have monotonically increasing brightness in gray8", () => {
      const gray8 = findPalette("gray8");
      const values = gray8?.colors.map((c) => c[0]) || [];

      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe("Performance", () => {
    it("should quickly find palette by ID", () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        findPalette("pico8");
      }
      const elapsed = performance.now() - start;

      // 1000 lookups should complete in under 10ms
      expect(elapsed).toBeLessThan(10);
    });

    it("should quickly handle non-existent palette lookups", () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        findPalette("non-existent");
      }
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(10);
    });
  });
});




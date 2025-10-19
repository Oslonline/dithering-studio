import { describe, it, expect, vi } from "vitest";
import { canvasToSVG, type CanvasToSVGOptions } from "../../utils/export";

describe("Export Utility", () => {
  // Helper to create a test canvas with solid color
  function createSolidCanvas(
    width: number,
    height: number,
    r: number,
    g: number,
    b: number,
    a: number = 255
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    
    // Create imageData with desired color
    const imageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    };

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = a;
    }

    // Mock getImageData to return our imageData
    const ctx = {
      getImageData: vi.fn(() => imageData),
    };
    
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
    return canvas;
  }

  // Helper to create a gradient canvas
  function createGradientCanvas(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    
    const imageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gray = Math.floor((x / width) * 255);
        imageData.data[i] = gray;
        imageData.data[i + 1] = gray;
        imageData.data[i + 2] = gray;
        imageData.data[i + 3] = 255;
      }
    }

    const ctx = {
      getImageData: vi.fn(() => imageData),
    };
    
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
    return canvas;
  }

  // Helper to create a checkerboard pattern
  function createCheckerboardCanvas(
    width: number,
    height: number,
    cellSize: number = 1
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    
    const imageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height,
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const isBlack =
          (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0;
        const value = isBlack ? 0 : 255;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255;
      }
    }

    const ctx = {
      getImageData: vi.fn(() => imageData),
    };
    
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
    return canvas;
  }

  describe("canvasToSVG", () => {
    describe("Basic Functionality", () => {
      it("should export a solid color canvas", () => {
        const canvas = createSolidCanvas(2, 2, 255, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('width="2"');
        expect(result.svg).toContain('height="2"');
        expect(result.svg).toContain('fill="#ff0000"');
        expect(result.elements).toBeGreaterThan(0);
      });

      it("should include XML declaration", () => {
        const canvas = createSolidCanvas(1, 1, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toMatch(/^<\?xml version="1\.0"/);
      });

      it("should include SVG namespace", () => {
        const canvas = createSolidCanvas(1, 1, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      });

      it("should include shape-rendering for crisp edges", () => {
        const canvas = createSolidCanvas(1, 1, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('shape-rendering="crispEdges"');
      });

      it("should set correct viewBox", () => {
        const canvas = createSolidCanvas(10, 20, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('viewBox="0 0 10 20"');
      });

      it("should throw error if canvas context not available", () => {
        const mockCanvas = {
          width: 10,
          height: 10,
          getContext: () => null,
        } as any;

        expect(() => canvasToSVG(mockCanvas)).toThrow(
          "Canvas context not available"
        );
      });
    });

    describe("Run-Length Encoding (mergeRuns=true)", () => {
      it("should merge horizontal runs by default", () => {
        const canvas = createSolidCanvas(10, 1, 255, 0, 0);
        const result = canvasToSVG(canvas);

        // Should be 1 rect with width=10, not 10 rects with width=1
        expect(result.elements).toBe(1);
        expect(result.svg).toContain('width="10"');
      });

      it("should merge runs on each row independently", () => {
        const canvas = createSolidCanvas(10, 3, 0, 0, 255);
        const result = canvasToSVG(canvas);

        // 3 rows, each merged into 1 rect
        expect(result.elements).toBe(3);
      });

      it("should create separate rects for different colors", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 1;
        
        const imageData = {
          data: new Uint8ClampedArray(16), // 4 pixels × 4 channels
          width: 4,
          height: 1,
        };

        // Pattern: Red, Red, Blue, Blue
        imageData.data[0] = 255; // R
        imageData.data[1] = 0;
        imageData.data[2] = 0;
        imageData.data[3] = 255;

        imageData.data[4] = 255; // R
        imageData.data[5] = 0;
        imageData.data[6] = 0;
        imageData.data[7] = 255;

        imageData.data[8] = 0; // B
        imageData.data[9] = 0;
        imageData.data[10] = 255;
        imageData.data[11] = 255;

        imageData.data[12] = 0; // B
        imageData.data[13] = 0;
        imageData.data[14] = 255;
        imageData.data[15] = 255;

        const ctx = {
          getImageData: vi.fn(() => imageData),
        };
        
        vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
        const result = canvasToSVG(canvas);

        // 2 runs: red (width=2) and blue (width=2)
        expect(result.elements).toBe(2);
        expect(result.svg).toContain('#ff0000');
        expect(result.svg).toContain('#0000ff');
      });

      it("should handle transparent pixels by skipping them", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 5;
        canvas.height = 1;
        
        const imageData = {
          data: new Uint8ClampedArray(20), // 5 pixels × 4 channels
          width: 5,
          height: 1,
        };

        // Pattern: Red, Red, Transparent, Blue, Blue
        for (let i = 0; i < 2; i++) {
          imageData.data[i * 4] = 255;
          imageData.data[i * 4 + 1] = 0;
          imageData.data[i * 4 + 2] = 0;
          imageData.data[i * 4 + 3] = 255;
        }

        // Transparent pixel at index 2 (already 0 alpha by default)

        for (let i = 3; i < 5; i++) {
          imageData.data[i * 4] = 0;
          imageData.data[i * 4 + 1] = 0;
          imageData.data[i * 4 + 2] = 255;
          imageData.data[i * 4 + 3] = 255;
        }

        const ctx = {
          getImageData: vi.fn(() => imageData),
        };
        
        vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
        const result = canvasToSVG(canvas);

        // 2 runs: red (width=2) and blue (width=2), transparent skipped
        expect(result.elements).toBe(2);
      });

      it("should optimize single-color images to minimal rects", () => {
        const canvas = createSolidCanvas(100, 100, 128, 128, 128);
        const result = canvasToSVG(canvas);

        // 100 rows, each merged into 1 rect = 100 elements
        expect(result.elements).toBe(100);
      });
    });

    describe("No Run-Length Encoding (mergeRuns=false)", () => {
      it("should create one rect per pixel when mergeRuns=false", () => {
        const canvas = createSolidCanvas(3, 2, 255, 0, 0);
        const result = canvasToSVG(canvas, { mergeRuns: false });

        // 3×2 = 6 pixels = 6 rects
        expect(result.elements).toBe(6);
      });

      it("should create rects with width=1 height=1", () => {
        const canvas = createSolidCanvas(2, 2, 0, 255, 0);
        const result = canvasToSVG(canvas, { mergeRuns: false });

        expect(result.svg).toContain('width="1"');
        expect(result.svg).toContain('height="1"');
      });

      it("should skip transparent pixels when mergeRuns=false", () => {
        const canvas = createSolidCanvas(3, 2, 0, 0, 0, 0); // All transparent
        const result = canvasToSVG(canvas, { mergeRuns: false });

        expect(result.elements).toBe(0);
        expect(result.svg).not.toContain("<rect");
      });

      it("should be less efficient than mergeRuns=true for solid colors", () => {
        const canvas = createSolidCanvas(10, 10, 255, 255, 255);

        const withMerge = canvasToSVG(canvas, { mergeRuns: true });
        const withoutMerge = canvasToSVG(canvas, { mergeRuns: false });

        expect(withMerge.elements).toBe(10); // 10 rows merged
        expect(withoutMerge.elements).toBe(100); // 100 individual pixels
      });
    });

    describe("Color Conversion", () => {
      it("should convert black to #000000", () => {
        const canvas = createSolidCanvas(1, 1, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#000000');
      });

      it("should convert white to #ffffff", () => {
        const canvas = createSolidCanvas(1, 1, 255, 255, 255);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#ffffff');
      });

      it("should convert red to #ff0000", () => {
        const canvas = createSolidCanvas(1, 1, 255, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#ff0000');
      });

      it("should convert green to #00ff00", () => {
        const canvas = createSolidCanvas(1, 1, 0, 255, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#00ff00');
      });

      it("should convert blue to #0000ff", () => {
        const canvas = createSolidCanvas(1, 1, 0, 0, 255);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#0000ff');
      });

      it("should handle low values with zero-padding", () => {
        const canvas = createSolidCanvas(1, 1, 1, 2, 3);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#010203');
      });

      it("should handle mid-range values correctly", () => {
        const canvas = createSolidCanvas(1, 1, 128, 64, 192);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('#8040c0');
      });
    });

    describe("Warning for Large SVGs", () => {
      it("should warn when element count exceeds maxElementsWarn", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        
        const canvas = createCheckerboardCanvas(100, 100, 1);
        canvasToSVG(canvas, { maxElementsWarn: 100 });

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("SVG export contains")
        );

        consoleSpy.mockRestore();
      });

      it("should not warn when element count is below threshold", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        
        const canvas = createSolidCanvas(10, 10, 0, 0, 0);
        canvasToSVG(canvas, { maxElementsWarn: 200000 });

        expect(consoleSpy).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it("should use default maxElementsWarn of 200000", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        
        // Create large checkerboard that will exceed 200k elements
        const canvas = createCheckerboardCanvas(500, 500, 1);
        canvasToSVG(canvas); // No options, uses default

        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it("should allow custom maxElementsWarn threshold", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        
        // Create 50×1 canvas which will have 50 elements when not merged
        // But with merging it becomes 1 element, so let's use 50 rows instead
        const canvas = createSolidCanvas(1, 50, 0, 0, 0);
        canvasToSVG(canvas, { maxElementsWarn: 10 });

        // 50 rows × 1 merged rect each = 50 elements, exceeds 10 threshold
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("elements")
        );

        consoleSpy.mockRestore();
      });
    });

    describe("Element Count Accuracy", () => {
      it("should accurately count elements in solid canvas", () => {
        const canvas = createSolidCanvas(10, 5, 255, 255, 255);
        const result = canvasToSVG(canvas);

        expect(result.elements).toBe(5); // 5 rows, each 1 merged rect
      });

      it("should accurately count elements in checkerboard", () => {
        const canvas = createCheckerboardCanvas(4, 4, 2);
        const result = canvasToSVG(canvas);

        // 4 rows, each with 2 color changes
        expect(result.elements).toBeGreaterThan(4);
      });

      it("should count zero elements for empty canvas", () => {
        const canvas = createSolidCanvas(10, 10, 0, 0, 0, 0); // Transparent
        const result = canvasToSVG(canvas);

        expect(result.elements).toBe(0);
      });

      it("should match rect count in SVG output", () => {
        const canvas = createGradientCanvas(20, 1);
        const result = canvasToSVG(canvas);

        const rectCount = (result.svg.match(/<rect/g) || []).length;
        expect(rectCount).toBe(result.elements);
      });
    });

    describe("Options Handling", () => {
      it("should accept empty options object", () => {
        const canvas = createSolidCanvas(2, 2, 0, 0, 0);
        const result = canvasToSVG(canvas, {});

        expect(result.svg).toBeTruthy();
        expect(result.elements).toBeGreaterThan(0);
      });

      it("should accept no options parameter", () => {
        const canvas = createSolidCanvas(2, 2, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toBeTruthy();
        expect(result.elements).toBeGreaterThan(0);
      });

      it("should respect both options together", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        
        const canvas = createSolidCanvas(10, 10, 255, 0, 0);
        const result = canvasToSVG(canvas, {
          mergeRuns: false,
          maxElementsWarn: 50,
        });

        expect(result.elements).toBe(100); // No merging
        expect(consoleSpy).toHaveBeenCalled(); // Exceeded 50 threshold

        consoleSpy.mockRestore();
      });
    });

    describe("Edge Cases", () => {
      it("should handle 1×1 canvas", () => {
        const canvas = createSolidCanvas(1, 1, 128, 128, 128);
        const result = canvasToSVG(canvas);

        expect(result.elements).toBe(1);
        expect(result.svg).toContain('x="0"');
        expect(result.svg).toContain('y="0"');
      });

      it("should handle very wide canvas", () => {
        const canvas = createSolidCanvas(1000, 1, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('width="1000"');
        expect(result.elements).toBe(1); // Merged into 1 rect
      });

      it("should handle very tall canvas", () => {
        const canvas = createSolidCanvas(1, 1000, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain('height="1000"');
        expect(result.elements).toBe(1000); // 1 rect per row
      });

      it("should handle all transparent canvas", () => {
        const canvas = createSolidCanvas(10, 10, 0, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.elements).toBe(0);
        expect(result.svg).not.toContain("<rect");
      });

      it("should handle partially transparent row", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 5;
        canvas.height = 1;
        
        const imageData = {
          data: new Uint8ClampedArray(20), // 5 pixels × 4 channels
          width: 5,
          height: 1,
        };

        // Opaque, Transparent, Opaque, Transparent, Opaque
        for (let i = 0; i < 5; i++) {
          const opaque = i % 2 === 0;
          imageData.data[i * 4] = 255;
          imageData.data[i * 4 + 1] = 255;
          imageData.data[i * 4 + 2] = 255;
          imageData.data[i * 4 + 3] = opaque ? 255 : 0;
        }

        const ctx = {
          getImageData: vi.fn(() => imageData),
        };
        
        vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
        const result = canvasToSVG(canvas);

        // 3 separate white pixels (not merged due to transparent gaps)
        expect(result.elements).toBe(3);
      });
    });

    describe("SVG Structure", () => {
      it("should have well-formed XML structure", () => {
        const canvas = createSolidCanvas(2, 2, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain("<?xml");
        expect(result.svg).toContain("<svg");
        expect(result.svg).toContain("</svg>");
      });

      it("should have rect elements inside svg", () => {
        const canvas = createSolidCanvas(2, 2, 100, 100, 100);
        const result = canvasToSVG(canvas);

        const svgIndex = result.svg.indexOf("<svg");
        const rectIndex = result.svg.indexOf("<rect");
        const closeSvgIndex = result.svg.indexOf("</svg>");

        expect(rectIndex).toBeGreaterThan(svgIndex);
        expect(closeSvgIndex).toBeGreaterThan(rectIndex);
      });

      it("should use self-closing rect tags", () => {
        const canvas = createSolidCanvas(2, 2, 0, 0, 0);
        const result = canvasToSVG(canvas);

        expect(result.svg).toContain("<rect");
        expect(result.svg).toContain(" />");
        expect(result.svg).not.toContain("</rect>");
      });
    });

    describe("Performance", () => {
      it("should export small canvas quickly", () => {
        const canvas = createSolidCanvas(10, 10, 255, 255, 255);
        const start = performance.now();
        canvasToSVG(canvas);
        const elapsed = performance.now() - start;

        expect(elapsed).toBeLessThan(50); // Should be nearly instant
      });

      it("should handle medium canvas in reasonable time", () => {
        const canvas = createGradientCanvas(100, 100);
        const start = performance.now();
        canvasToSVG(canvas);
        const elapsed = performance.now() - start;

        expect(elapsed).toBeLessThan(500); // Should complete in <0.5s
      });

      it("should benefit from run-length encoding for solid colors", () => {
        const canvas = createSolidCanvas(200, 200, 128, 128, 128);

        const startMerge = performance.now();
        const withMerge = canvasToSVG(canvas, { mergeRuns: true });
        const elapsedMerge = performance.now() - startMerge;

        const startNoMerge = performance.now();
        const withoutMerge = canvasToSVG(canvas, { mergeRuns: false });
        const elapsedNoMerge = performance.now() - startNoMerge;

        // Merged should have fewer elements
        expect(withMerge.elements).toBeLessThan(withoutMerge.elements);
        
        // Both should complete reasonably fast
        expect(elapsedMerge).toBeLessThan(1000);
        expect(elapsedNoMerge).toBeLessThan(1000);
      });
    });
  });
});




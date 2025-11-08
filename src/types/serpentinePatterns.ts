export type SerpentinePattern = 'standard' | 'zigzag' | 'spiral' | 'hilbert' | 'vertical';

export interface ScanCoordinate {
  x: number;
  y: number;
}

export type ScanPathGenerator = (width: number, height: number) => ScanCoordinate[];

export const serpentinePatterns: Record<SerpentinePattern, { name: string; description: string; generator: ScanPathGenerator }> = {
  standard: {
    name: 'Standard',
    description: 'Left-to-right, alternating direction per row',
    generator: (width, height) => {
      const coords: ScanCoordinate[] = [];
      for (let y = 0; y < height; y++) {
        if (y % 2 === 0) {
          for (let x = 0; x < width; x++) coords.push({ x, y });
        } else {
          for (let x = width - 1; x >= 0; x--) coords.push({ x, y });
        }
      }
      return coords;
    }
  },
  zigzag: {
    name: 'Zig-Zag',
    description: 'Diagonal scan pattern',
    generator: (width, height) => {
      const coords: ScanCoordinate[] = [];
      for (let sum = 0; sum < width + height - 1; sum++) {
        if (sum % 2 === 0) {
          for (let y = Math.min(sum, height - 1); y >= Math.max(0, sum - width + 1); y--) {
            coords.push({ x: sum - y, y });
          }
        } else {
          for (let y = Math.max(0, sum - width + 1); y <= Math.min(sum, height - 1); y++) {
            coords.push({ x: sum - y, y });
          }
        }
      }
      return coords;
    }
  },
  spiral: {
    name: 'Spiral',
    description: 'Inward spiral from edges',
    generator: (width, height) => {
      const coords: ScanCoordinate[] = [];
      let top = 0, bottom = height - 1, left = 0, right = width - 1;
      while (top <= bottom && left <= right) {
        for (let x = left; x <= right; x++) coords.push({ x, y: top });
        top++;
        for (let y = top; y <= bottom; y++) coords.push({ x: right, y });
        right--;
        if (top <= bottom) {
          for (let x = right; x >= left; x--) coords.push({ x, y: bottom });
          bottom--;
        }
        if (left <= right) {
          for (let y = bottom; y >= top; y--) coords.push({ x: left, y });
          left++;
        }
      }
      return coords;
    }
  },
  hilbert: {
    name: 'Hilbert Curve',
    description: 'Space-filling Hilbert curve (power of 2 dimensions)',
    generator: (width, height) => {
      const n = Math.min(width, height);
      const order = Math.floor(Math.log2(n));
      const size = Math.pow(2, order);
      
      const hilbert = (x: number, y: number, ax: number, ay: number, bx: number, by: number): ScanCoordinate[] => {
        const w = Math.abs(ax + ay);
        const h = Math.abs(bx + by);
        
        if (w === 1 && h === 1) {
          return [{ x, y }];
        }
        
        const ax2 = Math.floor(ax / 2), ay2 = Math.floor(ay / 2);
        const bx2 = Math.floor(bx / 2), by2 = Math.floor(by / 2);
        
        return [
          ...hilbert(x, y, ay2, ax2, by2, bx2),
          ...hilbert(x + ax2, y + ay2, ax2, ay2, bx2, by2),
          ...hilbert(x + ax2 + bx2, y + ay2 + by2, ax2, ay2, bx2, by2),
          ...hilbert(x + ax2 + bx2 - ay2 - by2, y + ay2 + by2 + ax2 + bx2, -by2, -bx2, -ay2, -ax2)
        ];
      };
      
      const coords = hilbert(0, 0, size, 0, 0, size);
      return coords.filter(c => c.x < width && c.y < height);
    }
  },
  vertical: {
    name: 'Vertical',
    description: 'Top-to-bottom, alternating direction per column',
    generator: (width, height) => {
      const coords: ScanCoordinate[] = [];
      for (let x = 0; x < width; x++) {
        if (x % 2 === 0) {
          for (let y = 0; y < height; y++) coords.push({ x, y });
        } else {
          for (let y = height - 1; y >= 0; y--) coords.push({ x, y });
        }
      }
      return coords;
    }
  }
};

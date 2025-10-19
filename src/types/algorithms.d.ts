/**
 * Dithering Algorithm Type Definitions
 * 
 * Core types for the dithering algorithm system
 */

/**
 * Context provided to algorithm run functions
 */
export interface AlgorithmRunContext {
  /** Source image data as Uint8ClampedArray */
  srcData: Uint8ClampedArray;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Algorithm parameters */
  params: AlgorithmParams;
}

/**
 * Parameters for algorithm execution
 */
export interface AlgorithmParams {
  /** Algorithm pattern ID */
  pattern: number;
  /** Threshold value for binary dithering (0-255) */
  threshold: number;
  /** Whether to invert the output */
  invert: boolean;
  /** Use serpentine scanning (alternating left-right) */
  serpentine: boolean;
  /** Whether this is an error diffusion algorithm */
  isErrorDiffusion: boolean;
  /** Optional color palette for quantization */
  palette?: [number, number, number][];
  /** Optional ASCII ramp for ASCII art dithering */
  asciiRamp?: string;
}

/**
 * Algorithm implementation
 */
export interface Algorithm {
  /** Unique algorithm ID */
  id: number;
  /** Display name */
  name: string;
  /** Algorithm category */
  category: AlgorithmCategory;
  /** Description of the algorithm */
  description?: string;
  /** Run function that processes the image */
  run: (context: AlgorithmRunContext) => Uint8ClampedArray | ImageData;
}

/**
 * Algorithm categories
 */
export type AlgorithmCategory =
  | 'Error Diffusion'
  | 'Ordered Dithering'
  | 'Blue Noise'
  | 'Pattern Dithering'
  | 'Artistic'
  | 'Threshold';

/**
 * Detailed algorithm information
 */
export interface AlgorithmDetail {
  /** Algorithm ID */
  id: number;
  /** Algorithm name */
  name: string;
  /** Category classification */
  category: string;
  /** Overview description */
  overview: string;
  /** Error diffusion kernel (if applicable) */
  kernel?: number[][];
  /** Kernel divisor for normalization */
  kernelDivisor?: number;
  /** Ordered dither matrix size */
  orderedMatrixSize?: string;
  /** Algorithm characteristics */
  characteristics: string[];
  /** Known artifacts */
  artifacts: string[];
  /** Best use cases */
  bestFor: string[];
  /** Computational complexity (e.g., "O(N)") */
  complexity: string;
  /** Reference citation */
  reference?: string;
  /** Academic papers */
  papers?: AlgorithmPaper[];
  /** Year of development */
  year?: number;
  /** Origin/creator */
  origin?: string;
  /** Whether algorithm conserves error */
  errorConserving?: boolean;
  /** Whether algorithm is deterministic */
  deterministic?: boolean;
  /** Error diffusion neighborhood description */
  neighborhood?: string;
  /** Tonal bias characteristic */
  tonalBias?: string;
  /** Noise profile description */
  noiseProfile?: string;
  /** Memory footprint description */
  memoryFootprint?: string;
  /** Recommended palette IDs */
  recommendedPalettes?: string[];
  /** Implementation notes */
  implementationNotes?: string[];
  /** Additional references */
  references?: string[];
  /** General notes */
  notes?: string[];
}

/**
 * Academic paper reference
 */
export interface AlgorithmPaper {
  /** Paper title */
  title: string;
  /** URL to paper */
  url: string;
  /** Optional note about the paper */
  note?: string;
}

/**
 * Color palette definition
 */
export interface Palette {
  /** Palette ID */
  id: string;
  /** Display name */
  name: string;
  /** Array of RGB colors */
  colors: [number, number, number][];
  /** Optional description */
  description?: string;
  /** Optional category */
  category?: string;
}

/**
 * Preset configuration
 */
export interface Preset {
  /** Preset ID */
  id: string;
  /** Display name */
  name: string;
  /** Category */
  category: string;
  /** Algorithm ID */
  algorithmId: number;
  /** Palette ID (optional) */
  paletteId?: string;
  /** Threshold value */
  threshold?: number;
  /** Serpentine mode */
  serpentine?: boolean;
  /** Invert mode */
  invert?: boolean;
  /** Working resolution */
  resolution?: number;
  /** Tone curve adjustments */
  toneCurve?: {
    contrast?: number;
    midtones?: number;
    highlights?: number;
  };
  /** Optional description */
  description?: string;
  /** Optional tags */
  tags?: string[];
}

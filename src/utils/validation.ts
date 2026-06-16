/**
 * Input Validation Utilities
 * Validates user inputs for images, videos, and settings
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export interface ImageValidationOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
}

export interface VideoValidationOptions {
  maxDuration?: number; // in seconds
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
}

const VIDEO_EXTENSIONS = /\.(mp4|m4v|webm|mov)$/i;

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return VIDEO_EXTENSIONS.test(file.name);
}

export function resolveVideoMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "mp4" || ext === "m4v") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return file.type;
}

/**
 * Validate image file and dimensions
 */
export async function validateImage(
  file: File,
  options: ImageValidationOptions = {}
): Promise<ValidationResult> {
  const {
    maxWidth = 16384,
    maxHeight = 16384,
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
  } = options;

  // Check file type
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported image format: ${file.type}. Supported formats: JPEG, PNG, WebP, GIF, BMP`
    };
  }

  // Check file size
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `Image file too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`
    };
  }

  // Load image to check dimensions
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      return {
        valid: false,
        error: `Image dimensions too large: ${dimensions.width}×${dimensions.height}. Maximum allowed: ${maxWidth}×${maxHeight}`
      };
    }

    // Warning for very large images
    if (dimensions.width * dimensions.height > 16 * 1024 * 1024) {
      return {
        valid: true,
        warning: `Large image detected (${dimensions.width}×${dimensions.height}). Processing may take longer.`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}. The file may be corrupted.`
    };
  }
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate video file
 */
export async function validateVideo(
  file: File,
  options: VideoValidationOptions = {}
): Promise<ValidationResult> {
  const {
    maxDuration = 5 * 60, // 5 minutes
    maxFileSize = 100 * 1024 * 1024, // 100MB default
    allowedFormats = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
  } = options;

  const mimeType = resolveVideoMimeType(file);

  if (!isVideoFile(file)) {
    return {
      valid: false,
      error: `Unsupported video format${file.type ? `: ${file.type}` : ""}. Supported formats: MP4, WebM, MOV`,
    };
  }

  if (mimeType && !allowedFormats.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported video format: ${mimeType}. Supported formats: MP4, WebM, MOV`,
    };
  }

  // Check file size
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `Video file too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`
    };
  }

  // Try to load video to check compatibility
  try {
    const metadata = await getVideoMetadata(file);
    
    if (metadata.duration > maxDuration) {
      return {
        valid: false,
        error: `Video too long: ${Math.floor(metadata.duration)}s. Maximum allowed: ${maxDuration}s`
      };
    }

    // Warning for long videos
    if (metadata.duration > 60) {
      return {
        valid: true,
        warning: `Long video detected (${Math.floor(metadata.duration)}s). Processing may take several minutes.`
      };
    }

    return { valid: true };
  } catch {
    // Metadata can fail for some codecs even when playback works in a <video> element.
    return {
      valid: true,
      warning: "Could not read video metadata. If playback fails, try re-encoding as H.264 MP4.",
    };
  }
}

/**
 * Get video metadata
 */
function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out reading video metadata"));
    }, 15000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      cleanup();
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video metadata"));
    };

    video.src = url;
    video.load();
  });
}

/**
 * Validate resolution value
 */
export function validateResolution(value: number): ValidationResult {
  if (!Number.isFinite(value) || value < 16) {
    return {
      valid: false,
      error: 'Resolution must be at least 16 pixels'
    };
  }

  if (value > 8192) {
    return {
      valid: false,
      error: 'Resolution cannot exceed 8192 pixels'
    };
  }

  return { valid: true };
}

/**
 * Validate threshold value
 */
export function validateThreshold(value: number): ValidationResult {
  if (!Number.isFinite(value) || value < 0 || value > 255) {
    return {
      valid: false,
      error: 'Threshold must be between 0 and 255'
    };
  }

  return { valid: true };
}

/**
 * Validate palette colors
 */
export function validatePalette(colors: [number, number, number][]): ValidationResult {
  if (!Array.isArray(colors) || colors.length < 2) {
    return {
      valid: false,
      error: 'Palette must contain at least 2 colors'
    };
  }

  if (colors.length > 256) {
    return {
      valid: false,
      error: 'Palette cannot exceed 256 colors'
    };
  }

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    if (!Array.isArray(color) || color.length !== 3) {
      return {
        valid: false,
        error: `Invalid color at index ${i}: must be [r, g, b] array`
      };
    }

    const [r, g, b] = color;
    if (!Number.isInteger(r) || !Number.isInteger(g) || !Number.isInteger(b) ||
        r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return {
        valid: false,
        error: `Invalid color at index ${i}: RGB values must be integers between 0-255`
      };
    }
  }

  return { valid: true };
}

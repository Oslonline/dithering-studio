/**
 * Feature Detection Utilities
 * Detects browser capabilities and provides fallback information
 */

export interface FeatureSupport {
  supported: boolean;
  fallback?: string;
  reason?: string;
}

/**
 * Detect if Web Workers are supported
 */
export function detectWorkerSupport(): FeatureSupport {
  if (typeof Worker === 'undefined') {
    return {
      supported: false,
      fallback: 'Main thread processing will be used',
      reason: 'Web Workers not supported in this browser'
    };
  }

  return { supported: true };
}

/**
 * Detect if OffscreenCanvas is supported
 */
export function detectOffscreenCanvasSupport(): FeatureSupport {
  try {
    if (typeof OffscreenCanvas === 'undefined') {
      return {
        supported: false,
        fallback: 'Regular canvas will be used',
        reason: 'OffscreenCanvas not supported'
      };
    }

    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        supported: false,
        fallback: 'Regular canvas will be used',
        reason: 'OffscreenCanvas context creation failed'
      };
    }

    return { supported: true };
  } catch (error) {
    return {
      supported: false,
      fallback: 'Regular canvas will be used',
      reason: 'OffscreenCanvas not available'
    };
  }
}

/**
 * Detect if video processing is supported
 */
export function detectVideoSupport(): FeatureSupport {
  const video = document.createElement('video');
  
  if (!video.canPlayType) {
    return {
      supported: false,
      fallback: 'Only image processing is available',
      reason: 'Video playback not supported'
    };
  }

  const mp4Support = video.canPlayType('video/mp4; codecs="avc1.42E01E"');
  const webmSupport = video.canPlayType('video/webm; codecs="vp8, vorbis"');
  
  if (!mp4Support && !webmSupport) {
    return {
      supported: false,
      fallback: 'Only image processing is available',
      reason: 'No supported video codecs found'
    };
  }

  return { supported: true };
}

/**
 * Detect if file upload is supported
 */
export function detectFileUploadSupport(): FeatureSupport {
  const input = document.createElement('input');
  input.type = 'file';
  
  if (!('files' in input)) {
    return {
      supported: false,
      fallback: 'Use image URL input instead',
      reason: 'File upload not supported'
    };
  }

  return { supported: true };
}

/**
 * Detect if clipboard API is supported
 */
export function detectClipboardSupport(): FeatureSupport {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    return {
      supported: false,
      fallback: 'Manual copy required',
      reason: 'Clipboard API not available'
    };
  }

  return { supported: true };
}

/**
 * Detect if download is supported
 */
export function detectDownloadSupport(): FeatureSupport {
  const a = document.createElement('a');
  
  if (!('download' in a)) {
    return {
      supported: false,
      fallback: 'Right-click and "Save as" instead',
      reason: 'Download attribute not supported'
    };
  }

  return { supported: true };
}

/**
 * Detect if localStorage is available
 */
export function detectLocalStorageSupport(): FeatureSupport {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return { supported: true };
  } catch (error) {
    return {
      supported: false,
      fallback: 'Settings will not persist between sessions',
      reason: 'localStorage not available (possibly private mode)'
    };
  }
}

/**
 * Detect if WebGL is supported
 */
export function detectWebGLSupport(): FeatureSupport {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        supported: false,
        fallback: 'WebGL features unavailable',
        reason: 'WebGL not supported'
      };
    }

    return { supported: true };
  } catch (error) {
    return {
      supported: false,
      fallback: 'WebGL features unavailable',
      reason: 'WebGL initialization failed'
    };
  }
}

/**
 * Detect all features and return a summary
 */
export interface FeatureDetectionSummary {
  workers: FeatureSupport;
  offscreenCanvas: FeatureSupport;
  video: FeatureSupport;
  fileUpload: FeatureSupport;
  clipboard: FeatureSupport;
  download: FeatureSupport;
  localStorage: FeatureSupport;
  webgl: FeatureSupport;
}

export function detectAllFeatures(): FeatureDetectionSummary {
  return {
    workers: detectWorkerSupport(),
    offscreenCanvas: detectOffscreenCanvasSupport(),
    video: detectVideoSupport(),
    fileUpload: detectFileUploadSupport(),
    clipboard: detectClipboardSupport(),
    download: detectDownloadSupport(),
    localStorage: detectLocalStorageSupport(),
    webgl: detectWebGLSupport()
  };
}

/**
 * Get unsupported features with fallback messages
 */
export function getUnsupportedFeatures(): Array<{ feature: string; message: string }> {
  const features = detectAllFeatures();
  const unsupported: Array<{ feature: string; message: string }> = [];

  Object.entries(features).forEach(([name, support]) => {
    if (!support.supported && support.fallback) {
      unsupported.push({
        feature: name,
        message: `${support.reason}. ${support.fallback}`
      });
    }
  });

  return unsupported;
}

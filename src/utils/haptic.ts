/**
 * Haptic feedback utility for mobile interactions
 * 
 * Uses the Vibration API when available
 * Falls back gracefully on unsupported devices
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback
 * @param style - The haptic feedback style
 * @returns true if haptic was triggered, false if unsupported
 */
export const triggerHaptic = (style: HapticStyle = 'light'): boolean => {
  if (!isHapticSupported()) {
    return false;
  }

  try {
    const pattern = hapticPatterns[style];
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
    return false;
  }
};

/**
 * Cancel ongoing vibration
 */
export const cancelHaptic = (): void => {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
};

/**
 * React hook for haptic feedback
 */
export const useHaptic = () => {
  const supported = isHapticSupported();

  return {
    supported,
    trigger: triggerHaptic,
    cancel: cancelHaptic,
    // Convenience methods
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
  };
};

/**
 * Add haptic feedback to onClick handler
 */
export const withHapticClick = (
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void,
  style: HapticStyle = 'light'
) => {
  return (event: React.MouseEvent | React.TouchEvent) => {
    triggerHaptic(style);
    onClick?.(event);
  };
};

export default {
  isSupported: isHapticSupported,
  trigger: triggerHaptic,
  cancel: cancelHaptic,
  useHaptic,
  withHapticClick,
};

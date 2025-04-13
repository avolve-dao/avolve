// Haptic feedback utility for mobile devices

// Check if the device supports vibration
const hasVibration = typeof navigator !== "undefined" && "vibrate" in navigator

// Different haptic patterns for different interactions
export const hapticPatterns = {
  // Light feedback for regular interactions
  light: hasVibration ? () => navigator.vibrate(10) : () => {},

  // Medium feedback for confirmations
  medium: hasVibration ? () => navigator.vibrate(25) : () => {},

  // Strong feedback for important actions
  strong: hasVibration ? () => navigator.vibrate(40) : () => {},

  // Success pattern
  success: hasVibration ? () => navigator.vibrate([15, 30, 40]) : () => {},

  // Error pattern
  error: hasVibration ? () => navigator.vibrate([40, 30, 40]) : () => {},

  // Warning pattern
  warning: hasVibration ? () => navigator.vibrate([30, 20, 30]) : () => {},

  // Custom pattern
  custom: hasVibration ? (pattern: number[]) => navigator.vibrate(pattern) : () => {},
}

// Haptic feedback hook
export function useHaptics() {
  // Check if the device prefers reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

  // Only provide haptic feedback if the device supports it and the user hasn't requested reduced motion
  const isEnabled = hasVibration && !prefersReducedMotion

  return {
    isEnabled,
    ...hapticPatterns,
    // Conditionally trigger haptic feedback
    trigger: (pattern: keyof typeof hapticPatterns = "light") => {
      if (isEnabled && pattern in hapticPatterns) {
        hapticPatterns[pattern]()
      }
    },
  }
}


/**
 * Spacing System for Mission Control iOS
 * 8px base unit (iOS standard)
 */

export const Spacing = {
  // Base unit
  unit: 8,

  // Padding/Margin Scale
  xs: 4,    // 0.5 unit
  sm: 8,    // 1 unit
  md: 12,   // 1.5 units
  lg: 16,   // 2 units
  xl: 20,   // 2.5 units
  xxl: 24,  // 3 units
  xxxl: 32, // 4 units

  // Screen Padding
  screenPadding: 16,
  screenPaddingLarge: 20,

  // Common Gaps
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },

  // Touch Target Minimum (44px as per iOS HIG)
  touchTarget: 44,
} as const;

export default Spacing;

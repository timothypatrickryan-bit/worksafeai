/**
 * Glassmorphic Color Palette for Mission Control iOS
 * Dark theme with frosted glass (glassmorphism) styling
 */

export const Colors = {
  // Primary Brand
  primary: '#0066ff',
  primaryLight: '#e8e8ff',
  primaryDark: '#0052cc',

  // Status Colors
  success: '#34c759',
  warning: '#ff9500',
  danger: '#ff3b30',
  info: '#0066ff',

  // Dark Theme Background (Glassmorphic)
  background: '#0a0e27', // Deep navy
  surface: 'rgba(255, 255, 255, 0.08)', // Glass surface
  surfaceLight: 'rgba(255, 255, 255, 0.12)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.16)',
  
  // Status-specific backgrounds
  successBg: 'rgba(52, 199, 89, 0.1)',
  warningBg: 'rgba(255, 149, 0, 0.1)',
  dangerBg: 'rgba(255, 59, 48, 0.1)',
  infoBg: 'rgba(0, 102, 255, 0.1)',

  // Text
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textInverse: '#0a0e27',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',

  // Shadows & Overlays
  shadowSmall: 'rgba(0, 0, 0, 0.2)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowLarge: 'rgba(0, 0, 0, 0.6)',

  // Gradients (for glass effect)
  gradientStart: 'rgba(255, 255, 255, 0.15)',
  gradientEnd: 'rgba(255, 255, 255, 0.05)',
} as const;

export default Colors;

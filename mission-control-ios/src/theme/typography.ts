/**
 * Typography System for Mission Control iOS
 */

import { Platform } from 'react-native';

export const Typography = {
  // Heading Styles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },

  // Body Styles
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodyXSmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },

  // Button/Label Styles
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelXSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },

  // Font Family
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

export default Typography;

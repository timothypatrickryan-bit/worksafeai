/**
 * useTheme Hook - Dark Mode + Glassmorphic Theme
 * Provides consistent theming across the app
 */

import { useColorScheme } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export const useTheme = () => {
  const colorScheme = useColorScheme();

  // For now, always use dark theme (glassmorphic)
  // In the future, can toggle based on system preference
  const isDark = true;

  return {
    isDark,
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
    colorScheme: 'dark',
  };
};

export default useTheme;

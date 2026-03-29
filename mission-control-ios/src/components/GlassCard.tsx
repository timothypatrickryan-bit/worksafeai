/**
 * GlassCard Component
 * Glassmorphic card with frosted glass effect
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { Colors, Spacing } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  scrollable = false,
  scrollViewProps,
  onPress,
}) => {
  const cardStyles = [styles.card, style];

  if (scrollable) {
    return (
      <ScrollView
        style={cardStyles}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
});

export default GlassCard;

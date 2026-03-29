/**
 * AgentStatusBadge Component
 * Shows agent status (idle, working, complete) with color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

interface AgentStatusBadgeProps {
  status: AgentStatus;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

const statusColors = {
  idle: { bg: 'rgba(153, 153, 153, 0.2)', text: '#999999', dot: '#999999' },
  working: { bg: 'rgba(255, 149, 0, 0.2)', text: '#FF9500', dot: '#FF9500' },
  complete: { bg: 'rgba(52, 199, 89, 0.2)', text: '#34C759', dot: '#34C759' },
  error: { bg: 'rgba(255, 59, 48, 0.2)', text: '#FF3B30', dot: '#FF3B30' },
};

const statusLabels = {
  idle: 'Idle',
  working: 'Working',
  complete: 'Complete',
  error: 'Error',
};

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({
  status = 'idle',
  label,
  size = 'medium',
}) => {
  const colors = statusColors[status];
  const displayLabel = label || statusLabels[status];

  const dotSize = size === 'small' ? 6 : size === 'large' ? 12 : 8;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingVertical: size === 'small' ? 4 : 6 }]}>
      <View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: colors.dot },
        ]}
      />
      <Text
        style={[
          styles.label,
          { color: colors.text, fontSize },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: Spacing.radius.full,
  },
  label: {
    fontWeight: '600',
    ...Typography.labelSmall,
  },
});

export default AgentStatusBadge;

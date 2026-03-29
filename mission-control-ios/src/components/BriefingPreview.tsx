/**
 * BriefingPreview Component
 * Shows a preview of a briefing with status and summary
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

type BriefingStatus = 'draft' | 'ready' | 'executing' | 'complete';

interface BriefingPreviewProps {
  id: string;
  title: string;
  status: BriefingStatus;
  agent: string;
  taskId?: string;
  content?: string;
  createdAt?: string;
  onPress?: () => void;
}

const statusConfig = {
  draft: {
    bg: 'rgba(153, 153, 153, 0.2)',
    text: '#999999',
    icon: '📝',
  },
  ready: {
    bg: 'rgba(0, 102, 255, 0.2)',
    text: Colors.primary,
    icon: '✓',
  },
  executing: {
    bg: 'rgba(255, 149, 0, 0.2)',
    text: Colors.warning,
    icon: '⚡',
  },
  complete: {
    bg: 'rgba(52, 199, 89, 0.2)',
    text: Colors.success,
    icon: '✓✓',
  },
};

export const BriefingPreview: React.FC<BriefingPreviewProps> = ({
  id,
  title,
  status,
  agent,
  taskId,
  content,
  createdAt,
  onPress,
}) => {
  const config = statusConfig[status];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.task}>{agent}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={styles.statusIcon}>{config.icon}</Text>
          <Text style={[styles.statusText, { color: config.text }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      {content && (
        <Text
          style={styles.preview}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {content}
        </Text>
      )}

      {createdAt && (
        <Text style={styles.meta}>
          Created {new Date(createdAt).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  titleArea: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.h5,
    color: Colors.text,
  },
  task: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.full,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    ...Typography.labelXSmall,
    fontWeight: '600',
  },
  preview: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});

export default BriefingPreview;

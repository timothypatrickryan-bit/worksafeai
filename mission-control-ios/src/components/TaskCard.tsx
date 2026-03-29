/**
 * TaskCard Component
 * Displays a task with status, progress, and quick actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import AgentStatusBadge from './AgentStatusBadge';
import ProgressIndicator from './ProgressIndicator';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'idle' | 'working' | 'complete' | 'scheduled';
  progress?: number;
  priority: 'high' | 'medium' | 'low';
  agentName?: string;
  onPress?: () => void;
  onApprove?: () => void;
  showActions?: boolean;
}

const priorityColors = {
  high: Colors.danger,
  medium: Colors.warning,
  low: Colors.textTertiary,
};

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  progress = 0,
  priority,
  agentName,
  onPress,
  onApprove,
  showActions = false,
}) => {
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
          <View style={[styles.priorityBadge, { borderColor: priorityColors[priority] }]}>
            <View
              style={[styles.priorityDot, { backgroundColor: priorityColors[priority] }]}
            />
            <Text style={[styles.priorityText, { color: priorityColors[priority] }]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </View>
        </View>
        <AgentStatusBadge status={status} size="small" />
      </View>

      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {agentName && (
        <Text style={styles.agent}>
          👤 {agentName}
        </Text>
      )}

      {status === 'working' && progress !== undefined && (
        <View style={styles.progressSection}>
          <ProgressIndicator
            progress={progress}
            type="linear"
            showLabel={false}
            showPercentage={true}
          />
        </View>
      )}

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={onApprove}
          >
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: Spacing.radius.full,
  },
  priorityText: {
    ...Typography.labelXSmall,
    fontSize: 11,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  agent: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  progressSection: {
    marginVertical: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: Colors.primary,
  },
  approveBtnText: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectBtnText: {
    ...Typography.label,
    color: Colors.danger,
    fontWeight: '600',
  },
});

export default TaskCard;
